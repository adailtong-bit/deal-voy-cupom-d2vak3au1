import { useCouponStore } from '@/stores/CouponContext'
import { useAuth } from '@/hooks/use-auth'
import AdminDashboardComponent from '@/components/admin/AdminDashboard'
import { Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function FranchiseeDashboard() {
  const { franchises } = useCouponStore()
  const { user, role } = useAuth()
  const navigate = useNavigate()

  const myFranchise = franchises.find(
    (f) =>
      f.ownerId === user?.id ||
      f.ownerId === user?.email ||
      f.email === user?.email ||
      f.contactEmail === user?.email,
  )

  if (!myFranchise && role === 'franchisee') {
    return (
      <div className="container py-16 text-center animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
        <Store className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Nenhuma franquia associada encontrada
        </h2>
        <p className="text-slate-500 mb-6 max-w-md">
          Seu perfil está configurado como Franqueado, mas ainda não existe uma
          unidade regional vinculada ao seu e-mail ({user?.email}).
          <br />
          <br />
          Entre em contato com o Administrador do sistema para que ele crie a
          sua franquia na aba "Hierarchy & Team".
        </p>
        <Button onClick={() => navigate('/')} variant="outline">
          Voltar para a Home
        </Button>
      </div>
    )
  }

  return <AdminDashboardComponent />
}
