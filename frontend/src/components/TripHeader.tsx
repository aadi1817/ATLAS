import type { ReactNode } from 'react'
import { MapPin, Calendar, Users, Wallet, Compass, CloudSun } from 'lucide-react'
import type { TripData, TripGenerateRequest } from '../types/trip'

interface TripHeaderProps {
  trip: TripData
  preferences?: Partial<TripGenerateRequest>
}

function formatBudget(amount: number, currency: string) {
  if (currency === 'INR') {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${Math.round(amount / 1000)}k`
    return `₹${amount}`
  }
  return `${currency} ${amount.toLocaleString()}`
}

function formatDateRange(startDateStr?: string, durationDays: number = 1): string | null {
  if (!startDateStr) return null
  try {
    const start = new Date(startDateStr)
    const end = new Date(start)
    end.setDate(end.getDate() + Math.max(1, durationDays) - 1)

    const startFormatted = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endFormatted = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    return `${startFormatted} – ${endFormatted}`
  } catch {
    return null
  }
}

export default function TripHeader({ trip, preferences }: TripHeaderProps) {
  const styles = preferences?.travel_style ?? []
  const currency = trip.estimated_budget.currency ?? 'INR'
  const dateRange = formatDateRange(trip.start_date, trip.recommended_duration)

  return (
    <div className="relative overflow-hidden rounded-3xl card p-6 sm:p-8 md:p-9 bg-gradient-to-br from-sky-50/70 via-white to-blue-50/40 border-slate-200 shadow-sm">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-sky-100/40 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/3 -z-0" />

      <div className="relative z-10">
        {/* Destination name & summary */}
        <div className="flex items-start gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm shadow-sky-500/20 text-white">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                Curated Itinerary
              </span>
              {trip.has_weather && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <CloudSun className="w-3 h-3 text-emerald-600" />
                  <span>Real Weather Synced</span>
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-none mb-2 break-words">
              {trip.destination}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
              {trip.summary}
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat
            icon={<Calendar className="w-4 h-4 text-sky-600" />}
            label="Duration & Dates"
            value={`${trip.recommended_duration} Days`}
            subValue={dateRange}
          />
          <Stat
            icon={<Users className="w-4 h-4 text-sky-600" />}
            label="Travelers"
            value={`${preferences?.travelers ?? 2} People`}
          />
          <Stat
            icon={<Wallet className="w-4 h-4 text-sky-600" />}
            label="Est. Budget"
            value={formatBudget(trip.estimated_budget.total, currency)}
          />
          <Stat
            icon={<MapPin className="w-4 h-4 text-sky-600" />}
            label="Starting From"
            value={preferences?.starting_location ?? 'Flexible'}
          />
        </div>

        {/* Travel style tags */}
        {styles.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {styles.map((s) => (
              <span
                key={s}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 border border-sky-200 text-sky-800 shadow-xs capitalize"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  subValue,
}: {
  icon: ReactNode
  label: string
  value: string
  subValue?: string | null
}) {
  return (
    <div className="bg-white/95 rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div>
        <span className="text-sm sm:text-base font-extrabold text-slate-900 truncate block">
          {value}
        </span>
        {subValue && (
          <span className="text-[11px] font-semibold text-sky-700 truncate block mt-0.5">
            {subValue}
          </span>
        )}
      </div>
    </div>
  )
}
