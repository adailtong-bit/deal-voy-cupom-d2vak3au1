import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { ImagePlus, ExternalLink, Radar } from 'lucide-react'
import { CouponCard } from '@/components/CouponCard'
import { toast } from 'sonner'

const STORE_LOCATIONS = [
  'Matriz - Centro',
  'Filial - Zona Sul',
  'Filial - Zona Norte',
  'Shopping Cidade',
  'Unidade Express',
]

const formSchema = z
  .object({
    title: z.string().min(3, 'Campo obrigatório. Mínimo de 3 caracteres.'),
    description: z
      .string()
      .min(10, 'Campo obrigatório. Mínimo de 10 caracteres.'),
    instructions: z.string().optional(),
    image: z.string().optional(),
    companyUrl: z
      .string()
      .refine(
        (val) => {
          if (!val) return true
          try {
            new URL(val.startsWith('http') ? val : `https://${val}`)
            return true
          } catch {
            return false
          }
        },
        { message: 'Insira uma URL válida (ex: https://site.com)' },
      )
      .optional(),
    scope: z.enum(['network', 'specific']),
    specificStore: z.string().optional(),
    discountType: z.enum(['percentage', 'fixed_spend']),
    discountPercentage: z.string().optional(),
    minSpend: z.string().optional(),
    fixedDiscount: z.string().optional(),
    startDate: z.string().min(1, 'Campo obrigatório.'),
    endDate: z.string().min(1, 'Campo obrigatório.'),
    limitType: z.enum(['limited', 'unlimited']).default('limited'),
    totalLimit: z.coerce.number().optional(),
    enableProximityAlerts: z.boolean().default(false),
    alertRadius: z.coerce
      .number()
      .min(10, 'Mínimo de 10m')
      .max(5000, 'Máximo de 5000m')
      .optional(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'A data final deve ser posterior ou igual à inicial',
    path: ['endDate'],
  })
  .refine(
    (data) =>
      data.scope !== 'specific' ||
      (!!data.specificStore && data.specificStore.trim().length > 0),
    { message: 'Selecione uma loja específica', path: ['specificStore'] },
  )
  .refine(
    (data) =>
      data.discountType !== 'percentage' ||
      (!!data.discountPercentage && data.discountPercentage.trim().length > 0),
    { message: 'Valor inválido', path: ['discountPercentage'] },
  )
  .refine(
    (data) =>
      data.discountType !== 'fixed_spend' ||
      (!!data.minSpend && data.minSpend.trim().length > 0),
    { message: 'Valor inválido', path: ['minSpend'] },
  )
  .refine(
    (data) =>
      data.discountType !== 'fixed_spend' ||
      (!!data.fixedDiscount && data.fixedDiscount.trim().length > 0),
    { message: 'Valor inválido', path: ['fixedDiscount'] },
  )
  .refine(
    (data) =>
      data.limitType === 'unlimited' ||
      (data.totalLimit && data.totalLimit > 0),
    {
      message: 'O limite deve ser maior que zero.',
      path: ['totalLimit'],
    },
  )

type FormData = z.infer<typeof formSchema>

function parseDiscountString(discountStr: string) {
  if (!discountStr)
    return { type: 'percentage', percentage: '', minSpend: '', fixed: '' }

  if (discountStr.toLowerCase().includes('gaste')) {
    const parts = discountStr.toLowerCase().split('ganhe')
    if (parts.length >= 2) {
      const minSpendMatch = parts[0].match(/R\$\s*[\d.,]+/i)
      const fixedMatch = parts[1].match(/R\$\s*[\d.,]+/i)
      return {
        type: 'fixed_spend',
        percentage: '',
        minSpend: minSpendMatch ? minSpendMatch[0].toUpperCase() : '',
        fixed: fixedMatch ? fixedMatch[0].toUpperCase() : '',
      }
    }
  }

  const match = discountStr.match(/(\d+)%/)
  return {
    type: 'percentage',
    percentage: match ? `${match[1]}%` : '',
    minSpend: '',
    fixed: '',
  }
}

const CurrencyInput = ({ field, label, placeholder }: any) => (
  <FormItem>
    <FormLabel>{label}</FormLabel>
    <FormControl>
      <Input
        placeholder={placeholder}
        {...field}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, '')
          if (!raw) return field.onChange('')
          field.onChange(
            new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(parseFloat(raw) / 100),
          )
        }}
      />
    </FormControl>
    <FormMessage />
  </FormItem>
)

