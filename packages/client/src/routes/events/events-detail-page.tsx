import 'leaflet/dist/leaflet.css'
import {
	ArrowLeft,
	CalendarDays,
	CheckCircle,
	CreditCard,
	Edit,
	MapPin,
	QrCode,
	UserCheck,
	Users,
	XCircle,
} from 'lucide-react'
import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ReviewForm } from '@/components/reviews/review-form'
import { ReviewList } from '@/components/reviews/review-list'
import { ShareEvent } from '@/components/share-event'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePageTitle } from '@/hooks/use-page-title'
import { trpc } from '@/trpc/client'

export function EventsDetailPage() {
	const { id } = useParams<{ id: string }>()
	const [searchParams, setSearchParams] = useSearchParams()
	const navigate = useNavigate()
	const utils = trpc.useUtils()

	const { data: event, isLoading } = trpc.events.getById.useQuery(
		{ id: id! },
		{ enabled: !!id },
	)

	const { data: user } = trpc.user.me.useQuery()

	// Payment status for paid events
	const { data: paymentStatus, refetch: refetchPaymentStatus } =
		trpc.stripe.getPaymentStatus.useQuery(
			{ eventId: id! },
			{ enabled: !!id && !!user },
		)

	const joinMutation = trpc.events.join.useMutation({
		onSuccess: () => utils.events.getById.invalidate({ id: id! }),
	})

	const leaveMutation = trpc.events.leave.useMutation({
		onSuccess: () => utils.events.getById.invalidate({ id: id! }),
	})

	const cancelMutation = trpc.events.update.useMutation({
		onSuccess: () => utils.events.getById.invalidate({ id: id! }),
	})

	const checkoutMutation = trpc.stripe.createCheckoutSession.useMutation({
		onSuccess: (data) => {
			if (data.url) {
				window.location.href = data.url
			}
		},
		onError: (error) => {
			toast.error(error.message || 'Nepodařilo se vytvořit platbu')
		},
	})

	// Handle payment return
	useEffect(() => {
		const paymentParam = searchParams.get('payment')
		if (paymentParam === 'success') {
			toast.success('Platba proběhla úspěšně!')
			refetchPaymentStatus()
			utils.events.getById.invalidate({ id: id! })
			setSearchParams({}, { replace: true })
		} else if (paymentParam === 'cancelled') {
			toast.info('Platba byla zrušena')
			setSearchParams({}, { replace: true })
		}
	}, [
		searchParams,
		setSearchParams,
		refetchPaymentStatus,
		utils.events.getById,
		id,
	])

	usePageTitle(event?.title ?? 'Událost')

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		)
	}

	if (!event) {
		return (
			<div className="container text-center py-12">
				<p className="text-muted-foreground">Událost nenalezena</p>
				<Button variant="ghost" onClick={() => navigate('/events')}>
					Zpět na události
				</Button>
			</div>
		)
	}

	const isOrganizer = user?.id === event.organizerId
	const isParticipant = event.participants.some((p) => p.userId === user?.id)
	const confirmedCount = event.participants.length
	const isFull = confirmedCount >= event.capacity
	const isPaidEvent = event.price > 0
	const hasPaid = paymentStatus?.hasPaid ?? false
	const isDraft = event.status === 'DRAFT'

	// Redirect organizer to preview page for drafts
	if (isDraft && isOrganizer) {
		navigate(`/events/${id}/preview`, { replace: true })
		return null
	}

	// Non-organizers cannot view draft events
	if (isDraft && !isOrganizer) {
		return (
			<div className="container text-center py-12">
				<p className="text-muted-foreground">Událost nenalezena</p>
				<Button variant="ghost" onClick={() => navigate('/events')}>
					Zpět na události
				</Button>
			</div>
		)
	}

	return (
		<div className="container max-w-3xl">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => navigate('/events')}
				className="mb-4"
			>
				<ArrowLeft className="h-4 w-4 mr-2" />
				Zpět na události
			</Button>

			<Card>
				<CardHeader>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
						<div>
							<div className="flex flex-wrap gap-2 mb-2">
								<Badge>{event.category}</Badge>
								{event.status === 'CANCELLED' && (
									<Badge variant="destructive">Zrušeno</Badge>
								)}
							</div>
							<CardTitle className="text-xl sm:text-2xl">
								{event.title}
							</CardTitle>
						</div>
						<div className="sm:text-right shrink-0">
							<p className="text-xl sm:text-2xl font-bold text-primary">
								{event.price === 0
									? 'Zdarma'
									: `${event.price} ${event.currency}`}
							</p>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Description */}
					<p className="text-muted-foreground whitespace-pre-wrap">
						{event.description}
					</p>

					{/* Details */}
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="flex items-center gap-3">
							<CalendarDays className="h-5 w-5 text-primary" />
							<div>
								<p className="font-medium">
									{new Date(event.date).toLocaleDateString('cs-CZ', {
										weekday: 'long',
										day: 'numeric',
										month: 'long',
										year: 'numeric',
									})}
								</p>
								<p className="text-sm text-muted-foreground">
									{event.startTime}
									{event.endTime ? ` - ${event.endTime}` : ''}
									{event.durationMinutes
										? ` (${event.durationMinutes} min)`
										: ''}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<MapPin className="h-5 w-5 text-primary" />
							<div>
								<p className="font-medium">{event.locationName}</p>
								<p className="text-sm text-muted-foreground">{event.address}</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<Users className="h-5 w-5 text-primary" />
							<div>
								<p className="font-medium">
									{confirmedCount} / {event.capacity} obsazeno
								</p>
								{isFull && (
									<p className="text-sm text-orange-400">Událost je plná</p>
								)}
							</div>
						</div>
					</div>

					{/* Map */}
					<div className="rounded-lg overflow-hidden border border-border h-48">
						<MapContainer
							center={[event.latitude, event.longitude]}
							zoom={15}
							scrollWheelZoom={false}
							className="h-full w-full"
						>
							<TileLayer
								attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
								url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							/>
							<Marker position={[event.latitude, event.longitude]} />
						</MapContainer>
					</div>

					{/* Organizer */}
					<div className="border-t border-border pt-4">
						<p className="text-sm text-muted-foreground mb-1">Organizuje</p>
						<Link
							to={`/users/${event.organizerId}`}
							className="font-medium hover:text-primary transition-colors"
						>
							{event.organizer.name ?? 'Anonymni'}
						</Link>
					</div>

					{/* Actions */}
					<div className="flex flex-wrap gap-3 border-t border-border pt-4">
						{isOrganizer ? (
							<>
								<Button asChild>
									<Link to={`/events/${event.id}/edit`}>
										<Edit className="h-4 w-4 mr-2" />
										Upravit událost
									</Link>
								</Button>
								<Button asChild variant="secondary">
									<Link to={`/events/${event.id}/check-in`}>
										<UserCheck className="h-4 w-4 mr-2" />
										Odbavit účastníky
									</Link>
								</Button>
								{event.status !== 'CANCELLED' && (
									<Button
										variant="destructive"
										onClick={() =>
											cancelMutation.mutate({
												id: event.id,
												status: 'CANCELLED',
											})
										}
									>
										<XCircle className="h-4 w-4 mr-2" />
										Zrušit událost
									</Button>
								)}
							</>
						) : isParticipant || hasPaid ? (
							<>
								{hasPaid && (
									<Badge
										variant="secondary"
										className="flex items-center gap-1 bg-green-100 text-green-700"
									>
										<CheckCircle className="h-4 w-4" />
										Zaplaceno
									</Badge>
								)}
								{isParticipant && (
									<>
										<Button asChild>
											<Link to={`/events/${event.id}/ticket`}>
												<QrCode className="h-4 w-4 mr-2" />
												Zobrazit vstupenku
											</Link>
										</Button>
										<Button
											variant="outline"
											onClick={() => leaveMutation.mutate({ eventId: event.id })}
											disabled={leaveMutation.isPending}
										>
											{leaveMutation.isPending
												? 'Odchazeni...'
												: 'Odejit z udalosti'}
										</Button>
									</>
								)}
							</>
						) : isPaidEvent ? (
							<Button
								onClick={() => checkoutMutation.mutate({ eventId: event.id })}
								disabled={checkoutMutation.isPending || isFull}
							>
								<CreditCard className="h-4 w-4 mr-2" />
								{checkoutMutation.isPending
									? 'Přesměrování...'
									: isFull
										? 'Událost je plná'
										: `Zaplatit ${event.price} ${event.currency}`}
							</Button>
						) : (
							<Button
								onClick={() => joinMutation.mutate({ eventId: event.id })}
								disabled={joinMutation.isPending || isFull}
							>
								{joinMutation.isPending
									? 'Připojování...'
									: isFull
										? 'Čekací listina'
										: 'Připojit se'}
							</Button>
						)}
						<ShareEvent eventId={event.id} eventTitle={event.title} />
					</div>

					{/* Participants */}
					{event.participants.length > 0 && (
						<div className="border-t border-border pt-4">
							<h3 className="font-medium mb-3">Účastníci ({confirmedCount})</h3>
							<div className="flex flex-wrap gap-2">
								{event.participants.map((p) => (
									<Badge key={p.id} variant="secondary">
										{p.user.name ?? 'Anonymní'}
									</Badge>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Reviews Section */}
			<div className="mt-6 space-y-6">
				{user && <ReviewForm eventId={event.id} />}
				<ReviewList eventId={event.id} currentUserId={user?.id} />
			</div>
		</div>
	)
}
