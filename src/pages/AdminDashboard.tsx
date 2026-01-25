import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Building2,
  Megaphone,
  BarChart3,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Settings,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VendorAnalytics } from '@/components/VendorAnalytics'
import { useForm } from 'react-hook-form'
import { Advertisement } from '@/lib/types'

export default function AdminDashboard() {
  const {
    user,
    companies,
    ads,
    coupons,
    approveCompany,
    rejectCompany,
    createAd,
    deleteAd,
    updateCampaign,
  } = useCouponStore()
  const navigate = useNavigate()
  const [isAdDialogOpen, setIsAdDialogOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p>Você precisa ser um administrador para ver esta página.</p>
        <Button onClick={() => navigate('/admin/login')}>Ir para Login</Button>
      </div>
    )
  }

  const onSubmitAd = (data: any) => {
    const newAd: Advertisement = {
      id: Math.random().toString(),
      companyId: 'admin-created',
      status: 'active',
      views: 0,
      clicks: 0,
      ...data,
    }
    createAd(newAd)
    setIsAdDialogOpen(false)
    reset()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard Global
          </h1>
          <p className="text-muted-foreground">
            Visão geral e administração do ecossistema Deal Voy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-white">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
            Sistema Operacional
          </Badge>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuários Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,345</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <BarChart3 className="h-3 w-3 mr-1" /> +15% vs mês anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Empresas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.filter((c) => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {companies.filter((c) => c.status === 'pending').length} pendentes
              de aprovação
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Ads (Mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.200</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <DollarSign className="h-3 w-3 mr-1" /> +8% vs mês anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cupons Resgatados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,902</div>
            <p className="text-xs text-muted-foreground mt-1">
              Taxa de conversão: 4.2%
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white border p-1 shadow-sm">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="ads">Publicidade</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas Globais</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <VendorAnalytics />
        </TabsContent>

        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" /> Gerenciamento de Empresas
              </CardTitle>
              <CardDescription>
                Aprove ou rejeite novos parceiros na plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Região</TableHead>
                    <TableHead>Data Registro</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        {company.name}
                      </TableCell>
                      <TableCell>{company.region}</TableCell>
                      <TableCell>
                        {new Date(
                          company.registrationDate,
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            company.status === 'active'
                              ? 'default'
                              : company.status === 'pending'
                                ? 'secondary'
                                : 'destructive'
                          }
                          className="capitalize"
                        >
                          {company.status === 'active'
                            ? 'Ativo'
                            : company.status === 'pending'
                              ? 'Pendente'
                              : 'Rejeitado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {company.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:bg-green-50"
                              onClick={() => approveCompany(company.id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => rejectCompany(company.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {company.status === 'active' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500"
                            onClick={() => rejectCompany(company.id)}
                          >
                            Bloquear
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5" /> Gestão de Anúncios
                </CardTitle>
                <CardDescription>
                  Anúncios ativos e configuração de faturamento.
                </CardDescription>
              </div>
              <Dialog open={isAdDialogOpen} onOpenChange={setIsAdDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4" /> Novo Anúncio
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Anúncio</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={handleSubmit(onSubmitAd)}
                    className="space-y-4 py-4"
                  >
                    <div className="space-y-2">
                      <Label>Título do Anúncio</Label>
                      <Input
                        {...register('title', { required: true })}
                        placeholder="Campanha de Verão"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Região Alvo</Label>
                        <Input
                          {...register('region', { required: true })}
                          placeholder="São Paulo, SP"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Input
                          {...register('category', { required: true })}
                          placeholder="Alimentação"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Modelo de Cobrança</Label>
                        <select
                          {...register('billingType')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="fixed">Preço Fixo</option>
                          <option value="ppc">Custo por Clique (PPC)</option>
                          <option value="ticketing">
                            Pay-per-Use / Ticket
                          </option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Posicionamento</Label>
                        <select
                          {...register('placement')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="home_hero">Home Hero</option>
                          <option value="sidebar">Barra Lateral</option>
                          <option value="feed">Feed de Cupons</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Início</Label>
                        <Input
                          type="date"
                          {...register('startDate', { required: true })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fim</Label>
                        <Input
                          type="date"
                          {...register('endDate', { required: true })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Criar Anúncio</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Views/Clicks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ads.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">{ad.title}</TableCell>
                      <TableCell className="uppercase text-xs font-bold text-muted-foreground">
                        {ad.billingType}
                      </TableCell>
                      <TableCell>{ad.placement}</TableCell>
                      <TableCell>
                        {ad.views} / {ad.clicks}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ad.status === 'active' ? 'default' : 'secondary'
                          }
                        >
                          {ad.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-red-50"
                          onClick={() => deleteAd(ad.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Campanhas Globais
              </CardTitle>
              <CardDescription>
                Monitore e edite todas as promoções ativas na plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Loja</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Validação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell
                        className="font-medium max-w-[200px] truncate"
                        title={coupon.title}
                      >
                        {coupon.title}
                      </TableCell>
                      <TableCell>{coupon.storeName}</TableCell>
                      <TableCell>
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {coupon.reservedCount || 0} /{' '}
                        {coupon.totalAvailable || '∞'}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                            >
                              Ver QR
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-sm flex flex-col items-center">
                            <DialogHeader>
                              <DialogTitle>Validação de Campanha</DialogTitle>
                            </DialogHeader>
                            <div className="p-4 bg-white rounded-lg border-2 border-dashed border-primary">
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${coupon.code}`}
                                alt="QR Code"
                                className="w-32 h-32"
                              />
                            </div>
                            <p className="font-mono font-bold text-lg mt-2 tracking-wider">
                              {coupon.code}
                            </p>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              Editar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Parâmetros</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Data de Validade</Label>
                                <Input
                                  type="date"
                                  defaultValue={coupon.expiryDate}
                                  onChange={(e) =>
                                    updateCampaign(coupon.id, {
                                      expiryDate: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Volume Máximo (Qtd. Cupons)</Label>
                                <Input
                                  type="number"
                                  defaultValue={coupon.totalAvailable}
                                  onChange={(e) =>
                                    updateCampaign(coupon.id, {
                                      totalAvailable: parseInt(e.target.value),
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() =>
                                  document.dispatchEvent(
                                    new KeyboardEvent('keydown', {
                                      key: 'Escape',
                                    }),
                                  )
                                }
                              >
                                Salvar Alterações
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
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
