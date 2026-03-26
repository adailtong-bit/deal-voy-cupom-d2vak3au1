import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Smartphone, Globe, QrCode } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { CouponCard } from '@/components/CouponCard'

export function CustomerJourneyDialog({ coupon, open, onOpenChange }: any) {
  const { t, language, formatDate } = useLanguage()

  if (!coupon) return null

  const title = coupon.translations?.[language]?.title || coupon.title
  const description =
    coupon.translations?.[language]?.description || coupon.description
  const isOnline = coupon.offerType === 'online' || !!coupon.externalUrl

  const startDateStr = coupon.startDate
  const endDateStr = coupon.endDate || coupon.expiryDate

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden bg-slate-50">
        <DialogHeader className="p-5 bg-white border-b shrink-0 z-10 shadow-sm">
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <Smartphone className="w-5 h-5 text-primary" />
            {t('vendor.journey.title', 'Jornada do Cliente')}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto p-6 flex flex-col gap-6 relative">
          {/* Vertical line connecting steps */}
          <div className="absolute left-[39px] top-10 bottom-10 w-[2px] bg-slate-200 hidden sm:block" />

          {/* Step 1: Info */}
          <div className="flex flex-col sm:flex-row gap-4 relative z-10">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0 shadow-sm mx-auto sm:mx-0">
              1
            </div>
            <div className="flex-1 pb-4">
              <h3 className="font-bold text-slate-800 mb-3 text-center sm:text-left">
                {t('vendor.journey.step1', 'Descoberta no Feed')}
              </h3>
              <div className="max-w-[280px] mx-auto sm:mx-0 pointer-events-none ring-1 ring-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <CouponCard coupon={coupon} />
              </div>
            </div>
          </div>

          {/* Step 2: Voucher View */}
          <div className="flex flex-col sm:flex-row gap-4 relative z-10">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0 shadow-sm mx-auto sm:mx-0">
              2
            </div>
            <div className="flex-1 pb-4">
              <h3 className="font-bold text-slate-800 mb-3 text-center sm:text-left">
                {t('vendor.journey.step2', 'Detalhes da Oferta')}
              </h3>
              <Card className="overflow-hidden border-slate-200 shadow-sm max-w-[340px] mx-auto sm:mx-0">
                {coupon.image && (
                  <div className="aspect-video w-full relative">
                    <img
                      src={coupon.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <Badge className="absolute bottom-2 left-2 bg-white/95 text-black hover:bg-white">
                      {coupon.discount}
                    </Badge>
                  </div>
                )}
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h4 className="font-bold text-sm leading-tight mb-1">
                      {title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {description}
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-800 block mb-0.5">
                      {t('vendor.journey.validity', 'Validade:')}
                    </span>
                    <span className="block mb-2">
                      {startDateStr ? formatDate(startDateStr) : 'N/A'}{' '}
                      {t('common.to', 'até')}{' '}
                      {endDateStr ? formatDate(endDateStr) : 'N/A'}
                    </span>
                    <span className="font-semibold text-slate-800 block mb-0.5">
                      {t('vendor.journey.rules', 'Regras:')}
                    </span>
                    <span className="whitespace-pre-wrap block">
                      {coupon.instructions ||
                        t(
                          'vendor.journey.rules_default',
                          'Apresente este código no caixa.',
                        )}
                    </span>
                  </div>
                  <Button
                    className="w-full h-8 text-xs font-semibold pointer-events-none"
                    variant="default"
                  >
                    {isOnline
                      ? t('vouchers.go_to_store', 'Acessar Loja Online')
                      : t('vouchers.reserve', 'Reservar')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Step 3: Redemption View */}
          <div className="flex flex-col sm:flex-row gap-4 relative z-10">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0 shadow-sm mx-auto sm:mx-0">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 mb-3 text-center sm:text-left">
                {t('vendor.journey.step3', 'Resgate / Validação')}
              </h3>
              <Card className="border-[2px] border-primary/20 bg-white shadow-sm max-w-[340px] mx-auto sm:mx-0">
                <CardContent className="p-5 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    {isOnline ? (
                      <Globe className="w-6 h-6 text-primary" />
                    ) : (
                      <QrCode className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1">
                    {t(
                      'vendor.journey.redemption_title',
                      'Apresentar ao Lojista',
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    {isOnline
                      ? t(
                          'vendor.journey.online_desc',
                          'Copie o código para usar no site.',
                        )
                      : t(
                          'vendor.journey.qr_desc',
                          'O lojista irá escanear este QR Code.',
                        )}
                  </p>

                  {!isOnline ? (
                    <div className="p-2.5 border-2 border-slate-100 rounded-xl mb-4 bg-white">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${coupon.code || 'CODE'}&color=0f172a`}
                        alt="QR Code"
                        className="w-24 h-24"
                      />
                    </div>
                  ) : null}

                  <div className="bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-lg w-full">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">
                      {t('voucher_detail.voucher_code', 'Código do Voucher')}
                    </span>
                    <span className="text-lg font-mono tracking-widest font-black text-slate-800">
                      {coupon.code}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-200 shrink-0 flex justify-end z-10">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="font-semibold shadow-sm"
          >
            {t('common.back', 'Voltar')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
