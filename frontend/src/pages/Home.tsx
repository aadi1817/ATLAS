import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Compass,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  Wallet,
  Utensils,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'

const POPULAR_DESTINATIONS = [
  {
    name: 'Bali, Indonesia',
    emoji: '🌴',
    tag: 'Beaches & Spiritual Culture',
    duration: '5–7 Days',
    budget: '₹40k–₹70k',
    query: 'Bali, Indonesia for 6 days beaches and culture',
  },
  {
    name: 'Tokyo, Japan',
    emoji: '🗼',
    tag: 'Culinary, Anime & Modern Tech',
    duration: '6–8 Days',
    budget: '₹90k–₹1.5L',
    query: 'Tokyo, Japan for 7 days food, anime and technology',
  },
  {
    name: 'Goa, India',
    emoji: '🌊',
    tag: 'Coastal Sunsets & Cafes',
    duration: '3–5 Days',
    budget: '₹15k–₹30k',
    query: 'Goa for 4 days relaxing beaches and cafes',
  },
  {
    name: 'Manali, Himachal',
    emoji: '🏔️',
    tag: 'Mountains & River Adventure',
    duration: '4–6 Days',
    budget: '₹18k–₹35k',
    query: 'Manali for 5 days mountain adventure and cafes',
  },
  {
    name: 'Jaipur, Rajasthan',
    emoji: '🏯',
    tag: 'Royal Palaces & Street Food',
    duration: '3–4 Days',
    budget: '₹12k–₹25k',
    query: 'Jaipur for 3 days forts and royal heritage',
  },
  {
    name: 'Paris, France',
    emoji: '🥐',
    tag: 'Art, Architecture & Romance',
    duration: '4–6 Days',
    budget: '₹1.1L–₹1.8L',
    query: 'Paris for 5 days museum, cafes and iconic sights',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Drop your inspiration',
    desc: 'Paste a social reel, YouTube travel vlog, Google Maps link, or simply type your travel dream.',
    icon: Sparkles,
  },
  {
    step: '02',
    title: 'Set your style & budget',
    desc: 'Choose your travel pace, accommodation type, budget range, and dietary preferences.',
    icon: Wallet,
  },
  {
    step: '03',
    title: 'Get your daily itinerary',
    desc: 'Receive realistic time-blocked days with interactive maps, verified places, and turn-by-turn routes.',
    icon: Navigation,
  },
]

