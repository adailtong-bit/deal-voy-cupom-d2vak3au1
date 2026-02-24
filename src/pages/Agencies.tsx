import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Car,
  Briefcase,
  ExternalLink,
  Filter,
  ShoppingCart,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLanguage } from '@/stores/LanguageContext'
import { useNavigate } from 'react-router-dom'
import { TravelOffer } from '@/lib/types'

export default function Agencies() {
  const { travelOffers, selectedRegion } = useCouponStore()
  const { t, formatCurrency } = useLanguage()
  const navigate = useNavigate()

  const packages = travelOffers.filter(
    (t) =>
      t.type === 'package' &&
      (selectedRegion === 'Global' || !t.region || t.region === selectedRegion),
  )

  const cars = travelOffers.filter(
    (t) =>
      t.type === 'car_rental' &&
      (selectedRegion === 'Global' || !t.region || t.region === selectedRegion),
  )

  const handleBook = (offer: TravelOffer) => {
    navigate('/checkout', { state: { offer } })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('agencies.title')}</h1>
          <p className="text-muted-foreground">{t('agencies.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> {t('explore.filters')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="packages" className="space-y-6">
        <TabsList className="bg-white border w-full justify-start md:w-auto p-1 h-auto">
          <TabsTrigger
            value="packages"
            className="data-[state=active]:bg-primary data-[state=active]:text-white px-6 py-2"
          >
            <Briefcase className="h-4 w-4 mr-2" /> {t('agencies.packages')}
          </TabsTrigger>
          <TabsTrigger
            value="cars"
            className="data-[state=active]:bg-primary data-[state=active]:text-white px-6 py-2"
          >
            <Car className="h-4 w-4 mr-2" /> {t('agencies.cars')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className="flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-all"
              >
                <div className="w-full md:w-1/3 h-48 md:h-auto relative">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 left-2 bg-purple-600">
                    {t('agencies.packages')}
                  </Badge>
                </div>
                <CardContent className="flex-1 p-6 flex flex-col">
                  <div className="mb-auto">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{pkg.title}</h3>
                      <span className="text-xs font-bold text-muted-foreground border px-2 py-1 rounded">
                        {pkg.provider}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {pkg.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        {t('agencies.total_price')}
                      </span>
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(pkg.price, pkg.currency)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={pkg.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleBook(pkg)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />{' '}
                        {t('agencies.reserve')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {packages.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg">
                {t('home.no_offers')}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cars" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <Card key={car.id} className="overflow-hidden">
                <div className="h-40 relative bg-slate-100">
                  <img
                    src={car.image}
                    alt={car.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-5">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-bold">{car.title}</h3>
                    <Badge variant="outline">{car.provider}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {car.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">
                      {formatCurrency(car.price, car.currency)}
                      <span className="text-xs font-normal text-muted-foreground">
                        {t('agencies.per_day')}
                      </span>
                    </span>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleBook(car)}
                    >
                      {t('agencies.reserve')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {cars.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg">
                {t('home.no_offers')}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
