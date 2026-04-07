export interface ProductListParams {
  categoryId?: number
  page?: number
  size?: number
}

export interface ProductItem {
  id: number | string
  categoryId: number | null
  name: string
  price: number | null
  stockCount: number | null
  status: string
}
