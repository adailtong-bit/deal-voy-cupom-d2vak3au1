import { useState, useMemo, useEffect } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { CATEGORIES } from '@/lib/data'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, PlusCircle } from 'lucide-react'

export function AdCampaignsTab() {
  const {
    ads: storeAds = [],
    advertisers = [],
    createAdCampaign,
  } = useCouponStore() || {}

  const [dbAds, setDbAds] = useState<any[]>([])
  const [dbAdvertisers, setDbAdvertisers] = useState<any[]>([])
  const [adPricing, setAdPricing] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, reset, watch, setValue } = useForm()
  const { t } = useLanguage()
  const { formatCurrency, formatNumber } = useRegionFormatting()

  const watchPlacement = watch('placement')
  const watchDuration = watch('durationDays')
  const watchBudget = watch('budget')

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching ads from Supabase', error)
      } else if (data) {
        setDbAds(data)
      }

      const { data: advData } = await supabase
        .from('ad_advertisers')
        .select('*')
        .eq('status', 'active')

      if (advData) {
        setDbAdvertisers(advData)
      }

      const { data: pricingData } = await supabase
        .from('ad_pricing')
        .select('*')
        .order('created_at', { ascending: false })

      if (pricingData) {
        setAdPricing(
          pricingData.map((p) => ({
            id: p.id,
            placement: p.placement,
            billingType: p.billing_type,
            durationDays: p.duration_days,
            price: p.price,
          })),
        )
      }
    } catch (err) {
      console.error('Failed to load ads', err)
    } finally {
      setIsLoading(false)
    }
  }

  const allAdvertisers = useMemo(() => {
    const combined = [...advertisers]
    dbAdvertisers.forEach((da) => {
      if (!combined.find((c) => c.id === da.id)) {
        combined.push({
          id: da.id,
          companyName: da.company_name,
          contactName: da.contact_name,
          email: da.email,
          status: da.status,
        } as any)
      }
    })
    if (combined.length === 0) {
      combined.push({
        id: 'adv-internal',
        companyName: 'Routevoy (Parceiro Interno)',
        status: 'active',
      })
    }
    return combined
  }, [advertisers, dbAdvertisers])

  const availableRules = useMemo(() => {
    if (!watchPlacement || !Array.isArray(adPricing)) return []
    return adPricing.filter((p) => p.placement === watchPlacement)
  }, [watchPlacement, adPricing])

  const selectedRule = useMemo(() => {
    if (availableRules.length === 0) return null
    if (availableRules[0].billingType === 'fixed' && watchDuration) {
      return availableRules.find(
        (r) => r.durationDays === parseInt(watchDuration),
      )
    }
    return availableRules[0]
  }, [availableRules, watchDuration])

  const calculatedPrice = useMemo(() => {
    if (!selectedRule) return 0
    if (selectedRule.billingType === 'fixed') return selectedRule.price
    return watchBudget
      ? parseFloat(watchBudget.replace(/\D/g, '') || '0') / 100
      : 0
  }, [selectedRule, watchBudget])

  const displayAds = useMemo(() => {
    const dbIds = new Set(dbAds.map((a) => a.id))
    const uniqueStoreAds = storeAds.filter((a) => !dbIds.has(a.id))
    return [...dbAds, ...uniqueStoreAds]
  }, [dbAds, storeAds])

  const onSubmit = async (data: any) => {
    if (!selectedRule)
      return toast.error(
        t(
          'ads.no_rule_found',
          'Regra de precificação não encontrada. Por favor crie uma regra em "Pricing" primeiro.',
        ),
      )
    if (selectedRule.billingType !== 'fixed' && !data.budget)
      return toast.error(
        t(
          'ads.budget_required',
          'Orçamento total é obrigatório para este modelo.',
        ),
      )

    setIsSubmitting(true)
    try {
      const now = new Date()
      const endDate = new Date()
      if (selectedRule.billingType === 'fixed') {
        endDate.setDate(now.getDate() + (selectedRule.durationDays || 30))
      } else {
        endDate.setDate(now.getDate() + 30)
      }

      const dbPayload = {
        title: data.title,
        company_id: 'admin_created',
        advertiser_id: data.advertiserId,
        region: 'Global',
        category: data.category || 'all',
        billing_type: selectedRule.billingType,
        placement: data.placement,
        status: 'active',
        views: 0,
        clicks: 0,
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        image: data.image,
        link: data.link,
        price: selectedRule.billingType === 'fixed' ? calculatedPrice : null,
        budget:
          selectedRule.billingType !== 'fixed'
            ? parseFloat(data.budget?.replace(/\D/g, '') || '0') / 100
            : null,
        cost_per_click:
          selectedRule.billingType === 'cpc' ? selectedRule.price : null,
        currency: 'BRL',
        duration_days: selectedRule.durationDays,
      }

      const { data: insertedData, error } = await supabase
        .from('ad_campaigns')
        .insert(dbPayload)
        .select()
        .single()

      if (error) throw error

      setDbAds((prev) => [insertedData, ...prev])

      const adId = insertedData.id
      const dueDate = new Date()
      dueDate.setDate(now.getDate() + 15)
      const refNumber = `INV-${now.getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

      if (createAdCampaign) {
        try {
          createAdCampaign(
            { ...dbPayload, id: adId },
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
        } catch (e) {
          console.warn('Store ad creation failed, but db succeeded', e)
        }
      }

      toast.success(
        t('ads.campaign_created', 'Campanha de ADS criada com sucesso!'),
      )
      reset()
    } catch (err: any) {
      console.error('Error creating ad campaign:', err)
      toast.error(
        t('ads.create_error', 'Erro ao criar campanha. Tente novamente.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1">
        <Card className="border-primary/20 shadow-sm sticky top-4">
          <CardHeader className="bg-slate-50/50 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <PlusCircle className="w-5 h-5" />
              {t('ads.new_campaign', 'Criar Nova Campanha')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>{t('ads.advertiser', 'Anunciante')}</Label>
                <Select
                  onValueChange={(v) => setValue('advertiserId', v)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'ads.select_advertiser',
                        'Selecione o anunciante',
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {allAdvertisers.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('ads.ad_title', 'Título do Anúncio')}</Label>
                <Input {...register('title')} required />
              </div>

              <div className="space-y-2">
                <Label>{t('ads.location', 'Localização (Placement)')}</Label>
                <Select
                  onValueChange={(v) => setValue('placement', v)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('common.select', 'Selecione')}
                    />
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
                <Label>{t('ads.target_category', 'Categoria Alvo')}</Label>
                <Select
                  onValueChange={(v) => setValue('category', v)}
                  defaultValue="all"
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('category.all', 'Todas as Categorias')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t('category.all', 'Todas as Categorias')}
                    </SelectItem>
                    {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {availableRules.length > 0 &&
                availableRules[0].billingType === 'fixed' && (
                  <div className="space-y-2">
                    <Label>{t('ads.fixed_duration', 'Duração Fixa')}</Label>
                    <Select
                      onValueChange={(v) => setValue('durationDays', v)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('common.select', 'Selecione')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRules.map((r) => (
                          <SelectItem
                            key={r.id}
                            value={r.durationDays?.toString() || ''}
                          >
                            {r.durationDays} {t('ads.days', 'dias')} -{' '}
                            {formatCurrency(r.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

              {availableRules.length > 0 &&
                availableRules[0].billingType !== 'fixed' && (
                  <div className="space-y-2">
                    <Label>{t('ads.total_budget', 'Orçamento Total')}</Label>
                    <Input
                      placeholder="Ex: R$ 1.000,00"
                      value={watchBudget || ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '')
                        if (!raw) {
                          setValue('budget', '')
                          return
                        }
                        const formatted = new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(parseFloat(raw) / 100)

                        setValue('budget', formatted, { shouldValidate: true })
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('ads.applied_rate', 'Taxa Aplicada:')}{' '}
                      {formatCurrency(availableRules[0].price || 0)}{' '}
                      {t('ads.per', 'por')}{' '}
                      {availableRules[0].billingType?.toUpperCase() || ''}
                    </p>
                  </div>
                )}

              <div className="p-4 bg-muted/50 rounded-lg text-center border border-dashed border-slate-200">
                <span className="text-sm text-muted-foreground block mb-1">
                  {t('ads.amount_to_bill', 'Valor a Faturar')}
                </span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(calculatedPrice)}
                </span>
              </div>

              <div className="space-y-2">
                <Label>{t('ads.campaign_banner', 'Banner da Campanha')}</Label>
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
                    {t('ads.paste_image_url', 'Ou cole a URL da imagem')}
                  </span>
                  <Input
                    {...register('image')}
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  {t('ads.redirect_url', 'URL de Redirecionamento')}
                </Label>
                <Input
                  {...register('link')}
                  placeholder="https://..."
                  required
                />
              </div>

              <Button
                className="w-full font-bold"
                type="submit"
                disabled={calculatedPrice === 0 || isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {t('ads.save_generate_billing', 'Salvar e Gerar Fatura')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="xl:col-span-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>
              {t('ads.active_campaigns', 'Campanhas Ativas')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>{t('ads.campaign', 'Campanha')}</TableHead>
                      <TableHead>
                        {t('ads.location_model', 'Local & Modelo')}
                      </TableHead>
                      <TableHead>
                        {t('ads.performance', 'Performance')}
                      </TableHead>
                      <TableHead>{t('admin.status', 'Status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayAds.map((a) => {
                      const advertiserId = a.advertiser_id || a.advertiserId
                      const adv = allAdvertisers.find(
                        (ad) => ad.id === advertiserId,
                      )
                      const billingType = a.billing_type || a.billingType

                      return (
                        <TableRow key={a.id}>
                          <TableCell>
                            <span className="font-bold block">{a.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {adv?.companyName || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell className="capitalize">
                            {t(
                              `ads.placement_${a.placement || 'unknown'}`,
                              (a.placement || '').replace(/_/g, ' '),
                            )}
                            <Badge variant="outline" className="ml-2 uppercase">
                              {billingType || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {t('ads.views_abbr', 'V')}:{' '}
                              {formatNumber(a.views || 0)} |{' '}
                              {t('ads.clicks_abbr', 'C')}:{' '}
                              {formatNumber(a.clicks || 0)}
                            </div>
                            {a.budget && (
                              <div className="text-xs text-muted-foreground">
                                {t('ads.budget', 'Budget')}:{' '}
                                {formatCurrency(Number(a.budget) || 0)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200">
                              {a.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {displayAds.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground py-12"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span className="text-lg font-medium">
                              {t(
                                'ads.no_rule_found',
                                'Nenhuma campanha encontrada.',
                              )}
                            </span>
                            <span className="text-sm">
                              Utilize o formulário ao lado para criar a primeira
                              campanha.
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
