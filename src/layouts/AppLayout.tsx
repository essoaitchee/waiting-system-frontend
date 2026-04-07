import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/utils/cn'

const navigationItems = [
  { to: '/', label: 'Event Demo' },
  { to: '/queue/enter', label: 'Queue Lab' },
  { to: '/queue/status', label: 'Status Lab' },
  { to: '/products', label: 'Products API' },
  { to: '/coupons', label: 'Coupons API' },
]

function AppLayout() {
  return (
    <div className="page-shell">
      <header className="sticky top-4 z-20 mb-8 rounded-[32px] border border-white/70 bg-white/85 px-5 py-4 shadow-soft backdrop-blur sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          {/* <div>
            <p className="eyebrow mb-3">Traffic Control Demo</p>
            <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:gap-4">
              <h1 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">MALLORY PROMOTION EVENT</h1>
              <p className="text-sm font-medium text-slate-500">Queue, admission token, coupon issue flow demo</p>
            </div>
            <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
              실제 쇼핑몰 프로모션 페이지처럼 보이되, 발표 시에는 대기열 기반 트래픽 제어와 API 흐름을 함께 설명할 수 있도록 구성한 프론트 데모입니다.
            </p>
          </div> */}

          <nav className="flex flex-wrap gap-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-4 py-2 text-sm font-semibold transition',
                    isActive
                      ? 'bg-slate-900 text-white shadow-panel'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="px-1 pt-10 text-sm text-slate-500">
        Frontend stack: React, Vite, TypeScript, Tailwind CSS, axios, React Router
      </footer>
    </div>
  )
}

export default AppLayout
