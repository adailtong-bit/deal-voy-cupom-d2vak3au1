import { useState } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Calendar as CalendarIcon,
  MousePointerClick,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { SeasonalEvent } from '@/lib/types'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  ResponsiveContainer,
} from 'recharts'

export function AdminSeasonalTab() {
  const { t, formatCurrency, formatDate } = useLanguage()
  const {
    seasonalEvents,
    companies,
    addSeasonalEvent,
    updateSeasonalEvent,
    deleteSeasonalEvent,
  } = useCouponStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<SeasonalEvent | null>(null)

  const [formData, setFormData] = useState<Partial<SeasonalEvent>>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    companyId: '',
    price: 0,
    status: 'pending',
    image: '',
    images: [],
    type: 'sale',
  })

  const [imageInput, setImageInput] = useState('')

  const handleOpenDialog = (event?: SeasonalEvent) => {
    if (event) {
      setEditingEvent(event)
      setFormData({
        ...event,
        startDate: event.startDate.split('T')[0],
        endDate: event.endDate.split('T')[0],
        images: event.images || [],
        price: event.price || event.billingAmount || 0,
      })
    } else {
      setEditingEvent(null)
      setFormData({
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 86400000)
          .toISOString()
          .split('T')[0],
        companyId: 'none',
        price: 0,
        status: 'pending',
        image: 'https://img.usecurling.com/p/600/400?q=campaign',
        images: [],
        type: 'sale',
      })
    }
    setImageInput('')
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    const startIso = formData.startDate
      ? new Date(formData.startDate).toISOString()
      : new Date().toISOString()
    const endIso = formData.endDate
      ? new Date(formData.endDate).toISOString()
      : new Date().toISOString()

    const finalImages = [...(formData.images || [])]
    if (imageInput.trim() !== '') {
      finalImages.push(imageInput.trim())
    }
    const mainImage =
      formData.image ||
      finalImages[0] ||
      'https://img.usecurling.com/p/600/400?q=campaign'

    if (editingEvent) {
      updateSeasonalEvent(editingEvent.id, {
        ...formData,
        startDate: startIso,
        endDate: endIso,
        image: mainImage,
        images: finalImages,
        companyId:
          formData.companyId === 'none' ? undefined : formData.companyId,
      })
    } else {
      addSeasonalEvent({
        ...(formData as SeasonalEvent),
        id: Math.random().toString(),
        startDate: startIso,
        endDate: endIso,
        image: mainImage,
        images: finalImages,
        companyId:
          formData.companyId === 'none' ? undefined : formData.companyId,
      })
    }
    setIsDialogOpen(false)
  }

  const getCompanyName = (id?: string) => {
    if (!id || id === 'none') return '-'
    return companies.find((c) => c.id === id)?.name || id
  }

  const activeEvents = seasonalEvents.filter((e) => e.status !== 'archived')

  const chartData = activeEvents.map((e) => ({
    name: e.title.length > 15 ? e.title.substring(0, 15) + '...' : e.title,
    clicks: e.clickCount || 0,
  }))

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'rejected':
        return 'destructive'
      case 'expired':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">
          {t('admin.seasonal')}
        </h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          {t('admin.addSeasonal')}
        </Button>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MousePointerClick className="h-5 w-5 text-primary" />
              Clicks per Campaign
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ChartContainer
                config={{
                  clicks: {
                    label: t('vendor.clicks'),
                    color: 'hsl(var(--primary))',
                  },
                }}
              >
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="clicks"
                    fill="var(--color-clicks)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.title')}</TableHead>
              <TableHead>{t('admin.partner')}</TableHead>
              <TableHead>{t('admin.period')}</TableHead>
              <TableHead>{t('admin.price')}</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>{t('admin.status')}</TableHead>
              <TableHead className="text-right">{t('admin.action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeEvents.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {event.image && (
                      <img
                        src={event.image}
                        alt=""
                        className="w-10 h-10 rounded-md object-cover"
                      />
                    )}
                    <span>{event.title}</span>
                  </div>
                </TableCell>
                <TableCell>{getCompanyName(event.companyId)}</TableCell>
                <TableCell className="text-sm">
                  {formatDate(event.startDate)} - {formatDate(event.endDate)}
                </TableCell>
                <TableCell>
                  {formatCurrency(event.price || event.billingAmount)}
                </TableCell>
                <TableCell className="font-bold">
                  {event.clickCount || 0}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(event.status)}>
                    {t(`admin.${event.status}`)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(event)}
                  >
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSeasonalEvent(event.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {activeEvents.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  {t('common.none')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? t('admin.editSeasonal') : t('admin.addSeasonal')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('admin.title')}</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.description')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('admin.partner')}</Label>
                <Select
                  value={formData.companyId || 'none'}
                  onValueChange={(v) =>
                    setFormData({ ...formData, companyId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.partner')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('common.none')}</SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('admin.price')}</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: Number(e.target.value),
                      billingAmount: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('admin.startDate')}</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.endDate')}</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('admin.status')}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v: any) =>
                    setFormData({ ...formData, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t('admin.draft')}</SelectItem>
                    <SelectItem value="pending">
                      {t('admin.pending')}
                    </SelectItem>
                    <SelectItem value="active">{t('admin.active')}</SelectItem>
                    <SelectItem value="rejected">
                      {t('admin.rejected')}
                    </SelectItem>
                    <SelectItem value="expired">
                      {t('admin.expired')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('admin.image')} (Main)</Label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                Additional Images (Comma separated URLs or type and click Save)
              </Label>
              <Input
                type="text"
                placeholder="https://img1.jpg, https://img2.jpg"
                value={formData.images?.join(', ')}
                onChange={(e) => {
                  const arr = e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                  setFormData({ ...formData, images: arr })
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('admin.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !formData.title || !formData.startDate || !formData.endDate
              }
            >
              {t('admin.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
