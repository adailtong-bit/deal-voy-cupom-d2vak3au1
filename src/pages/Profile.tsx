import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Settings,
  LogOut,
  Award,
  User,
  Bell,
  Calendar,
  CreditCard,
  History,
} from 'lucide-react'
import { GamificationSection } from '@/components/GamificationSection'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

export default function Profile() {
  const { uploads, savedIds, points, user, updateUserProfile, transactions } =
    useCouponStore()
  const { t } = useLanguage()
  const [birthday, setBirthday] = useState(user?.birthday || '')
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    updateUserProfile({ birthday })
    setIsEditing(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <div className="flex flex-col items-center mb-8">
        <Avatar className="h-24 w-24 mb-4 border-4 border-background shadow-xl">
          <AvatarImage
            src={
              user?.avatar ||
              'https://img.usecurling.com/ppl/thumbnail?gender=male'
            }
          />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold">{user?.name || 'User'}</h1>
        <p className="text-muted-foreground">
          {user?.email || 'user@example.com'}
        </p>
        <div className="flex items-center gap-2 mt-4 bg-yellow-100 text-yellow-800 px-4 py-1.5 rounded-full text-sm font-bold">
          <Award className="h-4 w-4" />
          Nível 3: Caçador de Ofertas
        </div>
      </div>

      <Tabs defaultValue="stats" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo de Atividade</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {uploads.length}
                </p>
                <p className="text-xs text-muted-foreground">Docs Enviados</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {savedIds.length}
                </p>
                <p className="text-xs text-muted-foreground">Cupons Salvos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{points}</p>
                <p className="text-xs text-muted-foreground">Pontos Totais</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" /> Histórico de Compras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma compra realizada ainda.
                </p>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center border-b last:border-0 pb-3 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{tx.couponTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString()} -{' '}
                        {tx.storeName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">
                        R$ {tx.amount.toFixed(2)}
                      </p>
                      <Badge variant="outline" className="text-[10px] h-5">
                        {tx.method === 'fetch'
                          ? 'Points'
                          : tx.method === 'wallet'
                            ? 'Wallet'
                            : 'Card'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" /> Dados Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="birthday">{t('profile.birthday')}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="birthday"
                  type="date"
                  className="pl-9"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              {isEditing ? (
                <Button onClick={handleSave} size="sm">
                  {t('profile.save')}
                </Button>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  size="sm"
                  variant="outline"
                >
                  Editar
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Adicione sua data de nascimento para ganhar presentes especiais.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mb-8">
        <GamificationSection />
      </div>

      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full justify-start h-12 gap-3"
          size="lg"
        >
          <Bell className="h-5 w-5 text-muted-foreground" /> Notificações
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start h-12 gap-3"
          size="lg"
        >
          <CreditCard className="h-5 w-5 text-muted-foreground" /> Métodos de
          Pagamento
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start h-12 gap-3"
          size="lg"
        >
          <Settings className="h-5 w-5 text-muted-foreground" /> Configurações
        </Button>

        <Separator className="my-4" />

        <Button
          variant="ghost"
          className="w-full justify-start h-12 gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
          size="lg"
        >
          <LogOut className="h-5 w-5" /> Sair da conta
        </Button>
      </div>
    </div>
  )
}
