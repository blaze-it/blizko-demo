import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/misc'
import { Button } from './button'

interface PaginationProps {
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
	className?: string
	/** Maximum number of page buttons to show */
	maxVisible?: number
}

export function Pagination({
	currentPage,
	totalPages,
	onPageChange,
	className,
	maxVisible = 5,
}: PaginationProps) {
	if (totalPages <= 1) return null

	const getPageNumbers = () => {
		const pages: (number | 'ellipsis')[] = []
		const half = Math.floor(maxVisible / 2)

		let start = Math.max(1, currentPage - half)
		const end = Math.min(totalPages, start + maxVisible - 1)

		if (end - start + 1 < maxVisible) {
			start = Math.max(1, end - maxVisible + 1)
		}

		// Always include first page
		if (start > 1) {
			pages.push(1)
			if (start > 2) pages.push('ellipsis')
		}

		// Include middle pages
		for (let i = start; i <= end; i++) {
			if (!pages.includes(i)) {
				pages.push(i)
			}
		}

		// Always include last page
		if (end < totalPages) {
			if (end < totalPages - 1) pages.push('ellipsis')
			if (!pages.includes(totalPages)) pages.push(totalPages)
		}

		return pages
	}

	const pages = getPageNumbers()

	return (
		<div className={cn('flex items-center justify-center gap-1', className)}>
			<Button
				variant="outline"
				size="icon"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className="h-9 w-9"
			>
				<ChevronLeft className="h-4 w-4" />
			</Button>

			{pages.map((page, index) =>
				page === 'ellipsis' ? (
					<span
						key={`ellipsis-${index}`}
						className="px-2 text-muted-foreground"
					>
						...
					</span>
				) : (
					<Button
						key={page}
						variant={currentPage === page ? 'default' : 'outline'}
						size="sm"
						onClick={() => onPageChange(page)}
						className="h-9 w-9 p-0"
					>
						{page}
					</Button>
				),
			)}

			<Button
				variant="outline"
				size="icon"
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				className="h-9 w-9"
			>
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	)
}
