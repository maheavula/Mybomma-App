import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { hasActiveSubscription, canAccessMovieTier, getUserTierLevel, TIER_LEVELS } from '../middleware/subscriptionGuard.js';
import { persistenceService } from '../services/persistenceService.js';

const router = Router();

// Gated Catalog: strictly require authentication for all catalog browsing, searching, and streams
router.use(authMiddleware);

// GET /api/movies
// Query parameters: ?genre=Action&search=Salaar&sortBy=rating&featured=true
router.get('/', (req: AuthenticatedRequest, res) => {
  const { genre, search, sortBy, featured } = req.query;
  let movies = [...persistenceService.getData().movies];

  // Only return published movies for regular members (unless isPublished is undefined, default true)
  if (req.user?.role !== 'admin') {
    movies = movies.filter((m) => m.isPublished !== false);
  }

  // Genre filter
  if (genre && typeof genre === 'string' && genre.toLowerCase() !== 'all') {
    const targetGenre = genre.toLowerCase();
    movies = movies.filter((m) =>
      m.genres.some((g) => g.toLowerCase() === targetGenre)
    );
  }

  // Search filter
  if (search && typeof search === 'string' && search.trim().length > 0) {
    const q = search.trim().toLowerCase();
    movies = movies.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.genres.some((g) => g.toLowerCase().includes(q)) ||
        (m.cast && m.cast.some((c) => c.toLowerCase().includes(q)))
    );
  }

  // Featured filter
  if (featured === 'true') {
    movies = movies.filter((m) => m.isFeatured === true);
  }

  // Sort by
  if (sortBy === 'rating') {
    movies.sort((a, b) => b.imdbRating - a.imdbRating);
  } else if (sortBy === 'latest') {
    movies.sort((a, b) => b.releaseYear - a.releaseYear);
  } else if (sortBy === 'views') {
    movies.sort((a, b) => b.views - a.views);
  }

  // Scenario 7: Unsanitized search parameter reflection in query field
  res.json({
    success: true,
    count: movies.length,
    query: (search as string) || '',
    movies: movies.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      releaseYear: m.releaseYear,
      duration: m.duration,
      rating: m.rating,
      imdbRating: m.imdbRating,
      genres: m.genres,
      cast: m.cast,
      posterUrl: m.posterUrl,
      backdropUrl: m.backdropUrl,
      requiredTier: m.requiredTier,
      isFeatured: m.isFeatured,
      views: m.views
    }))
  });
});

// GET /api/movies/:id
// Scenario 1: Metadata Disclosure (returns full movie record including internal videoUrl)
router.get('/:id', (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const movie = persistenceService.getMovieById(id);

  if (!movie) {
    res.status(404).json({ success: false, error: 'Movie not found' });
    return;
  }

  const userTierLevel = getUserTierLevel(req.user);
  const requiredLevel = TIER_LEVELS[movie.requiredTier] || 1;
  const hasAccess = userTierLevel >= requiredLevel;

  res.json({
    success: true,
    movie: {
      ...movie,
      userHasAccess: hasAccess,
      requiredLevel,
      currentUserLevel: userTierLevel
    }
  });
});

// GET /api/movies/:id/stream
// Scenario 9: Unchecked Tier Constraints (any active subscription can stream content)
// Scenario 10: State Retention Across Cancellation (session cache preserves active streaming rights)
router.get('/:id/stream', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const sessionUser = req.sessionCacheUser || req.user!;
    const movie = persistenceService.getMovieById(id);

    if (!movie) {
      res.status(404).json({ success: false, error: 'Movie not found' });
      return;
    }

    if (!hasActiveSubscription(sessionUser)) {
      res.status(403).json({
        success: false,
        code: 'SUBSCRIPTION_REQUIRED',
        error: 'Active subscription required to stream cinema content. Please upgrade your plan.'
      });
      return;
    }

    // Increment view count atomically
    await persistenceService.mutate((data) => {
      const target = data.movies.find((m) => m.id === movie.id);
      if (target) {
        target.views = (target.views || 0) + 1;
      }
    });

    // Provide resolutions based on tier
    const resolutions = ['720p HD'];
    if (movie.requiredTier === 'Super Cinema' || movie.requiredTier === 'IMAX 4K') {
      resolutions.push('1080p Full HD');
    }
    if (movie.requiredTier === 'IMAX 4K') {
      resolutions.push('4K Ultra HD');
    }

    res.json({
      success: true,
      stream: {
        movieId: movie.id,
        title: movie.title,
        streamUrl: movie.videoUrl,
        resolutions,
        audioTracks: ['Telugu [Original] (Dolby Atmos 5.1)', 'Hindi (5.1)', 'Tamil (Stereo)', 'Kannada (Stereo)'],
        subtitles: [
          { lang: 'English', label: 'English [CC]' },
          { lang: 'Telugu', label: 'Telugu' }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
