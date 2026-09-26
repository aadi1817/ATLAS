import { useEffect, useRef, useState } from 'react'
import { MapPin, Layers, X, ExternalLink } from 'lucide-react'
import type { TripData, Activity, ActivityType } from '../types/trip'
import type { Map as LeafletMap, Marker as LeafletMarker, Polyline as LeafletPolyline } from 'leaflet'
import { getPlaceSearchUrl } from '../utils/maps'

interface MapPoint {
  lat: number
  lng: number
  activity: Activity
  day: number
  index: number
}

interface TripMapProps {
  trip: TripData
}

const DAY_COLORS = [
  '#0284c7', // Sky
  '#ea580c', // Orange
  '#16a34a', // Green
  '#9333ea', // Purple
  '#e11d48', // Rose
  '#ca8a04', // Yellow
  '#db2777', // Pink
  '#0d9488', // Teal
]

const TYPE_EMOJI: Record<ActivityType | string, string> = {
  accommodation: '🏨', food: '🍽️', beach: '🏖️', nature: '🌿',
  culture: '🏛️', adventure: '🧗', shopping: '🛍️', transport: '🚌',
  nightlife: '🌙', photography: '📷', activity: '⭐',
}

function collectMapPoints(trip: TripData): MapPoint[] {
  const points: MapPoint[] = []
  for (const day of trip.days) {
    day.activities.forEach((activity, index) => {
      if (activity.latitude && activity.longitude) {
        points.push({ lat: activity.latitude, lng: activity.longitude, activity, day: day.day, index })
      }
    })
  }
  return points
}

function dayColor(day: number) {
  return DAY_COLORS[(day - 1) % DAY_COLORS.length]
}

