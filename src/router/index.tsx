import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import CouponIssuePage from '@/pages/CouponIssuePage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import ProductsPage from '@/pages/ProductsPage'
import QueueEnterPage from '@/pages/QueueEnterPage'
import QueueStatusPage from '@/pages/QueueStatusPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'queue/enter', element: <QueueEnterPage /> },
      { path: 'queue/status', element: <QueueStatusPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'coupons', element: <CouponIssuePage /> },
    ],
  },
])
