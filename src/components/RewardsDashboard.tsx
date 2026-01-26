import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trophy, Gift, History, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function RewardsDashboard() {
  const { points, rewardHistory } = useCouponStore()

  // Calculate next reward tier (mock logic)
  const nextTier = Math.ceil((points + 1) / 1000) * 1000
  const progress = (points % 1000) / 10

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-[#FF5722] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#FF5722]">
              <Trophy className="h-5 w-5" /> Saldo de Pontos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-foreground mb-1">
              {points} pts
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Equivalente a aprox. R$ {(points / 100).toFixed(2)} em descontos
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Próximo Nível</span>
                <span>
                  {points} / {nextTier}
                </span>
              </div>
              <Progress value={progress} className="h-2 bg-[#FF5722]/10">
                <div
                  className="h-full bg-[#FF5722] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </Progress>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#2196F3]/10 to-transparent border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#2196F3]">
              <Gift className="h-5 w-5" /> Recompensas Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                <span className="text-sm font-medium">Cupom R$ 10 (Fetch)</span>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Resgatar
                </Button>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                <span className="text-sm font-medium">Fast Pass Premium</span>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Resgatar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" /> Histórico de
            Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {rewardHistory.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        activity.type === 'earned'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}
                    >
                      <TrendingUp
                        className={`h-4 w-4 ${
                          activity.type === 'redeemed' ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString()} às{' '}
                        {new Date(activity.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-bold ${
                      activity.type === 'earned'
                        ? 'text-[#4CAF50]'
                        : 'text-red-500'
                    }`}
                  >
                    {activity.points > 0 ? '+' : ''}
                    {activity.points}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
