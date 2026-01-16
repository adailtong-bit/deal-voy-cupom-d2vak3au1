import { useCouponStore } from '@/stores/CouponContext'
import { CouponCard } from '@/components/CouponCard'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { HeartOff } from 'lucide-react'

export default function Saved() {
  const { coupons, savedIds } = useCouponStore()
  const navigate = useNavigate()

  const savedCoupons = coupons.filter((c) => savedIds.includes(c.id))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        Meus Cupons Salvos
        <span className="text-sm font-normal text-muted-foreground ml-auto bg-muted px-3 py-1 rounded-full">
          {savedCoupons.length} itens
        </span>
      </h1>

      {savedCoupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {savedCoupons.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-muted p-6 rounded-full mb-4">
            <HeartOff className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            Você ainda não salvou nada
          </h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Explore as ofertas no mapa ou na lista e salve seus favoritos para
            ver depois.
          </p>
          <Button onClick={() => navigate('/explore')}>
            Começar a Explorar
          </Button>
        </div>
      )}
    </div>
  )
}
