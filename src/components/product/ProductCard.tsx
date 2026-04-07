import { Badge } from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import type { ProductItem } from '@/types/product'
import { formatCurrency, formatNumber, formatProductStatus } from '@/utils/format'

interface ProductCardProps {
  product: ProductItem
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <Card
      title={product.name}
      description={`상품 ID ${product.id} / 카테고리 ${product.categoryId ?? '-'}`}
      action={<Badge tone={product.status.toUpperCase() === 'SOLD_OUT' ? 'danger' : 'success'}>{formatProductStatus(product.status)}</Badge>}
      className="h-full"
    >
      <div className="grid gap-3">
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">가격</p>
          <p className="mt-2 text-lg font-bold text-slate-900">{formatCurrency(product.price)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">재고</p>
          <p className="mt-2 text-lg font-bold text-slate-900">{formatNumber(product.stockCount)}</p>
        </div>
      </div>
    </Card>
  )
}

export default ProductCard
