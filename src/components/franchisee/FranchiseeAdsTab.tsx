import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DollarSign, Plus, Edit2, Trash2 } from 'lucide-react'
import { Advertisement } from '@/lib/types'

export function FranchiseeAdsTab({ franchiseId }: { franchiseId?: string }) {
  const {
    ads,
    createAd,
    updateAd,
    deleteAd,
    platformSettings,
    companies,
    franchises,
  } = useCouponStore()
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const searchQuery = (searchParams.get('q') || '').toLowerCase()

  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency } = useRegionFormatting(franchise?.region)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null)

  const [adFormData, setAdFormData] = useState<Partial<Advertisement>>({
    title: '',
    description: '',
    image: '',
    link: '',
    price: 0,
  })

  const royaltyRate = platformSettings.franchiseRoyaltyRate || 15

  const myAds = useMemo(() => {
    return ads
      .filter((a) => a.franchiseId === franchiseId)
      .filter((a) => {
        if (!searchQuery) return true
        return (
          a.title.toLowerCase().includes(searchQuery) ||
          (a.description && a.description.toLowerCase().includes(searchQuery))
        )
      })
  }, [ads, franchiseId, searchQuery])

  const totalRevenue = myAds.reduce(
    (sum, ad) => sum + (ad.price || ad.budget || 0),
    0,
  )
  const totalRoyalties = totalRevenue * (royaltyRate / 100)

  const handleOpenDialog = (ad?: Advertisement) => {
    if (ad) {
      setEditingAd(ad)
      setAdFormData({
        title: ad.title,
        description: ad.description || '',
        image: ad.image,
        link: ad.link,
        price: ad.price || ad.budget || 0,
      })
    } else {
      setEditingAd(null)
      setAdFormData({
        title: '',
        description: '',
        image: 'https://img.usecurling.com/p/800/400?q=ad',
        link: '',
        price: 0,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    const hqCompany = companies.find(
      (c) => c.franchiseId === franchiseId && c.name.includes('HQ'),
    )

    if (editingAd) {
      updateAd(editingAd.id, adFormData)
    } else {
      createAd({
        id: Math.random().toString(),
        title: adFormData.title || 'Novo Anúncio',
        description: adFormData.description,
        image: adFormData.image || '',
        link: adFormData.link || '',
        price: adFormData.price,
        franchiseId,
        companyId: hqCompany?.id || 'admin_created',
        region: franchise?.region || 'Regional',
        category: 'Outros',
        billingType: 'fixed',
        placement: 'sidebar',
        status: 'pending',
        views: 0,
        clicks: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      })
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6 animate-fade-in-up min-w-0 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-blue-500 min-w-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {t(
                'franchisee.ads.revenue',
                'Receita Total de Anúncios Regionais',
              )}
            </p>
            <h3 className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500 min-w-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {t(
                'franchisee.ads.royalties',
                'Royalties Devidos ({rate}%)',
              ).replace('{rate}', String(royaltyRate))}
            </p>
            <h3 className="text-2xl font-bold">
              {formatCurrency(totalRoyalties)}
            </h3>
          </CardContent>
        </Card>
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>
              {t('franchisee.ads.title', 'Publicidade Regional')}
            </CardTitle>
            <CardDescription>
              {t(
                'franchisee.ads.desc',
                'Crie e gerencie os anúncios exibidos exclusivamente na sua região.',
              )}
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            {t('franchisee.ads.create', 'Criar Anúncio')}
          </Button>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('franchisee.ads.ad', 'Anúncio')}</TableHead>
                <TableHead>{t('franchisee.ads.status', 'Status')}</TableHead>
                <TableHead>
                  {t('franchisee.ads.revenue_col', 'Receita')}
                </TableHead>
                <TableHead>
                  {t('franchisee.ads.royalties_col', 'Royalties')}
                </TableHead>
                <TableHead className="text-right">
                  {t('franchisee.ads.actions', 'Ações')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myAds.map((ad) => {
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
                        <div className="flex flex-col">
                          <span className="font-medium">{ad.title}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          ad.status === 'active' ? 'default' : 'secondary'
                        }
                        className="capitalize"
                      >
                        {ad.status === 'pending'
                          ? t('franchisee.ads.pending', 'Pendente')
                          : ad.status === 'active'
                            ? t('franchisee.ads.active', 'Ativo')
                            : ad.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(revenue)}
                    </TableCell>
                    <TableCell className="font-bold text-orange-600">
                      {formatCurrency(royalties)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(ad)}
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
              {myAds.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t(
                      'franchisee.ads.no_ads',
                      'Nenhum anúncio regional criado ainda.',
                    )}
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
            <DialogTitle>
              {editingAd
                ? t('franchisee.ads.edit', 'Editar Anúncio Regional')
                : t('franchisee.ads.create', 'Criar Anúncio Regional')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>
                {t('franchisee.ads.form_title', 'Título do Anúncio')}
              </Label>
              <Input
                value={adFormData.title}
                onChange={(e) =>
                  setAdFormData({ ...adFormData, title: e.target.value })
                }
                placeholder={t(
                  'franchisee.ads.form_title_ph',
                  'Ex: Super Promoção de Inverno',
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('franchisee.ads.form_desc', 'Descrição')}</Label>
              <Textarea
                value={adFormData.description}
                onChange={(e) =>
                  setAdFormData({ ...adFormData, description: e.target.value })
                }
                placeholder={t(
                  'franchisee.ads.form_desc_ph',
                  'Detalhes adicionais sobre o anúncio',
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('franchisee.ads.form_image', 'URL da Imagem')}</Label>
              <Input
                value={adFormData.image}
                onChange={(e) =>
                  setAdFormData({ ...adFormData, image: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t('franchisee.ads.form_link', 'URL de Destino (Link)')}
              </Label>
              <Input
                value={adFormData.link}
                onChange={(e) =>
                  setAdFormData({ ...adFormData, link: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t(
                  'franchisee.ads.form_revenue',
                  'Receita Esperada (Para cálculo de Royalties)',
                )}
              </Label>
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
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 mt-2">
              <p className="text-sm font-medium text-orange-800">
                {t('franchisee.ads.royalties_due', 'Royalties Devidos')}:{' '}
                {formatCurrency((adFormData.price || 0) * (royaltyRate / 100))}
              </p>
              <p className="text-xs text-orange-600 mt-1">
                {t(
                  'franchisee.ads.rate_applied',
                  'A taxa padrão aplicada é de {rate}%.',
                ).replace('{rate}', String(royaltyRate))}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('common.cancel', 'Cancelar')}
            </Button>
            <Button onClick={handleSave}>{t('common.save', 'Salvar')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
