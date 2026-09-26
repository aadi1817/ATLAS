import { Clock, Lightbulb, MapPin, ExternalLink } from 'lucide-react'
import type { Activity, ActivityType } from '../types/trip'
import { useState } from 'react'
import { getPlaceSearchUrl } from '../utils/maps'

const TYPE_CONFIG: Record<ActivityType, { emoji: string; bg: string }> = {
  accommodation: { emoji: '🏨', bg: 'bg-purple-50 border-purple-200 text-purple-700' },
  food:          { emoji: '🍽️', bg: 'bg-orange-50 border-orange-200 text-orange-700' },
  beach:         { emoji: '🏖️', bg: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
  nature:        { emoji: '🌿', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  culture:       { emoji: '🏛️', bg: 'bg-amber-50 border-amber-200 text-amber-700' },
  adventure:     { emoji: '🧗', bg: 'bg-rose-50 border-rose-200 text-rose-700' },
  shopping:      { emoji: '🛍️', bg: 'bg-pink-50 border-pink-200 text-pink-700' },
  transport:     { emoji: '🚌', bg: 'bg-blue-50 border-blue-200 text-blue-700' },
  nightlife:     { emoji: '🌙', bg: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  photography:   { emoji: '📷', bg: 'bg-teal-50 border-teal-200 text-teal-700' },
  activity:      { emoji: '⭐', bg: 'bg-sky-50 border-sky-200 text-sky-700' },
}

interface ActivityCardProps {
  activity: Activity
  destination?: string
  isLast?: boolean
}

export default function ActivityCard({ activity, destination, isLast }: ActivityCardProps) {
  const [showWhy, setShowWhy] = useState(false)
  const config = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.activity

  // Use location field if available, fall back to title for Maps search
  const mapsLabel = activity.location || activity.title
  const mapsUrl = getPlaceSearchUrl(mapsLabel, destination)

  return (
    <div className="flex gap-4 group animate-slide-up">
      {/* Timeline connector */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm border shadow-xs ${config.bg}`}
          aria-hidden="true"
        >
          {config.emoji}
        </div>
        {!isLast && <div className="w-0.5 flex-1 my-1.5 bg-slate-200 min-h-[1.75rem]" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Time + duration */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold text-sky-700 flex items-center gap-1 bg-sky-50 border border-sky-200/80 px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3 text-sky-600" />
                {activity.time}
              </span>
              {activity.duration && (
                <span className="text-xs text-slate-500 font-medium">· {activity.duration}</span>
              )}
            </div>

            {/* Title */}
            <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {activity.title}
            </h4>

            {/* Location pill — clickable Google Maps link */}
            {activity.location && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1 text-xs text-slate-500 hover:text-sky-700 transition-colors group/loc"
                aria-label={`Open ${activity.location} in Google Maps`}
              >
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 group-hover/loc:text-sky-600" />
                <span className="truncate max-w-[260px] underline decoration-slate-300 underline-offset-2">
                  {activity.location}
                </span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover/loc:opacity-100 transition-opacity" />
              </a>
            )}

            {/* Description */}
            {activity.description && (
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {activity.description}
              </p>
            )}
          </div>

          {/* Why this? concierge button */}
          {activity.why_selected && (
            <button
              onClick={() => setShowWhy(!showWhy)}
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-amber-700 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all cursor-pointer"
              aria-label="Why Atlas chose this activity"
              aria-expanded={showWhy}
              title="Why Atlas chose this"
            >
              <Lightbulb className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Why expanded insight panel */}
        {showWhy && activity.why_selected && (
          <div className="mt-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 animate-fade-in shadow-xs">
            <p className="font-bold text-amber-800 mb-0.5 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              Why Atlas selected this
            </p>
            <p className="leading-relaxed">{activity.why_selected}</p>
          </div>
        )}
      </div>
    </div>
  )
}
