import type { ReactNode } from 'react'
import { cn } from '@/utils/misc.tsx'

type ColorTheme = 'emerald' | 'amber' | 'forest' | 'muted'

interface GradientCardHeaderProps {
	children: ReactNode
	theme?: ColorTheme
	className?: string
}

const themeClasses: Record<ColorTheme, string> = {
	emerald: 'from-emerald-dark/30 to-forest/30',
	amber: 'from-amber-dark/30 to-forest/30',
	forest: 'from-forest/50 to-emerald-dark/30',
	muted: 'from-secondary/50 to-muted/30',
}

export function GradientCardHeader({
	children,
	theme = 'emerald',
	className,
}: GradientCardHeaderProps) {
	return (
		<div
			className={cn(
				'bg-gradient-to-r p-4 border-b border-border rounded-t-xl',
				themeClasses[theme],
				className,
			)}
		>
			{children}
		</div>
	)
}
