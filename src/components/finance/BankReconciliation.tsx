import { useState } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { useCouponStore } from '@/stores/CouponContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CheckCircle2, Upload, AlertCircle } from 'lucide-react'
import { useFinanceData } from '@/hooks/useFinanceData'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export function BankReconciliation({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()
  const { franchises } = useCouponStore()
  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency, formatDate } = useRegionFormatting(franchise?.region)

  const allData = useFinanceData(franchiseId)
  const systemEntries = allData.filter((d) => d.status === 'completed')

  const [imported, setImported] = useState<any[]>([])
  const [reconciledIds, setReconciledIds] = useState<Set<string>>(new Set())

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Mock parsing the CSV/OFX
    setTimeout(() => {
      setImported([
        {
          id: 'b1',
          date: new Date().toISOString(),
          desc: 'BANK TRF - AD SALES',
          amount: 500,
          matchedSysId:
            systemEntries.find((s) => s.amount === 500)?.id ||
            systemEntries[0]?.id,
        },
        {
          id: 'b2',
          date: new Date().toISOString(),
          desc: 'BANK TRF - ROYALTY',
          amount: -75,
          matchedSysId:
            systemEntries.find((s) => s.amount === 75)?.id ||
            systemEntries[1]?.id,
        },
        {
          id: 'b3',
          date: new Date().toISOString(),
          desc: 'MAINTENANCE FEE',
          amount: -15,
          matchedSysId: null,
        },
      ])
      toast.success(
        t('finance.import_success', 'Statement imported successfully'),
      )
    }, 600)
  }

  const markReconciled = (id: string) => {
    setReconciledIds((prev) => new Set(prev).add(id))
    toast.success(t('finance.reconciled', 'Entry marked as reconciled'))
  }

  return (
    <Card className="shadow-sm animate-fade-in">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 bg-white">
        <div>
          <CardTitle className="text-lg text-slate-800">
            {t('finance.reconciliation', 'Bank Reconciliation')}
          </CardTitle>
          <CardDescription>
            {t(
              'finance.recon_desc',
              'Upload external statements (CSV/OFX) to match with system records.',
            )}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept=".csv,.ofx"
            className="w-full sm:w-[250px] cursor-pointer"
            onChange={handleFileUpload}
          />
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="pl-6">Bank Entry</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>System Match</TableHead>
              <TableHead className="pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {imported.map((entry) => {
              const isReconciled = reconciledIds.has(entry.id)
              const match = systemEntries.find(
                (s) => s.id === entry.matchedSysId,
              )
              return (
                <TableRow
                  key={entry.id}
                  className={`hover:bg-slate-50/50 ${isReconciled ? 'bg-emerald-50/30' : ''}`}
                >
                  <TableCell className="pl-6">
                    <div className="font-semibold text-slate-800">
                      {entry.desc}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {formatDate(entry.date)}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-slate-700">
                    {formatCurrency(Math.abs(entry.amount))}
                  </TableCell>
                  <TableCell>
                    {match ? (
                      <div className="flex items-center gap-2 text-sm text-slate-600 bg-white p-2 rounded-md border border-slate-200 shadow-sm max-w-xs">
                        <span className="truncate flex-1">{match.desc}</span>
                        <Badge
                          variant="secondary"
                          className="ml-auto shrink-0 font-mono"
                        >
                          {formatCurrency(match.amount)}
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-600 text-sm font-medium">
                        <AlertCircle className="w-4 h-4 mr-1.5" />
                        No exact match found
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="pr-6">
                    {isReconciled ? (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />{' '}
                        Reconciled
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => markReconciled(entry.id)}
                        className="shadow-sm"
                      >
                        Match & Reconcile
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
            {imported.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-16 text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <Upload className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-600">
                      Upload a statement to begin reconciliation
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      Supports .CSV and .OFX files from your bank.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
