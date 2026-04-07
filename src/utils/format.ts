import type { QueueStatusCode } from '@/types/queue'

const numberFormatter = new Intl.NumberFormat('ko-KR')
const currencyFormatter = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
})

export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return '-'
  }

  return numberFormatter.format(value)
}

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return '-'
  }

  return currencyFormatter.format(value)
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatQueueStatusLabel(status: QueueStatusCode) {
  switch (status) {
    case 'WAITING':
      return '대기 중'
    case 'ADMITTED':
      return '입장 가능'
    case 'ENTERED':
      return '입장 완료'
    case 'EXPIRED':
      return '입장 만료'
    case 'FAILED':
      return '처리 실패'
    default:
      return '상태 확인 필요'
  }
}

export function getQueueStatusTone(status: QueueStatusCode) {
  switch (status) {
    case 'WAITING':
      return 'warning'
    case 'ADMITTED':
      return 'success'
    case 'ENTERED':
      return 'info'
    case 'EXPIRED':
      return 'danger'
    case 'FAILED':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function formatProductStatus(status: string) {
  if (!status) {
    return '상태 미정'
  }

  switch (status.toUpperCase()) {
    case 'ACTIVE':
    case 'ON_SALE':
      return '판매 중'
    case 'SOLD_OUT':
      return '품절 임박'
    case 'READY':
      return '오픈 예정'
    default:
      return status
  }
}
