import KeyValueGrid from '@/components/common/KeyValueGrid'
import Alert from '@/components/ui/Alert'
import { StatusBadge } from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import type { QueueStatusData } from '@/types/queue'
import { formatDateTime, formatNumber } from '@/utils/format'

interface QueueStatusSummaryProps {
  data: QueueStatusData
}

function QueueStatusSummary({ data }: QueueStatusSummaryProps) {
  return (
    <Card
      title="대기열 상태"
      description="현재 순번, 입장 가능 여부, 발급된 admission token 정보를 한 눈에 확인할 수 있습니다."
      className={data.canEnter ? 'ring-2 ring-emerald-200' : undefined}
      action={<StatusBadge status={data.status} />}
    >
      {data.canEnter ? (
        <Alert tone="success" title="입장 가능 상태">
          admission token이 발급되었습니다. 유효 시간 안에 입장 토큰 소비를 진행하세요.
        </Alert>
      ) : null}

      {data.isExpired ? (
        <Alert tone="danger" title="입장 시간 만료" className="mt-4">
          admission token 유효 시간이 지나 입장할 수 없습니다. 다시 상태를 확인하거나 재진입 시나리오를 검토하세요.
        </Alert>
      ) : null}

      <div className="mt-4">
        <KeyValueGrid
          items={[
            { label: 'Event ID', value: data.eventId ?? '-' },
            { label: 'User ID', value: data.userId || '-' },
            { label: 'Queue Number', value: formatNumber(data.queueNumber) },
            { label: 'Current Position', value: formatNumber(data.currentPosition) },
            { label: 'Ahead Count', value: formatNumber(data.aheadCount) },
            { label: 'Queue Token', value: data.queueToken ?? '-' },
            { label: 'Entered At', value: formatDateTime(data.enteredAt) },
            { label: 'Admitted At', value: formatDateTime(data.admittedAt) },
            { label: 'Admission Token', value: data.admissionToken ?? '-' },
            { label: 'Token Expires At', value: formatDateTime(data.admissionExpiresAt) },
          ]}
        />
      </div>
    </Card>
  )
}

export default QueueStatusSummary
