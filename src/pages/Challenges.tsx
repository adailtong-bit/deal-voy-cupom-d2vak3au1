import { useCouponStore } from '@/stores/CouponContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Trophy,
  Target,
  MapPin,
  Camera,
  Utensils,
  CheckCircle,
} from 'lucide-react'
import * as Icons from 'lucide-react'
import { toast } from 'sonner'
import { Challenge } from '@/lib/types'

export default function Challenges() {
  const { challenges, joinChallenge } = useCouponStore()

  // Helper to dynamically get icon component
  const getIcon = (iconName: string) => {
    // @ts-expect-error - Icons are dynamic
    const Icon = Icons[iconName] || Target
    return <Icon className="h-5 w-5" />
  }

  const activeChallenges = challenges.filter((c) => c.status === 'active')
  const completedChallenges = challenges.filter((c) => c.status === 'completed')
  const availableChallenges = challenges.filter((c) => c.status === 'available')

  const ChallengeCard = ({
    challenge,
    type,
  }: {
    challenge: Challenge
    type: 'active' | 'available' | 'completed'
  }) => (
    <Card className="mb-4 overflow-hidden border-l-4 border-l-primary">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="bg-muted/30 p-6 flex flex-col items-center justify-center min-w-[120px] gap-2 border-b sm:border-b-0 sm:border-r">
            <div
              className={`p-3 rounded-full ${type === 'completed' ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}
            >
              {type === 'completed' ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                getIcon(challenge.icon)
              )}
            </div>
            <span className="text-xs font-bold text-center">
              {challenge.reward}
            </span>
          </div>
          <div className="p-4 flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg">{challenge.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {challenge.description}
                </p>
              </div>
              {type === 'active' && <Badge>Em Progresso</Badge>}
              {type === 'completed' && (
                <Badge className="bg-green-600">Concluído</Badge>
              )}
              {type === 'available' && <Badge variant="outline">Novo</Badge>}
            </div>

            {type === 'active' && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Progresso</span>
                  <span>
                    {Math.round((challenge.current / challenge.total) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(challenge.current / challenge.total) * 100}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Faltam {challenge.total - challenge.current} ações para
                  completar
                </p>
              </div>
            )}

            {type === 'available' && (
              <Button
                className="w-full mt-4"
                onClick={() => joinChallenge(challenge.id)}
              >
                Aceitar Desafio
              </Button>
            )}

            {type === 'completed' && (
              <div className="mt-4 p-2 bg-green-50 text-green-800 text-sm rounded flex items-center gap-2">
                <Trophy className="h-4 w-4" /> Recompensa resgatada em{' '}
                {new Date().toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-yellow-100 p-3 rounded-xl text-yellow-700">
          <Trophy className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Desafios de Viagem</h1>
          <p className="text-muted-foreground">
            Complete missões, ganhe badges e recompensas exclusivas.
          </p>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="active">
            Ativos ({activeChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="available">
            Disponíveis ({availableChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Concluídos ({completedChallenges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 animate-in fade-in-50">
          {activeChallenges.length > 0 ? (
            activeChallenges.map((c) => (
              <ChallengeCard key={c.id} challenge={c} type="active" />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Você não tem desafios ativos no momento.</p>
              <Button
                variant="link"
                onClick={() =>
                  document.getElementById('available-tab')?.click()
                }
              >
                Ver disponíveis
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="available"
          className="space-y-4 animate-in fade-in-50"
        >
          {availableChallenges.map((c) => (
            <ChallengeCard key={c.id} challenge={c} type="available" />
          ))}
        </TabsContent>

        <TabsContent
          value="completed"
          className="space-y-4 animate-in fade-in-50"
        >
          {completedChallenges.map((c) => (
            <ChallengeCard key={c.id} challenge={c} type="completed" />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
