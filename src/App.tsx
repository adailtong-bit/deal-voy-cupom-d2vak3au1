import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider } from '@/stores/LanguageContext'
import { NotificationProvider } from '@/stores/NotificationContext'
import { CouponProvider } from '@/stores/CouponContext'
import { Toaster } from 'sonner'
import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import VendorDashboard from '@/pages/VendorDashboard'
import AdminDashboard from '@/pages/AdminDashboard'
import Seasonal from '@/pages/Seasonal'
import Voucher from '@/pages/Voucher'
import MyVouchers from '@/pages/MyVouchers'
import MerchantScanner from '@/pages/MerchantScanner'
import TravelPage from '@/pages/TravelPage'

export default function App() {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <CouponProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/vouchers" element={<MyVouchers />} />
                <Route path="/vendor" element={<VendorDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/seasonal" element={<Seasonal />} />
                <Route path="/travel" element={<TravelPage />} />
                <Route path="/travel/new" element={<TravelPage />} />
                <Route path="/travel/:id" element={<TravelPage />} />
                <Route path="/voucher/:id" element={<Voucher />} />
                <Route path="/merchant/scanner" element={<MerchantScanner />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster />
        </CouponProvider>
      </NotificationProvider>
    </LanguageProvider>
  )
}
