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
import { Percent, Plane, Wallet, Users, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { PlatformSettings } from '@/lib/types'

export function AdminMonetizationTab() {
  const { platformSettings, updatePlatformSettings } = useCouponStore()
  const [settings, setSettings] = useState<PlatformSettings>(platformSettings)

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
            <DollarSign className="h-6 w-6 text-green-600" /> Monetization &
            Financial Policies
          </CardTitle>
          <CardDescription>
            Configure global commission rates, cashback splits, subscription
            pricing, and referral rewards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="commission" className="w-full">
            <TabsList className="mb-6 w-full justify-start h-auto p-1 bg-slate-100 flex-wrap">
              <TabsTrigger value="commission" className="py-2 px-4">
                <Percent className="h-4 w-4 mr-2" /> Core Engine
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="py-2 px-4">
                <Users className="h-4 w-4 mr-2" /> Subscriptions
              </TabsTrigger>
              <TabsTrigger value="travel" className="py-2 px-4">
                <Plane className="h-4 w-4 mr-2" /> Travel Vertical
              </TabsTrigger>
              <TabsTrigger value="finance" className="py-2 px-4">
                <Wallet className="h-4 w-4 mr-2" /> Withdrawals & Referrals
              </TabsTrigger>
            </TabsList>

            <TabsContent value="commission" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                  <h3 className="font-bold text-lg">Global Commission Base</h3>
                  <div className="space-y-2">
                    <Label>Standard Platform Commission Rate (%)</Label>
                    <Input
                      type="number"
                      value={settings.commissionRate}
                      onChange={(e) =>
                        handleFlatChange('commissionRate', e.target.value)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Default rate charged to merchants per sale.
                    </p>
                  </div>
                </div>
                <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                  <h3 className="font-bold text-lg">Cashback Split</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>User Share (%)</Label>
                      <Input
                        type="number"
                        value={settings.cashbackSplitUser}
                        onChange={(e) =>
                          handleFlatChange('cashbackSplitUser', e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Platform Profit (%)</Label>
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
                    How the collected commission is divided. Must total 100%.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="subscriptions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 border rounded-lg border-blue-200 bg-blue-50/50">
                  <h3 className="font-bold text-lg text-blue-800">
                    Premium Tier
                  </h3>
                  <div className="space-y-2">
                    <Label>Monthly Price ($)</Label>
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
                      Benefits: 3-10% cashback, priority withdrawals.
                    </p>
                  </div>
                </div>
                <div className="space-y-4 p-4 border rounded-lg border-purple-200 bg-purple-50/50">
                  <h3 className="font-bold text-lg text-purple-800">
                    VIP / Traveler Tier
                  </h3>
                  <div className="space-y-2">
                    <Label>Monthly Price ($)</Label>
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
                      Benefits: Max cashback, early access, concierge.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="travel" className="space-y-4">
              <div className="p-4 border rounded-lg bg-slate-50">
                <h3 className="font-bold text-lg mb-4">
                  Travel Vertical Margins
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Set specific commission rates for high-value travel
                  categories. These override the global commission rate.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Hotels (%)</Label>
                    <Input
                      type="number"
                      value={settings.travelMargins.hotels}
                      onChange={(e) =>
                        handleChange('travelMargins', 'hotels', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Flights (%)</Label>
                    <Input
                      type="number"
                      value={settings.travelMargins.flights}
                      onChange={(e) =>
                        handleChange('travelMargins', 'flights', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Car Rentals (%)</Label>
                    <Input
                      type="number"
                      value={settings.travelMargins.cars}
                      onChange={(e) =>
                        handleChange('travelMargins', 'cars', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Insurance (%)</Label>
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
            </TabsContent>

            <TabsContent value="finance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                  <h3 className="font-bold text-lg">Withdrawal Rules</h3>
                  <div className="space-y-2">
                    <Label>Minimum Withdrawal Amount ($)</Label>
                    <Input
                      type="number"
                      value={settings.withdrawal.minAmount}
                      onChange={(e) =>
                        handleChange('withdrawal', 'minAmount', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instant Withdrawal Fee ($)</Label>
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
                  <h3 className="font-bold text-lg">Referral Program</h3>
                  <div className="space-y-2">
                    <Label>Fixed Reward on 1st Purchase ($)</Label>
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
                    <Label>Friend's Cashback Share (%)</Label>
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
                    <Label>Share Duration (Days)</Label>
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
            </TabsContent>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} size="lg">
                Save Configuration
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
