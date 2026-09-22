import React, { useState, useEffect } from 'react';
import { Play, Plus, Check, Star, Volume2, VolumeX, Info, Sparkles } from 'lucide-react';
import { Movie } from '../types/index.js';
import { useWatchlist } from '../context/WatchlistContext.js';

interface HeroBannerProps {
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onSelect: (movie: Movie) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ movies, onPlay, onSelect }) => {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // Filter featured or high rating movies for the banner spotlight
  const bannerMovies = movies.filter((m) => m.isFeatured).length > 0
    ? movies.filter((m) => m.isFeatured)
    : movies.slice(0, 4);

  const currentMovie = bannerMovies[currentIndex] || movies[0];

  useEffect(() => {
    if (bannerMovies.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerMovies.length);
    }, 9000);
    return () => clearInterval(timer);
  }, [bannerMovies.length]);

  if (!currentMovie) return null;

  const inList = isInWatchlist(currentMovie.id);

  const handleWatchlistToggle = async () => {
    if (inList) {
      await removeFromWatchlist(currentMovie.id);
    } else {
      await addToWatchlist(currentMovie.id);
    }
  };

  return (
    <div className="relative w-full h-[70vh] min-h-[520px] max-h-[750px] overflow-hidden bg-black select-none">
      {/* Dynamic Backdrop */}
      <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
        <img
          src={currentMovie.backdropUrl}
          alt={currentMovie.title}
          className="w-full h-full object-cover object-center scale-105 animate-pulse-subtle"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1600&q=80';
          }}
        />
        {/* Cinema Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/70 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-canvas/60 via-transparent to-canvas" />
      </div>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 z-10">
        <div className="max-w-2xl space-y-4">
          {/* Badges */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gold/20 text-gold border border-gold/40 shadow-cinema-glow">
              <Sparkles className="w-3.5 h-3.5" />
              SPOTLIGHT PREMIERE
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-black/60 text-gray-200 border border-white/10">
              {currentMovie.rating}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-black/60 text-gold border border-gold/20">
              {currentMovie.requiredTier}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold font-cinema tracking-wide text-white leading-tight drop-shadow-xl">
            {currentMovie.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-300 font-medium">
            <span className="flex items-center gap-1 text-gold font-bold">
              <Star className="w-4 h-4 fill-gold text-gold" />
              {currentMovie.imdbRating.toFixed(1)} IMDb
            </span>
            <span>•</span>
            <span>{currentMovie.releaseYear}</span>
            <span>•</span>
            <span>{currentMovie.duration}</span>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              {currentMovie.genres.map((g) => (
                <span key={g} className="text-xs text-gray-300 bg-white/10 px-2 py-0.5 rounded">
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Synopsis */}
          <p className="text-gray-300 text-sm sm:text-base line-clamp-3 leading-relaxed drop-shadow">
            {currentMovie.description}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-3">
            <button
              onClick={() => onPlay(currentMovie)}
              className="flex items-center gap-2.5 px-7 py-3 rounded-full bg-gold hover:bg-gold-light text-black font-bold text-sm shadow-cinema-glow hover:scale-105 transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              Stream Now
            </button>

            <button
              onClick={handleWatchlistToggle}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold backdrop-blur-md transition-all border ${
                inList
                  ? 'bg-gold/20 text-gold border-gold/40'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {inList ? 'In Watchlist' : 'Add to Watchlist'}
            </button>

            <button
              onClick={() => onSelect(currentMovie)}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all"
              title="More Details"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Indicators & Sound Switch */}
        <div className="absolute right-4 sm:right-8 bottom-16 flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-gray-300 hover:text-white border border-white/20 backdrop-blur-md transition"
            title={isMuted ? 'Unmute preview audio' : 'Mute preview audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-gold" />}
          </button>

          {bannerMovies.length > 1 && (
            <div className="flex items-center gap-2 bg-black/50 px-3 py-2 rounded-full border border-white/10 backdrop-blur-md">
              {bannerMovies.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? 'w-6 bg-gold' : 'w-2 bg-gray-600 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
