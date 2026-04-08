import { useEffect, useMemo, useRef, useState } from 'react'
import { loginOrRegister } from '@/api/auth'
import { demoJoinExperience, fetchDemoMonitor, fetchDemoRound } from '@/api/demo'
import { fetchCoupons, issueCoupon, resetCoupons } from '@/api/coupons'
import { fetchProducts } from '@/api/products'
import { admitNextBatch, consumeAdmissionToken } from '@/api/queue'
import CountdownOpenBar from '@/components/demo/CountdownOpenBar'
import DemoHero from '@/components/demo/DemoHero'
import IssuedCouponsModal, { type IssuedCouponsModalVariant } from '@/components/demo/IssuedCouponsModal'
import LiveStatePanel, { type DemoApiLogEntry } from '@/components/demo/LiveStatePanel'
import LoginGateModal from '@/components/demo/LoginGateModal'
import PromoProductCard from '@/components/demo/PromoProductCard'
import QueueJourneyModal from '@/components/demo/QueueJourneyModal'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import { usePolling } from '@/hooks/usePolling'
import type { AuthSession } from '@/types/auth'
import type { CouponIssueOutcome, CouponIssueResult, CouponListItem } from '@/types/coupon'
import type { DemoMonitorData, DemoRoundData } from '@/types/demo'
import type { ProductItem } from '@/types/product'
import type { QueueAdmissionResult, QueueConsumeResult, QueueStatusData } from '@/types/queue'
import { clearStoredAuthSession, readStoredAuthSession, writeStoredAuthSession } from '@/utils/authStorage'
import { DEMO_COUPON_ID, DEMO_EVENT_ID, QUEUE_STATUS_POLL_INTERVAL_MS } from '@/utils/constants'
import { classifyCouponOutcome, parseApiError } from '@/utils/error'
import { formatNumber } from '@/utils/format'
import { clearStoredQueueIdentity, readStoredQueueIdentity, writeStoredQueueIdentity } from '@/utils/storage'

type NoticeTone = 'info' | 'success' | 'warning' | 'danger'

interface UserNotice {
  tone: NoticeTone
  title: string
  body: string
}

function buildLogId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function getDurationMs(requestedAt: string) {
  return Math.max(Date.now() - new Date(requestedAt).getTime(), 0)
}

function toQueueStatusData(monitor: DemoMonitorData | null): QueueStatusData | null {
  if (!monitor) {
    return null
  }

  return {
    eventId: monitor.eventId,
    userId: monitor.userId,
    status: monitor.status,
    queueToken: monitor.queueToken,
    queueNumber: monitor.queueNumber,
    currentPosition: monitor.currentPosition,
    aheadCount: monitor.aheadCount,
    enteredAt: null,
    admittedAt: null,
    admissionToken: monitor.admissionToken,
    admissionExpiresAt: monitor.admissionExpiresAt,
    canEnter: monitor.canEnter,
    isExpired: monitor.isExpired,
  }
}

function buildCouponNotice(outcome: CouponIssueOutcome, fallbackMessage: string): UserNotice {
  switch (outcome) {
    case 'SUCCESS':
      return { tone: 'success', title: '쿠폰이 발급되었습니다', body: '선택한 쿠폰이 정상적으로 지급되었습니다.' }
    case 'DUPLICATE':
      return { tone: 'warning', title: '이미 발급받은 쿠폰입니다', body: '같은 아이디로는 한 번만 발급됩니다.' }
    case 'SOLD_OUT':
      return { tone: 'warning', title: '준비된 쿠폰이 모두 소진되었습니다', body: '선택한 쿠폰 재고가 모두 소진된 상태입니다.' }
    case 'NOT_FOUND':
      return { tone: 'danger', title: '선택한 쿠폰을 찾을 수 없습니다', body: fallbackMessage }
    default:
      return { tone: 'danger', title: '쿠폰 발급에 실패했습니다', body: fallbackMessage }
  }
}

function getGuideMessage(
  queueStatus: QueueStatusData | null,
  couponResult: CouponIssueResult | null,
  selectedCoupon: CouponListItem | null,
  isAuthenticated: boolean,
) {
  if (!isAuthenticated) return 'Step 1. 로그인 창에서 아이디와 비밀번호를 입력해 이벤트에 입장하세요.'
  if (!selectedCoupon) return 'Step 2. 오픈 상태가 되면 원하는 쿠폰 카드를 눌러 바로 대기열에 입장하세요.'
  if (couponResult?.outcome === 'SUCCESS') return `Step 4. ${selectedCoupon.couponName} 발급이 완료되었습니다.`
  if (queueStatus?.status === 'ENTERED') return `Step 4. 입장 처리가 완료되었습니다. 이제 ${selectedCoupon.couponName} 발급 결과를 확인하세요.`
  if (queueStatus?.status === 'ADMITTED') return `Step 3. ${selectedCoupon.couponName} 발급이 가능한 상태입니다. 쿠폰 발급을 진행하세요.`
  if (queueStatus?.status === 'WAITING') return `Step 3. ${selectedCoupon.couponName} 대기열 순번을 3초마다 갱신하고 있습니다.`
  return `Step 2. ${selectedCoupon.couponName} 카드를 누르는 즉시 대기열이 생성됩니다.`
}

