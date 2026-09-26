import { useEffect, useState } from 'react'
import { Check, Loader2, Compass, X, AlertCircle, RefreshCw } from 'lucide-react'

const STEPS = [
  { label: 'Analyzing your travel inspiration', duration: 1200 },
  { label: 'Resolving verified places & coordinates', duration: 1000 },
  { label: 'Matching travel style & dietary preferences', duration: 900 },
  { label: 'Constructing daily schedule & timeblocks', duration: 1100 },
  { label: 'Optimizing transit & walking routes', duration: 800 },
  { label: 'Computing realistic itemized budget', duration: 700 },
]

const TIMEOUT_MS = 120_000 // 2 minutes

type StepState = 'pending' | 'active' | 'done'

interface AIProgressProps {
  onCancel?: () => void
  error?: string | null
  onRetry?: () => void
}

export default function AIProgress({ onCancel, error, onRetry }: AIProgressProps) {
  const [stepStates, setStepStates] = useState<StepState[]>(
    STEPS.map((_, i) => (i === 0 ? 'active' : 'pending')),
  )
  const [animDone, setAnimDone] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  // Drive step animation
  useEffect(() => {
    if (error) return
    let current = 0

    function advance() {
      if (current >= STEPS.length) {
        setAnimDone(true)
        return
      }
      const delay = STEPS[current].duration
      setTimeout(() => {
        setStepStates((prev) => {
          const next = [...prev]
          next[current] = 'done'
          if (current + 1 < STEPS.length) next[current + 1] = 'active'
          return next
        })
        current++
        advance()
      }, delay)
    }
    advance()
  }, [error])

  // Elapsed counter (shown after animation finishes)
  useEffect(() => {
    if (error) return
    const start = Date.now()
    const id = setInterval(() => {
      const secs = Math.floor((Date.now() - start) / 1000)
      setElapsed(secs)
      if (secs * 1000 >= TIMEOUT_MS) {
        setTimedOut(true)
        clearInterval(id)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [error])

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-8 sm:p-10 flex flex-col items-center justify-center text-center max-w-md mx-auto animate-fade-in my-10">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-5 text-rose-600">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-slate-600 text-sm max-w-sm mb-6 leading-relaxed">{error}</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {onRetry && (
            <button onClick={onRetry} className="btn-primary text-sm">
              <RefreshCw className="w-4 h-4" />
              <span>Try again</span>
            </button>
          )}
          {onCancel && (
            <button onClick={onCancel} className="btn-secondary text-sm">
              Back to planner
            </button>
          )}
        </div>
      </div>
    )
  }

  // Timeout state
  if (timedOut) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-8 sm:p-10 flex flex-col items-center justify-center text-center max-w-md mx-auto animate-fade-in my-10">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-5 text-amber-600">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Taking longer than expected</h2>
        <p className="text-slate-600 text-sm max-w-sm mb-6 leading-relaxed">
          Atlas is still finalizing your itinerary. The AI model might be experiencing temporary high
          load.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {onRetry && (
            <button onClick={onRetry} className="btn-primary text-sm">
              <RefreshCw className="w-4 h-4" />
              <span>Retry request</span>
            </button>
          )}
          {onCancel && (
            <button onClick={onCancel} className="btn-secondary text-sm">
              Back to planner
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-8 sm:p-10 flex flex-col items-center justify-center text-center max-w-md mx-auto animate-fade-in my-10 w-full">
      {/* Logo pulse */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-sm shadow-sky-500/10 animate-pulse-slow">
          <Compass className="w-8 h-8" />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-sky-400/20 animate-ping -z-10" />
      </div>

      <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1.5">
        Planning your trip
      </h2>
      <p className="text-sm text-slate-500 mb-8 max-w-xs leading-relaxed">
        {animDone
          ? `Finalizing details${elapsed > 0 ? ` · ${elapsed}s elapsed` : ''}...`
          : 'Atlas is crafting a personalized, realistic itinerary for you.'}
      </p>

      {/* Step Checklist */}
      <div className="w-full space-y-3 mb-8 text-left">
        {STEPS.map((step, i) => {
          const state = animDone ? 'done' : stepStates[i]
          return (
            <div
              key={step.label}
              className={`flex items-center gap-3 transition-all duration-300 ${
                state === 'pending' ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  state === 'done'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : state === 'active'
                      ? 'bg-sky-100 border border-sky-500 text-sky-700'
                      : 'bg-slate-100 border border-slate-200 text-slate-400'
                }`}
                aria-hidden="true"
              >
                {state === 'done' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                {state === 'active' && (
                  <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                )}
              </div>
              <span
                className={`text-sm ${
                  state === 'done'
                    ? 'text-slate-800 font-medium'
                    : state === 'active'
                      ? 'text-slate-900 font-bold'
                      : 'text-slate-400 font-normal'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}

        {/* Extra indicator after checklist finishes */}
        {animDone && (
          <div className="flex items-center gap-3 pt-1 animate-fade-in">
            <div className="w-6 h-6 rounded-full bg-sky-100 border border-sky-500 flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin" />
            </div>
            <span className="text-sm font-semibold text-sky-700">
              Polishing route & generating budget summary
            </span>
          </div>
        )}
      </div>

      {/* Cancel button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          aria-label="Cancel and return to planner"
        >
          <X className="w-3.5 h-3.5" />
          <span>Cancel generation</span>
        </button>
      )}
    </div>
  )
}
