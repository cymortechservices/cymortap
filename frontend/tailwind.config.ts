import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#04070f', 900: '#070c1a', 850: '#0a1224', 800: '#0e1830', 700: '#16254a', 600: '#21365f' },
        tap: { 300: '#7dd3fc', 400: '#38bdf8', 500: '#22d3ee', 600: '#3b82f6' },
        mist: { 100: '#e8f1ff', 300: '#b4c7e4', 500: '#8aa0c2', 700: '#5d7399' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(56,189,248,.25), 0 10px 40px -10px rgba(34,211,238,.35)',
        panel: '0 20px 60px -30px rgba(0,0,0,.8)',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: { float: 'float 7s ease-in-out infinite', shimmer: 'shimmer 1.6s infinite' },
    },
  },
  plugins: [],
};
export default config;
