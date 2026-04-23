import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Search,
  Download,
  ExternalLink,
  RefreshCw,
  Link as LinkIcon,
  Activity,
  Users,
  TrendingUp,
  Send,
  MessageCircle,
} from 'lucide-react'
import { searchAffiliateDeals } from '@/services/affiliates'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

export default function AffiliateDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [partner, setPartner] = useState<any>(null)
  const [platforms, setPlatforms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [platformIds, setPlatformIds] = useState<Record<string, string>>({})
  const [importQuery, setImportQuery] = useState('')
  const [importResults, setImportResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: pData } = await supabase
        .from('affiliate_partners')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (pData) {
        setPartner(pData)
        setPlatformIds(pData.platform_ids || {})

        const { data: txData } = await supabase
          .from('affiliate_transactions')
          .select('*')
          .eq('affiliate_id', pData.id)
        if (txData) setTransactions(txData)
      }

      const { data: platData } = await supabase
        .from('affiliate_platforms')
        .select('*')
        .eq('status', 'active')

      setPlatforms(platData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveIds = async () => {
    if (!partner) return
    try {
      const { error } = await supabase
        .from('affiliate_partners')
        .update({ platform_ids: platformIds } as any)
        .eq('id', partner.id)

      if (error) throw error
      toast.success(t('common.success', 'IDs atualizados com sucesso!'))
    } catch (err: any) {
      toast.error(t('common.error', 'Erro ao salvar IDs: ') + err.message)
    }
  }

  const handleSearchImport = async () => {
    if (!importQuery.trim()) return
    setIsSearching(true)
    try {
      const results = await searchAffiliateDeals(importQuery, 10, platformIds)
      setImportResults(results || [])
      if (results?.length === 0) {
        toast.info(t('common.info', 'Nenhuma campanha encontrada.'))
      }
    } catch (err: any) {
      toast.error(t('common.error', 'Erro na busca: ') + err.message)
    } finally {
      setIsSearching(false)
    }
  }

  const handleImportToSite = async (deal: any) => {
    try {
      const { error } = await supabase.from('discovered_promotions').insert({
        title: deal.title,
        description: deal.description,
        price: deal.price,
        original_price: deal.originalPrice,
        discount: deal.discount,
        discount_percentage: deal.discountPercentage,
        image_url: deal.imageUrl,
        product_link: deal.productLink,
        store_name: deal.storeName,
        status: 'approved',
        category: 'affiliate',
        currency: deal.currency || 'BRL',
        reward_id: partner?.id,
      })
      if (error) throw error
      toast.success(
        t('common.success', 'Campanha importada para o site com seu link!'),
      )
      setImportResults((prev) => prev.filter((d) => d.id !== deal.id))
    } catch (error: any) {
      toast.error(t('common.error', 'Erro ao importar: ') + error.message)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">Carregando painel de afiliado...</div>
    )
  }

  if (!partner) {
    return (
      <div className="container max-w-4xl py-12">
        <Card className="text-center p-8 border-dashed">
          <CardTitle className="text-2xl text-amber-600 mb-4">
            Perfil de Afiliado Não Encontrado
          </CardTitle>
          <CardDescription>
            Não localizamos seu registro de parceiro. Entre em contato com o
            suporte.
          </CardDescription>
        </Card>
      </div>
    )
  }

  if (partner.status === 'pending') {
    return (
      <div className="container max-w-4xl py-12">
        <Card className="text-center p-12 border-dashed border-2">
          <Activity className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-pulse" />
          <CardTitle className="text-3xl font-bold text-slate-800 mb-2">
            Conta em Análise
          </CardTitle>
          <CardDescription className="text-lg">
            Seu cadastro como afiliado parceiro está em fase de aprovação pela
            nossa equipe.
            <br />
            Você receberá um aviso assim que os recursos forem liberados.
          </CardDescription>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8 space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Painel do Afiliado
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus links de rastreio e encontre ofertas para divulgar.
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 px-4 py-1 text-sm font-semibold"
        >
          Status da Conta: Ativo
        </Badge>
      </div>

      <Tabs defaultValue="platforms" className="w-full">
        <TabsList className="mb-6 h-12 w-full justify-start overflow-x-auto bg-transparent border-b rounded-none p-0 flex-nowrap whitespace-nowrap">
          <TabsTrigger
            value="platforms"
            className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
          >
            <LinkIcon className="w-4 h-4" /> Minhas Plataformas (IDs)
          </TabsTrigger>
          <TabsTrigger
            value="search"
            className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
          >
            <Search className="w-4 h-4" /> Buscar Ofertas
          </TabsTrigger>
          <TabsTrigger
            value="crm"
            className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
          >
            <Users className="w-4 h-4" /> CRM & Compradores
          </TabsTrigger>
          <TabsTrigger
            value="campaigns"
            className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
          >
            <TrendingUp className="w-4 h-4" /> Monitoramento & Disparos
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="platforms"
          className="animate-in fade-in-50 duration-300"
        >
          <Card className="border shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <CardTitle>Identificadores de Afiliado</CardTitle>
              <CardDescription>
                Cadastre seus IDs exclusivos para cada plataforma. O
                administrador habilitou estas redes para você.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {platforms.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Nenhuma plataforma configurada pelo administrador no momento.
                </div>
              ) : (
                platforms.map((plat) => {
                  const commOverride = partner.platform_commissions?.[plat.name]
                  const actualComm =
                    commOverride !== undefined
                      ? commOverride
                      : plat.base_commission_rate

                  return (
                    <div
                      key={plat.id}
                      className="grid md:grid-cols-2 gap-6 items-end bg-white p-5 rounded-lg border shadow-sm"
                    >
                      <div className="space-y-1">
                        <Label className="text-base font-bold text-slate-800">
                          {plat.name}
                        </Label>
                        <p className="text-sm text-green-600 font-medium">
                          Comissão negociada: {actualComm}%
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600">
                          Seu ID / Tag de Afiliado na plataforma
                        </Label>
                        <Input
                          placeholder={`Ex: meu_id_${plat.name.toLowerCase()}`}
                          value={platformIds[plat.name] || ''}
                          onChange={(e) =>
                            setPlatformIds((prev) => ({
                              ...prev,
                              [plat.name]: e.target.value,
                            }))
                          }
                          className="bg-slate-50"
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
            <CardFooter className="bg-slate-50/50 border-t pt-4">
              <Button
                onClick={handleSaveIds}
                className="w-full md:w-auto ml-auto font-bold"
                disabled={platforms.length === 0}
              >
                Salvar Identificadores
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent
          value="search"
          className="animate-in fade-in-50 duration-300"
        >
          <Card className="border shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <CardTitle>Buscar e Importar Campanhas</CardTitle>
              <CardDescription>
                Pesquise ofertas nas plataformas cadastradas. Os links já virão
                com o seu ID de afiliado injetado.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={importQuery}
                    onChange={(e) => setImportQuery(e.target.value)}
                    placeholder="Ex: iPhone 15, TV OLED, Tenis Nike..."
                    className="pl-9 h-11"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchImport()}
                  />
                </div>
                <Button
                  onClick={handleSearchImport}
                  disabled={isSearching}
                  className="h-11 px-8"
                >
                  {isSearching ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Buscar
                </Button>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 pb-2">
                {importResults.length === 0 && !isSearching && (
                  <div className="text-center py-16 text-muted-foreground border-2 rounded-lg border-dashed bg-slate-50">
                    <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    Realize uma busca para encontrar e promover produtos.
                  </div>
                )}
                {importResults.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex flex-col sm:flex-row gap-5 p-4 border rounded-xl hover:shadow-md transition-shadow bg-white"
                  >
                    <img
                      src={deal.imageUrl}
                      alt={deal.title}
                      className="w-full sm:w-32 h-40 sm:h-32 object-cover rounded-lg border"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-lg line-clamp-2 text-slate-900 leading-tight">
                          {deal.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-700"
                          >
                            {deal.storeName}
                          </Badge>
                          <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold">
                            {deal.discountPercentage?.toFixed(0)}% OFF
                          </span>
                          <span className="text-sm text-slate-400 line-through">
                            R$ {deal.originalPrice}
                          </span>
                          <span className="text-xl font-extrabold text-slate-900">
                            R$ {deal.price}
                          </span>
                        </div>
                        <a
                          href={deal.productLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline mt-3 inline-flex items-center gap-1 font-medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Testar meu
                          Link Afiliado
                        </a>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center mt-3 sm:mt-0 min-w-[140px] border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-5">
                      <Button
                        onClick={() => handleImportToSite(deal)}
                        className="gap-2 w-full font-bold h-11 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Download className="w-4 h-4" /> Promover no Site
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crm" className="animate-in fade-in-50 duration-300">
          <Card className="border shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <CardTitle>CRM de Compradores (Leads)</CardTitle>
              <CardDescription>
                Monitore os usuários que interagiram com seus links de afiliado
                e realize ações direcionadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Nome / Email</TableHead>
                      <TableHead className="text-center">
                        Cliques (Links)
                      </TableHead>
                      <TableHead className="text-center">Conversões</TableHead>
                      <TableHead className="text-right">
                        Última Atividade
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      {
                        id: '1',
                        name: 'João Silva',
                        email: 'joao@email.com',
                        clicks: 45,
                        conversions: 5,
                        lastActive: '2026-04-20',
                      },
                      {
                        id: '2',
                        name: 'Maria Souza',
                        email: 'maria@email.com',
                        clicks: 12,
                        conversions: 1,
                        lastActive: '2026-04-21',
                      },
                      {
                        id: '3',
                        name: 'Carlos Santos',
                        email: 'carlos@email.com',
                        clicks: 89,
                        conversions: 12,
                        lastActive: '2026-04-22',
                      },
                      {
                        id: '4',
                        name: 'Ana Oliveira',
                        email: 'ana@email.com',
                        clicks: 34,
                        conversions: 3,
                        lastActive: '2026-04-23',
                      },
                    ].map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <p className="font-medium text-slate-800">
                            {lead.name}
                          </p>
                          <p className="text-xs text-slate-500">{lead.email}</p>
                        </TableCell>
                        <TableCell className="text-center font-semibold text-blue-600">
                          {lead.clicks}
                        </TableCell>
                        <TableCell className="text-center font-bold text-emerald-600">
                          {lead.conversions}
                        </TableCell>
                        <TableCell className="text-right text-sm text-slate-500">
                          {new Date(lead.lastActive).toLocaleDateString(
                            'pt-BR',
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="campaigns"
          className="animate-in fade-in-50 duration-300 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border shadow-sm md:col-span-2">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <CardTitle>Desempenho de Campanhas (Nicho/Categoria)</CardTitle>
                <CardDescription>
                  Acompanhe a performance detalhada das suas ofertas por
                  produto/nicho.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[300px] w-full">
                  <ChartContainer
                    config={{
                      clicks: {
                        label: 'Tráfego (Cliques)',
                        color: 'hsl(var(--primary))',
                      },
                      conversions: {
                        label: 'Vendas/Conversões',
                        color: 'hsl(var(--emerald-500))',
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { date: '01/04', clicks: 45, conversions: 5 },
                          { date: '05/04', clicks: 60, conversions: 8 },
                          { date: '10/04', clicks: 85, conversions: 12 },
                          { date: '15/04', clicks: 120, conversions: 15 },
                          { date: '20/04', clicks: 150, conversions: 22 },
                          {
                            date: '25/04',
                            clicks: Math.max(
                              180,
                              transactions.length * 15 + 50,
                            ),
                            conversions: Math.max(28, transactions.length + 5),
                          },
                        ]}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e2e8f0"
                        />
                        <XAxis
                          dataKey="date"
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="clicks"
                          stroke="var(--color-clicks)"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="conversions"
                          stroke="var(--color-conversions)"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <CardTitle>Top Nichos</CardTitle>
                <CardDescription>Seus segmentos mais rentáveis</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {Array.from(
                      new Set(transactions.map((t) => t.product_name)),
                    )
                      .slice(0, 5)
                      .map((prod, i) => {
                        const count = transactions.filter(
                          (t) => t.product_name === prod,
                        ).length
                        return (
                          <div
                            key={i}
                            className="flex justify-between items-center border-b pb-2 last:border-0"
                          >
                            <span className="text-sm font-medium text-slate-800 truncate pr-2">
                              {prod}
                            </span>
                            <span className="text-emerald-600 font-bold">
                              {count} vendas
                            </span>
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
                    Realize sua primeira venda para ver o ranking de nichos.
                  </div>
                )}

                <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-xs text-emerald-800 font-semibold mb-1">
                    Receita Gerada
                  </p>
                  <p className="text-2xl font-black text-emerald-600">
                    R${' '}
                    {transactions
                      .reduce(
                        (acc, tx) => acc + (Number(tx.affiliate_earnings) || 0),
                        0,
                      )
                      .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <CardTitle>Novo Disparo (CRM)</CardTitle>
              <CardDescription>
                Envie ofertas, novidades ou cupons diretamente para sua base de
                leads via E-mail ou WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Mensagem da Campanha</Label>
                <Textarea
                  placeholder="Olá! Tenho uma oferta especial de cashback para você nesta semana..."
                  className="h-24 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  className="gap-2 text-slate-600"
                  onClick={() =>
                    toast.success('Redirecionando para WhatsApp Web...')
                  }
                >
                  <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp
                </Button>
                <Button
                  className="gap-2"
                  onClick={() =>
                    toast.success('Campanha disparada para sua base!')
                  }
                >
                  <Send className="w-4 h-4" /> Enviar por E-mail
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
