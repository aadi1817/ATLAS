import { Minus, Plus, Users, MapPin, Utensils, Bed, Car, Clock, Wallet, Calendar, CloudSun, Sparkles } from 'lucide-react'
import type {
  FoodPreference,
  AccommodationPreference,
  TransportationPreference,
  PlannerState,
} from '../types/trip'

const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8]

const BUDGET_PRESETS = [
  { label: '₹10k', value: 10000 },
  { label: '₹25k', value: 25000 },
  { label: '₹50k', value: 50000 },
  { label: '₹1L', value: 100000 },
  { label: '₹2L', value: 200000 },
]

const FOOD_PREFS: { value: FoodPreference; label: string }[] = [
  { value: 'no_preference', label: 'No preference' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'non_vegetarian', label: 'Non-vegetarian' },
  { value: 'halal', label: 'Halal' },
  { value: 'jain', label: 'Jain' },
]

const ACCOMMODATION_OPTIONS: { value: AccommodationPreference; label: string; icon: string }[] = [
  { value: 'budget', label: 'Budget Stay', icon: '💰' },
  { value: 'mid_range', label: 'Mid-range Hotel', icon: '🏨' },
  { value: 'luxury', label: 'Luxury Resort', icon: '✨' },
  { value: 'hostel', label: 'Hostel / Social', icon: '🎒' },
  { value: 'hotel', label: 'Boutique Hotel', icon: '🏩' },
  { value: 'airbnb', label: 'Vacation Home', icon: '🏡' },
]

const TRANSPORT_OPTIONS: { value: TransportationPreference; label: string; icon: string }[] = [
  { value: 'public', label: 'Public Transit', icon: '🚇' },
  { value: 'taxi', label: 'Taxi / Cab', icon: '🚕' },
  { value: 'rental_car', label: 'Rental Car', icon: '🚗' },
  { value: 'walking', label: 'Walking Friendly', icon: '🚶' },
  { value: 'mixed', label: 'Mixed / Flexible', icon: '🔀' },
]

function getTomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

