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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Plus, Target, Briefcase, QrCode, Settings, Coins } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { toast } from 'sonner'
import { VendorAnalytics } from '@/components/VendorAnalytics'

export default function VendorDashboard() {
  const { t } = useLanguage()
  const {
    user,
    companies,
    coupons: allCoupons,
    addCoupon,
    toggleLoyaltySystem,
  } = useCouponStore()

  // Assuming logged in user is merchant and has companyId
  const myCompany =
    companies.find((c) => c.id === user?.companyId) || companies[0] // Fallback for demo

  const [coupons, setCoupons] = useState(
    allCoupons
      .filter((c) => c.source !== 'aggregated' && c.companyId === myCompany.id)
      .slice(0, 5),
  )
  const { register, handleSubmit, reset } = useForm()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)

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
    }

    addCoupon(newCoupon)
    setCoupons([newCoupon, ...coupons])
    toast.success('Campanha criada!')
    setTimeout(() => {
      setIsDialogOpen(false)
      setGeneratedCode(null)
      reset()
    }, 2000)
  }

  const handleLoyaltyToggle = (checked: boolean) => {
    toggleLoyaltySystem(myCompany.id, checked)
  }

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
                <Plus className="h-4 w-4" /> Nova Campanha
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Campanha</DialogTitle>
              </DialogHeader>
              {!generatedCode ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Título</Label>
                      <Input {...register('title')} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Desconto</Label>
                      <Input {...register('discount')} required />
                    </div>
                  </div>
                  {/* ... other fields simplified for brevity */}
                  <div className="space-y-2">
                    <Label>Validade</Label>
                    <Input type="date" {...register('endDate')} required />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Lançar</Button>
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

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="offers">Ofertas</TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-3 w-3 mr-1" /> Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <VendorAnalytics />
        </TabsContent>

        <TabsContent value="offers">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Estoque</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>{coupon.title}</TableCell>
                      <TableCell>{coupon.expiryDate}</TableCell>
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

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Parâmetros Operacionais</CardTitle>
              <CardDescription>
                Controle custos e funcionalidades da sua loja no app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    Sistema de Pontos de Fidelidade
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir que clientes acumulem e resgatem pontos B2B em sua
                    loja. Desative para reduzir custos operacionais.
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
