import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'
import { LanguageProvider, useLanguage } from '@/stores/LanguageContext'
import { NotificationProvider } from '@/stores/NotificationContext'
import { CouponProvider, useCouponStore } from '@/stores/CouponContext'
import { Toaster } from 'sonner'
import Layout from '@/components/Layout'
import MerchantLayout from '@/components/MerchantLayout'
import Index from '@/pages/Index'
import VendorDashboard from '@/pages/VendorDashboard'
import AdminDashboard from '@/pages/AdminDashboard'
import FranchiseeDashboard from '@/pages/FranchiseeDashboard'
import Seasonal from '@/pages/Seasonal'
import Voucher from '@/pages/Voucher'
import MyVouchers from '@/pages/MyVouchers'
import MerchantScanner from '@/pages/MerchantScanner'
import MerchantCampaigns from '@/pages/MerchantCampaigns'
import MerchantLeads from '@/pages/MerchantLeads'
import TravelPage from '@/pages/TravelPage'
import Explore from '@/pages/Explore'
import Profile from '@/pages/Profile'
import Login from '@/pages/Login'
import { useEffect } from 'react'
import { UserRole } from '@/lib/types'

function RequireAuth({
  children,
  roles,
}: {
  children: React.ReactNode
  roles?: UserRole[]
}) {
  const { user } = useCouponStore()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    if (user.role === 'super_admin') return <Navigate to="/admin" replace />
    if (user.role === 'franchisee') return <Navigate to="/franchisee" replace />
    if (user.role === 'shopkeeper') return <Navigate to="/vendor" replace />
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function GlobalLanguageSync() {
  const { user, franchises } = useCouponStore()
  const { setLanguage } = useLanguage()

  useEffect(() => {
    let countryToUse = user?.country

    if (user?.role === 'franchisee') {
      const myFranchise = franchises.find((f) => f.ownerId === user.id)
      if (myFranchise?.addressCountry) {
        countryToUse = myFranchise.addressCountry
      }
    }

    if (countryToUse) {
      const countryLower = countryToUse.toLowerCase()
      if (
        countryLower === 'brasil' ||
        countryLower === 'brazil' ||
        countryLower === 'br'
      ) {
        setLanguage('pt')
      } else if (
        [
          'spain',
          'espanha',
          'es',
          'mexico',
          'argentina',
          'colombia',
          'chile',
          'peru',
        ].includes(countryLower)
      ) {
        setLanguage('es')
      } else if (['france', 'fr', 'frança'].includes(countryLower)) {
        setLanguage('fr')
      } else {
        setLanguage('en')
      }
    }
  }, [user?.country, user?.role, user?.id, franchises, setLanguage])

  return null
}

export default function App() {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <CouponProvider>
          <BrowserRouter>
            <GlobalLanguageSync />
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
                    <RequireAuth roles={['shopkeeper', 'super_admin']}>
                      <VendorDashboard />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/merchant"
                  element={
                    <RequireAuth roles={['shopkeeper', 'super_admin']}>
                      <MerchantLayout />
                    </RequireAuth>
                  }
                >
                  <Route path="scanner" element={<MerchantScanner />} />
                  <Route path="campaigns" element={<MerchantCampaigns />} />
                  <Route path="leads" element={<MerchantLeads />} />
                </Route>
                <Route
                  path="/admin"
                  element={
                    <RequireAuth roles={['super_admin']}>
                      <AdminDashboard />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/franchisee"
                  element={
                    <RequireAuth roles={['franchisee', 'super_admin']}>
                      <FranchiseeDashboard />
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
                <Route
                  path="/travel"
                  element={
                    <RequireAuth>
                      <TravelPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/travel/new"
                  element={
                    <RequireAuth>
                      <TravelPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/travel/:id"
                  element={
                    <RequireAuth>
                      <TravelPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/voucher/:id"
                  element={
                    <RequireAuth>
                      <Voucher />
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
