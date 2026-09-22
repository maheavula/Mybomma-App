import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Search, User as UserIcon, Shield, LogOut, ChevronDown, Sparkles, Bookmark, Tv } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface NavbarProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch, searchQuery = '' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-canvas/90 backdrop-blur-md border-b border-gold/15 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to={user ? '/browse' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold to-saffron flex items-center justify-center shadow-cinema-glow group-hover:scale-105 transition-transform">
                <Film className="w-5 h-5 text-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-wider font-cinema text-white flex items-center gap-1">
                  MY<span className="text-gold">bomma</span>
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-gray-400 font-sans -mt-1">
                  Cinema Stream
                </span>
              </div>
            </Link>

            {/* Authenticated Links */}
            {user && (
              <div className="hidden md:flex items-center gap-6">
                <Link
                  to="/browse"
                  className="text-sm font-medium text-gray-300 hover:text-gold transition-colors flex items-center gap-1.5"
                >
                  <Tv className="w-4 h-4" />
                  Browse
                </Link>
                <Link
                  to="/plans"
                  className="text-sm font-medium text-gray-300 hover:text-gold transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-gold" />
                  Plans
                </Link>
                <Link
                  to="/account"
                  className="text-sm font-medium text-gray-300 hover:text-gold transition-colors flex items-center gap-1.5"
                >
                  <Bookmark className="w-4 h-4" />
                  Watchlist
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-xs font-semibold px-2.5 py-1 rounded bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25 transition-all flex items-center gap-1"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin Desk
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Center Search (Only when logged in) */}
          {user && onSearch && (
            <div className="hidden sm:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Indian cinema, stars (SRK, Prabhas, Aamir...), genres..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface text-sm text-gray-100 rounded-full border border-gray-800 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/50 transition-all placeholder-gray-500"
                />
              </div>
            </div>
          )}

          {/* Right Action Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 p-1.5 rounded-full bg-surface border border-gray-800 hover:border-gold/40 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gold/40 to-sapphire/40 flex items-center justify-center text-gold font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline text-sm font-medium text-gray-200 pr-1">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400 pr-1" />
                </button>

                {/* Profile Dropdown */}
                {dropdownOpen && (
                  <div
                    onMouseLeave={() => setDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 cinema-glass rounded-xl shadow-2xl py-2 z-50 border border-gold/20 animate-fade-in"
                  >
                    <div className="px-4 py-2.5 border-b border-gray-800/80">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-gold/20 text-gold border border-gold/30">
                        {user.subscription?.planId?.replace('PLAN-', '') || 'Free Member'}
                      </span>
                    </div>

                    <Link
                      to="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:text-gold hover:bg-white/5 transition"
                    >
                      <UserIcon className="w-4 h-4" />
                      Account & Billing
                    </Link>

                    <Link
                      to="/plans"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:text-gold hover:bg-white/5 transition"
                    >
                      <Sparkles className="w-4 h-4 text-gold" />
                      Change Subscription
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gold hover:bg-white/5 transition border-t border-gray-800/80"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Console
                      </Link>
                    )}

                    <div className="border-t border-gray-800/80 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-300 hover:text-gold px-4 py-2 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-semibold px-5 py-2.5 rounded-full bg-gradient-to-r from-gold to-gold-dark text-black hover:brightness-110 shadow-cinema-glow transition-all"
                >
                  Start Streaming
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
