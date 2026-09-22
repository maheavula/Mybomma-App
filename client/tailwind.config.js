/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#05070B', // Midnight Deep Obsidian
          deep: '#020305',
          subtle: '#090C12'
        },
        surface: {
          DEFAULT: '#0D1117', // Smoked Obsidian Glass
          elevated: '#131923',
          charcoal: '#1A212D',
          hover: '#222B3B'
        },
        gold: {
          DEFAULT: '#F3D088', // Champagne Platinum
          light: '#FAF1D6',
          dark: '#C99E47',
          glow: 'rgba(243, 208, 136, 0.25)'
        },
        sapphire: {
          DEFAULT: '#2563EB', // Royal Electric Sapphire
          light: '#60A5FA',
          dark: '#1D4ED8',
          glow: 'rgba(37, 99, 235, 0.25)'
        },
        ruby: {
          DEFAULT: '#E11D48', // Velvet Ruby Accent
          light: '#FB7185',
          dark: '#BE123C'
        },
        status: {
          active: '#10B981',
          danger: '#EF4444',
          warning: '#F59E0B'
        }
      },
      fontFamily: {
        cinema: ['Cinzel', 'Playfair Display', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif']
      },
      boxShadow: {
        'cinema-glow': '0 0 35px -5px rgba(243, 208, 136, 0.25)',
        'sapphire-glow': '0 0 35px -5px rgba(37, 99, 235, 0.35)',
        'cinema-subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.8)',
        'modal-gold': '0 0 50px rgba(243, 208, 136, 0.15), 0 20px 40px -10px rgba(0,0,0,0.9)'
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flare': 'flare 6s ease-in-out infinite alternate',
        'float': 'float 4s ease-in-out infinite',
        'marquee': 'marquee 35s linear infinite',
        'marquee-reverse': 'marquee-reverse 35s linear infinite',
      },
      keyframes: {
        flare: {
          '0%': { transform: 'scale(1) rotate(0deg)', opacity: '0.4' },
          '100%': { transform: 'scale(1.15) rotate(5deg)', opacity: '0.7' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' }
        }
      }
    },
  },
  plugins: [],
}
