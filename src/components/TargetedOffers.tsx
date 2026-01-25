import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Users, Send } from 'lucide-react'

export function TargetedOffers() {
  const handleSend = () => {
    toast.success('Oferta enviada para o segmento selecionado!')
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" /> Ofertas Diretas
        </CardTitle>
        <CardDescription>
          Envie promoções exclusivas para segmentos específicos de clientes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Segmento Alvo</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o público" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frequent">
                Visitantes Frequentes (+5 visitas)
              </SelectItem>
              <SelectItem value="new">
                Novos Usuários (Últimos 30 dias)
              </SelectItem>
              <SelectItem value="inactive">
                Inativos (+60 dias sem visita)
              </SelectItem>
              <SelectItem value="high_ticket">Alto Ticket Médio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Título da Notificação</Label>
          <Input placeholder="Ex: Sentimos sua falta! Ganhe 20% OFF" />
        </div>

        <div className="space-y-2">
          <Label>Mensagem</Label>
          <Textarea placeholder="Descreva a oferta exclusiva..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Desconto (%)</Label>
            <Input type="number" placeholder="20" />
          </div>
          <div className="space-y-2">
            <Label>Validade (Dias)</Label>
            <Input type="number" placeholder="7" />
          </div>
        </div>

        <div className="bg-muted p-3 rounded text-xs text-muted-foreground">
          <p>
            Estimativa de alcance: <strong>1.240 usuários</strong>
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full gap-2" onClick={handleSend}>
          <Send className="h-4 w-4" /> Enviar Campanha
        </Button>
      </CardFooter>
    </Card>
  )
}
