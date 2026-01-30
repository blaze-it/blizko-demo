import { Link } from 'react-router-dom'
import { cn } from '@/utils/misc'

export function Logo({ className }: { className?: string }) {
	return (
		<Link
			to="/"
			className={cn(
				'inline-flex items-center gap-1.5 transition group',
				className,
			)}
		>
			<span className="font-display font-bold text-2xl tracking-tight text-foreground group-hover:text-primary transition-colors">
				zokoli
			</span>
			<span className="w-2 h-2 rounded-full bg-primary group-hover:scale-125 transition-transform" />
		</Link>
	)
}

export function LogoIcon({ className }: { className?: string }) {
	return (
		<span
			className={cn(
				'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-display font-bold text-lg',
				className,
			)}
		>
			b
		</span>
	)
}
