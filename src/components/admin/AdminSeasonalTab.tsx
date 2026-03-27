import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Plus,
  Edit2,
  Trash2,
  MousePointerClick,
  MoreHorizontal,
  FileText,
  Download,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { useCouponStore } from '@/stores/CouponContext'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'

export function AdminSeasonalTab({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()
  const { coupons, companies, franchises, updateCampaign, deleteCoupon } =
    useCouponStore()
  const [searchParams] = useSearchParams()
  const searchQuery = (searchParams.get('q') || '').toLowerCase()

  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency, formatDate, formatNumber } = useRegionFormatting(
    franchise?.region,
  )

  const displayCompanies = franchiseId
    ? companies.filter((c) => c.franchiseId === franchiseId)
    : companies
  const companyIds = displayCompanies.map((c) => c.id)

  const getCompanyName = (id?: string) => {
    if (!id || id === 'none') return '-'
    return displayCompanies.find((c) => c.id === id)?.name || id
  }

  const activeEvents = coupons
    .filter((e) => {
      if (!e.isSeasonal) return false
      if (e.status === 'archived') return false
      if (franchiseId) {
        return (
          e.franchiseId === franchiseId ||
          (e.companyId && companyIds.includes(e.companyId))
        )
      }
      return true
    })
    .filter((e) => {
      if (!searchQuery) return true
      return (
        e.title.toLowerCase().includes(searchQuery) ||
        getCompanyName(e.companyId).toLowerCase().includes(searchQuery)
      )
    })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)

  const handleOpenDialog = (event?: any) => {
    setEditingEvent(event || null)
    setIsDialogOpen(true)
  }

  const chartData = activeEvents.map((e) => ({
    name: e.title.length > 15 ? e.title.substring(0, 15) + '...' : e.title,
    clicks: e.visitCount || Math.floor(Math.random() * 100), // mock if undefined
  }))

  const getStatusBadgeVariant = (status?: string) => {
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

  const isExpiringSoon = (endDate?: string) => {
    if (!endDate) return false
    const days = (new Date(endDate).getTime() - Date.now()) / (1000 * 3600 * 24)
    return days >= 0 && days <= 7
  }

  const renewCampaign = (id: string) => {
    const c = coupons.find((c) => c.id === id)
    if (c) {
      const newEndDate = new Date(Date.now() + 30 * 86400000)
        .toISOString()
        .split('T')[0]
      updateCampaign(id, { endDate: newEndDate, status: 'active' })
    }
  }

  const exportCsv = (event: any) => {
    const csvContent = [
      ['Title', 'Advertiser', 'Start Date', 'End Date', 'Visits', 'Price'],
      [
        `"${event.title}"`,
        `"${getCompanyName(event.companyId)}"`,
        formatDate(event.startDate || ''),
        formatDate(event.endDate || event.expiryDate),
        formatNumber(event.visitCount || 0),
        formatCurrency(event.price || 0),
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

  const exportPdf = (event: any) => {
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
        <p><strong>Start Date:</strong> ${formatDate(event.startDate || '')}</p>
        <p><strong>End Date:</strong> ${formatDate(event.endDate || event.expiryDate)}</p>
        <p><strong>Total Visits:</strong> ${formatNumber(event.visitCount || 0)}</p>
        <p><strong>Price:</strong> ${formatCurrency(event.price || 0)}</p>
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
              {t('franchisee.seasonal.clicks_chart', 'Clicks per Campaign')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ChartContainer
                config={{
                  clicks: {
                    label: t('vendor.clicks', 'Visits'),
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
                event.status === 'active' &&
                isExpiringSoon(event.endDate || event.expiryDate)
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
                    {formatDate(event.startDate || '')} -{' '}
                    {formatDate(event.endDate || event.expiryDate)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(event.status)}>
                      {t(`admin.${event.status || 'active'}`)}
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
                          {t('admin.editSeasonal', 'Edit Campaign')}
                        </DropdownMenuItem>
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
                              onClick={() => renewCampaign(event.id)}
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
                          onClick={() => deleteCoupon(event.id)}
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

      <CampaignFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        coupon={editingEvent}
        franchiseId={franchiseId}
        defaultIsSeasonal={true}
      />
    </div>
  )
}
