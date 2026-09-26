import { Sparkles, Loader2 } from 'lucide-react'

interface GenerateButtonProps {
  onClick: () => void
  loading: boolean
  disabled: boolean
}

export default function GenerateButton({
  onClick,
  loading,
  disabled,
}: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full relative group overflow-hidden rounded-2xl
        bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600
        hover:from-sky-500 hover:via-blue-500 hover:to-indigo-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-300 active:scale-[0.99]
        shadow-lg shadow-sky-600/20 cursor-pointer"
      aria-label="Generate my trip"
    >
      {/* Light shimmer hover effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity
        bg-gradient-to-r from-transparent via-white/20 to-transparent
        -translate-x-full group-hover:translate-x-full duration-700 transition-transform pointer-events-none"
      />

      <div className="relative flex items-center justify-center gap-3 px-8 py-4 sm:py-4.5">
        {loading ? (
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        ) : (
          <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
        )}
        <span className="text-base sm:text-lg font-bold text-white tracking-wide">
          {loading ? 'Crafting your personalized trip...' : 'Generate My Complete Itinerary'}
        </span>
      </div>
    </button>
  )
}
