/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007BFF',
          dark: '#0056b3',
          light: '#e6f0ff'
        },
        secondary: {
          orange: '#F59E0B',
          yellow: '#FFD700'
        },
        neutral: {
          background: '#F8FAFC',
          card: '#FFFFFF',
          input: '#F1F5F9'
        },
        dark: {
          background: '#1a1a1a',
          card: '#2d2d2d',
          text: '#e5e5e5'
        }
      }
    }
  },
  plugins: []
};
