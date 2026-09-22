import React, { useState, useRef, useEffect } from 'react';
import { Play, Plus, Check, Star, Lock, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Movie } from '../types/index.js';
import { useWatchlist } from '../context/WatchlistContext.js';

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onSelect?: (movie: Movie) => void;
  progressSeconds?: number;
  totalDurationSeconds?: number;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onPlay,
  onSelect,
  progressSeconds = 0,
}) => {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [isHovered, setIsHovered] = useState(false);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hoverTimerRef = useRef<any>(null);

  const inList = isInWatchlist(movie.id);

  // Trigger video preview after 450ms of hover
  useEffect(() => {
    if (isHovered && movie.videoUrl) {
      hoverTimerRef.current = setTimeout(() => {
        setShowVideoPreview(true);
      }, 450);
    } else {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      setShowVideoPreview(false);
    }

    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [isHovered, movie.videoUrl]);

  // Autoplay video preview when ready
  useEffect(() => {
    if (showVideoPreview && videoRef.current) {
      videoRef.current.currentTime = 10; // start 10s in for action
      videoRef.current.play().catch(() => {});
    }
  }, [showVideoPreview]);

  const handleWatchlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inList) {
      await removeFromWatchlist(movie.id);
    } else {
      await addToWatchlist(movie.id);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'IMAX 4K':
        return 'bg-amber-500/20 text-gold-light border-gold/40 shadow-cinema-glow';
      case 'Super Cinema':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-gray-800/60 text-gray-300 border-gray-700/60';
    }
  };

  // Estimate duration in seconds for progress bar calculation
  let durationInSeconds = 7200;
  if (movie.duration) {
    const matchH = movie.duration.match(/(\d+)h/);
    const matchM = movie.duration.match(/(\d+)m/);
    const h = matchH ? parseInt(matchH[1], 10) : 0;
    const m = matchM ? parseInt(matchM[1], 10) : 0;
    if (h > 0 || m > 0) {
      durationInSeconds = h * 3600 + m * 60;
    }
  }

  const progressPercent = progressSeconds > 0
    ? Math.min(100, Math.round((progressSeconds / durationInSeconds) * 100))
    : 0;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => (onSelect ? onSelect(movie) : onPlay(movie))}
      className="group relative cursor-pointer select-none rounded-xl overflow-hidden bg-surface transition-all duration-300 hover:scale-105 hover:z-20 hover:shadow-cinema-glow border border-transparent hover:border-gold/40"
    >
      {/* Media Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-charcoal">
        {/* Poster Image */}
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            showVideoPreview ? 'opacity-0' : 'opacity-100'
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80';
          }}
        />

        {/* Real-time Hover Video Micro-Preview */}
        {showVideoPreview && movie.videoUrl && (
          <div className="absolute inset-0 z-0 bg-black animate-fade-in">
            <video
              ref={videoRef}
              src={movie.videoUrl}
              muted={isVideoMuted}
              loop
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Audio Toggle in Video Preview */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVideoMuted(!isVideoMuted);
              }}
              className="absolute top-10 right-2 z-20 p-1 rounded-full bg-black/70 text-gray-200 hover:text-gold"
              title={isVideoMuted ? 'Unmute preview' : 'Mute preview'}
            >
              {isVideoMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-gold" />}
            </button>
          </div>
        )}

        {/* Ambient Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070B] via-black/20 to-transparent opacity-85 group-hover:opacity-90 transition-opacity pointer-events-none" />

        {/* Top Badges: Tier & Rating */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-md border ${getTierColor(
              movie.requiredTier
            )}`}
          >
            {movie.requiredTier}
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-gray-200 backdrop-blur-md border border-white/10">
            {movie.rating}
          </span>
        </div>

        {/* Hover Center Play Button */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 z-10 ${
            isHovered && !showVideoPreview ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(movie);
            }}
            className="w-11 h-11 rounded-full bg-gold text-black flex items-center justify-center shadow-cinema-glow hover:bg-gold-light hover:scale-110 transition-transform"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </button>
        </div>

        {/* Bottom Details (Title, Rating, Watchlist) */}
        <div className="absolute bottom-0 inset-x-0 p-3 flex flex-col gap-1 z-10 pointer-events-auto">
          <div className="flex items-center justify-between gap-1">
            <h3 className="font-semibold text-xs sm:text-sm text-white truncate group-hover:text-gold transition-colors">
              {movie.title}
            </h3>
            <button
              onClick={handleWatchlistClick}
              title={inList ? 'Remove from Watchlist' : 'Add to Watchlist'}
              className={`p-1 rounded-full backdrop-blur-md transition-colors ${
                inList
                  ? 'bg-gold text-black hover:bg-gold-light'
                  : 'bg-black/60 text-gray-300 hover:text-white hover:bg-white/20'
              }`}
            >
              {inList ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            </button>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <span className="flex items-center gap-0.5 text-gold font-semibold">
              <Star className="w-2.5 h-2.5 fill-gold text-gold" />
              {movie.imdbRating.toFixed(1)}
            </span>
            <span>•</span>
            <span>{movie.releaseYear}</span>
            <span>•</span>
            <span>{movie.duration}</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {movie.genres.slice(0, 2).map((g) => (
              <span key={g} className="text-[8px] text-gray-300 bg-white/10 px-1.5 py-0.5 rounded">
                {g}
              </span>
            ))}
          </div>

          {/* Continue Watching Progress Bar */}
          {progressSeconds > 0 && (
            <div className="mt-2 w-full bg-gray-800 rounded-full h-1 overflow-hidden">
              <div
                className="bg-gold h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
