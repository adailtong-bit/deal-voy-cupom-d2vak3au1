import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plane,
  Hotel,
  Calendar,
  Search,
  MapPin,
  Star,
  ExternalLink,
} from 'lucide-react'
import { useCouponStore } from '@/stores/CouponContext'

export default function TravelHub() {
  const { travelOffers, selectedRegion } = useCouponStore()
  const [activeTab, setActiveTab] = useState('flights')

  // Filter offers based on active tab and region
  const filteredOffers = travelOffers.filter((offer) => {
    // Basic type filtering
    if (activeTab === 'flights' && offer.type !== 'flight') return false
    if (activeTab === 'hotels' && offer.type !== 'hotel') return false

    // Simple regional logic: show offers relevant to selected region or global
    if (
      selectedRegion !== 'Global' &&
      offer.region &&
      offer.region !== selectedRegion
    )
      return false

    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-slate-900">
          Travel <span className="text-primary">Hub</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Encontre os melhores voos e hotéis para sua próxima aventura.
          Comparação em tempo real.
        </p>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border overflow-hidden mb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-14 rounded-none bg-slate-50 border-b">
            <TabsTrigger
              value="flights"
              className="flex-1 h-full text-base gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Plane className="h-5 w-5" /> Voos
            </TabsTrigger>
            <TabsTrigger
              value="hotels"
              className="flex-1 h-full text-base gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Hotel className="h-5 w-5" /> Hotéis
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-1">
                <Label className="mb-2 block text-xs uppercase font-bold text-muted-foreground">
                  {activeTab === 'flights' ? 'Origem' : 'Destino'}
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder={
                      activeTab === 'flights'
                        ? 'São Paulo (GRU)'
                        : 'Orlando, FL'
                    }
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="md:col-span-1">
                <Label className="mb-2 block text-xs uppercase font-bold text-muted-foreground">
                  {activeTab === 'flights' ? 'Destino' : 'Check-in'}
                </Label>
                <div className="relative">
                  {activeTab === 'flights' ? (
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  ) : (
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  )}
                  <Input
                    type={activeTab === 'hotels' ? 'date' : 'text'}
                    placeholder={activeTab === 'flights' ? 'Orlando (MCO)' : ''}
                    className={activeTab === 'flights' ? 'pl-9' : 'pl-9'}
                  />
                </div>
              </div>
              <div className="md:col-span-1">
                <Label className="mb-2 block text-xs uppercase font-bold text-muted-foreground">
                  Data
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input type="date" className="pl-9" />
                </div>
              </div>
              <div className="md:col-span-1">
                <Button className="w-full h-10 font-bold gap-2">
                  <Search className="h-4 w-4" /> Buscar
                </Button>
              </div>
            </div>
          </div>
        </Tabs>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">
          Ofertas em Destaque{' '}
          {selectedRegion !== 'Global' ? `em ${selectedRegion}` : ''}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.length > 0 ? (
            filteredOffers.map((offer) => (
              <Card
                key={offer.id}
                className="overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold shadow-sm">
                    {offer.provider}
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{offer.title}</h3>
                    <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                      <Star className="h-4 w-4 fill-current" /> {offer.rating}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 h-10 line-clamp-2">
                    {offer.description}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        A partir de
                      </span>
                      <span className="text-xl font-bold text-primary">
                        {offer.currency} {offer.price}
                      </span>
                    </div>
                    <Button variant="outline" className="gap-2" asChild>
                      <a
                        href={offer.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver Oferta <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-slate-50 rounded-lg">
              Nenhuma oferta encontrada para sua região no momento.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
