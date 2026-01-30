import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StarRating } from '@/components/ui/star-rating'
import { Textarea } from '@/components/ui/textarea'
import { trpc } from '@/trpc/client'

interface ReviewFormProps {
	eventId: string
	onSuccess?: () => void
}

export function ReviewForm({ eventId, onSuccess }: ReviewFormProps) {
	const [rating, setRating] = useState(0)
	const [comment, setComment] = useState('')
	const utils = trpc.useUtils()

	const { data: canReviewData, isLoading: isCheckingCanReview } =
		trpc.reviews.canReview.useQuery({ eventId })

	const createReviewMutation = trpc.reviews.create.useMutation({
		onSuccess: () => {
			toast.success('Hodnoceni bylo pridano')
			setRating(0)
			setComment('')
			utils.reviews.getByEvent.invalidate({ eventId })
			utils.reviews.canReview.invalidate({ eventId })
			onSuccess?.()
		},
		onError: (error) => {
			toast.error(error.message || 'Nepodarilo se pridat hodnoceni')
		},
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (rating === 0) {
			toast.error('Vyberte hodnoceni')
			return
		}

		createReviewMutation.mutate({
			eventId,
			rating,
			comment: comment.trim() || undefined,
		})
	}

	if (isCheckingCanReview) {
		return null
	}

	if (!canReviewData?.canReview) {
		return null
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Ohodnotit udalost</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">
							Hodnoceni <span className="text-destructive">*</span>
						</label>
						<StarRating value={rating} onChange={setRating} size="lg" />
					</div>

					<div className="space-y-2">
						<label htmlFor="comment" className="text-sm font-medium">
							Komentar (volitelny)
						</label>
						<Textarea
							id="comment"
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							placeholder="Napiste svuj nazor na udalost..."
							rows={3}
						/>
					</div>

					<Button
						type="submit"
						disabled={rating === 0 || createReviewMutation.isPending}
					>
						{createReviewMutation.isPending
							? 'Odesilani...'
							: 'Odeslat hodnoceni'}
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
