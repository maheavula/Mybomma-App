import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  ArrowLeft,
  Tv,
  Subtitles,
  AudioLines,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StreamPayload, Movie } from '../types/index.js';
import { api } from '../services/api.js';

interface CinematicPlayerProps {
  movie: Movie;
  stream: StreamPayload;
  initialProgressSeconds?: number;
  onClose?: () => void;
}

export const CinematicPlayer: React.FC<CinematicPlayerProps> = ({
  movie,
  stream,
  initialProgressSeconds = 0,
  onClose
}) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(initialProgressSeconds);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [activeResolution, setActiveResolution] = useState<string>(
    stream.resolutions[stream.resolutions.length - 1] || '1080p Full HD'
  );
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [activeAudio, setActiveAudio] = useState<string>(stream.audioTracks[0] || 'Telugu [Original]');
  const [activeSubtitle, setActiveSubtitle] = useState<string>('Off');
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<number>(0);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);

  const controlsTimeoutRef = useRef<any>(null);

  // Resume playback from initial progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (initialProgressSeconds > 0) {
      video.currentTime = initialProgressSeconds;
    }

    video.play().catch(() => {
      // Autoplay with audio might be blocked by browser
      setIsPlaying(false);
    });
  }, [initialProgressSeconds]);

  // Periodic heartbeat every 15 seconds to sync progress
  useEffect(() => {
    const sendHeartbeat = async () => {
      const video = videoRef.current;
      if (!video || video.paused) return;

      const curr = Math.floor(video.currentTime);
      const total = Math.floor(video.duration || 7200);

      if (curr > 5) {
        try {
          await api.watchlist.updateProgress(movie.id, curr, total);
        } catch (e) {
          console.error('Failed to sync playback heartbeat:', e);
        }
      }
    };

    const interval = setInterval(sendHeartbeat, 15000);
    return () => clearInterval(interval);
  }, [movie.id]);

  // Sync on unmount or navigation
  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video && video.currentTime > 5) {
        api.watchlist
          .updateProgress(movie.id, Math.floor(video.currentTime), Math.floor(video.duration || 7200))
          .catch(() => {});
      }
    };
  }, [movie.id]);

  // Hide controls on mouse idle
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
        setShowSettings(false);
      }
    }, 3500);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSkip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
      video.volume = volume || 0.8;
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false));
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    const video = videoRef.current;
    if (!bar || !video || !video.duration) return;

    const rect = bar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const targetTime = pos * video.duration;
    video.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleTimelineHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    const video = videoRef.current;
    if (!bar || !video || !video.duration) return;

    const rect = bar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setHoverPos(e.clientX - rect.left);
    setHoverTime(pos * video.duration);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleExit = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/browse');
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-black overflow-hidden select-none font-sans"
    >
      {/* Ambient Theater Back-Illumination */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 blur-3xl opacity-30 ${
          isPlaying ? 'bg-gradient-to-tr from-gold/30 via-saffron/20 to-black' : 'opacity-10'
        }`}
      />

      {/* HTML5 Native Video Tag */}
      <video
        ref={videoRef}
        src={stream.streamUrl}
        className="w-full h-full object-contain"
        playsInline
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
          }
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
        }}
        onClick={togglePlay}
      />

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      )}

      {/* Top Bar (Back Button & Movie Title) */}
      <div
        className={`absolute top-0 inset-x-0 p-6 flex items-center justify-between z-30 bg-gradient-to-b from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={handleExit}
            className="p-2.5 rounded-full bg-surface/80 hover:bg-gold text-white hover:text-black border border-white/10 hover:border-gold transition-all"
            title="Exit Player"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold font-cinema text-white flex items-center gap-2">
              {movie.title}
              <span className="text-[10px] uppercase font-sans tracking-widest px-2 py-0.5 rounded bg-gold/20 text-gold border border-gold/30">
                {activeResolution}
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              {movie.releaseYear} • {movie.rating} • Dolby Atmos 5.1
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Buffer 100%
          </span>
        </div>
      </div>

      {/* Bottom Cinematic Control Deck */}
      <div
        className={`absolute bottom-0 inset-x-0 p-6 z-30 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Timeline Scrubber */}
        <div
          ref={progressBarRef}
          onClick={handleTimelineClick}
          onMouseMove={handleTimelineHover}
          onMouseLeave={() => setHoverTime(null)}
          className="relative w-full h-2 hover:h-3 bg-white/20 rounded-full cursor-pointer transition-all mb-4 group"
        >
          {/* Progress fill */}
          <div
            className="h-full bg-gradient-to-r from-gold to-saffron rounded-full relative"
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          >
            {/* Scrubber thumb */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-gold rounded-full shadow-cinema-glow scale-0 group-hover:scale-100 transition-transform" />
          </div>

          {/* Hover Time Preview Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-8 px-2 py-1 bg-surface text-gold font-mono text-xs rounded border border-gold/40 shadow -translate-x-1/2 pointer-events-none"
              style={{ left: `${hoverPos}px` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          {/* Left: Play, Skips, Volume, Timestamps */}
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-gold hover:bg-gold-light text-black flex items-center justify-center shadow-cinema-glow transition hover:scale-105"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => handleSkip(-10)}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition"
              title="Rewind 10 seconds"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleSkip(10)}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition"
              title="Forward 10 seconds"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/vol">
              <button
                onClick={toggleMute}
                className="p-2 text-gray-300 hover:text-white transition"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-gray-300" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 accent-gold bg-gray-700 rounded cursor-pointer transition-all"
              />
            </div>

            {/* Time Indicator */}
            <span className="text-xs font-mono text-gray-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right: Resolution, Audio/Subtitles, Fullscreen */}
          <div className="flex items-center gap-3 relative">
            {/* Resolution Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface/80 hover:bg-surface border border-white/10 hover:border-gold/40 text-xs font-medium text-gray-200 transition"
              >
                <Settings className="w-4 h-4 text-gold" />
                <span>{activeResolution}</span>
              </button>

              {/* Resolution / Audio Settings Popup */}
              {showSettings && (
                <div className="absolute right-0 bottom-12 w-64 cinema-glass rounded-xl p-4 shadow-2xl border border-gold/30 z-50 text-xs space-y-4 animate-fade-in">
                  <div>
                    <p className="font-semibold text-gold mb-2 flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5" /> Resolution Stream
                    </p>
                    <div className="space-y-1">
                      {stream.resolutions.map((res) => (
                        <button
                          key={res}
                          onClick={() => {
                            setActiveResolution(res);
                            setShowSettings(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded transition ${
                            activeResolution === res
                              ? 'bg-gold text-black font-semibold'
                              : 'text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          {res}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-800 pt-3">
                    <p className="font-semibold text-gold mb-2 flex items-center gap-1.5">
                      <AudioLines className="w-3.5 h-3.5" /> Audio Track
                    </p>
                    <div className="space-y-1">
                      {stream.audioTracks.map((trk) => (
                        <button
                          key={trk}
                          onClick={() => setActiveAudio(trk)}
                          className={`w-full text-left px-2.5 py-1.5 rounded truncate transition ${
                            activeAudio === trk
                              ? 'bg-gold/20 text-gold font-semibold border border-gold/30'
                              : 'text-gray-400 hover:bg-white/5'
                          }`}
                        >
                          {trk}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-800 pt-3">
                    <p className="font-semibold text-gold mb-2 flex items-center gap-1.5">
                      <Subtitles className="w-3.5 h-3.5" /> Subtitles
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveSubtitle('Off')}
                        className={`px-3 py-1 rounded transition ${
                          activeSubtitle === 'Off'
                            ? 'bg-gold text-black font-semibold'
                            : 'bg-surface text-gray-400 hover:text-white'
                        }`}
                      >
                        Off
                      </button>
                      {stream.subtitles.map((sub) => (
                        <button
                          key={sub.lang}
                          onClick={() => setActiveSubtitle(sub.label)}
                          className={`px-3 py-1 rounded transition ${
                            activeSubtitle === sub.label
                              ? 'bg-gold text-black font-semibold'
                              : 'bg-surface text-gray-400 hover:text-white'
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
