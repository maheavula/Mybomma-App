import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WatchlistItem } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.js';
import { useToast } from './ToastContext.js';

interface WatchlistContextType {
  watchlist: WatchlistItem[];
  isLoading: boolean;
  isInWatchlist: (movieId: string) => boolean;
  addToWatchlist: (movieId: string) => Promise<void>;
  removeFromWatchlist: (movieId: string) => Promise<void>;
  refreshWatchlist: () => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshWatchlist = useCallback(async () => {
    if (!user) {
      setWatchlist([]);
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.watchlist.getAll();
      if (res.success && res.watchlist) {
        setWatchlist(res.watchlist);
      }
    } catch {
      // Ignored if not authenticated
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshWatchlist();
  }, [refreshWatchlist]);

  const isInWatchlist = (movieId: string) => {
    return watchlist.some((item) => item.movieId === movieId);
  };

  const addToWatchlist = async (movieId: string) => {
    try {
      await api.watchlist.add(movieId);
      showToast('Added to your Cinema Watchlist', 'gold');
      await refreshWatchlist();
    } catch (err: any) {
      showToast(err.message || 'Failed to add to watchlist', 'error');
    }
  };

  const removeFromWatchlist = async (movieId: string) => {
    try {
      await api.watchlist.remove(movieId);
      showToast('Removed from Watchlist', 'info');
      await refreshWatchlist();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove from watchlist', 'error');
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        isLoading,
        isInWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        refreshWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
