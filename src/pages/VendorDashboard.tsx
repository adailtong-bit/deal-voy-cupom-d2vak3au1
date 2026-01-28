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
import { Textarea } from '@/components/ui/textarea'
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
import {
  Plus,
  Target,
  TrendingUp,
  Briefcase,
  QrCode,
  Calendar as CalendarIcon,
  MessageSquare,
  Send,
  FileBarChart,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { toast } from 'sonner'
import { VendorAnalytics } from '@/components/VendorAnalytics'
import { TargetedOffers } from '@/components/TargetedOffers'
import { ABTestCreator } from '@/components/ABTestCreator'
import { ABTestResults } from '@/components/ABTestResults'
import { MerchantReports } from '@/components/MerchantReports'

export default function VendorDashboard() {
  const { t } = useLanguage()
  const { abTests, coupons: allCoupons, addCoupon } = useCouponStore()
  const [coupons, setCoupons] = useState(
    allCoupons.filter((c) => c.source !== 'aggregated').slice(0, 3),
  )
  const { register, handleSubmit, reset } = useForm()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isABCreatorOpen, setIsABCreatorOpen] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)

  // Feedback form handling
  const {
    register: registerFeedback,
    handleSubmit: handleSubmitFeedback,
    reset: resetFeedback,
  } = useForm()

  const onSubmit = (data: any) => {
    // Generate unique code if not provided
    const code =
      data.code ||
      'CMP-' + Math.random().toString(36).substr(2, 6).toUpperCase()
    setGeneratedCode(code)

    const newCoupon = {
      id: Math.random().toString(),
      ...data,
      source: 'partner',
      reservedCount: 0,
      image:
        'https://img.usecurling.com/p/600/400?q=' +
        (data.category || 'promotion'),
      coordinates: { lat: 0, lng: 0 },
      distance: 0,
      expiryDate: data.endDate,
    }

    addCoupon(newCoupon)
    setCoupons([newCoupon, ...coupons])

    toast.success('Campanha criada com sucesso!')
    setTimeout(() => {
      setIsDialogOpen(false)
      setGeneratedCode(null)
      reset()
    }, 2000)
  }

  const onFeedbackSubmit = (data: any) => {
    // Mock sending feedback to admin
    console.log('Feedback sent:', data)
    toast.success('Feedback enviado aos administradores!', {
      description: 'Entraremos em contato em breve.',
    })
    resetFeedback()
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
            B2B Analytics & Campaign Management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Target className="h-4 w-4" /> Segmentar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-md">
                <Plus className="h-4 w-4" /> Nova Campanha
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-primary">
                  Criar Nova Campanha
                </DialogTitle>
              </DialogHeader>
              {!generatedCode ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Título da Campanha</Label>
                      <Input
                        {...register('title', { required: true })}
                        placeholder="Ex: Liquidação de Verão"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nome da Loja</Label>
                      <Input
                        {...register('storeName', { required: true })}
                        placeholder="Sua Marca"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição da Oferta</Label>
                    <Textarea
                      {...register('description', { required: true })}
                      placeholder="Detalhes da promoção, regras de uso..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Desconto (Texto)</Label>
                      <Input
                        {...register('discount', { required: true })}
                        placeholder="Ex: 50% OFF"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Input
                        {...register('category', { required: true })}
                        placeholder="Ex: Moda"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" /> Início
                      </Label>
                      <Input type="date" {...register('startDate')} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" /> Fim (Validade)
                      </Label>
                      <Input
                        type="date"
                        {...register('endDate', { required: true })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Volume (Qtd. Cupons)</Label>
                      <Input
                        type="number"
                        {...register('totalAvailable', { required: true })}
                        placeholder="Ex: 1000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Limite por Usuário</Label>
                      <Input
                        type="number"
                        {...register('maxPerUser')}
                        defaultValue={1}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="submit" className="w-full bg-primary text-lg">
                      Lançar Campanha
                    </Button>
                  </DialogFooter>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in zoom-in">
                  <div className="bg-green-100 p-4 rounded-full">
                    <QrCode className="h-16 w-16 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold">Campanha Ativa!</h3>
                  <p className="text-center text-muted-foreground">
                    Código de validação gerado automaticamente:
                  </p>
                  <div className="bg-slate-100 px-6 py-3 rounded-lg border-2 border-dashed border-primary">
                    <span className="text-2xl font-mono font-bold tracking-widest text-primary">
                      {generatedCode}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    O QR Code foi enviado para o email da empresa.
                  </p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Metric Cards */}
        <Card className="border-l-4 border-l-primary shadow-sm">
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
        <Card className="border-l-4 border-l-secondary shadow-sm">
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
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white p-1 shadow-sm border w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="reports">
            <FileBarChart className="h-3 w-3 mr-1" /> Relatórios
          </TabsTrigger>
          <TabsTrigger value="offers">Gerenciar Ofertas</TabsTrigger>
          <TabsTrigger value="abtesting">Testes A/B</TabsTrigger>
          <TabsTrigger value="marketing">Marketing Direto</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <VendorAnalytics />
        </TabsContent>

        <TabsContent value="reports">
          <MerchantReports />
        </TabsContent>

        <TabsContent value="offers">
          <Card>
            <CardHeader>
              <CardTitle>Suas Campanhas Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Validade</TableHead>
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
                      <TableCell>
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </TableCell>
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
                          Gerenciar
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
            {abTests.map((test) => (
              <ABTestResults key={test.id} test={test} />
            ))}
            <ABTestCreator
              isOpen={isABCreatorOpen}
              onClose={() => setIsABCreatorOpen(false)}
            />
            <Button
              onClick={() => setIsABCreatorOpen(true)}
              variant="outline"
              className="w-full border-dashed py-8"
            >
              + Criar Novo Teste
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="marketing">
          <TargetedOffers />
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" /> Canal de
                Feedback
              </CardTitle>
              <CardDescription>
                Envie sugestões, reporte problemas ou solicite suporte
                diretamente aos administradores da plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmitFeedback(onFeedbackSubmit)}
                className="space-y-4 max-w-lg"
              >
                <div className="space-y-2">
                  <Label>Assunto</Label>
                  <Input
                    {...registerFeedback('subject', { required: true })}
                    placeholder="Ex: Sugestão de nova funcionalidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Mensagem</Label>
                  <select
                    {...registerFeedback('type')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="suggestion">Sugestão</option>
                    <option value="support">Suporte Técnico</option>
                    <option value="bug">Reportar Erro</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Mensagem</Label>
                  <Textarea
                    {...registerFeedback('message', { required: true })}
                    placeholder="Descreva detalhadamente..."
                    className="min-h-[120px]"
                  />
                </div>
                <Button type="submit" className="gap-2">
                  <Send className="h-4 w-4" /> Enviar Mensagem
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
