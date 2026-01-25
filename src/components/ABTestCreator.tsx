import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { useCouponStore } from '@/stores/CouponContext'
import { toast } from 'sonner'
import { ABTest } from '@/lib/types'

interface ABTestCreatorProps {
  isOpen: boolean
  onClose: () => void
}

export function ABTestCreator({ isOpen, onClose }: ABTestCreatorProps) {
  const { coupons, addABTest } = useCouponStore()
  const { register, handleSubmit, reset, setValue } = useForm()
  const [selectedCoupon, setSelectedCoupon] = useState<string>('')

  const onSubmit = (data: any) => {
    const coupon = coupons.find((c) => c.id === selectedCoupon)
    if (!coupon) return

    const newTest: ABTest = {
      id: Math.random().toString(36).substr(2, 9),
      couponId: coupon.id,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      variantA: {
        id: 'A',
        name: 'Versão Original',
        title: coupon.title,
        discount: coupon.discount,
        image: coupon.image,
        views: 0,
        clicks: 0,
        redemptions: 0,
      },
      variantB: {
        id: 'B',
        name: data.variantName,
        title: data.variantTitle || coupon.title,
        discount: data.variantDiscount || coupon.discount,
        image:
          'https://img.usecurling.com/p/600/400?q=' +
          (data.variantImageQuery || 'offer'),
        views: 0,
        clicks: 0,
        redemptions: 0,
      },
    }

    addABTest(newTest)
    toast.success('Teste A/B iniciado com sucesso!')
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Teste A/B</DialogTitle>
          <DialogDescription>
            Defina uma variante para competir com sua oferta original.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Oferta Base (Controle)</Label>
            <Select onValueChange={setSelectedCoupon}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cupom" />
              </SelectTrigger>
              <SelectContent>
                {coupons.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border p-4 rounded-lg bg-muted/20 space-y-4">
            <h3 className="font-semibold text-sm">Variante B (Teste)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome da Variante</Label>
                <Input
                  {...register('variantName', { required: true })}
                  placeholder="Ex: Imagem Lifestyle"
                />
              </div>
              <div className="space-y-2">
                <Label>Novo Título (Opcional)</Label>
                <Input
                  {...register('variantTitle')}
                  placeholder="Título alternativo"
                />
              </div>
              <div className="space-y-2">
                <Label>Novo Desconto (Opcional)</Label>
                <Input
                  {...register('variantDiscount')}
                  placeholder="Ex: 50% OFF"
                />
              </div>
              <div className="space-y-2">
                <Label>Nova Imagem (Busca)</Label>
                <Input
                  {...register('variantImageQuery')}
                  placeholder="Ex: happy friends eating"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!selectedCoupon}>
              Iniciar Teste
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
