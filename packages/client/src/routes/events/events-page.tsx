import { Calendar, Locate, MapPin, Plus, Users } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EventMap } from '@/components/event-map'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
	const [freeOnly, setFreeOnly] = useState(false)
	const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
	const [locationLoading, setLocationLoading] = useState(false)
	const [locationError, setLocationError] = useState<string | null>(null)

	const requestLocation = useCallback(() => {
		if (!navigator.geolocation) {
			setLocationError('Geolokace není podporována vaším prohlížečem')
			return
		}

		setLocationLoading(true)
		setLocationError(null)

		navigator.geolocation.getCurrentPosition(
			(position) => {
				setUserLocation({
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				})
				setLocationLoading(false)
			},
			(error) => {
				setLocationLoading(false)
				switch (error.code) {
					case error.PERMISSION_DENIED:
						setLocationError('Přístup k poloze byl zamítnut')
						break
					case error.POSITION_UNAVAILABLE:
						setLocationError('Informace o poloze nejsou dostupné')
						break
					case error.TIMEOUT:
						setLocationError('Požadavek na polohu vypršel')
						break
					default:
						setLocationError('Nepodařilo se získat polohu')
				}
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 300000, // 5 minutes
			}
		)
	}, [])

	const clearLocation = useCallback(() => {
		setUserLocation(null)
		setLocationError(null)
	}, [])

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
		freeOnly: freeOnly || undefined,
		lat: userLocation?.lat,
		lng: userLocation?.lng,
		radiusKm: userLocation ? 10 : undefined, // 10km radius when location is set
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

	// Prepare events for map with required fields
	const mapEvents = (events ?? [])
		.filter((e) => e.latitude != null && e.longitude != null)
		.map((e) => ({
			id: e.id,
			title: e.title,
			latitude: e.latitude!,
			longitude: e.longitude!,
			date: e.date,
			startTime: e.startTime,
		}))

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto max-w-4xl px-4 py-6 pb-24">
				<h1 className="text-2xl font-bold text-foreground mb-6">
					Procházet události
				</h1>

				{/* Map with clustering */}
				<EventMap
					events={mapEvents}
					userLocation={userLocation}
					className="h-64 mb-6"
				/>

				{/* Filter Bar */}
				<div className="flex flex-col gap-3 mb-6">
					<div className="flex flex-col sm:flex-row gap-3">
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

					{/* Secondary filters row */}
					<div className="flex flex-wrap items-center gap-4">
						{/* Free only checkbox */}
						<div className="flex items-center space-x-2">
							<Checkbox
								id="freeOnly"
								checked={freeOnly}
								onCheckedChange={(checked) => setFreeOnly(checked === true)}
							/>
							<Label htmlFor="freeOnly" className="text-sm cursor-pointer">
								Pouze zdarma
							</Label>
						</div>

						{/* Geolocation button */}
						<div className="flex items-center gap-2">
							{userLocation ? (
								<Button
									variant="outline"
									size="sm"
									onClick={clearLocation}
									className="text-sm"
								>
									<Locate className="h-4 w-4 mr-1" />
									Zrušit polohu
								</Button>
							) : (
								<Button
									variant="outline"
									size="sm"
									onClick={requestLocation}
									disabled={locationLoading}
									className="text-sm"
								>
									<Locate className="h-4 w-4 mr-1" />
									{locationLoading ? 'Načítám...' : 'Akce poblíž'}
								</Button>
							)}
							{locationError && (
								<span className="text-xs text-destructive">{locationError}</span>
							)}
						</div>
					</div>
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
														{CATEGORIES.find((c) => c.value === event.category)?.label ?? event.category}
													</Badge>
												</div>
												<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
													<span className="flex items-center gap-1">
														<Calendar className="h-3.5 w-3.5 shrink-0" />
														{formatDate(event.date)} v {event.startTime}
													</span>
													<span className="flex items-center gap-1 min-w-0">
														<MapPin className="h-3.5 w-3.5 shrink-0" />
														<span className="truncate">{event.locationName}</span>
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
