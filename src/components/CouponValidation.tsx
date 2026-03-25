import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { ScanLine, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@/stores/LanguageContext'

export function CouponValidation() {
  const { t } = useLanguage()
  return (
    <div className="animate-fade-in-up py-4">
      <Card className="max-w-xl mx-auto border-slate-200 shadow-md rounded-2xl overflow-hidden relative bg-white">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-5">
            <ScanLine className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            {t('vendor.validation.title', 'Validar Vouchers de Clientes')}
          </CardTitle>
          <CardDescription className="text-base mt-2 max-w-md mx-auto">
            {t(
              'vendor.validation.desc',
              'Utilize a ferramenta Scanner PDV para validar rapidamente os QR codes ou digitar códigos de vouchers manualmente no caixa.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-10 pt-6">
          <Button
            asChild
            size="lg"
            className="h-14 px-8 font-bold shadow-lg hover:-translate-y-0.5 transition-transform rounded-xl text-base"
          >
            <Link to="/merchant/scanner">
              {t('vendor.validation.open_scanner', 'Abrir Scanner PDV')}{' '}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
