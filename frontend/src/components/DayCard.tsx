import { useState } from 'react'
import { ChevronDown, ChevronUp, Navigation, CloudRain, AlertTriangle } from 'lucide-react'
import type { DayPlan, WeatherCondition } from '../types/trip'
import ActivityCard from './ActivityCard'
import { getDayDirectionsUrl } from '../utils/maps'

interface DayCardProps {
  day: DayPlan
  defaultOpen?: boolean
  destination?: string
}

const WEATHER_EMOJI: Record<WeatherCondition | string, string> = {
  sunny: '☀️',
  cloudy: '⛅',
  rainy: '🌧️',
  snowy: '❄️',
  stormy: '⛈️',
  foggy: '🌫️',
}

function formatDateString(dateStr?: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export default function DayCard({ day, defaultOpen = false, destination }: DayCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  // Collect location names for the day route link
  const locationStops = day.activities
    .filter((a) => a.location && a.type !== 'transport')
    .map((a) => a.location!)

  const directionsUrl =
    locationStops.length >= 2 ? getDayDirectionsUrl(locationStops, destination) : null

  const weather = day.weather

  return (
    <div className="card overflow-hidden animate-slide-up">
      {/* Day header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-slate-50/70 transition-colors duration-150 text-left cursor-pointer"
        aria-expanded={open}
        aria-controls={`day-${day.day}-content`}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center flex-shrink-0 shadow-xs">
            <span className="text-sm font-black text-sky-700">{day.day}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                Day {day.day}
              </span>
              {weather?.date && (
                <span className="text-xs font-semibold text-slate-500">
                  · {formatDateString(weather.date)}
                </span>
              )}
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-900">{day.title}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Weather pill on day header */}
          {weather && (
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                weather.avoid_outdoor
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : weather.condition === 'sunny'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-sky-50 text-sky-800 border-sky-200'
              }`}
            >
              <span>{WEATHER_EMOJI[weather.condition] ?? '⛅'}</span>
              <span>
                {weather.temp_max_c !== undefined ? `${weather.temp_max_c}°C` : ''}
              </span>
              <span className="capitalize">{weather.description}</span>
            </div>
          )}

          <div className="text-slate-400">
            {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </button>

      {/* Day content */}
      {open && (
        <div
          id={`day-${day.day}-content`}
          className="px-5 md:px-6 pb-6 pt-2 border-t border-slate-100"
        >
          {/* Weather Details Card if available */}
          {weather && (
            <div
              className={`mb-5 p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm animate-fade-in ${
                weather.avoid_outdoor
                  ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                  : 'bg-sky-50/70 border-sky-200 text-sky-950'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{WEATHER_EMOJI[weather.condition] ?? '⛅'}</span>
                  <span className="font-bold">{weather.description}</span>
                  {weather.date && (
                    <span className="text-xs text-slate-600">({formatDateString(weather.date)})</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  {weather.temp_max_c !== undefined && weather.temp_min_c !== undefined && (
                    <span>
                      🌡️ {weather.temp_min_c}°C – {weather.temp_max_c}°C
                    </span>
                  )}
                  {weather.precipitation_mm !== undefined && weather.precipitation_mm > 0 && (
                    <span className="flex items-center gap-0.5">
                      <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                      <span>{weather.precipitation_mm} mm rain</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Weather Alert if bad weather */}
              {weather.avoid_outdoor && (
                <div className="flex items-start gap-2 pt-2 border-t border-rose-200/80 text-xs font-semibold text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Weather Notice: High chance of precipitation. Atlas has tailored this day's plan with indoor cultural spots, cafes, and museums.
                  </span>
                </div>
              )}

              {/* Weather advice */}
              {weather.advice && !weather.avoid_outdoor && (
                <p className="text-xs text-slate-600 pt-1 leading-relaxed">{weather.advice}</p>
              )}
            </div>
          )}

          {/* Summary on mobile + Maps route button */}
          <div className="flex items-start justify-between gap-3 mb-6">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed flex-1">
              {day.summary}
            </p>
            {directionsUrl && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100/70 border border-sky-200 rounded-xl px-3 py-1.5 transition-colors shadow-xs"
                aria-label={`Open Day ${day.day} route in Google Maps`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Route in Maps</span>
              </a>
            )}
          </div>

          <div className="space-y-0 pl-1">
            {day.activities.map((activity, i) => (
              <ActivityCard
                key={`${activity.time}-${i}`}
                activity={activity}
                destination={destination}
                isLast={i === day.activities.length - 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
