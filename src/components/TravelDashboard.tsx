import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Luggage,
  Plus,
  Calendar,
  MapPin,
  MoreVertical,
  Trash2,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Car,
  Hotel,
  Ticket,
  Megaphone,
  Search,
  Shield,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CreateTripWizard } from './CreateTripWizard'
import { TravelDiscoveryHub } from './TravelDiscoveryHub'
import { formatDate } from '@/lib/utils'

interface TravelDashboardProps {
  onSelectTrip: (id: string) => void
  onCreateNew?: () => void
}

export function TravelDashboard({
  onSelectTrip,
  onCreateNew,
}: TravelDashboardProps) {
  const { t } = useLanguage()
  const { itineraries, user, deleteItinerary, bookings } = useCouponStore()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab = searchParams.get('tab') || 'discover'

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  const myTrips = useMemo(
    () => itineraries.filter((it) => it.authorId === user?.id),
    [itineraries, user],
  )

  const myBookings = useMemo(
    () => bookings.filter((b) => b.userId === user?.id),
    [bookings, user],
  )

  const isMerchantOrAdmin =
    user?.role === 'shopkeeper' || user?.role === 'super_admin'

  const handleDeleteTrip = (id: string) => {
    deleteItinerary(id)
    toast.success(t('travel.trip_deleted', 'Trip deleted'))
  }

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew()
    } else {
      setIsCreateOpen(true)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'paid':
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1">
            <CheckCircle className="w-3 h-3" />{' '}
            {t('travel.confirmed', 'Confirmado')}
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" /> {t('travel.cancelled', 'Cancelado')}
          </Badge>
        )
      case 'pending':
      default:
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1">
            <Clock className="w-3 h-3" /> {t('travel.pending', 'Pendente')}
          </Badge>
        )
    }
  }

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'hotel':
        return <Hotel className="w-5 h-5" />
      case 'car':
        return <Car className="w-5 h-5" />
      case 'ticket':
      case 'activity':
        return <Ticket className="w-5 h-5" />
      default:
        return <Calendar className="w-5 h-5" />
    }
  }

  const getTypeName = (type?: string) => {
    switch (type) {
      case 'hotel':
        return t('travel.accommodation', 'Hospedagem')
      case 'car':
        return t('travel.car_rental', 'Aluguel de Carro')
      case 'ticket':
      case 'activity':
        return t('travel.activity', 'Atividade / Ingresso')
      default:
        return t('travel.general_booking', 'Reserva Geral')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-[calc(100vh-64px)] animate-in fade-in duration-500 mb-16 md:mb-0">
      {isMerchantOrAdmin && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Users className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800 font-bold">
            {t('travel.prospecting_tool', 'Merchant Prospecting Tool')}
          </AlertTitle>
          <AlertDescription className="text-blue-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
            <span>
              {t(
                'travel.prospecting_desc',
                'Discover potential customers traveling to your region and view market trends.',
              )}
            </span>
            <Link to={user?.role === 'super_admin' ? '/admin' : '/vendor'}>
              <Button
                size="sm"
                variant="outline"
                className="bg-white border-blue-200 hover:bg-blue-100"
              >
                {t('travel.access_crm', 'Access CRM')}
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="mb-8 bg-slate-100 p-1 rounded-xl h-auto flex flex-col sm:flex-row w-full sm:w-auto">
          <TabsTrigger
            value="discover"
            className="rounded-lg py-2.5 px-6 font-semibold text-base sm:flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            {t('travel.discover_hub', 'Hub de Descobertas')}
          </TabsTrigger>
          <TabsTrigger
            value="bookings"
            className="rounded-lg py-2.5 px-6 font-semibold text-base sm:flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            {t('travel.booking_status', 'Status de Reservas')}
          </TabsTrigger>
          <TabsTrigger
            value="trips"
            className="rounded-lg py-2.5 px-6 font-semibold text-base sm:flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            {t('travel.my_trips', 'Minhas Viagens')}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="discover"
          className="mt-0 outline-none animate-in fade-in-50 duration-500"
        >
          <TravelDiscoveryHub
            onBookingSuccess={() => handleTabChange('bookings')}
          />
        </TabsContent>

        <TabsContent
          value="bookings"
          className="mt-0 outline-none animate-in fade-in-50 duration-500"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                <Clock className="h-8 w-8 text-primary" />
                {t('travel.booking_status', 'Status de Reservas')}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t(
                  'travel.track_lifecycle',
                  'Acompanhe o ciclo de vida de todas as suas solicitações.',
                )}
              </p>
            </div>
          </div>

          {myBookings.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed">
              <Ticket className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">
                {t('travel.no_bookings', 'Nenhuma reserva encontrada')}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t(
                  'travel.no_bookings_desc',
                  'Você ainda não solicitou nenhuma reserva através do Hub de Descobertas.',
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myBookings.map((booking) => (
                <Card
                  key={booking.id}
                  className="flex flex-col border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-100 rounded-lg text-slate-600">
                          {getTypeIcon(booking.type)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-primary uppercase tracking-wider">
                            {getTypeName(booking.type)}
                          </p>
                          <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
                            {booking.storeName}
                          </h3>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="space-y-3 mb-5 flex-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>
                          {formatDate(booking.date)}{' '}
                          {booking.time &&
                            ` ${t('common.at', 'às')} ${booking.time}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>
                          {booking.guests}{' '}
                          {booking.guests === 1
                            ? t('travel.person', 'Pessoa')
                            : t('travel.people', 'Pessoas')}
                        </span>
                      </div>
                      {booking.requiresPrivacy && (
                        <div className="flex items-center gap-2 text-sm text-blue-700 font-medium bg-blue-50 p-2 rounded-md border border-blue-100">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span>
                            {t(
                              'travel.privacy_rooms',
                              'Privacidade: Quartos Individuais',
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase">
                        {t('travel.source_offer', 'Fonte da Oferta')}
                      </span>
                      {booking.source === 'partner' ? (
                        <Badge
                          variant="secondary"
                          className="bg-purple-100 text-purple-800 hover:bg-purple-200 shadow-none border-none"
                        >
                          <Megaphone className="w-3 h-3 mr-1" />{' '}
                          {t('travel.source_partner', 'Parceiro')}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-slate-50 text-slate-600 shadow-none border-slate-200"
                        >
                          <Search className="w-3 h-3 mr-1" />{' '}
                          {t('travel.source_organic', 'Orgânico')}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="trips"
          className="mt-0 outline-none animate-in fade-in-50 duration-500"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                <Luggage className="h-8 w-8 text-primary" />
                {t('travel.my_trips', 'Minhas Viagens')}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t(
                  'travel.organize_trips',
                  'Organize suas próximas viagens e atividades com facilidade.',
                )}
              </p>
            </div>
            <Button
              size="lg"
              className="font-bold shadow-sm"
              onClick={handleCreateNew}
            >
              <Plus className="h-5 w-5 mr-2" />{' '}
              {t('travel.new_trip', 'Nova Viagem')}
            </Button>
          </div>

          {myTrips.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed">
              <Luggage className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">
                {t('travel.no_trips', 'Nenhuma viagem planejada')}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t(
                  'travel.no_trips_desc',
                  'Comece a planejar suas próximas férias, viagem de fim de semana ou negócios aqui.',
                )}
              </p>
              <Button onClick={handleCreateNew}>
                {t('travel.create_first_trip', 'Criar sua primeira viagem')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTrips.map((trip) => (
                <Card
                  key={trip.id}
                  className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group flex flex-col"
                  onClick={() => onSelectTrip(trip.id)}
                >
                  <div className="h-40 relative bg-slate-200 overflow-hidden">
                    <img
                      src={trip.image}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 text-white">
                      <h3 className="font-bold text-lg leading-tight">
                        {trip.title}
                      </h3>
                    </div>
                    <div className="absolute top-3 right-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-white/90 hover:bg-white text-slate-800 rounded-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteTrip(trip.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />{' '}
                            {t('travel.delete_trip', 'Deletar Viagem')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {trip.duration}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {trip.stops?.length || 0}{' '}
                        {t('travel.activities', 'Atividades')}
                      </span>
                    </div>
                    <Button variant="outline" className="w-full bg-slate-50">
                      {t('travel.view_itinerary', 'Ver Itinerário')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {!onCreateNew && (
        <CreateTripWizard
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={(t) => onSelectTrip(t.id)}
        />
      )}
    </div>
  )
}
