/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#C9A15B',
          dark: '#A67C3E'
        }
      }
    }
  },
  plugins: []
};
