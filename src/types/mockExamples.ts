import type {
  CouponIssueApiResponse,
  ProductApiResponse,
  QueueConsumeApiResponse,
  QueueEnterApiResponse,
  QueueStatusApiResponse,
} from '@/types/api'

export const queueEnterResponseExample: QueueEnterApiResponse = {
  eventId: 1001,
  userId: 'demo-user',
  status: 'WAITING',
  queueToken: 'f13e2ae13e8e42b4a1c5b2e9447a1201',
  queueNumber: 57,
  currentPosition: 12,
  aheadCount: 11,
  enteredAt: '2026-04-02T14:00:00',
  admissionToken: null,
  admissionExpiresAt: null,
}

export const queueStatusResponseExample: QueueStatusApiResponse = {
  ...queueEnterResponseExample,
  status: 'ADMITTED',
  currentPosition: null,
  aheadCount: null,
  admittedAt: '2026-04-02T14:03:00',
  admissionToken: 'admit-token-1234',
  admissionExpiresAt: '2026-04-02T14:13:00',
}

export const queueConsumeResponseExample: QueueConsumeApiResponse = {
  eventId: 1001,
  userId: 'demo-user',
  status: 'ENTERED',
  processedAt: '2026-04-02T14:04:10',
}

export const productResponseExample: ProductApiResponse = {
  productId: 1,
  categoryId: 10,
  productName: '한정판 티셔츠',
  price: 39000,
  stockCount: 42,
  status: 'ON_SALE',
}

export const couponIssueResponseExample: CouponIssueApiResponse = {
  couponId: 77,
  userId: 'demo-user',
  status: 'ISSUED',
  remainingCount: 99,
  issuedAt: '2026-04-02T14:10:00',
}
