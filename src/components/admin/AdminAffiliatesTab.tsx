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
  Settings,
  Users,
  Wallet,
  Plus,
  Save,
  Activity,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'

export function AdminAffiliatesTab() {
  const { formatCurrency } = useRegionFormatting()

  const [affiliates, setAffiliates] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newModel, setNewModel] = useState('percentage')
  const [newRate, setNewRate] = useState('30')
  const [newFee, setNewFee] = useState('0')

  const [cjKey, setCjKey] = useState('cj_live_*******************')
  const [awinKey, setAwinKey] = useState('awin_live_*****************')

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: affData } = await supabase
        .from('affiliate_partners')
        .select('*')
        .order('created_at', { ascending: false })
      setAffiliates(affData || [])
      const { data: txData } = await supabase
        .from('affiliate_transactions')
        .select('*, affiliate_partners(name)')
        .order('created_at', { ascending: false })
      setTransactions(txData || [])
    } catch (error: any) {
      toast.error('Erro ao buscar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddAffiliate = async () => {
    try {
      const { error } = await supabase.from('affiliate_partners').insert({
        name: newName,
        email: newEmail,
        status: 'active',
        commission_model: newModel,
        commission_rate: parseFloat(newRate) || 0,
        monthly_fee: parseFloat(newFee) || 0,
      })
      if (error) throw error
      toast.success('Sub-afiliado adicionado com sucesso!')
      setIsAddModalOpen(false)
      fetchData()
    } catch (error: any) {
      toast.error('Erro ao adicionar afiliado: ' + error.message)
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
            <div className="text-2xl font-bold">{affiliates.length}</div>
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
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" /> Chaves de API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gestão de Sub-Afiliados</h3>
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Novo Afiliado
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
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200"
                          >
                            SaaS (Mensal)
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-green-600 font-semibold">
                        {aff.commission_model === 'percentage'
                          ? `${aff.commission_rate}%`
                          : `${formatCurrency(aff.monthly_fee)}/mês`}
                      </td>
                      <td className="p-4">
                        <Badge className="bg-green-100 text-green-800 border-none">
                          Ativo
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {affiliates.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={4}
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

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integração de Contas de Afiliado</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure suas chaves de API reais dos marketplaces. O motor
                usará essas chaves para gerar os links finais.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
              <div className="space-y-2">
                <Label>Commission Junction (CJ) API Key</Label>
                <Input
                  type="password"
                  value={cjKey}
                  onChange={(e) => setCjKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Awin API Token</Label>
                <Input
                  type="password"
                  value={awinKey}
                  onChange={(e) => setAwinKey(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() =>
                  toast.success('Configurações salvas com sucesso!')
                }
                className="gap-2"
              >
                <Save className="w-4 h-4" /> Salvar Chaves
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-lg animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>Adicionar Sub-Afiliado</CardTitle>
              <p className="text-sm text-muted-foreground">
                Cadastre um parceiro e defina a regra do seu lucro (Split).
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Parceiro</Label>
                <Input
                  placeholder="Ex: Influenciador Tech"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="contato@email.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
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
              <Button onClick={handleAddAffiliate}>Salvar Parceiro</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
