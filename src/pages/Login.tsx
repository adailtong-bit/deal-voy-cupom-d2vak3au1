import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
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
import { UserPlus, LogIn, Mail, Lock, User } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [activeTab, setActiveTab] = useState('login')
  const [isLoading, setIsLoading] = useState(false)

  const { login, register, user } = useCouponStore()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  const fromObj = location.state?.from
  const from = fromObj
    ? `${fromObj.pathname}${fromObj.search}${fromObj.hash}`
    : '/'

  useEffect(() => {
    if (user) {
      if (user.role === 'super_admin') {
        navigate('/admin', { replace: true })
      } else if (user.role === 'franchisee') {
        navigate('/franchisee', { replace: true })
      } else if (user.role === 'shopkeeper') {
        navigate('/vendor', { replace: true })
      } else {
        navigate(from !== '/' ? from : '/', { replace: true })
      }
    }
  }, [user, navigate, from])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      setIsLoading(true)
      await login(email, password)
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert(t('auth.passwords_mismatch', 'Senhas não conferem'))
      return
    }
    if (email && password && name) {
      setIsLoading(true)
      await register(name, email, password)
      setIsLoading(false)
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
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                      required
                    />
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
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-slate-700">
                    {t('auth.password', 'Senha')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                      required
                    />
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
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                      required
                    />
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
    </div>
  )
}
