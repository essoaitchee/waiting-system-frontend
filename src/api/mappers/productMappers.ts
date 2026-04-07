import type { ProductApiResponse } from '@/types/api'
import type { ProductItem } from '@/types/product'
import { pickNumber, pickString, toArray } from '@/api/mappers/shared'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function mapProductResponse(item: unknown): ProductItem {
  const source = isRecord(item) ? (item as ProductApiResponse) : {}

  // 백엔드 상품 DTO 필드명이 바뀌면 이 후보 키만 조정하면 됩니다.
  return {
    id: pickNumber(source, ['productId', 'id']) ?? pickString(source, ['productId', 'id']) ?? 'unknown',
    categoryId: pickNumber(source, ['categoryId']),
    name: pickString(source, ['productName', 'name', 'title']) ?? '이름 없는 상품',
    price: pickNumber(source, ['price', 'amount']),
    stockCount: pickNumber(source, ['stockCount', 'stock', 'quantity']),
    status: pickString(source, ['status', 'state']) ?? 'UNKNOWN',
  }
}

export function mapProductListResponse(payload: unknown) {
  return toArray(payload).map(mapProductResponse)
}
