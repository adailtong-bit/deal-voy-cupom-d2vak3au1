import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, Store, Tags, Settings, DollarSign } from 'lucide-react'

export default function FranchiseeDashboard() {
  const { user, companies, coupons, franchises } = useCouponStore()

  // Ensure only franchisees can access this page
  if (user?.role !== 'franchisee') {
    return <Navigate to="/" replace />
  }

  // Identify franchisee's franchise network
  const myFranchise = franchises.find((f) => f.ownerId === user.id)
  const isNY = user.region === 'US-NY'

  // Locale setup based on region
  const locale = isNY ? 'en-US' : 'pt-BR'
  const currency = isNY ? 'USD' : 'BRL'

  const formatMoney = (val: number | undefined) => {
    if (val === undefined) return ''
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(val)
  }

  // Franchisee HQ Company (for own campaigns)
  const hqCompany = companies.find(
    (c) => c.franchiseId === myFranchise?.id && c.name.includes('HQ'),
  )

  // All companies in this franchise
  const franchiseCompanies = companies.filter(
    (c) => c.franchiseId === myFranchise?.id,
  )
  const franchiseCompanyIds = franchiseCompanies.map((c) => c.id)

  // My Campaigns (Franchisee Level)
  const myCampaigns = coupons.filter((c) => c.companyId === hqCompany?.id)

  // Merchant Campaigns (Under this franchise, excluding HQ)
  const merchantCampaigns = coupons.filter(
    (c) =>
      c.companyId &&
      franchiseCompanyIds.includes(c.companyId) &&
      c.companyId !== hqCompany?.id,
  )

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500">Active</Badge>
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>
      case 'used':
        return <Badge variant="outline">Used</Badge>
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>
    }
  }

  return (
    <div className="container py-8 max-w-6xl mx-auto space-y-8 animate-fade-in-up mb-16 md:mb-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Franchise Dashboard
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-semibold text-slate-700">
              Region: {isNY ? 'New York' : myFranchise?.region || 'Global'}
            </span>
          </p>
        </div>
        {isNY && (
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200 flex items-center gap-2 shadow-inner">
            <DollarSign className="h-5 w-5" />
            <span className="font-semibold text-sm">
              USD Currency Formatting Enabled
            </span>
          </div>
        )}
      </div>

      <Tabs defaultValue="my-campaigns" className="w-full">
        <TabsList className="mb-6 flex flex-wrap h-auto gap-2 p-1 bg-slate-100 rounded-lg justify-start">
          <TabsTrigger
            value="my-campaigns"
            className="py-2.5 px-4 font-semibold"
          >
            <Tags className="h-4 w-4 mr-2" />
            My Campaigns
          </TabsTrigger>
          <TabsTrigger
            value="merchant-overview"
            className="py-2.5 px-4 font-semibold"
          >
            <Store className="h-4 w-4 mr-2" />
            Merchant Overview
          </TabsTrigger>
          <TabsTrigger value="settings" className="py-2.5 px-4 font-semibold">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* My Campaigns Tab */}
        <TabsContent value="my-campaigns" className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-xl">Franchisee Campaigns</CardTitle>
              <CardDescription>
                Manage central promotions created specifically for the{' '}
                {isNY ? 'New York' : myFranchise?.region} region.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-semibold pl-6">
                      Campaign Name
                    </TableHead>
                    <TableHead className="font-semibold">Discount</TableHead>
                    <TableHead className="font-semibold">
                      Stock / Limit
                    </TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myCampaigns.length > 0 ? (
                    myCampaigns.map((coupon) => (
                      <TableRow key={coupon.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium pl-6">
                          {coupon.title}
                        </TableCell>
                        <TableCell className="text-primary font-bold">
                          {coupon.discount}
                        </TableCell>
                        <TableCell>
                          {coupon.totalAvailable ?? 0} coupons
                        </TableCell>
                        <TableCell>{getStatusBadge(coupon.status)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No active campaigns for this franchise.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Merchant Overview Tab */}
        <TabsContent value="merchant-overview" className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-xl">Merchant Campaigns</CardTitle>
              <CardDescription>
                Overview of active and expired offers generated by local
                merchants within your territory.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-semibold pl-6">
                      Merchant
                    </TableHead>
                    <TableHead className="font-semibold">
                      Campaign Name
                    </TableHead>
                    <TableHead className="font-semibold">Value</TableHead>
                    <TableHead className="font-semibold">Stock</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {merchantCampaigns.length > 0 ? (
                    merchantCampaigns.map((coupon) => (
                      <TableRow key={coupon.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-slate-700 pl-6">
                          {coupon.storeName}
                        </TableCell>
                        <TableCell>{coupon.title}</TableCell>
                        <TableCell className="text-primary font-bold">
                          {coupon.discount}
                        </TableCell>
                        <TableCell>
                          {coupon.totalAvailable ?? 0} /{' '}
                          {(coupon.totalAvailable ?? 0) +
                            (coupon.reservedCount ?? 0)}
                        </TableCell>
                        <TableCell>{getStatusBadge(coupon.status)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No merchant campaigns found in your region.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="border-slate-200 shadow-sm max-w-2xl">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-xl">Regional Settings</CardTitle>
              <CardDescription>
                Configure the defaults for your specific geographic territory.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label>Registered Region</Label>
                <Input value={user.region || 'Not Set'} disabled />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Input value={currency} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Formatting Standard</Label>
                  <Input value={locale} disabled />
                </div>
              </div>
              <div className="bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-200 text-sm">
                These settings are automatically inherited from your master
                franchise agreement and dictate how all billing, pricing, and
                campaign data is presented to users in your territory.
              </div>
              <div className="pt-4 border-t">
                <Button className="w-full sm:w-auto">
                  Save Additional Configurations
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
