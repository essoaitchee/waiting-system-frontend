import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { enterQueue } from '@/api/queue'
import KeyValueGrid from '@/components/common/KeyValueGrid'
import SectionHeader from '@/components/common/SectionHeader'
import { StatusBadge } from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import type { QueueStatusData } from '@/types/queue'
import { parseApiError } from '@/utils/error'
import { formatDateTime, formatNumber } from '@/utils/format'
import { readStoredQueueIdentity, writeStoredQueueIdentity } from '@/utils/storage'

function QueueEnterPage() {
  const navigate = useNavigate()
  const storedIdentity = useMemo(() => readStoredQueueIdentity(), [])
  const [eventId, setEventId] = useState(storedIdentity?.eventId ?? '')
  const [userId, setUserId] = useState(storedIdentity?.userId ?? '')
  const [result, setResult] = useState<QueueStatusData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ tone: 'success' | 'danger'; title: string; body: string } | null>(null)

  useEffect(() => {
    if (!result?.eventId || !result.userId) {
      return undefined
    }

    const timerId = window.setTimeout(() => {
      navigate(`/queue/status?eventId=${result.eventId}&userId=${encodeURIComponent(result.userId)}`)
    }, 1200)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [navigate, result])

  const canSubmit = eventId.trim() && userId.trim()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      setMessage({
        tone: 'danger',
        title: '입력값 확인',
        body: 'eventId와 userId를 모두 입력해 주세요.',
      })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const payload = {
        eventId: Number(eventId),
        userId: userId.trim(),
      }
      const data = await enterQueue(payload)
      setResult(data)
      writeStoredQueueIdentity({
        eventId: String(payload.eventId),
        userId: payload.userId,
        admissionToken: data.admissionToken,
      })
      setMessage({
        tone: 'success',
        title: '대기열 입장 성공',
        body: '응답을 표시한 뒤 상태 조회 페이지로 자동 이동합니다.',
      })
    } catch (error) {
      const parsed = parseApiError(error)
      setMessage({
        tone: 'danger',
        title: parsed.title,
        body: parsed.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Queue Enter"
        title="대기열에 사용자 진입 요청"
        description="eventId와 userId를 입력해 `/api/v1/queue/enter`를 호출합니다. 성공하면 현재 순번과 admission token 여부를 바로 확인하고 상태 페이지로 이어집니다."
      />

      <div className="section-grid">
        <Card title="입장 요청 폼" description="실제 백엔드 API 호출 기준으로 동작합니다.">
          <form className="space-y-4" onSubmit={handleSubmit}>
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
              <Button type="submit" isLoading={isSubmitting}>
                대기열 입장 요청
              </Button>
              <Link to="/queue/status">
                <Button variant="secondary">상태 조회 바로 가기</Button>
              </Link>
            </div>
          </form>

          {message ? (
            <Alert tone={message.tone} title={message.title} className="mt-5">
              {message.body}
            </Alert>
          ) : null}
        </Card>

        <Card
          title="최근 응답"
          description="입장 요청 성공 시 주요 필드를 보기 좋게 요약합니다."
          action={result ? <StatusBadge status={result.status} /> : null}
        >
          {result ? (
            <div className="space-y-4">
              <KeyValueGrid
                items={[
                  { label: 'Event ID', value: result.eventId ?? '-' },
                  { label: 'User ID', value: result.userId },
                  { label: 'Queue Number', value: formatNumber(result.queueNumber) },
                  { label: 'Current Position', value: formatNumber(result.currentPosition) },
                  { label: 'Ahead Count', value: formatNumber(result.aheadCount) },
                  { label: 'Queue Token', value: result.queueToken ?? '-' },
                  { label: 'Entered At', value: formatDateTime(result.enteredAt) },
                  { label: 'Admission Token', value: result.admissionToken ?? '-' },
                  { label: 'Admission Expires At', value: formatDateTime(result.admissionExpiresAt) },
                ]}
              />
              <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-100">
                <pre className="overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">아직 입장 응답이 없습니다. 폼을 제출하면 결과가 이 영역에 표시됩니다.</p>
          )}
        </Card>
      </div>
    </div>
  )
}

export default QueueEnterPage
