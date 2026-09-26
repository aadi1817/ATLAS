import { useState, useEffect } from 'react'
import {
  Plus,
  X,
  Link2,
  MapPin,
  Type,
  Sparkles,
  Youtube,
  Navigation2,
} from 'lucide-react'
import InstagramReelImporter from './InstagramReelImporter'
import type { TravelStyle } from '../types/trip'

type InputMode = 'idea' | 'reel' | 'maps' | 'video'

interface TravelInputProps {
  value: string
  additionalPlaces: string[]
  onChange: (value: string) => void
  onAdditionalPlacesChange: (places: string[]) => void
  onReelExtracted?: (data: {
    destination: string
    durationDays: number
    styles: TravelStyle[]
  }) => void
  initialMode?: InputMode
}

const EXAMPLES = [
  {
    icon: '✨',
    label: 'Tokyo Culinary & Tech',
    text: 'Tokyo, Japan for 6 days exploring ramen street food, Akihabara tech, teamLab and Shibuya',
  },
  {
    icon: '🏖️',
    label: 'Goa Coastal Relaxation',
    text: 'Goa for 4 days relaxing beaches, sunset cafes, and Portuguese heritage',
  },
  {
    icon: '🏔️',
    label: 'Manali Mountain Adventure',
    text: 'Manali, Himachal for 5 days mountain adventure, Solang valley, and cozy cafes',
  },
  {
    icon: '🥐',
    label: 'Paris Romantic Culture',
    text: 'Paris for 5 days visiting Louvre, Eiffel Tower, Montmartre art and patisseries',
  },
]

function getInputIcon(value: string) {
  if (value.toLowerCase().includes('instagram.com')) {
    return (
      <span className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-black">
        IG
      </span>
    )
  }
  if (value.startsWith('http')) return <Link2 className="w-5 h-5 text-sky-600" />
  if (value.includes(',') || value.split(' ').length <= 3) return <MapPin className="w-5 h-5 text-sky-600" />
  return <Type className="w-5 h-5 text-sky-600" />
}

