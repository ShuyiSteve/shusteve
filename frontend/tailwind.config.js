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
          light: '#FFF5F0',
          dark: '#0A0E1E',
        },
        // Card background in dark mode — a step lighter than paper-dark.
        surface: {
          dark: '#11172C',
        },
        // Brand accents: coral in light mode, blue in dark mode.
        // `ink` variants are dark/light enough to be readable as text.
        coral: {
          DEFAULT: '#FF8F70',
          ink: '#C4532F',
          soft: '#FFE7DE',
        },
        azure: {
          DEFAULT: '#2E6BFF',
          ink: '#8FB0FF',
          soft: '#18244D',
        },
      },
    },
  },
  plugins: [typography],
}
