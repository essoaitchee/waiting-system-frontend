import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'

function NotFoundPage() {
  return (
    <div className="page-shell items-center justify-center">
      <div className="glass-panel max-w-xl p-8 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink">페이지를 찾을 수 없습니다</h1>
        <p className="mt-3 text-slate-600">경로가 잘못되었거나 더 이상 존재하지 않는 화면입니다.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button>홈으로 이동</Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
