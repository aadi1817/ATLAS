import { useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Compass, ChevronDown, ChevronUp, ArrowLeft, Sparkles, Check } from 'lucide-react'
import type { PlannerState, TripGenerateRequest } from '../types/trip'
import TravelInput from '../components/TravelInput'
import TravelStyleSelector from '../components/TravelStyleSelector'
import InterestSelector from '../components/InterestSelector'
import PreferenceForm from '../components/PreferenceForm'
import GenerateButton from '../components/GenerateButton'
import AIProgress from '../components/AIProgress'
import { generateTrip } from '../services/api'

const DEFAULT_STATE: PlannerState = {
  travelInput: '',
  additionalPlaces: [],
  durationDays: 5,
  startDate: '',
  budget: undefined,
  budgetType: 'total',
  currency: 'INR',
  travelers: 2,
  startingLocation: '',
  travelStyle: [],
  interests: [],
  otherInterests: '',
  foodPreferences: [],
  cuisinePreferences: [],
  transportation: 'mixed',
  accommodation: 'mid_range',
}

type Section = 'inspiration' | 'style' | 'preferences'

export default function Planner() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const initialDest = params.get('destination') ?? ''
  const initialMode =
    (params.get('mode') as 'idea' | 'reel' | 'maps' | 'video' | null) ||
    (initialDest.includes('instagram.com') ? 'reel' : 'idea')

  const [state, setState] = useState<PlannerState>({
    ...DEFAULT_STATE,
    travelInput: initialDest,
  })
  const [generating, setGenerating] = useState(false)
  const [formError, setFormError] = useState<string | null>(null) // shown inline on form
  const [genError, setGenError] = useState<string | null>(null) // shown on AIProgress screen
  const [openSection, setOpenSection] = useState<Section>('inspiration')

  function update<K extends keyof PlannerState>(key: K, value: PlannerState[K]) {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  function toggleSection(s: Section) {
    setOpenSection((prev) => (prev === s ? 'inspiration' : s))
  }

  async function handleGenerate() {
    if (!state.travelInput.trim()) {
      setFormError('Please enter your travel inspiration or destination first.')
      setOpenSection('inspiration')
      return
    }

    setFormError(null)
    setGenError(null)
    setGenerating(true)

    const request: TripGenerateRequest = {
      travel_input: state.travelInput,
      additional_places: state.additionalPlaces,
      duration_days: state.durationDays,
      start_date: state.startDate || undefined,
      budget: state.budget,
      budget_type: state.budgetType,
      currency: state.currency,
      travelers: state.travelers,
      starting_location: state.startingLocation || undefined,
      travel_style: state.travelStyle,
      interests: state.interests,
      other_interests: state.otherInterests || undefined,
      food_preferences: state.foodPreferences,
      cuisine_preferences: state.cuisinePreferences,
      transportation: state.transportation,
      accommodation: state.accommodation,
    }

    try {
      const response = await generateTrip(request)
      if (response.success && response.trip) {
        navigate('/trip', {
          state: { trip: response.trip, preferences: request, tripId: response.trip_id },
        })
      } else {
        setGenError(response.error ?? "Atlas couldn't generate your trip. Please try again.")
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
      const friendly =
        message.includes('503') || message.includes('API key')
          ? 'Atlas is not configured yet. Please set GEMINI_API_KEY in your backend .env file.'
          : "Atlas couldn't generate your trip right now. Please try again."
      setGenError(friendly)
    } finally {
      setGenerating(false)
    }
  }

  // Show AIProgress fullscreen only while actively generating or after a gen-time error
  if (generating || genError) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        <NavBar />
        <div className="flex-1 max-w-lg mx-auto w-full px-6 flex items-center justify-center">
          <AIProgress
            error={generating ? null : genError}
            onCancel={() => {
              setGenerating(false)
              setGenError(null)
            }}
            onRetry={() => {
              setGenError(null)
              handleGenerate()
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <NavBar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 md:px-6 py-8 space-y-5">
        {/* Page Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Itinerary Designer</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Plan your trip</h1>
          <p className="text-sm text-slate-600 mt-1">
            Specify your inspiration and preferences. Atlas will organize the rest.
          </p>
        </div>

        {/* Section 1: Inspiration */}
        <AccordionSection
          id="inspiration"
          number="1"
          title="Destination & Inspiration"
          emoji="🎬"
          open={openSection === 'inspiration'}
          onToggle={() => toggleSection('inspiration')}
          isCompleted={state.travelInput.trim().length > 0}
          badge={state.travelInput ? 'Added' : 'Required'}
        >
          <TravelInput
            value={state.travelInput}
            additionalPlaces={state.additionalPlaces}
            onChange={(v) => update('travelInput', v)}
            onAdditionalPlacesChange={(v) => update('additionalPlaces', v)}
            initialMode={initialMode}
            onReelExtracted={({ durationDays, styles }) => {
              if (durationDays) update('durationDays', durationDays)
              if (styles && styles.length > 0) {
                update('travelStyle', styles)
              }
            }}
          />
        </AccordionSection>

        {/* Section 2: Style & Interests */}
        <AccordionSection
          id="style"
          number="2"
          title="Travel Style & Interests"
          emoji="🎒"
          open={openSection === 'style'}
          onToggle={() => toggleSection('style')}
          isCompleted={state.travelStyle.length > 0 || state.interests.length > 0}
          badge={
            state.travelStyle.length + state.interests.length > 0
              ? `${state.travelStyle.length + state.interests.length} selected`
              : undefined
          }
        >
          <div className="space-y-6 pt-2">
            <div>
              <p className="section-label">Travel Style</p>
              <TravelStyleSelector
                selected={state.travelStyle}
                onChange={(v) => update('travelStyle', v)}
              />
            </div>
            <div>
              <p className="section-label">Your Interests</p>
              <InterestSelector
                selected={state.interests}
                otherInterests={state.otherInterests}
                onChange={(v) => update('interests', v)}
                onOtherChange={(v) => update('otherInterests', v)}
              />
            </div>
          </div>
        </AccordionSection>

        {/* Section 3: Preferences & Details */}
        <AccordionSection
          id="preferences"
          number="3"
          title="Trip Logistics & Budget"
          emoji="⚙️"
          open={openSection === 'preferences'}
          onToggle={() => toggleSection('preferences')}
          isCompleted={true}
          badge={`${state.durationDays} days · ${state.startDate ? state.startDate + ' · ' : ''}${state.travelers} traveler${state.travelers > 1 ? 's' : ''}`}
        >
          <div className="pt-2">
            <PreferenceForm state={state} onChange={update} />
          </div>
        </AccordionSection>

        {/* Inline form validation error */}
        {formError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700 flex items-center gap-2.5 animate-slide-up shadow-xs">
            <span className="text-base">⚠️</span>
            <span className="font-medium">{formError}</span>
          </div>
        )}

        {/* Generate Button Container */}
        <div className="pt-4 pb-12">
          <GenerateButton
            onClick={handleGenerate}
            loading={generating}
            disabled={!state.travelInput.trim()}
          />
          <p className="text-center text-xs text-slate-500 mt-3 font-medium">
            ⚡ Powered by Gemini AI · Custom routing, meals & realistic budget included
          </p>
        </div>
      </main>
    </div>
  )
}

function NavBar() {
  const navigate = useNavigate()
  return (
    <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer text-sm font-medium mr-2"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </button>
        <div className="w-px h-5 bg-slate-200 hidden sm:block" />
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
          aria-label="Atlas Home"
        >
          <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-900 text-base tracking-tight">Atlas</span>
        </button>
      </div>

      <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
        Step-by-step Planner
      </div>
    </nav>
  )
}

interface AccordionSectionProps {
  id: string
  number: string
  title: string
  emoji: string
  open: boolean
  isCompleted?: boolean
  onToggle: () => void
  badge?: string
  children: ReactNode
}

function AccordionSection({
  id,
  number,
  title,
  emoji,
  open,
  isCompleted,
  onToggle,
  badge,
  children,
}: AccordionSectionProps) {
  return (
    <div className="card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50/70 transition-colors text-left cursor-pointer"
        aria-expanded={open}
        aria-controls={`section-${id}`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-700 flex-shrink-0">
            {isCompleted && !open ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <span>{number}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base">{emoji}</span>
              <span className="font-bold text-slate-900 text-base">{title}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {badge && !open && (
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                badge === 'Required'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-sky-50 text-sky-700 border-sky-200'
              }`}
            >
              {badge}
            </span>
          )}
          <div className="text-slate-400">
            {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </button>

      {open && (
        <div id={`section-${id}`} className="px-5 pb-6 pt-2 border-t border-slate-100 animate-slide-up">
          {children}
        </div>
      )}
    </div>
  )
}
