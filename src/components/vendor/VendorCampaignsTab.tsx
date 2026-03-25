import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  CalendarIcon,
  Edit2,
  ExternalLink,
  Megaphone,
  Plus,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function VendorCampaignsTab({
  coupons,
  company,
}: {
  coupons: any[]
  company: any
}) {
  const { formatDate } = useLanguage()
  const { deleteCoupon } = useCouponStore()
  const [editingCoupon, setEditingCoupon] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingCoupon(null)
    setIsDialogOpen(true)
  }

  if (!coupons || coupons.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-xl border border-dashed border-slate-300 animate-fade-in-up">
        <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-700">
          Nenhuma promoção encontrada
        </h3>
        <p className="text-slate-500 mt-1 max-w-md mx-auto mb-6">
          Você ainda não criou nenhuma oferta. Crie sua primeira promoção para
          atrair mais clientes e aumentar suas vendas.
        </p>
        <Button onClick={handleCreate} className="font-bold shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Criar Nova Promoção
        </Button>
        <CampaignFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          companyId={company?.id}
          coupon={editingCoupon}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {coupons.map((coupon) => {
          const limit = coupon.totalLimit || coupon.totalAvailable || 100
          const used = coupon.reservedCount || 0
          const progress = Math.min(100, Math.round((used / limit) * 100))
          const isExpired = coupon.endDate
            ? new Date(coupon.endDate) < new Date()
            : false
          const isSoldOut = used >= limit

          let statusBadge = (
            <Badge className="bg-emerald-500 border-none shadow-sm">
              Ativa
            </Badge>
          )
          if (isExpired)
            statusBadge = (
              <Badge variant="secondary" className="shadow-sm">
                Expirada
              </Badge>
            )
          else if (isSoldOut)
            statusBadge = (
              <Badge
                variant="destructive"
                className="bg-red-500 border-none shadow-sm"
              >
                Esgotada
              </Badge>
            )

          return (
            <Card
              key={coupon.id}
              className="overflow-hidden hover:shadow-md transition-all duration-300 border-slate-200 flex flex-col bg-white"
            >
              <div className="relative h-40 bg-slate-100 shrink-0">
                {coupon.image && (
                  <img
                    src={coupon.image}
                    alt={coupon.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute top-3 right-3">{statusBadge}</div>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-lg font-bold text-white line-clamp-1 shadow-sm leading-tight mb-1">
                    {coupon.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {coupon.startDate
                      ? formatDate(coupon.startDate)
                      : '-'} até{' '}
                    {coupon.endDate ? formatDate(coupon.endDate) : '-'}
                  </div>
                </div>
              </div>

              <CardContent className="pt-4 flex-1 flex flex-col gap-4 p-5">
                <div className="flex justify-between items-center text-sm font-medium bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-600">Desconto:</span>
                  <span className="text-primary font-bold text-base">
                    {coupon.discount}
                  </span>
                </div>

                <div className="space-y-2.5 mt-auto">
                  <div className="flex justify-between items-end text-sm">
                    <span className="font-semibold text-slate-700">
                      Resgates
                    </span>
                    <span
                      className={cn(
                        'font-bold text-xs',
                        isSoldOut ? 'text-red-500' : 'text-slate-600',
                      )}
                    >
                      {used} / {limit}
                    </span>
                  </div>
                  <Progress
                    value={progress}
                    className={cn('h-2', isSoldOut && '[&>div]:bg-red-500')}
                  />
                </div>

                <div className="pt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 mt-2">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-primary px-2"
                  >
                    <Link to={`/voucher/${coupon.id}`}>
                      <ExternalLink className="h-4 w-4 mr-1.5" /> Ver cliente
                    </Link>
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(coupon)}
                      className="text-slate-600 hover:text-primary hover:bg-primary/5"
                    >
                      <Edit2 className="h-4 w-4 mr-1.5" /> Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Promoção?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A promoção{' '}
                            <strong className="text-slate-800">
                              "{coupon.title}"
                            </strong>{' '}
                            será permanentemente removida e não estará mais
                            acessível aos clientes.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteCoupon(coupon.id)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold"
                          >
                            Excluir Promoção
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <CampaignFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        companyId={company?.id}
        coupon={editingCoupon}
      />
    </div>
  )
}
