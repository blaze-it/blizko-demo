import { cn } from '@/utils/misc'

interface EmptyStateProps {
	title: string
	description?: string
	icon?: React.ReactElement
	className?: string
	children?: React.ReactNode
}

export function EmptyState({
	title,
	description,
	icon,
	className,
	children,
}: EmptyStateProps) {
	return (
		<div
			data-testid="empty-state"
			className={cn(
				'flex flex-col items-center justify-center py-12 text-center',
				className,
			)}
		>
			{icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
			<p className="text-lg font-medium text-foreground">{title}</p>
			{description && (
				<p className="mt-1 text-sm text-muted-foreground">{description}</p>
			)}
			{children && <div className="mt-4">{children}</div>}
		</div>
	)
}
