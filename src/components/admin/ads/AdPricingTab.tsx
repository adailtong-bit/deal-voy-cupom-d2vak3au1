import { useState } from 'react'
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
import { formatCurrency } from '@/lib/utils'
import { AdBillingType } from '@/lib/types'

export function AdPricingTab() {
  const { adPricing, addAdPricing } = useCouponStore()
  const [isOpen, setIsOpen] = useState(false)
  const { register, handleSubmit, reset, watch, setValue } = useForm()

  const watchBillingType = watch('billingType')

  const onSubmit = (data: any) => {
    addAdPricing({
      id: Math.random().toString(),
      placement: data.placement,
      billingType: data.billingType as AdBillingType,
      durationDays:
        data.billingType === 'fixed' ? parseInt(data.durationDays) : undefined,
      price: parseFloat(data.price),
    })
    setIsOpen(false)
    reset()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tabela de Preços</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Nova Regra de Preço</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Preço</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <Label>Modelo de Cobrança</Label>
                <Select
                  onValueChange={(v) => setValue('billingType', v)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixo (Por Período)</SelectItem>
                    <SelectItem value="cpc">CPC (Custo por Clique)</SelectItem>
                    <SelectItem value="cpa">
                      CPA (Custo por Venda/Ação)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {watchBillingType === 'fixed' && (
                <div className="space-y-2">
                  <Label>Duração (Dias)</Label>
                  <Input
                    type="number"
                    {...register('durationDays')}
                    required={watchBillingType === 'fixed'}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Valor Base (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('price')}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Local</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Preço</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adPricing.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="capitalize">
                  {p.placement.replace(/_/g, ' ')}
                </TableCell>
                <TableCell className="uppercase">{p.billingType}</TableCell>
                <TableCell>
                  {p.billingType === 'fixed'
                    ? `${p.durationDays} dias`
                    : 'Contínuo'}
                </TableCell>
                <TableCell>
                  {formatCurrency(p.price, 'BRL')}{' '}
                  {p.billingType !== 'fixed' && `/ ${p.billingType}`}
                </TableCell>
              </TableRow>
            ))}
            {adPricing.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  Nenhuma regra cadastrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
