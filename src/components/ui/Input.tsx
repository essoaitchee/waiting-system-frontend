import type { InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
}

function Input({ label, hint, error, className, id, ...props }: InputProps) {
  const inputId = id || label

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">{label}</span>
      <input
        id={inputId}
        className={cn(
          'h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100',
          error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100',
          className,
        )}
        {...props}
      />
      {error ? <span className="mt-2 block text-sm text-rose-600">{error}</span> : null}
      {!error && hint ? <span className="mt-2 block text-sm text-slate-500">{hint}</span> : null}
    </label>
  )
}

export default Input
