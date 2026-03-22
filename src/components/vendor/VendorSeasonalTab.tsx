import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { Company, SeasonalEvent } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  CalendarIcon,
  MousePointerClick,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts'

export function VendorSeasonalTab({ company }: { company: Company }) {
  const { t, formatCurrency, formatDate } = useLanguage()
  const { seasonalEvents, approveSeasonalCampaign, rejectSeasonalCampaign } =
    useCouponStore()
  const [selectedEvent, setSelectedEvent] = useState<SeasonalEvent | null>(null)

  const myEvents = seasonalEvents.filter((e) => e.companyId === company.id)
  const pendingEvents = myEvents.filter((e) => e.status === 'pending')
  const activeEvents = myEvents.filter((e) => e.status === 'active')

  const chartData = activeEvents.map((e) => ({
    name: e.title.length > 15 ? e.title.substring(0, 15) + '...' : e.title,
    clicks: e.clickCount || 0,
  }))

  const handleApprove = (id: string) => {
    approveSeasonalCampaign(id)
    setSelectedEvent(null)
  }

  const handleReject = (id: string) => {
    rejectSeasonalCampaign(id)
    setSelectedEvent(null)
  }

  return (
    <div className="space-y-6">
      {pendingEvents.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Action Required: Pending Campaigns
            </CardTitle>
            <CardDescription className="text-orange-700/80">
              Review and approve seasonal campaigns proposed by the platform
              administrator to activate them and begin billing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg border shadow-sm gap-4"
              >
                <div className="flex gap-4 items-center">
                  {event.image && (
                    <img
                      src={event.image}
                      alt=""
                      className="w-16 h-16 rounded-md object-cover border"
                    />
                  )}
                  <div>
                    <h4 className="font-bold text-lg">{event.title}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {formatDate(event.startDate)} -{' '}
                      {formatDate(event.endDate)}
                    </p>
                    <p className="text-sm font-semibold text-primary mt-1">
                      {formatCurrency(event.price)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedEvent(event)}
                >
                  Preview & Decide
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('vendor.performance')}</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-[250px] w-full">
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
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                No active campaigns with data
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myEvents.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No seasonal campaigns found.
              </p>
            )}
            {myEvents
              .filter((e) => e.status !== 'pending')
              .map((event) => (
                <div
                  key={event.id}
                  className="flex justify-between items-center p-3 border rounded-lg bg-slate-50"
                >
                  <div>
                    <p className="font-bold">{event.title}</p>
                    <div className="flex gap-2 items-center mt-1">
                      <Badge
                        variant={
                          event.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {t(`admin.${event.status}`)}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MousePointerClick className="h-3 w-3" />{' '}
                        {event.clickCount || 0} {t('vendor.clicks')}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatCurrency(event.price)}
                  </span>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Campaign Preview</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 py-4">
              {selectedEvent.image && (
                <img
                  src={selectedEvent.image}
                  alt=""
                  className="w-full h-48 object-cover rounded-lg border"
                />
              )}
              <div>
                <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedEvent.description}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Period:</span>
                  <span className="font-medium">
                    {formatDate(selectedEvent.startDate)} -{' '}
                    {formatDate(selectedEvent.endDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Campaign Price:</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(selectedEvent.price)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                By approving this campaign, an invoice will be generated and the
                campaign will go live on the specified dates.
              </p>
            </div>
          )}
          <DialogFooter className="flex sm:justify-between w-full">
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => selectedEvent && handleReject(selectedEvent.id)}
            >
              <XCircle className="h-4 w-4" /> {t('vendor.reject_campaign')}
            </Button>
            <Button
              className="gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => selectedEvent && handleApprove(selectedEvent.id)}
            >
              <CheckCircle className="h-4 w-4" /> {t('vendor.approve_campaign')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
