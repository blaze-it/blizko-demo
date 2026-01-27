import { Star } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/utils/misc.tsx'

interface StarRatingProps {
	value: number
	onChange?: (value: number) => void
	max?: number
	size?: 'sm' | 'md' | 'lg'
	readOnly?: boolean
	showValue?: boolean
	className?: string
}

const sizeClasses = {
	sm: 'h-4 w-4',
	md: 'h-6 w-6',
	lg: 'h-8 w-8',
}

export function StarRating({
	value,
	onChange,
	max = 5,
	size = 'md',
	readOnly = false,
	showValue = false,
	className,
}: StarRatingProps) {
	const [hoverValue, setHoverValue] = useState(0)

	const handleClick = (star: number) => {
		if (readOnly || !onChange) return
		onChange(value === star ? 0 : star)
	}

	const displayValue = hoverValue || value

	return (
		<div className={cn('flex items-center gap-1', className)}>
			{Array.from({ length: max }, (_, i) => i + 1).map((star) => (
				<button
					key={star}
					type="button"
					onClick={() => handleClick(star)}
					onMouseEnter={() => !readOnly && setHoverValue(star)}
					onMouseLeave={() => !readOnly && setHoverValue(0)}
					disabled={readOnly}
					className={cn(
						'rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
						readOnly && 'cursor-default',
					)}
				>
					<Star
						className={cn(
							sizeClasses[size],
							'transition-colors',
							star <= displayValue
								? 'fill-coral text-coral'
								: 'text-muted-foreground',
							!readOnly && star > displayValue && 'hover:text-coral-light',
						)}
					/>
				</button>
			))}
			{showValue && value > 0 && (
				<span className="ml-2 text-sm text-muted-foreground">
					{value}/{max}
				</span>
			)}
		</div>
	)
}
