import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  XCircle,
  ShieldCheck,
  Store,
  Users,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCouponStore } from '@/stores/CouponContext'
import { PendingApprovalsTab as MerchantApprovals } from '@/components/admin/hierarchy/PendingApprovalsTab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function AdminApprovalsTab() {
  const [pendingAffiliates, setPendingAffiliates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { companies } = useCouponStore()

  const pendingMerchants = companies.filter((c) => c.status === 'pending')

  const fetchPendingAffiliates = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_partners')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      if (error) throw error
      setPendingAffiliates(data || [])
    } catch (err: any) {
      console.error('Error fetching pending affiliates:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingAffiliates()
  }, [])

  const handleApproveAffiliate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('affiliate_partners')
        .update({ status: 'active' })
        .eq('id', id)
      if (error) throw error
      toast.success('Afiliado parceiro aprovado com sucesso!')
      fetchPendingAffiliates()
    } catch (err: any) {
      toast.error('Erro ao aprovar afiliado: ' + err.message)
    }
  }

  const handleRejectAffiliate = async (id: string) => {
    if (!confirm('Tem certeza que deseja rejeitar o cadastro deste afiliado?'))
      return
    try {
      const { error } = await supabase
        .from('affiliate_partners')
        .update({ status: 'suspended' })
        .eq('id', id)
      if (error) throw error
      toast.success('Cadastro de afiliado rejeitado.')
      fetchPendingAffiliates()
    } catch (err: any) {
      toast.error('Erro ao rejeitar: ' + err.message)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-800 flex justify-between">
              Lojistas Pendentes
              <Store className="h-4 w-4 text-amber-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">
              {pendingMerchants.length}
            </div>
            <p className="text-xs text-amber-600/80 mt-1">
              Aguardando validação da rede
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 flex justify-between">
              Afiliados Pendentes
              <Users className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {pendingAffiliates.length}
            </div>
            <p className="text-xs text-blue-600/80 mt-1">
              Aguardando verificação de documentos
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800 flex justify-between">
              Total de Aprovações
              <ShieldCheck className="h-4 w-4 text-slate-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {pendingMerchants.length + pendingAffiliates.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Ações requeridas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="merchants" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="merchants" className="gap-2">
            <Store className="w-4 h-4" /> Lojistas ({pendingMerchants.length})
          </TabsTrigger>
          <TabsTrigger value="affiliates" className="gap-2">
            <Users className="w-4 h-4" /> Afiliados ({pendingAffiliates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="merchants">
          <MerchantApprovals />
        </TabsContent>

        <TabsContent value="affiliates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aprovação de Afiliados Parceiros</CardTitle>
              <CardDescription>
                Revise os documentos (CPF/CNPJ) e valide o cadastro de novos
                afiliados antes de liberar o acesso à geração de links e
                repasses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-auto">
                <table className="w-full text-sm text-left">
                  <thead className="border-b bg-slate-50">
                    <tr>
                      <th className="p-4 font-medium text-slate-600">
                        Afiliado
                      </th>
                      <th className="p-4 font-medium text-slate-600">
                        Documento (CPF/CNPJ)
                      </th>
                      <th className="p-4 font-medium text-slate-600">
                        Data de Cadastro
                      </th>
                      <th className="p-4 font-medium text-slate-600 text-right">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingAffiliates.map((aff) => (
                      <tr
                        key={aff.id}
                        className="border-b hover:bg-slate-50/50"
                      >
                        <td className="p-4 font-medium">
                          {aff.name}
                          <div className="text-xs text-muted-foreground font-normal">
                            {aff.email}
                          </div>
                        </td>
                        <td className="p-4">
                          {aff.tax_id ? (
                            <Badge
                              variant="outline"
                              className="font-mono bg-slate-100"
                            >
                              <FileText className="w-3 h-3 mr-1" /> {aff.tax_id}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">
                              Não informado
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(aff.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectAffiliate(aff.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Rejeitar
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApproveAffiliate(aff.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Aprovar
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {pendingAffiliates.length === 0 && !loading && (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-8 text-center text-muted-foreground"
                        >
                          Nenhum afiliado aguardando aprovação no momento.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
