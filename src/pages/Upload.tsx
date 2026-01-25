import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Lock, Briefcase } from 'lucide-react'

export default function Upload() {
  const navigate = useNavigate()

  // Restricted Access Screen
  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <Lock className="h-10 w-10 text-slate-400" />
      </div>
      <h1 className="text-3xl font-bold mb-4 text-slate-800">
        Acesso Restrito
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        O envio de campanhas e documentos é restrito a empresas parceiras
        verificadas. Por favor, acesse o painel corporativo.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => navigate('/')} variant="outline">
          Voltar ao Início
        </Button>
        <Button
          onClick={() => navigate('/vendor')}
          className="bg-primary hover:bg-primary/90 gap-2"
        >
          <Briefcase className="h-4 w-4" /> Acessar Painel B2B
        </Button>
      </div>
    </div>
  )
}
