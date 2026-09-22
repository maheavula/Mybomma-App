import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Lock, Mail, User as UserIcon, Phone, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      await signup({ name, email, password, phone });
      // Redirect to plans to choose subscription tier
      navigate('/plans');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-gray-100 flex flex-col justify-center items-center px-4 relative overflow-hidden py-12">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-lg bg-gold flex items-center justify-center shadow-cinema-glow">
            <Film className="w-5 h-5 text-black" />
          </div>
          <span className="text-3xl font-bold font-cinema tracking-wider text-white">
            MY<span className="text-gold">bomma</span>
          </span>
        </Link>
        <p className="text-xs text-gray-400 mt-2">Create your cinema membership account</p>
      </div>

      {/* Signup Card */}
      <div className="w-full max-w-md cinema-glass rounded-2xl p-8 border border-gold/30 shadow-2xl relative z-10">
        <h2 className="text-xl font-bold font-cinema text-white mb-1">Create Account</h2>
        <p className="text-xs text-gray-400 mb-6">Unlock unrestricted Tollywood & Indian Cinema streaming</p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ravi Teja"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-surface text-sm text-gray-100 rounded-xl border border-gray-800 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ravi@cinema.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-surface text-sm text-gray-100 rounded-xl border border-gray-800 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 bg-surface text-sm text-gray-100 rounded-xl border border-gray-800 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
              Password (Min. 8 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full pl-10 pr-11 py-2.5 bg-surface text-sm text-gray-100 rounded-xl border border-gray-800 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold p-1 focus:outline-none transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1">
            <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
            <span>Encrypted passwords via bcrypt with salted rounds.</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-black font-bold text-sm shadow-cinema-glow hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-60 mt-4"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-gold font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
