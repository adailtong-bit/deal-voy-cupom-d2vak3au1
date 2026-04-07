import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { useAuth } from '@/hooks/use-auth'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  UserPlus,
  LogIn,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldAlert,
  Store,
  Map,
  Users,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [activeTab, setActiveTab] = useState('login')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false)
  const [role, setRole] = useState('user')

  const { login, register, user: storeUser } = useCouponStore()
  const { user: sbUser } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  const activeUser =
    storeUser ||
    (sbUser ? { role: sbUser.user_metadata?.role || 'user' } : null)

  const fromObj = location.state?.from
  const from = fromObj
    ? `${fromObj.pathname}${fromObj.search}${fromObj.hash}`
    : '/'

  useEffect(() => {
    if (activeUser) {
      if (activeUser.role === 'super_admin' || activeUser.role === 'admin') {
        navigate('/admin', { replace: true })
      } else if (activeUser.role === 'franchisee') {
        navigate('/franchisee', { replace: true })
      } else if (activeUser.role === 'shopkeeper') {
        navigate('/vendor', { replace: true })
      } else {
        navigate(from !== '/' ? from : '/profile', { replace: true })
      }
    }
  }, [activeUser, navigate, from])

  const handleFakeLogin = async (roleType: string, fakeEmail: string) => {
    setIsLoading(true)

    // Bypass Interceptor block
    const mockUser = {
      id: 'mock-' + roleType + '-' + Date.now().toString().slice(-6),
      email: fakeEmail,
      name: fakeEmail.split('@')[0],
      role: roleType,
      country: 'Brasil',
    }
    const fakeToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im1vY2staWQiLCJleHAiOjk5OTk5OTk5OTl9.signature'

    localStorage.setItem(
      'pocketbase_auth',
      JSON.stringify({ token: fakeToken, model: mockUser }),
    )
    localStorage.setItem('auth_token', fakeToken)
    localStorage.setItem('currentUser', JSON.stringify(mockUser))

    try {
      await login(fakeEmail, 'bypass')
    } catch (e) {
      // ignore
    }

    toast.success(
      t('auth.login_success', 'Login fictício realizado com sucesso!'),
    )

    if (roleType === 'super_admin' || roleType === 'admin') {
      window.location.href = '/admin'
    } else if (roleType === 'franchisee') {
      window.location.href = '/franchisee'
    } else if (roleType === 'shopkeeper') {
      window.location.href = '/vendor'
    } else {
      window.location.href = '/profile'
    }

    setIsLoading(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      setIsLoading(true)

      const { error: sbError, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (sbError) {
        toast.error(t('auth.login_error', 'Email ou senha inválidos.'))
        setIsLoading(false)
        return
      }

      try {
        await login(email, password)
      } catch (err: any) {
        console.warn('Pocketbase fallback log:', err)
        if (data?.user) {
          const userRole = data.user.user_metadata?.role || 'user'
          const mockUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || email.split('@')[0],
            role: userRole,
            country: 'Brasil',
          }
          localStorage.setItem('currentUser', JSON.stringify(mockUser))
        }
      }

      toast.success(t('auth.login_success', 'Bem-vindo de volta!'))
      // Page reload to apply auth context sync naturally
      window.location.href =
        data?.user?.user_metadata?.role === 'admin' ? '/admin' : '/profile'
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error(t('auth.passwords_mismatch', 'As senhas não coincidem.'))
      return
    }

    if (email && password && name) {
      setIsLoading(true)
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email,
            password,
            options: {
              data: {
                name,
                role: role === 'affiliate' ? 'affiliate' : 'user',
              },
            },
          },
        )

        if (authError) {
          throw new Error(authError.message)
        }

        // Wait briefly for DB trigger to auto-confirm email and create profile/affiliate partner
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Force sign in immediately
        await supabase.auth.signInWithPassword({ email, password })

        try {
          await register(name, email, password)
        } catch (err: any) {
          console.warn('Pocketbase register fallback:', err)
        }

        try {
          await login(email, password)
        } catch (loginErr) {
          console.warn('Pocketbase login fallback:', loginErr)
          if (authData?.user) {
            const mockUser = {
              id: authData.user.id,
              email: email,
              name: name,
              role: role === 'affiliate' ? 'affiliate' : 'user',
              country: 'Brasil',
            }
            localStorage.setItem('currentUser', JSON.stringify(mockUser))
          }
        }

        toast.success(t('auth.register_success', 'Conta criada com sucesso!'))
        window.location.href = role === 'affiliate' ? '/profile' : '/'
      } catch (err: any) {
        toast.error(err.message || 'Erro ao criar conta')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="container max-w-md py-16 animate-fade-in-up mb-16 md:mb-0">
      <Card className="border-0 shadow-xl shadow-primary/5">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
            Routevoy
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {t('auth.welcome', 'Bem-vindo! Acesse sua conta ou cadastre-se.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 h-12 p-1 bg-slate-100/80">
              <TabsTrigger
                value="login"
                className="rounded-md font-semibold text-sm transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {t('auth.login_tab', 'Entrar')}
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-md font-semibold text-sm transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {t('auth.register_tab', 'Cadastrar')}
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="login"
              className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
            >
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">
                    {t('auth.email', 'Email')}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-700">
                      {t('auth.password', 'Senha')}
                    </Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 font-bold text-base mt-2"
                  disabled={isLoading}
                >
                  {isLoading
                    ? t('common.loading', 'Carregando...')
                    : t('auth.login', 'Entrar na Plataforma')}
                </Button>
              </form>
            </TabsContent>

            <TabsContent
              value="register"
              className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
            >
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name" className="text-slate-700">
                    {t('auth.name', 'Nome Completo')}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-slate-700">
                    {t('auth.email', 'Email')}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3 pt-4 pb-2">
                  <Checkbox
                    id="is-affiliate"
                    checked={role === 'affiliate'}
                    onCheckedChange={(checked) =>
                      setRole(checked ? 'affiliate' : 'user')
                    }
                    className="h-5 w-5"
                  />
                  <Label
                    htmlFor="is-affiliate"
                    className="text-slate-700 font-medium cursor-pointer text-base"
                  >
                    Desejo me cadastrar como Afiliado Parceiro
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-slate-700">
                    {t('auth.password', 'Senha')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="reg-password"
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
                    >
                      {showRegPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="reg-confirm-password"
                    className="text-slate-700"
                  >
                    {t('auth.confirm_password', 'Confirmar Senha')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="reg-confirm-password"
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-9 pr-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowRegConfirmPassword(!showRegConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
                    >
                      {showRegConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 font-bold text-base mt-2"
                  disabled={isLoading}
                >
                  {isLoading
                    ? t('common.loading', 'Carregando...')
                    : t('auth.create_account', 'Criar Conta')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div
        className="mt-8 animate-fade-in-up"
        style={{ animationDelay: '0.1s' }}
      >
        <Card className="border border-dashed border-slate-300 bg-slate-50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center text-slate-700">
              <ShieldAlert className="w-5 h-5 mr-2 text-amber-500" />
              Painel de Logins Fictícios
            </CardTitle>
            <CardDescription className="text-sm">
              Acesso rápido para testes. Ignora a validação de senha.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 bg-white hover:bg-slate-100 hover:text-red-600 transition-colors shadow-sm"
              onClick={() => handleFakeLogin('admin', 'admin@dealvoy.com')}
              disabled={isLoading}
            >
              <ShieldAlert className="w-4 h-4 mr-3 text-red-500 shrink-0" />
              <div className="text-left">
                <div className="font-semibold text-sm">Acesso Admin</div>
                <div className="text-xs text-slate-500">
                  Privilégios administrativos
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 bg-white hover:bg-slate-100 hover:text-green-600 transition-colors shadow-sm"
              onClick={() =>
                handleFakeLogin('shopkeeper', 'vendor@dealvoy.com')
              }
              disabled={isLoading}
            >
              <Store className="w-4 h-4 mr-3 text-green-500 shrink-0" />
              <div className="text-left">
                <div className="font-semibold text-sm">Acesso Lojista</div>
                <div className="text-xs text-slate-500">
                  Dono de loja/comerciante
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 bg-white hover:bg-slate-100 hover:text-blue-600 transition-colors shadow-sm"
              onClick={() => handleFakeLogin('user', 'cliente@dealvoy.com')}
              disabled={isLoading}
            >
              <User className="w-4 h-4 mr-3 text-blue-500 shrink-0" />
              <div className="text-left">
                <div className="font-semibold text-sm">Acesso Cliente</div>
                <div className="text-xs text-slate-500">Cliente padrão</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 bg-white hover:bg-slate-100 hover:text-purple-600 transition-colors shadow-sm"
              onClick={() => handleFakeLogin('user', 'testuser@dealvoy.com')}
              disabled={isLoading}
            >
              <Map className="w-4 h-4 mr-3 text-purple-500 shrink-0" />
              <div className="text-left">
                <div className="font-semibold text-sm">Usuário de Teste</div>
                <div className="text-xs text-slate-500">Conta genérica</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 bg-white hover:bg-slate-100 hover:text-orange-600 transition-colors shadow-sm md:col-span-2"
              onClick={() =>
                handleFakeLogin('affiliate', 'afiliado@dealvoy.com')
              }
              disabled={isLoading}
            >
              <Users className="w-4 h-4 mr-3 text-orange-500 shrink-0" />
              <div className="text-left">
                <div className="font-semibold text-sm">Acesso Afiliado</div>
                <div className="text-xs text-slate-500">
                  Parceiro de Ofertas (Acesso à API)
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
