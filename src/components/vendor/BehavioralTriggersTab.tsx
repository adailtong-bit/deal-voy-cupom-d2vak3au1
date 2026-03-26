import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

export function BehavioralTriggersTab({ coupons }: any) {
  const { t } = useLanguage()
  const couponsWithTriggers = coupons.filter(
    (c: any) =>
      c.behavioralTriggers &&
      c.behavioralTriggers.length > 0 &&
      c.behavioralTriggers.some((t: any) => t.isActive),
  )

  if (couponsWithTriggers.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed rounded-2xl bg-white shadow-sm animate-fade-in-up">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="font-bold text-lg text-slate-700">
          {t('vendor.behavioral.empty_title', 'Lógica e Metas (Gatilhos)')}
        </h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">
          {t(
            'vendor.behavioral.empty_desc',
            'Você não possui campanhas com metas rastreáveis ativas. Adicione gatilhos ao criar ou editar uma campanha para automatizar recompensas.',
          )}
        </p>
      </div>
    )
  }

  const getTypeLabel = (type: string) => {
    return t(`triggers.${type}`, type)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in-up">
      {couponsWithTriggers.map((c: any) => (
        <Card key={c.id} className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b bg-slate-50/50">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="truncate pr-2">{c.title}</span>
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none shrink-0"
              >
                <Zap className="w-3 h-3 mr-1" />{' '}
                {t('vendor.behavioral.auto_reward', 'Auto-Recompensa')}
              </Badge>
            </CardTitle>
            <CardDescription>
              {t(
                'vendor.behavioral.rules_desc',
                'Regras automatizadas para esta campanha',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {c.behavioralTriggers
              .filter((t: any) => t.isActive)
              .map((tTrigger: any) => (
                <div
                  key={tTrigger.id}
                  className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-sm flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-800 capitalize flex items-center gap-1.5 mb-0.5">
                      <Zap className="h-3.5 w-3.5 text-primary" />{' '}
                      {t('vendor.behavioral.goal_of', 'Meta de')}{' '}
                      {getTypeLabel(tTrigger.type)}
                    </p>
                    <p className="text-slate-500 font-medium mt-1">
                      {t(
                        'vendor.behavioral.upon_reaching',
                        'Ao atingir a meta de',
                      )}{' '}
                      <strong className="text-slate-700 bg-slate-100 px-1 rounded">
                        {tTrigger.threshold}
                      </strong>
                    </p>
                  </div>
                  <div className="text-right bg-slate-50 py-2 px-3 rounded-lg border border-slate-100 max-w-[150px]">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                      {t('vendor.behavioral.reward', 'Recompensa')}
                    </p>
                    <p
                      className="font-bold text-primary text-sm truncate"
                      title={tTrigger.reward}
                    >
                      {tTrigger.reward}
                    </p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
