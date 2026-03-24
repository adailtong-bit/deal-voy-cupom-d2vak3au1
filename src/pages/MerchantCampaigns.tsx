import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import { CalendarIcon, Edit2, Megaphone, Plus, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MerchantCampaigns() {
  const { coupons, user, companies } = useCouponStore()
  const { formatDate } = useLanguage()
  const [editingCoupon, setEditingCoupon] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const myCompany =
    companies.find((c) => c.id === user?.companyId) || companies[0]
  const myCoupons = coupons.filter(
    (c) => c.companyId === myCompany.id && c.source !== 'aggregated',
  )

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingCoupon(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="container py-8 px-4 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <Megaphone className="h-6 w-6 text-primary" />
            Campanhas
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Crie e gerencie as ofertas da sua loja e controle a distribuição de
            cupons.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="w-full sm:w-auto font-bold shadow-md hover:-translate-y-0.5 transition-transform"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Campanha
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {myCoupons.map((coupon) => {
          const limit = coupon.totalLimit || coupon.totalAvailable || 100
          const used = coupon.reservedCount || 0
          const progress = Math.min(100, Math.round((used / limit) * 100))
          const isExpired = coupon.endDate
            ? new Date(coupon.endDate) < new Date()
            : false
          const isSoldOut = used >= limit

          let statusBadge = (
            <Badge variant="default" className="bg-emerald-500">
              Ativa
            </Badge>
          )
          if (isExpired) {
            statusBadge = <Badge variant="secondary">Expirada</Badge>
          } else if (isSoldOut) {
            statusBadge = (
              <Badge variant="destructive" className="bg-red-500">
                Esgotada
              </Badge>
            )
          }

          return (
            <Card
              key={coupon.id}
              className="overflow-hidden hover:shadow-md transition-all duration-300 border-slate-200"
            >
              <CardHeader className="pb-3 border-b bg-slate-50/50">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-xl text-slate-800 line-clamp-1 mb-1">
                      {coupon.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        {coupon.startDate ? formatDate(coupon.startDate) : '-'}{' '}
                        até {coupon.endDate ? formatDate(coupon.endDate) : '-'}
                      </span>
                    </div>
                  </div>
                  {statusBadge}
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-5">
                <div className="flex justify-between items-center text-sm font-medium bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">
                  <span className="text-slate-600">Desconto/Benefício:</span>
                  <span className="text-primary font-bold text-base">
                    {coupon.discount}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-end text-sm">
                    <span className="font-semibold text-slate-700">
                      Cota de Cupons
                    </span>
                    <span
                      className={cn(
                        'font-bold',
                        isSoldOut ? 'text-red-500' : 'text-slate-600',
                      )}
                    >
                      {used} / {limit} resgatados
                    </span>
                  </div>
                  <Progress
                    value={progress}
                    className={cn('h-2.5', isSoldOut && '[&>div]:bg-red-500')}
                  />
                  {isSoldOut && (
                    <p className="text-xs text-red-500 flex items-center gap-1.5 mt-1 font-medium">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Limite máximo atingido. Novos resgates bloqueados.
                    </p>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(coupon)}
                    className="font-medium text-slate-600 hover:text-primary hover:bg-primary/5"
                  >
                    <Edit2 className="h-4 w-4 mr-2" /> Editar Campanha
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {myCoupons.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-slate-300">
            <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-700">
              Nenhuma campanha criada
            </h3>
            <p className="text-slate-500 mt-1 max-w-md mx-auto">
              Você ainda não criou nenhuma oferta. Clique em "Nova Campanha"
              para começar a atrair clientes.
            </p>
          </div>
        )}
      </div>

      <CampaignFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        coupon={editingCoupon}
        companyId={myCompany.id}
      />
    </div>
  )
}
