import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/stores/LanguageContext'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Lock, Wallet, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export function RedemptionCenter() {
  const { rewards, points, redeemPoints, platformSettings, user } =
    useCouponStore()
  const { t, formatCurrency } = useLanguage()
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const handleRedeem = (rewardId: string, cost: number, title: string) => {
    if (redeemPoints(cost, 'points')) {
      toast.success(`${title} resgatado com sucesso!`, {
        description: 'Verifique seu email para mais detalhes.',
      })
    } else {
      toast.error('Saldo de pontos insuficiente.')
    }
  }

  // Cash value simulation: 100 points = $1.00
  const cashBalance = points / 100
  const minAmount = platformSettings?.withdrawal?.minAmount || 25
  const instantFee = platformSettings?.withdrawal?.instantFee || 1.5

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount < minAmount) {
      toast.error(
        `O valor mínimo para saque é ${formatCurrency(minAmount, 'USD')}`,
      )
      return
    }
    if (amount > cashBalance) {
      toast.error('Saldo insuficiente')
      return
    }

    const pointsToDeduct = amount * 100
    if (redeemPoints(pointsToDeduct, 'points')) {
      toast.success('Saque solicitado com sucesso!', {
        description: `Taxa instantânea de ${formatCurrency(instantFee, 'USD')} será aplicada.`,
      })
      setWithdrawOpen(false)
      setWithdrawAmount('')
    }
  }

  const isPremiumOrVip =
    user?.subscriptionTier === 'premium' || user?.subscriptionTier === 'vip'

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-emerald-900 mb-1 flex items-center gap-2">
                <Wallet className="h-6 w-6" /> Retirada de Cashback
              </h3>
              <p className="text-sm text-emerald-700">
                Converta seus pontos em dinheiro real. Saque mínimo de{' '}
                {formatCurrency(minAmount, 'USD')}.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase font-bold">
                  Saldo Convertido
                </p>
                <p className="text-2xl font-black text-emerald-600">
                  {formatCurrency(cashBalance, 'USD')}
                </p>
              </div>
              <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold h-12">
                    Sacar Agora
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Solicitar Saque</DialogTitle>
                    <DialogDescription>
                      Transfira seu saldo de cashback para sua conta bancária.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="bg-slate-50 p-4 rounded-lg flex justify-between border">
                      <span className="font-medium">Saldo Disponível</span>
                      <span className="font-bold text-emerald-600">
                        {formatCurrency(cashBalance, 'USD')}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Label>Valor do Saque</Label>
                      <Input
                        type="number"
                        placeholder={`Mínimo ${formatCurrency(minAmount, 'USD')}`}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                    </div>
                    <div className="text-sm space-y-1 text-muted-foreground border-t pt-4">
                      <div className="flex justify-between">
                        <span>Taxa de Saque Instantâneo</span>
                        <span>
                          {isPremiumOrVip
                            ? 'Grátis'
                            : formatCurrency(instantFee, 'USD')}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>Total a Receber</span>
                        <span>
                          {formatCurrency(
                            Math.max(
                              0,
                              parseFloat(withdrawAmount || '0') -
                                (isPremiumOrVip ? 0 : instantFee),
                            ),
                            'USD',
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleWithdraw}
                      disabled={
                        !withdrawAmount ||
                        parseFloat(withdrawAmount) < minAmount ||
                        parseFloat(withdrawAmount) > cashBalance
                      }
                      className="w-full"
                    >
                      Confirmar Transferência
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => {
          const canAfford = points >= reward.cost
          return (
            <Card key={reward.id} className="overflow-hidden flex flex-col">
              <div className="h-40 overflow-hidden relative">
                <img
                  src={reward.image}
                  alt={reward.title}
                  className={`w-full h-full object-cover transition-transform hover:scale-105 ${!canAfford ? 'grayscale' : ''}`}
                />
                <Badge className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm hover:bg-black/80">
                  {reward.category}
                </Badge>
              </div>
              <CardHeader className="pb-2">
                <h3 className="font-bold text-lg">{reward.title}</h3>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {reward.description}
                </p>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t p-4 bg-muted/20">
                <span className="font-bold text-primary text-lg">
                  {reward.cost} pts
                </span>
                <Button
                  onClick={() =>
                    handleRedeem(reward.id, reward.cost, reward.title)
                  }
                  disabled={!canAfford || !reward.available}
                  variant={canAfford ? 'default' : 'secondary'}
                  className="gap-2"
                >
                  {canAfford ? (
                    <>
                      <ShoppingBag className="h-4 w-4" />{' '}
                      {t('rewards.redeem_now')}
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" /> {t('rewards.redeem')}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
