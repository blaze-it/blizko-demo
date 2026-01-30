import 'leaflet/dist/leaflet.css'
import {
	ArrowLeft,
	CalendarDays,
	Edit,
	Eye,
	MapPin,
	Send,
	Users,
} from 'lucide-react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePageTitle } from '@/hooks/use-page-title'
import { trpc } from '@/trpc/client'

export function EventsPreviewPage() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const utils = trpc.useUtils()

	const { data: event, isLoading } = trpc.events.getById.useQuery(
		{ id: id! },
		{ enabled: !!id },
	)

	const { data: user } = trpc.user.me.useQuery()

	const publishMutation = trpc.events.publish.useMutation({
		onSuccess: () => {
			toast.success('Událost byla publikována!')
			utils.events.getById.invalidate({ id: id! })
			navigate(`/events/${id}`)
		},
		onError: (error) => {
			toast.error(error.message || 'Nepodařilo se publikovat událost')
		},
	})

	usePageTitle(event?.title ? `Náhled: ${event.title}` : 'Náhled události')

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
				<Button variant="ghost" onClick={() => navigate('/my-events')}>
					Zpět na moje události
				</Button>
			</div>
		)
	}

	const isOrganizer = user?.id === event.organizerId
	const isDraft = event.status === 'DRAFT'

	// Only organizer can view draft preview
	if (!isOrganizer) {
		return (
			<div className="container text-center py-12">
				<p className="text-muted-foreground">
					Nemáte oprávnění k zobrazení této stránky
				</p>
				<Button variant="ghost" onClick={() => navigate('/events')}>
					Zpět na události
				</Button>
			</div>
		)
	}

	// If event is not a draft, redirect to regular detail page
	if (!isDraft) {
		navigate(`/events/${id}`, { replace: true })
		return null
	}

	return (
		<div className="container max-w-3xl">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => navigate('/my-events')}
				className="mb-4"
			>
				<ArrowLeft className="h-4 w-4 mr-2" />
				Zpět na moje události
			</Button>

			{/* Preview Banner */}
			<div className="mb-4 p-4 rounded-lg bg-amber-500/20 border border-amber-500/30 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2">
					<Eye className="h-5 w-5 text-amber-500" />
					<span className="font-medium text-amber-500">Náhled konceptu</span>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button variant="outline" size="sm" asChild>
						<Link to={`/events/${event.id}/edit`}>
							<Edit className="h-4 w-4 mr-2" />
							Upravit
						</Link>
					</Button>
					<Button
						size="sm"
						onClick={() => publishMutation.mutate({ id: event.id })}
						disabled={publishMutation.isPending}
					>
						<Send className="h-4 w-4 mr-2" />
						{publishMutation.isPending ? 'Publikování...' : 'Publikovat'}
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
						<div>
							<div className="flex flex-wrap gap-2 mb-2">
								<Badge>{event.category}</Badge>
								<Badge variant="secondary">Koncept</Badge>
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
								<p className="font-medium">0 / {event.capacity} obsazeno</p>
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
						<p className="font-medium">{event.organizer.name ?? 'Anonymní'}</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
