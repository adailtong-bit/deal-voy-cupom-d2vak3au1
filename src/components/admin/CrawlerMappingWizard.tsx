import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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
import { Loader2, Save, Globe, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const TARGET_FIELDS = [
  { id: 'store_name', label: 'Parceiro / Loja (Empresa)' },
  { id: 'campaign_name', label: 'Nome da Campanha' },
  { id: 'title', label: 'Título do Produto/Oferta' },
  { id: 'description', label: 'Descrição (Texto Chamada)' },
  { id: 'category', label: 'Categoria' },
  { id: 'product_link', label: 'URL do Produto (Link exato)' },
  { id: 'image_url', label: 'Imagem (URL da 1ª Imagem)' },
  { id: 'price', label: 'Preço Atual (Desconto)' },
  { id: 'original_price', label: 'Preço Original (Cheio)' },
  { id: 'discount', label: 'Texto do Desconto (Ex: 33% OFF)' },
  { id: 'discount_percentage', label: 'Percentual de Desconto Numérico' },
  { id: 'coverage', label: 'Abrangência' },
  { id: 'discount_rules', label: 'Regras de Desconto' },
]

export function CrawlerMappingWizard({ isOpen, onClose, onSuccess }: Props) {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [rawData, setRawData] = useState<Record<string, any>>({})
  const [targetToRaw, setTargetToRaw] = useState<Record<string, string>>({})

  const handleFetch = async () => {
    if (!url) return toast({ title: 'URL obrigatória', variant: 'destructive' })
    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke(
        'crawl-promotions',
        {
          body: { query: 'extract', limit: 1, options: { url } },
        },
      )

      if (error) throw error

      if (data?.items && data.items.length > 0) {
        const item = data.items[0]
        const extractedData = item.raw_data || {}

        if (Object.keys(extractedData).length === 0) {
          toast({
            title: 'Nenhum dado encontrado',
            description: 'Não foi possível extrair informações desta URL.',
            variant: 'destructive',
          })
          setIsLoading(false)
          return
        }

        setRawData(extractedData)

        // Preenchimento inicial inteligente com dados reais
        const initialMapping: Record<string, string> = {}
        const keys = Object.keys(extractedData)

        const findKey = (keywords: string[]) =>
          keys.find((k) => keywords.some((kw) => k.toLowerCase().includes(kw)))

        const titleKey = findKey(['title', 'name', 'produto'])
        if (titleKey) initialMapping['title'] = titleKey

        const descKey = findKey(['description', 'desc'])
        if (descKey) initialMapping['description'] = descKey

        const imgKey = findKey(['image', 'img', 'thumb'])
        if (imgKey) initialMapping['image_url'] = imgKey

        const priceKey = findKey(['price', 'preco', 'valor', 'amount'])
        if (priceKey) initialMapping['price'] = priceKey

        const domainKey = findKey(['domain', 'site'])
        if (domainKey) {
          initialMapping['store_name'] = domainKey
          initialMapping['campaign_name'] = domainKey
        }

        const urlKey = findKey(['url', 'link'])
        if (urlKey) initialMapping['product_link'] = urlKey

        setTargetToRaw(initialMapping)
        setStep(2)
      } else {
        throw new Error('Retorno vazio do crawler')
      }
    } catch (e: any) {
      toast({
        title: 'Erro na extração',
        description: e.message || 'Verifique a URL e tente novamente.',
        variant: 'destructive',
      })
    }
    setIsLoading(false)
  }

  const handleSelectChange = (targetId: string, rawKey: string) => {
    setTargetToRaw((prev) => {
      const newMapping = { ...prev }
      if (rawKey === 'none') {
        delete newMapping[targetId]
      } else {
        newMapping[targetId] = rawKey
      }
      return newMapping
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      let domain = rawData.extracted_domain || rawData.meta_domain
      if (!domain) {
        try {
          domain = new URL(
            url.startsWith('http') ? url : `https://${url}`,
          ).hostname.replace('www.', '')
        } catch (e) {
          domain = 'unknown'
        }
      }

      // Salvando o mapeamento exato: target_field -> raw_key
      const finalMapping = { ...targetToRaw }

      const { error } = await supabase.from('site_mappings').upsert(
        {
          domain,
          name: `Mapeamento ${domain}`,
          mapping_rules: finalMapping,
        },
        { onConflict: 'domain' },
      )

      if (error) throw error
      toast({
        title: 'Mapeamento salvo com sucesso!',
        description: 'O crawler agora utilizará estas regras exatas.',
      })
      onSuccess()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className={
          step === 2
            ? 'max-w-5xl w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0'
            : 'sm:max-w-md'
        }
      >
        <DialogHeader
          className={step === 2 ? 'p-6 pb-4 border-b shrink-0 bg-white' : ''}
        >
          <DialogTitle>Wizard de Mapeamento Assistido (De/Para)</DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Insira a URL de um produto do site que deseja mapear.'
              : 'Para cada campo do nosso banco (à esquerda), escolha qual dado bruto extraído (no meio) deve ser usado. Veja o resultado final à direita.'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>URL de Exemplo (Produto)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://www.site.com/produto-exemplo"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                />
              </div>
            </div>
            <Button
              onClick={handleFetch}
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Globe className="w-4 h-4 mr-2" />
              )}
              {isLoading
                ? 'Extraindo Dados Brutos...'
                : 'Extrair Dados do Anúncio'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-slate-50">
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="grid grid-cols-12 gap-4 font-semibold text-xs text-slate-500 p-4 border-b bg-slate-100 uppercase tracking-wider rounded-t-lg">
                  <div className="col-span-4">Campo no Nosso Banco</div>
                  <div className="col-span-4">Dado Bruto do Site</div>
                  <div className="col-span-4">Valor Encontrado (Prévia)</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {TARGET_FIELDS.map((field, idx) => {
                    const mappedRawKey = targetToRaw[field.id]
                    const previewValue = mappedRawKey
                      ? rawData[mappedRawKey]
                      : ''

                    return (
                      <div
                        key={field.id}
                        className="grid grid-cols-12 gap-4 items-center p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="col-span-4 flex items-center gap-2">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-medium text-slate-900">
                            {field.label}
                          </span>
                        </div>
                        <div className="col-span-4 flex items-center gap-3">
                          <Select
                            value={targetToRaw[field.id] || 'none'}
                            onValueChange={(val) =>
                              handleSelectChange(field.id, val)
                            }
                          >
                            <SelectTrigger className="h-9 text-sm w-full bg-white border-slate-200 focus:ring-emerald-500">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-64">
                              <SelectItem
                                value="none"
                                className="text-slate-500 italic"
                              >
                                Não mapear este campo
                              </SelectItem>
                              {Object.keys(rawData).map((rawKey) => {
                                const valStr = String(rawData[rawKey])
                                const displayVal =
                                  valStr.length > 40
                                    ? valStr.substring(0, 40) + '...'
                                    : valStr
                                return (
                                  <SelectItem
                                    key={rawKey}
                                    value={rawKey}
                                    className="font-mono text-xs"
                                  >
                                    <span className="font-bold text-slate-700">
                                      {rawKey}
                                    </span>
                                    <span className="text-slate-400 ml-2">
                                      ({displayVal})
                                    </span>
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                          <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                        </div>
                        <div className="col-span-4">
                          <div
                            className="text-sm text-emerald-700 font-medium truncate bg-emerald-50 px-3 py-2 rounded-md border border-emerald-100"
                            title={String(previewValue)}
                          >
                            {mappedRawKey && mappedRawKey !== 'none' ? (
                              String(previewValue)
                            ) : (
                              <span className="text-slate-400 italic font-normal">
                                Sem valor mapeado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">
                  Dados Brutos Extraídos da URL (Guia de Referência Real)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(rawData).map(([k, v]) => (
                    <div
                      key={k}
                      className="text-xs bg-white border border-blue-200 rounded-md px-3 py-2 flex flex-col gap-1 shadow-sm"
                      title={String(v)}
                    >
                      <span className="font-mono font-semibold text-blue-700">
                        {k}
                      </span>
                      <span className="text-slate-600 break-all line-clamp-2">
                        {String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-white flex justify-between items-center shrink-0">
              <div className="text-sm text-slate-500">
                <span className="font-bold text-emerald-600">
                  {
                    Object.keys(targetToRaw).filter(
                      (k) => targetToRaw[k] !== 'none',
                    ).length
                  }
                </span>{' '}
                de {TARGET_FIELDS.length} campos mapeados
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Voltar e Extrair Novamente
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Confirmar e Salvar Mapeamento
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
