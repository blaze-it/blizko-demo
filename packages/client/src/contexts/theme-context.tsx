import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
	theme: Theme
	setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
	theme: 'system',
	setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setTheme] = useState<Theme>(
		() => (localStorage.getItem('theme') as Theme) || 'system',
	)

	useEffect(() => {
		const root = document.documentElement
		localStorage.setItem('theme', theme)

		if (theme === 'system') {
			const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
			root.setAttribute('data-theme', isDark ? 'dark' : 'light')
		} else {
			root.setAttribute('data-theme', theme)
		}
	}, [theme])

	return (
		<ThemeContext.Provider value={{ theme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	)
}

export function useTheme() {
	return useContext(ThemeContext)
}
