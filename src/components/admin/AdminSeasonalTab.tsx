import { useState } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  MousePointerClick,
  MoreHorizontal,
  FileText,
  Download,
  RefreshCw,
  Ticket,
  AlertCircle,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { SeasonalEvent } from '@/lib/types'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts'

export function AdminSeasonalTab({ franchiseId }: { franchiseId?: string }) {
  const { t, formatCurrency, formatDate } = useLanguage()
  const {
    seasonalEvents,
    companies,
    addSeasonalEvent,
    updateSeasonalEvent,
    deleteSeasonalEvent,
    renewSeasonalCampaign,
  } = useCouponStore()

  const displayCompanies = franchiseId
    ? companies.filter((c) => c.franchiseId === franchiseId)
    : companies
  const companyIds = displayCompanies.map((c) => c.id)

  const activeEvents = seasonalEvents.filter((e) => {
    if (e.status === 'archived') return false
    if (franchiseId) {
      return (
        e.franchiseId === franchiseId ||
        (e.companyId && companyIds.includes(e.companyId))
      )
    }
    return true
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<SeasonalEvent | null>(null)
  const [vouchersDialogEvent, setVouchersDialogEvent] =
    useState<SeasonalEvent | null>(null)

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
        franchiseId,
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
    return displayCompanies.find((c) => c.id === id)?.name || id
  }

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

  const isExpiringSoon = (endDate: string) => {
    const days = (new Date(endDate).getTime() - Date.now()) / (1000 * 3600 * 24)
    return days >= 0 && days <= 7
  }

  const exportCsv = (event: SeasonalEvent) => {
    const csvContent = [
      [
        'Title',
        'Advertiser',
        'Start Date',
        'End Date',
        'Clicks',
        'Invoice Value',
      ],
      [
        `"${event.title}"`,
        `"${getCompanyName(event.companyId)}"`,
        formatDate(event.startDate),
        formatDate(event.endDate),
        event.clickCount || 0,
        event.price || event.billingAmount || 0,
      ],
    ]
      .map((e) => e.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `report_${event.id}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportPdf = (event: SeasonalEvent) => {
    const w = window.open('', '_blank')
    if (w) {
      w.document.write(`
        <html><head><title>Campaign Report - ${event.title}</title>
        <style>body{font-family:sans-serif; padding:40px; line-height:1.6;} h1{color:#333;}</style></head>
        <body>
        <h1>Campaign Performance Report</h1>
        <hr/>
        <p><strong>Title:</strong> ${event.title}</p>
        <p><strong>Advertiser:</strong> ${getCompanyName(event.companyId)}</p>
        <p><strong>Start Date:</strong> ${formatDate(event.startDate)}</p>
        <p><strong>End Date:</strong> ${formatDate(event.endDate)}</p>
        <p><strong>Total Clicks:</strong> ${event.clickCount || 0}</p>
        <p><strong>Invoice Value:</strong> ${formatCurrency(event.price || event.billingAmount)}</p>
        <script>window.print(); window.close();</script>
        </body></html>
      `)
      w.document.close()
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
              <TableHead>{t('admin.status')}</TableHead>
              <TableHead className="text-right">{t('admin.action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeEvents.map((event) => {
              const expiring =
                event.status === 'active' && isExpiringSoon(event.endDate)
              return (
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
                      <div className="flex flex-col">
                        <span>{event.title}</span>
                        {expiring && (
                          <Badge
                            variant="outline"
                            className="w-fit mt-1 border-orange-500 text-orange-600 text-[10px] px-1 py-0"
                          >
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {t(
                              'admin.renewalRecommended',
                              'Renewal Recommended',
                            )}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getCompanyName(event.companyId)}</TableCell>
                  <TableCell className="text-sm">
                    {formatDate(event.startDate)} - {formatDate(event.endDate)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(event.status)}>
                      {t(`admin.${event.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                          {t('admin.action')}
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleOpenDialog(event)}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          {t('admin.editSeasonal')}
                        </DropdownMenuItem>
                        {event.vouchers && event.vouchers.length > 0 && (
                          <DropdownMenuItem
                            onClick={() => setVouchersDialogEvent(event)}
                          >
                            <Ticket className="mr-2 h-4 w-4" />
                            {t('admin.viewVouchers', 'View Vouchers')}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => exportCsv(event)}>
                          <FileText className="mr-2 h-4 w-4" />
                          {t('admin.exportCsv', 'Export CSV')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportPdf(event)}>
                          <Download className="mr-2 h-4 w-4" />
                          {t('admin.exportPdf', 'Export PDF')}
                        </DropdownMenuItem>
                        {(expiring || event.status === 'expired') && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => renewSeasonalCampaign(event.id)}
                            >
                              <RefreshCw className="mr-2 h-4 w-4 text-green-600" />
                              <span className="text-green-600 font-medium">
                                {t('admin.renew', 'Renew Campaign')}
                              </span>
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteSeasonalEvent(event.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
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
                    {displayCompanies.map((c) => (
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

      <Dialog
        open={!!vouchersDialogEvent}
        onOpenChange={() => setVouchersDialogEvent(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              {t('admin.vouchers', 'Vouchers')} - {vouchersDialogEvent?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 py-4 max-h-[300px] overflow-y-auto">
            {vouchersDialogEvent?.vouchers?.map((code, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="justify-center font-mono py-1.5"
              >
                {code}
              </Badge>
            ))}
            {(!vouchersDialogEvent?.vouchers ||
              vouchersDialogEvent.vouchers.length === 0) && (
              <p className="col-span-full text-center text-muted-foreground text-sm">
                No vouchers generated for this campaign.
              </p>
            )}
          </div>
          <div className="bg-slate-50 p-3 rounded-lg text-xs text-muted-foreground text-center">
            Valid until{' '}
            {vouchersDialogEvent && formatDate(vouchersDialogEvent.endDate)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
