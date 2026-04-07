import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { consumeAdmissionToken, getQueueStatus } from '@/api/queue'
import SectionHeader from '@/components/common/SectionHeader'
import QueueStatusSummary from '@/components/queue/QueueStatusSummary'
import Alert from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { QueueConsumeResult, QueueStatusData } from '@/types/queue'
import { usePolling } from '@/hooks/usePolling'
import { QUEUE_STATUS_POLL_INTERVAL_MS } from '@/utils/constants'
import { parseApiError } from '@/utils/error'
import { formatDateTime } from '@/utils/format'
import { readStoredQueueIdentity, writeStoredQueueIdentity } from '@/utils/storage'

function QueueStatusPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const storedIdentity = useMemo(() => readStoredQueueIdentity(), [])
  const initialEventId = searchParams.get('eventId') || storedIdentity?.eventId || ''
  const initialUserId = searchParams.get('userId') || storedIdentity?.userId || ''

  const [eventId, setEventId] = useState(initialEventId)
  const [userId, setUserId] = useState(initialUserId)
  const [status, setStatus] = useState<QueueStatusData | null>(null)
  const [consumeResult, setConsumeResult] = useState<QueueConsumeResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPolling, setIsPolling] = useState(Boolean(initialEventId && initialUserId))
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null)
  const [message, setMessage] = useState<{ tone: 'success' | 'danger' | 'info'; title: string; body: string } | null>(null)

  const numericEventId = eventId.trim() ? Number(eventId) : Number.NaN
  const canQuery = Number.isFinite(numericEventId) && numericEventId > 0 && userId.trim().length > 0

  const loadStatus = useCallback(async (silent = false) => {
    if (!canQuery) {
      setMessage({
        tone: 'danger',
        title: '입력값 확인',
        body: 'eventId와 userId를 모두 올바르게 입력해 주세요.',
      })
      return
    }

    setMessage((current) => (silent ? current : null))
    if (silent) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const data = await getQueueStatus({
        eventId: numericEventId,
        userId: userId.trim(),
      })

      setStatus(data)
      setLastUpdatedAt(new Date().toISOString())
      writeStoredQueueIdentity({
        eventId: String(numericEventId),
        userId: userId.trim(),
        admissionToken: data.admissionToken,
      })
      setSearchParams({
        eventId: String(numericEventId),
        userId: userId.trim(),
      })
    } catch (error) {
      const parsed = parseApiError(error)
      setMessage({
        tone: 'danger',
        title: parsed.title,
        body: parsed.message,
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [canQuery, numericEventId, setSearchParams, userId])

  useEffect(() => {
    if (canQuery) {
      void loadStatus()
    }
  }, [canQuery, loadStatus])

  useEffect(() => {
    if (status && (status.status === 'ENTERED' || status.status === 'EXPIRED')) {
      setIsPolling(false)
    }
  }, [status])

  usePolling({
    enabled: isPolling && canQuery,
    intervalMs: QUEUE_STATUS_POLL_INTERVAL_MS,
    callback: () => {
      void loadStatus(true)
    },
  })

  async function handleConsume() {
    if (!status?.admissionToken || !status.eventId) {
      return
    }

    try {
      const result = await consumeAdmissionToken({
        eventId: status.eventId,
        admissionToken: status.admissionToken,
      })
      setConsumeResult(result)
      setMessage({
        tone: 'success',
        title: '입장 토큰 소비 완료',
        body: '사용자 입장이 처리되었습니다. 최신 상태를 다시 조회합니다.',
      })
      setIsPolling(false)
      await loadStatus()
    } catch (error) {
      const parsed = parseApiError(error)
      setMessage({
        tone: 'danger',
        title: parsed.title,
        body: parsed.message,
      })
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Queue Polling"
        title="현재 대기열 상태 조회"
        description="`/api/v1/queue/status`를 3초 간격으로 폴링하여 내 순번과 입장 가능 여부를 확인합니다. 필요 시 폴링을 시작하거나 중지할 수 있습니다."
      />

      <div className="section-grid">
        <Card title="조회 조건" description="이전 페이지에서 전달받은 값이 있다면 자동으로 채워집니다.">
          <div className="space-y-4">
            <Input
              label="Event ID"
              placeholder="예: 1001"
              inputMode="numeric"
              value={eventId}
              onChange={(event) => setEventId(event.target.value)}
            />
            <Input
              label="User ID"
              placeholder="예: demo-user"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
            />

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void loadStatus()} isLoading={isLoading}>
                상태 조회
              </Button>
              <Button
                variant={isPolling ? 'danger' : 'secondary'}
                onClick={() => {
                  if (!isPolling && canQuery) {
                    void loadStatus(true)
                  }
                  setIsPolling((current) => !current)
                }}
              >
                {isPolling ? '폴링 중지' : '폴링 시작'}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <Badge tone={isPolling ? 'success' : 'neutral'}>{isPolling ? '자동 조회 ON' : '자동 조회 OFF'}</Badge>
              <span>간격: {QUEUE_STATUS_POLL_INTERVAL_MS / 1000}초</span>
              {isRefreshing ? (
                <span className="inline-flex items-center gap-2">
                  <LoadingSpinner className="h-4 w-4" />
                  자동 갱신 중
                </span>
              ) : null}
              {lastUpdatedAt ? <span>마지막 조회: {formatDateTime(lastUpdatedAt)}</span> : null}
            </div>
          </div>

          {message ? (
            <Alert tone={message.tone} title={message.title} className="mt-5">
              {message.body}
            </Alert>
          ) : null}
        </Card>

        {status ? (
          <QueueStatusSummary data={status} />
        ) : (
          <Card title="상태 조회 결과" description="아직 조회된 데이터가 없습니다.">
            <p className="text-sm text-slate-500">조회 조건을 입력한 뒤 상태 조회 또는 폴링 시작 버튼을 눌러 주세요.</p>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card title="입장 토큰 소비" description="admission token이 발급된 경우에만 입장 처리 API를 호출합니다.">
          {status?.canEnter && status.admissionToken ? (
            <div className="space-y-4">
              <Alert tone="success" title="입장 준비 완료">
                admission token이 유효합니다. 유효 시간 안에 소비 요청을 보내세요.
              </Alert>
              <Button variant="success" onClick={() => void handleConsume()}>
                입장 토큰 소비 요청
              </Button>
            </div>
          ) : (
            <Alert tone="info" title="대기 상태">
              admission token이 아직 발급되지 않았거나 이미 처리된 상태입니다.
            </Alert>
          )}

          {consumeResult ? (
            <div className="mt-5 rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-100">
              <pre className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(consumeResult, null, 2)}</pre>
            </div>
          ) : null}
        </Card>

        <Card title="응답 미리보기" description="정규화된 상태 응답을 JSON 형태로 함께 표시합니다.">
          {status ? (
            <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-100">
              <pre className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(status, null, 2)}</pre>
            </div>
          ) : (
            <p className="text-sm text-slate-500">상태 조회 후 응답 JSON이 표시됩니다.</p>
          )}
        </Card>
      </div>
    </div>
  )
}

export default QueueStatusPage
