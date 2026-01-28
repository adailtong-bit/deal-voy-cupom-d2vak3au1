import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Briefcase,
  Map,
  Car,
  Plus,
  Users,
  CheckCircle,
  Building,
  Plane,
  Settings,
  Bell,
  BarChart,
  Tag,
} from 'lucide-react'
import { toast } from 'sonner'
import { ItineraryCard } from '@/components/ItineraryCard'
import { MOCK_CLIENT_HISTORY } from '@/lib/data'

export default function AgencyDashboard() {
  const { user, itineraries, carRentals, addCarRental } = useCouponStore()
  const { t, formatCurrency, formatDate } = useLanguage()
  const { register, handleSubmit, reset } = useForm()
  const [isCarDialogOpen, setIsCarDialogOpen] = useState(false)

  if (!user || user.role !== 'agency') {
    return (
      <div className="p-8 text-center text-red-500">
        {t('admin.access_denied')}
      </div>
    )
  }

  // Filter to ensure we have "my" items, falling back to all for demo volume
  const myItineraries = itineraries.length > 0 ? itineraries : []
  const myCars = carRentals.length > 0 ? carRentals : []

  const onCarSubmit = (data: any) => {
    addCarRental({
      id: Math.random().toString(),
      ...data,
      pricePerDay: Number(data.pricePerDay),
      year: Number(data.year),
      agencyId: user.agencyId || 'agency1',
      status: 'available',
      image: 'https://img.usecurling.com/p/300/200?q=car',
    })
    setIsCarDialogOpen(false)
    reset()
  }

  const ScenarioCard = ({ title, icon: Icon, value, color }: any) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-white p-6 rounded-xl shadow-sm border">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />
            {t('agency.dashboard')}
          </h1>
          <p className="text-muted-foreground">{user.name} - Agency Portal</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <ScenarioCard
          title={t('agency.builder')}
          icon={Map}
          value="Go"
          color="text-blue-500"
        />
        <ScenarioCard
          title={t('agency.inventory')}
          icon={Car}
          value={myCars.length}
        />
        <ScenarioCard
          title={t('agency.clients')}
          icon={Users}
          value={MOCK_CLIENT_HISTORY.length}
        />
        <ScenarioCard
          title={t('agency.commission_data')}
          icon={BarChart}
          value="12%"
          color="text-green-500"
        />
        <ScenarioCard
          title={t('agency.partner_hotels')}
          icon={Building}
          value="45"
        />
        <ScenarioCard
          title={t('agency.tour_packages')}
          icon={Plane}
          value="8"
        />
        <ScenarioCard
          title={t('agency.preferences')}
          icon={Settings}
          value="Setup"
        />
        <ScenarioCard
          title={t('agency.alerts')}
          icon={Bell}
          value="3"
          color="text-red-500"
        />
        <ScenarioCard
          title={t('agency.sales_reports')}
          icon={BarChart}
          value="View"
        />
        <ScenarioCard
          title={t('agency.discounts')}
          icon={Tag}
          value="-15%"
          color="text-orange-500"
        />
      </div>

      <Tabs defaultValue="itineraries">
        <TabsList>
          <TabsTrigger value="itineraries">
            <Map className="h-4 w-4 mr-2" /> {t('agency.itineraries')}
          </TabsTrigger>
          <TabsTrigger value="cars">
            <Car className="h-4 w-4 mr-2" /> {t('agency.cars')}
          </TabsTrigger>
          <TabsTrigger value="clients">
            <Users className="h-4 w-4 mr-2" /> {t('agency.clients')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="itineraries" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{t('agency.itineraries')}</h2>
            <Button onClick={() => toast.info('Use Travel Planner to create')}>
              <Plus className="h-4 w-4 mr-2" /> {t('agency.new_itinerary')}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myItineraries.map((it) => (
              <ItineraryCard key={it.id} itinerary={it} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cars" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{t('agency.cars')}</h2>
            <Dialog open={isCarDialogOpen} onOpenChange={setIsCarDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> {t('agency.new_car')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('agency.new_car')}</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit(onCarSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Input {...register('model')} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Brand</Label>
                      <Input {...register('brand')} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Input
                        type="number"
                        {...register('year')}
                        required
                        defaultValue={2024}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price/Day</Label>
                      <Input
                        type="number"
                        {...register('pricePerDay')}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Plate</Label>
                    <Input {...register('plate')} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input {...register('location')} required />
                  </div>
                  <Button type="submit" className="w-full">
                    {t('common.save')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price/Day</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myCars.map((car) => (
                    <TableRow key={car.id}>
                      <TableCell className="font-medium">
                        {car.brand} {car.model} ({car.year})
                        <div className="text-xs text-muted-foreground">
                          {car.plate}
                        </div>
                      </TableCell>
                      <TableCell>{car.category}</TableCell>
                      <TableCell>{formatCurrency(car.pricePerDay)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${car.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                        >
                          {car.status}
                        </span>
                      </TableCell>
                      <TableCell>{car.location}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Client Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_CLIENT_HISTORY.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell>{formatDate(history.date)}</TableCell>
                      <TableCell>{history.clientName}</TableCell>
                      <TableCell>{history.action}</TableCell>
                      <TableCell>{formatCurrency(history.amount)}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-green-600 gap-1 text-xs font-bold uppercase">
                          <CheckCircle className="h-3 w-3" /> {history.status}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
