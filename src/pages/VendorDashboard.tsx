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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Users, Tag, BarChart } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { toast } from 'sonner'
import { MOCK_COUPONS } from '@/lib/data'

export default function VendorDashboard() {
  const { t } = useLanguage()
  const [coupons, setCoupons] = useState(MOCK_COUPONS.slice(0, 3)) // Simulating vendor's coupons
  const { register, handleSubmit, reset } = useForm()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
          <h1 className="text-3xl font-bold">{t('vendor.dashboard')}</h1>
          <p className="text-muted-foreground">
            Gerencie suas ofertas e acompanhe o desempenho.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> {t('vendor.add')}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cupons Ativos</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Hoje</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">
              +10% em relação a ontem
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conversão
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.5%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suas Ofertas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium">{coupon.title}</TableCell>
                  <TableCell>{coupon.discount}</TableCell>
                  <TableCell>
                    {coupon.reservedCount || 0} / {coupon.totalAvailable || '∞'}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-100 text-green-800">
                      Ativo
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
