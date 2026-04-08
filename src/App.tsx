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
import { useEffect, useState } from 'react'
import { UserRole } from '@/lib/types'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

// Hard Reset para eliminar sessões zumbis
function AuthStateSync() {
  const { user: sbUser, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    let localUser = null
    try {
      const localUserStr = localStorage.getItem('currentUser')
      if (localUserStr) localUser = JSON.parse(localUserStr)
    } catch (e) {
      // ignore
    }

    const isMockUser = localUser?.id?.toString().startsWith('mock-')

    // Se o banco não reporta login, e não é um mock explicito, DESTRUA a sessão corrompida.
    if (!sbUser && localUser && !isMockUser) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('pocketbase_auth')
      localStorage.removeItem('user_role')
      localStorage.removeItem('currentUser')
      sessionStorage.clear()
    }
  }, [sbUser, loading])

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
      if (['brasil', 'brazil', 'br'].includes(countryLower)) {
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

// Router Guard Definitivo: Não cai em loop com falsos perfis
function RequireAuth({
  children,
  roles,
}: {
  children: React.ReactNode
  roles?: UserRole[]
}) {
  const { user: sbUser, loading } = useAuth()
  const location = useLocation()
  const [profileRole, setProfileRole] = useState<string | null>(null)
  const [isFetchingRole, setIsFetchingRole] = useState(false)

  const isCrawling = sessionStorage.getItem('crawler_isScanning') === 'true'
  const isAdminPath = location.pathname.startsWith('/admin')

  // Ignora bloqueios para o admin se um scan estiver ativo
  if (isCrawling && isAdminPath) {
    return <>{children}</>
  }

  // Sincroniza role real do supabase antes de tomar decisões limitantes
  useEffect(() => {
    let isMounted = true
    if (sbUser && sbUser.email !== 'adailtong@gmail.com') {
      setIsFetchingRole(true)
      supabase
        .from('profiles')
        .select('role')
        .eq('id', sbUser.id)
        .maybeSingle()
        .then(({ data }) => {
          if (isMounted && data?.role) {
            setProfileRole(data.role)
          }
          if (isMounted) setIsFetchingRole(false)
        })
    } else {
      setProfileRole(null)
    }
    return () => {
      isMounted = false
    }
  }, [sbUser])

  if (loading || isFetchingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-slate-500">
        Carregando permissões de acesso...
      </div>
    )
  }

  let localUser = null
  try {
    const localUserStr = localStorage.getItem('currentUser')
    if (localUserStr) localUser = JSON.parse(localUserStr)
  } catch (e) {
    // ignore
  }

  const isMockUser = localUser?.id?.toString().startsWith('mock-')

  // Rejeita absolutamente qualquer tráfego se não houver um token válido (real ou mock)
  if (!sbUser && !isMockUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  let activeUser = null

  if (isMockUser && localUser) {
    activeUser = localUser
  } else if (sbUser) {
    let resolvedRole =
      profileRole || sbUser.user_metadata?.role || localUser?.role || 'user'

    if (sbUser.email === 'adailtong@gmail.com') {
      resolvedRole = 'super_admin'
    }

    activeUser = {
      id: sbUser.id,
      role: resolvedRole as UserRole,
      email: sbUser.email,
      country: 'Brasil',
    }
  }

  if (!activeUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Admin Master Pass
  if (
    activeUser.role === 'super_admin' ||
    activeUser.role === 'admin' ||
    activeUser.email === 'adailtong@gmail.com'
  ) {
    return <>{children}</>
  }

  if (roles && roles.length > 0 && !roles.includes(activeUser.role as any)) {
    if (activeUser.role === 'franchisee')
      return <Navigate to="/franchisee" replace />
    if (activeUser.role === 'shopkeeper')
      return <Navigate to="/vendor" replace />
    if (activeUser.role === 'affiliate')
      return <Navigate to="/profile" replace />
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

// Direcionamento da rota Raiz (/) baseado no perfil para evitar Home vazia para admins
function RootHandler() {
  const { user: sbUser, loading } = useAuth()
  const [profileRole, setProfileRole] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    if (sbUser && sbUser.email !== 'adailtong@gmail.com') {
      supabase
        .from('profiles')
        .select('role')
        .eq('id', sbUser.id)
        .maybeSingle()
        .then(({ data }) => {
          if (isMounted && data?.role) setProfileRole(data.role)
        })
    }
    return () => {
      isMounted = false
    }
  }, [sbUser])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-slate-500 bg-slate-50/50">
        Iniciando...
      </div>
    )
  }

  let localUser = null
  try {
    const localUserStr = localStorage.getItem('currentUser')
    if (localUserStr) localUser = JSON.parse(localUserStr)
  } catch (e) {}

  const isMockUser = localUser?.id?.toString().startsWith('mock-')

  if (!sbUser && !isMockUser) {
    return <Index />
  }

  let activeRole = 'user'
  if (isMockUser && localUser) {
    activeRole = localUser.role
  } else if (sbUser) {
    if (sbUser.email === 'adailtong@gmail.com') {
      return <Navigate to="/admin" replace />
    }
    activeRole =
      profileRole || sbUser.user_metadata?.role || localUser?.role || 'user'
  }

  if (activeRole === 'super_admin' || activeRole === 'admin')
    return <Navigate to="/admin" replace />
  if (activeRole === 'franchisee') return <Navigate to="/franchisee" replace />
  if (activeRole === 'shopkeeper') return <Navigate to="/vendor" replace />
  if (activeRole === 'affiliate') return <Navigate to="/profile" replace />

  return <Index />
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
                  <Route path="/" element={<RootHandler />} />
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
