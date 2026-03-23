import { useState, useRef, useEffect } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ScanLine,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Receipt,
  ArrowRight,
  QrCode,
  Tag,
  Camera,
  Banknote,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ScannerStep = 'input_total' | 'scanning' | 'review' | 'success'

interface VoucherData {
  title: string
  desc: string
  discountStr: string
  storeName: string
  discountAmount: number
  finalTotal: number
}

export default function MerchantScanner() {
  const { coupons, seasonalEvents, usedVouchers, validateCoupon, companies } =
    useCouponStore()
  const { formatCurrency } = useLanguage()

  const [step, setStep] = useState<ScannerStep>('input_total')
  const [checkoutTotalStr, setCheckoutTotalStr] = useState<string>('')
  const [scannedCode, setScannedCode] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [voucherData, setVoucherData] = useState<VoucherData | null>(null)
  const codeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 'scanning' && codeInputRef.current) {
      codeInputRef.current.focus()
    }
  }, [step])

  const handleStartScanning = (e: React.FormEvent) => {
    e.preventDefault()
    const total = parseFloat(checkoutTotalStr.replace(',', '.'))
    if (isNaN(total) || total <= 0) {
      setError('Por favor, insira um valor de compra válido.')
      return
    }
    setError(null)
    setStep('scanning')
  }

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!scannedCode.trim()) {
      setError('Insira um código de voucher.')
      return
    }

    const code = scannedCode.trim()

    let foundCoupon = coupons.find((c) => c.code === code)
    let foundEvent = seasonalEvents.find((e) => e.vouchers?.includes(code))

    let title = ''
    let desc = ''
    let discountStr = ''
    let storeName = ''
    let isUsed = false

    if (foundCoupon) {
      title = foundCoupon.title
      desc = foundCoupon.description
      discountStr = foundCoupon.discount
      storeName = foundCoupon.storeName
      isUsed = foundCoupon.status === 'used'
    } else if (foundEvent) {
      title = foundEvent.title
      desc = foundEvent.description
      discountStr = foundEvent.type === 'sale' ? 'Sale' : 'Evento Especial'
      storeName =
        companies.find((c) => c.id === foundEvent.companyId)?.name || 'Loja'
      isUsed = usedVouchers.includes(code)
    } else {
      setError('Voucher não encontrado. Verifique o código.')
      return
    }

    if (isUsed) {
      setError('Voucher Já Utilizado')
      return
    }

    const total = parseFloat(checkoutTotalStr.replace(',', '.'))
    let discountAmount = 0

    if (discountStr) {
      const lowerStr = discountStr.toLowerCase()
      if (lowerStr.includes('%')) {
        const match = lowerStr.match(/(\d+)\s*%/)
        if (match) {
          discountAmount = (total * parseFloat(match[1])) / 100
        }
      } else {
        const match = lowerStr.match(/(\d+[.,]?\d*)/)
        if (match) {
          discountAmount = parseFloat(match[1].replace(',', '.'))
        }
      }
    }

    // Safeguard to not have negative totals
    const finalTotal = Math.max(0, total - discountAmount)

    setError(null)
    setVoucherData({
      title,
      desc,
      discountStr,
      storeName,
      discountAmount,
      finalTotal,
    })
    setStep('review')
  }

  const handleConfirm = () => {
    const res = validateCoupon(scannedCode)
    if (res.success) {
      setStep('success')
    } else {
      setError(res.message || 'Erro ao validar voucher')
      setStep('scanning')
    }
  }

  const handleReset = () => {
    setStep('input_total')
    setCheckoutTotalStr('')
    setScannedCode('')
    setVoucherData(null)
    setError(null)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-4 sm:p-8 animate-fade-in">
      <Card className="w-full max-w-md shadow-xl border-slate-200 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />

        <CardHeader className="text-center pb-4 pt-8">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <ScanLine className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Scanner do Lojista
          </CardTitle>
          <CardDescription>
            Point of Sale - Validação de Vouchers
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 sm:px-8">
          {error && (
            <Alert variant="destructive" className="mb-6 animate-in fade-in">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-semibold ml-2">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {step === 'input_total' && (
            <form
              onSubmit={handleStartScanning}
              className="space-y-6 animate-in slide-in-from-right-4"
            >
              <div className="space-y-4">
                <Label
                  htmlFor="total"
                  className="text-base font-semibold text-slate-700 flex items-center gap-2"
                >
                  <Banknote className="h-5 w-5 text-slate-400" /> Valor Total da
                  Compra
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-lg">
                    R$
                  </span>
                  <Input
                    id="total"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={checkoutTotalStr}
                    onChange={(e) => setCheckoutTotalStr(e.target.value)}
                    className="pl-12 h-16 text-2xl font-bold bg-white shadow-sm rounded-xl focus-visible:ring-primary/50"
                    autoFocus
                  />
                </div>
                <p className="text-sm text-slate-500 text-center px-4">
                  Insira o valor bruto da compra antes de aplicar o desconto do
                  voucher.
                </p>
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-base font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5"
              >
                Prosseguir para Leitura <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          )}

          {step === 'scanning' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95">
              <div className="bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden h-64 border-4 border-slate-800 shadow-inner">
                {/* Mock Camera View */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black" />

                {/* Scanning Frame */}
                <div className="w-40 h-40 border-2 border-primary/50 relative z-10 rounded-lg">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary rounded-tl-lg -translate-x-1 -translate-y-1" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary rounded-tr-lg translate-x-1 -translate-y-1" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary rounded-bl-lg -translate-x-1 translate-y-1" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary rounded-br-lg translate-x-1 translate-y-1" />

                  {/* Scanning Laser Animation */}
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_8px_2px_rgba(var(--primary),0.5)] animate-[slide-down_2s_ease-in-out_infinite_alternate]" />
                </div>

                <div className="absolute bottom-4 flex items-center gap-2 text-white/70 text-sm font-medium z-10 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Camera className="h-4 w-4" /> Câmera Ativa
                </div>
              </div>

              <form onSubmit={handleSimulateScan} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="code"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Ou digite o código manualmente
                  </Label>
                  <div className="relative">
                    <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="code"
                      ref={codeInputRef}
                      placeholder="EX: VCH-12345"
                      value={scannedCode}
                      onChange={(e) =>
                        setScannedCode(e.target.value.toUpperCase())
                      }
                      className="pl-10 uppercase h-12 font-mono tracking-wider bg-white rounded-lg shadow-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('input_total')}
                    className="h-12 px-4"
                  >
                    Voltar
                  </Button>
                  <Button type="submit" className="h-12 flex-1 font-bold">
                    Validar Código
                  </Button>
                </div>
              </form>
            </div>
          )}

          {step === 'review' && voucherData && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-start gap-3 pb-4 border-b border-dashed border-slate-200">
                  <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
                    <Tag className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 leading-tight mb-1">
                      {voucherData.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {voucherData.desc}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(
                        parseFloat(checkoutTotalStr.replace(',', '.')),
                        'BRL',
                        'pt-BR',
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-emerald-600 font-medium bg-emerald-50/50 -mx-5 px-5 py-2">
                    <span className="flex items-center gap-1.5">
                      Desconto Voucher ({voucherData.discountStr})
                    </span>
                    <span>
                      -{' '}
                      {formatCurrency(
                        voucherData.discountAmount,
                        'BRL',
                        'pt-BR',
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xl font-bold text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total a Pagar</span>
                    <span>
                      {formatCurrency(voucherData.finalTotal, 'BRL', 'pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleConfirm}
                  size="lg"
                  className="w-full h-14 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md rounded-xl"
                >
                  <Receipt className="mr-2 h-5 w-5" /> Confirmar e Aplicar
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStep('scanning')}
                  className="text-slate-500"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Desconto Aplicado com Sucesso!
              </h2>
              <p className="text-slate-500 mb-8 max-w-[250px]">
                O voucher foi validado, marcado como utilizado e a transação foi
                registrada.
              </p>
              <Button
                onClick={handleReset}
                size="lg"
                variant="outline"
                className="w-full h-14 rounded-xl font-bold border-slate-300 hover:bg-slate-50"
              >
                <RotateCcw className="mr-2 h-5 w-5" /> Novo Atendimento
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