function getLastResponseStatus(queueStatus: QueueStatusData | null, couponResult: CouponIssueResult | null, errorMessage: string | null) {
  if (errorMessage) return 'ERROR'
  if (couponResult) return couponResult.outcome
  if (queueStatus) return queueStatus.status
  return 'IDLE'
}

function formatWaitEstimate(value?: number | null) {
  if (value === null || value === undefined) return '-'
  if (value < 60) return `${value}s`
  const minutes = Math.floor(value / 60)
  const seconds = value % 60
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`
}

function HomePage() {
  const initialAuthSession = readStoredAuthSession()
  const initialIdentity = readStoredQueueIdentity()
  const [authSession, setAuthSession] = useState<AuthSession | null>(initialAuthSession)
  const [userId, setUserId] = useState(initialAuthSession?.loginId ?? '')
  const [loginIdInput, setLoginIdInput] = useState(initialAuthSession?.loginId ?? '')
  const [passwordInput, setPasswordInput] = useState('')
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null)
  const [products, setProducts] = useState<ProductItem[]>([])
  const [coupons, setCoupons] = useState<CouponListItem[]>([])
  const [selectedCoupon, setSelectedCoupon] = useState<CouponListItem | null>(null)
  const [monitor, setMonitor] = useState<DemoMonitorData | null>(null)
  const [roundData, setRoundData] = useState<DemoRoundData | null>(null)
  const [serverClockOffsetMs, setServerClockOffsetMs] = useState(0)
  const [displayNowMs, setDisplayNowMs] = useState(Date.now())
  const [initialQueueLength, setInitialQueueLength] = useState<number | null>(null)
  const [initialQueuePosition, setInitialQueuePosition] = useState<number | null>(null)
  const [consumeResult, setConsumeResult] = useState<QueueConsumeResult | null>(null)
  const [couponResult, setCouponResult] = useState<CouponIssueResult | null>(null)
  const [latestAdmitResult, setLatestAdmitResult] = useState<QueueAdmissionResult | null>(null)
  const [notice, setNotice] = useState<UserNotice>({
    tone: 'info',
    title: '로그인 후 원하는 쿠폰을 선택해 주세요',
    body: '쿠폰 카드를 누르는 즉시 현재 로그인한 아이디로 대기열에 입장합니다.',
  })
  const [logs, setLogs] = useState<DemoApiLogEntry[]>([])
  const [lastApi, setLastApi] = useState<string | null>(null)
  const [lastRequestAt, setLastRequestAt] = useState<string | null>(null)
  const [lastResponse, setLastResponse] = useState<unknown>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isProductLoading, setIsProductLoading] = useState(false)
  const [isCouponLoading, setIsCouponLoading] = useState(false)
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false)
  const [isIssuedCouponsModalOpen, setIsIssuedCouponsModalOpen] = useState(false)
  const [issuedCouponsModalVariant, setIssuedCouponsModalVariant] = useState<IssuedCouponsModalVariant>('success')
  const [isJoining, setIsJoining] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isRoundLoading, setIsRoundLoading] = useState(false)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [isAdmitting, setIsAdmitting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const autoAdvanceKeyRef = useRef<string | null>(null)
  const autoAdvanceTimeoutRef = useRef<number | null>(null)
  const lastTerminalAlertKeyRef = useRef<string | null>(null)

  const queueStatus = useMemo(() => toQueueStatusData(monitor), [monitor])
  const activeCouponId = selectedCoupon?.couponId ?? DEMO_COUPON_ID
  const isRoundOpen = roundData?.open ?? false
  const guideMessage = useMemo(() => getGuideMessage(queueStatus, couponResult, selectedCoupon, Boolean(authSession)), [authSession, couponResult, queueStatus, selectedCoupon])
  const lastResponseStatus = useMemo(() => getLastResponseStatus(queueStatus, couponResult, errorMessage), [couponResult, errorMessage, queueStatus])
  const shouldPoll = Boolean(
    authSession &&
      queueStatus &&
      (queueStatus.status === 'WAITING' || queueStatus.status === 'ADMITTED') &&
      couponResult?.outcome !== 'SUCCESS' &&
      couponResult?.outcome !== 'SOLD_OUT',
  )
  const countdownDisplayMs = useMemo(() => {
    if (!roundData) return 0
    if (roundData.open) return Math.max(roundData.openWindowEndsAtEpochMs - displayNowMs, 0)
    return Math.max(roundData.nextRoundStartEpochMs - displayNowMs, 0)
  }, [displayNowMs, roundData])
  const countdownProgressPercent = useMemo(() => {
    if (!roundData) return 0
    const cycleMs = Math.max(roundData.roundIntervalSeconds * 1000, 1)
    return Math.min((countdownDisplayMs / cycleMs) * 100, 100)
  }, [countdownDisplayMs, roundData])
  const openWindowPercent = useMemo(() => {
    if (!roundData) return 0
    const openWindowMs = Math.max(roundData.openWindowSeconds * 1000, 1)
    return Math.min((countdownDisplayMs / openWindowMs) * 100, 100)
  }, [countdownDisplayMs, roundData])

  function persistIdentity(nextUserId: string, admissionToken?: string | null) {
    writeStoredQueueIdentity({ eventId: String(DEMO_EVENT_ID), userId: nextUserId, admissionToken: admissionToken ?? null })
  }

  function updateMonitor(nextMonitor: DemoMonitorData | null) {
    setMonitor(nextMonitor)
    if (nextMonitor) persistIdentity(nextMonitor.userId, nextMonitor.admissionToken)
  }

  function pushLog(entry: Omit<DemoApiLogEntry, 'id'>) {
    setLogs((current) => [{ id: buildLogId(), ...entry }, ...current].slice(0, 14))
  }

  function beginApiCall(method: 'GET' | 'POST', endpoint: string) {
    const requestedAt = new Date().toISOString()
    setLastApi(`${method} ${endpoint}`)
    setLastRequestAt(requestedAt)
    return requestedAt
  }

  function handleApiError(error: unknown, method: 'GET' | 'POST', endpoint: string, requestedAt: string, summary: string) {
    const parsed = parseApiError(error)
    const payload = parsed.payload ?? parsed
    setLastResponse(payload)
    setErrorMessage(parsed.message)
    pushLog({ method, endpoint, requestedAt, status: 'error', summary, response: payload, durationMs: getDurationMs(requestedAt) })
    return parsed
  }

  function clearJourneyState() {
    updateMonitor(null)
    setInitialQueueLength(null)
    setInitialQueuePosition(null)
    setConsumeResult(null)
    setCouponResult(null)
    setLatestAdmitResult(null)
    setErrorMessage(null)
    setIssuedCouponsModalVariant('success')
    autoAdvanceKeyRef.current = null
    lastTerminalAlertKeyRef.current = null
    if (autoAdvanceTimeoutRef.current !== null) {
      window.clearTimeout(autoAdvanceTimeoutRef.current)
      autoAdvanceTimeoutRef.current = null
    }
  }

  function handleLogout() {
    setAuthSession(null)
    setUserId('')
    setLoginIdInput('')
    setPasswordInput('')
    setAuthErrorMessage(null)
    setRoundData(null)
    setSelectedCoupon(null)
    clearJourneyState()
    setIsQueueModalOpen(false)
    setIsIssuedCouponsModalOpen(false)
    clearStoredAuthSession()
    clearStoredQueueIdentity()
    setNotice({
      tone: 'info',
      title: '로그아웃되었습니다',
      body: '다시 로그인하면 같은 아이디로 이벤트에 바로 참여할 수 있습니다.',
    })
  }

  async function handleLogin() {
    if (!loginIdInput.trim() || !passwordInput.trim()) {
      setAuthErrorMessage('아이디와 비밀번호를 모두 입력해 주세요.')
      return
    }

    const endpoint = '/api/v1/auth/login'
    const requestedAt = beginApiCall('POST', endpoint)
    setIsAuthLoading(true)

    try {
      const response = await loginOrRegister({
        loginId: loginIdInput.trim(),
        password: passwordInput.trim(),
      })
      const nextSession = { loginId: response.loginId }
      setAuthSession(nextSession)
      setUserId(response.loginId)
      setLoginIdInput(response.loginId)
      setPasswordInput('')
      setAuthErrorMessage(null)
      writeStoredAuthSession(nextSession)
      setLastResponse(response)
      setErrorMessage(null)
      setNotice({
        tone: 'success',
        title: response.created ? '회원가입 후 바로 로그인되었습니다' : '로그인되었습니다',
        body: `${response.loginId} 아이디로 이벤트와 리더보드가 연동됩니다.`,
      })
      pushLog({
        method: 'POST',
        endpoint,
        requestedAt,
        status: 'success',
        summary: response.message,
        response,
        durationMs: getDurationMs(requestedAt),
      })
    } catch (error) {
      const parsed = handleApiError(error, 'POST', endpoint, requestedAt, '로그인에 실패했습니다.')
      setAuthErrorMessage(parsed.message)
    } finally {
      setIsAuthLoading(false)
    }
  }

  async function loadProducts() {
    const endpoint = '/api/v1/products'
    const requestedAt = beginApiCall('GET', endpoint)
    setIsProductLoading(true)

    try {
      const response = await fetchProducts({ page: 0, size: 6 })
      setProducts(response)
      setLastResponse(response)
      setErrorMessage(null)
      pushLog({
        method: 'GET',
        endpoint,
        requestedAt,
        status: 'success',
        summary: `${formatNumber(response.length)}개의 상품을 불러왔습니다.`,
        response,
        durationMs: getDurationMs(requestedAt),
      })
    } catch (error) {
      handleApiError(error, 'GET', endpoint, requestedAt, '상품 목록을 불러오지 못했습니다.')
      setProducts([])
    } finally {
      setIsProductLoading(false)
    }
  }

  async function loadCoupons(targetUserId = userId) {
    const endpoint = '/api/v1/coupons'
    const requestedAt = beginApiCall('GET', endpoint)
    setIsCouponLoading(true)

    try {
      const response = await fetchCoupons(targetUserId)
      setCoupons(response)
      setSelectedCoupon((current) => {
        if (current) {
          return response.find((coupon) => coupon.couponId === current.couponId) ?? null
        }

        return response.find((coupon) => coupon.available && !coupon.issued) ?? response[0] ?? null
      })
      setLastResponse(response)
      setErrorMessage(null)
      pushLog({
        method: 'GET',
        endpoint,
        requestedAt,
        status: 'success',
        summary: `${formatNumber(response.length)}개의 쿠폰 목록을 불러왔습니다.`,
        response,
        durationMs: getDurationMs(requestedAt),
      })
    } catch (error) {
      handleApiError(error, 'GET', endpoint, requestedAt, '쿠폰 목록을 불러오지 못했습니다.')
      setCoupons([])
      setSelectedCoupon(null)
    } finally {
      setIsCouponLoading(false)
    }
  }

  async function loadRoundStatus(silent = false) {
    if (!userId) return null

    const endpoint = '/api/v1/demo/round'
    const requestedAt = silent ? new Date().toISOString() : beginApiCall('GET', endpoint)
    if (!silent) setIsRoundLoading(true)

    try {
      const response = await fetchDemoRound({ userId })
      setRoundData(response)
      setServerClockOffsetMs(response.serverNowEpochMs - Date.now())

      if (!silent) {
        setLastResponse(response)
        setErrorMessage(null)
        pushLog({
          method: 'GET',
          endpoint,
          requestedAt,
          status: 'success',
          summary: response.open
            ? `오픈 라운드가 진행 중입니다. 현재 리더보드 ${formatNumber(response.leaderboard.length)}건`
            : `다음 오픈까지 ${formatWaitEstimate(Math.ceil(response.countdownMs / 1000))}`,
          response,
          durationMs: getDurationMs(requestedAt),
        })
      }

      return response
    } catch (error) {
      if (!silent) {
        handleApiError(error, 'GET', endpoint, requestedAt, '오픈 라운드 상태를 불러오지 못했습니다.')
      }
      return null
    } finally {
      setIsRoundLoading(false)
    }
  }

  async function refreshMonitor(silent = false, targetUserId = userId, targetCouponId = activeCouponId) {
    if (!targetUserId) return null

    const endpoint = '/api/v1/demo/monitor'
    const requestedAt = beginApiCall('GET', endpoint)
    if (!silent) setIsRefreshing(true)

    try {
      const response = await fetchDemoMonitor({
        eventId: DEMO_EVENT_ID,
        couponId: targetCouponId,
        userId: targetUserId,
      })
      updateMonitor(response)
      setInitialQueueLength((current) => current ?? response.queueLength ?? null)
      setInitialQueuePosition((current) => current ?? response.currentPosition ?? null)
      setLastResponse(response)
      setErrorMessage(null)
      pushLog({
        method: 'GET',
        endpoint,
        requestedAt,
        status: 'success',
        summary:
          response.status === 'WAITING'
            ? `현재 내 순번은 ${formatNumber(response.currentPosition)}번입니다.`
            : response.status === 'ADMITTED'
              ? '입장 가능한 상태로 전환되었습니다.'
              : `현재 상태는 ${response.status} 입니다.`,
        response,
        durationMs: getDurationMs(requestedAt),
      })
      return response
    } catch (error) {
      const parsed = handleApiError(error, 'GET', endpoint, requestedAt, silent ? '모니터 자동 갱신 중 오류가 발생했습니다.' : '모니터 상태를 불러오지 못했습니다.')
      if (!silent) {
        setNotice({ tone: 'danger', title: parsed.title, body: parsed.message })
      }
      return null
    } finally {
      setIsRefreshing(false)
    }
  }

  async function joinExperience(targetCoupon: CouponListItem) {
    const endpoint = '/api/v1/demo/join'
    const requestedAt = beginApiCall('POST', endpoint)
    setIsJoining(true)
    setConsumeResult(null)
    setCouponResult(null)
    setLatestAdmitResult(null)

    try {
      const response = await demoJoinExperience({
        eventId: DEMO_EVENT_ID,
        couponId: targetCoupon.couponId,
        userId,
        clickedAtEpochMs: Date.now() + serverClockOffsetMs,
      })

      updateMonitor(response)
      setInitialQueueLength(response.queueLength)
      setInitialQueuePosition(response.currentPosition)
      setLastResponse(response)
      setErrorMessage(null)
      pushLog({
        method: 'POST',
        endpoint,
        requestedAt,
        status: 'success',
        summary: `${targetCoupon.couponName} 기준으로 ${formatNumber(response.simulatedUsers)}명의 유입이 반영되었습니다.`,
        response,
        durationMs: getDurationMs(requestedAt),
      })
      setNotice({
        tone: response.status === 'ADMITTED' ? 'success' : 'info',
        title: response.status === 'ADMITTED' ? `${targetCoupon.couponName} 발급 가능 상태입니다` : `${targetCoupon.couponName} 대기열에 진입했습니다`,
        body:
          response.status === 'ADMITTED'
            ? '바로 입장 처리 후 쿠폰 발급 단계로 이어집니다.'
            : `현재 내 순번은 ${formatNumber(response.currentPosition)}번이며, 전체 대기열은 ${formatNumber(response.queueLength)}명입니다.`,
      })
      return response
    } catch (error) {
      const parsed = handleApiError(error, 'POST', endpoint, requestedAt, '선택한 쿠폰 기준으로 대기열 진입에 실패했습니다.')
      setNotice({ tone: 'danger', title: parsed.title, body: parsed.message })
      return null
    } finally {
      setIsJoining(false)
    }
  }

  async function handleIssueCoupon(targetCouponId = activeCouponId) {
    const endpoint = '/api/v1/coupons/issue'
    const requestedAt = beginApiCall('POST', endpoint)

    try {
      const response = await issueCoupon({ couponId: targetCouponId, userId })
      setCouponResult(response)
      setLastResponse(response)
      setErrorMessage(null)
      pushLog({
        method: 'POST',
        endpoint,
        requestedAt,
        status: 'success',
        summary: '선택한 쿠폰 발급 요청이 완료되었습니다.',
        response,
        durationMs: getDurationMs(requestedAt),
      })
      setNotice(buildCouponNotice('SUCCESS', response.message))
      await loadCoupons(userId)
      await refreshMonitor(true, userId, targetCouponId)
      return true
    } catch (error) {
      const parsed = handleApiError(error, 'POST', endpoint, requestedAt, '쿠폰 발급에 실패했습니다.')
      const outcome = classifyCouponOutcome(parsed)
      const failedResult: CouponIssueResult = {
        couponId: targetCouponId,
        userId,
        status: outcome,
        remainingCount: monitor?.couponRemainingCount ?? null,
        issuedAt: null,
        outcome,
        message: parsed.message,
      }
      setCouponResult(failedResult)
      setNotice(buildCouponNotice(outcome, parsed.message))
      await loadCoupons(userId)
      await refreshMonitor(true, userId, targetCouponId)
      return false
    }
  }

  async function handleAdvanceJourney() {
    if (!queueStatus) return false

    if (queueStatus.status === 'ENTERED') {
      setIsAdvancing(true)
      try {
        return await handleIssueCoupon()
      } finally {
        setIsAdvancing(false)
      }
    }

    if (!queueStatus.canEnter || !queueStatus.admissionToken || !queueStatus.eventId) return false

    const endpoint = '/api/v1/queue/admission/consume'
    const requestedAt = beginApiCall('POST', endpoint)
    setIsAdvancing(true)

    try {
      const response = await consumeAdmissionToken({
        eventId: queueStatus.eventId,
        admissionToken: queueStatus.admissionToken,
      })
      setConsumeResult(response)
      setLastResponse(response)
      setErrorMessage(null)
      pushLog({
        method: 'POST',
        endpoint,
        requestedAt,
        status: 'success',
        summary: '입장 처리가 완료되었습니다. 이제 쿠폰 발급을 진행합니다.',
        response,
        durationMs: getDurationMs(requestedAt),
      })
      await refreshMonitor(true)
      return await handleIssueCoupon()
    } catch (error) {
      const parsed = handleApiError(error, 'POST', endpoint, requestedAt, '입장 처리 중 오류가 발생했습니다.')
      setNotice({ tone: 'danger', title: parsed.title, body: parsed.message })
      return false
    } finally {
      setIsAdvancing(false)
    }
  }

  async function handleResetCoupons() {
    if (!userId) return

    const endpoint = '/api/v1/coupons/reset'
    const requestedAt = beginApiCall('POST', endpoint)
    setIsResetting(true)

    try {
      const response = await resetCoupons({ userId })
      clearJourneyState()
      setIsQueueModalOpen(false)
      setIsIssuedCouponsModalOpen(false)
      setCouponResult(null)
      setConsumeResult(null)
      setLastResponse(response)
      setErrorMessage(null)
      autoAdvanceKeyRef.current = null
      pushLog({
        method: 'POST',
        endpoint,
        requestedAt,
        status: 'success',
        summary: response.message,
        response,
        durationMs: getDurationMs(requestedAt),
      })
      setNotice({
        tone: response.resetCount > 0 ? 'success' : 'info',
        title: response.resetCount > 0 ? '쿠폰 발급 이력을 초기화했습니다' : '초기화할 쿠폰 이력이 없습니다',
        body: response.message,
      })
      await loadCoupons(userId)
      await refreshMonitor(true)
    } catch (error) {
      const parsed = handleApiError(error, 'POST', endpoint, requestedAt, '쿠폰 발급 이력 초기화에 실패했습니다.')
      setNotice({ tone: 'danger', title: parsed.title, body: parsed.message })
    } finally {
      setIsResetting(false)
    }
  }

  async function handleManualAdmit() {
    const endpoint = '/api/v1/queue/admit'
    const requestedAt = beginApiCall('POST', endpoint)
    setIsAdmitting(true)

    try {
      const response = await admitNextBatch({ eventId: DEMO_EVENT_ID, count: 1 })
      setLatestAdmitResult(response)
      setLastResponse(response)
      setErrorMessage(null)
      pushLog({
        method: 'POST',
        endpoint,
        requestedAt,
        status: 'info',
        summary: `${formatNumber(response.admittedCount)}명의 사용자가 입장 가능 상태로 전환되었습니다.`,
        response,
        durationMs: getDurationMs(requestedAt),
      })
      await refreshMonitor(true)
    } catch (error) {
      handleApiError(error, 'POST', endpoint, requestedAt, '수동 admit 호출에 실패했습니다.')
    } finally {
      setIsAdmitting(false)
    }
  }

  async function openQueueJourney(targetCoupon = selectedCoupon) {
    if (!authSession || !userId) {
      setAuthErrorMessage('먼저 로그인해 주세요.')
      return
    }

    if (!targetCoupon) {
      setNotice({ tone: 'warning', title: '먼저 쿠폰을 선택해 주세요', body: '상단 이벤트 영역의 쿠폰 카드를 누르면 바로 대기열이 생성됩니다.' })
      return
    }

    if (!isRoundOpen) {
      clearJourneyState()
      setIsQueueModalOpen(false)
      setNotice({
        tone: 'warning',
        title: '아직 쿠폰 오픈 전입니다',
        body: '상단 카운트다운이 끝난 뒤 버튼이 열리면 그때 대기열에 입장할 수 있습니다.',
      })
      return
    }

    if (targetCoupon.issued) {
      setNotice({
        tone: 'warning',
        title: '이미 발급받은 쿠폰입니다',
        body: '오른쪽 모니터 패널의 reset my coupons 버튼으로 발급 이력을 초기화한 뒤 다시 테스트해 주세요.',
      })
      return
    }

    if (!targetCoupon.available) {
      setNotice({ tone: 'warning', title: '이 쿠폰은 현재 소진되었습니다', body: '재고가 남아 있는 다른 쿠폰으로 다시 시도해 주세요.' })
      return
    }

    const couponChanged = selectedCoupon?.couponId !== targetCoupon.couponId
    if (couponChanged) {
      setSelectedCoupon(targetCoupon)
      clearJourneyState()
    }

    if (couponChanged || !queueStatus || queueStatus.status === 'EXPIRED' || queueStatus.status === 'ENTERED' || couponResult?.outcome === 'SUCCESS') {
      setIsQueueModalOpen(true)
      setNotice({
        tone: 'info',
        title: '대기열 입장을 준비하고 있습니다',
        body: `${targetCoupon.couponName} 쿠폰 기준으로 대기열 입장을 시도하고 있습니다.`,
      })
      const joinedMonitor = await joinExperience(targetCoupon)
      if (!joinedMonitor) {
        setNotice((current) => ({
          ...current,
          tone: 'danger',
        }))
      }
      return
    }

    setIsQueueModalOpen(true)
    const refreshedMonitor = await refreshMonitor(false, userId, targetCoupon.couponId)
    if (!refreshedMonitor) {
      setNotice({
        tone: 'danger',
        title: '대기열 상태를 불러오지 못했습니다',
        body: '잠시 후 다시 시도해 주세요.',
      })
    }
  }

  useEffect(() => {
    pushLog({
      method: 'GET',
      endpoint: '/event-demo',
      requestedAt: new Date().toISOString(),
      status: 'info',
      summary: '프로모션 데모 페이지가 열렸습니다.',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!authSession) return

    setUserId(authSession.loginId)
    void loadProducts()
    void loadCoupons(authSession.loginId)
    void loadRoundStatus()

    if (initialIdentity?.userId === authSession.loginId && initialIdentity.eventId === String(DEMO_EVENT_ID)) {
      void refreshMonitor(true, authSession.loginId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authSession?.loginId])

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setDisplayNowMs(Date.now() + serverClockOffsetMs)
    }, 100)

    return () => {
      window.clearInterval(timerId)
    }
  }, [serverClockOffsetMs])

  useEffect(() => {
    if (!authSession || !userId) return
    void loadRoundStatus(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authSession?.loginId, userId])

  usePolling({
    enabled: shouldPoll,
    intervalMs: QUEUE_STATUS_POLL_INTERVAL_MS,
    callback: () => {
      void refreshMonitor(true)
    },
  })

  usePolling({
    enabled: Boolean(authSession),
    intervalMs: 1000,
    callback: () => {
      void loadRoundStatus(true)
    },
  })

  useEffect(() => {
    if (!queueStatus || isJoining || isAdvancing) {
      if (autoAdvanceTimeoutRef.current !== null) {
        window.clearTimeout(autoAdvanceTimeoutRef.current)
        autoAdvanceTimeoutRef.current = null
      }
      return
    }

    if (couponResult?.outcome === 'SUCCESS') {
      if (autoAdvanceTimeoutRef.current !== null) {
        window.clearTimeout(autoAdvanceTimeoutRef.current)
        autoAdvanceTimeoutRef.current = null
      }
      return
    }

    const autoAdvanceKey =
      isQueueModalOpen && queueStatus.status === 'ADMITTED' && queueStatus.canEnter && queueStatus.admissionToken
        ? `ADMITTED:${queueStatus.admissionToken}`
        : null

    if (!autoAdvanceKey) {
      if (queueStatus.status === 'WAITING' || queueStatus.status === 'EXPIRED' || queueStatus.status === 'ENTERED') {
        autoAdvanceKeyRef.current = null
      }
      if (autoAdvanceTimeoutRef.current !== null) {
        window.clearTimeout(autoAdvanceTimeoutRef.current)
        autoAdvanceTimeoutRef.current = null
      }
      return
    }

    if (autoAdvanceKeyRef.current === autoAdvanceKey) {
      return
    }

    autoAdvanceKeyRef.current = autoAdvanceKey
    autoAdvanceTimeoutRef.current = window.setTimeout(() => {
      autoAdvanceTimeoutRef.current = null
      void handleAdvanceJourney().then((succeeded) => {
        if (!succeeded) {
          autoAdvanceKeyRef.current = null
        }
      })
    }, 1800)
  }, [couponResult?.outcome, isAdvancing, isJoining, isQueueModalOpen, queueStatus])

  useEffect(() => {
    if (
      !isQueueModalOpen ||
      couponResult ||
      !queueStatus ||
      (queueStatus.status !== 'WAITING' && queueStatus.status !== 'ADMITTED') ||
      (monitor?.couponRemainingCount ?? 0) > 0
    ) {
      return
    }

    setCouponResult({
      couponId: activeCouponId,
      userId,
      status: 'SOLD_OUT',
      remainingCount: 0,
      issuedAt: null,
      outcome: 'SOLD_OUT',
      message: '준비된 쿠폰이 모두 소진되었습니다.',
    })
  }, [activeCouponId, couponResult, isQueueModalOpen, monitor?.couponRemainingCount, queueStatus, userId])

  useEffect(() => {
    if (couponResult?.outcome !== 'SUCCESS' && couponResult?.outcome !== 'SOLD_OUT') {
      return
    }

    const terminalKey = `${couponResult.outcome}:${couponResult.couponId ?? 'coupon'}:${couponResult.issuedAt ?? 'none'}:${userId}`
    if (lastTerminalAlertKeyRef.current === terminalKey) {
      return
    }

    lastTerminalAlertKeyRef.current = terminalKey
    setIssuedCouponsModalVariant(couponResult.outcome === 'SUCCESS' ? 'success' : 'soldOut')
    setIsQueueModalOpen(false)
    setIsIssuedCouponsModalOpen(true)

    if (couponResult.outcome === 'SUCCESS') {
      const couponName = selectedCoupon?.couponName ?? '쿠폰'
      window.alert(`${couponName} 쿠폰이 발급되었습니다!`)
      return
    }

    window.alert('쿠폰이 모두 소진되었습니다.')
  }, [couponResult?.couponId, couponResult?.issuedAt, couponResult?.outcome, selectedCoupon?.couponName, userId])

  return (
    <div className="space-y-8">
      <CountdownOpenBar
        isOpen={isRoundOpen}
        displayMs={countdownDisplayMs}
        cycleProgressPercent={countdownProgressPercent}
        openWindowPercent={openWindowPercent}
      />

      <DemoHero
        queueStatus={queueStatus}
        round={roundData}
        coupons={coupons}
        selectedCouponId={selectedCoupon?.couponId ?? null}
        isCouponLoading={isCouponLoading}
        isRoundOpen={isRoundOpen}
        onPrimaryAction={() => {
          void openQueueJourney()
        }}
        onSecondaryAction={handleLogout}
        onResetCoupons={() => {
          void handleResetCoupons()
        }}
        onCouponSelect={(coupon) => {
          void openQueueJourney(coupon)
        }}
        isActionLoading={isJoining || isAdvancing}
        isResetting={isResetting}
        secondaryLabel="로그아웃"
      />

      <div className="grid gap-6">

          {/* 
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-[30px] border border-white/80 bg-white p-6 shadow-panel">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Event Queue</p>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{formatNumber(monitor?.queueLength)}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">Current live queue volume</p>
            </article>
            <article className="rounded-[30px] border border-white/80 bg-white p-6 shadow-panel">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">My Position</p>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{formatNumber(queueStatus?.currentPosition)}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">Position for the logged-in account</p>
            </article>
            <article className="rounded-[30px] border border-white/80 bg-white p-6 shadow-panel">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Login ID</p>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{authSession?.loginId ?? '-'}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">This ID is also used in the leaderboard</p>
            </article>
            <article className="rounded-[30px] border border-white/80 bg-white p-6 shadow-panel">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Estimated Wait</p>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{formatWaitEstimate(monitor?.estimatedWaitSeconds)}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">ETA based on current admission throughput</p>
            </article>
          </section>
          */}
{/* 
          <Card title="Peak Traffic Readiness" description="A compact architecture story for the demo: absorb burst traffic early, control admission, and protect the write path during the sale window.">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">CDN + Assets</p>
                <h3 className="mt-2 text-lg font-bold text-slate-950">Static traffic is offloaded first</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Images and static bundles stay outside the app tier so peak entry traffic does not waste origin capacity.</p>
              </article>
              <article className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Queue Control</p>
                <h3 className="mt-2 text-lg font-bold text-slate-950">Burst traffic is shaped into batches</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Requests join the queue first and are admitted at a controlled rate that the backend can sustain.</p>
              </article>
              <article className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Redis Cache</p>
                <h3 className="mt-2 text-lg font-bold text-slate-950">Read-heavy paths stay responsive</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Product and queue snapshots can be served quickly while the database focuses on state changes and durability.</p>
              </article>
              <article className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Async Processing</p>
                <h3 className="mt-2 text-lg font-bold text-slate-950">Heavy writes are decoupled</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Coupon history, notifications, and follow-up work can flow through workers without slowing the customer path.</p>
              </article>
            </div>
          </Card>

 
          <Card title="프로모션 상품" description="실제 이벤트 페이지처럼 상품을 둘러보는 흐름은 유지하면서, 쿠폰 선택과 대기열 진입은 상단 이벤트 영역에서 바로 이어지도록 구성했습니다.">
            {isProductLoading ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="rounded-[28px] border border-white/80 bg-white p-5 shadow-panel">
                    <Skeleton className="h-32 w-full rounded-[24px]" />
                    <Skeleton className="mt-5 h-5 w-24" />
                    <Skeleton className="mt-3 h-7 w-3/4" />
                    <Skeleton className="mt-5 h-20 w-full rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product, index) => (
                  <PromoProductCard key={String(product.id)} product={product} index={index} />
                ))}
              </div>
            )}
          </Card>

           */}
   

        <LiveStatePanel
          userId={userId || '-'}
          eventId={DEMO_EVENT_ID}
          monitor={monitor}
          initialQueueLength={initialQueueLength}
          queueStatus={queueStatus}
          couponResult={couponResult}
          lastApi={lastApi}
          lastRequestAt={lastRequestAt}
          lastResponseStatus={lastResponseStatus}
          errorMessage={errorMessage || authErrorMessage}
          logs={logs}
          latestAdmitResult={latestAdmitResult}
          guideMessage={guideMessage}
          lastResponse={lastResponse}
          isAdmitting={isAdmitting}
          isResetting={isResetting}
          onAdmitNext={() => {
            void handleManualAdmit()
          }}
          onResetCoupons={() => {
            void handleResetCoupons()
          }}
        />
      </div>

      <QueueJourneyModal
        isOpen={isQueueModalOpen}
        monitor={monitor}
        initialQueueLength={initialQueueLength}
        initialQueuePosition={initialQueuePosition}
        queueStatus={queueStatus}
        consumeResult={consumeResult}
        couponResult={couponResult}
        userMessage={notice.body}
        isLoading={isJoining || isAdvancing || isRoundLoading}
        onClose={() => setIsQueueModalOpen(false)}
        onPrimaryAction={() => {
          if (queueStatus?.status === 'WAITING') {
            void refreshMonitor()
            return
          }
          if (queueStatus?.status === 'ADMITTED' || queueStatus?.status === 'ENTERED') {
            void handleAdvanceJourney()
            return
          }
          void openQueueJourney()
        }}
      />

      <IssuedCouponsModal
        isOpen={isIssuedCouponsModalOpen}
        couponName={selectedCoupon?.couponName ?? null}
        coupons={coupons}
        variant={issuedCouponsModalVariant}
        isResetting={isResetting}
        onReset={() => {
          void handleResetCoupons()
        }}
        onClose={() => setIsIssuedCouponsModalOpen(false)}
      />

      {!authSession ? (
        <LoginGateModal
          loginId={loginIdInput}
          password={passwordInput}
          errorMessage={authErrorMessage}
          isLoading={isAuthLoading}
          onLoginIdChange={setLoginIdInput}
          onPasswordChange={setPasswordInput}
          onSubmit={() => {
            void handleLogin()
          }}
        />
      ) : null}
    </div>
  )
}

export default HomePage
