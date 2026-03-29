import { useState, useMemo } from 'react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CheckCircle2,
  Upload,
  AlertCircle,
  FileUp,
  Link as LinkIcon,
} from 'lucide-react'
import { useFinanceData } from '@/hooks/useFinanceData'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export function BankReconciliation({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()
  const { franchises } = useCouponStore()
  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency, formatDate } = useRegionFormatting(franchise?.region)

  const allData = useFinanceData(franchiseId)
  const systemEntries = useMemo(
    () => allData.filter((d) => d.status === 'paid'),
    [allData],
  )

  const [imported, setImported] = useState<any[]>([])
  const [reconciledIds, setReconciledIds] = useState<Set<string>>(new Set())

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    toast.info(t('finance.importing', 'Analyzing bank statement...'))

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
    }, 1000)
  }

  const markReconciled = (id: string) => {
    setReconciledIds((prev) => new Set(prev).add(id))
    toast.success(t('finance.reconciled', 'Entry marked as reconciled'))
  }

  return (
    <Card className="shadow-sm border-slate-200 animate-fade-in-up">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 bg-white border-b border-slate-100">
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
          <Button
            variant="outline"
            className="relative cursor-pointer overflow-hidden"
          >
            <FileUp className="w-4 h-4 mr-2 text-slate-500" />
            <span>{t('finance.import_statement', 'Import Statement')}</span>
            <input
              type="file"
              accept=".csv,.ofx"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileUpload}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="pl-6 w-1/3">
                {t('finance.bank_entry', 'Bank Entry')}
              </TableHead>
              <TableHead className="w-1/3">
                {t('finance.system_match', 'System Match')}
              </TableHead>
              <TableHead className="text-right pr-6">
                {t('finance.action', 'Action')}
              </TableHead>
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
                  <TableCell className="pl-6 align-top pt-4 pb-4">
                    <div className="font-semibold text-slate-800">
                      {entry.desc}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500">
                        {formatDate(entry.date)}
                      </span>
                      <span
                        className={`text-sm font-bold ${entry.amount > 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {entry.amount > 0 ? '+' : ''}
                        {formatCurrency(entry.amount)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="align-top pt-4 pb-4">
                    {match ? (
                      <div className="flex flex-col gap-1 bg-white p-3 rounded-md border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-700 text-sm truncate">
                            {match.desc}
                          </span>
                          <Badge variant="secondary" className="shrink-0 ml-2">
                            {formatCurrency(
                              match.type === 'in'
                                ? match.amount
                                : -match.amount,
                            )}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{formatDate(match.date)}</span>
                          <span className="capitalize">{match.category}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full p-3 border border-dashed border-amber-200 bg-amber-50/50 rounded-md">
                        <div className="flex items-center text-amber-600 text-sm font-medium">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          {t('finance.no_match', 'No system match found')}
                        </div>
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-right pr-6 align-middle">
                    {isReconciled ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-none">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        {t('finance.reconciled_status', 'Reconciled')}
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant={match ? 'default' : 'outline'}
                        onClick={() => markReconciled(entry.id)}
                        className="shadow-sm whitespace-nowrap"
                      >
                        {match ? (
                          <>
                            <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
                            {t('finance.confirm_match', 'Confirm Match')}
                          </>
                        ) : (
                          t('finance.manual_match', 'Manual Match')
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}

            {imported.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-16 text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <Upload className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-600">
                      {t(
                        'finance.upload_prompt',
                        'Upload a statement to begin reconciliation',
                      )}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      {t(
                        'finance.upload_formats',
                        'Supports .CSV and .OFX files from your bank.',
                      )}
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
