import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCouponStore } from '@/stores/CouponContext'
import { Coupon, TravelOffer } from '@/lib/types'
import {
  CreditCard,
  Lock,
  ArrowLeft,
  Coins,
  Smartphone,
  CheckCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { useLanguage } from '@/stores/LanguageContext'

export default function Checkout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { processPayment, fetchCredits, redeemPoints } = useCouponStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<
    'card' | 'fetch' | 'wallet'
  >('card')
  const [installments, setInstallments] = useState('1')
  const { t, formatCurrency } = useLanguage()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const item = (location.state?.coupon || location.state?.offer) as
    | Coupon
    | TravelOffer

  if (!item) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-xl mb-4">{t('checkout.no_item')}</h2>
        <Button onClick={() => navigate('/')}>{t('common.back')}</Button>
      </div>
    )
  }

  // Normalize item properties
  const price = item.price || 0
  const title = item.title
  const image = item.image
  const provider =
    'storeName' in item
      ? item.storeName
      : 'provider' in item
        ? item.provider
        : ''
  const isOffer = 'provider' in item

  const canAffordWithCredits = fetchCredits >= price
  const pointsToEarn = Math.floor(price)

  const onSubmit = async (data: any) => {
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      toast.error('Invalid email format')
      return
    }

    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (paymentMethod === 'fetch') {
      if (!redeemPoints(price, 'fetch')) {
        toast.error('Insufficient Balance')
        setIsProcessing(false)
        return
      }
    }

    try {
      await processPayment({
        couponId: item.id,
        amount: price,
        method: paymentMethod,
        installments: parseInt(installments),
      })
      setIsSuccess(true)
      toast.success(t('checkout.success'), {
        description: `Pagamento confirmado! Você ganhou +${pointsToEarn} pontos.`,
      })
      setTimeout(() => {
        if (isOffer) {
          navigate('/agencies')
        } else {
          navigate(`/coupon/${item.id}`)
        }
      }, 2500)
    } catch (error) {
      toast.error(t('common.error'))
      setIsProcessing(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh] text-center animate-in zoom-in">
        <div className="h-24 w-24 bg-[#4CAF50]/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="h-12 w-12 text-[#4CAF50]" />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-green-800">
          {t('checkout.success')}
        </h1>
        <p className="text-muted-foreground mb-4">
          Reserva confirmada para {title}
        </p>
        <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full font-bold">
          <Coins className="h-5 w-5" /> +{pointsToEarn} pontos ganhos!
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <Button
        variant="ghost"
        className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
        onClick={() => navigate(-1)}
        disabled={isProcessing}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.close')}
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {t('checkout.title')}
        </h1>
        <p className="text-muted-foreground flex items-center gap-1 text-sm mt-1">
          <Lock className="h-3 w-3 text-[#4CAF50]" /> {t('checkout.secure')}
        </p>
      </div>

      <Card className="mb-6 border-l-4 border-l-[#FF5722] shadow-sm">
        <CardContent className="p-4 flex gap-4">
          <img
            src={image}
            alt="Thumb"
            className="h-20 w-20 rounded-md object-cover"
          />
          <div className="flex-1">
            <h3 className="font-bold line-clamp-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{provider}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">
                {t('checkout.total')}
              </span>
              <span className="text-xl font-bold text-[#FF5722]">
                {formatCurrency(price)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-6 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-lg">{t('checkout.method')}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <RadioGroup
              defaultValue="card"
              onValueChange={(v) => setPaymentMethod(v as any)}
              className="space-y-4"
            >
              <div
                className={`flex items-start space-x-3 border p-4 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-[#FF5722] bg-[#FF5722]/5' : ''}`}
              >
                <RadioGroupItem value="card" id="card" className="mt-1" />
                <div className="flex-1">
                  <Label
                    htmlFor="card"
                    className="font-bold cursor-pointer flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" /> {t('checkout.card')}
                  </Label>
                  {paymentMethod === 'card' && (
                    <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <Label className="text-xs">
                          {t('checkout.card_number')}
                        </Label>
                        <Input
                          placeholder="0000 0000 0000 0000"
                          {...register('number')}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs">
                            {t('checkout.expiry')}
                          </Label>
                          <Input placeholder="MM/AA" {...register('expiry')} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">{t('checkout.cvc')}</Label>
                          <Input
                            placeholder="123"
                            type="password"
                            maxLength={4}
                            {...register('cvv')}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">{t('checkout.name')}</Label>
                        <Input placeholder="JOAO SILVA" {...register('name')} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Email</Label>
                        <Input
                          type="email"
                          placeholder="user@example.com"
                          {...register('email')}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">
                          {t('checkout.installments')}
                        </Label>
                        <Select
                          value={installments}
                          onValueChange={setInstallments}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="1x" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(
                              (i) => (
                                <SelectItem key={i} value={i.toString()}>
                                  {i}x {formatCurrency(price / i)}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`flex items-start space-x-3 border p-4 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'wallet' ? 'border-[#2196F3] bg-[#2196F3]/5' : ''}`}
              >
                <RadioGroupItem value="wallet" id="wallet" className="mt-1" />
                <div className="flex-1">
                  <Label
                    htmlFor="wallet"
                    className="font-bold cursor-pointer flex items-center gap-2"
                  >
                    <Smartphone className="h-4 w-4 text-blue-500" />{' '}
                    {t('checkout.wallet')}
                  </Label>
                </div>
              </div>

              <div
                className={`flex items-start space-x-3 border p-4 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'fetch' ? 'border-[#FF5722] bg-[#FF5722]/5' : ''}`}
              >
                <RadioGroupItem
                  value="fetch"
                  id="fetch"
                  className="mt-1"
                  disabled={!canAffordWithCredits}
                />
                <div className="flex-1 opacity-100">
                  <Label
                    htmlFor="fetch"
                    className="font-bold cursor-pointer flex items-center justify-between w-full"
                  >
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      <span>{t('checkout.fetch')}</span>
                    </div>
                    <span className="text-sm font-normal bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                      {formatCurrency(fetchCredits)}
                    </span>
                  </Label>
                  {!canAffordWithCredits && (
                    <p className="text-xs text-red-500 mt-1 font-medium">
                      Insufficient Balance
                    </p>
                  )}
                </div>
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter className="bg-muted/30 p-6 flex-col gap-2">
            <Button
              className="w-full h-14 text-lg font-bold shadow-md hover:shadow-lg transition-all bg-[#4CAF50] hover:bg-[#43A047]"
              type="submit"
              disabled={
                isProcessing ||
                (paymentMethod === 'fetch' && !canAffordWithCredits)
              }
            >
              {isProcessing
                ? 'Processing...'
                : `${t('checkout.pay')} ${formatCurrency(price)}`}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Ganhe {pointsToEarn} pontos com esta compra.
            </p>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
