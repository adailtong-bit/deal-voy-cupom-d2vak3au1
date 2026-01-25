import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Trophy, Medal, Target } from 'lucide-react'
import * as Icons from 'lucide-react'

export function GamificationSection() {
  const { challenges, badges, points } = useCouponStore()

  // Helper to dynamically get icon component
  const getIcon = (iconName: string) => {
    // @ts-expect-error - Icons are dynamic
    const Icon = Icons[iconName] || Target
    return <Icon className="h-5 w-5 text-primary" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Desafios & Conquistas
        </h2>
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold text-sm">
          {points} pts
        </span>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
          Desafios Ativos
        </h3>
        {challenges.map((challenge) => (
          <Card key={challenge.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getIcon(challenge.icon)}
                  </div>
                  <div>
                    <h4 className="font-bold">{challenge.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {challenge.description}
                    </p>
                  </div>
                </div>
                {challenge.completed ? (
                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
                    Completo
                  </span>
                ) : (
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                    {challenge.reward}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>Progresso</span>
                  <span>
                    {challenge.current} / {challenge.total}
                  </span>
                </div>
                <Progress
                  value={(challenge.current / challenge.total) * 100}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">
          Galeria de Medalhas
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="flex flex-col items-center text-center p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="relative mb-2">
                <img
                  src={badge.image}
                  alt={badge.name}
                  className="w-16 h-16 object-contain drop-shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1 border-2 border-white">
                  <Medal className="h-3 w-3 text-white" />
                </div>
              </div>
              <span className="font-bold text-sm">{badge.name}</span>
              <span className="text-[10px] text-muted-foreground">
                {badge.description}
              </span>
            </div>
          ))}
          <div className="flex flex-col items-center justify-center text-center p-2 rounded-lg border-2 border-dashed border-muted">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
              <Trophy className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <span className="font-medium text-sm text-muted-foreground">
              Em breve
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
