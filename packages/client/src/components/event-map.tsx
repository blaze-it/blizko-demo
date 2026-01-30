import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
// Fix for default marker icons in Leaflet with bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { useCallback, useEffect, useMemo } from 'react'
import {
	MapContainer,
	Marker,
	Popup,
	TileLayer,
	useMap,
	useMapEvents,
} from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { Link } from 'react-router-dom'

// @ts-expect-error Leaflet's default icon needs manual setup with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
	iconUrl: markerIcon,
	iconRetinaUrl: markerIcon2x,
	shadowUrl: markerShadow,
})

export interface MapEvent {
	id: string
	title: string
	latitude: number
	longitude: number
	date: Date | string
	startTime: string
}

export interface MapBounds {
	north: number
	south: number
	east: number
	west: number
}

interface EventMapProps {
	events: MapEvent[]
	center?: [number, number]
	zoom?: number
	onBoundsChange?: (bounds: MapBounds) => void
	className?: string
	userLocation?: { lat: number; lng: number } | null
}

function formatDate(dateStr: string | Date) {
	const d = new Date(dateStr)
	return d.toLocaleDateString('cs-CZ', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
	})
}

// Component to handle map events and bounds changes
function MapEventHandler({
	onBoundsChange,
}: {
	onBoundsChange?: (bounds: MapBounds) => void
}) {
	const map = useMapEvents({
		moveend: () => {
			if (onBoundsChange) {
				const bounds = map.getBounds()
				onBoundsChange({
					north: bounds.getNorth(),
					south: bounds.getSouth(),
					east: bounds.getEast(),
					west: bounds.getWest(),
				})
			}
		},
		zoomend: () => {
			if (onBoundsChange) {
				const bounds = map.getBounds()
				onBoundsChange({
					north: bounds.getNorth(),
					south: bounds.getSouth(),
					east: bounds.getEast(),
					west: bounds.getWest(),
				})
			}
		},
	})

	// Fire initial bounds on mount
	useEffect(() => {
		if (onBoundsChange) {
			const bounds = map.getBounds()
			onBoundsChange({
				north: bounds.getNorth(),
				south: bounds.getSouth(),
				east: bounds.getEast(),
				west: bounds.getWest(),
			})
		}
	}, [map, onBoundsChange])

	return null
}

// Component to recenter map when user location changes
function RecenterMap({
	userLocation,
}: {
	userLocation?: { lat: number; lng: number } | null
}) {
	const map = useMap()

	useEffect(() => {
		if (userLocation) {
			map.setView([userLocation.lat, userLocation.lng], 13)
		}
	}, [map, userLocation])

	return null
}

// Custom icon for user location
const userLocationIcon = L.divIcon({
	className: 'user-location-marker',
	html: `<div style="
		width: 20px;
		height: 20px;
		background-color: #3b82f6;
		border: 3px solid white;
		border-radius: 50%;
		box-shadow: 0 2px 4px rgba(0,0,0,0.3);
	"></div>`,
	iconSize: [20, 20],
	iconAnchor: [10, 10],
})

export function EventMap({
	events,
	center = [50.0755, 14.4378], // Prague default
	zoom = 13,
	onBoundsChange,
	className = 'h-64',
	userLocation,
}: EventMapProps) {
	const mappableEvents = useMemo(
		() => events.filter((e) => e.latitude != null && e.longitude != null),
		[events],
	)

	const stableOnBoundsChange = useCallback(
		(bounds: MapBounds) => {
			onBoundsChange?.(bounds)
		},
		[onBoundsChange],
	)

	return (
		<div
			className={`w-full rounded-xl overflow-hidden border border-border ${className}`}
		>
			<MapContainer
				center={userLocation ? [userLocation.lat, userLocation.lng] : center}
				zoom={zoom}
				className="h-full w-full"
				scrollWheelZoom={false}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<MapEventHandler onBoundsChange={stableOnBoundsChange} />
				<RecenterMap userLocation={userLocation} />

				{/* User location marker */}
				{userLocation && (
					<Marker
						position={[userLocation.lat, userLocation.lng]}
						icon={userLocationIcon}
					>
						<Popup>Vaše poloha</Popup>
					</Marker>
				)}

				{/* Event markers with clustering */}
				<MarkerClusterGroup
					chunkedLoading
					maxClusterRadius={60}
					spiderfyOnMaxZoom
					showCoverageOnHover={false}
				>
					{mappableEvents.map((event) => (
						<Marker key={event.id} position={[event.latitude, event.longitude]}>
							<Popup>
								<Link
									to={`/events/${event.id}`}
									className="font-semibold hover:underline"
								>
									{event.title}
								</Link>
								<br />
								<span className="text-xs text-muted-foreground">
									{formatDate(event.date)} v {event.startTime}
								</span>
							</Popup>
						</Marker>
					))}
				</MarkerClusterGroup>
			</MapContainer>
		</div>
	)
}
