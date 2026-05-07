/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        gc4c: {
          green: '#005F2C',
          dark: '#004D22',
          pale: '#E8F5EE',
        },
      },
    },
  },
  plugins: [],
}
