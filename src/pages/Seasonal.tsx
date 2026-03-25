import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import {
  Calendar as CalendarIcon,
  Gift,
  Store,
  Ticket,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { SeasonalEvent } from '@/lib/types'

function SeasonalCampaignCard({
  event,
  isFuture,
}: {
  event: SeasonalEvent
  isFuture: boolean
}) {
  const { t, formatDate, language } = useLanguage()
  const { reserveCoupon, isReserved, companies, trackSeasonalClick } =
    useCouponStore()

  const reserved = isReserved(event.id)
  const isSoldOut =
    event.totalAvailable !== undefined && event.totalAvailable <= 0
  const title = event.translations?.[language]?.title || event.title
  const description =
    event.translations?.[language]?.description || event.description
  const companyName = companies.find((c) => c.id === event.companyId)?.name

  const handleReserve = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isFuture || reserved || isSoldOut) return
    const success = reserveCoupon(event.id)
    if (success) {
      trackSeasonalClick(event.id)
      toast.success(
        t(
          'seasonal.reserved_success',
          'Voucher da campanha reservado com sucesso!',
        ),
      )
    }
  }

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow h-full">
      {event.image && (
        <div className="relative h-48 w-full bg-muted shrink-0">
          <img
            src={event.image}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 flex gap-1">
            {event.type && (
              <Badge
                variant="secondary"
                className="bg-white/90 text-black border-none shadow-sm font-semibold capitalize"
              >
                {t(`event.type.${event.type}`, event.type)}
              </Badge>
            )}
          </div>
          {isSoldOut && !isFuture && (
            <div className="absolute top-2 right-2">
              <Badge variant="destructive" className="shadow-sm">
                {t('seasonal.exhausted', 'Esgotado')}
              </Badge>
            </div>
          )}
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg leading-tight line-clamp-2">
          {title}
        </CardTitle>
        {companyName && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <Store className="h-3 w-3" />
            {companyName}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-4 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {description}
        </p>
        <div className="space-y-2 mt-auto">
          <div className="flex items-center text-xs text-muted-foreground gap-1.5 font-medium">
            <CalendarIcon className="h-3.5 w-3.5 text-primary" />
            <span>
              {formatDate(event.startDate)} - {formatDate(event.endDate)}
            </span>
          </div>
          {event.totalAvailable !== undefined && (
            <div className="flex items-center text-xs text-muted-foreground gap-1.5">
              <Ticket className="h-3.5 w-3.5 text-orange-500" />
              <span>
                {event.totalAvailable}{' '}
                {t('seasonal.vouchers_left', 'restantes')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 mt-auto">
        <Button
          className="w-full transition-transform active:scale-95"
          variant={isFuture ? 'secondary' : reserved ? 'outline' : 'default'}
          disabled={isFuture || isSoldOut || reserved}
          onClick={handleReserve}
        >
          {isFuture ? (
            <>
              <Clock className="w-4 h-4 mr-2" />{' '}
              {t('seasonal.coming_soon', 'Em breve')}
            </>
          ) : reserved ? (
            <>{t('seasonal.reserved', 'Reservado')}</>
          ) : isSoldOut ? (
            <>{t('seasonal.exhausted_btn', 'Vouchers Esgotados')}</>
          ) : (
            <>
              <Gift className="w-4 h-4 mr-2" />{' '}
              {t('seasonal.reserve_voucher', 'Reservar Voucher')}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function Seasonal() {
  const { t } = useLanguage()
  const { seasonalEvents, companies, user, selectedRegion } = useCouponStore()

  const filteredEvents = useMemo(() => {
    return seasonalEvents.filter((e) => {
      if (
        user?.role === 'user' &&
        (e.status === 'draft' ||
          e.status === 'archived' ||
          e.status === 'rejected' ||
          e.status === 'expired')
      ) {
        return false
      }
      if (e.status === 'expired') return false

      let audienceMatch = true
      if (e.targetAudience === 'preferred') {
        const company = companies.find((comp) => comp.id === e.companyId)
        const isMerchant =
          user?.role === 'super_admin' ||
          (user?.role === 'shopkeeper' && user.companyId === e.companyId) ||
          (user?.role === 'franchisee' && user.franchiseId === e.franchiseId)
        const isPreferred = company?.preferredCustomers?.includes(
          user?.id || '',
        )
        audienceMatch = isMerchant || !!isPreferred
      }

      if (
        user?.role === 'shopkeeper' &&
        e.companyId &&
        e.companyId !== user.companyId
      ) {
        return false
      }
      if (
        user?.role === 'franchisee' &&
        e.franchiseId &&
        e.franchiseId !== user.franchiseId
      ) {
        return false
      }
      if (
        selectedRegion !== 'Global' &&
        e.region &&
        e.region !== selectedRegion
      ) {
        return false
      }

      return audienceMatch
    })
  }, [seasonalEvents, user, companies, selectedRegion])

  const activeEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return filteredEvents.filter((e) => {
      const start = new Date(e.startDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(e.endDate)
      end.setHours(23, 59, 59, 999)
      return start <= today && end >= today
    })
  }, [filteredEvents])

  const futureEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return filteredEvents.filter((e) => {
      const start = new Date(e.startDate)
      start.setHours(0, 0, 0, 0)
      return start > today
    })
  }, [filteredEvents])

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0 animate-in fade-in zoom-in-95 duration-500">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <CalendarIcon className="h-8 w-8 text-primary" />
        {t('seasonal.title')}
      </h1>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8">
          <TabsTrigger value="active" className="text-base">
            {t('seasonal.active_tab', 'Ativas')}
            <Badge
              variant="secondary"
              className="ml-2 bg-primary/10 text-primary"
            >
              {activeEvents.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="future" className="text-base">
            {t('seasonal.future_tab', 'Futuras')}
            <Badge
              variant="secondary"
              className="ml-2 bg-primary/10 text-primary"
            >
              {futureEvents.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6 outline-none">
          {activeEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeEvents.map((e) => (
                <SeasonalCampaignCard key={e.id} event={e} isFuture={false} />
              ))}
            </div>
          ) : (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Gift className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {t('seasonal.no_active', 'Nenhuma campanha ativa')}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {t(
                    'seasonal.no_active_desc',
                    'No momento não temos campanhas ativas para o seu perfil ou região.',
                  )}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="future" className="space-y-6 outline-none">
          {futureEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {futureEvents.map((e) => (
                <SeasonalCampaignCard key={e.id} event={e} isFuture={true} />
              ))}
            </div>
          ) : (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Clock className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {t('seasonal.no_future', 'Nenhuma campanha futura')}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {t(
                    'seasonal.no_future_desc',
                    'Fique de olho! Novas campanhas serão agendadas em breve.',
                  )}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
