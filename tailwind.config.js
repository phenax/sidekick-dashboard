const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        primary: ['Oxanium', ...defaultTheme.fontFamily.sans],
        primarybold: ['OxaniumBold', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        purple: '#442fa7',
        dark: {
          700: '#1f1c29',
          800: '#0f0c19',
          900: '#000207',
        },
      },
    },
  },
  plugins: [],
}
