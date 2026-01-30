import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EventMap, type MapEvent } from '@/components/event-map'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
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

type CategoryValue =
	| 'WORKOUT'
	| 'WORKSHOP'
	| 'KIDS'
	| 'MEETUP'
	| 'LECTURE'
	| 'LEISURE'
	| 'OTHER'

export interface MapFilters {
	category?: CategoryValue
	dateFrom?: string
	dateTo?: string
	priceMin?: number
	priceMax?: number
}

interface EventMapWithFiltersProps {
	center?: [number, number]
	zoom?: number
	className?: string
	userLocation?: { lat: number; lng: number } | null
	/** If true, filters are shown expanded by default */
	filtersExpanded?: boolean
	/** Callback when filters change */
	onFiltersChange?: (filters: MapFilters) => void
}

export function EventMapWithFilters({
	center,
	zoom = 11,
	className = 'h-96',
	userLocation,
	filtersExpanded = false,
	onFiltersChange,
}: EventMapWithFiltersProps) {
	const [searchParams, setSearchParams] = useSearchParams()
	const [isExpanded, setIsExpanded] = useState(filtersExpanded)

	// Read filters from URL params
	const category = searchParams.get('category') as CategoryValue | null
	const dateFrom = searchParams.get('dateFrom')
	const dateTo = searchParams.get('dateTo')
	const priceMinParam = searchParams.get('priceMin')
	const priceMaxParam = searchParams.get('priceMax')

	const priceMin = priceMinParam ? parseInt(priceMinParam, 10) : undefined
	const priceMax = priceMaxParam ? parseInt(priceMaxParam, 10) : undefined

	// Query events with filters
	const { data, isLoading } = trpc.events.list.useQuery({
		category: category || undefined,
		dateFrom: dateFrom || undefined,
		dateTo: dateTo || undefined,
		priceMin,
		priceMax,
		limit: 100, // Get more events for map view
	})

	// Prepare events for map
	const mapEvents: MapEvent[] = (data?.items ?? [])
		.filter((e) => e.latitude != null && e.longitude != null)
		.map((e) => ({
			id: e.id,
			title: e.title,
			latitude: e.latitude!,
			longitude: e.longitude!,
			date: e.date,
			startTime: e.startTime,
		}))

	// Update URL params when filter changes
	const updateFilter = useCallback(
		(key: string, value: string | null) => {
			setSearchParams(
				(prev) => {
					const newParams = new URLSearchParams(prev)
					if (value === null || value === '' || value === 'ALL') {
						newParams.delete(key)
					} else {
						newParams.set(key, value)
					}
					return newParams
				},
				{ replace: true },
			)
		},
		[setSearchParams],
	)

	// Clear all filters
	const clearFilters = useCallback(() => {
		setSearchParams(
			(prev) => {
				const newParams = new URLSearchParams(prev)
				newParams.delete('category')
				newParams.delete('dateFrom')
				newParams.delete('dateTo')
				newParams.delete('priceMin')
				newParams.delete('priceMax')
				return newParams
			},
			{ replace: true },
		)
	}, [setSearchParams])

	// Check if any filter is active
	const hasActiveFilters =
		category || dateFrom || dateTo || priceMin || priceMax

	// Notify parent of filter changes
	useEffect(() => {
		onFiltersChange?.({
			category: category || undefined,
			dateFrom: dateFrom || undefined,
			dateTo: dateTo || undefined,
			priceMin,
			priceMax,
		})
	}, [category, dateFrom, dateTo, priceMin, priceMax, onFiltersChange])

	// Count active filters for badge
	const activeFilterCount = [
		category,
		dateFrom,
		dateTo,
		priceMin,
		priceMax,
	].filter(Boolean).length

	return (
		<div
			className={`relative w-full rounded-xl overflow-hidden border border-border ${className}`}
		>
			{/* Filter toggle button */}
			<div className="absolute top-3 left-3 z-[1000]">
				<Button
					variant="secondary"
					size="sm"
					onClick={() => setIsExpanded(!isExpanded)}
					className="shadow-md bg-card/95 backdrop-blur-sm"
				>
					<Filter className="h-4 w-4 mr-1.5" />
					Filtry
					{activeFilterCount > 0 && (
						<span className="ml-1.5 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs font-medium">
							{activeFilterCount}
						</span>
					)}
					{isExpanded ? (
						<ChevronUp className="h-4 w-4 ml-1" />
					) : (
						<ChevronDown className="h-4 w-4 ml-1" />
					)}
				</Button>
			</div>

			{/* Filter panel */}
			{isExpanded && (
				<div className="absolute top-14 left-3 right-3 sm:right-auto sm:w-80 z-[1000] bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border border-border p-4">
					<div className="flex items-center justify-between mb-3">
						<h3 className="font-semibold text-sm">Filtrovat události</h3>
						{hasActiveFilters && (
							<Button
								variant="ghost"
								size="sm"
								onClick={clearFilters}
								className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
							>
								<X className="h-3 w-3 mr-1" />
								Smazat filtry
							</Button>
						)}
					</div>

					<div className="space-y-3">
						{/* Category filter */}
						<div>
							<Label className="text-xs text-muted-foreground mb-1 block">
								Kategorie
							</Label>
							<Select
								value={category || 'ALL'}
								onValueChange={(value) => updateFilter('category', value)}
							>
								<SelectTrigger className="h-9">
									<SelectValue placeholder="Vyberte kategorii" />
								</SelectTrigger>
								<SelectContent>
									{CATEGORIES.map((cat) => (
										<SelectItem key={cat.value} value={cat.value}>
											{cat.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Date range filter */}
						<div className="grid grid-cols-2 gap-2">
							<div>
								<Label className="text-xs text-muted-foreground mb-1 block">
									Datum od
								</Label>
								<Input
									type="date"
									value={dateFrom || ''}
									onChange={(e) => updateFilter('dateFrom', e.target.value)}
									className="h-9"
								/>
							</div>
							<div>
								<Label className="text-xs text-muted-foreground mb-1 block">
									Datum do
								</Label>
								<Input
									type="date"
									value={dateTo || ''}
									onChange={(e) => updateFilter('dateTo', e.target.value)}
									className="h-9"
								/>
							</div>
						</div>

						{/* Price range filter */}
						<div className="grid grid-cols-2 gap-2">
							<div>
								<Label className="text-xs text-muted-foreground mb-1 block">
									Cena od (Kč)
								</Label>
								<Input
									type="number"
									min={0}
									placeholder="0"
									value={priceMin ?? ''}
									onChange={(e) =>
										updateFilter(
											'priceMin',
											e.target.value ? e.target.value : null,
										)
									}
									className="h-9"
								/>
							</div>
							<div>
								<Label className="text-xs text-muted-foreground mb-1 block">
									Cena do (Kč)
								</Label>
								<Input
									type="number"
									min={0}
									placeholder="Bez limitu"
									value={priceMax ?? ''}
									onChange={(e) =>
										updateFilter(
											'priceMax',
											e.target.value ? e.target.value : null,
										)
									}
									className="h-9"
								/>
							</div>
						</div>
					</div>

					{/* Results count */}
					<div className="mt-3 pt-3 border-t border-border">
						<p className="text-xs text-muted-foreground">
							{isLoading ? (
								'Načítám...'
							) : (
								<>
									Nalezeno <strong>{mapEvents.length}</strong> událostí
								</>
							)}
						</p>
					</div>
				</div>
			)}

			{/* Map */}
			<EventMap
				events={mapEvents}
				center={center}
				zoom={zoom}
				className="h-full"
				userLocation={userLocation}
			/>
		</div>
	)
}
