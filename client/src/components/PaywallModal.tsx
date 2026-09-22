import React from 'react';
import { Lock, Sparkles, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types/index.js';

interface PaywallModalProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
  userPlanId?: string;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  movie,
  isOpen,
  onClose,
  userPlanId = 'PLAN-BASIC',
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const currentTierName = userPlanId.includes('4K')
    ? 'MYbomma IMAX 4K'
    : userPlanId.includes('PREMIUM')
    ? 'Super Cinema'
    : 'Standard Mobile';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg cinema-glass rounded-2xl p-8 border border-gold/40 shadow-modal-gold text-center overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white bg-surface hover:bg-surface-hover transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-gold to-saffron flex items-center justify-center mb-6 shadow-cinema-glow">
          <Lock className="w-8 h-8 text-black" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold font-cinema text-white mb-2">
          Subscription Upgrade Required
        </h2>

        <p className="text-sm text-gray-300 leading-relaxed mb-6">
          <span className="font-semibold text-gold">"{movie.title}"</span> is an exclusive{' '}
          <span className="font-bold text-amber-300">{movie.requiredTier}</span> release. Your current plan is{' '}
          <span className="font-medium text-gray-400">{currentTierName}</span>.
        </p>

        {/* Benefits Grid */}
        <div className="bg-surface/80 rounded-xl p-4 mb-6 text-left border border-white/5 space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs text-gray-200">
            <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
            <span>Instant access to all {movie.requiredTier} movies and future premieres</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gray-200">
            <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
            <span>Multi-device simultaneous streams & offline playback support</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gray-200">
            <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
            <span>Uncompressed Dolby Atmos 7.1 audio pass-through & 4K HDR</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              onClose();
              navigate('/plans');
            }}
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-gold to-gold-dark text-black font-bold text-sm shadow-cinema-glow hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Upgrade to {movie.requiredTier}
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-full text-sm font-semibold text-gray-400 hover:text-white transition"
          >
            Back to Browse
          </button>
        </div>
      </div>
    </div>
  );
};
