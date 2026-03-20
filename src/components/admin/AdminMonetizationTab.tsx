import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Percent,
  Plane,
  Wallet,
  Users,
  DollarSign,
  Building,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { PlatformSettings } from '@/lib/types'
import { useLanguage } from '@/stores/LanguageContext'
import { PartnerPoliciesTab } from './PartnerPoliciesTab'
import { PartnerBillingTab } from './PartnerBillingTab'

export function AdminMonetizationTab() {
  const { platformSettings, updatePlatformSettings } = useCouponStore()
  const [settings, setSettings] = useState<PlatformSettings>(platformSettings)
  const { t } = useLanguage()

  const handleSave = () => {
    updatePlatformSettings(settings)
  }

  const handleChange = (
    category: keyof PlatformSettings,
    field: string,
    value: string,
  ) => {
    const numValue = parseFloat(value) || 0
    setSettings((prev: any) => {
      if (typeof prev[category] === 'object') {
        return {
          ...prev,
          [category]: { ...prev[category], [field]: numValue },
        }
      } else {
        return { ...prev, [category]: numValue }
      }
    })
  }

  const handleFlatChange = (field: keyof PlatformSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-600" />{' '}
            {t('admin.monetization_title')}
          </CardTitle>
          <CardDescription>{t('admin.monetization_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="commission" className="w-full">
            <TabsList className="mb-6 w-full justify-start h-auto p-1 bg-slate-100 flex-wrap">
              <TabsTrigger value="commission" className="py-2 px-4">
                <Percent className="h-4 w-4 mr-2" /> {t('admin.core_engine')}
              </TabsTrigger>
              <TabsTrigger value="partner_policies" className="py-2 px-4">
                <Building className="h-4 w-4 mr-2" />{' '}
                {t('admin.partner_policies')}
              </TabsTrigger>
              <TabsTrigger value="partner_billing" className="py-2 px-4">
                <FileText className="h-4 w-4 mr-2" /> {t('admin.b2b_billing')}
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="py-2 px-4">
                <Users className="h-4 w-4 mr-2" /> {t('admin.subscriptions')}
              </TabsTrigger>
              <TabsTrigger value="travel" className="py-2 px-4">
                <Plane className="h-4 w-4 mr-2" /> {t('admin.travel_vertical')}
              </TabsTrigger>
              <TabsTrigger value="finance" className="py-2 px-4">
                <Wallet className="h-4 w-4 mr-2" />{' '}
                {t('admin.finance_referrals')}
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="partner_policies"
              className="space-y-4 animate-in fade-in-50"
            >
              <PartnerPoliciesTab />
            </TabsContent>

            <TabsContent
              value="partner_billing"
              className="space-y-4 animate-in fade-in-50"
            >
              <PartnerBillingTab />
            </TabsContent>

            <TabsContent
              value="commission"
              className="space-y-4 animate-in fade-in-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                  <h3 className="font-bold text-lg">
                    {t('admin.global_commission')}
                  </h3>
                  <div className="space-y-2">
                    <Label>{t('admin.standard_commission')}</Label>
                    <Input
                      type="number"
                      value={settings.commissionRate}
                      onChange={(e) =>
                        handleFlatChange('commissionRate', e.target.value)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('admin.standard_commission_desc')}
                    </p>
                  </div>
                </div>
                <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                  <h3 className="font-bold text-lg">
                    {t('admin.cashback_split')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('admin.user_share')}</Label>
                      <Input
                        type="number"
                        value={settings.cashbackSplitUser}
                        onChange={(e) =>
                          handleFlatChange('cashbackSplitUser', e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('admin.platform_profit')}</Label>
                      <Input
                        type="number"
                        value={settings.cashbackSplitPlatform}
                        onChange={(e) =>
                          handleFlatChange(
                            'cashbackSplitPlatform',
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('admin.cashback_split_desc')}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} size="lg">
                  {t('admin.save_config')}
                </Button>
              </div>
            </TabsContent>

            <TabsContent
              value="subscriptions"
              className="space-y-4 animate-in fade-in-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 border rounded-lg border-blue-200 bg-blue-50/50">
                  <h3 className="font-bold text-lg text-blue-800">
                    {t('admin.premium_tier')}
                  </h3>
                  <div className="space-y-2">
                    <Label>{t('admin.monthly_price')}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.subscriptionPricing.premium}
                      onChange={(e) =>
                        handleChange(
                          'subscriptionPricing',
                          'premium',
                          e.target.value,
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('admin.premium_benefits_desc')}
                    </p>
                  </div>
                </div>
                <div className="space-y-4 p-4 border rounded-lg border-purple-200 bg-purple-50/50">
                  <h3 className="font-bold text-lg text-purple-800">
                    {t('admin.vip_tier')}
                  </h3>
                  <div className="space-y-2">
                    <Label>{t('admin.monthly_price')}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.subscriptionPricing.vip}
                      onChange={(e) =>
                        handleChange(
                          'subscriptionPricing',
                          'vip',
                          e.target.value,
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('admin.vip_benefits_desc')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} size="lg">
                  {t('admin.save_config')}
                </Button>
              </div>
            </TabsContent>

            <TabsContent
              value="travel"
              className="space-y-4 animate-in fade-in-50"
            >
              <div className="p-4 border rounded-lg bg-slate-50">
                <h3 className="font-bold text-lg mb-4">
                  {t('admin.travel_margins')}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('admin.travel_margins_desc')}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>{t('admin.hotels_margin')}</Label>
                    <Input
                      type="number"
                      value={settings.travelMargins.hotels}
                      onChange={(e) =>
                        handleChange('travelMargins', 'hotels', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin.flights_margin')}</Label>
                    <Input
                      type="number"
                      value={settings.travelMargins.flights}
                      onChange={(e) =>
                        handleChange('travelMargins', 'flights', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin.cars_margin')}</Label>
                    <Input
                      type="number"
                      value={settings.travelMargins.cars}
                      onChange={(e) =>
                        handleChange('travelMargins', 'cars', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin.insurance_margin')}</Label>
                    <Input
                      type="number"
                      value={settings.travelMargins.insurance}
                      onChange={(e) =>
                        handleChange(
                          'travelMargins',
                          'insurance',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} size="lg">
                  {t('admin.save_config')}
                </Button>
              </div>
            </TabsContent>

            <TabsContent
              value="finance"
              className="space-y-4 animate-in fade-in-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                  <h3 className="font-bold text-lg">
                    {t('admin.withdrawal_rules')}
                  </h3>
                  <div className="space-y-2">
                    <Label>{t('admin.min_withdrawal')}</Label>
                    <Input
                      type="number"
                      value={settings.withdrawal.minAmount}
                      onChange={(e) =>
                        handleChange('withdrawal', 'minAmount', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin.instant_fee')}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.withdrawal.instantFee}
                      onChange={(e) =>
                        handleChange('withdrawal', 'instantFee', e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                  <h3 className="font-bold text-lg">
                    {t('admin.referral_program')}
                  </h3>
                  <div className="space-y-2">
                    <Label>{t('admin.fixed_reward')}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.referral.fixedReward}
                      onChange={(e) =>
                        handleChange('referral', 'fixedReward', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin.friend_share')}</Label>
                    <Input
                      type="number"
                      value={settings.referral.friendCashbackPercentage}
                      onChange={(e) =>
                        handleChange(
                          'referral',
                          'friendCashbackPercentage',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin.share_duration')}</Label>
                    <Input
                      type="number"
                      value={settings.referral.durationDays}
                      onChange={(e) =>
                        handleChange('referral', 'durationDays', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} size="lg">
                  {t('admin.save_config')}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
