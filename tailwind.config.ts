import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FBF8F3',
        'canvas-2': '#F5EFE4',
        'canvas-3': '#EFE7D9',
        ink: '#1A1714',
        'ink-2': '#5B5248',
        'ink-3': '#8C8175',
        gold: '#B08D57',
        'gold-deep': '#8C6E42',
        'gold-soft': '#E0CDA9',
        'gold-pale': '#F3EADA',
        line: '#E6DCCB',
        wine: '#6B2436',
        forest: '#274037',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Jost', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        label: '0.22em',
        wider2: '0.14em',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(26,23,20,.04), 0 12px 32px -12px rgba(26,23,20,.14)',
        lift: '0 2px 4px rgba(26,23,20,.05), 0 28px 60px -22px rgba(26,23,20,.28)',
        inset: 'inset 0 0 0 1px rgba(176,141,87,.28)',
      },
      keyframes: {
        rise: { '0%': { opacity: '0', transform: 'translateY(18px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fade: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-500px 0' }, '100%': { backgroundPosition: '500px 0' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        drawerIn: { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(0)' } },
        pop: { '0%': { transform: 'scale(.94)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      },
      animation: {
        rise: 'rise .7s cubic-bezier(.16,.84,.44,1) both',
        fade: 'fade .8s ease both',
        shimmer: 'shimmer 1.6s linear infinite',
        marquee: 'marquee 32s linear infinite',
        drawerIn: 'drawerIn .38s cubic-bezier(.16,.84,.44,1) both',
        pop: 'pop .28s cubic-bezier(.16,.84,.44,1) both',
      },
    },
  },
  plugins: [],
};
export default config;
