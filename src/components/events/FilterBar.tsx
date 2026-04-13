import type { EventCategory } from '@/data/mockData'
import { cn } from '@/lib/cn'

const categories: Array<EventCategory | 'All'> = [
  'All',
  'Strength',
  'Conditioning',
  'Mobility',
  'Workshop',
  'Social',
]

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
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <SearchIcon />
          </span>
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search events, coaches, rooms…"
            className="h-11 w-full rounded-xl border border-border bg-surface-2/70 pl-10 pr-3 text-sm text-fg outline-none ring-white/0 transition placeholder:text-muted focus:border-accent/45 focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'any' as const, label: 'Any date' },
              { id: 'week' as const, label: 'This week' },
              { id: 'today' as const, label: 'Today' },
            ] as const
          ).map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => onDatePresetChange(chip.id)}
              className={cn(
                'h-10 rounded-full border px-4 text-xs font-semibold tracking-wide transition',
                datePreset === chip.id
                  ? 'border-accent/40 bg-accent-soft text-fg'
                  : 'border-border bg-surface-2/60 text-fg-soft hover:border-border-strong hover:text-fg',
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onCategoryChange(c)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide transition',
              category === c
                ? 'border-warm/35 bg-warm-soft text-fg'
                : 'border-border bg-surface-2/50 text-fg-soft hover:border-border-strong hover:text-fg',
            )}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M16.2 16.2 21 21"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
