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
import { useLanguage } from '@/stores/LanguageContext'

export function AdPricingTab() {
  const { adPricing, addAdPricing } = useCouponStore()
  const [isOpen, setIsOpen] = useState(false)
  const { register, handleSubmit, reset, watch, setValue } = useForm()
  const { t } = useLanguage()

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
        <CardTitle>{t('ads.pricing_table')}</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>{t('ads.new_pricing_rule')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('ads.add_pricing')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>{t('ads.placement')}</Label>
                <Select
                  onValueChange={(v) => setValue('placement', v)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.select')} />
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
                <Label>{t('ads.billing_model')}</Label>
                <Select
                  onValueChange={(v) => setValue('billingType', v)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">
                      {t('ads.fixed_period')}
                    </SelectItem>
                    <SelectItem value="cpc">{t('ads.cpc')}</SelectItem>
                    <SelectItem value="cpa">{t('ads.cpa')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {watchBillingType === 'fixed' && (
                <div className="space-y-2">
                  <Label>{t('ads.duration_days')}</Label>
                  <Input
                    type="number"
                    {...register('durationDays')}
                    required={watchBillingType === 'fixed'}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>{t('ads.base_value')}</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('price')}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit">{t('common.save')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('ads.location')}</TableHead>
              <TableHead>{t('ads.model')}</TableHead>
              <TableHead>{t('ads.duration')}</TableHead>
              <TableHead>{t('ads.price')}</TableHead>
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
                    ? `${p.durationDays} ${t('ads.days')}`
                    : t('ads.continuous')}
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
                  {t('ads.no_rules')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
