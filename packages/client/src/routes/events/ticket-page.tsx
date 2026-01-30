import { ArrowLeft, CalendarDays, MapPin, User } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePageTitle } from '@/hooks/use-page-title'
import { trpc } from '@/trpc/client'

export function TicketPage() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()

	const { data: ticket, isLoading, error } = trpc.events.getTicket.useQuery(
		{ eventId: id! },
		{ enabled: !!id },
	)

	usePageTitle(ticket?.event.title ? `Vstupenka - ${ticket.event.title}` : 'Vstupenka')

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		)
	}

	if (error || !ticket) {
		return (
			<div className="container text-center py-12">
				<p className="text-muted-foreground">
					{error?.message || 'Vstupenka nenalezena'}
				</p>
				<Button variant="ghost" onClick={() => navigate('/my-events')}>
					Zpet na moje udalosti
				</Button>
			</div>
		)
	}

	const statusLabels: Record<string, string> = {
		CONFIRMED: 'Potvrzeno',
		WAITLISTED: 'Cekaci listina',
		CANCELLED: 'Zruseno',
	}

	const statusVariant = ticket.status === 'CONFIRMED' ? 'default' :
		ticket.status === 'CANCELLED' ? 'destructive' : 'secondary'

	return (
		<div className="container max-w-md mx-auto">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => navigate(`/events/${id}`)}
				className="mb-4"
			>
				<ArrowLeft className="h-4 w-4 mr-2" />
				Zpet na udalost
			</Button>

			<Card className="overflow-hidden">
				<CardHeader className="bg-primary text-primary-foreground text-center pb-4">
					<CardTitle className="text-xl">Vstupenka</CardTitle>
					<p className="text-sm opacity-90">Zokoli Event Ticket</p>
				</CardHeader>

				<CardContent className="p-6 space-y-6">
					{/* Event Title */}
					<div className="text-center">
						<h2 className="text-xl font-bold">{ticket.event.title}</h2>
						<Badge variant={statusVariant} className="mt-2">
							{statusLabels[ticket.status] || ticket.status}
						</Badge>
					</div>

					{/* QR Code */}
					<div className="flex justify-center">
						<div className="bg-white p-4 rounded-lg shadow-inner">
							<img
								src={ticket.qrCodeDataUrl}
								alt="QR kod vstupenky"
								className="w-48 h-48"
							/>
						</div>
					</div>

					<p className="text-center text-sm text-muted-foreground">
						Tento QR kod ukazes pri vstupu na akci
					</p>

					{/* Event Details */}
					<div className="space-y-3 border-t border-border pt-4">
						<div className="flex items-center gap-3">
							<CalendarDays className="h-5 w-5 text-primary shrink-0" />
							<div>
								<p className="font-medium">
									{new Date(ticket.event.date).toLocaleDateString('cs-CZ', {
										weekday: 'long',
										day: 'numeric',
										month: 'long',
										year: 'numeric',
									})}
								</p>
								<p className="text-sm text-muted-foreground">
									{ticket.event.startTime}
									{ticket.event.endTime ? ` - ${ticket.event.endTime}` : ''}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<MapPin className="h-5 w-5 text-primary shrink-0" />
							<div>
								<p className="font-medium">{ticket.event.locationName}</p>
								<p className="text-sm text-muted-foreground">
									{ticket.event.address}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<User className="h-5 w-5 text-primary shrink-0" />
							<div>
								<p className="font-medium">{ticket.user.name || 'Ucastnik'}</p>
								<p className="text-sm text-muted-foreground">
									{ticket.user.email}
								</p>
							</div>
						</div>
					</div>

					{/* Ticket ID */}
					<div className="border-t border-border pt-4 text-center">
						<p className="text-xs text-muted-foreground">
							ID vstupenky: {ticket.id}
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
