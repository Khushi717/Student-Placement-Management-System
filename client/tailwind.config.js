/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 50: '#eef3fb', 100: '#d9e4f5', 200: '#b3c9ea', 300: '#85a6d9', 400: '#5580c4', 500: '#3563ab', 600: '#264d8c', 700: '#1d3b6e', 800: '#162d54', 900: '#0f2142', 950: '#0a1630' },
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'] },
      boxShadow: { card: '0 1px 2px rgba(15,33,66,.06), 0 4px 16px rgba(15,33,66,.06)' },
    },
  },
  plugins: [],
};
