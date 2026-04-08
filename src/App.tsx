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
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

function RequireAuth({
  children,
  roles,
}: {
  children: React.ReactNode
  roles?: UserRole[]
}) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [profileRole, setProfileRole] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function checkRole() {
      if (!user) {
        if (isMounted) setIsVerifying(false)
        return
      }

      try {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (isMounted) {
          setProfileRole(data?.role || user.user_metadata?.role || 'user')
          setIsVerifying(false)
        }
      } catch (err) {
        if (isMounted) {
          setProfileRole(user.user_metadata?.role || 'user')
          setIsVerifying(false)
        }
      }
    }

    if (!loading) {
      checkRole()
    }

    return () => {
      isMounted = false
    }
  }, [user, loading])

  // Admin Session Stability: Prevent unmounting se houver processamento em background
  const isCrawling = sessionStorage.getItem('crawler_isScanning') === 'true'
  const isAdminPath = location.pathname.startsWith('/admin')

  if (isCrawling && isAdminPath) {
    return <>{children}</>
  }

  if (loading || isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-primary/40 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">
          Validando permissões de acesso...
        </p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const role = (profileRole || 'user') as UserRole
  const email = user.email

  // 🔥 MASTER ACESSO: Se for super_admin, admin ou o email master, tem acesso liberado
  if (
    role === 'super_admin' ||
    role === 'admin' ||
    email === 'adailtong@gmail.com'
  ) {
    return <>{children}</>
  }

  // Roteamento condicional para roles específicos se tentarem acessar locais indevidos
  if (roles && roles.length > 0 && !roles.includes(role)) {
    if (role === 'franchisee') return <Navigate to="/franchisee" replace />
    if (role === 'shopkeeper')
      return <Navigate to="/merchant/scanner" replace />
    if (role === 'affiliate') return <Navigate to="/profile" replace />
    return <Navigate to="/" replace />
  }

  return <>{children}</>
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
  const { user: storeUser, franchises } = useCouponStore()
  const { user: sbUser } = useAuth()
  const { setLanguage } = useLanguage()

  useEffect(() => {
    const role = sbUser?.user_metadata?.role || storeUser?.role
    let countryToUse = storeUser?.country || 'Brasil'

    if (role === 'franchisee') {
      const myFranchise = franchises.find((f) => f.ownerId === sbUser?.id)
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
  }, [storeUser?.country, sbUser, franchises, setLanguage])

  return null
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <NotificationProvider>
          <CouponProvider>
            <BrowserRouter>
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
                    element={<Navigate to="/merchant/scanner" replace />}
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
    </AuthProvider>
  )
}
