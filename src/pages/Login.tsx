import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Lock, Apple, User, Briefcase, Building, Shield } from 'lucide-react'
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
      let role = 'user'
      if (email.includes('admin')) role = 'super_admin'
      else if (email.includes('franquia')) role = 'franchisee'
      else if (email.includes('agency')) role = 'agency'
      else if (email.includes('shop')) role = 'shopkeeper'

      // @ts-expect-error - role type casting
      login(email, role)

      // Redirect based on role inferred from email for demo or just go profile
      if (email.includes('admin') || email.includes('franquia'))
        navigate('/admin')
      else if (email.includes('shop')) navigate('/vendor')
      else if (email.includes('agency')) navigate('/agency')
      else navigate('/profile')
      setIsLoading(false)
    }, 1000)
  }

  const fillCredentials = (email: string) => {
    setEmail(email)
    setPassword('123456')
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
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion
            type="single"
            collapsible
            className="w-full border rounded-lg bg-blue-50/50"
          >
            <AccordionItem value="test-users" className="border-none px-4">
              <AccordionTrigger className="hover:no-underline py-3 text-sm font-semibold text-blue-700">
                Click to view Test Credentials
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pb-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto py-2 text-xs"
                    onClick={() => fillCredentials('admin@dealvoy.com')}
                  >
                    <Shield className="mr-2 h-4 w-4 text-purple-600" />
                    <div className="text-left">
                      <span className="font-bold block">App Owner</span>
                      admin@dealvoy.com
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto py-2 text-xs"
                    onClick={() => fillCredentials('franquia.sp@dealvoy.com')}
                  >
                    <Building className="mr-2 h-4 w-4 text-blue-600" />
                    <div className="text-left">
                      <span className="font-bold block">Franchise (BR)</span>
                      franquia.sp@dealvoy.com
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto py-2 text-xs"
                    onClick={() => fillCredentials('agency.travel@dealvoy.com')}
                  >
                    <Briefcase className="mr-2 h-4 w-4 text-orange-600" />
                    <div className="text-left">
                      <span className="font-bold block">Agency</span>
                      agency.travel@dealvoy.com
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto py-2 text-xs"
                    onClick={() => fillCredentials('shop.retail@dealvoy.com')}
                  >
                    <Briefcase className="mr-2 h-4 w-4 text-green-600" />
                    <div className="text-left">
                      <span className="font-bold block">Merchant</span>
                      shop.retail@dealvoy.com
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto py-2 text-xs"
                    onClick={() => fillCredentials('user.test@dealvoy.com')}
                  >
                    <User className="mr-2 h-4 w-4 text-slate-600" />
                    <div className="text-left">
                      <span className="font-bold block">End User</span>
                      user.test@dealvoy.com
                    </div>
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <form onSubmit={handleLogin} className="space-y-4 pt-2">
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
              {isLoading ? t('common.loading') : t('auth.login')}
            </Button>
          </form>

          <div className="flex items-center gap-4 py-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground uppercase">Or</span>
            <Separator className="flex-1" />
          </div>

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
