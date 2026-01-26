import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Trophy,
  History,
  TrendingUp,
  Download,
  ArrowRightLeft,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

export function RewardsDashboard() {
  const { points, rewardHistory } = useCouponStore()
  const { t } = useLanguage()

  // Calculate next reward tier (mock logic)
  const nextTier = Math.ceil((points + 1) / 1000) * 1000
  const progress = (points % 1000) / 10

  const earnedTotal = rewardHistory
    .filter((a) => a.type === 'earned')
    .reduce((sum, a) => sum + a.points, 0)

  const importedTotal = rewardHistory
    .filter((a) => a.type === 'imported')
    .reduce((sum, a) => sum + a.points, 0)

  const redeemedTotal = rewardHistory
    .filter((a) => a.type === 'redeemed')
    .reduce((sum, a) => sum + Math.abs(a.points), 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-[#4CAF50] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#4CAF50]">
              <TrendingUp className="h-5 w-5" /> Ganhos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground mb-1">
              +{earnedTotal}
            </div>
            <p className="text-xs text-muted-foreground">
              Pontos acumulados na plataforma
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#2196F3] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#2196F3]">
              <ArrowRightLeft className="h-5 w-5" /> Importados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground mb-1">
              +{importedTotal}
            </div>
            <p className="text-xs text-muted-foreground">
              Vindos de apps parceiros (FETCH)
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#FF5722] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#FF5722]">
              <Download className="h-5 w-5" /> Resgatados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground mb-1">
              -{redeemedTotal}
            </div>
            <p className="text-xs text-muted-foreground">
              Usados em recompensas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-50 border-none shadow-inner">
        <CardContent className="pt-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Saldo Atual
              </p>
              <h2 className="text-4xl font-black text-primary">{points} pts</h2>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Próximo Nível: {nextTier} pts
              </p>
            </div>
          </div>
          <Progress value={progress} className="h-3 bg-slate-200" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />{' '}
            {t('rewards.history')}
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
                          : activity.type === 'imported'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-orange-100 text-orange-600'
                      }`}
                    >
                      {activity.type === 'imported' ? (
                        <ArrowRightLeft className="h-4 w-4" />
                      ) : (
                        <TrendingUp
                          className={`h-4 w-4 ${
                            activity.type === 'redeemed' ? 'rotate-180' : ''
                          }`}
                        />
                      )}
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
                      activity.type === 'redeemed'
                        ? 'text-red-500'
                        : activity.type === 'imported'
                          ? 'text-blue-500'
                          : 'text-green-500'
                    }`}
                  >
                    {activity.type !== 'redeemed' ? '+' : ''}
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
