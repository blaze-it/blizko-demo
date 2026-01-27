import { CalendarDays, MapPin, Plus, Users } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { usePageTitle } from '@/hooks/use-page-title'
import { trpc } from '@/trpc/client'

export function MyEventsPage() {
	usePageTitle('Moje události')
	const navigate = useNavigate()
	const [tab, setTab] = useState<'organized' | 'joined'>('organized')

	const { data: myEvents, isLoading: loadingMy } =
		trpc.events.myEvents.useQuery()
	const { data: joined, isLoading: loadingJoined } =
		trpc.events.myParticipations.useQuery()

	const isLoading = tab === 'organized' ? loadingMy : loadingJoined

	return (
		<div className="container">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
				<h1 className="text-2xl font-bold">Moje události</h1>
				<Button onClick={() => navigate('/events/new')} className="w-full sm:w-auto">
					<Plus className="h-4 w-4 mr-2" />
					Vytvořit událost
				</Button>
			</div>

			{/* Tabs */}
			<div className="flex gap-2 mb-6 overflow-x-auto">
				<Button
					variant={tab === 'organized' ? 'default' : 'outline'}
					onClick={() => setTab('organized')}
				>
					Organizované
				</Button>
				<Button
					variant={tab === 'joined' ? 'default' : 'outline'}
					onClick={() => setTab('joined')}
				>
					Zúčastněné
				</Button>
			</div>

			{isLoading ? (
				<div className="flex justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
				</div>
			) : tab === 'organized' ? (
				!myEvents?.length ? (
					<EmptyState
						message="Zatím jste nevytvořili žádné události"
						actionLabel="Vytvořte svou první událost"
						onAction={() => navigate('/events/new')}
					/>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{myEvents.map((event) => (
							<Link key={event.id} to={`/events/${event.id}`}>
								<Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
									<CardContent className="p-5">
										<div className="flex items-start justify-between gap-2 mb-3">
											<Badge>{event.category}</Badge>
											<Badge
												variant={
													event.status === 'CANCELLED'
														? 'destructive'
														: 'secondary'
												}
											>
												{event.status}
											</Badge>
										</div>
										<h3 className="text-lg font-semibold mb-2 line-clamp-2">
											{event.title}
										</h3>
										<EventMeta
											date={event.date}
											locationName={event.locationName}
											participantCount={event._count.participants}
											capacity={event.capacity}
										/>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				)
			) : !joined?.length ? (
				<EmptyState
					message="Zatím jste se nezúčastnili žádných událostí"
					actionLabel="Procházet události"
					onAction={() => navigate('/events')}
				/>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{joined.map((p) => (
						<Link key={p.id} to={`/events/${p.event.id}`}>
							<Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
								<CardContent className="p-5">
									<div className="flex items-start justify-between gap-2 mb-3">
										<Badge>{p.event.category}</Badge>
										<Badge variant="secondary">{p.status}</Badge>
									</div>
									<h3 className="text-lg font-semibold mb-2 line-clamp-2">
										{p.event.title}
									</h3>
									<p className="text-xs text-muted-foreground mb-2">
										od {p.event.organizer.name ?? 'Anonymní'}
									</p>
									<EventMeta
										date={p.event.date}
										locationName={p.event.locationName}
										participantCount={p.event._count.participants}
										capacity={p.event.capacity}
									/>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	)
}

function EmptyState({
	message,
	actionLabel,
	onAction,
}: {
	message: string
	actionLabel: string
	onAction: () => void
}) {
	return (
		<div className="text-center py-12">
			<CalendarDays className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
			<p className="text-lg font-medium text-muted-foreground">{message}</p>
			<Button className="mt-4" onClick={onAction}>
				{actionLabel}
			</Button>
		</div>
	)
}

function EventMeta({
	date,
	locationName,
	participantCount,
	capacity,
}: {
	date: Date
	locationName: string
	participantCount: number
	capacity: number
}) {
	return (
		<div className="space-y-2 text-sm text-muted-foreground">
			<div className="flex items-center gap-2">
				<CalendarDays className="h-4 w-4 shrink-0" />
				<span>
					{new Date(date).toLocaleDateString('cs-CZ', {
						weekday: 'short',
						day: 'numeric',
						month: 'short',
					})}
				</span>
			</div>
			<div className="flex items-center gap-2">
				<MapPin className="h-4 w-4 shrink-0" />
				<span className="line-clamp-1">{locationName}</span>
			</div>
			<div className="flex items-center gap-2">
				<Users className="h-4 w-4 shrink-0" />
				<span>
					{participantCount} / {capacity} míst
				</span>
			</div>
		</div>
	)
}
