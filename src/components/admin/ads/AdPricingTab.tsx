import { useState, useEffect } from 'react'
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
import { useLanguage } from '@/stores/LanguageContext'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'

export function AdPricingTab() {
  const [adPricing, setAdPricing] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, reset, watch, setValue } = useForm()
  const { t } = useLanguage()

  const watchBillingType = watch('billingType')

  const fetchPricing = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('ad_pricing')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) {
        setAdPricing(data)
      } else if (error && error.code === '42P01') {
        // Table doesn't exist yet, it's fine
        setAdPricing([])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPricing()
  }, [])

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const payload = {
        placement: data.placement,
        billing_type: data.billingType,
        duration_days:
          data.billingType === 'fixed' ? parseInt(data.durationDays) : null,
        price: parseFloat(data.price?.replace(/\D/g, '') || '0') / 100,
      }

      const { data: inserted, error } = await supabase
        .from('ad_pricing')
        .insert(payload)
        .select()
        .single()
      if (error) throw error

      setAdPricing((prev) => [inserted, ...prev])
      toast.success(
        t('ads.pricing_created', 'Regra de precificação criada com sucesso!'),
      )
      setIsOpen(false)
      reset()
    } catch (err: any) {
      toast.error(
        t('ads.pricing_error', 'Erro ao criar regra de precificação.'),
      )
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        t('common.confirm_delete', 'Tem certeza que deseja excluir?'),
      )
    )
      return
    try {
      const { error } = await supabase.from('ad_pricing').delete().eq('id', id)
      if (error) throw error
      setAdPricing((prev) => prev.filter((p) => p.id !== id))
      toast.success(t('common.deleted', 'Excluído com sucesso'))
    } catch (e) {
      console.error(e)
      toast.error(t('common.error', 'Ocorreu um erro'))
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('ads.pricing_table', 'Tabela de Preços')}</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>{t('ads.new_pricing_rule', 'Nova Regra')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('ads.add_pricing', 'Adicionar')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>{t('ads.location', 'Localização')}</Label>
                <Select
                  onValueChange={(v) => setValue('placement', v)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">
                      {t('ads.placement_top', 'Top Banner')}
                    </SelectItem>
                    <SelectItem value="bottom">
                      {t('ads.placement_bottom', 'Bottom Banner')}
                    </SelectItem>
                    <SelectItem value="sidebar">
                      {t('ads.placement_sidebar', 'Sidebar')}
                    </SelectItem>
                    <SelectItem value="search">
                      {t('ads.placement_search', 'Search Results')}
                    </SelectItem>
                    <SelectItem value="offer_of_the_day">
                      {t('ads.placement_offer_of_the_day', 'Offer of the Day')}
                    </SelectItem>
                    <SelectItem value="top_ranking">
                      {t('ads.placement_top_ranking', 'Top Ranking')}
                    </SelectItem>
                    <SelectItem value="sponsored_push">
                      {t('ads.placement_sponsored_push', 'Sponsored Push')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('ads.billing_model', 'Modelo de Cobrança')}</Label>
                <Select
                  onValueChange={(v) => setValue('billingType', v)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">
                      {t('ads.fixed_period', 'Período Fixo')}
                    </SelectItem>
                    <SelectItem value="cpc">{t('ads.cpc', 'CPC')}</SelectItem>
                    <SelectItem value="cpa">{t('ads.cpa', 'CPA')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {watchBillingType === 'fixed' && (
                <div className="space-y-2">
                  <Label>{t('ads.duration_days', 'Duração (Dias)')}</Label>
                  <Input
                    type="number"
                    {...register('durationDays')}
                    required={watchBillingType === 'fixed'}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>{t('ads.base_value', 'Valor Base')}</Label>
                <Input
                  placeholder="Ex: R$ 100,00"
                  value={watch('price') || ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '')
                    if (!raw) {
                      setValue('price', '')
                      return
                    }
                    const formatted = new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(parseFloat(raw) / 100)

                    setValue('price', formatted, { shouldValidate: true })
                  }}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {t('common.save')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('ads.location', 'Local')}</TableHead>
                <TableHead>{t('ads.model', 'Modelo')}</TableHead>
                <TableHead>{t('ads.duration', 'Duração')}</TableHead>
                <TableHead>{t('ads.price', 'Preço')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adPricing.map((p) => {
                const billingType = p.billing_type || p.billingType
                const durationDays = p.duration_days || p.durationDays
                return (
                  <TableRow key={p.id}>
                    <TableCell className="capitalize">
                      {t(
                        `ads.placement_${p.placement || 'unknown'}`,
                        (p.placement || '').replace(/_/g, ' '),
                      )}
                    </TableCell>
                    <TableCell className="uppercase">
                      {billingType || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {billingType === 'fixed'
                        ? `${durationDays || 0} ${t('ads.days', 'dias')}`
                        : t('ads.continuous', 'Contínuo')}
                    </TableCell>
                    <TableCell className="flex justify-between items-center">
                      <span>
                        {formatCurrency(p.price || 0, 'BRL')}{' '}
                        {billingType !== 'fixed' && `/ ${billingType || ''}`}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(p.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {adPricing.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    {t('ads.no_rules', 'Nenhuma regra')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
