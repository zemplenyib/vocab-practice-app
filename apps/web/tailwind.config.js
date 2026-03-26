/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#f5f2eb',
        card: '#fffef9',
        'card-hover': '#f0ece2',
        border: '#ddd8cc',
        'border-accent': '#c4bdb0',
        primary: '#1c1a16',
        secondary: '#6b6459',
        muted: '#a89f94',
        gold: '#a07820',
        'gold-dim': '#f0e4c4',
        'new-color': '#7c4db8',
        'learning-color': '#2a8a7a',
        'mastered-color': '#2e8a4a',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        mono: ['Geist Mono', 'monospace'],
        sans: ['Geist', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease both',
        'fade-in': 'fadeIn 0.3s ease both',
      },
    },
  },
  plugins: [],
};
