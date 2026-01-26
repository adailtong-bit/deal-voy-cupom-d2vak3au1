import { RewardsDashboard } from '@/components/RewardsDashboard'
import { RedemptionCenter } from '@/components/RedemptionCenter'
import { ExternalRewardsHub } from '@/components/ExternalRewardsHub'
import { BirthdayGiftModal } from '@/components/BirthdayGiftModal'
import { useLanguage } from '@/stores/LanguageContext'
import { Trophy, Gift, LayoutDashboard, Link2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Rewards() {
  const { t } = useLanguage()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BirthdayGiftModal />

      <div className="flex items-center gap-3 mb-8">
        <div className="bg-[#FF5722] p-3 rounded-xl shadow-lg shadow-[#FF5722]/20">
          <Trophy className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t('rewards.title')}
          </h1>
          <p className="text-muted-foreground">{t('rewards.subtitle')}</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="redeem" className="gap-2">
            <Gift className="h-4 w-4" /> {t('rewards.redeem')}
          </TabsTrigger>
          <TabsTrigger value="external" className="gap-2">
            <Link2 className="h-4 w-4" /> {t('rewards.external')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="animate-in fade-in-50">
          <RewardsDashboard />
        </TabsContent>

        <TabsContent value="redeem" className="animate-in fade-in-50">
          <RedemptionCenter />
        </TabsContent>

        <TabsContent value="external" className="animate-in fade-in-50">
          <ExternalRewardsHub />
        </TabsContent>
      </Tabs>
    </div>
  )
}
