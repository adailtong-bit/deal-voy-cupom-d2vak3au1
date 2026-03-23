import { useParams, useNavigate } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  QrCode,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ScanLine,
  Ticket,
  Gift,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Voucher() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    coupons,
    seasonalEvents,
    usedVouchers,
    validateCoupon,
    isReserved,
    reserveCoupon,
  } = useCouponStore()

  const coupon = coupons.find((c) => c.id === id)
  const event = seasonalEvents.find((e) => e.id === id)

  if (!coupon && !event) {
    return (
      <div className="container py-16 text-center animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">
          Voucher não encontrado
        </h2>
        <Button onClick={() => navigate(-1)}>Voltar</Button>
      </div>
    )
  }

  const title = coupon?.title || event?.title || ''
  const storeName = coupon?.storeName || event?.companyId || 'Loja Parceira'
  const instructions =
    coupon?.instructions ||
    'Apresente este código ao lojista no momento do pagamento para aplicar o benefício. O código é único e válido para apenas uma utilização.'

  const description = coupon?.description || event?.description || ''
  const discount =
    coupon?.discount || (event?.type === 'sale' ? 'Sale' : 'Evento Especial')
  const image = coupon?.image || event?.image

  const code =
    coupon?.code ||
    (event?.vouchers && event.vouchers.length > 0
      ? event.vouchers[0]
      : `VCH-${id?.substring(0, 6).toUpperCase()}`)

  const isUsed = coupon ? coupon.status === 'used' : usedVouchers.includes(code)

  const reserved = isReserved(id || '')

  const handleSimulateScan = () => {
    validateCoupon(code)
  }

  const handleRedeem = () => {
    if (id) {
      reserveCoupon(id)
      toast.success('Voucher resgatado e salvo em "Meus Vouchers"!')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center py-8 px-4 sm:py-12 animate-fade-in-up">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 -ml-4 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </Button>

        <Card className="overflow-hidden border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl relative bg-white">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary" />

          {image && !reserved && (
            <div className="w-full h-48 relative overflow-hidden bg-slate-100">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <Badge className="bg-white/95 text-black font-bold backdrop-blur-sm shadow-sm text-sm px-2.5 py-0.5">
                  {discount}
                </Badge>
              </div>
            </div>
          )}

          <CardContent
            className={cn(
              'p-6 sm:p-8 flex flex-col items-center text-center',
              reserved ? 'pt-8' : 'pt-6',
            )}
          >
            {!reserved ? (
              <>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-5 mt-2">
                  <Gift className="h-8 w-8 text-primary" />
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                  {title}
                </h1>
                <p className="text-slate-500 font-medium mb-6">{storeName}</p>

                <div className="bg-slate-50 p-5 rounded-xl text-left w-full mb-8 border border-slate-100 shadow-inner">
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-primary" /> Detalhes da
                    Campanha
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {description}
                  </p>
                </div>

                <Button
                  size="lg"
                  className="w-full h-14 text-base font-bold shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-xl"
                  onClick={handleRedeem}
                >
                  <QrCode className="mr-2 h-5 w-5" />
                  Resgatar Voucher
                </Button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-5">
                  <QrCode className="h-8 w-8 text-primary" />
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                  {title}
                </h1>
                <p className="text-slate-500 font-medium mb-2">{storeName}</p>
                <Badge
                  variant="secondary"
                  className="mb-6 font-bold text-primary bg-primary/10"
                >
                  {discount}
                </Badge>

                {/* Separator with cutouts */}
                <div className="w-full relative flex items-center mb-8">
                  <div className="w-6 h-6 bg-slate-50 rounded-full absolute -left-10 shadow-inner" />
                  <div className="flex-1 border-t-2 border-dashed border-slate-200" />
                  <div className="w-6 h-6 bg-slate-50 rounded-full absolute -right-10 shadow-inner" />
                </div>

                {/* QR Code Area */}
                <div className="relative mb-6 group w-full flex justify-center">
                  <div
                    className={cn(
                      'p-4 border-[3px] rounded-2xl transition-all duration-500 relative',
                      isUsed
                        ? 'border-slate-200 bg-slate-50'
                        : 'border-primary/20 bg-white shadow-sm',
                    )}
                  >
                    <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center relative overflow-hidden rounded-xl">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${code}&color=${isUsed ? '94a3b8' : '0f172a'}`}
                        alt="QR Code"
                        className={cn(
                          'w-full h-full object-contain transition-all duration-500',
                          isUsed && 'opacity-20 blur-[2px]',
                        )}
                      />

                      {isUsed && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px] animate-in zoom-in-95 duration-300">
                          <div className="bg-white p-4 rounded-full shadow-lg mb-3">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                          </div>
                          <span className="font-extrabold text-xl text-emerald-600 bg-white px-4 py-1 rounded-full shadow-sm">
                            Já Utilizado
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl w-full mb-6 flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">
                    Código do Voucher
                  </span>
                  <span
                    className={cn(
                      'text-2xl sm:text-3xl font-mono tracking-widest font-black transition-colors duration-300',
                      isUsed
                        ? 'text-slate-300 line-through decoration-slate-300/50'
                        : 'text-slate-800',
                    )}
                  >
                    {code}
                  </span>
                </div>

                <div className="text-sm text-slate-600 bg-blue-50/50 p-4 rounded-xl text-left w-full space-y-2 border border-blue-100/50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-blue-900/80">
                      {instructions}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action button to simulate merchant scanning */}
        {reserved && (
          <div className="mt-8 flex flex-col items-center">
            <p className="text-xs text-slate-500 mb-3 text-center font-medium px-4">
              Ação exclusiva para testes: Simula a leitura do QR Code pelo
              aplicativo do lojista.
            </p>
            <Button
              variant={isUsed ? 'secondary' : 'default'}
              size="lg"
              onClick={handleSimulateScan}
              disabled={isUsed}
              className={cn(
                'w-full gap-2 font-bold h-14 text-base transition-all duration-300 rounded-xl',
                isUsed
                  ? 'bg-slate-200 text-slate-500'
                  : 'shadow-md hover:-translate-y-0.5',
              )}
            >
              {isUsed ? (
                <>
                  <CheckCircle2 className="h-5 w-5" /> Voucher Validado
                </>
              ) : (
                <>
                  <ScanLine className="h-5 w-5" /> Simular Leitura do Lojista
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
