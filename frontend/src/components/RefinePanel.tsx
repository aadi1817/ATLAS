import { useState } from 'react'
import { Sparkles, Send, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import type { TripData, TripGenerateRequest } from '../types/trip'
import { refineTrip } from '../services/api'

const QUICK_REFINE = [
  { label: 'Make it more budget-friendly', icon: '💰' },
  { label: 'Add more outdoor adventure', icon: '🧗' },
  { label: 'Add authentic local food stops', icon: '🍜' },
  { label: 'Relax the daily pace', icon: '🧘' },
  { label: 'More evening & nightlife spots', icon: '🌙' },
  { label: 'Include more scenic photography spots', icon: '📷' },
]

interface RefinePanelProps {
  currentTrip: TripData
  preferences?: TripGenerateRequest
  onRefined: (newTrip: TripData) => void
}

export default function RefinePanel({ currentTrip, preferences, onRefined }: RefinePanelProps) {
  const [instruction, setInstruction] = useState('')
  const [lastInstruction, setLastInstruction] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRefine(text?: string) {
    const finalInstruction = (text ?? instruction).trim()
    if (!finalInstruction || loading) return

    setLoading(true)
    setError(null)
    setLastInstruction(finalInstruction)

    try {
      const response = await refineTrip(currentTrip, finalInstruction, preferences)
      if (response.success && response.trip) {
        onRefined(response.trip)
        setInstruction('')
      } else {
        setError(response.error ?? 'Could not refine your trip. Please try again.')
      }
    } catch {
      setError("Atlas couldn't refine your trip right now. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function handleRetry() {
    handleRefine(lastInstruction)
  }

  return (
    <div className="card p-5 sm:p-6 md:p-7 bg-white border-slate-200 shadow-md">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Refine Your Trip</h3>
          <p className="text-xs text-slate-500">Ask Atlas to adjust any part of your itinerary</p>
        </div>
      </div>

      {/* Quick refine chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_REFINE.map(({ label, icon }) => (
          <button
            key={label}
            onClick={() => handleRefine(label)}
            disabled={loading}
            className="text-xs sm:text-sm bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2 text-slate-700 hover:border-sky-300 hover:text-sky-800 hover:bg-white transition-all shadow-xs disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
          >
            <span>{icon}</span>
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Custom text input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRefine()
          }}
          placeholder="e.g. swap Day 3 morning for a temple visit, or keep under ₹30,000..."
          disabled={loading}
          className="input-field flex-1 text-xs sm:text-sm"
          aria-label="Refinement instruction"
        />
        <button
          onClick={() => handleRefine()}
          disabled={loading || !instruction.trim()}
          className="btn-primary px-4 flex items-center justify-center min-w-[48px] text-xs sm:text-sm"
          aria-label="Submit refinement"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span className="hidden sm:inline">Apply</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="mt-4 flex items-center gap-2.5 text-xs sm:text-sm text-sky-700 font-medium bg-sky-50 border border-sky-200/80 p-3 rounded-xl animate-fade-in">
          <Loader2 className="w-4 h-4 animate-spin text-sky-600 flex-shrink-0" />
          <span>Atlas is regenerating your itinerary with your updates...</span>
        </div>
      )}

      {/* Error state with retry */}
      {error && !loading && (
        <div className="mt-4 flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 animate-slide-up">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-rose-800">{error}</p>
            {lastInstruction && (
              <button
                onClick={handleRetry}
                className="mt-2 flex items-center gap-1.5 text-xs text-rose-700 hover:text-rose-900 transition-colors font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry update</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
