import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Apple, Mail } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default function Login() {
  const { login } = useCouponStore()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      login(email, 'user')
      navigate('/profile') // Redirect to profile which will handle onboarding
      setIsLoading(false)
    }, 1000)
  }

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    setIsLoading(true)
    setTimeout(() => {
      login(`${provider}@user.com`, 'user')
      navigate('/profile')
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-900">
            {t('auth.login')}
          </CardTitle>
          <p className="text-muted-foreground">Deal Voy</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 gap-3 relative hover:bg-slate-50 font-semibold"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
            >
              <img
                src="https://img.usecurling.com/i?q=google&shape=fill"
                className="w-5 h-5"
                alt="Google"
              />
              {t('auth.google')}
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 gap-3 hover:bg-slate-50 font-semibold"
              onClick={() => handleSocialLogin('apple')}
              disabled={isLoading}
            >
              <Apple className="w-5 h-5" />
              {t('auth.apple')}
            </Button>
          </div>

          <div className="flex items-center gap-4 py-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground uppercase">Or</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="hello@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <Button
              className="w-full h-12 font-bold bg-primary hover:bg-primary/90"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? '...' : t('auth.login')}
            </Button>
          </form>

          <div className="text-center text-sm">
            <Button variant="link" className="text-muted-foreground">
              {t('auth.no_account')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
