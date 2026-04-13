const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL

export const API_BASE_URL = typeof rawApiBaseUrl === 'string' ? rawApiBaseUrl.trim() : ''

export const QUEUE_STATUS_POLL_INTERVAL_MS = 1000

export const LOCAL_STORAGE_QUEUE_KEY = 'waiting-system.queue-identity'

export const DEMO_EVENT_ID = 1001
export const DEMO_COUPON_ID = 201
export const DEMO_USER_CHOICES = ['demo-user-101', 'demo-user-202', 'demo-user-303']
