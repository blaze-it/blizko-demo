import 'leaflet/dist/leaflet.css'
import { Calendar, MapPin, Plus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SearchInput } from '@/components/ui/search-input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
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

export function EventsPage() {
	usePageTitle('Události')
	const navigate = useNavigate()
	const [search, setSearch] = useState('')
	const [category, setCategory] = useState('ALL')
	const [date, setDate] = useState('')

	const { data, isLoading } = trpc.events.list.useQuery({
		search: search || undefined,
		category:
			category !== 'ALL'
				? (category as
						| 'WORKOUT'
						| 'WORKSHOP'
						| 'KIDS'
						| 'MEETUP'
						| 'LECTURE'
						| 'LEISURE'
						| 'OTHER')
				: undefined,
		date: date || undefined,
	})
	const events = data?.items

	const formatDate = (dateStr: string | Date) => {
		const d = new Date(dateStr)
		return d.toLocaleDateString('cs-CZ', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
		})
	}

	const mappableEvents = useMemo(
		() => events?.filter((e) => e.latitude != null && e.longitude != null) ?? [],
		[events],
	)

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto max-w-4xl px-4 py-6 pb-24">
				<h1 className="text-2xl font-bold text-foreground mb-6">
					Procházet události
				</h1>

				{/* Map */}
				<div className="w-full h-64 rounded-xl overflow-hidden border border-border mb-6">
					<MapContainer
						center={[50.0755, 14.4378]}
						zoom={13}
						className="h-full w-full"
						scrollWheelZoom={false}
					>
						<TileLayer
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						/>
						{mappableEvents.map((event) => (
							<Marker
								key={event.id}
								position={[event.latitude!, event.longitude!]}
							>
								<Popup>
									<Link to={`/events/${event.id}`} className="font-semibold">
										{event.title}
									</Link>
									<br />
									<span className="text-xs">
										{formatDate(event.date)} v {event.startTime}
									</span>
								</Popup>
							</Marker>
						))}
					</MapContainer>
				</div>

				{/* Filter Bar */}
				<div className="flex flex-col sm:flex-row gap-3 mb-6">
					<SearchInput
						value={search}
						onChange={setSearch}
						placeholder="Hledat události..."
						className="flex-1"
					/>
					<Select value={category} onValueChange={setCategory}>
						<SelectTrigger className="w-full sm:w-48">
							<SelectValue placeholder="Kategorie" />
						</SelectTrigger>
						<SelectContent>
							{CATEGORIES.map((cat) => (
								<SelectItem key={cat.value} value={cat.value}>
									{cat.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Input
						type="date"
						value={date}
						onChange={(e) => setDate(e.target.value)}
						className="w-full sm:w-44"
					/>
				</div>

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
						<Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
						<p className="text-lg font-medium">Žádné události nenalezeny</p>
						<p className="text-sm mt-1">
							Zkuste upravit filtry nebo vytvořte novou událost
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{events.map((event) => (
							<Link key={event.id} to={`/events/${event.id}`}>
								<Card className="hover:border-primary/30 transition-colors cursor-pointer">
									<CardContent className="p-4">
										<div className="flex items-start justify-between gap-4">
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<h3 className="font-semibold text-foreground truncate">
														{event.title}
													</h3>
													<Badge
														variant={
															CATEGORY_COLORS[event.category] || 'outline'
														}
													>
														{CATEGORIES.find((c) => c.value === event.category)?.label ?? event.category}
													</Badge>
												</div>
												<div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
													<span className="flex items-center gap-1">
														<Calendar className="h-3.5 w-3.5" />
														{formatDate(event.date)} v {event.startTime}
													</span>
													<span className="flex items-center gap-1">
														<MapPin className="h-3.5 w-3.5" />
														{event.locationName}
													</span>
													{event.capacity && (
														<span className="flex items-center gap-1">
															<Users className="h-3.5 w-3.5" />
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

			{/* Floating Create Button */}
			<Button
				className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
				onClick={() => navigate('/events/new')}
			>
				<Plus className="h-6 w-6" />
			</Button>
		</div>
	)
}
