/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: ['./src/**/*.{ts,tsx,js,jsx}', './app/**/*.{ts,tsx,js,jsx}', './components/**/*.{ts,tsx,js,jsx}'],
	theme: {
		extend: {
			colors: {
				primary: '#ffee37',
				'primary-foreground': '#232326',
				secondary: '#01339b',
				'secondary-foreground': '#f4f4f5',
				accent: '#009bfe',
				'accent-foreground': '#f4f4f5',
				destructive: '#F86403',
				background: '#18181b',
				foreground: '#f4f4f5',
				muted: '#1e2938',
				'muted-foreground': '#a1a1aa',
				card: '#232326',
				'card-foreground': '#f4f4f5',
				border: '#1e2938',
				ring: '#ffee37',
				zinc: require('tailwindcss/colors').zinc,
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				serif: ['Merriweather', 'serif'],
				mono: ['Menlo', 'monospace'],
			},
		},
	},
	plugins: [],
}