const FEATURES = [
  {
    icon: Navigation,
    title: 'Turn-by-turn Map Routes',
    desc: 'Every day is mapped with optimal routing so you never waste hours zigzagging across the city.',
  },
  {
    icon: Utensils,
    title: 'Dietary & Cuisine Smart',
    desc: 'Strict vegetarian, halal, vegan, or jain? Atlas selects restaurants tailored to your diet.',
  },
  {
    icon: Wallet,
    title: 'Realistic Budget Estimation',
    desc: 'Get transparent itemized estimates for stays, dining, transport, and activities in your local currency.',
  },
  {
    icon: ShieldCheck,
    title: 'Practical, Tested Schedules',
    desc: 'Balanced activity density that respects travel times, opening hours, and rest breaks.',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const [heroInput, setHeroInput] = useState('')

  function handleSearchSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const query = heroInput.trim()
    if (query) {
      navigate(`/plan?destination=${encodeURIComponent(query)}`)
    } else {
      navigate('/plan')
    }
  }

  function handleQuickSelect(destText: string) {
    navigate(`/plan?destination=${encodeURIComponent(destText)}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-600 flex items-center justify-center shadow-sm shadow-sky-500/20 text-white">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">Atlas</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                AI Travel Planner
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
              How it works
            </a>
            <a href="#destinations" className="hover:text-slate-900 transition-colors">
              Destinations
            </a>
            <a href="#features" className="hover:text-slate-900 transition-colors">
              Features
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/plan')}
              className="btn-primary text-sm py-2 px-4 shadow-sm"
            >
              <span>Create Itinerary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200/60 bg-gradient-to-b from-sky-50/70 via-white to-slate-50">
        {/* Soft background ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-200/25 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-semibold text-sky-800 mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Next-Generation AI Itinerary Builder</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
            Plan your next journey. <br className="hidden sm:block" />
            <span className="gradient-text">From quick inspiration to daily itinerary.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Drop an Instagram reel, TikTok link, Google Maps pin, or a loose travel idea. Atlas
            crafts a realistic day-by-day plan with route maps, restaurant picks, and budget estimates.
          </p>

          {/* Interactive Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white p-2 rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50 flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="flex items-center gap-2.5 px-3 w-full flex-1">
                <MapPin className="w-5 h-5 text-sky-600 flex-shrink-0" />
                <input
                  type="text"
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  placeholder="Where do you want to go? e.g. 5 days in Bali, beaches & cafes"
                  className="w-full text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-none bg-transparent py-2"
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full sm:w-auto px-6 py-3 whitespace-nowrap text-sm font-semibold"
              >
                <span>Plan Trip</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Inspiration Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Popular:</span>
              {[
                { label: '🌴 Bali (5 Days)', val: 'Bali for 5 days beaches and culture' },
                { label: '🗼 Tokyo Foodie (7 Days)', val: 'Tokyo for 7 days food, cafes, tech' },
                { label: '🏔️ Manali Trek (4 Days)', val: 'Manali for 4 days mountains and adventure' },
                { label: '🥐 Paris Art (5 Days)', val: 'Paris for 5 days museums, cafes, architecture' },
              ].map((pill) => (
                <button
                  key={pill.label}
                  onClick={() => handleQuickSelect(pill.val)}
                  className="bg-white hover:bg-slate-100/80 border border-slate-200 text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Instagram Reel Studio Callout Card */}
            <div className="mt-5 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-sky-500/10 border border-rose-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-left shadow-xs">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs">
                  IG
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Saw an inspiring travel reel on Instagram?</span>
                    <span className="text-[10px] bg-rose-100 text-rose-700 font-extrabold px-1.5 py-0.5 rounded-full">
                      New Studio
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Paste any Instagram Reel link to automatically extract places, landmarks, and routes with AI.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/plan?mode=reel')}
                className="btn-primary text-xs py-2 px-4 whitespace-nowrap bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 shadow-rose-500/20 shrink-0 flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <span>Plan from Reel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Itinerary Teaser Card (Builds Immense Trust & Daily-Use Vibe) */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/60 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-50 to-blue-50/60 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Sample Live Output
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                  5-Day Bali Experience
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-semibold text-sky-700">
                  <Wallet className="w-3.5 h-3.5" /> ₹45,000 Est. Budget
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> 5 Days
                </span>
              </div>
            </div>

            <div className="p-6 grid sm:grid-cols-3 gap-4">
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-sky-700 bg-sky-100/60 px-2 py-0.5 rounded-md">
                    Day 1 · 09:00 AM
                  </span>
                  <span className="text-sm">☕</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Seminyak Cafe & Beach Walk</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Acai bowls at Revolver Espresso, followed by a relaxed stroll along Petitenget Beach.
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] text-sky-600 font-semibold">
                  <Navigation className="w-3 h-3" />
                  <span>Mapped in Google Directions</span>
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-sky-700 bg-sky-100/60 px-2 py-0.5 rounded-md">
                    Day 2 · 02:00 PM
                  </span>
                  <span className="text-sm">🌿</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Tegalalang Rice Terraces</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Scenic lush valleys, traditional Subak irrigation, and quiet artisan woodcraft shops.
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Optimal daylight timing</span>
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-sky-700 bg-sky-100/60 px-2 py-0.5 rounded-md">
                    Day 3 · 05:30 PM
                  </span>
                  <span className="text-sm">🌅</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Uluwatu Cliff Sunset & Kecak</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Dramatic 70-meter sea cliffs, traditional amphitheater performance, and seafood dinner.
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] text-orange-600 font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  <span>Top recommended highlight</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Includes Leaflet interactive map, custom food spots, and exportable route links.
              </span>
              <button
                onClick={() => navigate('/plan?destination=Bali')}
                className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Customize this trip</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Metric Highlights Bar */}
      <section className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                12,000+
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Trips Generated</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                100%
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Real Map Coordinates</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                &lt; 10s
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Generation Speed</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                4.9 / 5
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Traveler Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-2">
            Seamless Workflow
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How Atlas works for you
          </h3>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            No more opening 20 tabs for maps, blogs, and budgets. Atlas combines everything into one
            clean view.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.step}
                className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative group"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-slate-400 tracking-widest">
                    STEP {item.step}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Popular Destinations */}
      <section id="destinations" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-2">
                Explore The World
              </h2>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                Popular destinations ready to plan
              </h3>
            </div>
            <button
              onClick={() => navigate('/plan')}
              className="btn-secondary text-xs sm:text-sm self-start sm:self-auto"
            >
              Custom Destination →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {POPULAR_DESTINATIONS.map((dest) => (
              <button
                key={dest.name}
                onClick={() => navigate(`/plan?destination=${encodeURIComponent(dest.query)}`)}
                className="bg-slate-50/70 hover:bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all text-left group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs inline-block">
                      {dest.emoji}
                    </span>
                    <span className="text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                      {dest.duration}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                    {dest.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">{dest.tag}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Est. {dest.budget}</span>
                  <span className="font-bold text-sky-600 group-hover:translate-x-0.5 transition-transform flex items-center">
                    Plan now <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="features" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-2">
            Quality First
          </h2>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">
            Why travelers rely on Atlas daily
          </h3>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Engineered with deep attention to logistics, routing accuracy, and travel comfort.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">{feat.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA Box */}
        <div className="mt-16 bg-gradient-to-r from-sky-600 to-blue-700 rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-lg shadow-sky-600/20">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight mb-4">
              Ready to embark on your next trip?
            </h3>
            <p className="text-sky-100 text-sm sm:text-base mb-8 leading-relaxed">
              No sign up needed. Generate your complete travel itinerary in under 10 seconds.
            </p>
            <button
              onClick={() => navigate('/plan')}
              className="bg-white text-slate-900 hover:bg-slate-50 font-bold px-8 py-4 rounded-xl shadow-md transition-all active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer text-base"
            >
              <span>Start Planning Now</span>
              <ArrowRight className="w-4 h-4 text-sky-600" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-sky-600 flex items-center justify-center text-white">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900 text-sm">Atlas</span>
            <span>· AI Travel Intelligence</span>
          </div>

          <p>© {new Date().getFullYear()} Atlas Travel. All rights reserved.</p>

          <div className="flex items-center gap-4 text-slate-600">
            <button onClick={() => navigate('/plan')} className="hover:text-slate-900">
              Trip Planner
            </button>
            <a href="#how-it-works" className="hover:text-slate-900">
              How It Works
            </a>
            <a href="#destinations" className="hover:text-slate-900">
              Destinations
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
