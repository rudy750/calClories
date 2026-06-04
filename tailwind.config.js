/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e6fff4',
          100: '#b3ffe3',
          500: '#00D97E',
          600: '#00B368',
          700: '#009057',
        },
        dark: {
          950: '#04070F',
          900: '#080B14',
          800: '#0F1525',
          700: '#141D30',
          600: '#1A2540',
          500: '#1E2B4A',
          border: '#1F2D50',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'neon-sm': '0 0 8px rgba(0, 217, 126, 0.3)',
        neon: '0 0 16px rgba(0, 217, 126, 0.4)',
        'neon-lg': '0 0 30px rgba(0, 217, 126, 0.5)',
      },
    },
  },
  plugins: [],
}

