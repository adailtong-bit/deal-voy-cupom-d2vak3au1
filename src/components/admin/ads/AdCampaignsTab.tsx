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

export function AdCampaignsTab() {
  const { ads, advertisers, adPricing, createAdCampaign } = useCouponStore()
  const [isOpen, setIsOpen] = useState(false)
  const { register, handleSubmit, reset, watch, setValue } = useForm()

  const watchPlacement = watch('placement')
  const watchDuration = watch('durationDays')

  const availableDurations = useMemo(() => {
    if (!watchPlacement) return []
    return adPricing
      .filter((p) => p.placement === watchPlacement)
      .map((p) => p.durationDays)
  }, [watchPlacement, adPricing])

  const calculatedPrice = useMemo(() => {
    if (!watchPlacement || !watchDuration) return 0
    const rule = adPricing.find(
      (p) =>
        p.placement === watchPlacement &&
        p.durationDays === parseInt(watchDuration),
    )
    return rule ? rule.price : 0
  }, [watchPlacement, watchDuration, adPricing])

  const onSubmit = (data: any) => {
    if (calculatedPrice === 0) return alert('Regra de preço não encontrada!')

    const adId = Math.random().toString()
    const now = new Date()
    const endDate = new Date()
    endDate.setDate(now.getDate() + parseInt(data.durationDays))

    createAdCampaign(
      {
        id: adId,
        title: data.title,
        companyId: 'admin_created',
        advertiserId: data.advertiserId,
        region: 'Global',
        category: 'Outros',
        billingType: 'fixed',
        placement: data.placement,
        status: 'active',
        views: 0,
        clicks: 0,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        image: data.image,
        link: data.link,
        price: calculatedPrice,
        currency: 'BRL',
        durationDays: parseInt(data.durationDays),
      },
      {
        id: Math.random().toString(),
        adId,
        advertiserId: data.advertiserId,
        amount: calculatedPrice,
        issueDate: now.toISOString(),
        status: 'pending',
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
          <DialogContent className="max-h-[90vh] overflow-y-auto">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Local (Placement)</Label>
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
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duração</Label>
                  <Select
                    onValueChange={(v) => setValue('durationDays', v)}
                    disabled={!watchPlacement}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDurations.map((d) => (
                        <SelectItem key={d} value={d.toString()}>
                          {d} dias
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="p-4 bg-muted rounded-md text-center">
                <span className="text-sm text-muted-foreground block mb-1">
                  Custo Total (calculado)
                </span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(calculatedPrice, 'BRL')}
                </span>
              </div>
              <div className="space-y-2">
                <Label>URL da Imagem</Label>
                <Input
                  {...register('image')}
                  placeholder="https://..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Link de Destino</Label>
                <Input
                  {...register('link')}
                  placeholder="https://..."
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit">Salvar e Gerar Cobrança</Button>
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
              <TableHead>Anunciante</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads.map((a) => {
              const adv = advertisers.find((ad) => ad.id === a.advertiserId)
              return (
                <TableRow key={a.id}>
                  <TableCell className="font-bold">{a.title}</TableCell>
                  <TableCell>{adv?.companyName || 'N/A'}</TableCell>
                  <TableCell className="capitalize">{a.placement}</TableCell>
                  <TableCell>
                    {a.durationDays ? `${a.durationDays} dias` : 'N/A'}
                    <br />
                    <span className="text-xs text-muted-foreground">
                      Até {formatDate(a.endDate, 'pt-BR')}
                    </span>
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
