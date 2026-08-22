import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['"New York"', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      maxWidth: {
        content: '1120px',
      },
      colors: {
        paper: {
          light: '#fafaf9',
          dark: '#0a0a0b',
        },
      },
    },
  },
  plugins: [typography],
}
