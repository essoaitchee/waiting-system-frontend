import { Badge } from '@/components/ui/Badge'
import type { ProductItem } from '@/types/product'
import { formatCurrency, formatNumber, formatProductStatus } from '@/utils/format'

interface PromoProductCardProps {
  product: ProductItem
  index: number
}

const accentGradients = [
  'from-orange-300 via-amber-200 to-white',
  'from-sky-300 via-cyan-200 to-white',
  'from-emerald-300 via-lime-200 to-white',
  'from-rose-300 via-orange-200 to-white',
  'from-indigo-300 via-violet-200 to-white',
  'from-teal-300 via-emerald-200 to-white',
]

function PromoProductCard({ product, index }: PromoProductCardProps) {
  const accent = accentGradients[index % accentGradients.length]
  const isSoldOut = product.status.toUpperCase() === 'SOLD_OUT'

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-soft">
      <div className={`relative h-40 bg-gradient-to-br ${accent}`}>
        <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-3">
          <Badge tone={isSoldOut ? 'danger' : 'success'}>{formatProductStatus(product.status)}</Badge>
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
            EVENT PICK
          </span>
        </div>
        <div className="absolute inset-x-5 bottom-5 rounded-[24px] border border-white/60 bg-white/70 px-4 py-3 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Category {product.categoryId ?? '-'}
          </p>
          <p className="mt-2 text-xl font-black tracking-tight text-slate-900">{product.name}</p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Price</p>
            <p className="mt-2 text-lg font-bold text-slate-900">{formatCurrency(product.price)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Stock</p>
            <p className="mt-2 text-lg font-bold text-slate-900">{formatNumber(product.stockCount)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Product ID</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">{product.id}</p>
          </div>
          <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            Promotion Eligible
          </div>
        </div>
      </div>
    </article>
  )
}

export default PromoProductCard
