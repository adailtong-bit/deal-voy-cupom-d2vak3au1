import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { Button } from '@/components/ui/button'
import { Megaphone, Plus } from 'lucide-react'
import { VendorCampaignsTab } from '@/components/vendor/VendorCampaignsTab'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'

export default function MerchantCampaigns() {
  const { coupons, user, companies } = useCouponStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const myCompany =
    companies.find((c) => c.id === user?.companyId) || companies[0]

  if (!myCompany) {
    return (
      <div className="container py-8 px-4 max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
              <Megaphone className="h-6 w-6 text-primary" />
              Minhas Promoções
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Nenhuma empresa associada ao seu perfil.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const myCoupons = coupons.filter(
    (c) => c.companyId === myCompany.id && c.source !== 'aggregated',
  )

  return (
    <div className="container py-8 px-4 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <Megaphone className="h-6 w-6 text-primary" />
            Minhas Promoções
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Crie, gerencie e acompanhe o desempenho das suas ofertas com uma
            visão detalhada.
          </p>
        </div>
        {myCoupons.length > 0 && (
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="w-full sm:w-auto font-bold shadow-md hover:-translate-y-0.5 transition-transform"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Promoção
          </Button>
        )}
      </div>

      <VendorCampaignsTab coupons={myCoupons} company={myCompany} />

      <CampaignFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        companyId={myCompany.id}
      />
    </div>
  )
}
