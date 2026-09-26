import { useState } from 'react'
import {
  Sparkles,
  Clipboard,
  MapPin,
  X,
  Plus,
  CheckCircle2,
  AlertCircle,
  Flame,
  ArrowRight,
} from 'lucide-react'
import { parseInstagramReel } from '../services/api'
import type { TravelStyle, ParseReelResponse } from '../types/trip'

interface InstagramReelImporterProps {
  currentValue: string
  additionalPlaces: string[]
  onChange: (value: string) => void
  onAdditionalPlacesChange: (places: string[]) => void
  onReelExtracted?: (data: {
    destination: string
    durationDays: number
    styles: TravelStyle[]
  }) => void
}

interface CuratedReel {
  title: string
  destination: string
  duration: number
  styles: TravelStyle[]
  url: string
  caption: string
  stops: string[]
  tag: string
}

const CURATED_REELS: CuratedReel[] = [
  {
    title: '🌴 Bali Highlights',
    destination: 'Bali, Indonesia',
    duration: 5,
    styles: ['relaxed', 'culture'],
    tag: 'Trending Beach & Cliffs',
    url: 'https://www.instagram.com/reel/C-4Z-yvS8pD/',
    caption:
      'Top 4 Bali places you must experience! 1. Seminyak Sunset Beach 2. Tegalalang Rice Terraces 3. Uluwatu Cliff Temple 4. Cretya Sunset Pool Club #bali #ubud #indonesia #travel',
    stops: ['Seminyak Beach', 'Tegalalang Rice Terraces', 'Uluwatu Cliff Temple', 'Cretya Sunset Club'],
  },
  {
    title: '🌸 Kyoto Hidden Gems',
    destination: 'Kyoto, Japan',
    duration: 6,
    styles: ['culture', 'relaxed'],
    tag: 'Aesthetic Japan',
    url: 'https://www.instagram.com/reel/C7xPq9yL2/',
    caption:
      'Secret spots in Kyoto you will fall in love with: 1. Fushimi Inari Torii gates at sunrise 2. Arashiyama Bamboo Grove 3. Gion Geisha District 4. Kinkaku-ji Golden Pavilion #kyoto #japan #travelvibe',
    stops: ['Fushimi Inari Shrine', 'Arashiyama Bamboo Grove', 'Gion Historic District', 'Kinkaku-ji Temple'],
  },
  {
    title: '🌊 Amalfi Coast & Positano',
    destination: 'Amalfi Coast, Italy',
    duration: 4,
    styles: ['relaxed', 'luxury', 'romantic'],
    tag: 'Italian Riviera Dream',
    url: 'https://www.instagram.com/reel/C5mK89vL3/',
    caption:
      '3-4 Days in Amalfi Coast: 1. Positano Spiaggia Grande 2. Ravello Villa Cimbrone Gardens 3. Path of the Gods Panoramic Trail 4. Capri boat day trip #amalfi #positano #italy #vacation',
    stops: ['Positano Spiaggia Grande', 'Ravello Villa Cimbrone', 'Path of the Gods Trail', 'Capri Island'],
  },
  {
    title: '🏔️ Swiss Alps by Train',
    destination: 'Interlaken & Zermatt, Switzerland',
    duration: 5,
    styles: ['adventure', 'nature' as TravelStyle, 'culture'],
    tag: 'Scenic Mountain Route',
    url: 'https://www.instagram.com/reel/C6mQ12zR9/',
    caption:
      'Switzerland bucketlist route: 1. Zermatt Matterhorn Viewpoint 2. Lauterbrunnen 72 Waterfalls Valley 3. Grindelwald First Cliff Walk #switzerland #alps #trainjourney',
    stops: ['Zermatt Matterhorn Viewpoint', 'Lauterbrunnen Valley', 'Grindelwald First Cliff Walk'],
  },
  {
    title: '🏯 Jaipur Royal Palaces',
    destination: 'Jaipur, Rajasthan',
    duration: 3,
    styles: ['culture', 'budget'],
    tag: 'Royal Heritage',
    url: 'https://www.instagram.com/reel/C8mK22zL1/',
    caption:
      'Must-visit in the Pink City: 1. Amer Fort Elephant Path 2. Hawa Mahal Wind Palace 3. City Palace Royal Courtyard 4. Jal Mahal Water Palace #jaipur #rajasthan #heritage',
    stops: ['Amer Fort', 'Hawa Mahal', 'City Palace Jaipur', 'Jal Mahal'],
  },
]

