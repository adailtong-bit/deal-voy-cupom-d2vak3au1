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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Plus,
  Users,
  Tag,
  BarChart as BarChartIcon,
  FlaskConical,
  Target,
  TrendingUp,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { toast } from 'sonner'
import { VendorAnalytics } from '@/components/VendorAnalytics'
import { TargetedOffers } from '@/components/TargetedOffers'
import { ABTestCreator } from '@/components/ABTestCreator'
import { ABTestResults } from '@/components/ABTestResults'

export default function VendorDashboard() {
  const { t } = useLanguage()
  const { abTests, coupons: allCoupons } = useCouponStore()
  const [coupons, setCoupons] = useState(allCoupons.slice(0, 3))
  const { register, handleSubmit, reset } = useForm()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isABCreatorOpen, setIsABCreatorOpen] = useState(false)

  const onSubmit = (data: any) => {
    const newCoupon = {
      id: Math.random().toString(),
      ...data,
      reservedCount: 0,
      image: 'https://img.usecurling.com/p/600/400?q=new%20offer',
      coordinates: { lat: 0, lng: 0 },
      distance: 0,
      expiryDate: new Date().toISOString(),
    }
    setCoupons([newCoupon, ...coupons])
    setIsDialogOpen(false)
    reset()
    toast.success('Cupom criado com sucesso!')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('vendor.dashboard')}
          </h1>
          <p className="text-muted-foreground">
            B2B Analytics & Growth Platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Target className="h-4 w-4" /> Segmentar
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Nova Campanha
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resgates Totais
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-accent flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +12% esse mês
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ROI Médio
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">340%</div>
            <p className="text-xs text-accent flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +5% vs mercado
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Novos Clientes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">450</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-400">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversão A/B
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">8.5%</div>
            <p className="text-xs text-accent">Teste #23 Vencendo</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="offers">Gerenciar Ofertas</TabsTrigger>
          <TabsTrigger
            value="abtesting"
            className="data-[state=active]:text-primary"
          >
            Testes A/B
          </TabsTrigger>
          <TabsTrigger value="marketing">Marketing Direto</TabsTrigger>
        </TabsList>

        <TabsContent
          value="overview"
          className="space-y-6 animate-in fade-in-50"
        >
          <VendorAnalytics />
        </TabsContent>

        <TabsContent value="offers">
          <div className="flex justify-end mb-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Criar Oferta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Oferta</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título da Oferta</Label>
                    <Input
                      {...register('title', { required: true })}
                      placeholder="Ex: 50% OFF"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome da Loja</Label>
                    <Input
                      {...register('storeName', { required: true })}
                      placeholder="Sua Loja"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Total Disponível</Label>
                      <Input
                        type="number"
                        {...register('totalAvailable', { required: true })}
                        placeholder="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Máx por Usuário</Label>
                      <Input
                        type="number"
                        {...register('maxPerUser', { required: true })}
                        placeholder="1"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Criar Oferta
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Suas Ofertas Ativas</CardTitle>
              <CardDescription>
                Gerencie estoque e status em tempo real.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-medium">
                        {coupon.title}
                      </TableCell>
                      <TableCell>{coupon.discount}</TableCell>
                      <TableCell>
                        {coupon.reservedCount || 0} /{' '}
                        {coupon.totalAvailable || '∞'}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-accent/20 text-accent-foreground border-transparent">
                          Ativo
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abtesting">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-muted/20 p-6 rounded-lg border">
              <div>
                <h2 className="text-xl font-bold">
                  Otimização de Ofertas (A/B)
                </h2>
                <p className="text-muted-foreground">
                  Compare imagens, títulos e descontos para maximizar
                  conversões.
                </p>
              </div>
              <Button
                onClick={() => setIsABCreatorOpen(true)}
                className="gap-2 bg-primary"
              >
                <FlaskConical className="h-4 w-4" /> Novo Experimento
              </Button>
            </div>

            {abTests.map((test) => (
              <ABTestResults key={test.id} test={test} />
            ))}

            <ABTestCreator
              isOpen={isABCreatorOpen}
              onClose={() => setIsABCreatorOpen(false)}
            />
          </div>
        </TabsContent>

        <TabsContent value="marketing">
          <TargetedOffers />
        </TabsContent>
      </Tabs>
    </div>
  )
}
