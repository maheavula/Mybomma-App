import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { persistenceService } from '../services/persistenceService.js';
import { Watchlist } from '../types/schema.js';

const router = Router();

router.use(authMiddleware);

// GET /api/watchlist
router.get('/', (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const userWatchlist = persistenceService.getWatchlistForUser(user.id);
  const movies = persistenceService.getData().movies;

  const enrichedWatchlist = userWatchlist
    .map((item) => {
      const movie = movies.find((m) => m.id === item.movieId);
      return {
        ...item,
        movie: movie
          ? {
              id: movie.id,
              title: movie.title,
              posterUrl: movie.posterUrl,
              backdropUrl: movie.backdropUrl,
              duration: movie.duration,
              rating: movie.rating,
              imdbRating: movie.imdbRating,
              genres: movie.genres,
              releaseYear: movie.releaseYear,
              requiredTier: movie.requiredTier,
            }
          : null,
      };
    })
    .filter((item) => item.movie !== null);

  res.json({
    success: true,
    count: enrichedWatchlist.length,
    watchlist: enrichedWatchlist,
  });
});

// POST /api/watchlist/progress
// Body: { movieId, progressSeconds, durationSeconds }
// Note: Placed BEFORE /:movieId to prevent route shadowing
router.post('/progress', async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;
    const { movieId, progressSeconds, durationSeconds } = req.body;

    if (!movieId || typeof progressSeconds !== 'number') {
      res.status(400).json({ success: false, error: 'movieId and numeric progressSeconds are required' });
      return;
    }

    const movie = persistenceService.getMovieById(movieId);
    if (!movie) {
      res.status(404).json({ success: false, error: 'Movie not found' });
      return;
    }

    const completed = durationSeconds ? progressSeconds >= durationSeconds * 0.95 : false;

    await persistenceService.mutate((data) => {
      const existing = data.watchlists.find(
        (w) => w.userId === user.id && w.movieId === movieId
      );

      if (existing) {
        existing.progressSeconds = Math.max(0, Math.floor(progressSeconds));
        existing.completed = completed;
      } else {
        data.watchlists.push({
          userId: user.id,
          movieId,
          addedAt: new Date().toISOString(),
          progressSeconds: Math.max(0, Math.floor(progressSeconds)),
          completed,
        });
      }
    });

    res.json({
      success: true,
      message: 'Playback progress updated',
      progressSeconds,
      completed,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/watchlist/:movieId
// Scenario 8: Accepts optional notes parameter and persists alongside entry
router.post('/:movieId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;
    const { movieId } = req.params;
    const notes = (req.body && typeof req.body.notes === 'string') ? req.body.notes : '';

    const movie = persistenceService.getMovieById(movieId);
    if (!movie) {
      res.status(404).json({ success: false, error: 'Movie not found' });
      return;
    }

    await persistenceService.mutate((data) => {
      const existingIndex = data.watchlists.findIndex(
        (w) => w.userId === user.id && w.movieId === movieId
      );

      if (existingIndex === -1) {
        const item: Watchlist = {
          userId: user.id,
          movieId,
          addedAt: new Date().toISOString(),
          progressSeconds: 0,
          completed: false,
          notes
        };
        data.watchlists.push(item);
      } else if (notes) {
        data.watchlists[existingIndex].notes = notes;
      }
    });

    res.status(201).json({
      success: true,
      message: 'Movie added to watchlist',
      movieId,
      notes
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/watchlist/:movieId
// Scenario 4: User-Scoped ID Ingestion on Deletion (honors targetUserId from body or query)
router.delete('/:movieId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;
    const { movieId } = req.params;
    const targetUserId = (req.body && req.body.targetUserId) || (req.query && (req.query.targetUserId as string)) || user.id;

    await persistenceService.mutate((data) => {
      data.watchlists = data.watchlists.filter(
        (w) => !(w.userId === targetUserId && w.movieId === movieId)
      );
    });

    res.json({
      success: true,
      message: 'Movie removed from watchlist',
      movieId,
      targetUserId
    });
  } catch (error) {
    next(error);
  }
});

export default router;
