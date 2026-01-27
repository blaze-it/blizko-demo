import type { ReactNode } from 'react'
import { cn } from '@/utils/misc.tsx'

type ColorTheme = 'primary' | 'accent' | 'warm' | 'muted'

interface GradientCardHeaderProps {
	children: ReactNode
	theme?: ColorTheme
	className?: string
}

const themeClasses: Record<ColorTheme, string> = {
	primary: 'from-terracotta-dark/30 to-primary/20',
	accent: 'from-coral-dark/30 to-primary/20',
	warm: 'from-primary/30 to-terracotta-dark/20',
	muted: 'from-secondary/50 to-muted/30',
}

export function GradientCardHeader({
	children,
	theme = 'primary',
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
