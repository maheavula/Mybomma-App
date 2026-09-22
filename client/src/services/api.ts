import { User, Movie, Plan, WatchlistItem, StreamPayload, BillingOrder, AdminDashboardStats } from '../types/index.js';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Ensure HTTP-only cookies are passed
  };

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, config);
  } catch (netErr: any) {
    throw new Error('Unable to connect to server. Please ensure the backend is running on port 5000.');
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  const rawText = await res.text();
  let data: any = null;

  if (rawText && rawText.trim().length > 0) {
    try {
      data = JSON.parse(rawText);
    } catch {
      if (!res.ok) {
        throw new Error(rawText.slice(0, 200) || `Server returned error (${res.status})`);
      }
      data = { rawText };
    }
  } else {
    if (!res.ok) {
      throw new Error(`Server returned error (${res.status} ${res.statusText || 'No Content'})`);
    }
    data = { success: true };
  }

  if (!res.ok || data?.success === false) {
    const error: any = new Error(data?.error || data?.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.code = data?.code;
    error.data = data;
    throw error;
  }

  return data as T;
}

export const api = {
  // -------------------------------------------------------------
  // API 1: AUTHENTICATION
  // -------------------------------------------------------------
  auth: {
    signup: (payload: { name: string; email: string; password: string; phone?: string }) =>
      request<{ success: boolean; user: User; message: string }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    login: (payload: { email: string; password: string }) =>
      request<{ success: boolean; user: User; message: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    logout: () =>
      request<{ success: boolean; message: string }>('/auth/logout', {
        method: 'POST',
      }),
    getMe: () =>
      request<{ success: boolean; user: User }>('/auth/me'),
  },

  // -------------------------------------------------------------
  // API 2: USER ACCOUNT
  // -------------------------------------------------------------
  user: {
    getProfile: () =>
      request<{ success: boolean; profile: User & { registeredDate: string; activePlanId: string | null } }>('/user/profile'),
    updateProfile: (payload: { name?: string; phone?: string; preferences?: { defaultAudio?: string; autoPlayNext?: boolean } }) =>
      request<{ success: boolean; profile: User; message: string }>('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    getBilling: () =>
      request<{
        success: boolean;
        billing: {
          currentSubscription: any;
          orders: BillingOrder[];
        };
      }>('/user/billing'),
  },

  // -------------------------------------------------------------
  // API 3: MOVIE CATALOG
  // -------------------------------------------------------------
  movies: {
    getAll: (params?: { genre?: string; search?: string; sortBy?: string; featured?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.genre) query.append('genre', params.genre);
      if (params?.search) query.append('search', params.search);
      if (params?.sortBy) query.append('sortBy', params.sortBy);
      if (params?.featured) query.append('featured', 'true');
      const qs = query.toString();
      return request<{ success: boolean; count: number; movies: Movie[] }>(`/movies${qs ? `?${qs}` : ''}`);
    },
    getById: (id: string) =>
      request<{ success: boolean; movie: Movie & { userHasAccess: boolean; requiredLevel: number; currentUserLevel: number } }>(`/movies/${id}`),
    getStream: (id: string) =>
      request<{ success: boolean; stream: StreamPayload }>(`/movies/${id}/stream`),
  },

  // -------------------------------------------------------------
  // API 4: SUBSCRIPTIONS & PLANS
  // -------------------------------------------------------------
  subscriptions: {
    getPlans: () =>
      request<{ success: boolean; plans: Plan[] }>('/subscriptions/plans'),
    subscribe: (planId: string, paymentMethod: string = 'UPI Instant') =>
      request<{ success: boolean; message: string; subscription: any; order: any }>('/subscriptions/subscribe', {
        method: 'POST',
        body: JSON.stringify({ planId, paymentMethod }),
      }),
    cancel: () =>
      request<{ success: boolean; message: string; subscription: any }>('/subscriptions/cancel', {
        method: 'POST',
      }),
  },

  // -------------------------------------------------------------
  // API 5: WATCHLIST & PROGRESS
  // -------------------------------------------------------------
  watchlist: {
    getAll: () =>
      request<{ success: boolean; count: number; watchlist: WatchlistItem[] }>('/watchlist'),
    add: (movieId: string, notes?: string) =>
      request<{ success: boolean; message: string; movieId: string; notes?: string }>(`/watchlist/${movieId}`, {
        method: 'POST',
        body: notes ? JSON.stringify({ notes }) : undefined,
      }),
    remove: (movieId: string) =>
      request<{ success: boolean; message: string; movieId: string }>(`/watchlist/${movieId}`, {
        method: 'DELETE',
      }),
    updateProgress: (movieId: string, progressSeconds: number, durationSeconds: number) =>
      request<{ success: boolean; message: string; progressSeconds: number; completed: boolean }>('/watchlist/progress', {
        method: 'POST',
        body: JSON.stringify({ movieId, progressSeconds, durationSeconds }),
      }),
  },

  // -------------------------------------------------------------
  // API 6: ADMIN CONSOLE
  // -------------------------------------------------------------
  admin: {
    getDashboard: () =>
      request<{
        success: boolean;
        stats: AdminDashboardStats;
        recentTransactions: any[];
        recentMemberActions?: Array<{
          userId: string;
          userName: string;
          movieId: string;
          movieTitle: string;
          notes: string;
          addedAt: string;
        }>;
      }>('/admin/dashboard'),
    getMovies: () =>
      request<{ success: boolean; count: number; movies: Movie[] }>('/admin/movies'),
    createMovie: (payload: Partial<Movie>) =>
      request<{ success: boolean; message: string; movie: Movie }>('/admin/movies', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    updateMovie: (id: string, payload: Partial<Movie>) =>
      request<{ success: boolean; message: string; movie: Movie }>(`/admin/movies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    deleteMovie: (id: string) =>
      request<{ success: boolean; message: string; movieId: string }>(`/admin/movies/${id}`, {
        method: 'DELETE',
      }),
    getUsers: () =>
      request<{ success: boolean; count: number; users: User[] }>('/admin/users'),
    updateUserStatus: (id: string, status: 'active' | 'suspended') =>
      request<{ success: boolean; message: string; user: User }>(`/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // -------------------------------------------------------------
  // API 7: SYSTEM & TELEMETRY
  // -------------------------------------------------------------
  system: {
    getHealth: () =>
      request<{
        success: boolean;
        status: string;
        timestamp: string;
        uptime: string;
        uptimeSeconds: number;
        diskWriteLock: boolean;
        memory: any;
      }>('/system/health'),
    getInfo: () =>
      request<{
        success: boolean;
        platform: string;
        version: string;
        region: string;
        streamingStatus: string;
        protocols: string[];
        videoCodecs: string[];
        audioCodecs: string[];
      }>('/system/info'),
  },
};
