import { RewardsDashboard } from '@/components/RewardsDashboard'
import { useLanguage } from '@/stores/LanguageContext'
import { Trophy } from 'lucide-react'

export default function Rewards() {
  const { t } = useLanguage()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-[#FF5722] p-3 rounded-xl shadow-lg shadow-[#FF5722]/20">
          <Trophy className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Minhas Recompensas
          </h1>
          <p className="text-muted-foreground">
            Acompanhe seus pontos e conquistas
          </p>
        </div>
      </div>

      <RewardsDashboard />
    </div>
  )
}
