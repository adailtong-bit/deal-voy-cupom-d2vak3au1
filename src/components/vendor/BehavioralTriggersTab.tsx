import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { Coupon } from '@/lib/types'

export function BehavioralTriggersTab({ coupons }: { coupons: Coupon[] }) {
  const { t } = useLanguage()
  const { updateBehavioralTriggers } = useCouponStore()
  const [selectedCouponId, setSelectedCouponId] = useState<string>(
    coupons[0]?.id || '',
  )
  const [triggerType, setTriggerType] = useState<'visit' | 'share'>('visit')
  const [triggerThreshold, setTriggerThreshold] = useState('5')
  const [triggerReward, setTriggerReward] = useState('10% OFF')

  const handleAddTrigger = () => {
    if (!selectedCouponId) return
    const newTrigger = {
      id: Math.random().toString(),
      type: triggerType,
      threshold: parseInt(triggerThreshold),
      reward: triggerReward,
      isActive: true,
    }
    const coupon = coupons.find((c) => c.id === selectedCouponId)
    const existing = coupon?.behavioralTriggers || []
    updateBehavioralTriggers(selectedCouponId, [...existing, newTrigger])
  }

  const allTriggers = coupons.flatMap((c) =>
    (c.behavioralTriggers || []).map((t) => ({ ...t, couponTitle: c.title })),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('vendor.behavioral')}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 border p-4 rounded-lg">
          <h3 className="font-bold text-lg">{t('vendor.add_trigger')}</h3>
          <div className="space-y-2">
            <Label>{t('vendor.select_campaign')}</Label>
            <Select
              value={selectedCouponId}
              onValueChange={setSelectedCouponId}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {coupons.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('vendor.trigger_type')}</Label>
            <Select
              value={triggerType}
              onValueChange={(v: any) => setTriggerType(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visit">
                  {t('vendor.visits_count')}
                </SelectItem>
                <SelectItem value="share">
                  {t('vendor.social_share')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {triggerType === 'visit' && (
            <div className="space-y-2">
              <Label>{t('vendor.threshold_visits')}</Label>
              <Input
                type="number"
                value={triggerThreshold}
                onChange={(e) => setTriggerThreshold(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>{t('vendor.reward')}</Label>
            <Input
              placeholder="e.g. 20% OFF"
              value={triggerReward}
              onChange={(e) => setTriggerReward(e.target.value)}
            />
          </div>
          <Button onClick={handleAddTrigger} className="w-full">
            {t('vendor.add_trigger')}
          </Button>
        </div>
        <div className="space-y-4">
          <h3 className="font-bold text-lg">{t('vendor.active_triggers')}</h3>
          {allTriggers.length === 0 && (
            <p className="text-muted-foreground">{t('vendor.no_triggers')}</p>
          )}
          <div className="space-y-2">
            {allTriggers.map((t, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 border rounded bg-slate-50"
              >
                <div>
                  <p className="font-bold text-sm">{t.couponTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.type === 'visit' ? `Visits: ${t.threshold}` : 'Share'}
                  </p>
                </div>
                <Badge>{t.reward}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
