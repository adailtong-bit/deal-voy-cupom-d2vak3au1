import { useState } from 'react'
import { Plus, Edit2, Trash2, Calendar as CalendarIcon } from 'lucide-react'
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
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { SeasonalEvent } from '@/lib/types'

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
    billingAmount: 0,
    status: 'active',
    image: '',
    type: 'sale',
  })

  const handleOpenDialog = (event?: SeasonalEvent) => {
    if (event) {
      setEditingEvent(event)
      setFormData({
        ...event,
        startDate: event.startDate.split('T')[0],
        endDate: event.endDate.split('T')[0],
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
        billingAmount: 0,
        status: 'active',
        image: 'https://img.usecurling.com/p/600/400?q=campaign',
        type: 'sale',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    const startIso = formData.startDate
      ? new Date(formData.startDate).toISOString()
      : new Date().toISOString()
    const endIso = formData.endDate
      ? new Date(formData.endDate).toISOString()
      : new Date().toISOString()

    if (editingEvent) {
      updateSeasonalEvent(editingEvent.id, {
        ...formData,
        startDate: startIso,
        endDate: endIso,
        companyId:
          formData.companyId === 'none' ? undefined : formData.companyId,
      })
    } else {
      addSeasonalEvent({
        ...(formData as SeasonalEvent),
        id: Math.random().toString(),
        startDate: startIso,
        endDate: endIso,
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

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.title')}</TableHead>
              <TableHead>{t('admin.partner')}</TableHead>
              <TableHead>{t('admin.period')}</TableHead>
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
                  <Badge
                    variant={
                      event.status === 'active' ? 'default' : 'secondary'
                    }
                  >
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
                  colSpan={5}
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
        <DialogContent className="max-w-2xl">
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
                <Label>{t('admin.billingAmount')}</Label>
                <Input
                  type="number"
                  value={formData.billingAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
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
                    <SelectItem value="active">{t('admin.active')}</SelectItem>
                    <SelectItem value="paused">{t('admin.paused')}</SelectItem>
                    <SelectItem value="scheduled">
                      {t('admin.scheduled')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('admin.image')}</Label>
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
