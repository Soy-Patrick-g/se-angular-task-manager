/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  safelist: ["flex", "min-h-screen", "min-w-0", "flex-1", "items-center"],
  theme: {
    extend: {},
  },
  plugins: [],
}

