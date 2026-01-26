import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/stores/LanguageContext'
import { ArrowRightLeft, Link2, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export function ExternalRewardsHub() {
  const { fetchCredits, isFetchConnected, connectFetch, importFetchPoints } =
    useCouponStore()
  const { t } = useLanguage()
  const [importAmount, setImportAmount] = useState('')

  const handleImport = () => {
    const amount = parseInt(importAmount)
    if (!isNaN(amount) && amount > 0) {
      importFetchPoints(amount)
      setImportAmount('')
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-yellow-500 overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <img
            src="https://img.usecurling.com/i?q=dog&color=yellow"
            alt="Fetch"
            className="w-32 h-32"
          />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <span className="bg-yellow-500 text-white p-1 rounded font-bold text-xs">
              FETCH
            </span>
            Rewards Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isFetchConnected ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="bg-yellow-100 p-4 rounded-full">
                <Link2 className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Conecte sua conta FETCH</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Sincronize seus pontos e use-os para resgatar recompensas
                  exclusivas no Deal Voy.
                </p>
              </div>
              <Button
                onClick={connectFetch}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-8"
              >
                {t('rewards.connect_fetch')}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-1 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-yellow-800">
                      {t('rewards.fetch_connected')}
                    </p>
                    <p className="text-xs text-yellow-600">ID: 8839-XXXX</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase">
                    {t('rewards.fetch_balance')}
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {fetchCredits.toFixed(0)} pts
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <ArrowRightLeft className="h-4 w-4 text-primary" />
                  {t('rewards.import_points')}
                </h4>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Quantidade"
                    value={importAmount}
                    onChange={(e) => setImportAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleImport}
                    disabled={
                      !importAmount ||
                      parseInt(importAmount) > fetchCredits ||
                      parseInt(importAmount) <= 0
                    }
                  >
                    Importar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Taxa de conversão: 1 FETCH = 1 Deal Voy Point
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
