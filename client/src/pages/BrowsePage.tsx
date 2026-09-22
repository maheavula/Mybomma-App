import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Film, Clock, Flame, Award, Filter, X, Play, Star, Plus, Check } from 'lucide-react';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { HeroBanner } from '../components/HeroBanner.js';
import { MovieCard } from '../components/MovieCard.js';
import { PaywallModal } from '../components/PaywallModal.js';
import { Movie, WatchlistItem } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useWatchlist } from '../context/WatchlistContext.js';

export const BrowsePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { watchlist, isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [paywallMovie, setPaywallMovie] = useState<Movie | null>(null);

  const genres = ['All', 'Action', 'Drama', 'Crime', 'Sci-Fi', 'Fantasy', 'Period', 'Thriller', 'Biography', 'Sports', 'Comedy'];

  useEffect(() => {
    fetchMovies();
  }, [selectedGenre, searchQuery]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await api.movies.getAll({
        genre: selectedGenre !== 'All' ? selectedGenre : undefined,
        search: searchQuery.trim() || undefined,
      });
      if (res.success) {
        setMovies(res.movies);
      }
    } catch (err) {
      console.error('Failed to load movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (movie: Movie) => {
    try {
      const streamRes = await api.movies.getStream(movie.id);
      if (streamRes.success) {
        navigate(`/watch/${movie.id}`);
      }
    } catch (err: any) {
      if (err.code === 'TIER_UPGRADE_REQUIRED' || err.code === 'SUBSCRIPTION_REQUIRED') {
        setPaywallMovie(movie);
      } else {
        navigate(`/watch/${movie.id}`);
      }
    }
  };

  // Continue watching items for Rohan
  const continueWatchingItems = watchlist.filter(
    (item) => item.progressSeconds > 0 && !item.completed
  );

  // Grouped rails across Pan-Indian cinema
  const trendingAcrossIndia = movies.filter((m) => m.views > 700000 || m.isFeatured);
  const nationalBlockbusters = movies.filter((m) => m.genres.includes('Action') || m.genres.includes('Crime'));
  const criticallyAcclaimed = [...movies].sort((a, b) => b.imdbRating - a.imdbRating).slice(0, 6);
  const panIndiaSpectacles = movies.filter((m) => m.requiredTier === 'IMAX 4K' || m.requiredTier === 'Super Cinema');

  return (
    <div className="min-h-screen bg-canvas text-gray-100 flex flex-col selection:bg-gold selection:text-black">
      <Navbar onSearch={setSearchQuery} searchQuery={searchQuery} />

      {/* Hero Spotlight (shown when not searching) */}
      {!searchQuery && movies.length > 0 && (
        <HeroBanner
          movies={movies}
          onPlay={handlePlay}
          onSelect={(m) => setSelectedMovie(m)}
        />
      )}

      {/* Main Browse Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-12">
        {/* Genre Pill Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1 mr-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-gold" /> Genre:
          </span>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedGenre === g
                  ? 'bg-gold text-black border-gold shadow-cinema-glow'
                  : 'cinema-glass text-gray-300 border-white/10 hover:border-gold/40'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Search Results Display */}
        {searchQuery ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-cinema text-white flex items-center gap-2">
              <span>Search Results for "{searchQuery}"</span>
              <span className="text-xs font-sans text-gray-400 font-normal">({movies.length} titles)</span>
            </h2>
            {movies.length === 0 ? (
              <div className="p-12 text-center cinema-glass rounded-2xl border border-gray-800">
                <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                {/* Scenario 7: Unsanitized search parameter reflection in user-facing message */}
                <p
                  className="text-base text-gray-300"
                  dangerouslySetInnerHTML={{
                    __html: 'No cinema titles found matching: <span>' + searchQuery + '</span>'
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">Try searching for Shah Rukh Khan, Prabhas, Dangal, Jawan, etc.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onPlay={handlePlay}
                    onSelect={(m) => setSelectedMovie(m)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Rail 1: Continue Watching for Rohan */}
            {continueWatchingItems.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold font-cinema text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gold" />
                    <span>Continue Watching for {user?.name.split(' ')[0] || 'Rohan'}</span>
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {continueWatchingItems.map((item) => (
                    <MovieCard
                      key={item.movieId}
                      movie={item.movie}
                      onPlay={handlePlay}
                      onSelect={(m) => setSelectedMovie(m)}
                      progressSeconds={item.progressSeconds}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Rail 2: Trending Across India */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-cinema text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-ruby" />
                  <span>Trending Across India</span>
                </h2>
                <span className="text-xs text-gold/80 hover:underline cursor-pointer">View All</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {trendingAcrossIndia.slice(0, 6).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onPlay={handlePlay}
                    onSelect={(m) => setSelectedMovie(m)}
                  />
                ))}
              </div>
            </section>

            {/* Rail 3: National Blockbusters */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-cinema text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gold" />
                  <span>National Blockbusters</span>
                </h2>
                <span className="text-xs text-gold/80 hover:underline cursor-pointer">View All</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {nationalBlockbusters.slice(0, 6).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onPlay={handlePlay}
                    onSelect={(m) => setSelectedMovie(m)}
                  />
                ))}
              </div>
            </section>

            {/* Rail 4: Pan-India Masterpieces */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-cinema text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-sapphire" />
                  <span>Pan-India Masterpieces</span>
                </h2>
                <span className="text-xs text-gold/80 hover:underline cursor-pointer">View All</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {panIndiaSpectacles.slice(0, 6).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onPlay={handlePlay}
                    onSelect={(m) => setSelectedMovie(m)}
                  />
                ))}
              </div>
            </section>

            {/* Rail 5: Critically Acclaimed Indian Originals */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-cinema text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-gold" />
                  <span>Critically Acclaimed Indian Originals</span>
                </h2>
                <span className="text-xs text-gold/80 hover:underline cursor-pointer">View All</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {criticallyAcclaimed.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onPlay={handlePlay}
                    onSelect={(m) => setSelectedMovie(m)}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl cinema-glass rounded-2xl overflow-hidden border border-gold/40 shadow-modal-gold">
            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black text-gray-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Backdrop Preview */}
            <div className="relative aspect-video w-full overflow-hidden">
              <img
                src={selectedMovie.backdropUrl}
                alt={selectedMovie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-black/40 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-cinema text-white">
                    {selectedMovie.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-300 mt-1">
                    <span className="text-gold font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                      {selectedMovie.imdbRating.toFixed(1)} IMDb
                    </span>
                    <span>•</span>
                    <span>{selectedMovie.releaseYear}</span>
                    <span>•</span>
                    <span>{selectedMovie.duration}</span>
                    <span>•</span>
                    <span className="px-1.5 py-0.5 rounded bg-black/60 border border-white/20">
                      {selectedMovie.rating}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const m = selectedMovie;
                    setSelectedMovie(null);
                    handlePlay(m);
                  }}
                  className="px-6 py-2.5 rounded-full bg-gold hover:bg-gold-light text-black font-bold text-xs shadow-cinema-glow flex items-center gap-2 transition"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Play
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-300 leading-relaxed">
                {selectedMovie.description}
              </p>

              {selectedMovie.cast && selectedMovie.cast.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gold uppercase tracking-wider mb-1">
                    Starring Cast
                  </h4>
                  <p className="text-xs text-gray-300">{selectedMovie.cast.join(', ')}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-800 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-200">Required Tier:</span>
                  <span className="px-2 py-0.5 rounded bg-gold/20 text-gold border border-gold/30">
                    {selectedMovie.requiredTier}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-200">Audio Channels:</span>
                  <span>Dolby Atmos 5.1 & Multi-Language Tracks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paywall Interceptor Modal */}
      {paywallMovie && (
        <PaywallModal
          movie={paywallMovie}
          isOpen={Boolean(paywallMovie)}
          onClose={() => setPaywallMovie(null)}
          userPlanId={user?.subscription?.planId}
        />
      )}

      <Footer />
    </div>
  );
};
