import { apiClient } from '@/api/client'
import { mapProductListResponse } from '@/api/mappers/productMappers'
import type { ProductItem, ProductListParams } from '@/types/product'

export async function fetchProducts(params: ProductListParams): Promise<ProductItem[]> {
  const response = await apiClient.get('/api/v1/products', { params })
  return mapProductListResponse(response.data)
}
