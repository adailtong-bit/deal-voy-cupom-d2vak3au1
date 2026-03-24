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
import { Button } from '@/components/ui/button'
import { useCouponStore } from '@/stores/CouponContext'

const formSchema = z
  .object({
    title: z.string().min(3, 'Nome muito curto'),
    description: z.string().min(10, 'Descrição muito curta'),
    discount: z.string().min(2, 'Informe o desconto'),
    startDate: z.string().min(1, 'Data inicial obrigatória'),
    endDate: z.string().min(1, 'Data final obrigatória'),
    totalLimit: z.coerce.number().min(1, 'O limite deve ser maior que zero'),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'A data final deve ser posterior ou igual à inicial',
    path: ['endDate'],
  })

type FormData = z.infer<typeof formSchema>

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
      discount: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      totalLimit: 100,
    },
  })

  useEffect(() => {
    if (coupon && open) {
      form.reset({
        title: coupon.title,
        description: coupon.description,
        discount: coupon.discount,
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
        discount: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 86400000)
          .toISOString()
          .split('T')[0],
        totalLimit: 100,
      })
    }
  }, [coupon, open, form])

  const onSubmit = (data: FormData) => {
    if (coupon) {
      updateCampaign(coupon.id, {
        ...data,
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
        storeName: company?.name || 'Store',
        ...data,
        totalLimit: data.totalLimit,
        totalAvailable: data.totalLimit,
        reservedCount: 0,
        category: 'Outros',
        distance: 0,
        image: 'https://img.usecurling.com/p/400/300?q=sale',
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {coupon ? 'Editar Campanha' : 'Criar Nova Campanha'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Campanha</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Black Friday 50% OFF" {...field} />
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desconto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 20% OFF, R$50..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite de Cupons</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
