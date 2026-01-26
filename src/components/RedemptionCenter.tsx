import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/stores/LanguageContext'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Lock } from 'lucide-react'
import { toast } from 'sonner'

export function RedemptionCenter() {
  const { rewards, points, redeemPoints } = useCouponStore()
  const { t } = useLanguage()

  const handleRedeem = (rewardId: string, cost: number, title: string) => {
    if (redeemPoints(cost, 'points')) {
      toast.success(`${title} resgatado com sucesso!`, {
        description: 'Verifique seu email para mais detalhes.',
      })
    } else {
      toast.error('Saldo de pontos insuficiente.')
    }
  }

  return (
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
                {reward.cost} {t('rewards.cost')}
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
  )
}
