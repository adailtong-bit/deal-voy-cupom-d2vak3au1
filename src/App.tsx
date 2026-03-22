import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from '@/stores/LanguageContext'
import { NotificationProvider } from '@/stores/NotificationContext'
import { CouponProvider } from '@/stores/CouponContext'
import { Toaster } from 'sonner'
import Layout from '@/components/Layout'
import VendorDashboard from '@/pages/VendorDashboard'
import AdminDashboard from '@/pages/AdminDashboard'
import Seasonal from '@/pages/Seasonal'

export default function App() {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <CouponProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<VendorDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/seasonal" element={<Seasonal />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster />
        </CouponProvider>
      </NotificationProvider>
    </LanguageProvider>
  )
}
