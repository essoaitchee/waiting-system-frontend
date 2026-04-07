/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d9efff',
          200: '#bce0ff',
          300: '#8eccff',
          400: '#58b0ff',
          500: '#2c8bf7',
          600: '#1d6fe4',
          700: '#1758d0',
          800: '#1946a7',
          900: '#1b3c83',
        },
        ink: '#0f172a',
        surface: '#f8fafc',
      },
      fontFamily: {
        sans: ['"Manrope"', '"Pretendard Variable"', '"Noto Sans KR"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        soft: '0 20px 60px rgba(15, 23, 42, 0.08)',
        panel: '0 12px 30px rgba(15, 23, 42, 0.07)',
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.06) 1px, transparent 1px)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 1.8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
