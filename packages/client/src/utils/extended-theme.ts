import type { Config } from 'tailwindcss'

export const extendedTheme = {
	colors: {
		border: 'var(--border)',
		input: {
			DEFAULT: 'var(--input)',
			invalid: 'var(--input-invalid)',
		},
		ring: {
			DEFAULT: 'var(--ring)',
			invalid: 'var(--foreground-destructive)',
		},
		background: 'var(--background)',
		foreground: {
			DEFAULT: 'var(--foreground)',
			destructive: 'var(--foreground-destructive)',
		},
		primary: {
			DEFAULT: 'var(--primary)',
			foreground: 'var(--primary-foreground)',
		},
		secondary: {
			DEFAULT: 'var(--secondary)',
			foreground: 'var(--secondary-foreground)',
		},
		destructive: {
			DEFAULT: 'var(--destructive)',
			foreground: 'var(--destructive-foreground)',
		},
		muted: {
			DEFAULT: 'var(--muted)',
			foreground: 'var(--muted-foreground)',
		},
		accent: {
			DEFAULT: 'var(--accent)',
			foreground: 'var(--accent-foreground)',
		},
		popover: {
			DEFAULT: 'var(--popover)',
			foreground: 'var(--popover-foreground)',
		},
		card: {
			DEFAULT: 'var(--card)',
			foreground: 'var(--card-foreground)',
		},
		sidebar: {
			DEFAULT: 'var(--sidebar-background)',
			foreground: 'var(--sidebar-foreground)',
			primary: 'var(--sidebar-primary)',
			'primary-foreground': 'var(--sidebar-primary-foreground)',
			accent: 'var(--sidebar-accent)',
			'accent-foreground': 'var(--sidebar-accent-foreground)',
			border: 'var(--sidebar-border)',
			ring: 'var(--sidebar-ring)',
		},
		// Blizko Extended Palette
		terracotta: {
			DEFAULT: 'var(--terracotta)',
			light: 'var(--terracotta-light)',
			dark: 'var(--terracotta-dark)',
		},
		coral: {
			DEFAULT: 'var(--coral)',
			light: 'var(--coral-light)',
			dark: 'var(--coral-dark)',
		},
		sand: 'var(--sand)',
		'warm-stone': 'var(--warm-stone)',
		earth: {
			DEFAULT: 'var(--earth)',
			muted: 'var(--earth-muted)',
		},
	},
	borderColor: {
		DEFAULT: 'var(--border)',
	},
	borderRadius: {
		lg: 'var(--radius)',
		md: 'calc(var(--radius) - 2px)',
		sm: 'calc(var(--radius) - 4px)',
	},
	fontFamily: {
		display: ['"Borna"', 'system-ui', 'sans-serif'],
		body: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
	},
	fontSize: {
		// 1rem = 16px
		/** 80px size / 84px high / bold */
		mega: ['5rem', { lineHeight: '5.25rem', fontWeight: '700' }],
		/** 56px size / 62px high / bold */
		h1: ['3.5rem', { lineHeight: '3.875rem', fontWeight: '700' }],
		/** 40px size / 48px high / bold */
		h2: ['2.5rem', { lineHeight: '3rem', fontWeight: '700' }],
		/** 32px size / 36px high / bold */
		h3: ['2rem', { lineHeight: '2.25rem', fontWeight: '700' }],
		/** 28px size / 36px high / bold */
		h4: ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }],
		/** 24px size / 32px high / bold */
		h5: ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
		/** 16px size / 20px high / bold */
		h6: ['1rem', { lineHeight: '1.25rem', fontWeight: '700' }],

		/** 32px size / 36px high / normal */
		'body-2xl': ['2rem', { lineHeight: '2.25rem' }],
		/** 28px size / 36px high / normal */
		'body-xl': ['1.75rem', { lineHeight: '2.25rem' }],
		/** 24px size / 32px high / normal */
		'body-lg': ['1.5rem', { lineHeight: '2rem' }],
		/** 20px size / 28px high / normal */
		'body-md': ['1.25rem', { lineHeight: '1.75rem' }],
		/** 16px size / 20px high / normal */
		'body-sm': ['1rem', { lineHeight: '1.25rem' }],
		/** 14px size / 18px high / normal */
		'body-xs': ['0.875rem', { lineHeight: '1.125rem' }],
		/** 12px size / 16px high / normal */
		'body-2xs': ['0.75rem', { lineHeight: '1rem' }],

		/** 18px size / 24px high / semibold */
		caption: ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
		/** 12px size / 16px high / bold */
		button: ['0.75rem', { lineHeight: '1rem', fontWeight: '700' }],
	},
	boxShadow: {
		// Warm shadows
		'warm-sm': '0 1px 3px 0 hsl(20 20% 14% / 0.06)',
		'warm-md':
			'0 4px 6px -1px hsl(20 20% 14% / 0.08), 0 2px 4px -2px hsl(20 20% 14% / 0.04)',
		'warm-lg':
			'0 10px 15px -3px hsl(20 20% 14% / 0.1), 0 4px 6px -4px hsl(20 20% 14% / 0.05)',
		'warm-xl':
			'0 20px 25px -5px hsl(20 20% 14% / 0.1), 0 8px 10px -6px hsl(20 20% 14% / 0.05)',
		// Glow effects
		glow: '0 0 24px hsl(14 76% 52% / 0.2)',
		'glow-coral': '0 0 20px hsl(4 90% 62% / 0.2)',
	},
	keyframes: {
		'caret-blink': {
			'0%,70%,100%': { opacity: '1' },
			'20%,50%': { opacity: '0' },
		},
		'fade-in': {
			'0%': { opacity: '0', transform: 'translateY(10px)' },
			'100%': { opacity: '1', transform: 'translateY(0)' },
		},
		'fade-in-up': {
			'0%': { opacity: '0', transform: 'translateY(20px)' },
			'100%': { opacity: '1', transform: 'translateY(0)' },
		},
		'scale-in': {
			'0%': { opacity: '0', transform: 'scale(0.95)' },
			'100%': { opacity: '1', transform: 'scale(1)' },
		},
		float: {
			'0%, 100%': { transform: 'translateY(0)' },
			'50%': { transform: 'translateY(-5px)' },
		},
		'collapsible-down': {
			from: { height: '0' },
			to: { height: 'var(--radix-collapsible-content-height)' },
		},
		'collapsible-up': {
			from: { height: 'var(--radix-collapsible-content-height)' },
			to: { height: '0' },
		},
	},
	animation: {
		'caret-blink': 'caret-blink 1.25s ease-out infinite',
		'fade-in': 'fade-in 0.3s ease-out',
		'fade-in-up': 'fade-in-up 0.5s ease-out',
		'scale-in': 'scale-in 0.3s ease-out',
		float: 'float 3s ease-in-out infinite',
		'collapsible-down': 'collapsible-down 0.2s ease-out',
		'collapsible-up': 'collapsible-up 0.2s ease-out',
	},
} satisfies Config['theme']
