import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Trash2, PlusCircle, DollarSign } from 'lucide-react'

const AD_PLACEMENTS = [
  { id: 'top', label: 'Topo da Página (Header Hero)' },
  { id: 'bottom', label: 'Rodapé da Página (Footer)' },
  { id: 'sidebar', label: 'Barra Lateral (Sidebar)' },
  { id: 'search', label: 'Resultados de Busca' },
  { id: 'offer_of_the_day', label: 'Destaque: Oferta do Dia' },
]

export function AdPricingTab() {
  const [adPricing, setAdPricing] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, reset, watch, setValue } = useForm()

  const watchBillingType = watch('billingType')

  const fetchPricing = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('ad_pricing')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) {
        setAdPricing(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPricing()
  }, [])

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const payload = {
        placement: data.placement,
        billing_type: data.billingType,
        duration_days:
          data.billingType === 'fixed' ? parseInt(data.durationDays) : null,
        price: parseFloat(data.price?.replace(/\D/g, '') || '0') / 100,
      }

      const { data: inserted, error } = await supabase
        .from('ad_pricing')
        .insert(payload)
        .select()
        .single()
      if (error) throw error

      setAdPricing((prev) => [inserted, ...prev])
      toast.success('Tabela de Preço adicionada com sucesso!')
      reset()
    } catch (err: any) {
      toast.error('Erro ao adicionar preço na tabela.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta regra de preço?'))
      return
    try {
      const { error } = await supabase.from('ad_pricing').delete().eq('id', id)
      if (error) throw error
      setAdPricing((prev) => prev.filter((p) => p.id !== id))
      toast.success('Regra excluída com sucesso')
    } catch (e) {
      toast.error('Erro ao excluir regra')
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1">
        <Card className="border-primary/20 shadow-sm sticky top-4">
          <CardHeader className="bg-slate-50/50 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <PlusCircle className="w-5 h-5" />
              Cadastrar Novo Preço
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Onde vai aparecer? (Localização)</Label>
                <Select
                  onValueChange={(v) => setValue('placement', v)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o local de exibição" />
                  </SelectTrigger>
                  <SelectContent>
                    {AD_PLACEMENTS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Modelo de Cobrança</Label>
                <Select
                  onValueChange={(v) => setValue('billingType', v)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Tempo Fixo (Dias)</SelectItem>
                    <SelectItem value="cpc">CPC (Custo por Clique)</SelectItem>
                    <SelectItem value="cpa">CPA (Custo por Ação)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {watchBillingType === 'fixed' && (
                <div className="space-y-2">
                  <Label>Tempo que aparece (Em Dias)</Label>
                  <Input
                    type="number"
                    {...register('durationDays')}
                    required={watchBillingType === 'fixed'}
                    placeholder="Ex: 30"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Valor Base de Cobrança</Label>
                <Input
                  placeholder="Ex: R$ 1.500,00"
                  value={watch('price') || ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '')
                    if (!raw) {
                      setValue('price', '')
                      return
                    }
                    const formatted = new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(parseFloat(raw) / 100)
                    setValue('price', formatted, { shouldValidate: true })
                  }}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-bold shadow-md"
              >
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Salvar Preço
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="xl:col-span-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Tabela de Preços Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Onde vai aparecer</TableHead>
                      <TableHead>Modelo / Tempo</TableHead>
                      <TableHead>Valor de Cobrança</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adPricing.map((p) => {
                      const pLabel =
                        AD_PLACEMENTS.find((pl) => pl.id === p.placement)
                          ?.label || p.placement
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-semibold text-slate-800">
                            {pLabel}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold uppercase">
                                {p.billing_type}
                              </span>
                              <span className="text-sm text-slate-600">
                                {p.billing_type === 'fixed'
                                  ? `${p.duration_days} dias`
                                  : 'Contínuo'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-primary font-bold text-lg">
                              {formatCurrency(p.price || 0, 'BRL')}
                              {p.billing_type !== 'fixed' && (
                                <span className="text-xs font-normal text-slate-500">
                                  {' '}
                                  / {p.billing_type}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(p.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {adPricing.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-slate-500 py-16"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <DollarSign className="w-10 h-10 text-slate-300" />
                            <span className="text-lg font-medium text-slate-700">
                              Tabela de Preços Vazia
                            </span>
                            <span>
                              Cadastre as regras de precificação e tempo de
                              exibição para seus anúncios.
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
