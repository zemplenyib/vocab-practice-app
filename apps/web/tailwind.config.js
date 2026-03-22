/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f0e0c',
        card: '#1a1916',
        'card-hover': '#201f1c',
        border: '#2e2c28',
        'border-accent': '#3d3a34',
        primary: '#f0ead8',
        secondary: '#8a8070',
        muted: '#4a4540',
        gold: '#c9a84c',
        'gold-dim': '#7a6530',
        'new-color': '#5b8dd9',
        'learning-color': '#c9a84c',
        'mastered-color': '#6bab7c',
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
