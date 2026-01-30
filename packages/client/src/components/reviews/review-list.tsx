import { Flag, MessageSquare, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ReportDialog } from '@/components/report-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StarRating } from '@/components/ui/star-rating'
import { trpc } from '@/trpc/client'

interface ReviewListProps {
	eventId: string
	currentUserId?: string
}

export function ReviewList({ eventId, currentUserId }: ReviewListProps) {
	const utils = trpc.useUtils()

	const { data, isLoading } = trpc.reviews.getByEvent.useQuery({ eventId })

	const deleteReviewMutation = trpc.reviews.delete.useMutation({
		onSuccess: () => {
			toast.success('Hodnoceni bylo smazano')
			utils.reviews.getByEvent.invalidate({ eventId })
			utils.reviews.canReview.invalidate({ eventId })
		},
		onError: (error) => {
			toast.error(error.message || 'Nepodarilo se smazat hodnoceni')
		},
	})

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<MessageSquare className="h-5 w-5" />
						Hodnoceni
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="animate-pulse space-y-4">
						<div className="h-20 bg-muted rounded" />
						<div className="h-20 bg-muted rounded" />
					</div>
				</CardContent>
			</Card>
		)
	}

	if (!data || data.reviews.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<MessageSquare className="h-5 w-5" />
						Hodnoceni
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">Zatim zadna hodnoceni</p>
				</CardContent>
			</Card>
		)
	}

	const formatDate = (date: Date | string) => {
		return new Intl.DateTimeFormat('cs-CZ', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		}).format(new Date(date))
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<CardTitle className="text-lg flex items-center gap-2">
						<MessageSquare className="h-5 w-5" />
						Hodnoceni ({data.count})
					</CardTitle>
					{data.avgRating !== null && (
						<div className="flex items-center gap-2">
							<StarRating
								value={Math.round(data.avgRating)}
								readOnly
								size="sm"
							/>
							<span className="text-sm text-muted-foreground">
								{data.avgRating.toFixed(1)} / 5
							</span>
						</div>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{data.reviews.map((review) => (
						<div
							key={review.id}
							className="border-b border-border pb-4 last:border-0 last:pb-0"
						>
							<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
								<div className="flex-1">
									<div className="flex flex-wrap items-center gap-2 mb-1">
										<span className="font-medium">
											{review.reviewer.name ?? 'Anonymni'}
										</span>
										<StarRating value={review.rating} readOnly size="sm" />
									</div>
									<p className="text-xs text-muted-foreground mb-2">
										{formatDate(review.createdAt)}
									</p>
									{review.comment && (
										<p className="text-sm text-muted-foreground">
											{review.comment}
										</p>
									)}
								</div>
								<div className="flex gap-1 shrink-0">
									{currentUserId &&
										currentUserId !== review.reviewerId && (
											<ReportDialog
												type="review"
												targetId={review.id}
												trigger={
													<Button
														variant="ghost"
														size="sm"
														className="text-muted-foreground hover:text-foreground"
													>
														<Flag className="h-4 w-4" />
														<span className="sr-only">Nahlasit hodnoceni</span>
													</Button>
												}
											/>
										)}
									{currentUserId === review.reviewerId && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => deleteReviewMutation.mutate({ eventId })}
											disabled={deleteReviewMutation.isPending}
											className="text-destructive hover:text-destructive"
										>
											<Trash2 className="h-4 w-4" />
											<span className="sr-only">Smazat hodnoceni</span>
										</Button>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
