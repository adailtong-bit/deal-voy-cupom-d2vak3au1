import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/stores/LanguageContext'
import {
  ArrowRightLeft,
  Link2,
  CheckCircle2,
  XCircle,
  Plane,
  Coins,
  Dog,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import * as Icons from 'lucide-react'

export function ExternalRewardsHub() {
  const { fetchCredits, connectedApps, connectApp, importFetchPoints } =
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

  const getIcon = (iconName: string) => {
    // @ts-expect-error - Icons are dynamic
    const Icon = Icons[iconName] || Link2
    return <Icon className="h-6 w-6" />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connectedApps.map((app) => (
          <Card
            key={app.id}
            className={cn(
              'border-l-4 overflow-hidden transition-all',
              app.connected
                ? `border-l-${app.color}-500 shadow-md`
                : 'border-l-slate-300 opacity-90',
            )}
            style={{
              borderLeftColor: app.connected ? `var(--${app.color}-500)` : '',
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div
                    className={cn(
                      'p-2 rounded-full text-white',
                      app.color === 'yellow'
                        ? 'bg-yellow-500'
                        : app.color === 'red'
                          ? 'bg-red-600'
                          : 'bg-orange-500',
                    )}
                  >
                    {getIcon(
                      app.icon.charAt(0).toUpperCase() + app.icon.slice(1),
                    )}
                  </div>
                  {app.name}
                </CardTitle>
                <Button
                  variant={app.connected ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => connectApp(app.id)}
                  className={
                    app.connected
                      ? 'text-red-500 hover:text-red-600 hover:bg-red-50'
                      : 'bg-primary'
                  }
                >
                  {app.connected ? 'Desconectar' : 'Conectar'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {app.connected ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Conectado • ID: 8839-XXXX
                  </div>
                  <div className="flex justify-between items-end border-t pt-2">
                    <span className="text-xs uppercase text-muted-foreground font-bold">
                      Saldo Disponível
                    </span>
                    <span className="text-xl font-bold">{app.points} pts</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-2">
                  Conecte para sincronizar seus pontos e trocar por benefícios.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h4 className="font-bold mb-4 flex items-center gap-2 text-lg">
          <ArrowRightLeft className="h-5 w-5 text-primary" />
          {t('rewards.import_points')}
        </h4>
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            type="number"
            placeholder="Quantidade de pontos"
            value={importAmount}
            onChange={(e) => setImportAmount(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleImport}
            disabled={
              !importAmount ||
              parseInt(importAmount) <= 0 ||
              !connectedApps.some((a) => a.connected)
            }
            className="md:w-32 bg-primary hover:bg-primary/90"
          >
            Importar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Selecione o programa parceiro automaticamente com base no saldo. Taxa
          de conversão variável.
        </p>
      </div>
    </div>
  )
}
