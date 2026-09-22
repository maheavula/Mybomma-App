import React, { useState, useEffect } from 'react';
import { User as UserIcon, CreditCard, Sparkles, Settings, Bookmark, Trash2, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { useWatchlist } from '../context/WatchlistContext.js';
import { BillingOrder } from '../types/index.js';

export const AccountPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const { watchlist, removeFromWatchlist } = useWatchlist();

  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'watchlist'>('profile');

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [defaultAudio, setDefaultAudio] = useState(user?.preferences?.defaultAudio || 'Telugu [Original]');
  const [autoPlayNext, setAutoPlayNext] = useState(user?.preferences?.autoPlayNext ?? true);
  const [isSaving, setIsSaving] = useState(false);

  // Billing state
  const [billingOrders, setBillingOrders] = useState<BillingOrder[]>([]);
  const [loadingBilling, setLoadingBilling] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setDefaultAudio(user.preferences?.defaultAudio || 'Telugu [Original]');
      setAutoPlayNext(user.preferences?.autoPlayNext ?? true);
    }
    loadBilling();
  }, [user]);

  const loadBilling = async () => {
    try {
      setLoadingBilling(true);
      const res = await api.user.getBilling();
      if (res.success && res.billing?.orders) {
        setBillingOrders(res.billing.orders);
      }
    } catch (err) {
      console.error('Failed to load billing history:', err);
    } finally {
      setLoadingBilling(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await api.user.updateProfile({
        name,
        phone,
        preferences: {
          defaultAudio,
          autoPlayNext
        }
      });
      if (res.success) {
        showToast('Profile and streaming preferences updated', 'success');
        await refreshUser();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to turn off automatic renewal for your subscription?')) {
      return;
    }
    try {
      const res = await api.subscriptions.cancel();
      if (res.success) {
        showToast('Auto-renewal canceled. Access remains active until billing period ends.', 'info');
        await refreshUser();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel subscription', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-gray-100 flex flex-col selection:bg-gold selection:text-black">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-cinema text-white">Member Dashboard</h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage your credentials, streaming preferences, and billing records.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-gray-800 pb-4 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'profile'
                ? 'bg-gold text-black shadow-cinema-glow'
                : 'text-gray-400 hover:text-white hover:bg-surface'
            }`}
          >
            <Settings className="w-4 h-4" />
            Profile & Playback
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'billing'
                ? 'bg-gold text-black shadow-cinema-glow'
                : 'text-gray-400 hover:text-white hover:bg-surface'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Billing & Invoices
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'watchlist'
                ? 'bg-gold text-black shadow-cinema-glow'
                : 'text-gray-400 hover:text-white hover:bg-surface'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            My Watchlist ({watchlist.length})
          </button>
        </div>

        {/* Tab 1: Profile & Preferences */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Active Membership Card */}
            <div className="md:col-span-1 space-y-6">
              <div className="cinema-glass rounded-2xl p-6 border border-gold/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Plan</h3>
                    <p className="text-xs text-gold font-semibold">
                      {user?.subscription?.planId.replace('PLAN-', '') || 'None'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-300 border-t border-gray-800 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="capitalize font-semibold text-emerald-400">
                      {user?.subscription?.status || 'Active'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expires:</span>
                    <span>
                      {user?.subscription?.expiresAt
                        ? new Date(user.subscription.expiresAt).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Role Scope:</span>
                    <span className="uppercase text-gold font-mono">{user?.role}</span>
                  </div>
                </div>

                {user?.subscription?.status === 'active' && (
                  <button
                    onClick={handleCancelSubscription}
                    className="mt-5 w-full py-2 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition"
                  >
                    Cancel Auto-Renewal
                  </button>
                )}
              </div>
            </div>

            {/* Right: Profile Edit Form */}
            <div className="md:col-span-2">
              <div className="cinema-glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-base font-bold font-cinema text-white mb-4">Account Preferences</h3>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-surface rounded-xl border border-gray-800 text-sm text-white focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                      Email Address (Locked)
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-2.5 bg-surface/50 rounded-xl border border-gray-800 text-sm text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9988776655"
                      className="w-full px-4 py-2.5 bg-surface rounded-xl border border-gray-800 text-sm text-white focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-800">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                      Default Audio Language
                    </label>
                    <select
                      value={defaultAudio}
                      onChange={(e) => setDefaultAudio(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface rounded-xl border border-gray-800 text-sm text-white focus:border-gold focus:outline-none"
                    >
                      <option value="Telugu [Original]">Telugu [Original] (Dolby Atmos 5.1)</option>
                      <option value="Hindi (5.1)">Hindi (5.1 Dubbed)</option>
                      <option value="Tamil (Stereo)">Tamil (Stereo)</option>
                      <option value="Kannada (Stereo)">Kannada (Stereo)</option>
                      <option value="Malayalam (Stereo)">Malayalam (Stereo)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="autoPlay"
                      checked={autoPlayNext}
                      onChange={(e) => setAutoPlayNext(e.target.checked)}
                      className="w-4 h-4 accent-gold rounded cursor-pointer"
                    />
                    <label htmlFor="autoPlay" className="text-xs text-gray-300 cursor-pointer">
                      Auto-play next recommended episode / blockbuster trailer
                    </label>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs shadow-cinema-glow transition flex items-center gap-2 disabled:opacity-60"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Billing & Invoices */}
        {activeTab === 'billing' && (
          <div className="cinema-glass rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-base font-bold font-cinema text-white mb-2">Billing Ledger</h3>
            <p className="text-xs text-gray-400 mb-4">
              All transactions are recorded with integer paise precision and mapped to valid transaction IDs.
            </p>

            {billingOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No past billing transactions recorded.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-surface-elevated text-gray-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Transaction ID</th>
                      <th className="py-3 px-4">Plan Name</th>
                      <th className="py-3 px-4">Amount (INR)</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {billingOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/5 transition">
                        <td className="py-3 px-4 font-mono text-gold">{order.transactionId}</td>
                        <td className="py-3 px-4 font-semibold text-white">{order.planName}</td>
                        <td className="py-3 px-4 font-mono font-bold text-white">₹{order.amountRupees}</td>
                        <td className="py-3 px-4">{order.paymentMethod}</td>
                        <td className="py-3 px-4 text-gray-400">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-semibold">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Watchlist */}
        {activeTab === 'watchlist' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-cinema text-white">Saved Cinema Titles</h3>
            {watchlist.length === 0 ? (
              <div className="cinema-glass rounded-2xl p-12 text-center border border-gray-800 text-gray-400">
                <Bookmark className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-sm">Your watchlist is empty.</p>
                <p className="text-xs text-gray-500 mt-1">Browse titles and tap "+" to save for later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {watchlist.map((item) => (
                  <div
                    key={item.movieId}
                    className="cinema-glass rounded-xl p-3 flex gap-3 border border-white/10 hover:border-gold/40 transition group"
                  >
                    <img
                      src={item.movie.posterUrl}
                      alt={item.movie.title}
                      className="w-16 h-24 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="text-sm font-semibold text-white group-hover:text-gold transition-colors line-clamp-1">
                          {item.movie.title}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {item.movie.releaseYear} • {item.movie.requiredTier}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-gray-400">
                          {item.progressSeconds > 0
                            ? `Watched ${Math.floor(item.progressSeconds / 60)}m`
                            : 'Not started'}
                        </span>
                        <button
                          onClick={() => removeFromWatchlist(item.movieId)}
                          className="p-1.5 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
