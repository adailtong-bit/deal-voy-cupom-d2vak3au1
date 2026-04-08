import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '@/stores/LanguageContext'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
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
  Users,
  LogOut,
  ArrowRight,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

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

  const {
    user: sbUser,
    loading: authLoading,
    signIn,
    signUp,
    signOut,
  } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  const fromObj = location.state?.from
  const from = fromObj
    ? `${fromObj.pathname}${fromObj.search}${fromObj.hash}`
    : '/'

  const performRedirect = (userRole: string) => {
    if (userRole === 'super_admin' || userRole === 'admin') {
      navigate('/admin', { replace: true })
    } else if (userRole === 'franchisee') {
      navigate('/franchisee', { replace: true })
    } else if (userRole === 'shopkeeper') {
      navigate('/merchant/scanner', { replace: true })
    } else if (userRole === 'affiliate') {
      navigate('/profile', { replace: true })
    } else {
      navigate(from !== '/' && !from.includes('/login') ? from : '/profile', {
        replace: true,
      })
    }
  }

  const handleFakeLogin = async (roleType: string, fakeEmail: string) => {
    setIsLoading(true)

    const { error, data } = await signIn(fakeEmail, 'Skip@Pass')

    if (error) {
      toast.error(
        `Erro ao acessar conta de teste. A migration foi executada? Detalhe: ${error.message}`,
      )
      setIsLoading(false)
      return
    }

    toast.success(
      t('auth.login_success', 'Autenticação concluída com sucesso!'),
    )

    if (data?.user) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        const userRole =
          profile?.role || data.user.user_metadata?.role || 'user'
        performRedirect(userRole)
      } catch (err) {
        const userRole = data.user.user_metadata?.role || 'user'
        performRedirect(userRole)
      }
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      setIsLoading(true)

      const { error, data } = await signIn(email, password)

      if (error) {
        toast.error(t('auth.login_error', 'Email ou senha inválidos.'))
        setIsLoading(false)
        return
      }

      toast.success(t('auth.login_success', 'Bem-vindo de volta!'))
      if (data?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single()

          const userRole =
            profile?.role || data.user.user_metadata?.role || 'user'
          performRedirect(userRole)
        } catch (err) {
          const userRole = data.user.user_metadata?.role || 'user'
          performRedirect(userRole)
        }
      }
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
      const finalRole = role === 'affiliate' ? 'affiliate' : 'user'

      const { error, data } = await signUp(email, password, {
        data: {
          name,
          role: finalRole,
        },
      })

      if (error) {
        toast.error(error.message || 'Erro ao criar conta')
        setIsLoading(false)
        return
      }

      toast.success(t('auth.register_success', 'Conta criada com sucesso!'))
      if (data?.user) {
        performRedirect(finalRole)
      }
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)
    await signOut()
    setIsLoading(false)
    toast.success('Desconectado com sucesso.')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-primary/40 border-t-primary rounded-full animate-spin mb-4"></div>
      </div>
    )
  }

  // Previne o "loop de rota" ao não auto-redirecionar cegamente.
  // Em vez disso, se o usuário estiver logado, exibe uma interface clara para prosseguir ou deslogar.
  if (sbUser) {
    const uRole = sbUser.user_metadata?.role || 'user'
    return (
      <div className="container max-w-md py-16 animate-fade-in-up">
        <Card className="border-0 shadow-xl shadow-primary/5 text-center">
          <CardHeader>
            <div className="mx-auto bg-green-100 p-3 rounded-full mb-4 w-16 h-16 flex items-center justify-center">
              <User className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Você já está logado
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Conectado como{' '}
              <strong className="text-slate-800">{sbUser.email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Button
              className="w-full h-12 text-base font-bold"
              onClick={() => performRedirect(uRole)}
            >
              Ir para o meu Painel <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 text-base text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
              disabled={isLoading}
            >
              <LogOut className="mr-2 w-5 h-5" /> Sair desta conta
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
              Acessos de Teste (Validação QA)
            </CardTitle>
            <CardDescription className="text-sm">
              Use estes acessos rápidos gerados via banco de dados para avaliar
              toda a plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 bg-white hover:bg-slate-100 hover:text-red-600 transition-colors shadow-sm"
              onClick={() =>
                handleFakeLogin('super_admin', 'adailtong@gmail.com')
              }
              disabled={isLoading}
            >
              <ShieldAlert className="w-4 h-4 mr-3 text-red-500 shrink-0" />
              <div className="text-left">
                <div className="font-semibold text-sm">
                  Acesso Master (Admin)
                </div>
                <div className="text-xs text-slate-500">
                  adailtong@gmail.com
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
                <div className="text-xs text-slate-500">vendor@dealvoy.com</div>
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
                <div className="font-semibold text-sm">
                  Acesso Cliente Padrão
                </div>
                <div className="text-xs text-slate-500">
                  cliente@dealvoy.com
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 bg-white hover:bg-slate-100 hover:text-orange-600 transition-colors shadow-sm"
              onClick={() =>
                handleFakeLogin('affiliate', 'afiliado@dealvoy.com')
              }
              disabled={isLoading}
            >
              <Users className="w-4 h-4 mr-3 text-orange-500 shrink-0" />
              <div className="text-left">
                <div className="font-semibold text-sm">Acesso Afiliado</div>
                <div className="text-xs text-slate-500">
                  afiliado@dealvoy.com
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
