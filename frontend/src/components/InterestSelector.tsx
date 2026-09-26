const INTERESTS = [
  '🏖️ Beaches',
  '⛰️ Mountains',
  '🍜 Local Food',
  '☕ Specialty Cafes',
  '🌙 Nightlife',
  '🛍️ Shopping',
  '🏛️ History & Heritage',
  '🎭 Art & Culture',
  '📷 Photography',
  '🌿 Nature & Parks',
  '🧗 Adventure Sports',
  '🎮 Gaming & Tech',
  '🎌 Anime & Pop Culture',
  '🏗️ Architecture',
  '🖼️ Museums & Galleries',
  '🤝 Local Experiences',
  '🚴 Cycling',
  '🏄 Water Sports',
  '🎵 Live Music',
  '🧘 Wellness & Spas',
]

interface InterestSelectorProps {
  selected: string[]
  otherInterests: string
  onChange: (interests: string[]) => void
  onOtherChange: (val: string) => void
}

export default function InterestSelector({
  selected,
  otherInterests,
  onChange,
  onOtherChange,
}: InterestSelectorProps) {
  function toggle(interest: string) {
    // Strip emoji prefix for clean storage
    const key = interest.split(' ').slice(1).join(' ')
    const clean = key.toLowerCase()
    if (selected.includes(clean)) {
      onChange(selected.filter((i) => i !== clean))
    } else {
      onChange([...selected, clean])
    }
  }

  function isSelected(interest: string) {
    const key = interest.split(' ').slice(1).join(' ').toLowerCase()
    return selected.includes(key)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Interest selector">
        {INTERESTS.map((interest) => {
          const active = isSelected(interest)
          return (
            <button
              key={interest}
              type="button"
              onClick={() => toggle(interest)}
              aria-pressed={active}
              className={`tag ${active ? 'tag-selected' : 'tag-unselected'}`}
            >
              {interest}
            </button>
          )
        })}
      </div>

      <div className="pt-1">
        <label className="section-label block" htmlFor="other-interests">
          Custom or niche interests
        </label>
        <input
          id="other-interests"
          type="text"
          value={otherInterests}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="e.g. scuba diving certification, vintage thrift stores, architecture photography..."
          className="input-field"
        />
      </div>
    </div>
  )
}
