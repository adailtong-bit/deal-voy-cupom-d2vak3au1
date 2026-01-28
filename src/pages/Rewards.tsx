import { RewardsDashboard } from '@/components/RewardsDashboard'
import { RedemptionCenter } from '@/components/RedemptionCenter'
import { ExternalRewardsHub } from '@/components/ExternalRewardsHub'
import { BirthdayGiftModal } from '@/components/BirthdayGiftModal'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Trophy,
  Gift,
  LayoutDashboard,
  Link2,
  Share2,
  UserPlus,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCouponStore } from '@/stores/CouponContext'
import { toast } from 'sonner'

export default function Rewards() {
  const { t } = useLanguage()
  const { earnPoints } = useCouponStore()

  const handleShare = () => {
    earnPoints(10, 'Social Share')
    toast.success('Shared on social media!')
  }

  const handleInvite = () => {
    earnPoints(50, 'Friend Referral')
    toast.success('Invite sent! You will earn points when they join.')
  }

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Invite Friends</h3>
              <p className="text-sm text-blue-700 mb-3">
                Earn 50 pts per friend
              </p>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleInvite}
              >
                <UserPlus className="h-4 w-4 mr-2" /> Invite Now
              </Button>
            </div>
            <div className="bg-white p-3 rounded-full">
              <UserPlus className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-100">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-purple-900 mb-1">
                Share on Social
              </h3>
              <p className="text-sm text-purple-700 mb-3">
                Earn 10 pts per share
              </p>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" /> Share App
              </Button>
            </div>
            <div className="bg-white p-3 rounded-full">
              <Share2 className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
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
