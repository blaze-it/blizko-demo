import daisyui from 'daisyui'
import type { Config } from 'tailwindcss'
import animatePlugin from 'tailwindcss-animate'
import radixPlugin from 'tailwindcss-radix'
import { extendedTheme } from './src/utils/extended-theme.ts'

export default {
	content: [
		'./index.html',
		'./src/**/*.{ts,tsx,jsx,js}',
		'node_modules/@zach.codes/react-calendar/dist/**/*.js',
	],
	darkMode: 'class',
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: extendedTheme,
	},
	// DaisyUI v5 requires passing options directly to the plugin call
	plugins: [
		animatePlugin,
		radixPlugin,
		daisyui({
			// Use "all" to include all built-in themes
			// Custom themes temporarily disabled due to daisyUI v5 + Tailwind v3 compatibility issue
			themes: 'all',
			logs: true,
		}),
	],
} satisfies Config
