import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  LineChart,
  PieChart,
  Activity,
  DollarSign,
  Users,
  ShoppingCart,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'

export function VendorAnalytics() {
  const { formatCurrency } = useLanguage()
  const { user, companies } = useCouponStore()

  const myCompany =
    companies.find((c) => c.id === user?.companyId) || companies[0]
  const currency = myCompany?.region === 'US-FL' ? 'USD' : 'BRL'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <DollarSign className="h-8 w-8 text-green-500 mb-2" />
            <h3 className="text-2xl font-bold">
              {formatCurrency(12450, currency)}
            </h3>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Users className="h-8 w-8 text-blue-500 mb-2" />
            <h3 className="text-2xl font-bold">1,240</h3>
            <p className="text-xs text-muted-foreground">Unique Visitors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <ShoppingCart className="h-8 w-8 text-purple-500 mb-2" />
            <h3 className="text-2xl font-bold">345</h3>
            <p className="text-xs text-muted-foreground">Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Activity className="h-8 w-8 text-orange-500 mb-2" />
            <h3 className="text-2xl font-bold">12%</h3>
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-[300px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-4 w-4" /> Sales Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center bg-slate-50 m-4 rounded border border-dashed">
            <p className="text-muted-foreground text-sm">
              Chart Placeholder (Sales Data)
            </p>
          </CardContent>
        </Card>
        <Card className="h-[300px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-4 w-4" /> Visitor Traffic
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center bg-slate-50 m-4 rounded border border-dashed">
            <p className="text-muted-foreground text-sm">
              Chart Placeholder (Traffic Data)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
