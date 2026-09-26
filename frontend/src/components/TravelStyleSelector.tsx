import type { TravelStyle } from '../types/trip'

const STYLES: { value: TravelStyle; emoji: string; label: string }[] = [
  { value: 'relaxed',     emoji: '🌴', label: 'Relaxed Pace' },
  { value: 'adventure',   emoji: '🏔️', label: 'Adventure' },
  { value: 'budget',      emoji: '💰', label: 'Budget-friendly' },
  { value: 'luxury',      emoji: '✨', label: 'Luxury & Comfort' },
  { value: 'backpacking', emoji: '🎒', label: 'Backpacking' },
  { value: 'romantic',    emoji: '❤️', label: 'Romantic' },
  { value: 'family',      emoji: '👨‍👩‍👧', label: 'Family Friendly' },
  { value: 'party',       emoji: '🎉', label: 'Nightlife & Social' },
  { value: 'culture',     emoji: '🏛️', label: 'Culture & Heritage' },
]

interface TravelStyleSelectorProps {
  selected: TravelStyle[]
  onChange: (styles: TravelStyle[]) => void
}

export default function TravelStyleSelector({
  selected,
  onChange,
}: TravelStyleSelectorProps) {
  function toggle(style: TravelStyle) {
    if (selected.includes(style)) {
      onChange(selected.filter((s) => s !== style))
    } else {
      onChange([...selected, style])
    }
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Travel style selector">
      {STYLES.map(({ value, emoji, label }) => {
        const isSelected = selected.includes(value)
        return (
          <button
            key={value}
            type="button"
            onClick={() => toggle(value)}
            aria-pressed={isSelected}
            className={`tag ${isSelected ? 'tag-selected' : 'tag-unselected'}`}
          >
            <span className="mr-1.5">{emoji}</span>
            {label}
          </button>
        )
      })}
    </div>
  )
}
