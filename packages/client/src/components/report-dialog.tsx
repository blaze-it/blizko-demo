import { Flag } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { trpc } from '@/trpc/client'

interface ReportDialogProps {
	type: 'event' | 'review'
	targetId: string
	trigger?: React.ReactNode
}

export function ReportDialog({ type, targetId, trigger }: ReportDialogProps) {
	const [open, setOpen] = useState(false)
	const [reason, setReason] = useState('')

	const reportEventMutation = trpc.reports.reportEvent.useMutation({
		onSuccess: () => {
			toast.success('Nahlaseni bylo odeslano')
			setOpen(false)
			setReason('')
		},
		onError: (error) => {
			toast.error(error.message || 'Nepodarilo se odeslat nahlaseni')
		},
	})

	const reportReviewMutation = trpc.reports.reportReview.useMutation({
		onSuccess: () => {
			toast.success('Nahlaseni bylo odeslano')
			setOpen(false)
			setReason('')
		},
		onError: (error) => {
			toast.error(error.message || 'Nepodarilo se odeslat nahlaseni')
		},
	})

	const isPending =
		reportEventMutation.isPending || reportReviewMutation.isPending

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (!reason.trim()) {
			toast.error('Vyplnte duvod nahlaseni')
			return
		}

		if (type === 'event') {
			reportEventMutation.mutate({ eventId: targetId, reason: reason.trim() })
		} else {
			reportReviewMutation.mutate({ reviewId: targetId, reason: reason.trim() })
		}
	}

	const title = type === 'event' ? 'Nahlasit udalost' : 'Nahlasit hodnoceni'
	const description =
		type === 'event'
			? 'Popiste, proc je tato udalost nevhodna.'
			: 'Popiste, proc je toto hodnoceni nevhodne.'

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger ?? (
					<Button variant="ghost" size="sm">
						<Flag className="h-4 w-4 mr-2" />
						Nahlasit
					</Button>
				)}
			</DialogTrigger>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
						<DialogDescription>{description}</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Textarea
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder="Duvod nahlaseni..."
							rows={4}
							disabled={isPending}
						/>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isPending}
						>
							Zrusit
						</Button>
						<Button type="submit" disabled={isPending || !reason.trim()}>
							{isPending ? 'Odesilani...' : 'Odeslat nahlaseni'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
