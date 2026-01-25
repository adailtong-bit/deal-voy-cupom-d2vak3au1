import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useCouponStore } from '@/stores/CouponContext'
import { Coupon } from '@/lib/types'
import { CreditCard, Lock, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

export default function Checkout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { processPayment } = useCouponStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const coupon = location.state?.coupon as Coupon

  if (!coupon) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-xl mb-4">Nenhum item selecionado</h2>
        <Button onClick={() => navigate('/')}>Voltar ao Início</Button>
      </div>
    )
  }

  const onSubmit = async (data: any) => {
    setIsProcessing(true)
    try {
      await processPayment({ couponId: coupon.id, amount: coupon.price || 0 })
      toast.success('Pagamento aprovado!', {
        description: 'Recibo enviado para seu email.',
      })
      navigate(`/coupon/${coupon.id}`)
    } catch (error) {
      toast.error('Erro no pagamento. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Button
        variant="ghost"
        className="mb-4 pl-0"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Checkout Seguro</h1>
        <p className="text-muted-foreground flex items-center gap-1 text-sm">
          <Lock className="h-3 w-3" /> Seus dados estão criptografados
        </p>
      </div>

      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex gap-4">
          <img
            src={coupon.image}
            alt="Thumb"
            className="h-16 w-16 rounded object-cover"
          />
          <div>
            <h3 className="font-bold line-clamp-1">{coupon.title}</h3>
            <p className="text-sm text-muted-foreground">{coupon.storeName}</p>
            <p className="text-lg font-bold text-primary mt-1">
              R$ {coupon.price?.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pagamento</CardTitle>
          <CardDescription>Cartão de Crédito</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome no Cartão</Label>
              <Input
                placeholder="JOAO A SILVA"
                {...register('name', { required: true })}
              />
              {errors.name && (
                <span className="text-xs text-red-500">Obrigatório</span>
              )}
            </div>
            <div className="space-y-2">
              <Label>Número do Cartão</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="0000 0000 0000 0000"
                  {...register('number', { required: true })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Validade</Label>
                <Input
                  placeholder="MM/AA"
                  {...register('expiry', { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>CVV</Label>
                <Input
                  placeholder="123"
                  type="password"
                  maxLength={4}
                  {...register('cvv', { required: true })}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full h-12 text-lg"
              type="submit"
              disabled={isProcessing}
            >
              {isProcessing
                ? 'Processando...'
                : `Pagar R$ ${coupon.price?.toFixed(2)}`}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