export function CampaignFormDialog({
  open,
  onOpenChange,
  coupon,
  companyId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  coupon?: any
  companyId: string
}) {
  const { addCoupon, updateCampaign, companies } = useCouponStore()
  const { t } = useLanguage()
  const company = companies.find((c) => c.id === companyId)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      instructions: '',
      image: '',
      companyUrl: '',
      scope: 'network',
      specificStore: '',
      discountType: 'percentage',
      discountPercentage: '',
      minSpend: '',
      fixedDiscount: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      limitType: 'limited',
      totalLimit: 100,
      enableProximityAlerts: false,
      alertRadius: 100,
    },
  })

  const scope = form.watch('scope')
  const discountType = form.watch('discountType')
  const limitType = form.watch('limitType')
  const watchedVals = form.watch()

  useEffect(() => {
    if (coupon && open) {
      const pd = parseDiscountString(coupon.discount)
      form.reset({
        title: coupon.title,
        description: coupon.description,
        instructions: coupon.instructions || '',
        image: coupon.image || '',
        companyUrl: coupon.externalUrl || '',
        scope: coupon.address ? 'specific' : 'network',
        specificStore: coupon.address || '',
        discountType: pd.type as any,
        discountPercentage: pd.percentage,
        minSpend: pd.minSpend,
        fixedDiscount: pd.fixed,
        startDate: coupon.startDate || new Date().toISOString().split('T')[0],
        endDate:
          coupon.endDate ||
          new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        limitType: coupon.isUnlimited ? 'unlimited' : 'limited',
        totalLimit: coupon.totalLimit || coupon.totalAvailable || 100,
        enableProximityAlerts: coupon.enableProximityAlerts || false,
        alertRadius: coupon.alertRadius || 100,
      })
    } else if (open) {
      form.reset()
    }
  }, [coupon, open, form])

  const onSubmit = (data: FormData) => {
    const formattedDiscount =
      data.discountType === 'percentage'
        ? `${data.discountPercentage} OFF`
        : `Gaste ${data.minSpend}, ganhe ${data.fixedDiscount} OFF`

    let finalUrl = data.companyUrl
    if (finalUrl && !finalUrl.startsWith('http')) {
      finalUrl = `https://${finalUrl}`
    }

    const isUnlimited = data.limitType === 'unlimited'
    const totalLimit = isUnlimited ? undefined : data.totalLimit

    if (coupon) {
      updateCampaign(coupon.id, {
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        discount: formattedDiscount,
        image: data.image || coupon.image,
        externalUrl: finalUrl || coupon.externalUrl,
        offerType: finalUrl ? 'online' : coupon.offerType || 'in-store',
        address: data.scope === 'specific' ? data.specificStore : '',
        startDate: data.startDate,
        endDate: data.endDate,
        totalLimit: totalLimit,
        isUnlimited: isUnlimited,
        totalAvailable: isUnlimited
          ? undefined
          : Math.max(0, (data.totalLimit || 100) - (coupon.reservedCount || 0)),
        enableProximityAlerts: data.enableProximityAlerts,
        alertRadius: data.enableProximityAlerts ? data.alertRadius : undefined,
      })
    } else {
      addCoupon({
        id: Math.random().toString(),
        companyId,
        storeName:
          data.scope === 'specific' && data.specificStore
            ? data.specificStore
            : company?.name || 'Loja',
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        discount: formattedDiscount,
        image: data.image || 'https://img.usecurling.com/p/400/300?q=sale',
        externalUrl: finalUrl,
        offerType: finalUrl ? 'online' : 'in-store',
        address: data.scope === 'specific' ? data.specificStore : '',
        startDate: data.startDate,
        endDate: data.endDate,
        totalLimit: totalLimit,
        isUnlimited: isUnlimited,
        totalAvailable: totalLimit,
        reservedCount: 0,
        category: 'Outros',
        distance: 0,
        code: `CMP-${Math.floor(Math.random() * 10000)}`,
        coordinates: { lat: -23.55052, lng: -46.633308 },
        status: 'active',
        source: 'partner',
        enableProximityAlerts: data.enableProximityAlerts,
        alertRadius: data.enableProximityAlerts ? data.alertRadius : undefined,
      })
    }
    onOpenChange(false)
  }

  const handleTestLink = () => {
    const urlStr = form.getValues('companyUrl')
    if (urlStr) {
      const finalUrl = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`
      try {
        new URL(finalUrl)
        window.open(finalUrl, '_blank')
      } catch {
        form.setError('companyUrl', { message: 'URL inválida.' })
        toast.error('URL inválida.')
      }
    }
  }

  const formattedPreviewDiscount =
    watchedVals.discountType === 'percentage'
      ? `${watchedVals.discountPercentage || '0%'} OFF`
      : `Gaste ${watchedVals.minSpend || 'R$ 0,00'}, ganhe ${watchedVals.fixedDiscount || 'R$ 0,00'} OFF`

  const previewCoupon = {
    id: 'preview',
    title:
      watchedVals.title || t('vendor.form.campaign_title', 'Nome da Campanha'),
    description:
      watchedVals.description ||
      t(
        'vendor.form.description',
        'A descrição da sua campanha aparecerá aqui.',
      ),
    instructions: watchedVals.instructions || '',
    storeName:
      watchedVals.scope === 'specific' && watchedVals.specificStore
        ? watchedVals.specificStore
        : company?.name || 'Nome da Empresa',
    image: watchedVals.image || 'https://img.usecurling.com/p/400/300?q=sale',
    discount: formattedDiscountPreview(watchedVals, formattedPreviewDiscount),
    distance: 50,
    expiryDate: watchedVals.endDate,
    category: 'Outros',
    code: 'PREVIEW',
    coordinates: { lat: 0, lng: 0 },
    status: 'active',
    offerType: watchedVals.companyUrl ? 'online' : 'in-store',
    externalUrl: watchedVals.companyUrl,
    source: 'partner',
    isUnlimited: watchedVals.limitType === 'unlimited',
  } as any

  function formattedDiscountPreview(vals: any, fallback: string) {
    if (vals.discountType === 'percentage' && !vals.discountPercentage)
      return '0% OFF'
    if (vals.discountType === 'fixed_spend' && !vals.minSpend)
      return 'Valor OFF'
    return fallback
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {coupon
              ? t('vendor.form.edit_title', 'Editar Campanha')
              : t('vendor.form.create_title', 'Criar Nova Campanha')}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('vendor.form.campaign_title', 'Nome da Campanha')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            'vendor.form.campaign_title',
                            'Nome da Campanha',
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('vendor.form.description', 'Descrição')}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t(
                            'vendor.form.description',
                            'A descrição da sua campanha aparecerá aqui.',
                          )}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('vendor.form.rules', 'Regras da Campanha')}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t(
                            'vendor.form.rules_placeholder',
                            'Descreva as condições, restrições e passo a passo para resgate...',
                          )}
                          className="resize-none min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('vendor.form.company_url', 'URL da Empresa')}
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            placeholder="ex: suaempresa.com.br"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleTestLink}
                            disabled={!field.value}
                            className="shrink-0 font-medium"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {t('vendor.form.test_link', 'Testar Link')}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem className="mt-4">
                      <FormLabel className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <ImagePlus className="w-4 h-4 text-slate-500" />
                          {t('vendor.form.image', 'Imagem da Campanha')}
                        </div>
                        <span className="text-xs text-slate-500 font-normal">
                          {t(
                            'vendor.form.image_desc',
                            'Recomendado: Proporção 16:9 (ex: 800x450px). Máx 2MB.',
                          )}
                        </span>
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            className="file:bg-slate-100 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-4 file:text-sm file:font-medium hover:file:bg-slate-200 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const MAX_SIZE = 2 * 1024 * 1024 // 2MB
                                const ALLOWED_TYPES = [
                                  'image/jpeg',
                                  'image/png',
                                  'image/jpg',
                                ]

                                if (!ALLOWED_TYPES.includes(file.type)) {
                                  form.setError('image', {
                                    type: 'manual',
                                    message:
                                      'Apenas arquivos .jpg, .jpeg e .png são permitidos.',
                                  })
                                  toast.error('Formato inválido.')
                                  return
                                }
                                if (file.size > MAX_SIZE) {
                                  form.setError('image', {
                                    type: 'manual',
                                    message:
                                      'O arquivo não pode ter mais de 2MB.',
                                  })
                                  toast.error('Arquivo muito grande.')
                                  return
                                }
                                form.clearErrors('image')

                                const reader = new FileReader()
                                reader.onloadend = () =>
                                  onChange(reader.result as string)
                                reader.readAsDataURL(file)
                              } else {
                                onChange('')
                              }
                            }}
                            {...fieldProps}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <FormField
                  control={form.control}
                  name="scope"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>
                        {t('vendor.form.scope', 'Abrangência')}
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col sm:flex-row gap-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="network" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {t('vendor.form.scope_network', 'Toda a Rede')}
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="specific" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {t(
                                'vendor.form.scope_specific',
                                'Loja Específica',
                              )}
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {scope === 'specific' && (
                  <FormField
                    control={form.control}
                    name="specificStore"
                    render={({ field }) => (
                      <FormItem className="animate-in fade-in slide-in-from-top-2">
                        <FormLabel>
                          {t('vendor.form.select_store', 'Selecione a Loja')}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t(
                                  'vendor.form.select_store',
                                  'Selecione a Loja',
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STORE_LOCATIONS.map((store) => (
                              <SelectItem key={store} value={store}>
                                {store}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="discountType"
                  render={({ field }) => (
                    <FormItem className="space-y-3 pt-2">
                      <FormLabel>
                        {t('vendor.form.discount_rules', 'Regras de Desconto')}
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(val) => {
                            field.onChange(val)
                            if (val === 'percentage') {
                              form.setValue('minSpend', '')
                              form.setValue('fixedDiscount', '')
                            } else {
                              form.setValue('discountPercentage', '')
                            }
                          }}
                          defaultValue={field.value}
                          className="flex flex-col gap-3 p-3 bg-slate-50 border rounded-lg"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="percentage" />
                            </FormControl>
                            <FormLabel className="font-semibold cursor-pointer">
                              {t('vendor.form.percentage', 'Percentual')}
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="fixed_spend" />
                            </FormControl>
                            <FormLabel className="font-semibold cursor-pointer">
                              {t(
                                'vendor.form.fixed_spend',
                                'Valor Fixo (Gaste e Ganhe)',
                              )}
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {discountType === 'percentage' && (
                  <FormField
                    control={form.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem className="animate-in fade-in slide-in-from-top-2 p-4 border rounded-lg bg-white">
                        <FormLabel>
                          {t(
                            'vendor.form.discount_percentage',
                            '% de Desconto',
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0%"
                            className="w-full sm:w-1/2"
                            {...field}
                            onChange={(e) => {
                              let raw = e.target.value.replace(/\D/g, '')
                              if (!raw) return field.onChange('')
                              if (parseInt(raw) > 100) raw = '100'
                              field.onChange(`${raw}%`)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {discountType === 'fixed_spend' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 p-4 border rounded-lg bg-white">
                    <FormField
                      control={form.control}
                      name="minSpend"
                      render={({ field }) => (
                        <CurrencyInput
                          field={field}
                          label={t(
                            'vendor.form.min_spend',
                            'Gaste (Valor Mínimo)',
                          )}
                          placeholder="R$ 0,00"
                        />
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fixedDiscount"
                      render={({ field }) => (
                        <CurrencyInput
                          field={field}
                          label={t(
                            'vendor.form.fixed_discount',
                            'Ganhe (Valor do Desconto)',
                          )}
                          placeholder="R$ 0,00"
                        />
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
                  <div className="flex items-center gap-2 text-blue-800 font-semibold">
                    <Radar className="w-5 h-5 text-blue-600" />
                    {t(
                      'vendor.form.proximity_alerts',
                      'Alertas de Proximidade (Geofencing)',
                    )}
                  </div>
                  <FormField
                    control={form.control}
                    name="enableProximityAlerts"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-blue-200 bg-white p-4 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base cursor-pointer">
                            {t(
                              'vendor.form.activate_radar',
                              'Ativar Radar para esta Campanha',
                            )}
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch('enableProximityAlerts') && (
                    <FormField
                      control={form.control}
                      name="alertRadius"
                      render={({ field }) => (
                        <FormItem className="animate-in fade-in slide-in-from-top-2 pt-2">
                          <FormLabel className="text-blue-900">
                            {t(
                              'vendor.form.alert_radius',
                              'Raio de Alerta (metros)',
                            )}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="bg-white border-blue-200 focus-visible:ring-blue-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <FormField
                  control={form.control}
                  name="limitType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>
                        {t('vendor.form.voucher_limit', 'Limite de Vouchers')}
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(val) => {
                            field.onChange(val)
                            if (val === 'unlimited') {
                              form.setValue('totalLimit', undefined)
                              form.clearErrors('totalLimit')
                            }
                          }}
                          defaultValue={field.value}
                          className="flex flex-col sm:flex-row gap-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="unlimited" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {t(
                                'vendor.form.unlimited',
                                'Sem Limite (Infinito)',
                              )}
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="limited" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {t('vendor.form.limited', 'Quantidade Limitada')}
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {limitType === 'limited' && (
                  <FormField
                    control={form.control}
                    name="totalLimit"
                    render={({ field }) => (
                      <FormItem className="animate-in fade-in slide-in-from-top-2">
                        <FormLabel>
                          {t(
                            'vendor.form.total_limit',
                            'Limite Total de Utilizações',
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('vendor.form.start_date', 'Data de Início')}
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('vendor.form.end_date', 'Data de Término')}
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {t('vendor.form.cancel', 'Cancelar')}
                </Button>
                <Button type="submit">
                  {coupon
                    ? t('vendor.form.save', 'Salvar Alterações')
                    : t('vendor.form.create', 'Criar Campanha')}
                </Button>
              </div>
            </form>
          </Form>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 hidden md:block relative h-full">
            <div className="sticky top-6">
              <h3 className="font-bold text-lg mb-4 text-slate-800 border-b border-slate-200 pb-2">
                {t('dashboard.your_campaigns', 'Suas Campanhas Ativas')} -{' '}
                {t('vendor.form.preview', 'Pré-visualização da Campanha')}
              </h3>
              <div className="max-w-[320px] mx-auto pointer-events-none mt-6">
                <CouponCard coupon={previewCoupon} />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
