import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap } from 'lucide-react'

export function BehavioralTriggersTab({ coupons }: any) {
  const couponsWithTriggers = coupons.filter(
    (c: any) => c.behavioralTriggers && c.behavioralTriggers.length > 0,
  )

  if (couponsWithTriggers.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed rounded-2xl bg-white shadow-sm animate-fade-in-up">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="font-bold text-lg text-slate-700">
          Nenhum Gatilho Comportamental Ativo
        </h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">
          Você ainda não configurou recompensas automáticas para clientes fiéis.
          Adicione gatilhos ao criar uma campanha.
        </p>
      </div>
    )
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
                <Zap className="w-3 h-3 mr-1" /> Auto-Recompensa
              </Badge>
            </CardTitle>
            <CardDescription>
              Regras automatizadas para esta campanha
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {c.behavioralTriggers.map((t: any) => (
              <div
                key={t.id}
                className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-sm flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-slate-800 capitalize flex items-center gap-1.5 mb-0.5">
                    <Zap className="h-3.5 w-3.5 text-primary" /> Regra de{' '}
                    {t.type === 'visit' ? 'Visita' : t.type}
                  </p>
                  <p className="text-slate-500 font-medium">
                    Ativa a cada{' '}
                    <strong className="text-slate-700">{t.threshold}</strong>{' '}
                    {t.type === 'visit' ? 'visitas' : 'ações'}
                  </p>
                </div>
                <div className="text-right bg-slate-50 py-2 px-3 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                    Recompensa
                  </p>
                  <p className="font-black text-primary">{t.reward}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
