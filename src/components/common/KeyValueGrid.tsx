import type { ReactNode } from 'react'

export interface KeyValueItem {
  label: string
  value: ReactNode
}

interface KeyValueGridProps {
  items: KeyValueItem[]
}

function KeyValueGrid({ items }: KeyValueGridProps) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</dt>
          <dd className="mt-2 text-sm font-medium text-slate-900">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export default KeyValueGrid
