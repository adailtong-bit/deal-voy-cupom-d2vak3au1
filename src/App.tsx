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
import { AuthProvider, useAuth } from '@/hooks/use-auth'

function RequireAuth({
  children,
  roles,
}: {
  children: React.ReactNode
  roles?: UserRole[]
}) {
  const { user: storeUser } = useCouponStore()
  const { user: sbUser, loading } = useAuth()
  const location = useLocation()

  // Admin Session Stability: Prevent unmounting if a background crawl is active
  const isCrawling = sessionStorage.getItem('crawler_isScanning') === 'true'
  const isAdminPath = location.pathname.startsWith('/admin')

  // Always allow admin path if crawling to prevent interruptions
  if (isCrawling && isAdminPath) {
    return <>{children}</>
  }

  let localUser = null
  try {
    const localUserStr = localStorage.getItem('currentUser')
    if (localUserStr) localUser = JSON.parse(localUserStr)
  } catch (e) {
    // ignore
  }
  const isMockUser = localUser?.id?.toString().startsWith('mock-')

  if (loading && !isMockUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-slate-500">
        Carregando permissões de acesso...
      </div>
    )
  }

  // Unified auth state
  const activeUser =
    storeUser ||
    (sbUser
      ? {
          id: sbUser.id,
          role: (sbUser.user_metadata?.role || 'user') as UserRole,
          email: sbUser.email,
          country: 'Brasil',
        }
      : null) ||
    localUser

  if (!activeUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && roles.length > 0 && !roles.includes(activeUser.role as any)) {
    if (
      activeUser.role === 'super_admin' ||
      activeUser.role === ('admin' as any)
    )
      return <Navigate to="/admin" replace />
    if (activeUser.role === 'franchisee')
      return <Navigate to="/franchisee" replace />
    if (activeUser.role === 'shopkeeper')
      return <Navigate to="/vendor" replace />
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AuthStateSync() {
  const { user: storeUser } = useCouponStore()
  const { user: sbUser } = useAuth()

  useEffect(() => {
    let isMockUser = false
    try {
      const localUserStr = localStorage.getItem('currentUser')
      if (localUserStr) {
        const localUser = JSON.parse(localUserStr)
        isMockUser = localUser?.id?.toString().startsWith('mock-')
      }
    } catch (e) {
      // ignore
    }

    if (!storeUser && !sbUser && !isMockUser) {
      // Purge authentication tokens and role-related data upon logout
      localStorage.removeItem('auth_token')
      localStorage.removeItem('pocketbase_auth')
      localStorage.removeItem('user_role')
      localStorage.removeItem('currentUser')
      sessionStorage.clear()
    }
  }, [storeUser, sbUser])

  return null
}

function PageTitleSync() {
  const location = useLocation()
  const { t } = useLanguage()

  useEffect(() => {
    const path = location.pathname
    let title = 'Routevoy'

    if (path.startsWith('/admin'))
      title = `Routevoy - ${t('nav.admin', 'Admin')}`
    else if (path.startsWith('/vendor'))
      title = `Routevoy - ${t('nav.vendor', 'Painel do Lojista')}`
    else if (path.startsWith('/franchisee'))
      title = `Routevoy - ${t('nav.franchisee', 'Painel Regional')}`
    else if (path.startsWith('/explore'))
      title = `Routevoy - ${t('nav.explore', 'Explorar')}`
    else if (path.startsWith('/vouchers'))
      title = `Routevoy - ${t('nav.vouchers', 'Meus Vouchers')}`
    else if (path.startsWith('/travel'))
      title = `Routevoy - ${t('nav.travel', 'Experiências')}`
    else if (path.startsWith('/seasonal'))
      title = `Routevoy - ${t('nav.seasonal', 'Ofertas')}`
    else if (path.startsWith('/profile'))
      title = `Routevoy - ${t('profile.title', 'Perfil')}`
    else if (path.startsWith('/login'))
      title = `Routevoy - ${t('auth.login', 'Login')}`
    else if (path === '/') title = `Routevoy - ${t('nav.home', 'Home')}`

    document.title = title
  }, [location, t])

  return null
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
    <AuthProvider>
      <LanguageProvider>
        <NotificationProvider>
          <CouponProvider>
            <BrowserRouter>
              <AuthStateSync />
              <GlobalLanguageSync />
              <PageTitleSync />
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
                      <RequireAuth roles={['shopkeeper']}>
                        <VendorDashboard />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/merchant"
                    element={
                      <RequireAuth roles={['shopkeeper']}>
                        <MerchantLayout />
                      </RequireAuth>
                    }
                  >
                    <Route path="scanner" element={<MerchantScanner />} />
                    <Route path="campaigns" element={<MerchantCampaigns />} />
                    <Route path="leads" element={<MerchantLeads />} />
                  </Route>
                  <Route
                    path="/admin/*"
                    element={
                      <RequireAuth roles={['super_admin', 'admin'] as any}>
                        <AdminDashboard />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/franchisee"
                    element={
                      <RequireAuth roles={['franchisee']}>
                        <FranchiseeDashboard />
                      </RequireAuth>
                    }
                  />
                  <Route path="/profile" element={<Profile />} />
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
    </AuthProvider>
  )
}