export default function TravelInput({
  value,
  additionalPlaces,
  onChange,
  onAdditionalPlacesChange,
  onReelExtracted,
  initialMode = 'idea',
}: TravelInputProps) {
  // Determine initial mode based on value
  const isIg = value.toLowerCase().includes('instagram.com')
  const isMaps =
    value.toLowerCase().includes('maps.google') ||
    value.toLowerCase().includes('google.com/maps') ||
    value.toLowerCase().includes('goo.gl/maps') ||
    value.toLowerCase().includes('maps.app.goo.gl')
  const isVideo =
    value.toLowerCase().includes('youtube.com') ||
    value.toLowerCase().includes('youtu.be')

  const determinedInitial = isIg ? 'reel' : isMaps ? 'maps' : isVideo ? 'video' : initialMode
  const [mode, setMode] = useState<InputMode>(determinedInitial)
  const [newPlace, setNewPlace] = useState('')
  const [showPlaceInput, setShowPlaceInput] = useState(false)

  // Switch modes automatically if a recognized URL is pasted in idea mode
  useEffect(() => {
    const v = value.toLowerCase()
    if (v.includes('instagram.com') && mode === 'idea') {
      setMode('reel')
    } else if (
      (v.includes('maps.google') ||
        v.includes('google.com/maps') ||
        v.includes('goo.gl/maps') ||
        v.includes('maps.app.goo.gl')) &&
      mode === 'idea'
    ) {
      setMode('maps')
    } else if (
      (v.includes('youtube.com') || v.includes('youtu.be')) &&
      mode === 'idea'
    ) {
      setMode('video')
    }
  }, [value, mode])

  function addPlace() {
    const trimmed = newPlace.trim()
    if (trimmed && !additionalPlaces.includes(trimmed)) {
      onAdditionalPlacesChange([...additionalPlaces, trimmed])
    }
    setNewPlace('')
    setShowPlaceInput(false)
  }

  function removePlace(index: number) {
    onAdditionalPlacesChange(additionalPlaces.filter((_, i) => i !== index))
  }

  function handleExampleClick(text: string) {
    onChange(text)
  }

  return (
    <div className="space-y-4">
      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 overflow-x-auto">
        <button
          type="button"
          onClick={() => setMode('idea')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            mode === 'idea'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Trip Idea / Prompt</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('reel')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            mode === 'reel'
              ? 'bg-white text-rose-700 shadow-xs border border-rose-200/80'
              : 'text-slate-600 hover:text-rose-600 hover:bg-white/50'
          }`}
        >
          <span className="w-4 h-4 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-black">
            IG
          </span>
          <span>Instagram Reel</span>
          <span className="text-[10px] bg-rose-100 text-rose-700 font-extrabold px-1.5 py-0.2 rounded-full">
            AI
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMode('maps')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            mode === 'maps'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Navigation2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Google Maps</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('video')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            mode === 'video'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Youtube className="w-3.5 h-3.5 text-red-600" />
          <span>YouTube Vlog</span>
        </button>
      </div>

      {/* Mode 1: Instagram Reel Studio */}
      {mode === 'reel' && (
        <InstagramReelImporter
          currentValue={value}
          additionalPlaces={additionalPlaces}
          onChange={onChange}
          onAdditionalPlacesChange={onAdditionalPlacesChange}
          onReelExtracted={onReelExtracted}
        />
      )}

      {/* Mode 2: Standard Trip Idea / Prompt */}
      {mode === 'idea' && (
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-3.5 pointer-events-none">
              {value ? getInputIcon(value) : <MapPin className="w-5 h-5 text-slate-400" />}
            </div>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="e.g. 5 days in Tokyo with ramen cafes, anime tech, and cultural temples..."
              rows={3}
              className="input-field pl-12 pr-4 pt-3 resize-none leading-relaxed text-slate-900 border-slate-200 focus:border-sky-500 shadow-xs"
              aria-label="Travel inspiration input"
            />
          </div>

          {/* Quick suggestions / examples */}
          <div>
            <p className="section-label">Quick Suggestions & Examples</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => handleExampleClick(ex.text)}
                  className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200/90 rounded-lg px-3 py-1.5 text-slate-700 hover:text-slate-900 hover:border-sky-300 hover:bg-white transition-all shadow-xs cursor-pointer"
                >
                  <span>{ex.icon}</span>
                  <span className="font-medium">{ex.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Google Maps Link */}
      {mode === 'maps' && (
        <div className="space-y-3 bg-emerald-50/40 border border-emerald-200 rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <Navigation2 className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-900">Google Maps Location or Saved List</h4>
          </div>
          <p className="text-xs text-slate-600">
            Paste a Google Maps place link, share URL, directions route, or search query. Atlas will detect the destination and optimize routes.
          </p>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://maps.google.com/... or https://maps.app.goo.gl/..."
            className="input-field text-xs sm:text-sm bg-white"
          />
        </div>
      )}

      {/* Mode 4: YouTube Travel Vlog */}
      {mode === 'video' && (
        <div className="space-y-3 bg-red-50/40 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <Youtube className="w-4 h-4 text-red-600" />
            <h4 className="text-xs font-bold text-slate-900">YouTube Travel Vlog Link</h4>
          </div>
          <p className="text-xs text-slate-600">
            Paste a YouTube travel vlog URL. Atlas extracts the video title and itinerary highlights.
          </p>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
            className="input-field text-xs sm:text-sm bg-white"
          />
        </div>
      )}

      {/* Must-Visit Stops (Shown in non-reel modes if any exist) */}
      {mode !== 'reel' && additionalPlaces.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <p className="section-label mb-0">Must-Visit Stops ({additionalPlaces.length})</p>
            <span className="text-[11px] text-slate-500">Atlas will include these in your route</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {additionalPlaces.map((place, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-sky-800 shadow-xs"
              >
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>{place}</span>
                <button
                  type="button"
                  onClick={() => removePlace(i)}
                  className="ml-1 text-sky-500 hover:text-rose-600 transition-colors cursor-pointer"
                  aria-label={`Remove ${place}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add Place Button (Shown in non-reel modes) */}
      {mode !== 'reel' && (
        showPlaceInput ? (
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={newPlace}
              onChange={(e) => setNewPlace(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addPlace()
                if (e.key === 'Escape') setShowPlaceInput(false)
              }}
              placeholder="e.g. Senso-ji Temple, Tokyo"
              className="input-field flex-1"
              autoFocus
              aria-label="Add another place"
            />
            <button type="button" onClick={addPlace} className="btn-primary text-xs px-4 py-2">
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowPlaceInput(false)}
              className="btn-secondary text-xs px-3"
              aria-label="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowPlaceInput(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 transition-colors pt-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add a specific stop or landmark</span>
          </button>
        )
      )}
    </div>
  )
}
