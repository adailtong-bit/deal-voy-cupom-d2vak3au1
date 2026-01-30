import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { QrCode, Search, CheckCircle, XCircle } from 'lucide-react'
import { useCouponStore } from '@/stores/CouponContext'
import { toast } from 'sonner'

export function CouponValidation() {
  const { validateCoupon } = useCouponStore()
  const [code, setCode] = useState('')
  const [result, setResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) return

    const res = validateCoupon(code)
    setResult(res)
    if (res.success) {
      toast.success(res.message)
      setCode('') // Clear on success for next scan
    } else {
      toast.error(res.message)
    }
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center flex flex-col items-center gap-2">
            <div className="bg-slate-100 p-4 rounded-full">
              <QrCode className="h-8 w-8 text-slate-600" />
            </div>
            Validate Coupon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleValidate} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter coupon code (e.g. CODE-1234)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center font-mono uppercase"
              />
              <Button type="submit">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {result && (
            <div
              className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${result.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
            >
              {result.success ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                <XCircle className="h-6 w-6" />
              )}
              <div className="font-bold">{result.message}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
