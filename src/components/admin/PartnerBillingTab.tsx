import { useState, useMemo } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/stores/LanguageContext'
import { Activity, DollarSign, Receipt, Settings } from 'lucide-react'

export function PartnerBillingTab() {
  const {
    validationLogs,
    companies,
    partnerInvoices,
    generatePartnerInvoice,
    updatePartnerInvoiceStatus,
    reconcilePartnerInvoice,
    coupons,
    partnerPolicies,
  } = useCouponStore()
  const { t, formatCurrency, formatDate } = useLanguage()

  const [selectedCompany, setSelectedCompany] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const stats = useMemo(() => {
    let logs = validationLogs
    if (selectedCompany !== 'all') {
      logs = logs.filter((l) => l.companyId === selectedCompany)
    }
    if (startDate) {
      logs = logs.filter((l) => new Date(l.validatedAt) >= new Date(startDate))
    }
    if (endDate) {
      logs = logs.filter((l) => new Date(l.validatedAt) <= new Date(endDate))
    }

    const totalSales = logs.reduce(
      (sum, l) => sum + (coupons.find((c) => c.id === l.couponId)?.price || 50),
      0,
    )

    let totalCommission = logs.reduce(
      (sum, l) => sum + (l.commissionAmount || 0),
      0,
    )

    if (selectedCompany !== 'all') {
      const policy = partnerPolicies.find(
        (p) => p.companyId === selectedCompany,
      )
      if (policy?.billingModel === 'monthly') {
        totalCommission += policy.fixedFee
      }
    }

    const totalCashback = logs.reduce(
      (sum, l) => sum + (l.cashbackAmount || 0),
      0,
    )

    return { count: logs.length, totalSales, totalCommission, totalCashback }
  }, [
    validationLogs,
    selectedCompany,
    startDate,
    endDate,
    coupons,
    partnerPolicies,
  ])

  const handleGenerateInvoice = () => {
    if (selectedCompany === 'all') return
    if (!startDate || !endDate) return
    generatePartnerInvoice(selectedCompany, startDate, endDate)
  }

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            {t('admin.live_dashboard')}
          </CardTitle>
          <CardDescription>{t('admin.close_period')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label>{t('ads.company')}</Label>
              <Select
                value={selectedCompany}
                onValueChange={setSelectedCompany}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Partners</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.period_start')}</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.period_end')}</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                disabled={selectedCompany === 'all' || !startDate || !endDate}
                onClick={handleGenerateInvoice}
              >
                <Receipt className="h-4 w-4 mr-2" />
                {t('admin.generate_invoice')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border">
              <p className="text-sm font-medium text-muted-foreground">
                {t('admin.transactions')}
              </p>
              <h3 className="text-2xl font-bold">{stats.count}</h3>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border">
              <p className="text-sm font-medium text-muted-foreground">
                {t('admin.total_sales')}
              </p>
              <h3 className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalSales)}
              </h3>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-blue-100">
              <p className="text-sm font-medium text-muted-foreground">
                {t('admin.total_commission')}
              </p>
              <h3 className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.totalCommission)}
              </h3>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-purple-100">
              <p className="text-sm font-medium text-muted-foreground">
                {t('admin.total_cashback')}
              </p>
              <h3 className="text-2xl font-bold text-purple-600">
                {formatCurrency(stats.totalCashback)}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.invoices')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead>{t('ads.company')}</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>{t('admin.total_commission')}</TableHead>
                <TableHead>{t('admin.status')}</TableHead>
                <TableHead className="text-right">
                  {t('admin.action')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partnerInvoices.map((inv) => {
                const comp = companies.find((c) => c.id === inv.companyId)
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">
                      {inv.referenceNumber}
                      <div className="text-xs text-muted-foreground">
                        Due: {formatDate(inv.dueDate)}
                      </div>
                    </TableCell>
                    <TableCell>{comp?.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(inv.periodStart)} -{' '}
                        {formatDate(inv.periodEnd)}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(inv.totalCommission)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inv.status === 'paid'
                            ? 'default'
                            : inv.status === 'sent'
                              ? 'secondary'
                              : 'outline'
                        }
                        className={inv.status === 'paid' ? 'bg-green-500' : ''}
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right flex gap-2 justify-end">
                      {inv.status === 'draft' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updatePartnerInvoiceStatus(inv.id, 'sent')
                          }
                        >
                          Send
                        </Button>
                      )}
                      {inv.status === 'sent' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() =>
                            reconcilePartnerInvoice(inv.referenceNumber)
                          }
                        >
                          {t('admin.reconcile')}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
