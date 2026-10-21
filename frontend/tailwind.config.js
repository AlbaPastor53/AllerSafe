/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF385C',
          dark: '#E31C5F'
        }
      }
    }
  },
  plugins: []
};
