import { useState, useMemo } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, Edit2, Trash2 } from 'lucide-react'
import { Advertisement } from '@/lib/types'

export function AdminNetworkAdsTab() {
  const { ads, franchises, platformSettings, updateAd, deleteAd } =
    useCouponStore()
  const [filterFranchise, setFilterFranchise] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null)

  const [adFormData, setAdFormData] = useState<Partial<Advertisement>>({
    title: '',
    description: '',
    image: '',
    link: '',
    price: 0,
    status: 'active',
  })

  const royaltyRate = platformSettings.franchiseRoyaltyRate || 15

  const regionalAds = useMemo(() => {
    return ads.filter((a) => a.franchiseId)
  }, [ads])

  const filteredAds = useMemo(() => {
    if (filterFranchise === 'all') return regionalAds
    return regionalAds.filter((a) => a.franchiseId === filterFranchise)
  }, [regionalAds, filterFranchise])

  const totalRevenue = filteredAds.reduce(
    (sum, ad) => sum + (ad.price || ad.budget || 0),
    0,
  )
  const totalRoyalties = totalRevenue * (royaltyRate / 100)

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad)
    setAdFormData({
      title: ad.title,
      description: ad.description || '',
      image: ad.image,
      link: ad.link,
      price: ad.price || ad.budget || 0,
      status: ad.status,
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingAd) {
      updateAd(editingAd.id, adFormData)
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Receita Total de Anúncios Regionais
            </p>
            <h3 className="text-2xl font-bold">
              {formatCurrency(totalRevenue, 'BRL')}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Royalties Devidos/Pagos ({royaltyRate}%)
            </p>
            <h3 className="text-2xl font-bold">
              {formatCurrency(totalRoyalties, 'BRL')}
            </h3>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Publicidade de Rede</CardTitle>
            <CardDescription>
              Acompanhe anúncios gerados por franqueados e os respectivos
              royalties.
            </CardDescription>
          </div>
          <div className="w-full sm:w-64">
            <Select value={filterFranchise} onValueChange={setFilterFranchise}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Franquia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Franquias</SelectItem>
                {franchises.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Anúncio</TableHead>
                <TableHead>Franquia</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead>Royalties</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAds.map((ad) => {
                const franchise = franchises.find(
                  (f) => f.id === ad.franchiseId,
                )
                const revenue = ad.price || ad.budget || 0
                const royalties = revenue * (royaltyRate / 100)
                return (
                  <TableRow key={ad.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={ad.image}
                          alt={ad.title}
                          className="w-12 h-8 rounded object-cover"
                        />
                        <span className="font-medium block">{ad.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {franchise?.name || 'Desconhecida'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          ad.status === 'active' ? 'default' : 'secondary'
                        }
                        className="capitalize"
                      >
                        {ad.status === 'pending'
                          ? 'Pendente'
                          : ad.status === 'active'
                            ? 'Ativo'
                            : ad.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(revenue, 'BRL')}
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      {formatCurrency(royalties, 'BRL')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(ad)}
                      >
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAd(ad.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredAds.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum anúncio regional encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Anúncio Regional</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={adFormData.title}
                onChange={(e) =>
                  setAdFormData({ ...adFormData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={adFormData.description}
                onChange={(e) =>
                  setAdFormData({ ...adFormData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>URL da Imagem</Label>
              <Input
                value={adFormData.image}
                onChange={(e) =>
                  setAdFormData({ ...adFormData, image: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>URL de Destino (Link)</Label>
              <Input
                value={adFormData.link}
                onChange={(e) =>
                  setAdFormData({ ...adFormData, link: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Receita (Preço)</Label>
                <Input
                  type="number"
                  value={adFormData.price}
                  onChange={(e) =>
                    setAdFormData({
                      ...adFormData,
                      price: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={adFormData.status}
                  onValueChange={(v: any) =>
                    setAdFormData({ ...adFormData, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="paused">Pausado</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
