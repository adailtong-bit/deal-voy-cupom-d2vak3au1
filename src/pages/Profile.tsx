import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Settings, LogOut, Award, User, Bell } from 'lucide-react'
import { GamificationSection } from '@/components/GamificationSection'
import { useCouponStore } from '@/stores/CouponContext'

export default function Profile() {
  const { uploads, savedIds, points } = useCouponStore()

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <div className="flex flex-col items-center mb-8">
        <Avatar className="h-24 w-24 mb-4 border-4 border-background shadow-xl">
          <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold">João da Silva</h1>
        <p className="text-muted-foreground">Membro desde Jan 2024</p>
        <div className="flex items-center gap-2 mt-4 bg-yellow-100 text-yellow-800 px-4 py-1.5 rounded-full text-sm font-bold">
          <Award className="h-4 w-4" />
          Nível 3: Caçador de Ofertas
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Estatísticas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{uploads.length}</p>
            <p className="text-xs text-muted-foreground">Docs Enviados</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{savedIds.length}</p>
            <p className="text-xs text-muted-foreground">Cupons Salvos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{points}</p>
            <p className="text-xs text-muted-foreground">Pontos Totais</p>
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
          <User className="h-5 w-5 text-muted-foreground" /> Editar Perfil
        </Button>
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
