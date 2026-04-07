import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import {
  DollarSign,
  Users,
  Wallet,
  Plus,
  Activity,
  RefreshCw,
  Edit2,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'

export function AdminAffiliatesTab() {
  const { formatCurrency } = useRegionFormatting()

  const [affiliates, setAffiliates] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingAffiliate, setEditingAffiliate] = useState<any>(null)

  const [selectedPendingId, setSelectedPendingId] = useState('')
  const [newModel, setNewModel] = useState('percentage')
  const [newRate, setNewRate] = useState('30')
  const [newFee, setNewFee] = useState('0')

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: affData, error: affErr } = await supabase
        .from('affiliate_partners')
        .select('*')
        .order('created_at', { ascending: false })

      if (affErr) throw affErr
      setAffiliates(affData || [])

      const { data: txData, error: txErr } = await supabase
        .from('affiliate_transactions')
        .select('*, affiliate_partners(name)')
        .order('created_at', { ascending: false })

      if (txErr) throw txErr
      setTransactions(txData || [])
    } catch (error: any) {
      toast.error('Erro ao buscar dados: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleLinkAffiliate = async () => {
    if (!selectedPendingId) {
      toast.error('Selecione um afiliado pendente.')
      return
    }
    try {
      const { error } = await supabase
        .from('affiliate_partners')
        .update({
          status: 'active',
          commission_model: newModel,
          commission_rate: parseFloat(newRate) || 0,
          monthly_fee: parseFloat(newFee) || 0,
        })
        .eq('id', selectedPendingId)

      if (error) throw error
      toast.success('Afiliado vinculado com sucesso!')
      setIsAddModalOpen(false)
      setSelectedPendingId('')
      fetchData()
    } catch (error: any) {
      toast.error('Erro ao vincular afiliado: ' + error.message)
    }
  }

  const handleUpdateAffiliate = async () => {
    if (!editingAffiliate) return
    try {
      const { error } = await supabase
        .from('affiliate_partners')
        .update({
          status: editingAffiliate.status,
          commission_model: editingAffiliate.commission_model,
          commission_rate: parseFloat(editingAffiliate.commission_rate) || 0,
          monthly_fee: parseFloat(editingAffiliate.monthly_fee) || 0,
        })
        .eq('id', editingAffiliate.id)

      if (error) throw error
      toast.success('Regras do afiliado atualizadas!')
      setEditingAffiliate(null)
      fetchData()
    } catch (error: any) {
      toast.error('Erro ao atualizar: ' + error.message)
    }
  }

  const handleDeleteAffiliate = async (id: string) => {
    if (
      !confirm(
        'Tem certeza que deseja excluir este afiliado? Esta ação não pode ser desfeita.',
      )
    )
      return
    try {
      const { error } = await supabase
        .from('affiliate_partners')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success('Afiliado excluído com sucesso!')
      fetchData()
    } catch (error: any) {
      toast.error('Erro ao excluir afiliado: ' + error.message)
    }
  }

  const totalPlatformFee = transactions.reduce(
    (acc, curr) => acc + (Number(curr.platform_fee) || 0),
    0,
  )
  const totalSales = transactions.reduce(
    (acc, curr) => acc + (Number(curr.sale_amount) || 0),
    0,
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex justify-between">
              Sub-Afiliados Ativos{' '}
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {affiliates.filter((a) => a.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Parceiros gerando tráfego
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex justify-between">
              Vendas Geradas{' '}
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">Volume total (GMV)</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800 flex justify-between">
              Seu Lucro Líquido <Wallet className="h-4 w-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(totalPlatformFee)}
            </div>
            <p className="text-xs text-green-600">
              Taxa da plataforma + Mensalidades
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="partners" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="partners" className="gap-2">
            <Users className="w-4 h-4" /> Parceiros e Regras
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <DollarSign className="w-4 h-4" /> Transações (Split)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gestão de Sub-Afiliados</h3>
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Vincular Afiliado
            </Button>
          </div>
          <Card>
            <div className="w-full overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="p-4 font-medium text-slate-600">
                      Nome do Afiliado
                    </th>
                    <th className="p-4 font-medium text-slate-600">Modelo</th>
                    <th className="p-4 font-medium text-slate-600">
                      Sua Fatia
                    </th>
                    <th className="p-4 font-medium text-slate-600">Status</th>
                    <th className="p-4 font-medium text-slate-600 text-right">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {affiliates.map((aff) => (
                    <tr key={aff.id} className="border-b hover:bg-slate-50/50">
                      <td className="p-4 font-medium">
                        {aff.name}
                        <div className="text-xs text-muted-foreground font-normal">
                          {aff.email}
                        </div>
                      </td>
                      <td className="p-4">
                        {aff.commission_model === 'percentage' ? (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            Split de Comissão
                          </Badge>
                        ) : aff.commission_model === 'monthly' ? (
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200"
                          >
                            SaaS (Mensal)
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">
                            Não configurado
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-green-600 font-semibold">
                        {aff.commission_model === 'percentage'
                          ? `${aff.commission_rate}%`
                          : aff.commission_model === 'monthly'
                            ? `${formatCurrency(aff.monthly_fee)}/mês`
                            : '-'}
                      </td>
                      <td className="p-4">
                        <Badge
                          className={`cursor-pointer ${aff.status === 'active' ? 'bg-green-100 text-green-800 border-none hover:bg-green-200' : 'bg-amber-100 text-amber-800 border-none hover:bg-amber-200'}`}
                          onClick={() => setEditingAffiliate(aff)}
                        >
                          {aff.status === 'active'
                            ? 'Ativo'
                            : aff.status === 'pending'
                              ? 'Pendente'
                              : 'Suspenso'}
                        </Badge>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingAffiliate(aff)}
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAffiliate(aff.id)}
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {affiliates.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-4 text-center text-muted-foreground"
                      >
                        Nenhum afiliado cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Auditoria de Comissões e Split
            </h3>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
            </Button>
          </div>
          <Card>
            <div className="w-full overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="p-4 font-medium text-slate-600">Data</th>
                    <th className="p-4 font-medium text-slate-600">
                      Produto / Parceiro
                    </th>
                    <th className="p-4 font-medium text-slate-600 text-right">
                      Venda Total
                    </th>
                    <th className="p-4 font-medium text-slate-600 text-right">
                      Comissão Bruta
                    </th>
                    <th className="p-4 font-bold text-green-700 text-right">
                      Seu Lucro (Taxa)
                    </th>
                    <th className="p-4 font-medium text-slate-600 text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-slate-50/50">
                      <td className="p-4 text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        {tx.product_name}
                        <div className="text-xs text-muted-foreground font-normal">
                          {tx.affiliate_partners?.name || 'Desconhecido'}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {formatCurrency(tx.sale_amount)}
                      </td>
                      <td className="p-4 text-right">
                        {formatCurrency(tx.total_commission)}
                      </td>
                      <td className="p-4 text-right font-bold text-green-600 bg-green-50/30">
                        +{formatCurrency(tx.platform_fee)}
                      </td>
                      <td className="p-4 text-center">
                        {tx.status === 'paid' ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            Pago
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200"
                          >
                            Pendente
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-4 text-center text-muted-foreground"
                      >
                        Nenhuma transação registrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-lg animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>Vincular Afiliado</CardTitle>
              <p className="text-sm text-muted-foreground">
                Selecione um parceiro pendente e defina a regra do seu lucro
                (Split).
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Selecionar Afiliado Pendente</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  value={selectedPendingId}
                  onChange={(e) => setSelectedPendingId(e.target.value)}
                >
                  <option value="">Selecione um afiliado...</option>
                  {affiliates
                    .filter((a) => a.status === 'pending')
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.email})
                      </option>
                    ))}
                </select>
                {affiliates.filter((a) => a.status === 'pending').length ===
                  0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    Nenhum afiliado pendente no momento. Os usuários precisam se
                    cadastrar marcando a opção "Afiliado Parceiro".
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Modelo de Comissão (Sua Fatia)</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                >
                  <option value="percentage">Porcentagem do Lucro Dele</option>
                  <option value="monthly">Mensalidade Fixa (SaaS)</option>
                </select>
              </div>
              {newModel === 'percentage' ? (
                <div className="space-y-2">
                  <Label>Sua Taxa (%)</Label>
                  <Input
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    type="number"
                  />
                  <p className="text-xs text-muted-foreground">
                    Você retém este percentual de todas as comissões dele.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Mensalidade (R$)</Label>
                  <Input
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                    type="number"
                  />
                  <p className="text-xs text-muted-foreground">
                    Valor fixo cobrado pelo uso da plataforma.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleLinkAffiliate}
                disabled={!selectedPendingId}
              >
                Vincular Parceiro
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {editingAffiliate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-lg animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>Editar Regras do Afiliado</CardTitle>
              <p className="text-sm text-muted-foreground">
                Ajuste o status e o split de comissão para{' '}
                <span className="font-semibold text-slate-800">
                  {editingAffiliate.name}
                </span>
                .
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status da Conta</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editingAffiliate.status}
                  onChange={(e) =>
                    setEditingAffiliate({
                      ...editingAffiliate,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="pending">
                    Pendente (Aguardando Aprovação)
                  </option>
                  <option value="active">Ativo (Liberado)</option>
                  <option value="suspended">Suspenso</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Modelo de Comissão (Sua Fatia)</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editingAffiliate.commission_model}
                  onChange={(e) =>
                    setEditingAffiliate({
                      ...editingAffiliate,
                      commission_model: e.target.value,
                    })
                  }
                >
                  <option value="percentage">Porcentagem do Lucro Dele</option>
                  <option value="monthly">Mensalidade Fixa (SaaS)</option>
                </select>
              </div>
              {editingAffiliate.commission_model === 'percentage' ? (
                <div className="space-y-2">
                  <Label>Sua Taxa (%)</Label>
                  <Input
                    value={editingAffiliate.commission_rate}
                    onChange={(e) =>
                      setEditingAffiliate({
                        ...editingAffiliate,
                        commission_rate: e.target.value,
                      })
                    }
                    type="number"
                  />
                  <p className="text-xs text-muted-foreground">
                    Você retém este percentual.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Mensalidade (R$)</Label>
                  <Input
                    value={editingAffiliate.monthly_fee}
                    onChange={(e) =>
                      setEditingAffiliate({
                        ...editingAffiliate,
                        monthly_fee: e.target.value,
                      })
                    }
                    type="number"
                  />
                  <p className="text-xs text-muted-foreground">
                    Valor fixo cobrado por mês.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditingAffiliate(null)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateAffiliate}>Salvar Alterações</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
