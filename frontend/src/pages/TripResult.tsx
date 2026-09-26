import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Compass, ArrowLeft, RefreshCw, ChevronDown, ChevronUp, Share2, Check } from 'lucide-react'
import type { TripData, TripGenerateRequest } from '../types/trip'
import TripHeader from '../components/TripHeader'
import DayCard from '../components/DayCard'
import BudgetBreakdown from '../components/BudgetBreakdown'
import TripTips from '../components/TripTips'
import RefinePanel from '../components/RefinePanel'
import TripMap from '../components/TripMap'

interface LocationState {
  trip: TripData
  preferences: TripGenerateRequest
  tripId?: string
}

export default function TripResult() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const [trip, setTrip] = useState<TripData | null>(state?.trip ?? null)
  const [showRefine, setShowRefine] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!state?.trip) {
      navigate('/plan')
    }
  }, [state, navigate])

  if (!trip || !state) return null

  const destination = trip.destination

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Sticky Top Navigation */}
      <nav className="sticky top-0 z-30 border-b border-slate-200/80 px-4 md:px-6 py-3.5 flex items-center justify-between bg-white/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/plan')}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer text-sm font-medium"
            aria-label="Back to planner"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="w-px h-5 bg-slate-200 hidden sm:block" />
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-900 text-base tracking-tight">Atlas</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="btn-secondary text-xs sm:text-sm py-1.5 px-3"
            title="Copy trip link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Share'}</span>
          </button>
          <button
            onClick={() => navigate('/plan')}
            className="btn-primary text-xs sm:text-sm py-1.5 px-3.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Trip</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-8 space-y-6 pb-20">
        {/* Header Hero */}
        <TripHeader trip={trip} preferences={state.preferences} />

        {/* Atlas reasoning summary / Trip overview */}
        {trip.why_this_trip && (
          <div className="card p-5 sm:p-6 bg-gradient-to-r from-sky-50/50 via-white to-blue-50/30 border-slate-200">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base">✨</span>
              <p className="text-xs font-bold uppercase tracking-wider text-sky-700">
                Why Atlas Crafted This Route
              </p>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">{trip.why_this_trip}</p>
          </div>
        )}

        {/* Day overview strip — quick anchor navigation */}
        <div>
          <h2 className="section-label mb-3">Jump to Day</h2>
          <div className="flex gap-2.5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {trip.days.map((day) => (
              <a
                key={day.day}
                href={`#day-anchor-${day.day}`}
                className="flex-shrink-0 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 hover:border-sky-300 hover:shadow-xs transition-all text-left group"
              >
                <div className="text-xs text-sky-700 font-extrabold uppercase tracking-wide group-hover:text-sky-800">
                  Day {day.day}
                </div>
                <div className="text-xs text-slate-700 font-medium whitespace-nowrap max-w-[130px] truncate mt-0.5">
                  {day.title}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Day cards with scroll margin to clear sticky nav */}
        <div className="space-y-4">
          {trip.days.map((day, i) => (
            <div key={day.day} id={`day-anchor-${day.day}`} className="scroll-mt-20">
              <DayCard day={day} defaultOpen={i === 0} destination={destination} />
            </div>
          ))}
        </div>

        {/* Interactive Map */}
        <TripMap trip={trip} />

        {/* Budget Breakdown */}
        <BudgetBreakdown budget={trip.estimated_budget} />

        {/* Tips, Food Recommendations, Transit, and Must-Visits */}
        <TripTips trip={trip} />

        {/* Refine Itinerary Panel */}
        <div className="pt-2">
          <button
            onClick={() => setShowRefine(!showRefine)}
            className="w-full card p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer"
            aria-expanded={showRefine}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">✨</span>
              <span className="text-sm font-bold text-slate-900">
                Want to tweak or personalize something?
              </span>
            </div>
            <div className="text-slate-400">
              {showRefine ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {showRefine && (
            <div className="mt-3 animate-slide-up">
              <RefinePanel
                currentTrip={trip}
                preferences={state.preferences}
                onRefined={(newTrip) => {
                  setTrip(newTrip)
                  setShowRefine(false)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