function getNextWeekend(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = (6 - day + 7) % 7 || 7 // Saturday
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

function getNextWeek(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().split('T')[0]
}

function isWeatherEligible(dateStr?: string): boolean {
  if (!dateStr) return false
  const target = new Date(dateStr).getTime()
  const now = new Date().setHours(0, 0, 0, 0)
  const diffDays = Math.round((target - now) / (1000 * 60 * 60 * 24))
  return diffDays >= 0 && diffDays <= 16
}

interface PreferenceFormProps {
  state: PlannerState
  onChange: <K extends keyof PlannerState>(key: K, value: PlannerState[K]) => void
}

export default function PreferenceForm({ state, onChange }: PreferenceFormProps) {
  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const weatherEligible = isWeatherEligible(state.startDate)

  return (
    <div className="space-y-7">
      {/* Duration */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Clock className="w-4 h-4 text-sky-600" />
          <p className="section-label mb-0">Trip Duration (Days)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onChange('durationDays', d)}
              aria-pressed={state.durationDays === d}
              className={`w-12 h-11 rounded-xl text-sm font-semibold border transition-all duration-150 cursor-pointer ${
                state.durationDays === d
                  ? 'bg-sky-50 border-sky-400 text-sky-800 font-bold ring-1 ring-sky-300/50 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
              }`}
            >
              {d === 8 ? '8+' : `${d}d`}
            </button>
          ))}
        </div>
      </div>

      {/* Start Date & Live Weather */}
      <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/90 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-600" />
            <p className="section-label mb-0">Trip Start Date (Optional)</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
            <CloudSun className="w-3.5 h-3.5 text-sky-600" />
            <span>Weather Enabled</span>
          </span>
        </div>

        {/* Quick Date Presets */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Tomorrow', val: getTomorrow() },
            { label: 'This Weekend', val: getNextWeekend() },
            { label: 'In 1 Week', val: getNextWeek() },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange('startDate', preset.val)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                state.startDate === preset.val
                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {preset.label}
            </button>
          ))}
          {state.startDate && (
            <button
              type="button"
              onClick={() => onChange('startDate', '')}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Date Input */}
        <div className="relative">
          <input
            type="date"
            min={today}
            max={maxDate}
            value={state.startDate}
            onChange={(e) => onChange('startDate', e.target.value)}
            className="input-field bg-white font-medium text-slate-900 cursor-pointer"
            aria-label="Trip start date"
          />
        </div>

        {/* Weather status message */}
        {state.startDate ? (
          weatherEligible ? (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>
                Real-time Open-Meteo weather forecast will be fetched and daily activities will be adapted to rain/sun.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
              <span>📅</span>
              <span>
                Date set. (Detailed live forecasts are available up to 16 days in advance from Open-Meteo).
              </span>
            </div>
          )
        ) : (
          <p className="text-[11px] text-slate-500 leading-relaxed">
            💡 Selecting a start date within the next 16 days enables real weather forecasts and indoor/outdoor route adjustments.
          </p>
        )}
      </div>

      {/* Budget */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Wallet className="w-4 h-4 text-sky-600" />
          <p className="section-label mb-0">Target Budget</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {BUDGET_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange('budget', preset.value)}
              aria-pressed={state.budget === preset.value}
              className={`tag ${state.budget === preset.value ? 'tag-selected' : 'tag-unselected'}`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <input
            type="number"
            value={state.budget ?? ''}
            onChange={(e) =>
              onChange('budget', e.target.value ? parseInt(e.target.value) : undefined)
            }
            placeholder="Custom amount (e.g. 35000)"
            className="input-field flex-1"
            min={0}
            aria-label="Custom budget amount"
          />
          <select
            value={state.budgetType}
            onChange={(e) => onChange('budgetType', e.target.value as 'total' | 'per_person')}
            className="input-field w-40 bg-white"
            aria-label="Budget type"
          >
            <option value="total">Total trip</option>
            <option value="per_person">Per person</option>
          </select>
        </div>
      </div>

      {/* Travelers */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Users className="w-4 h-4 text-sky-600" />
          <p className="section-label mb-0">Number of Travelers</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50/60 p-3 rounded-2xl border border-slate-200/80 w-fit">
          <button
            type="button"
            onClick={() => onChange('travelers', Math.max(1, state.travelers - 1))}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-all shadow-xs cursor-pointer"
            aria-label="Decrease travelers"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-slate-900 w-8 text-center">
              {state.travelers}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {state.travelers === 1 ? 'person' : 'people'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange('travelers', Math.min(20, state.travelers + 1))}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-all shadow-xs cursor-pointer"
            aria-label="Increase travelers"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Starting Location */}
      <div>
        <label className="section-label block" htmlFor="starting-location">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            Starting City / Airport (Optional)
          </span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="starting-location"
            type="text"
            value={state.startingLocation}
            onChange={(e) => onChange('startingLocation', e.target.value)}
            placeholder="e.g. Mumbai, Delhi, London, New York..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Food Preferences */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Utensils className="w-4 h-4 text-sky-600" />
          <p className="section-label mb-0">Food & Dining Preferences</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FOOD_PREFS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                const current = state.foodPreferences
                if (current.includes(value)) {
                  onChange('foodPreferences', current.filter((f) => f !== value))
                } else {
                  onChange('foodPreferences', [...current, value])
                }
              }}
              aria-pressed={state.foodPreferences.includes(value)}
              className={`tag ${state.foodPreferences.includes(value) ? 'tag-selected' : 'tag-unselected'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={state.cuisinePreferences.join(', ')}
          onChange={(e) =>
            onChange(
              'cuisinePreferences',
              e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
          placeholder="Specific cuisines (e.g. Seafood, Authentic Ramen, Street Food, Cafes)"
          className="input-field mt-3"
          aria-label="Cuisine preferences"
        />
      </div>

      {/* Transportation */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Car className="w-4 h-4 text-sky-600" />
          <p className="section-label mb-0">Preferred Transportation</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {TRANSPORT_OPTIONS.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange('transportation', value)}
              aria-pressed={state.transportation === value}
              className={`tag ${state.transportation === value ? 'tag-selected' : 'tag-unselected'}`}
            >
              <span className="mr-1.5">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Accommodation */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Bed className="w-4 h-4 text-sky-600" />
          <p className="section-label mb-0">Accommodation Type</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ACCOMMODATION_OPTIONS.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange('accommodation', value)}
              aria-pressed={state.accommodation === value}
              className={`tag ${state.accommodation === value ? 'tag-selected' : 'tag-unselected'}`}
            >
              <span className="mr-1.5">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
