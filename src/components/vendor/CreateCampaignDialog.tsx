import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, QrCode } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { toast } from 'sonner'
import { Company } from '@/lib/types'

export function CreateCampaignDialog({ company }: { company: Company }) {
  const { t } = useLanguage()
  const { addCoupon } = useCouponStore()
  const { register, handleSubmit, reset } = useForm()
  const [isOpen, setIsOpen] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)

  const [targetAudience, setTargetAudience] = useState<'all' | 'preferred'>(
    'all',
  )
  const [notifyPreferred, setNotifyPreferred] = useState(false)

  const onSubmit = (data: any) => {
    const code =
      data.code ||
      'CMP-' + Math.random().toString(36).substr(2, 6).toUpperCase()
    setGeneratedCode(code)

    addCoupon({
      id: Math.random().toString(),
      ...data,
      maxPerUser: data.maxPerUser ? parseInt(data.maxPerUser) : undefined,
      companyId: company.id,
      storeName: company.name,
      source: 'partner',
      reservedCount: 0,
      image:
        'https://img.usecurling.com/p/600/400?q=' +
        (data.category || 'promotion'),
      coordinates: { lat: 0, lng: 0 },
      distance: 0,
      expiryDate: data.endDate,
      region: company.region,
      currency: company.region === 'US-FL' ? 'USD' : 'BRL',
      targetAudience,
    })

    if (notifyPreferred) {
      toast.success(
        'Offer successfully communicated to your preferred customers.',
      )
    } else {
      toast.success(t('common.success'))
    }

    setTimeout(() => {
      setIsOpen(false)
      setGeneratedCode(null)
      setTargetAudience('all')
      setNotifyPreferred(false)
      reset()
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-md">
          <Plus className="h-4 w-4" /> {t('vendor.new_campaign')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('vendor.new_campaign')}</DialogTitle>
        </DialogHeader>
        {!generatedCode ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('vendor.title')}</Label>
                <Input {...register('title')} required />
              </div>
              <div className="space-y-2">
                <Label>{t('coupon.discount')}</Label>
                <Input {...register('discount')} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('vendor.validity')}</Label>
                <Input type="date" {...register('endDate')} required />
              </div>
              <div className="space-y-2">
                <Label>Limit per Person</Label>
                <Input
                  type="number"
                  min="1"
                  {...register('maxPerUser')}
                  placeholder="e.g. 1"
                />
                <p className="text-[10px] text-muted-foreground leading-tight mt-1">
                  Applies only to native promotions created via this platform.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select
                value={targetAudience}
                onValueChange={(v: any) => setTargetAudience(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="preferred">
                    Preferred Customers Only
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-md bg-slate-50">
              <div className="space-y-0.5">
                <Label>Notify Preferred Customers</Label>
                <p className="text-xs text-muted-foreground">
                  Send an alert about this new offer to your preferred segment.
                </p>
              </div>
              <Switch
                checked={notifyPreferred}
                onCheckedChange={setNotifyPreferred}
              />
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full">
                {t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="text-center py-8">
            <QrCode className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-xl font-bold">{generatedCode}</h3>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
