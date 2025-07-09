/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: [],
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    colors: {
      primary: '#1DA1F2',
      secondary: '#14171A',
      accent: '#657786',
      background: '#FFFFFF',
      text: '#000000',
      muted: '#AAB8C2',
      'muted-foreground': '#657786',
      'yellow-400': '#FFAD1F',
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
      mono: ['Menlo', 'monospace'],
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
