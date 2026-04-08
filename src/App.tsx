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

// RootGuard: Roteamento Auth-First estrito. Purga cache de usuários desconectados instantaneamente.
function RootGuard({ children }: { children: React.ReactNode }) {
  const { user: sbUser, loading } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (!loading && !sbUser) {
      let localUser = null
      try {
        const localUserStr = localStorage.getItem('currentUser')
        if (localUserStr) {
          localUser = JSON.parse(localUserStr)
        }
      } catch (e) {
        console.warn(
          'RootGuard: Limpeza preventiva por erro de parse local.',
          e,
        )
      }

      const isMockUser = Boolean(localUser?.id?.toString().startsWith('mock-'))

      // Hard clear se não houver mock e não houver usuário real logado
      if (!isMockUser) {
        localStorage.clear()
        sessionStorage.clear()
      }
    }
  }, [loading, sbUser, location.pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50/50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-slate-500 font-medium">Validando sessão segura...</p>
      </div>
    )
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

// Router Guard Refatorado: Redirecionamento brutal preventivo (Auth-First)
function RequireAuth({
  children,
  roles,
}: {
  children: React.ReactNode
  roles?: UserRole[]
}) {
  const { user: sbUser } = useAuth()
  const location = useLocation()

  let localUser = null
  try {
    const localUserStr = localStorage.getItem('currentUser')
    if (localUserStr) {
      localUser = JSON.parse(localUserStr)
    }
  } catch (e) {
    console.warn('RequireAuth: Falha ao validar estado do usuário.', e)
  }

  const isMockUser = Boolean(localUser?.id?.toString().startsWith('mock-'))

  // Redirecionamento brutal se não houver usuário autêntico ou mock validado
  if (!sbUser && !isMockUser) {
    // Purga imediata para neutralizar estados zumbis
    localStorage.clear()
    sessionStorage.clear()
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  let activeRole = 'user'
  let isAdailton = false

  if (isMockUser && localUser) {
    activeRole = localUser.role
    isAdailton = localUser.email === 'adailtong@gmail.com'
  } else if (sbUser) {
    isAdailton = sbUser.email === 'adailtong@gmail.com'
    if (isAdailton) {
      activeRole = 'super_admin'
    } else {
      activeRole = localUser?.role || sbUser.user_metadata?.role || 'user'
    }
  }

  // Master Bypass Total - Adailton e super admins passam direto
  if (isAdailton || activeRole === 'super_admin' || activeRole === 'admin') {
    return <>{children}</>
  }

  // Controle de acesso baseado em roles
  if (roles && roles.length > 0 && !roles.includes(activeRole as any)) {
    if (activeRole === 'franchisee')
      return <Navigate to="/franchisee" replace />
    if (activeRole === 'shopkeeper') return <Navigate to="/vendor" replace />
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

// Direcionamento da rota Raiz (/) baseado no perfil para evitar rotas vazias
function RootHandler() {
  const { user: sbUser } = useAuth()

  let localUser = null
  try {
    const localUserStr = localStorage.getItem('currentUser')
    if (localUserStr) {
      localUser = JSON.parse(localUserStr)
    }
  } catch (e) {
    console.warn('RootHandler: Falha de parse local.', e)
  }

  const isMockUser = Boolean(localUser?.id?.toString().startsWith('mock-'))

  if (!sbUser && !isMockUser) {
    return <Index />
  }

  let activeRole = 'user'
  let isAdailton = false

  if (isMockUser && localUser) {
    activeRole = localUser.role
    isAdailton = localUser.email === 'adailtong@gmail.com'
  } else if (sbUser) {
    isAdailton = sbUser.email === 'adailtong@gmail.com'
    if (isAdailton) {
      activeRole = 'super_admin'
    } else {
      activeRole = localUser?.role || sbUser.user_metadata?.role || 'user'
    }
  }

  if (isAdailton || activeRole === 'super_admin' || activeRole === 'admin')
    return <Navigate to="/admin" replace />
  if (activeRole === 'franchisee') return <Navigate to="/franchisee" replace />
  if (activeRole === 'shopkeeper') return <Navigate to="/vendor" replace />

  return <Index />
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <NotificationProvider>
          <CouponProvider>
            <BrowserRouter>
              <RootGuard>
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
              </RootGuard>
            </BrowserRouter>
            <Toaster />
          </CouponProvider>
        </NotificationProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}
