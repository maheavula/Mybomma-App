import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CinematicPlayer } from '../components/CinematicPlayer.js';
import { PaywallModal } from '../components/PaywallModal.js';
import { api } from '../services/api.js';
import { Movie, StreamPayload } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useWatchlist } from '../context/WatchlistContext.js';

export const WatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { watchlist } = useWatchlist();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [stream, setStream] = useState<StreamPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    loadMovieAndStream(id);
  }, [id]);

  const loadMovieAndStream = async (movieId: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // 1. Fetch movie details
      const movieRes = await api.movies.getById(movieId);
      if (movieRes.success) {
        setMovie(movieRes.movie);
      }

      // 2. Fetch stream metadata (gated by subscription & tier)
      const streamRes = await api.movies.getStream(movieId);
      if (streamRes.success) {
        setStream(streamRes.stream);
      }
    } catch (err: any) {
      console.error('Playback error:', err);
      if (err.code === 'TIER_UPGRADE_REQUIRED' || err.code === 'SUBSCRIPTION_REQUIRED') {
        setPaywallOpen(true);
      } else {
        setErrorMsg(err.message || 'Unable to stream title. Please verify your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Find saved progress timestamp for resuming playback
  const savedItem = watchlist.find((w) => w.movieId === id);
  const initialProgress = savedItem?.progressSeconds || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
        <p className="text-gold font-cinema tracking-widest text-sm uppercase">
          Initializing Cinema Stream...
        </p>
      </div>
    );
  }

  if (paywallOpen && movie) {
    return (
      <div className="min-h-screen bg-black">
        <PaywallModal
          movie={movie}
          isOpen={paywallOpen}
          onClose={() => navigate('/browse')}
          userPlanId={user?.subscription?.planId}
        />
      </div>
    );
  }

  if (errorMsg || !movie || !stream) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="cinema-glass p-8 rounded-2xl max-w-md border border-red-500/40 space-y-4">
          <p className="text-lg font-bold font-cinema text-white">Stream Feeds Offline</p>
          <p className="text-xs text-gray-400">{errorMsg || 'Failed to initialize player stream.'}</p>
          <button
            onClick={() => navigate('/browse')}
            className="px-6 py-2.5 rounded-full bg-gold text-black font-bold text-xs hover:bg-gold-light transition"
          >
            Return to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <CinematicPlayer
      movie={movie}
      stream={stream}
      initialProgressSeconds={initialProgress}
      onClose={() => navigate('/browse')}
    />
  );
};
