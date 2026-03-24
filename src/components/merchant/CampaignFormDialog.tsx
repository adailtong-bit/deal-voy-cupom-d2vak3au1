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
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCouponStore } from '@/stores/CouponContext'
import { ImagePlus } from 'lucide-react'

const formSchema = z
  .object({
    title: z.string().min(3, 'Nome muito curto'),
    description: z.string().min(10, 'Descrição muito curta'),
    image: z.string().optional(),
    scope: z.enum(['network', 'specific']),
    specificStore: z.string().optional(),
    discountType: z.enum(['percentage', 'fixed_spend']),
    discountPercentage: z.string().optional(),
    minSpend: z.string().optional(),
    fixedDiscount: z.string().optional(),
    startDate: z.string().min(1, 'Data inicial obrigatória'),
    endDate: z.string().min(1, 'Data final obrigatória'),
    totalLimit: z.coerce.number().min(1, 'O limite deve ser maior que zero'),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'A data final deve ser posterior ou igual à inicial',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      if (data.scope === 'specific') {
        return !!data.specificStore && data.specificStore.trim().length > 0
      }
      return true
    },
    {
      message: 'Informe a loja específica',
      path: ['specificStore'],
    },
  )
  .refine(
    (data) => {
      if (data.discountType === 'percentage') {
        return (
          !!data.discountPercentage && data.discountPercentage.trim().length > 0
        )
      }
      return true
    },
    {
      message: 'Informe a porcentagem de desconto',
      path: ['discountPercentage'],
    },
  )
  .refine(
    (data) => {
      if (data.discountType === 'fixed_spend') {
        return !!data.minSpend && data.minSpend.trim().length > 0
      }
      return true
    },
    {
      message: 'Informe o valor mínimo de compra',
      path: ['minSpend'],
    },
  )
  .refine(
    (data) => {
      if (data.discountType === 'fixed_spend') {
        return !!data.fixedDiscount && data.fixedDiscount.trim().length > 0
      }
      return true
    },
    {
      message: 'Informe o valor de desconto',
      path: ['fixedDiscount'],
    },
  )

type FormData = z.infer<typeof formSchema>

function parseDiscountString(discountStr: string) {
  if (!discountStr)
    return { type: 'percentage', percentage: '', minSpend: '', fixed: '' }

  if (discountStr.toLowerCase().includes('gaste')) {
    const numbers = discountStr.match(/(\d+)/g)
    if (numbers && numbers.length >= 2) {
      return {
        type: 'fixed_spend',
        percentage: '',
        minSpend: numbers[0],
        fixed: numbers[1],
      }
    }
  }

  const match = discountStr.match(/(\d+)/)
  return {
    type: 'percentage',
    percentage: match ? match[1] : '',
    minSpend: '',
    fixed: '',
  }
}

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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      image: '',
      scope: 'network',
      specificStore: '',
      discountType: 'percentage',
      discountPercentage: '',
      minSpend: '',
      fixedDiscount: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      totalLimit: 100,
    },
  })

  const scope = form.watch('scope')
  const discountType = form.watch('discountType')

  useEffect(() => {
    if (coupon && open) {
      const pd = parseDiscountString(coupon.discount)
      form.reset({
        title: coupon.title,
        description: coupon.description,
        image: coupon.image || '',
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
        totalLimit: coupon.totalLimit || coupon.totalAvailable || 100,
      })
    } else if (open) {
      form.reset({
        title: '',
        description: '',
        image: '',
        scope: 'network',
        specificStore: '',
        discountType: 'percentage',
        discountPercentage: '',
        minSpend: '',
        fixedDiscount: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 86400000)
          .toISOString()
          .split('T')[0],
        totalLimit: 100,
      })
    }
  }, [coupon, open, form])

  const onSubmit = (data: FormData) => {
    const formattedDiscount =
      data.discountType === 'percentage'
        ? `${data.discountPercentage}% OFF`
        : `Gaste R$${data.minSpend}, ganhe R$${data.fixedDiscount} OFF`

    if (coupon) {
      updateCampaign(coupon.id, {
        title: data.title,
        description: data.description,
        discount: formattedDiscount,
        image: data.image || coupon.image,
        address: data.scope === 'specific' ? data.specificStore : '',
        startDate: data.startDate,
        endDate: data.endDate,
        totalLimit: data.totalLimit,
        totalAvailable: Math.max(
          0,
          data.totalLimit - (coupon.reservedCount || 0),
        ),
      })
    } else {
      const company = companies.find((c) => c.id === companyId)
      addCoupon({
        id: Math.random().toString(),
        companyId,
        storeName:
          data.scope === 'specific' && data.specificStore
            ? data.specificStore
            : company?.name || 'Store',
        title: data.title,
        description: data.description,
        discount: formattedDiscount,
        image: data.image || 'https://img.usecurling.com/p/400/300?q=sale',
        address: data.scope === 'specific' ? data.specificStore : '',
        startDate: data.startDate,
        endDate: data.endDate,
        totalLimit: data.totalLimit,
        totalAvailable: data.totalLimit,
        reservedCount: 0,
        category: 'Outros',
        distance: 0,
        code: `CMP-${Math.floor(Math.random() * 10000)}`,
        coordinates: { lat: 0, lng: 0 },
        status: 'active',
        source: 'partner',
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {coupon ? 'Editar Campanha' : 'Criar Nova Campanha'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 pt-2"
          >
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Detalhes Básicos
              </h3>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Campanha</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Oferta Especial de Verão"
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
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Detalhes da oferta..." {...field} />
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
                    <FormLabel className="flex items-center gap-2">
                      <ImagePlus className="w-4 h-4 text-slate-500" />
                      Imagem da Campanha
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <Input
                          type="file"
                          accept="image/*"
                          className="file:bg-slate-100 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-4 file:text-sm file:font-medium hover:file:bg-slate-200 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
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
                        {value && (
                          <div className="relative rounded-lg overflow-hidden border bg-slate-50 mt-2">
                            <img
                              src={value}
                              alt="Preview"
                              className="w-full h-40 object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Faça o upload de uma imagem específica para esta campanha,
                      separada do logo da empresa.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Abrangência & Desconto
              </h3>

              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Abrangência da Campanha</FormLabel>
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
                            Toda a Rede
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="specific" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Loja Específica
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
                      <FormLabel>Nome ou Endereço da Loja</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Unidade Centro..." {...field} />
                      </FormControl>
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
                    <FormLabel>Tipo de Desconto</FormLabel>
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
                            Porcentagem
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="fixed_spend" />
                          </FormControl>
                          <FormLabel className="font-semibold cursor-pointer">
                            Valor com Compra Mínima (Gate)
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
                      <FormLabel>Porcentagem de Desconto (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 15"
                          className="w-full sm:w-1/2"
                          {...field}
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
                      <FormItem>
                        <FormLabel>Valor Mínimo (Gaste R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 100"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fixedDiscount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desconto Fixo (Ganhe R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Limites & Prazos
              </h3>
              <FormField
                control={form.control}
                name="totalLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite Total de Utilizações</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início</FormLabel>
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
                      <FormLabel>Data de Término</FormLabel>
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
                Cancelar
              </Button>
              <Button type="submit">Salvar Campanha</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
