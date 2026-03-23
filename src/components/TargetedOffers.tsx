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
import { useLanguage } from '@/stores/LanguageContext'

export function TargetedOffers() {
  const { t } = useLanguage()

  const handleSend = () => {
    toast.success(
      t(
        'targeted_offers.success_msg',
        'Oferta enviada para o segmento selecionado!',
      ),
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />{' '}
          {t('targeted_offers.title', 'Ofertas Diretas')}
        </CardTitle>
        <CardDescription>
          {t(
            'targeted_offers.desc',
            'Envie promoções exclusivas para segmentos específicos de clientes.',
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{t('targeted_offers.target_segment', 'Segmento Alvo')}</Label>
          <Select>
            <SelectTrigger>
              <SelectValue
                placeholder={t(
                  'targeted_offers.select_audience',
                  'Selecione o público',
                )}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frequent">
                {t(
                  'targeted_offers.freq_visitors',
                  'Visitantes Frequentes (+5 visitas)',
                )}
              </SelectItem>
              <SelectItem value="new">
                {t(
                  'targeted_offers.new_users',
                  'Novos Usuários (Últimos 30 dias)',
                )}
              </SelectItem>
              <SelectItem value="inactive">
                {t(
                  'targeted_offers.inactive_users',
                  'Inativos (+60 dias sem visita)',
                )}
              </SelectItem>
              <SelectItem value="high_ticket">
                {t('targeted_offers.high_ticket', 'Alto Ticket Médio')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>
            {t('targeted_offers.notif_title', 'Título da Notificação')}
          </Label>
          <Input
            placeholder={t(
              'targeted_offers.notif_title_ph',
              'Ex: Sentimos sua falta! Ganhe 20% OFF',
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>{t('targeted_offers.message', 'Mensagem')}</Label>
          <Textarea
            placeholder={t(
              'targeted_offers.message_ph',
              'Descreva a oferta exclusiva...',
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('targeted_offers.discount', 'Desconto (%)')}</Label>
            <Input type="number" placeholder="20" />
          </div>
          <div className="space-y-2">
            <Label>{t('targeted_offers.validity', 'Validade (Dias)')}</Label>
            <Input type="number" placeholder="7" />
          </div>
        </div>

        <div className="bg-muted p-3 rounded text-xs text-muted-foreground">
          <p>
            {t('targeted_offers.est_reach', 'Estimativa de alcance:')}{' '}
            <strong>1.240 {t('targeted_offers.users', 'usuários')}</strong>
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full gap-2" onClick={handleSend}>
          <Send className="h-4 w-4" />{' '}
          {t('targeted_offers.send_campaign', 'Enviar Campanha')}
        </Button>
      </CardFooter>
    </Card>
  )
}
