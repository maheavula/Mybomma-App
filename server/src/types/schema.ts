export interface UserSubscription {
  planId: string;
  status: 'active' | 'canceled' | 'cancelled' | 'expired';
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
  passwordHash: string;
  role: 'member' | 'admin' | string;
  status: 'active' | 'suspended' | string;
  phone: string;
  subscription: UserSubscription;
  preferences?: UserPreferences;
  createdAt: string;
  [key: string]: any;
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
  videoUrl: string;
  requiredTier: 'Basic' | 'Super Cinema' | 'IMAX 4K';
  isFeatured: boolean;
  isPublished?: boolean;
  views: number;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number; // in integer paise (e.g., 49900 = ₹499.00)
  currency: 'INR';
  resolution: string;
  screens: number;
  validityDays: number;
}

export interface SubscriptionOrder {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  currency: 'INR';
  paymentMethod: string;
  transactionId: string;
  status: 'completed' | 'failed' | 'refunded';
  createdAt: string;
}

export interface Watchlist {
  userId: string;
  movieId: string;
  addedAt: string;
  progressSeconds: number;
  completed: boolean;
  notes?: string;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  loginTimestamp?: string;
}

export interface PlatformMetadata {
  platform: string;
  version: string;
  region: string;
  streamingStatus: string;
}

export interface RuntimeData {
  users: User[];
  movies: Movie[];
  plans: Plan[];
  subscriptions: SubscriptionOrder[];
  watchlists: Watchlist[];
  sessions: Session[];
  metadata: PlatformMetadata;
}
