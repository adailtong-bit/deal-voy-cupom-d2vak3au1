import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Plus,
  Briefcase,
  QrCode,
  Settings,
  Coins,
  Scan,
  History,
  Barcode,
  TrendingUp,
  Star,
  Package,
  Calendar,
  ShoppingBag,
  Zap,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { toast } from 'sonner'
import { VendorAnalytics } from '@/components/VendorAnalytics'
import { CouponValidation } from '@/components/CouponValidation'
import { MOCK_VALIDATION_LOGS } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function VendorDashboard() {
  const { t, formatDate, formatCurrency } = useLanguage()
  const {
    user,
    companies,
    coupons: allCoupons,
    addCoupon,
    toggleLoyaltySystem,
    bookings,
    updateBehavioralTriggers,
  } = useCouponStore()

  const myCompany =
    companies.find((c) => c.id === user?.companyId) || companies[0]

  // Filter coupons to simulate 'my' coupons or allow all for demo
  const coupons = allCoupons
    .filter(
      (c) =>
        c.source !== 'aggregated' &&
        (c.companyId === myCompany.id || user?.role === 'super_admin'),
    )
    .slice(0, 15) // Show at least 10 items

  const myOrders = bookings // In reality, filter by store name or ID

  const { register, handleSubmit, reset } = useForm()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)

  // Behavioral Promo State
  const [selectedCouponId, setSelectedCouponId] = useState<string>(
    coupons[0]?.id || '',
  )
  const [triggerType, setTriggerType] = useState<'visit' | 'share'>('visit')
  const [triggerThreshold, setTriggerThreshold] = useState('5')
  const [triggerReward, setTriggerReward] = useState('10% OFF')

  const onSubmit = (data: any) => {
    const code =
      data.code ||
      'CMP-' + Math.random().toString(36).substr(2, 6).toUpperCase()
    setGeneratedCode(code)

    const newCoupon = {
      id: Math.random().toString(),
      ...data,
      companyId: myCompany.id,
      storeName: myCompany.name,
      source: 'partner',
      reservedCount: 0,
      image:
        'https://img.usecurling.com/p/600/400?q=' +
        (data.category || 'promotion'),
      coordinates: { lat: 0, lng: 0 },
      distance: 0,
      expiryDate: data.endDate,
      region: myCompany.region,
      currency: myCompany.region === 'US-FL' ? 'USD' : 'BRL',
    }

    addCoupon(newCoupon)
    toast.success(t('common.success'))
    setTimeout(() => {
      setIsDialogOpen(false)
      setGeneratedCode(null)
      reset()
    }, 2000)
  }

  const handleLoyaltyToggle = (checked: boolean) => {
    toggleLoyaltySystem(myCompany.id, checked)
  }

  const handleAddTrigger = () => {
    if (!selectedCouponId) return
    const newTrigger = {
      id: Math.random().toString(),
      type: triggerType,
      threshold: parseInt(triggerThreshold),
      reward: triggerReward,
      isActive: true,
    }

    // In a real app we would merge with existing, here we replace/add
    const coupon = coupons.find((c) => c.id === selectedCouponId)
    const existing = coupon?.behavioralTriggers || []
    updateBehavioralTriggers(selectedCouponId, [...existing, newTrigger])
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
            {t('vendor.dashboard')}
          </h1>
          <p className="text-muted-foreground">
            {myCompany.name} - {myCompany.region}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-md">
                <Plus className="h-4 w-4" /> {t('vendor.new_campaign')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('vendor.new_campaign')}</DialogTitle>
              </DialogHeader>
              {!generatedCode ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('vendor.title')}</Label>
                      <Input {...register('title')} required />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('coupon.discount')}</Label>
                      <Input {...register('discount')} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('vendor.validity')}</Label>
                    <Input type="date" {...register('endDate')} required />
                  </div>
                  <DialogFooter>
                    <Button type="submit">{t('common.save')}</Button>
                  </DialogFooter>
                </form>
              ) : (
                <div className="text-center py-8">
                  <QrCode className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-xl font-bold">{generatedCode}</h3>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <ScenarioCard
          title={t('vendor.qr_scanner')}
          icon={QrCode}
          value={t('vendor.scan_qr')}
        />
        <ScenarioCard
          title={t('vendor.barcode')}
          icon={Barcode}
          value={t('vendor.barcode')}
        />
        <ScenarioCard
          title={t('vendor.redemption_history')}
          icon={History}
          value="152"
        />
        <ScenarioCard
          title={t('vendor.active_campaigns')}
          icon={TrendingUp}
          value={coupons.length}
          color="text-green-500"
        />
        <ScenarioCard title={t('vendor.footfall')} icon={Scan} value="340/d" />
        <ScenarioCard
          title={t('vendor.ratings')}
          icon={Star}
          value="4.8"
          color="text-yellow-500"
        />
        <ScenarioCard
          title={t('vendor.store_profile')}
          icon={Settings}
          value={t('common.edit')}
        />
        <ScenarioCard
          title={t('vendor.inventory_alerts')}
          icon={Package}
          value="3 Low"
          color="text-red-500"
        />
        <ScenarioCard
          title={t('vendor.payouts')}
          icon={Coins}
          value={formatCurrency(
            1200,
            myCompany.region === 'US-FL' ? 'USD' : 'BRL',
          )}
        />
        <ScenarioCard
          title={t('vendor.scheduler')}
          icon={Calendar}
          value={t('vendor.scheduler')}
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t('vendor.overview')}</TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingBag className="h-3 w-3 mr-1" /> {t('vendor.orders')}
          </TabsTrigger>
          <TabsTrigger value="offers">{t('vendor.offers')}</TabsTrigger>
          <TabsTrigger value="behavioral">
            <Zap className="h-3 w-3 mr-1" /> {t('vendor.behavioral')}
          </TabsTrigger>
          <TabsTrigger value="validation">
            <Scan className="h-3 w-3 mr-1" /> {t('vendor.validation')}
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-3 w-3 mr-1" />{' '}
            {t('vendor.redemption_history')}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-3 w-3 mr-1" /> {t('vendor.settings')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <VendorAnalytics />
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>{t('vendor.incoming_orders')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myOrders.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        {t('vendor.no_orders')}
                      </TableCell>
                    </TableRow>
                  )}
                  {myOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{formatDate(order.date)}</TableCell>
                      <TableCell>{order.userName || 'Guest'}</TableCell>
                      <TableCell>
                        {order.storeName} - {order.guests} guests
                      </TableCell>
                      <TableCell>
                        <Badge>{order.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offers">
          <Card>
            <CardHeader>
              <CardTitle>{t('vendor.active_campaigns')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('vendor.title')}</TableHead>
                    <TableHead>{t('vendor.validity')}</TableHead>
                    <TableHead>{t('vendor.stock')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>{coupon.title}</TableCell>
                      <TableCell>{formatDate(coupon.expiryDate)}</TableCell>
                      <TableCell>
                        {coupon.reservedCount} / {coupon.totalAvailable}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavioral">
          <Card>
            <CardHeader>
              <CardTitle>{t('vendor.behavioral')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 border p-4 rounded-lg">
                  <h3 className="font-bold text-lg">
                    {t('vendor.add_trigger')}
                  </h3>
                  <div className="space-y-2">
                    <Label>{t('vendor.select_campaign')}</Label>
                    <Select
                      value={selectedCouponId}
                      onValueChange={setSelectedCouponId}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('vendor.select_campaign')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {coupons.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('vendor.trigger_type')}</Label>
                    <Select
                      value={triggerType}
                      onValueChange={(v: any) => setTriggerType(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visit">
                          {t('vendor.visits_count')}
                        </SelectItem>
                        <SelectItem value="share">
                          {t('vendor.social_share')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {triggerType === 'visit' && (
                    <div className="space-y-2">
                      <Label>{t('vendor.threshold_visits')}</Label>
                      <Input
                        type="number"
                        value={triggerThreshold}
                        onChange={(e) => setTriggerThreshold(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>{t('vendor.reward')}</Label>
                    <Input
                      placeholder="e.g. 20% OFF"
                      value={triggerReward}
                      onChange={(e) => setTriggerReward(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddTrigger} className="w-full">
                    {t('vendor.add_trigger')}
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg">
                    {t('vendor.active_triggers')}
                  </h3>
                  {coupons.flatMap((c) =>
                    (c.behavioralTriggers || []).map((t) => ({
                      ...t,
                      couponTitle: c.title,
                    })),
                  ).length === 0 && (
                    <p className="text-muted-foreground">
                      {t('vendor.no_triggers')}
                    </p>
                  )}
                  <div className="space-y-2">
                    {coupons
                      .flatMap((c) =>
                        (c.behavioralTriggers || []).map((t) => ({
                          ...t,
                          couponTitle: c.title,
                        })),
                      )
                      .map((trigger, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-3 border rounded bg-slate-50"
                        >
                          <div>
                            <p className="font-bold text-sm">
                              {trigger.couponTitle}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {trigger.type === 'visit'
                                ? `${t('vendor.visits_count')}: ${trigger.threshold}`
                                : t('vendor.social_share')}
                            </p>
                          </div>
                          <Badge>{trigger.reward}</Badge>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation">
          <CouponValidation />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>{t('vendor.redemption_history')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Coupon</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_VALIDATION_LOGS.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.validatedAt)}</TableCell>
                      <TableCell>{log.customerName}</TableCell>
                      <TableCell>{log.couponTitle}</TableCell>
                      <TableCell className="uppercase">{log.method}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>{t('vendor.operational')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    {t('vendor.loyalty')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('vendor.loyalty_desc')}
                  </p>
                </div>
                <Switch
                  checked={myCompany.enableLoyalty}
                  onCheckedChange={handleLoyaltyToggle}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
