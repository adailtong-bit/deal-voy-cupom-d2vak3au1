import { useState, useMemo } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { CATEGORIES } from '@/lib/data'

export function AdCampaignsTab() {
  const { ads, advertisers, adPricing, createAdCampaign } = useCouponStore()
  const [isOpen, setIsOpen] = useState(false)
  const { register, handleSubmit, reset, watch, setValue } = useForm()

  const watchPlacement = watch('placement')
  const watchDuration = watch('durationDays')
  const watchBudget = watch('budget')

  const availableRules = useMemo(() => {
    if (!watchPlacement) return []
    return adPricing.filter((p) => p.placement === watchPlacement)
  }, [watchPlacement, adPricing])

  const selectedRule = useMemo(() => {
    if (availableRules.length === 0) return null
    if (availableRules[0].billingType === 'fixed' && watchDuration) {
      return availableRules.find(
        (r) => r.durationDays === parseInt(watchDuration),
      )
    }
    return availableRules[0] // For CPC/CPA usually one rule per placement
  }, [availableRules, watchDuration])

  const calculatedPrice = useMemo(() => {
    if (!selectedRule) return 0
    if (selectedRule.billingType === 'fixed') return selectedRule.price
    // For CPC/CPA, the invoice amount is based on budget
    return watchBudget ? parseFloat(watchBudget) : 0
  }, [selectedRule, watchBudget])

  const onSubmit = (data: any) => {
    if (!selectedRule) return alert('Regra de preço não encontrada!')
    if (selectedRule.billingType !== 'fixed' && !data.budget)
      return alert('Orçamento obrigatório para campanhas de performance.')

    const adId = Math.random().toString()
    const now = new Date()
    const endDate = new Date()
    if (selectedRule.billingType === 'fixed') {
      endDate.setDate(now.getDate() + (selectedRule.durationDays || 30))
    } else {
      endDate.setDate(now.getDate() + 30) // Default 30 days for performance
    }

    const dueDate = new Date()
    dueDate.setDate(now.getDate() + 15)

    const refNumber = `INV-${now.getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    createAdCampaign(
      {
        id: adId,
        title: data.title,
        companyId: 'admin_created',
        advertiserId: data.advertiserId,
        region: 'Global',
        category: data.category || 'all',
        billingType: selectedRule.billingType,
        placement: data.placement,
        status: 'active',
        views: 0,
        clicks: 0,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        image: data.image,
        link: data.link,
        price:
          selectedRule.billingType === 'fixed' ? calculatedPrice : undefined,
        budget:
          selectedRule.billingType !== 'fixed'
            ? parseFloat(data.budget)
            : undefined,
        costPerClick:
          selectedRule.billingType === 'cpc' ? selectedRule.price : undefined,
        currency: 'BRL',
        durationDays: selectedRule.durationDays,
      },
      {
        id: Math.random().toString(),
        referenceNumber: refNumber,
        adId,
        advertiserId: data.advertiserId,
        amount: calculatedPrice,
        issueDate: now.toISOString(),
        dueDate: dueDate.toISOString(),
        status: 'draft',
      },
    )

    setIsOpen(false)
    reset()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Campanhas Ativas</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Criar Campanha</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Campanha</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Anunciante</Label>
                <Select
                  onValueChange={(v) => setValue('advertiserId', v)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o anunciante" />
                  </SelectTrigger>
                  <SelectContent>
                    {advertisers.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Título do Anúncio</Label>
                <Input {...register('title')} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Localização</Label>
                  <Select
                    onValueChange={(v) => setValue('placement', v)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Top Banner</SelectItem>
                      <SelectItem value="bottom">Bottom Banner</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="search">Search Results</SelectItem>
                      <SelectItem value="offer_of_the_day">
                        Offer of the Day
                      </SelectItem>
                      <SelectItem value="top_ranking">Top Ranking</SelectItem>
                      <SelectItem value="sponsored_push">
                        Sponsored Push
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Categoria Alvo</Label>
                  <Select
                    onValueChange={(v) => setValue('category', v)}
                    defaultValue="all"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Categorias</SelectItem>
                      {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {availableRules.length > 0 &&
                availableRules[0].billingType === 'fixed' && (
                  <div className="space-y-2">
                    <Label>Duração (Modelo Fixo)</Label>
                    <Select
                      onValueChange={(v) => setValue('durationDays', v)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRules.map((r) => (
                          <SelectItem
                            key={r.id}
                            value={r.durationDays?.toString() || ''}
                          >
                            {r.durationDays} dias - {formatCurrency(r.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

              {availableRules.length > 0 &&
                availableRules[0].billingType !== 'fixed' && (
                  <div className="space-y-2">
                    <Label>Orçamento (Budget Total)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register('budget')}
                      placeholder="Ex: 1000.00"
                    />
                    <p className="text-xs text-muted-foreground">
                      Taxa aplicada: {formatCurrency(availableRules[0].price)}{' '}
                      por {availableRules[0].billingType.toUpperCase()}
                    </p>
                  </div>
                )}

              <div className="p-4 bg-muted rounded-md text-center">
                <span className="text-sm text-muted-foreground block mb-1">
                  Valor a Faturar
                </span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(calculatedPrice, 'BRL')}
                </span>
              </div>
              <div className="space-y-2">
                <Label>Banner da Campanha</Label>
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const mockUrl = `https://img.usecurling.com/p/800/200?q=${encodeURIComponent(e.target.files[0].name.split('.')[0] || 'banner')}`
                        setValue('image', mockUrl)
                      }
                    }}
                  />
                  <span className="text-xs text-muted-foreground text-center">
                    ou cole a URL direta da imagem:
                  </span>
                  <Input
                    {...register('image')}
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Link de Destino (Redirect URL)</Label>
                <Input
                  {...register('link')}
                  placeholder="https://..."
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={calculatedPrice === 0}>
                  Salvar e Gerar Cobrança
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campanha</TableHead>
              <TableHead>Local / Modelo</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads.map((a) => {
              const adv = advertisers.find((ad) => ad.id === a.advertiserId)
              return (
                <TableRow key={a.id}>
                  <TableCell>
                    <span className="font-bold block">{a.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {adv?.companyName || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="capitalize">
                    {a.placement.replace(/_/g, ' ')}
                    <Badge variant="outline" className="ml-2 uppercase">
                      {a.billingType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      V: {a.views} | C: {a.clicks}
                    </div>
                    {a.budget && (
                      <div className="text-xs text-muted-foreground">
                        Budget: {formatCurrency(a.budget)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge>{a.status}</Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
