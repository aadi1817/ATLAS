import { Lightbulb, Utensils, MapPin, Car, ExternalLink, CloudSun } from 'lucide-react'
import type { TripData, WeatherCondition } from '../types/trip'
import { getPlaceSearchUrl } from '../utils/maps'

interface TripTipsProps {
  trip: TripData
}

const WEATHER_EMOJI: Record<WeatherCondition | string, string> = {
  sunny: '☀️',
  cloudy: '⛅',
  rainy: '🌧️',
  snowy: '❄️',
  stormy: '⛈️',
  foggy: '🌫️',
}

export default function TripTips({ trip }: TripTipsProps) {
  const daysWithWeather = trip.days.filter((d) => d.weather)

  return (
    <div className="space-y-4">
      {/* Weather Forecast Outlook if available */}
      {daysWithWeather.length > 0 && (
        <div className="card p-5 sm:p-6 bg-gradient-to-br from-sky-50/60 via-white to-blue-50/40">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs">
                <CloudSun className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Trip Weather Outlook</h3>
                <p className="text-xs text-slate-500 font-medium">Real-time forecast from Open-Meteo</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Live Synced
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {daysWithWeather.map((d) => {
              const w = d.weather!
              return (
                <div
                  key={d.day}
                  className={`p-3 rounded-xl border text-center flex flex-col justify-between ${
                    w.avoid_outdoor
                      ? 'bg-rose-50/80 border-rose-200'
                      : 'bg-white border-slate-200/90 shadow-xs'
                  }`}
                >
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Day {d.day}
                  </div>
                  <div className="text-2xl my-1">{WEATHER_EMOJI[w.condition] ?? '⛅'}</div>
                  <div className="text-xs font-bold text-slate-900">
                    {w.temp_max_c !== undefined ? `${w.temp_max_c}°C` : '—'}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate capitalize mt-0.5">
                    {w.description}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Travel tips */}
      {trip.tips.length > 0 && (
        <div className="card p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Essential Travel Tips</h3>
          </div>
          <ul className="space-y-2.5">
            {trip.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                <span className="text-sky-700 font-extrabold flex-shrink-0 mt-0.5 tabular-nums bg-sky-50 border border-sky-200/60 w-5 h-5 rounded-md flex items-center justify-center text-xs">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Food recommendations */}
      {trip.food_recommendations.length > 0 && (
        <div className="card p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-xs">
              <Utensils className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Curated Dining & Food Stops</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3.5">
            {trip.food_recommendations.map((food, i) => (
              <div
                key={i}
                className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <a
                      href={getPlaceSearchUrl(food.name, trip.destination)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-slate-900 hover:text-sky-700 transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <span>{food.name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-600 transition-colors" />
                    </a>
                    <span className="text-xs">🍴</span>
                  </div>
                  {food.reason && (
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">{food.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transportation & Getting around */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
            <Car className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Getting Around</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {trip.transportation.recommendation}
        </p>
        {trip.transportation.estimated_cost && (
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
            <span>Estimated transit cost: {trip.transportation.estimated_cost}</span>
          </div>
        )}
      </div>

      {/* Optional places — each links to Maps */}
      {trip.optional_places.length > 0 && (
        <div className="card p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 shadow-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Alternative & Extra Spots</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {trip.optional_places.map((place, i) => (
              <a
                key={i}
                href={getPlaceSearchUrl(place, trip.destination)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2 text-slate-700 hover:border-sky-300 hover:bg-white hover:text-sky-800 transition-all shadow-xs group"
              >
                <span>📍 {place}</span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-600 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
