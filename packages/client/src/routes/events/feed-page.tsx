import { Calendar, MapPin, Users, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { usePageTitle } from '@/hooks/use-page-title'
import { trpc } from '@/trpc/client'

const CATEGORIES = [
	{ value: 'ALL', label: 'Všechny kategorie' },
	{ value: 'WORKOUT', label: 'Cvičení' },
	{ value: 'WORKSHOP', label: 'Dílna' },
	{ value: 'KIDS', label: 'Děti' },
	{ value: 'MEETUP', label: 'Setkání' },
	{ value: 'LECTURE', label: 'Přednáška' },
	{ value: 'LEISURE', label: 'Volný čas' },
	{ value: 'OTHER', label: 'Ostatní' },
] as const

const CATEGORY_COLORS: Record<
	string,
	'default' | 'secondary' | 'accent' | 'outline'
> = {
	WORKOUT: 'default',
	WORKSHOP: 'accent',
	KIDS: 'secondary',
	MEETUP: 'default',
	LECTURE: 'accent',
	LEISURE: 'secondary',
	OTHER: 'outline',
}

export function FeedPage() {
	usePageTitle('Můj feed')

	const { data, isLoading } = trpc.follows.getFeed.useQuery({})
	const events = data?.items

	const formatDate = (dateStr: string | Date) => {
		const d = new Date(dateStr)
		return d.toLocaleDateString('cs-CZ', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
		})
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto max-w-4xl px-4 py-6 pb-24">
				<h1 className="text-2xl font-bold text-foreground mb-2">
					Můj feed
				</h1>
				<p className="text-muted-foreground mb-6">
					Události od organizátorů, které sleduji
				</p>

				{/* Event List */}
				{isLoading ? (
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="h-32 rounded-xl bg-muted/30 animate-pulse"
							/>
						))}
					</div>
				) : !events?.length ? (
					<div className="text-center py-12 text-muted-foreground">
						<UserPlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
						<p className="text-lg font-medium">Žádné události ve feedu</p>
						<p className="text-sm mt-1 mb-4">
							Začněte sledovat organizátory, abyste viděli jejich události
						</p>
						<Link to="/events">
							<Button variant="outline">Procházet události</Button>
						</Link>
					</div>
				) : (
					<div className="space-y-4">
						{events.map((event) => (
							<Link key={event.id} to={`/events/${event.id}`}>
								<Card className="hover:border-primary/30 transition-colors cursor-pointer">
									<CardContent className="p-4">
										<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
											<div className="flex-1 min-w-0">
												<div className="flex flex-wrap items-center gap-2 mb-1">
													<h3 className="font-semibold text-foreground truncate">
														{event.title}
													</h3>
													<Badge
														variant={
															CATEGORY_COLORS[event.category] || 'outline'
														}
													>
														{CATEGORIES.find((c) => c.value === event.category)
															?.label ?? event.category}
													</Badge>
												</div>
												<p className="text-sm text-muted-foreground mb-2">
													Pořádá: {event.organizer.name}
												</p>
												<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
													<span className="flex items-center gap-1">
														<Calendar className="h-3.5 w-3.5 shrink-0" />
														{formatDate(event.date)} v {event.startTime}
													</span>
													<span className="flex items-center gap-1 min-w-0">
														<MapPin className="h-3.5 w-3.5 shrink-0" />
														<span className="truncate">
															{event.locationName}
														</span>
													</span>
													{event.capacity && (
														<span className="flex items-center gap-1">
															<Users className="h-3.5 w-3.5 shrink-0" />
															{event._count?.participants ?? 0} /{' '}
															{event.capacity}
														</span>
													)}
												</div>
											</div>
											<div className="text-right shrink-0">
												<span className="text-sm font-semibold text-foreground">
													{event.price > 0 ? `${event.price} Kč` : 'Zdarma'}
												</span>
											</div>
										</div>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
