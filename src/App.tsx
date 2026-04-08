import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
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
import { AuthProvider, useAuth } from '@/hooks/use-auth'

// RootGuard: Roteamento Auth-First estrito. Purga cache de usuários desconectados instantaneamente.
function RootGuard({ children }: { children: React.ReactNode }) {
  const { user: sbUser, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !sbUser) {
      let isMockUser = false
      try {
        const localUserStr = localStorage.getItem('currentUser')
        if (localUserStr) {
          const localUser = JSON.parse(localUserStr)
          isMockUser = Boolean(localUser?.id?.toString().startsWith('mock-'))
        }
      } catch (e) {
        console.warn(
          'RootGuard: Limpeza preventiva por erro de parse local.',
          e,
        )
      }

      // Limpeza segura se não houver mock e não houver usuário real logado
      if (!isMockUser) {
        localStorage.removeItem('currentUser')
        localStorage.removeItem('pocketbase_auth')
        localStorage.removeItem('auth_token')
        sessionStorage.clear()

        // Invalidação de Cache de Roteamento: Redirecionamento forçado
        if (
          location.pathname === '/' ||
          location.pathname.startsWith('/profile') ||
          location.pathname.startsWith('/admin') ||
          location.pathname.startsWith('/vendor') ||
          location.pathname.startsWith('/franchisee') ||
          location.pathname.startsWith('/vouchers')
        ) {
          if (location.pathname !== '/login') {
            navigate('/login', { replace: true })
          }
        }
      }
    }
  }, [loading, sbUser, location.pathname, navigate])

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

function RootHandler({
  activeRole,
  isAdailton,
}: {
  activeRole: string
  isAdailton: boolean
}) {
  if (isAdailton || activeRole === 'super_admin' || activeRole === 'admin')
    return <Navigate to="/admin" replace />
  if (activeRole === 'franchisee') return <Navigate to="/franchisee" replace />
  if (activeRole === 'shopkeeper') return <Navigate to="/vendor" replace />

  return <Index />
}

// AppRoutes reconstrói o roteador para que as rotas protegidas
// sequer existam na árvore caso não haja sessão válida.
function AppRoutes() {
  const { user: sbUser } = useAuth()

  let localUser = null
  try {
    const localUserStr = localStorage.getItem('currentUser')
    if (localUserStr) {
      localUser = JSON.parse(localUserStr)
    }
  } catch (e) {
    // ignore
  }

  const isMockUser = Boolean(localUser?.id?.toString().startsWith('mock-'))
  const isAuthenticated = !!sbUser || isMockUser

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

  const isAdmin =
    isAdailton || activeRole === 'super_admin' || activeRole === 'admin'
  const isShopkeeper = isAdmin || activeRole === 'shopkeeper'
  const isFranchisee = isAdmin || activeRole === 'franchisee'

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/seasonal" element={<Seasonal />} />
          {/* Fallback interceptando qualquer rota de perfil/admin vazada e jogando para o login estritamente */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <RootHandler activeRole={activeRole} isAdailton={isAdailton} />
          }
        />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/seasonal" element={<Seasonal />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/vouchers" element={<MyVouchers />} />
        <Route path="/voucher/:id" element={<Voucher />} />
        <Route path="/travel" element={<TravelPage />} />
        <Route path="/travel/new" element={<TravelPage />} />
        <Route path="/travel/:id" element={<TravelPage />} />

        {isShopkeeper && (
          <>
            <Route path="/vendor" element={<VendorDashboard />} />
            <Route path="/merchant" element={<MerchantLayout />}>
              <Route path="scanner" element={<MerchantScanner />} />
              <Route path="campaigns" element={<MerchantCampaigns />} />
              <Route path="leads" element={<MerchantLeads />} />
            </Route>
          </>
        )}

        {isAdmin && <Route path="/admin/*" element={<AdminDashboard />} />}

        {isFranchisee && (
          <Route path="/franchisee" element={<FranchiseeDashboard />} />
        )}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
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
                <AppRoutes />
              </RootGuard>
            </BrowserRouter>
            <Toaster />
          </CouponProvider>
        </NotificationProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}
