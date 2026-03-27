import { useState } from 'react'
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

export default function Login() {
  const [email, setEmail] = useState('')
  const { login } = useCouponStore()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  const fromObj = location.state?.from
  const from = fromObj
    ? `${fromObj.pathname}${fromObj.search}${fromObj.hash}`
    : '/'

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      login(email)
      navigate(from, { replace: true })
    }
  }

  const handleQuickLogin = (
    quickEmail: string,
    role: any,
    targetPath: string,
  ) => {
    login(quickEmail, role)
    navigate(from !== '/' ? from : targetPath, { replace: true })
  }

  return (
    <div className="container max-w-md py-16 animate-fade-in-up mb-16 md:mb-0">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {t('auth.login', 'Sign In')}
          </CardTitle>
          <CardDescription>
            {t('auth.login_desc', 'Access your account to continue.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email', 'Email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@dealvoy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {t('auth.login', 'Sign In')}
            </Button>
          </form>
          <div className="mt-6 flex flex-col gap-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-medium">
                  {t('auth.demo_access', 'Quick Access (Demo)')}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                handleQuickLogin('admin@dealvoy.com', 'super_admin', '/admin')
              }
            >
              {t('auth.quick_admin', 'Login as Admin')}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                handleQuickLogin('shop@dealvoy.com', 'shopkeeper', '/vendor')
              }
            >
              {t('auth.quick_vendor', 'Login as Vendor')}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                handleQuickLogin('ny@dealvoy.com', 'franchisee', '/franchisee')
              }
              className="border-primary/20 text-primary hover:bg-primary/5"
            >
              {t('auth.quick_ny', 'Login as NY Franchisee')}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickLogin('user@dealvoy.com', 'user', '/')}
            >
              {t('auth.quick_user', 'Login as User')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
