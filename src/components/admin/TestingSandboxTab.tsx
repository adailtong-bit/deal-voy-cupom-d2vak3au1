import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useCouponStore } from '@/stores/CouponContext'

export function TestingSandboxTab() {
  const [email, setEmail] = useState('')
  const { validateCoupon } = useCouponStore()

  const handleTestValidation = () => {
    if (!email) {
      toast.error('Preencha o email para testar')
      return
    }

    try {
      const res = validateCoupon('TEST-CODE', email)
      if (res.success) {
        toast.success(res.message || 'Cupom validado com sucesso!')
      } else {
        toast.error(res.message || 'Erro ao validar cupom')
      }
    } catch (e: any) {
      toast.error(e.message || 'Erro inesperado durante a validação')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sandbox de Testes</CardTitle>
          <CardDescription>
            Área de simulação restrita para administradores e franqueados.
            Utilize estas ferramentas para garantir o funcionamento correto de
            validadores e integrações.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 max-w-sm">
            <div className="space-y-2">
              <Label>Email do Cliente (Simulação)</Label>
              <Input
                type="email"
                placeholder="cliente@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button onClick={handleTestValidation}>
              Simular Validação de Cupom
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
