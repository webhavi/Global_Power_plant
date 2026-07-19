/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8eccff',
          400: '#59b0ff',
          500: '#3b8eff',
          600: '#1b65f5',
          700: '#1450e1',
          800: '#1741b6',
          900: '#193a8f',
          950: '#142557',
        },
        dark: {
          50: '#f6f6f7',
          100: '#e1e2e4',
          200: '#c3c4c8',
          300: '#9ea0a5',
          400: '#7a7c83',
          500: '#5f6169',
          600: '#4b4d54',
          700: '#3e4045',
          800: '#2d2e33',
          900: '#1a1b1f',
          950: '#0d0e10',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
