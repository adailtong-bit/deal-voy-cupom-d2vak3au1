import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'
import { LanguageProvider } from '@/stores/LanguageContext'
import { NotificationProvider } from '@/stores/NotificationContext'
import { CouponProvider, useCouponStore } from '@/stores/CouponContext'
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
import Explore from '@/pages/Explore'
import Profile from '@/pages/Profile'
import Login from '@/pages/Login'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useCouponStore()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <CouponProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/explore" element={<Explore />} />
                <Route
                  path="/vouchers"
                  element={
                    <RequireAuth>
                      <MyVouchers />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/vendor"
                  element={
                    <RequireAuth>
                      <VendorDashboard />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <RequireAuth>
                      <AdminDashboard />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <RequireAuth>
                      <Profile />
                    </RequireAuth>
                  }
                />
                <Route path="/seasonal" element={<Seasonal />} />
                <Route path="/travel" element={<TravelPage />} />
                <Route path="/travel/new" element={<TravelPage />} />
                <Route path="/travel/:id" element={<TravelPage />} />
                <Route path="/voucher/:id" element={<Voucher />} />
                <Route
                  path="/merchant/scanner"
                  element={
                    <RequireAuth>
                      <MerchantScanner />
                    </RequireAuth>
                  }
                />
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
