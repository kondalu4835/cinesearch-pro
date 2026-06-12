/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Bebas Neue', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        dark: {
          50:  '#f8f8f8',
          100: '#e8e8e8',
          200: '#c8c8c8',
          300: '#a8a8a8',
          400: '#888888',
          500: '#686868',
          600: '#484848',
          700: '#282828',
          800: '#181818',
          900: '#0f0f0f',
          950: '#080808',
        },
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'fade-up':    'fadeUp 0.5s ease-out',
        'slide-left': 'slideLeft 0.4s ease-out',
        'shimmer':    'shimmer 1.8s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'float':      'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeUp:    { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideLeft: { '0%': { opacity: '0', transform: 'translateX(24px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-16px)' } },
      },
      backgroundImage: {
        'hero-gradient':  'linear-gradient(to right, #080808 40%, transparent 100%)',
        'card-gradient':  'linear-gradient(to top, #080808 0%, rgba(8,8,8,0.6) 50%, transparent 100%)',
        'gold-gradient':  'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
        'dark-gradient':  'linear-gradient(180deg, #080808 0%, #0f0f0f 100%)',
      },
    },
  },
  plugins: [],
};
