import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Sparkles,
  Tv,
  Film,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Headphones,
  X,
  Star
} from 'lucide-react';
import { MotionFilmReel } from '../components/MotionFilmReel.js';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activePreviewTrailer, setActivePreviewTrailer] = useState<{
    title: string;
    videoUrl: string;
    tier: string;
    synopsis: string;
  } | null>(null);

  // Pan-Indian Blockbuster Marquee Titles with High-Res Posters & Working Streams
  const marqueeTitlesRow1 = [
    {
      title: 'Jawan',
      tier: 'Super Cinema',
      rating: '8.1',
      badge: '4K Ultra HD',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      synopsis: 'A high-octane emotional journey of a man set out to correct the wrongs in Indian society.',
    },
    {
      title: '12th Fail',
      tier: 'Basic',
      rating: '8.9',
      badge: 'Full HD',
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      synopsis: 'The incredible true story of restarting life and conquering civil services against all odds.',
    },
    {
      title: 'RRR (Rise Roar Revolt)',
      tier: 'Basic',
      rating: '7.8',
      badge: 'Dolby Vision',
      poster: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      synopsis: 'A fearless revolutionary and an officer in the British force chart an intrepid path towards freedom.',
    },
    {
      title: 'Kalki 2898 AD',
      tier: 'IMAX 4K',
      rating: '7.6',
      badge: 'IMAX Enhanced',
      poster: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      synopsis: 'An epic dystopian clash set in the post-apocalyptic city of Kasi.',
    },
    {
      title: 'Dangal',
      tier: 'Super Cinema',
      rating: '8.4',
      badge: 'Dolby Atmos',
      poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
      synopsis: 'The legendary tale of fatherly conviction and wrestling champions taking Indian sports to gold.',
    }
  ];

  const marqueeTitlesRow2 = [
    {
      title: 'Pushpa 2: The Rule',
      tier: 'Super Cinema',
      rating: '8.0',
      badge: '4K Ultra HD',
      poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      synopsis: 'The sensational sandalwood empire confronts international kingpins and iron law.',
    },
    {
      title: 'Baahubali 2',
      tier: 'Basic',
      rating: '8.2',
      badge: '4K Ultra HD',
      poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      synopsis: 'Why Kattappa killed Baahubali - the greatest cinematic answer in Indian film history.',
    },
    {
      title: 'Stree 2',
      tier: 'Super Cinema',
      rating: '7.3',
      badge: 'Dolby 5.1',
      poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      synopsis: 'The legendary protectors of Chanderi reunite to defeat a malevolent headless spectre.',
    },
    {
      title: 'Kantara: A Legend',
      tier: 'Basic',
      rating: '8.3',
      badge: '1080p Atmos',
      poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      synopsis: 'Folklore and divine wrath clash with greedy feudal lords in a deep forest enclave.',
    },
    {
      title: 'Manjummel Boys',
      tier: 'IMAX 4K',
      rating: '8.5',
      badge: '4K Dolby Vision',
      poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      synopsis: 'A perilous rescue inside the dreaded Devil’s Kitchen cave that shook the nation.',
    }
  ];

  return (
    <div className="relative min-h-screen bg-canvas text-gray-100 flex flex-col selection:bg-gold selection:text-black">
      <Navbar />

      {/* Hero Motion Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-12 pb-20">
        {/* Canvas Motion Graphics */}
        <MotionFilmReel />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full cinema-glass text-gold border border-gold/40 shadow-cinema-glow animate-fade-in">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-xs font-semibold uppercase tracking-widest">
              Pan-India Masterpieces • National Blockbusters • Theatrical Premieres
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-7xl font-extrabold font-cinema tracking-tight text-white leading-tight">
            The Definitive <br />
            <span className="gold-gradient-text">Indian Cinema Destination.</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-gray-300 leading-relaxed font-light">
            Stream the greatest cinematic masterworks produced across India. From high-octane blockbusters to national award-winning epics in pristine 4K Dolby Vision and Dolby Atmos.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-gold via-gold-light to-sapphire text-black font-bold text-base shadow-cinema-glow hover:scale-105 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Start Streaming Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-full cinema-glass hover:border-gold text-gray-200 font-semibold text-base transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In to Your Account</span>
            </Link>
          </div>

          {/* Security & Access Notice */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2 font-mono">
            <Lock className="w-3.5 h-3.5 text-gold" />
            <span>Encrypted Streams & Member Gated Catalog</span>
          </div>
        </div>
      </section>

      {/* REAL-TIME INFINITE MOTION MARQUEE RIBBONS */}
      <section className="relative py-16 bg-gradient-to-b from-canvas via-surface to-canvas border-y border-gold/15 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-gold text-xs uppercase font-bold tracking-widest justify-center sm:justify-start">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              <span>Real-Time Motion Catalog Visualizer</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-cinema text-white mt-1">
              National Blockbusters Streaming in 4K
            </h2>
          </div>
          <p className="text-xs text-gray-400 max-w-sm text-center sm:text-right">
            Click any movie card to launch an instant high-resolution live trailer preview.
          </p>
        </div>

        {/* Row 1: Left to Right Continuous Marquee */}
        <div className="relative w-full overflow-hidden mb-6">
          <div className="flex w-[200%] animate-marquee gap-5 hover:[animation-play-state:paused]">
            {[...marqueeTitlesRow1, ...marqueeTitlesRow1].map((movie, idx) => (
              <div
                key={idx}
                onClick={() => setActivePreviewTrailer(movie)}
                className="w-56 sm:w-64 shrink-0 cinema-glass rounded-xl overflow-hidden cursor-pointer hover:border-gold/60 transition-all hover:scale-105 duration-300 shadow-lg group relative"
              >
                <div className="aspect-[2/3] w-full overflow-hidden bg-black relative">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-center">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-black/80 text-gold border border-gold/30">
                      {movie.badge}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-gold/90 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <p className="text-xs font-bold text-white truncate group-hover:text-gold transition-colors">
                      {movie.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1 text-gold">
                        <Star className="w-2.5 h-2.5 fill-current" /> {movie.rating}
                      </span>
                      <span>{movie.tier}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Right to Left Continuous Marquee */}
        <div className="relative w-full overflow-hidden">
          <div className="flex w-[200%] animate-marquee-reverse gap-5 hover:[animation-play-state:paused]">
            {[...marqueeTitlesRow2, ...marqueeTitlesRow2].map((movie, idx) => (
              <div
                key={idx}
                onClick={() => setActivePreviewTrailer(movie)}
                className="w-56 sm:w-64 shrink-0 cinema-glass rounded-xl overflow-hidden cursor-pointer hover:border-sapphire/60 transition-all hover:scale-105 duration-300 shadow-lg group relative"
              >
                <div className="aspect-[2/3] w-full overflow-hidden bg-black relative">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-center">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-black/80 text-sapphire-light border border-sapphire/30">
                      {movie.badge}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-sapphire text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <p className="text-xs font-bold text-white truncate group-hover:text-sapphire-light transition-colors">
                      {movie.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1 text-gold">
                        <Star className="w-2.5 h-2.5 fill-current" /> {movie.rating}
                      </span>
                      <span>{movie.tier}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unlock Notice */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="p-6 rounded-2xl cinema-glass border border-gold/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center text-gold shrink-0">
                <Film className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-cinema">
                  All National Premieres Protected Behind Secure Authentication
                </h3>
                <p className="text-xs text-gray-400">
                  Register your account to unlock full movie streams, Dolby Atmos multi-language audio, and personal watchlists.
                </p>
              </div>
            </div>
            <Link
              to="/signup"
              className="px-6 py-2.5 rounded-full bg-gold hover:bg-gold-light text-black font-bold text-xs shadow-cinema-glow transition-all whitespace-nowrap"
            >
              Unlock Catalog Access
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Pillars Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-widest text-gold font-bold">Uncompromising Engineering</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-cinema text-white">
            Built for Audiophiles and Cinephiles
          </h2>
          <p className="text-sm text-gray-400">
            Engineered from the ground up to deliver cinema-grade audio and video bitrates without downscaling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="cinema-glass p-8 rounded-2xl border border-white/5 cinema-glass-hover transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-gold/30 to-gold/10 flex items-center justify-center text-gold">
              <Tv className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-cinema text-white">True 4K UHD & HDR10+</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every frame is encoded at up to 25 Mbps variable bitrate, preserving the director's intended lighting, film grain, and shadow details.
            </p>
          </div>

          <div className="cinema-glass p-8 rounded-2xl border border-white/5 cinema-glass-hover transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sapphire/30 to-sapphire/10 flex items-center justify-center text-sapphire">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-cinema text-white">Dolby Atmos Spatial Audio</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              True 7.1.4 object-based acoustic pass-through lets you feel every thundering beat of mass intro themes and orchestral scores.
            </p>
          </div>

          <div className="cinema-glass p-8 rounded-2xl border border-white/5 cinema-glass-hover transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500/30 to-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-cinema text-white">Zero Buffer CDN Grid</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Edge points of presence across Mumbai, Delhi, Bengaluru, Hyderabad, and Chennai ensure sub-20ms first-frame response.
            </p>
          </div>
        </div>
      </section>

      {/* Subscription Tier Matrix */}
      <section className="py-20 bg-surface/50 border-t border-gold/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs uppercase tracking-widest text-gold font-bold">Subscription Tiers</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-cinema text-white">
              Choose Your Cinema Pass
            </h2>
            <p className="text-sm text-gray-400">
              Transparent pricing calculated in integer paise. No hidden taxes or automatic price hikes.
            </p>
          </div>

          {/* Pricing Deck */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic */}
            <div className="cinema-glass rounded-2xl p-8 border border-white/10 flex flex-col justify-between hover:border-gold/40 transition-all">
              <div className="space-y-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Standard Mobile</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">₹199</span>
                  <span className="text-xs text-gray-400">/ 30 days</span>
                </div>
                <p className="text-xs text-gray-400">Ideal for personal on-the-go streaming on smartphones and tablets.</p>
                <div className="border-t border-gray-800 pt-4 space-y-2.5 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold" />
                    <span>720p HD Quality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold" />
                    <span>1 Simultaneous Screen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold" />
                    <span>Basic Tier Catalog Titles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold" />
                    <span>Stereo Audio</span>
                  </div>
                </div>
              </div>
              <Link
                to="/signup"
                className="mt-8 w-full py-3 rounded-full cinema-glass hover:bg-white/10 text-white font-semibold text-xs text-center border border-white/20 transition"
              >
                Choose Mobile
              </Link>
            </div>

            {/* Super Cinema (Popular) */}
            <div className="cinema-glass rounded-2xl p-8 border-2 border-gold relative flex flex-col justify-between shadow-cinema-glow scale-105 bg-[#10141B]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-gold to-sapphire text-black font-extrabold text-[10px] uppercase tracking-wider">
                Most Popular Choice
              </div>
              <div className="space-y-4">
                <span className="text-xs font-semibold text-gold uppercase tracking-wider">Super Cinema</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">₹499</span>
                  <span className="text-xs text-gray-400">/ 30 days</span>
                </div>
                <p className="text-xs text-gray-400">Full HD cinema streaming on big screens with multi-device flexibility.</p>
                <div className="border-t border-gray-800 pt-4 space-y-2.5 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold" />
                    <span>1080p Full HD High Bitrate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold" />
                    <span>2 Simultaneous Screens (TV & Mobile)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold" />
                    <span>Full Super Cinema Catalog Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold" />
                    <span>Dolby 5.1 Surround Sound</span>
                  </div>
                </div>
              </div>
              <Link
                to="/signup"
                className="mt-8 w-full py-3 rounded-full bg-gold hover:bg-gold-light text-black font-bold text-xs text-center shadow-cinema-glow transition"
              >
                Get Super Cinema
              </Link>
            </div>

            {/* IMAX 4K */}
            <div className="cinema-glass rounded-2xl p-8 border border-white/10 flex flex-col justify-between hover:border-gold/40 transition-all">
              <div className="space-y-4">
                <span className="text-xs font-semibold text-gold-light uppercase tracking-wider">MYbomma IMAX 4K</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">₹799</span>
                  <span className="text-xs text-gray-400">/ 30 days</span>
                </div>
                <p className="text-xs text-gray-400">The definitive theatre immersion. Unlocked access to every title.</p>
                <div className="border-t border-gray-800 pt-4 space-y-2.5 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold" />
                    <span>4K Ultra HD + HDR10 / Dolby Vision</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold" />
                    <span>4 Simultaneous Screens</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold" />
                    <span>All Exclusive IMAX 4K Premieres</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold" />
                    <span>Dolby Atmos Acoustic Audio</span>
                  </div>
                </div>
              </div>
              <Link
                to="/signup"
                className="mt-8 w-full py-3 rounded-full cinema-glass hover:bg-white/10 text-white font-semibold text-xs text-center border border-white/20 transition"
              >
                Choose IMAX 4K
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE TRAILER PREVIEW MODAL */}
      {activePreviewTrailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-2xl cinema-glass rounded-2xl overflow-hidden border border-gold/40 shadow-modal-gold">
            <button
              onClick={() => setActivePreviewTrailer(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/70 hover:bg-black text-gray-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-video w-full bg-black">
              <video
                src={activePreviewTrailer.videoUrl}
                autoPlay
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold font-cinema text-white">
                  {activePreviewTrailer.title}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-gold/20 text-gold border border-gold/30">
                  {activePreviewTrailer.tier}
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {activePreviewTrailer.synopsis}
              </p>
              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => setActivePreviewTrailer(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    setActivePreviewTrailer(null);
                    navigate('/signup');
                  }}
                  className="px-6 py-2 rounded-full bg-gold hover:bg-gold-light text-black font-bold text-xs shadow-cinema-glow transition"
                >
                  Register to Watch Full Film
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
