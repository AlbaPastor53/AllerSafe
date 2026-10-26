/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#C6A15B',
          dark: '#A98543'
        }
      }
    }
  },
  plugins: []
};
