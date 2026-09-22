import React from 'react';
import { Film, ShieldCheck, Zap, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#040506] border-t border-gray-900 py-12 mt-20 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-gold flex items-center justify-center">
                <Film className="w-4 h-4 text-black" />
              </div>
              <span className="text-xl font-bold font-cinema text-white">
                MY<span className="text-gold">bomma</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              India's premier digital cinema platform. Delivering authentic high-bitrate landmark blockbusters and award-winning Indian masterworks in pristine 4K HDR.
            </p>
          </div>

          {/* Technology & Codecs */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Streaming Engine</h4>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-gold" /> Adaptive Bitrate HLS & DASH
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-gold" /> Dolby Atmos 7.1 Spatial Audio
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-gold" /> 4K Ultra HD & Dolby Vision
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-gold" /> HEVC & AV1 Next-Gen Compression
              </li>
            </ul>
          </div>

          {/* Subscription Plans */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Tier Access</h4>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>Standard Mobile — 720p HD (1 Device)</li>
              <li>Super Cinema — 1080p Full HD (2 Devices)</li>
              <li>MYbomma IMAX 4K — 4K Dolby Atmos (4 Devices)</li>
              <li>Encrypted UPI & Card Billing in INR</li>
            </ul>
          </div>

          {/* Security & Integrity */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Security Architecture</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Gated cinema feeds, HTTP-only signed session tokens, atomic sequential state swaps, and strict RBAC authorization guards.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero Content Leaks Verified</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 gap-4">
          <p>© {new Date().getFullYear()} MYbomma Entertainment Inc. All rights reserved.</p>
          <div className="flex items-center gap-6 text-gray-500">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Content Security</span>
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> India (IN)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
