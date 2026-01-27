import { AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/utils/misc'
import { Button } from './button'

interface ErrorStateProps {
	title?: string
	message?: string
	className?: string
	onRetry?: () => void
}

export function ErrorState({
	title = 'Něco se pokazilo',
	message,
	className,
	onRetry,
}: ErrorStateProps) {
	return (
		<div
			data-testid="error-state"
			className={cn(
				'flex flex-col items-center justify-center py-12 text-center',
				className,
			)}
		>
			<div className="mb-4 text-destructive">
				<AlertCircle className="h-12 w-12" />
			</div>
			<p className="text-lg font-medium text-foreground">{title}</p>
			{message && (
				<p className="mt-1 text-sm text-muted-foreground max-w-md">{message}</p>
			)}
			{onRetry && (
				<Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
					<RefreshCw className="h-4 w-4 mr-2" />
					Zkusit znovu
				</Button>
			)}
		</div>
	)
}
