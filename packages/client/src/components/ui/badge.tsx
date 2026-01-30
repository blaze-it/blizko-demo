import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/utils/misc'

const badgeVariants = cva(
	'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
	{
		variants: {
			variant: {
				default:
					'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20',
				secondary:
					'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
				accent: 'border-accent/30 bg-accent/10 text-accent hover:bg-accent/20',
				destructive:
					'border-destructive/30 bg-destructive/20 text-destructive hover:bg-destructive/30',
				outline: 'text-foreground border-border',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
)

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	)
}

export { Badge, badgeVariants }