export default function InstagramReelImporter({
  currentValue,
  additionalPlaces,
  onChange,
  onAdditionalPlacesChange,
  onReelExtracted,
}: InstagramReelImporterProps) {
  // Extract initial reel url if exists
  const initialUrl = currentValue.match(/https?:\/\/(?:www\.)?instagram\.com\/\S+/i)?.[0]?.replace(/[)]$/, '') || ''
  const [reelUrl, setReelUrl] = useState(initialUrl)
  const [reelCaption, setReelCaption] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ParseReelResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [newSpot, setNewSpot] = useState('')
  const [showAddSpot, setShowAddSpot] = useState(false)

  // Clipboard paste helper
  async function handlePasteUrl() {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setReelUrl(text.trim())
        if (text.toLowerCase().includes('instagram.com')) {
          setErrorMsg(null)
        }
      }
    } catch {
      setErrorMsg('Please allow clipboard permissions or paste the URL manually.')
    }
  }

  async function handlePasteCaption() {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setReelCaption(text.trim())
      }
    } catch {
      setErrorMsg('Please allow clipboard permissions or paste text manually.')
    }
  }

  function handleSelectCurated(curated: CuratedReel) {
    setReelUrl(curated.url)
    setReelCaption(curated.caption)
    setErrorMsg(null)

    // Apply curated data directly
    const mergedPlaces = Array.from(new Set([...additionalPlaces, ...curated.stops]))
    onAdditionalPlacesChange(mergedPlaces)

    const promptText = `${curated.url} (Destination: ${curated.destination}) ${curated.caption}`
    onChange(promptText)

    setAnalysisResult({
      success: true,
      destination: curated.destination,
      suggested_duration: curated.duration,
      must_visit_stops: curated.stops,
      suggested_styles: curated.styles,
      trip_summary: `Curated ${curated.destination} itinerary with ${curated.stops.length} featured stops from reel.`,
      reel_url: curated.url,
    })

    if (onReelExtracted) {
      onReelExtracted({
        destination: curated.destination,
        durationDays: curated.duration,
        styles: curated.styles,
      })
    }
  }

  async function handleAnalyzeReel() {
    if (!reelUrl.trim() && !reelCaption.trim()) {
      setErrorMsg('Please enter an Instagram reel link or paste its caption to analyze.')
      return
    }

    setErrorMsg(null)
    setAnalyzing(true)

    try {
      const res = await parseInstagramReel({
        url: reelUrl.trim() || undefined,
        caption_or_notes: reelCaption.trim() || undefined,
      })

      if (res.success && res.destination && res.destination !== 'Unknown') {
        setAnalysisResult(res)

        // Merge stops
        if (res.must_visit_stops && res.must_visit_stops.length > 0) {
          const merged = Array.from(new Set([...additionalPlaces, ...res.must_visit_stops]))
          onAdditionalPlacesChange(merged)
        }

        // Update travel input prompt
        const cleanUrl = reelUrl.trim()
        const destTag = res.destination ? `(Destination: ${res.destination})` : ''
        const captionPart = reelCaption.trim() ? ` ${reelCaption.trim()}` : ''
        const combined = cleanUrl ? `${cleanUrl} ${destTag}${captionPart}` : `${destTag}${captionPart}`
        onChange(combined.trim())

        // Notify parent if supported
        if (onReelExtracted) {
          onReelExtracted({
            destination: res.destination,
            durationDays: res.suggested_duration || 5,
            styles: res.suggested_styles || (['relaxed', 'culture'] as TravelStyle[]),
          })
        }
      } else {
        setErrorMsg(
          res.error ||
            'Could not detect destination automatically. Please type your destination in the caption/notes box and try again.'
        )
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error analyzing reel.'
      setErrorMsg(message)
    } finally {
      setAnalyzing(false)
    }
  }

  function handleRemoveStop(spotToRemove: string) {
    onAdditionalPlacesChange(additionalPlaces.filter((p) => p !== spotToRemove))
  }

  function handleAddCustomSpot() {
    const trimmed = newSpot.trim()
    if (trimmed && !additionalPlaces.includes(trimmed)) {
      onAdditionalPlacesChange([...additionalPlaces, trimmed])
    }
    setNewSpot('')
    setShowAddSpot(false)
  }

  return (
    <div className="space-y-4">
      {/* Studio Banner */}
      <div className="bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-amber-500/10 border border-rose-200/80 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-rose-500/20">
              IG
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Instagram Reel Itinerary Studio</span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  AI Powered
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Turn viral travel reels into a realistic, mapped itinerary with real places and weather.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-white/80 border border-slate-200/80 px-2.5 py-1 rounded-lg self-start sm:self-center">
            💡 Paste Reel URL & Caption
          </div>
        </div>

        {/* Input Controls */}
        <div className="mt-4 space-y-3 pt-3 border-t border-rose-100">
          {/* Reel URL Field */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              1. Instagram Reel URL or Share Link
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={reelUrl}
                  onChange={(e) => setReelUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/C-4Z-yvS8pD/..."
                  className="input-field text-xs sm:text-sm pl-3 pr-8 bg-white border-slate-200 focus:border-rose-400 focus:ring-rose-400/20"
                />
                {reelUrl.toLowerCase().includes('instagram.com') && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
              <button
                type="button"
                onClick={handlePasteUrl}
                className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 shrink-0 bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                title="Paste URL from Clipboard"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Paste</span>
              </button>
            </div>
          </div>

          {/* Caption / Notes / Mentioned Stops Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                2. Reel Caption, Hashtags, or Mentioned Stops
              </label>
              <button
                type="button"
                onClick={handlePasteCaption}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                <Clipboard className="w-3 h-3" />
                <span>Paste Caption</span>
              </button>
            </div>
            <textarea
              value={reelCaption}
              onChange={(e) => setReelCaption(e.target.value)}
              placeholder="Paste caption or list places shown in the reel (e.g. 1. Seminyak Beach 2. Tegalalang Rice Terraces 3. Uluwatu Temple #bali #ubud)..."
              rows={3}
              className="input-field text-xs sm:text-sm bg-white border-slate-200 focus:border-rose-400 focus:ring-rose-400/20 resize-none leading-relaxed"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              ✨ <strong>Why paste the caption?</strong> Instagram blocks automated bots from reading private captions. Pasting the caption lets our AI extract all specific places with 100% accuracy!
            </p>
          </div>

          {/* Error Message if any */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Analyze Action Bar */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleAnalyzeReel}
              disabled={analyzing || (!reelUrl.trim() && !reelCaption.trim())}
              className="btn-primary text-xs sm:text-sm py-2 px-5 bg-gradient-to-r from-rose-600 via-purple-600 to-sky-600 hover:from-rose-500 hover:to-sky-500 shadow-md shadow-rose-500/20 disabled:opacity-40 flex items-center gap-2 cursor-pointer font-bold"
            >
              <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
              <span>{analyzing ? 'AI Analyzing Reel & Stops...' : 'Analyze Reel with AI'}</span>
            </button>

            {analysisResult && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>Reel details loaded!</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Result Card */}
      {analysisResult && (
        <div className="card p-4 sm:p-5 border-emerald-200 bg-gradient-to-br from-emerald-50/40 via-white to-sky-50/30 rounded-2xl shadow-xs space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                ✓
              </span>
              <h4 className="text-sm font-bold text-slate-900">Extracted from Reel</h4>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
              {analysisResult.suggested_duration} Days Suggested
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <span className="text-slate-500 font-semibold block mb-0.5">Destination</span>
              <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                {analysisResult.destination}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <span className="text-slate-500 font-semibold block mb-0.5">Travel Vibe & Style</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {analysisResult.suggested_styles.map((s) => (
                  <span
                    key={s}
                    className="capitalize font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {analysisResult.trip_summary && (
            <p className="text-xs text-slate-600 bg-white/70 p-2.5 rounded-xl border border-slate-100 leading-relaxed italic">
              "{analysisResult.trip_summary}"
            </p>
          )}
        </div>
      )}

      {/* Must-Visit Stops Pills */}
      {additionalPlaces.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <p className="section-label mb-0 flex items-center gap-1.5">
              <span>Must-Visit Reel Stops ({additionalPlaces.length})</span>
            </p>
            <span className="text-[11px] text-slate-500">Atlas will include these in your route</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {additionalPlaces.map((place, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-xs"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>{place}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveStop(place)}
                  className="ml-1 text-rose-400 hover:text-rose-700 transition-colors cursor-pointer"
                  aria-label={`Remove ${place}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Spot */}
      {showAddSpot ? (
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={newSpot}
            onChange={(e) => setNewSpot(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCustomSpot()
              if (e.key === 'Escape') setShowAddSpot(false)
            }}
            placeholder="e.g. Cretya Sunset Club or Uluwatu Temple"
            className="input-field flex-1 text-xs sm:text-sm"
            autoFocus
          />
          <button
            type="button"
            onClick={handleAddCustomSpot}
            className="btn-primary text-xs px-4 py-2"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowAddSpot(false)}
            className="btn-secondary text-xs px-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddSpot(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 transition-colors pt-1 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add another stop from this reel</span>
        </button>
      )}

      {/* Curated Viral Reels to test with 1-click */}
      <div className="pt-2">
        <div className="flex items-center gap-1.5 mb-2">
          <Flame className="w-4 h-4 text-amber-500" />
          <p className="section-label mb-0">Try Popular Travel Reels (1-Click Test)</p>
        </div>
        <p className="text-[11px] text-slate-500 mb-2.5">
          Select a viral travel reel to test how Atlas extracts spots and maps them into an itinerary:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CURATED_REELS.map((c) => (
            <button
              key={c.title}
              type="button"
              onClick={() => handleSelectCurated(c)}
              className="flex items-start justify-between p-2.5 text-left rounded-xl bg-white border border-slate-200/90 hover:border-rose-300 hover:shadow-sm hover:bg-rose-50/30 transition-all cursor-pointer group"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                  {c.title}
                </span>
                <span className="block text-[11px] text-slate-500">{c.tag} • {c.stops.length} stops</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-transform group-hover:translate-x-0.5 mt-1" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
