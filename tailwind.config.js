/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'chip-bg': '#0a0f1a',
      },
    },
  },
  plugins: [],
}
