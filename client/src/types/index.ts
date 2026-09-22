export interface UserSubscription {
  planId: string;
  status: 'active' | 'canceled' | 'expired';
  startDate: string;
  expiresAt: string;
}

export interface UserPreferences {
  defaultAudio?: string;
  autoPlayNext?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'admin';
  status: 'active' | 'suspended';
  phone?: string;
  subscription?: UserSubscription;
  preferences?: UserPreferences;
  createdAt: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  releaseYear: number;
  duration: string;
  rating: string;
  imdbRating: number;
  genres: string[];
  cast?: string[];
  posterUrl: string;
  backdropUrl: string;
  videoUrl?: string;
  requiredTier: 'Basic' | 'Super Cinema' | 'IMAX 4K';
  isFeatured?: boolean;
  isPublished?: boolean;
  views: number;
  createdAt?: string;
  userHasAccess?: boolean;
  requiredLevel?: number;
  currentUserLevel?: number;
}

export interface Plan {
  id: string;
  name: string;
  price: number; // in integer paise
  priceRupees: string;
  formattedPrice: string;
  currency: 'INR';
  resolution: string;
  screens: number;
  validityDays: number;
}

export interface WatchlistItem {
  userId: string;
  movieId: string;
  addedAt: string;
  progressSeconds: number;
  completed: boolean;
  movie: Movie;
}

export interface StreamPayload {
  movieId: string;
  title: string;
  streamUrl: string;
  resolutions: string[];
  audioTracks: string[];
  subtitles: { lang: string; label: string }[];
}

export interface BillingOrder {
  id: string;
  transactionId: string;
  planId: string;
  planName: string;
  amountPaise: number;
  amountRupees: string;
  currency: string;
  paymentMethod: string;
  status: string;
  date: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalMembers: number;
  activeSubscribers: number;
  totalRevenuePaise: number;
  totalRevenueRupees: string;
  formattedRevenue: string;
  totalMovies: number;
  activeSessions: number;
  diskWriteLock: boolean;
}