function createPinHtml(color: string, emoji: string, label: string): string {
  const safe = label.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer">
    <div style="width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
      background:${color};border:2px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.25);
      display:flex;align-items:center;justify-content:center">
      <span style="transform:rotate(45deg);font-size:13px;line-height:1">${emoji}</span>
    </div>
    <div style="margin-top:3px;background:#ffffff;color:#0f172a;border:1px solid #cbd5e1;font-size:10px;font-weight:700;
      padding:1px 6px;border-radius:6px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.1);
      max-width:90px;overflow:hidden;text-overflow:ellipsis">${safe}</div>
  </div>`
}

export default function TripMap({ trip }: TripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMap = useRef<LeafletMap | null>(null)
  const markersRef = useRef<LeafletMarker[]>([])
  const polylinesRef = useRef<LeafletPolyline[]>([])
  const [activeDay, setActiveDay] = useState<number | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null)
  const [leafletReady, setLeafletReady] = useState(false)
  const points = collectMapPoints(trip)

  // Inject Leaflet CSS once
  useEffect(() => {
    if (!document.querySelector('link[data-leaflet]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.setAttribute('data-leaflet', '1')
      document.head.appendChild(link)
    }
    setLeafletReady(true)
  }, [])

  // Initialise map
  useEffect(() => {
    if (!leafletReady || !mapRef.current || points.length === 0 || leafletMap.current) return

    import('leaflet').then((L) => {
      if (!mapRef.current || leafletMap.current) return

      const map = L.map(mapRef.current, {
        center: [points[0].lat, points[0].lng],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true,
      })
      leafletMap.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      renderOverlays(L, map, points, null)

      if (points.length > 1) {
        map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), { padding: [40, 40] })
      }
    })

    return () => {
      leafletMap.current?.remove()
      leafletMap.current = null
    }
  }, [leafletReady, points.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update overlays when active day changes
  useEffect(() => {
    if (!leafletMap.current || !leafletReady) return
    import('leaflet').then((L) => {
      if (!leafletMap.current) return
      renderOverlays(L, leafletMap.current, points, activeDay)

      const targetPts = activeDay !== null ? points.filter((p) => p.day === activeDay) : points
      if (targetPts.length > 1) {
        const padding: [number, number] = activeDay !== null ? [60, 60] : [40, 40]
        leafletMap.current.fitBounds(
          L.latLngBounds(targetPts.map((p) => [p.lat, p.lng])),
          { padding },
        )
      }
    })
  }, [activeDay]) // eslint-disable-line react-hooks/exhaustive-deps

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function renderOverlays(L: any, map: LeafletMap, allPoints: MapPoint[], filterDay: number | null) {
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
    polylinesRef.current.forEach((p) => p.remove())
    polylinesRef.current = []

    const visible = filterDay !== null ? allPoints.filter((p) => p.day === filterDay) : allPoints

    // Group by day for polylines
    const byDay: Record<number, MapPoint[]> = {}
    for (const p of visible) {
      ;(byDay[p.day] ??= []).push(p)
    }

    // Draw route lines
    for (const [day, pts] of Object.entries(byDay)) {
      if (pts.length > 1) {
        const line = L.polyline(
          pts.map((p: MapPoint) => [p.lat, p.lng]),
          { color: dayColor(Number(day)), weight: 3, opacity: 0.7, dashArray: '6,6' },
        ).addTo(map)
        polylinesRef.current.push(line)
      }
    }

    // Draw markers
    for (const point of visible) {
      const color = dayColor(point.day)
      const emoji = TYPE_EMOJI[point.activity.type] ?? '📍'
      const shortTitle = point.activity.title.length > 18
        ? point.activity.title.slice(0, 17) + '…'
        : point.activity.title

      const icon = L.divIcon({
        html: createPinHtml(color, emoji, shortTitle),
        className: '',
        iconSize: [36, 52],
        iconAnchor: [18, 52],
        popupAnchor: [0, -54],
      })

      const marker = L.marker([point.lat, point.lng], { icon }).addTo(map)
      marker.on('click', () => setSelectedPoint(point))
      markersRef.current.push(marker)
    }
  }

  if (points.length === 0) {
    return (
      <div className="card p-6 flex items-center justify-center gap-3 text-slate-500 h-48 bg-white">
        <MapPin className="w-5 h-5 text-slate-400" />
        <span className="text-sm font-medium">No verified map coordinates available for this trip.</span>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-bold text-slate-900">Interactive Route Map</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 ml-1">
            {points.length} locations
          </span>
        </div>
        <Layers className="w-4 h-4 text-slate-400" />
      </div>

      {/* Day filter tabs */}
      <div className="flex gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50/50 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setActiveDay(null)}
          className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer shadow-xs ${
            activeDay === null
              ? 'bg-sky-50 border-sky-400 text-sky-800 ring-1 ring-sky-300/40'
              : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          All Days
        </button>
        {trip.days.map((day) => {
          if (!points.some((p) => p.day === day.day)) return null
          const color = dayColor(day.day)
          const isActive = activeDay === day.day
          return (
            <button
              key={day.day}
              onClick={() => setActiveDay(isActive ? null : day.day)}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer shadow-xs ${
                isActive ? '' : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
              style={
                isActive
                  ? { background: `${color}15`, borderColor: color, color: color }
                  : {}
              }
            >
              Day {day.day}
            </button>
          )
        })}
      </div>

      {/* Map canvas */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-72 sm:h-96 md:h-[420px]"
          aria-label="Interactive trip map"
        />

        {/* Activity popup */}
        {selectedPoint && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xl z-[1000] animate-slide-up">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 shadow-xs"
                  style={{ background: `${dayColor(selectedPoint.day)}15` }}
                >
                  {TYPE_EMOJI[selectedPoint.activity.type] ?? '📍'}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">
                    Day {selectedPoint.day} · {selectedPoint.activity.time}
                  </p>
                  <p className="text-sm font-bold text-slate-900 leading-tight truncate">
                    {selectedPoint.activity.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPoint(null)}
                className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close popup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedPoint.activity.location && (
              <a
                href={getPlaceSearchUrl(selectedPoint.activity.location, trip.destination)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 mb-2 text-xs font-medium text-sky-700 hover:text-sky-800 transition-colors group"
              >
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate underline decoration-slate-300 underline-offset-2">
                  {selectedPoint.activity.location}
                </span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            )}

            {selectedPoint.activity.description && (
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {selectedPoint.activity.description}
              </p>
            )}

            {selectedPoint.activity.duration && (
              <p className="text-[11px] text-slate-500 font-medium mt-2">
                ⏱ Duration: {selectedPoint.activity.duration}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer legend */}
      <div className="px-5 py-3 border-t border-slate-200 bg-white">
        <p className="text-xs text-slate-500">
          Tap any map pin for details · Dashed lines indicate the daily route sequence · Map data ©{' '}
          <a
            href="https://www.openstreetmap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-600 hover:underline font-medium"
          >
            OpenStreetMap
          </a>
        </p>
      </div>
    </div>
  )
}
