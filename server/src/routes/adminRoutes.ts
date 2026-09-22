import { Router } from 'express';
import crypto from 'crypto';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleGuard.js';
import { persistenceService } from '../services/persistenceService.js';
import { Movie } from '../types/schema.js';
import { sanitizeUser } from './authRoutes.js';

const router = Router();

// Strictly guard all Admin endpoints with auth + requireRole('admin')
router.use(authMiddleware);
router.use(requireRole('admin'));

// GET /api/admin/dashboard
router.get('/dashboard', (req, res) => {
  const data = persistenceService.getData();
  const totalUsers = data.users.length;
  const members = data.users.filter((u) => u.role === 'member');
  const activeSubscribers = members.filter(
    (u) => u.subscription?.status === 'active' && new Date(u.subscription.expiresAt) > new Date()
  ).length;

  const totalRevenuePaise = data.subscriptions
    .filter((s) => s.status === 'completed')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalMovies = data.movies.length;
  const activeSessions = data.sessions.length;

  // Scenario 8: Secondary Field Notes Propagation
  // Compiles recentMemberActions feed containing user-entered watchlist notes
  const recentMemberActions = data.watchlists.slice(-10).reverse().map((w) => {
    const user = data.users.find((u) => u.id === w.userId);
    const movie = data.movies.find((m) => m.id === w.movieId);
    return {
      userId: w.userId,
      userName: user?.name || 'Member',
      movieId: w.movieId,
      movieTitle: movie?.title || 'Unknown Cinema Title',
      notes: w.notes || '',
      addedAt: w.addedAt
    };
  });

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalMembers: members.length,
      activeSubscribers,
      totalRevenuePaise,
      totalRevenueRupees: (totalRevenuePaise / 100).toFixed(2),
      formattedRevenue: `₹${(totalRevenuePaise / 100).toLocaleString('en-IN')}`,
      totalMovies,
      activeSessions,
      diskWriteLock: persistenceService.getDiskLockStatus()
    },
    recentTransactions: data.subscriptions.slice(-10).reverse(),
    recentMemberActions
  });
});

// GET /api/admin/movies
router.get('/movies', (req, res) => {
  const movies = persistenceService.getData().movies;
  res.json({
    success: true,
    count: movies.length,
    movies
  });
});

// POST /api/admin/movies
// Body: { title, description, releaseYear, duration, genres: [], posterUrl, backdropUrl, videoUrl, requiredTier, cast }
router.post('/movies', async (req, res, next) => {
  try {
    const {
      title,
      description,
      releaseYear,
      duration,
      genres,
      posterUrl,
      backdropUrl,
      videoUrl,
      requiredTier,
      cast,
      rating,
      imdbRating,
      isFeatured,
      isPublished
    } = req.body;

    if (!title || !description || !posterUrl || !backdropUrl || !videoUrl) {
      res.status(400).json({
        success: false,
        error: 'title, description, posterUrl, backdropUrl, and videoUrl are required'
      });
      return;
    }

    const newMovie: Movie = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      releaseYear: Number(releaseYear) || new Date().getFullYear(),
      duration: duration || '2h 15m',
      rating: rating || 'U/A 16+',
      imdbRating: Number(imdbRating) || 8.0,
      genres: Array.isArray(genres) && genres.length > 0 ? genres : ['Action', 'Drama'],
      cast: Array.isArray(cast) ? cast : [],
      posterUrl: posterUrl.trim(),
      backdropUrl: backdropUrl.trim(),
      videoUrl: videoUrl.trim(),
      requiredTier: requiredTier || 'Basic',
      isFeatured: Boolean(isFeatured),
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      views: 0,
      createdAt: new Date().toISOString()
    };

    await persistenceService.mutate((data) => {
      data.movies.unshift(newMovie);
    });

    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      movie: newMovie
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/movies/:id
router.put('/movies/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let updatedMovie: Movie | null = null;

    await persistenceService.mutate((data) => {
      const idx = data.movies.findIndex((m) => m.id === id);
      if (idx !== -1) {
        data.movies[idx] = {
          ...data.movies[idx],
          ...updates,
          id // Prevent ID modification
        };
        updatedMovie = data.movies[idx];
      }
    });

    if (!updatedMovie) {
      res.status(404).json({ success: false, error: 'Movie not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Movie updated successfully',
      movie: updatedMovie
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/movies/:id
router.delete('/movies/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    let removed = false;
    await persistenceService.mutate((data) => {
      const initialLen = data.movies.length;
      data.movies = data.movies.filter((m) => m.id !== id);
      // Also remove from all watchlists
      data.watchlists = data.watchlists.filter((w) => w.movieId !== id);
      removed = data.movies.length < initialLen;
    });

    if (!removed) {
      res.status(404).json({ success: false, error: 'Movie not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Movie removed successfully',
      movieId: id
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/users
router.get('/users', (req, res) => {
  const users = persistenceService.getData().users;
  res.json({
    success: true,
    count: users.length,
    users: users.map(sanitizeUser)
  });
});

// PATCH /api/admin/users/:id/status
// Body: { status: "active" | "suspended" }
router.patch('/users/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 'active' && status !== 'suspended') {
      res.status(400).json({ success: false, error: 'Status must be "active" or "suspended"' });
      return;
    }

    let targetUser: any = null;

    await persistenceService.mutate((data) => {
      const user = data.users.find((u) => u.id === id);
      if (user) {
        user.status = status;
        targetUser = user;
        // Instantly purge all active sessions for this user if suspended
        if (status === 'suspended') {
          data.sessions = data.sessions.filter((s) => s.userId !== id);
        }
      }
    });

    if (!targetUser) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      message: `User status changed to ${status}. Active sessions ${status === 'suspended' ? 'purged' : 'preserved'}.`,
      user: sanitizeUser(targetUser)
    });
  } catch (error) {
    next(error);
  }
});

export default router;
