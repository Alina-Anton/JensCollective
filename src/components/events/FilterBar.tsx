import type { EventCategory } from '@/data/mockData'
import { cn } from '@/lib/cn'

const pills = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'social', label: 'Social' },
  { id: 'strength', label: 'Strenght' },
  { id: 'all', label: 'All' },
] as const

export function FilterBar({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  datePreset,
  onDatePresetChange,
  className,
}: {
  query: string
  onQueryChange: (v: string) => void
  category: EventCategory | 'All'
  onCategoryChange: (v: EventCategory | 'All') => void
  datePreset: 'any' | 'week' | 'today'
  onDatePresetChange: (v: 'any' | 'week' | 'today') => void
  className?: string
}) {
  const activePill: (typeof pills)[number]['id'] =
    datePreset === 'today'
      ? 'today'
      : datePreset === 'week'
        ? 'week'
        : category === 'Social'
          ? 'social'
          : category === 'Strength'
            ? 'strength'
            : 'all'

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap gap-2">
        {pills.map((pill) => (
          <button
            key={pill.id}
            type="button"
            onClick={() => {
              onQueryChange(query)
              if (pill.id === 'today') {
                onCategoryChange('All')
                onDatePresetChange('today')
                return
              }
              if (pill.id === 'week') {
                onCategoryChange('All')
                onDatePresetChange('week')
                return
              }
              if (pill.id === 'social') {
                onCategoryChange('Social')
                onDatePresetChange('any')
                return
              }
              if (pill.id === 'strength') {
                onCategoryChange('Strength')
                onDatePresetChange('any')
                return
              }
              onCategoryChange('All')
              onDatePresetChange('any')
            }}
            className={cn(
              'h-8 rounded-full border px-3 text-xs font-semibold tracking-wide transition',
              activePill === pill.id
                ? 'border-warm/35 bg-warm-soft text-fg'
                : 'border-border bg-surface-2/50 text-fg-soft hover:border-border-strong hover:text-fg',
            )}
          >
            {pill.label}
          </button>
        ))}
      </div>
    </div>
  )
}
