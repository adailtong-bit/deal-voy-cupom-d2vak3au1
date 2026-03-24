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
import {
  MapPin,
  Store,
  Tags,
  Settings,
  DollarSign,
  TrendingUp,
  Ticket,
  Megaphone,
} from 'lucide-react'
import { FranchiseeAdsTab } from '@/components/franchisee/FranchiseeAdsTab'

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

  const totalFranchiseCoupons = myCampaigns.length + merchantCampaigns.length
  const activeMerchants = Math.max(0, franchiseCompanyIds.length - 1) // excluding HQ
  const simulatedRevenue = isNY ? 24500.0 : 15420.5

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

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-slate-500 font-semibold uppercase tracking-wider">
              Network Campaigns
            </CardTitle>
            <Ticket className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">
              {totalFranchiseCoupons}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              HQ + Partner Stores
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-slate-500 font-semibold uppercase tracking-wider">
              Active Merchants
            </CardTitle>
            <Store className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">
              {activeMerchants}
            </div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              +2 this month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-slate-500 font-semibold uppercase tracking-wider">
              Network Gross Val.
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-600">
              {formatMoney(simulatedRevenue)}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Simulated YTD Volume
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="my-campaigns" className="w-full">
        <TabsList className="mb-6 flex flex-wrap h-auto gap-2 p-1 bg-slate-100 rounded-lg justify-start shadow-inner">
          <TabsTrigger
            value="my-campaigns"
            className="py-2.5 px-4 font-semibold data-[state=active]:shadow-sm"
          >
            <Tags className="h-4 w-4 mr-2" />
            My Campaigns
          </TabsTrigger>
          <TabsTrigger
            value="merchant-overview"
            className="py-2.5 px-4 font-semibold data-[state=active]:shadow-sm"
          >
            <Store className="h-4 w-4 mr-2" />
            Merchant Overview
          </TabsTrigger>
          <TabsTrigger
            value="regional-ads"
            className="py-2.5 px-4 font-semibold data-[state=active]:shadow-sm"
          >
            <Megaphone className="h-4 w-4 mr-2" />
            Publicidade Regional
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="py-2.5 px-4 font-semibold data-[state=active]:shadow-sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* My Campaigns Tab */}
        <TabsContent value="my-campaigns" className="space-y-4">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b">
              <CardTitle className="text-xl">Franchisee Campaigns</CardTitle>
              <CardDescription>
                Manage central promotions created specifically for the{' '}
                <strong className="text-slate-700">
                  {isNY ? 'New York' : myFranchise?.region}
                </strong>{' '}
                region.
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
                      <TableRow
                        key={coupon.id}
                        className="hover:bg-slate-50/80"
                      >
                        <TableCell className="font-medium text-slate-800 pl-6">
                          {coupon.title}
                        </TableCell>
                        <TableCell className="text-primary font-bold">
                          {coupon.discount}
                        </TableCell>
                        <TableCell className="text-slate-600 font-medium">
                          {coupon.reservedCount || 0} /{' '}
                          {coupon.totalAvailable ?? 0}
                        </TableCell>
                        <TableCell>{getStatusBadge(coupon.status)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-12 text-slate-500"
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
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b">
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
                      <TableRow
                        key={coupon.id}
                        className="hover:bg-slate-50/80"
                      >
                        <TableCell className="font-bold text-slate-700 pl-6">
                          {coupon.storeName}
                        </TableCell>
                        <TableCell className="font-medium text-slate-600">
                          {coupon.title}
                        </TableCell>
                        <TableCell className="text-primary font-bold">
                          {coupon.discount}
                        </TableCell>
                        <TableCell className="text-slate-600 font-medium">
                          {coupon.reservedCount || 0} /{' '}
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
                        className="text-center py-12 text-slate-500"
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

        {/* Regional Ads Tab */}
        <TabsContent value="regional-ads" className="space-y-4">
          <FranchiseeAdsTab franchiseId={myFranchise?.id} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="border-slate-200 shadow-sm max-w-2xl">
            <CardHeader className="bg-slate-50/80 border-b">
              <CardTitle className="text-xl">Regional Settings</CardTitle>
              <CardDescription>
                Configure the defaults for your specific geographic territory.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label className="text-slate-700">Registered Region</Label>
                <Input
                  value={user.region || 'Not Set'}
                  disabled
                  className="bg-slate-50 font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">Default Currency</Label>
                  <Input
                    value={currency}
                    disabled
                    className="bg-slate-50 font-medium text-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Formatting Standard</Label>
                  <Input
                    value={locale}
                    disabled
                    className="bg-slate-50 font-medium"
                  />
                </div>
              </div>
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-200 text-sm font-medium">
                These settings are automatically inherited from your master
                franchise agreement and dictate how all billing, pricing, and
                campaign data is presented to users in your territory.
              </div>
              <div className="pt-4 border-t flex justify-end">
                <Button className="w-full sm:w-auto font-bold">
                  Save Configurations
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
