import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Tv, ShieldCheck, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { CheckoutModal } from '../components/CheckoutModal.js';
import { Plan } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const PlansPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await api.subscriptions.getPlans();
      if (res.success) {
        setPlans(res.plans);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setCheckoutOpen(true);
  };

  const currentPlanId = user?.subscription?.planId;

  return (
    <div className="min-h-screen bg-canvas text-gray-100 flex flex-col selection:bg-gold selection:text-black">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full cinema-glass text-gold border border-gold/30 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Transparent Pricing
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-cinema text-white">
            Choose Your Streaming Tier
          </h1>
          <p className="text-sm text-gray-400">
            All plans feature zero advertising, unlimited catalog access, and instant high-bitrate streaming.
          </p>
        </div>

        {/* Current Active Plan Banner */}
        {user?.subscription && (
          <div className="max-w-4xl mx-auto mb-10 p-4 rounded-xl cinema-glass border border-gold/30 flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-xs text-gray-400">Current Active Membership:</span>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <span className="text-gold">
                  {user.subscription.planId.replace('PLAN-', '')}
                </span>
                <span className="text-xs font-normal text-emerald-400">
                  (Expires: {new Date(user.subscription.expiresAt).toLocaleDateString()})
                </span>
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              Active Entitlement
            </span>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            const isFeatured = plan.id === 'PLAN-PREMIUM-HD' || plan.id === 'PLAN-ULTRA-4K';

            return (
              <div
                key={plan.id}
                className={`cinema-glass rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  isFeatured
                    ? 'border-2 border-gold shadow-cinema-glow bg-[#131518]'
                    : 'border border-white/10 hover:border-gold/40'
                }`}
              >
                {plan.id === 'PLAN-PREMIUM-HD' && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-gold to-saffron text-black font-extrabold text-[10px] uppercase tracking-wider">
                    Recommended
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-bold font-cinema text-white">{plan.name}</h3>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gold">{plan.formattedPrice}</span>
                    <span className="text-xs text-gray-400">/ {plan.validityDays} days</span>
                  </div>

                  <p className="text-xs text-gray-400 font-mono">
                    Calculated precisely as {plan.price} paise
                  </p>

                  <div className="border-t border-gray-800 pt-5 space-y-3 text-xs text-gray-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                      <span>Resolution: {plan.resolution}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                      <span>Simultaneous Screens: {plan.screens}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                      <span>Complete Access to {plan.name} titles</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                      <span>Adaptive bitrate zero-buffer playback</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrent}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                      isCurrent
                        ? 'bg-gray-800 text-gray-400 cursor-default border border-gray-700'
                        : isFeatured
                        ? 'bg-gradient-to-r from-gold to-gold-dark text-black hover:brightness-110 shadow-cinema-glow'
                        : 'cinema-glass hover:bg-white/10 text-white border border-white/20'
                    }`}
                  >
                    {isCurrent ? (
                      <span>Current Active Plan</span>
                    ) : (
                      <>
                        <span>{user?.subscription ? 'Upgrade to This Plan' : 'Select Plan'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Checkout Modal */}
      {selectedPlan && (
        <CheckoutModal
          plan={selectedPlan}
          isOpen={checkoutOpen}
          onClose={() => {
            setCheckoutOpen(false);
            setSelectedPlan(null);
          }}
          onSuccess={() => {
            refreshUser();
          }}
        />
      )}

      <Footer />
    </div>
  );
};
