import { useCallback, useEffect, useState } from 'react'
import { fetchProducts } from '@/api/products'
import SectionHeader from '@/components/common/SectionHeader'
import ProductCard from '@/components/product/ProductCard'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Skeleton from '@/components/ui/Skeleton'
import type { ProductItem } from '@/types/product'
import { parseApiError } from '@/utils/error'

function ProductsPage() {
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState('0')
  const [size, setSize] = useState('20')
  const [products, setProducts] = useState<ProductItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ tone: 'danger' | 'info'; title: string; body: string } | null>(null)

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const data = await fetchProducts({
        categoryId: categoryId.trim() ? Number(categoryId) : undefined,
        page: Number(page) || 0,
        size: Number(size) || 20,
      })
      setProducts(data)

      if (data.length === 0) {
        setMessage({
          tone: 'info',
          title: '빈 목록',
          body: '조회된 상품이 없습니다.',
        })
      }
    } catch (error) {
      const parsed = parseApiError(error)
      setMessage({
        tone: 'danger',
        title: parsed.title,
        body: parsed.message,
      })
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [categoryId, page, size])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Products"
        title="상품 목록 조회"
        description="`/api/v1/products`를 호출해 상품 목록을 카드 리스트 형태로 보여줍니다. 응답 구조가 달라지면 product mapper만 수정하면 됩니다."
      />

      <Card title="조회 조건" description="기본값으로 바로 호출되며, 필요 시 카테고리와 페이지 조건을 변경할 수 있습니다.">
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Category ID"
            placeholder="비워두면 전체"
            inputMode="numeric"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          />
          <Input
            label="Page"
            inputMode="numeric"
            value={page}
            onChange={(event) => setPage(event.target.value)}
          />
          <Input
            label="Size"
            inputMode="numeric"
            value={size}
            onChange={(event) => setSize(event.target.value)}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={() => void loadProducts()} isLoading={isLoading}>
            상품 다시 조회
          </Button>
          <span className="text-sm text-slate-500">현재 표시 건수: {products.length}</span>
        </div>

        {message ? (
          <Alert tone={message.tone} title={message.title} className="mt-5">
            {message.body}
          </Alert>
        ) : null}
      </Card>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="glass-panel p-6">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="mt-4 h-8 w-3/4" />
              <Skeleton className="mt-6 h-24 w-full" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={String(product.id)} product={product} />
          ))}
        </div>
      ) : (
        <Card title="상품 목록" description="응답이 비어 있는 경우 이 상태를 표시합니다.">
          <p className="text-sm text-slate-500">표시할 상품이 없습니다.</p>
        </Card>
      )}
    </div>
  )
}

export default ProductsPage
