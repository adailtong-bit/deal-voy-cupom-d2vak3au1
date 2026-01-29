import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QrCode, Scan, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function CouponValidation() {
  const { t, formatDate } = useLanguage()
  const { validateCoupon, validationLogs } = useCouponStore()
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'success' | 'error' | 'already_used'
  >('idle')
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault()
    const result = validateCoupon(code)

    if (result.success) {
      setStatus('success')
      setFeedbackMessage(result.message)
      toast.success(t('toast.validation_success'))
      setCode('')
    } else {
      if (result.message === 'Already used') {
        setStatus('already_used')
        setFeedbackMessage('This coupon has already been redeemed.')
        toast.error('Coupon already used!')
      } else {
        setStatus('error')
        setFeedbackMessage(result.message)
        toast.error(t('toast.validation_error'))
      }
    }
    setTimeout(() => {
      setStatus('idle')
      setFeedbackMessage('')
    }, 4000)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('vendor.validation')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border-2 border-dashed rounded-lg mb-6">
            <Scan className="h-16 w-16 text-slate-300 mb-2 animate-pulse" />
            <p className="text-sm text-muted-foreground">
              {t('vendor.scan_qr')}
            </p>
          </div>
          <form onSubmit={handleValidate} className="flex gap-2">
            <div className="relative flex-1">
              <QrCode className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('vendor.code')}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit">{t('vendor.validate_btn')}</Button>
          </form>
          {status === 'success' && (
            <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 border border-green-200 animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-bold">{feedbackMessage}</span>
            </div>
          )}
          {status === 'already_used' && (
            <div className="mt-4 p-4 bg-orange-50 text-orange-700 rounded-lg flex items-center gap-2 border border-orange-200 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-bold">{feedbackMessage}</span>
            </div>
          )}
          {status === 'error' && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-200 animate-in fade-in slide-in-from-top-2">
              <XCircle className="h-5 w-5" />
              <span className="font-bold">{feedbackMessage}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('vendor.recent_validations')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validationLogs.slice(0, 5).map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDate(log.validatedAt)}</TableCell>
                  <TableCell>{log.couponTitle}</TableCell>
                  <TableCell>
                    <span className="text-green-600 font-bold text-xs flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> OK
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
