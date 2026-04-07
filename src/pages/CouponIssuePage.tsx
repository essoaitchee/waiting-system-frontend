import { useState } from 'react'
import { issueCoupon } from '@/api/coupons'
import SectionHeader from '@/components/common/SectionHeader'
import { Badge } from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import type { CouponIssueResult } from '@/types/coupon'
import { classifyCouponOutcome, parseApiError } from '@/utils/error'
import { formatDateTime, formatNumber } from '@/utils/format'

function CouponIssuePage() {
  const [couponId, setCouponId] = useState('')
  const [userId, setUserId] = useState('')
  const [result, setResult] = useState<CouponIssueResult | null>(null)
  const [rawError, setRawError] = useState<unknown>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ tone: 'success' | 'danger' | 'warning'; title: string; body: string } | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!couponId.trim() || !userId.trim()) {
      setMessage({
        tone: 'danger',
        title: '입력값 확인',
        body: 'couponId와 userId를 모두 입력해 주세요.',
      })
      return
    }

    setIsSubmitting(true)
    setMessage(null)
    setRawError(null)

    try {
      const data = await issueCoupon({
        couponId: Number(couponId),
        userId: userId.trim(),
      })
      setResult(data)
      setMessage({
        tone: 'success',
        title: '쿠폰 발급 성공',
        body: '쿠폰이 정상적으로 발급되었습니다.',
      })
    } catch (error) {
      const parsed = parseApiError(error)
      const outcome = classifyCouponOutcome(parsed)
      setRawError(parsed.payload ?? parsed)
      setResult({
        couponId: couponId.trim() ? Number(couponId) : null,
        userId: userId.trim(),
        status: outcome,
        remainingCount: null,
        issuedAt: null,
        outcome,
        message: parsed.message,
      })
      setMessage({
        tone: outcome === 'SOLD_OUT' || outcome === 'DUPLICATE' ? 'warning' : 'danger',
        title:
          outcome === 'DUPLICATE'
            ? '중복 발급'
            : outcome === 'SOLD_OUT'
              ? '품절'
              : outcome === 'NOT_FOUND'
                ? '쿠폰 없음'
                : parsed.title,
        body: parsed.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Coupons"
        title="쿠폰 발급 테스트"
        description="`/api/v1/coupons/issue`를 호출해 성공, 중복, 품절, 에러 시나리오를 화면에서 바로 확인할 수 있습니다."
      />

      <div className="section-grid">
        <Card title="발급 요청 폼" description="couponId와 userId를 기준으로 실제 쿠폰 발급 API를 호출합니다.">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Coupon ID"
              placeholder="예: 77"
              inputMode="numeric"
              value={couponId}
              onChange={(event) => setCouponId(event.target.value)}
            />
            <Input
              label="User ID"
              placeholder="예: demo-user"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
            />
            <Button type="submit" isLoading={isSubmitting}>
              쿠폰 발급 요청
            </Button>
          </form>

          {message ? (
            <Alert tone={message.tone} title={message.title} className="mt-5">
              {message.body}
            </Alert>
          ) : null}
        </Card>

        <Card
          title="발급 결과"
          description="응답 결과를 상태별로 구분해서 보여줍니다."
          action={
            result ? (
              <Badge tone={result.outcome === 'SUCCESS' ? 'success' : result.outcome === 'ERROR' ? 'danger' : 'warning'}>
                {result.outcome}
              </Badge>
            ) : null
          }
        >
          {result ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Coupon ID</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{result.couponId ?? '-'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">User ID</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{result.userId || '-'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{result.status}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Remaining Count</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{formatNumber(result.remainingCount)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Issued At</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{formatDateTime(result.issuedAt)}</p>
                </div>
              </div>

              <Alert tone={result.outcome === 'SUCCESS' ? 'success' : result.outcome === 'ERROR' ? 'danger' : 'warning'}>
                {result.message}
              </Alert>
            </div>
          ) : (
            <p className="text-sm text-slate-500">아직 발급 결과가 없습니다. 요청을 보내면 이 영역에 표시됩니다.</p>
          )}
        </Card>
      </div>

      <Card title="응답 미리보기" description="성공 시 정규화된 응답, 실패 시 에러 payload를 확인합니다.">
        {result || rawError ? (
          <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-100">
            <pre className="overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(rawError ?? result, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-sm text-slate-500">쿠폰 발급 요청 이후 응답 데이터가 표시됩니다.</p>
        )}
      </Card>
    </div>
  )
}

export default CouponIssuePage
