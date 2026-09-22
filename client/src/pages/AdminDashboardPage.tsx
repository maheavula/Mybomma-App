import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Tv,
  Users,
  CreditCard,
  Radio,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  Activity,
  X,
  Sparkles,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { AdminDashboardStats, Movie, User } from '../types/index.js';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'inventory' | 'members' | 'transactions' | 'actions'>('inventory');
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [memberActions, setMemberActions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [movieSearch, setMovieSearch] = useState<string>('');

  // Modal State for Add / Edit Title
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formReleaseYear, setFormReleaseYear] = useState('2024');
  const [formDuration, setFormDuration] = useState('2h 45m');
  const [formRating, setFormRating] = useState('U/A 16+');
  const [formImdbRating, setFormImdbRating] = useState('8.1');
  const [formGenres, setFormGenres] = useState('Action, Drama');
  const [formCast, setFormCast] = useState('');
  const [formPosterUrl, setFormPosterUrl] = useState('');
  const [formBackdropUrl, setFormBackdropUrl] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formRequiredTier, setFormRequiredTier] = useState<'Basic' | 'Super Cinema' | 'IMAX 4K'>('Basic');
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/browse');
      return;
    }
    loadAdminData();
  }, [user]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [dashRes, moviesRes, usersRes] = await Promise.all([
        api.admin.getDashboard(),
        api.admin.getMovies(),
        api.admin.getUsers()
      ]);

      if (dashRes.success) {
        setStats(dashRes.stats);
        setTransactions(dashRes.recentTransactions || []);
        setMemberActions(dashRes.recentMemberActions || []);
      }
      if (moviesRes.success) {
        setMovies(moviesRes.movies);
      }
      if (usersRes.success) {
        setUsers(usersRes.users);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load admin telemetry', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingMovie(null);
    setFormTitle('');
    setFormDescription('');
    setFormReleaseYear('2024');
    setFormDuration('2h 45m');
    setFormRating('U/A 16+');
    setFormImdbRating('8.1');
    setFormGenres('Action, Drama');
    setFormCast('Prabhas, Allu Arjun');
    setFormPosterUrl('https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80');
    setFormBackdropUrl('https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1600&q=80');
    setFormVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    setFormRequiredTier('Basic');
    setFormIsFeatured(false);
    setIsModalOpen(true);
  };

  const openEditModal = (m: Movie) => {
    setEditingMovie(m);
    setFormTitle(m.title);
    setFormDescription(m.description);
    setFormReleaseYear(m.releaseYear.toString());
    setFormDuration(m.duration);
    setFormRating(m.rating);
    setFormImdbRating(m.imdbRating.toString());
    setFormGenres(m.genres.join(', '));
    setFormCast(m.cast ? m.cast.join(', ') : '');
    setFormPosterUrl(m.posterUrl);
    setFormBackdropUrl(m.backdropUrl);
    setFormVideoUrl(m.videoUrl || '');
    setFormRequiredTier(m.requiredTier);
    setFormIsFeatured(Boolean(m.isFeatured));
    setIsModalOpen(true);
  };

  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Movie> = {
        title: formTitle,
        description: formDescription,
        releaseYear: parseInt(formReleaseYear, 10),
        duration: formDuration,
        rating: formRating,
        imdbRating: parseFloat(formImdbRating),
        genres: formGenres.split(',').map((g) => g.trim()).filter(Boolean),
        cast: formCast.split(',').map((c) => c.trim()).filter(Boolean),
        posterUrl: formPosterUrl,
        backdropUrl: formBackdropUrl,
        videoUrl: formVideoUrl,
        requiredTier: formRequiredTier,
        isFeatured: formIsFeatured
      };

      if (editingMovie) {
        await api.admin.updateMovie(editingMovie.id, payload);
        showToast('Movie details updated successfully', 'success');
      } else {
        await api.admin.createMovie(payload);
        showToast('New title ingested into movie catalog', 'success');
      }

      setIsModalOpen(false);
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save movie', 'error');
    }
  };

  const handleDeleteMovie = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this title from runtime.json?')) {
      return;
    }
    try {
      await api.admin.deleteMovie(id);
      showToast('Title deleted from catalog', 'info');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete title', 'error');
    }
  };

  const handleToggleUserStatus = async (targetUser: User) => {
    const nextStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    const confirmMsg =
      nextStatus === 'suspended'
        ? `Are you sure you want to suspend ${targetUser.name}? This will instantly purge all active sessions!`
        : `Reactivate account for ${targetUser.name}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.admin.updateUserStatus(targetUser.id, nextStatus);
      showToast(
        `User ${targetUser.name} marked as ${nextStatus}. Active sessions ${
          nextStatus === 'suspended' ? 'purged' : 'restored'
        }.`,
        nextStatus === 'suspended' ? 'error' : 'success'
      );
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user status', 'error');
    }
  };

  const filteredMovies = movies.filter(
    (m) =>
      m.title.toLowerCase().includes(movieSearch.toLowerCase()) ||
      m.genres.some((g) => g.toLowerCase().includes(movieSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-canvas text-gray-100 flex flex-col selection:bg-gold selection:text-black">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Desk Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-gold/20 text-gold border border-gold/30 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                Operations Center
              </span>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Telemetry Live
              </span>
            </div>
            <h1 className="text-3xl font-extrabold font-cinema text-white mt-1">
              MYbomma Admin Console
            </h1>
          </div>

          <button
            onClick={loadAdminData}
            className="flex items-center gap-2 px-4 py-2 rounded-lg cinema-glass text-xs font-semibold text-gray-300 hover:text-gold hover:border-gold/40 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh State
          </button>
        </div>

        {/* Top Telemetry Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Sessions */}
          <div className="cinema-glass p-5 rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-gray-400 text-xs uppercase font-semibold">
              <span>Active Sessions</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {stats?.activeSessions || 0}
            </div>
            <p className="text-[11px] text-gray-500">Live connected client tokens</p>
          </div>

          {/* Card 2: Active Subscribers */}
          <div className="cinema-glass p-5 rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-gray-400 text-xs uppercase font-semibold">
              <span>Active Subscribers</span>
              <Users className="w-4 h-4 text-gold" />
            </div>
            <div className="text-2xl font-bold text-gold font-mono">
              {stats?.activeSubscribers || 0} / {stats?.totalMembers || 0}
            </div>
            <p className="text-[11px] text-gray-500">Total registered members</p>
          </div>

          {/* Card 3: Platform Revenue */}
          <div className="cinema-glass p-5 rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-gray-400 text-xs uppercase font-semibold">
              <span>Gross Revenue (INR)</span>
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {stats?.formattedRevenue || '₹0'}
            </div>
            <p className="text-[11px] text-gray-500 font-mono">
              {stats?.totalRevenuePaise || 0} paise calculated
            </p>
          </div>

          {/* Card 4: Catalog Inventory */}
          <div className="cinema-glass p-5 rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-gray-400 text-xs uppercase font-semibold">
              <span>Catalog Titles</span>
              <Tv className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {stats?.totalMovies || 0}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400">
              <HardDrive className="w-3 h-3" />
              <span>runtime.json Lock: OK</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'bg-gold text-black shadow-cinema-glow'
                : 'text-gray-400 hover:text-white hover:bg-surface'
            }`}
          >
            <Tv className="w-4 h-4" />
            Movie Inventory ({movies.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'members'
                ? 'bg-gold text-black shadow-cinema-glow'
                : 'text-gray-400 hover:text-white hover:bg-surface'
            }`}
          >
            <Users className="w-4 h-4" />
            Member Ledger ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'transactions'
                ? 'bg-gold text-black shadow-cinema-glow'
                : 'text-gray-400 hover:text-white hover:bg-surface'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Order Audit Log ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'actions'
                ? 'bg-gold text-black shadow-cinema-glow'
                : 'text-gray-400 hover:text-white hover:bg-surface'
            }`}
          >
            <Activity className="w-4 h-4" />
            Activity Monitor ({memberActions.length})
          </button>
        </div>

        {/* Tab 1: Movie Inventory */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter inventory..."
                  value={movieSearch}
                  onChange={(e) => setMovieSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-surface text-xs text-white rounded-lg border border-gray-800 focus:border-gold focus:outline-none"
                />
              </div>

              <button
                onClick={openAddModal}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gold hover:bg-gold-light text-black font-bold text-xs shadow-cinema-glow flex items-center justify-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                Add Cinema Title
              </button>
            </div>

            <div className="cinema-glass rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-surface-elevated text-gray-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Poster</th>
                      <th className="py-3 px-4">Title & Details</th>
                      <th className="py-3 px-4">Genres</th>
                      <th className="py-3 px-4">Tier Access</th>
                      <th className="py-3 px-4">Rating / Views</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredMovies.map((m) => (
                      <tr key={m.id} className="hover:bg-white/5 transition">
                        <td className="py-3 px-4 w-16">
                          <img
                            src={m.posterUrl}
                            alt={m.title}
                            className="w-12 h-16 object-cover rounded-md"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-white text-sm">{m.title}</p>
                          <p className="text-[11px] text-gray-400 font-mono">
                            {m.releaseYear} • {m.duration} • ID: {m.id}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1 flex-wrap">
                            {m.genres.map((g) => (
                              <span key={g} className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">
                                {g}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              m.requiredTier === 'IMAX 4K'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : m.requiredTier === 'Super Cinema'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                : 'bg-gray-800 text-gray-300 border-gray-700'
                            }`}
                          >
                            {m.requiredTier}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span className="text-gold font-bold">{m.imdbRating}</span> ★ •{' '}
                          <span className="text-gray-400">{m.views?.toLocaleString()} views</span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(m)}
                            className="p-1.5 rounded bg-surface hover:bg-surface-hover text-gray-300 hover:text-gold border border-gray-800 transition"
                            title="Edit Title"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMovie(m.id)}
                            className="p-1.5 rounded bg-surface hover:bg-red-950/40 text-gray-300 hover:text-red-400 border border-gray-800 transition"
                            title="Delete Title"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Member Ledger */}
        {activeTab === 'members' && (
          <div className="cinema-glass rounded-2xl border border-white/10 overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold font-cinema text-white">Registered Users & Members</h3>
                <p className="text-xs text-gray-400">
                  Account status toggles instantly invalidate all active sessions upon suspension.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-surface-elevated text-gray-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Subscription Plan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Security Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition">
                      <td className="py-3 px-4">
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{u.id}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{u.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-gold/20 text-gold border border-gold/40'
                              : 'bg-gray-800 text-gray-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-xs text-white">
                          {u.subscription?.planId.replace('PLAN-', '') || 'None'}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {u.subscription?.status === 'active' ? 'Active Entitlement' : 'Inactive'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.status === 'active'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-950 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`px-3 py-1 rounded text-xs font-semibold transition flex items-center gap-1 ml-auto ${
                              u.status === 'active'
                                ? 'bg-red-950/60 text-red-400 hover:bg-red-900 border border-red-500/40'
                                : 'bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900 border border-emerald-500/40'
                            }`}
                          >
                            {u.status === 'active' ? (
                              <>
                                <Lock className="w-3 h-3" /> Suspend
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3 h-3" /> Activate
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Order Audit Log */}
        {activeTab === 'transactions' && (
          <div className="cinema-glass rounded-2xl border border-white/10 overflow-hidden space-y-4 p-6">
            <h3 className="text-base font-bold font-cinema text-white">Audit & Purchase Trail</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-surface-elevated text-gray-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Amount (INR)</th>
                    <th className="py-3 px-4">Payment Rail</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition">
                      <td className="py-3 px-4 font-mono text-gold">{tx.transactionId || tx.id}</td>
                      <td className="py-3 px-4 font-mono text-gray-400">{tx.userId}</td>
                      <td className="py-3 px-4 font-semibold text-white">{tx.planId}</td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        ₹{(tx.amount / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">{tx.paymentMethod}</td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Member Actions Feed (Scenario 8: displays member notes with dangerouslySetInnerHTML) */}
        {activeTab === 'actions' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300">
              Active Member Activity Stream ({memberActions.length} recorded)
            </h3>
            <div className="cinema-glass rounded-xl border border-white/5 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Cinema Title</th>
                    <th className="py-3 px-4">Activity / Watchlist Notes</th>
                    <th className="py-3 px-4">Recorded At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-gray-300">
                  {memberActions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">
                        No member activity logged yet.
                      </td>
                    </tr>
                  ) : (
                    memberActions.map((action, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition">
                        <td className="py-3 px-4 font-semibold text-white">
                          {action.userName}
                        </td>
                        <td className="py-3 px-4 text-gold">
                          {action.movieTitle}
                        </td>
                        <td className="py-3 px-4 text-gray-200">
                          {/* Scenario 8: Secondary Field Notes rendered with dangerouslySetInnerHTML */}
                          <span
                            dangerouslySetInnerHTML={{
                              __html: action.notes || '<span class="text-gray-600">—</span>'
                            }}
                          />
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {new Date(action.addedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Movie Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl cinema-glass rounded-2xl p-6 border border-gold/40 shadow-modal-gold max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-lg font-bold font-cinema text-white">
                {editingMovie ? 'Edit Cinema Title' : 'Ingest New Cinema Title'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMovie} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">
                    Movie Title *
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-surface rounded-lg border border-gray-800 text-sm text-white focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">
                    Required Subscription Tier *
                  </label>
                  <select
                    value={formRequiredTier}
                    onChange={(e) => setFormRequiredTier(e.target.value as any)}
                    className="w-full px-3 py-2 bg-surface rounded-lg border border-gray-800 text-sm text-white focus:border-gold focus:outline-none"
                  >
                    <option value="Basic">Basic (Standard Mobile)</option>
                    <option value="Super Cinema">Super Cinema (1080p HD)</option>
                    <option value="IMAX 4K">IMAX 4K (4K Ultra HD)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">
                  Synopsis / Description *
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-3 py-2 bg-surface rounded-lg border border-gray-800 text-sm text-white focus:border-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">
                    Release Year
                  </label>
                  <input
                    type="number"
                    value={formReleaseYear}
                    onChange={(e) => setFormReleaseYear(e.target.value)}
                    className="w-full px-3 py-2 bg-surface rounded-lg border border-gray-800 text-xs text-white focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-surface rounded-lg border border-gray-800 text-xs text-white focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">
                    Age Rating
                  </label>
                  <input
                    type="text"
                    value={formRating}
                    onChange={(e) => setFormRating(e.target.value)}
                    className="w-full px-3 py-2 bg-surface rounded-lg border border-gray-800 text-xs text-white focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">
                    IMDb Rating
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formImdbRating}
                    onChange={(e) => setFormImdbRating(e.target.value)}
                    className="w-full px-3 py-2 bg-surface rounded-lg border border-gray-800 text-xs text-white focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">
                    Genres (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={formGenres}
                    onChange={(e) => setFormGenres(e.target.value)}
                    placeholder="Action, Drama, Thriller"
                    className="w-full px-3 py-2 bg-surface rounded-lg border border-gray-800 text-xs text-white focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">
                    Lead Cast (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={formCast}
                    onChange={(e) => setFormCast(e.target.value)}
                    placeholder="NTR Jr., Ram Charan"
                    className="w-full px-3 py-2 bg-surface rounded-lg border border-gray-800 text-xs text-white focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">
                  Poster CDN URL * (Strictly External HTTPS)
                </label>
                <input
                  type="url"
                  value={formPosterUrl}
                  onChange={(e) => setFormPosterUrl(e.target.value)}
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 bg-surface rounded-lg border border-gray-800 text-xs text-white focus:border-gold focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">
                  Backdrop CDN URL * (Strictly External HTTPS)
                </label>
                <input
                  type="url"
                  value={formBackdropUrl}
                  onChange={(e) => setFormBackdropUrl(e.target.value)}
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 bg-surface rounded-lg border border-gray-800 text-xs text-white focus:border-gold focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">
                  Video Stream MP4/HLS URL *
                </label>
                <input
                  type="url"
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  required
                  placeholder="https://commondatastorage.googleapis.com/.../movie.mp4"
                  className="w-full px-3 py-2 bg-surface rounded-lg border border-gray-800 text-xs text-white focus:border-gold focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-gold rounded cursor-pointer"
                />
                <label htmlFor="featuredCheck" className="text-xs text-gray-300 cursor-pointer">
                  Feature in Spotlight Carousel Header
                </label>
              </div>

              <div className="pt-4 border-t border-gray-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-gold hover:bg-gold-light text-black font-bold text-xs shadow-cinema-glow transition"
                >
                  {editingMovie ? 'Save Changes' : 'Publish Title'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
