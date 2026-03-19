import { useMemo, useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
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
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { CreateTripWizard } from './CreateTripWizard'

export function TravelDashboard({
  onSelectTrip,
}: {
  onSelectTrip: (id: string) => void
}) {
  const { itineraries, user, deleteItinerary } = useCouponStore()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const myTrips = useMemo(
    () => itineraries.filter((it) => it.authorId === user?.id),
    [itineraries, user],
  )

  const isMerchantOrAdmin =
    user?.role === 'shopkeeper' || user?.role === 'super_admin'

  const handleDeleteTrip = (id: string) => {
    deleteItinerary(id)
    toast.success('Trip deleted')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-[calc(100vh-64px)] animate-in fade-in duration-500">
      {isMerchantOrAdmin && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Users className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800 font-bold">
            Merchant Prospecting Tool
          </AlertTitle>
          <AlertDescription className="text-blue-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
            <span>
              Discover potential customers traveling to your region and view
              market trends.
            </span>
            <Link to={user.role === 'super_admin' ? '/admin' : '/vendor'}>
              <Button
                size="sm"
                variant="outline"
                className="bg-white border-blue-200 hover:bg-blue-100"
              >
                Access CRM
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Luggage className="h-8 w-8 text-primary" />
            My Travel Plans
          </h1>
          <p className="text-muted-foreground mt-1">
            Organize your upcoming trips and adventures.
          </p>
        </div>
        <Button
          size="lg"
          className="font-bold shadow-sm"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="h-5 w-5 mr-2" /> New Trip
        </Button>
      </div>

      {myTrips.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed">
          <Luggage className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            No trips planned yet
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start planning your next vacation, weekend getaway, or business trip
            right here.
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            Create Your First Trip
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
                        <Trash2 className="h-4 w-4 mr-2" /> Delete Trip
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
                    {trip.stops.length} Activities
                  </span>
                </div>
                <Button variant="outline" className="w-full bg-slate-50">
                  View Itinerary
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateTripWizard
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(t) => onSelectTrip(t.id)}
      />
    </div>
  )
}
