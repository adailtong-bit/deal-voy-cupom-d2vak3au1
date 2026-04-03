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
import { Loader2, Save, Globe, ArrowLeftRight } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

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

        const titleKey = findKey(['title', 'name', 'produto', 'og_title'])
        if (titleKey) initialMapping['title'] = titleKey

        const descKey = findKey(['description', 'desc', 'og_description'])
        if (descKey) initialMapping['description'] = descKey

        const imgKey = findKey(['image', 'img', 'thumb', 'og_image'])
        if (imgKey) initialMapping['image_url'] = imgKey

        const priceKey = findKey(['price', 'preco', 'valor', 'amount'])
        if (priceKey) initialMapping['price'] = priceKey

        const domainKey = findKey(['domain', 'site'])
        if (domainKey) {
          initialMapping['store_name'] = domainKey
          initialMapping['campaign_name'] = domainKey
        }

        const urlKey = findKey(['url', 'link', 'og_url'])
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

  const handleSelectChange = (rawKey: string, newTargetId: string) => {
    setTargetToRaw((prev) => {
      const newMapping = { ...prev }

      // Remove any existing assignment for this rawKey
      const oldTargetId = Object.keys(newMapping).find(
        (t) => newMapping[t] === rawKey,
      )
      if (oldTargetId) {
        delete newMapping[oldTargetId]
      }

      if (newTargetId !== 'none') {
        newMapping[newTargetId] = rawKey
      }
      return newMapping
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      let domain =
        rawData.extracted_domain ||
        rawData.meta_domain ||
        rawData.meta_og_site_name
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

  const extractedKeys = Object.keys(rawData)

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className={
          step === 2
            ? 'max-w-7xl w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0'
            : 'sm:max-w-md'
        }
      >
        <DialogHeader
          className={step === 2 ? 'p-6 pb-4 border-b shrink-0 bg-white' : ''}
        >
          <DialogTitle>Mapeamento de Dados Reais</DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Insira a URL de um produto real para extrairmos os dados completos da página.'
              : 'As duas primeiras colunas exibem os dados reais extraídos. Na terceira, escolha para qual campo do banco esse dado deve ir.'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>URL de Exemplo (Produto Real)</Label>
              <Input
                placeholder="https://www.site.com/produto-exemplo"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              />
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
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 gap-6 font-semibold text-xs text-slate-500 p-4 border-b bg-slate-100 uppercase tracking-wider sticky top-0 z-10">
                  <div className="col-span-3">Chave Extraída (Tag)</div>
                  <div className="col-span-6">
                    Valor Real Encontrado na Página
                  </div>
                  <div className="col-span-3">Mapear para o Campo do Banco</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {extractedKeys.map((rawKey) => {
                    const rawValue = String(rawData[rawKey])
                    const selectedTargetId =
                      Object.keys(targetToRaw).find(
                        (t) => targetToRaw[t] === rawKey,
                      ) || 'none'
                    const isMapped = selectedTargetId !== 'none'

                    return (
                      <div
                        key={rawKey}
                        className={cn(
                          'grid grid-cols-12 gap-6 items-start p-4 transition-colors',
                          isMapped ? 'bg-emerald-50/30' : 'hover:bg-slate-50',
                        )}
                      >
                        <div className="col-span-3 flex flex-col gap-1">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 inline-flex w-fit px-2 py-1 rounded">
                            {rawKey}
                          </span>
                        </div>

                        <div className="col-span-6">
                          <div className="text-sm text-slate-600 whitespace-pre-wrap break-all leading-relaxed bg-white border border-slate-200 p-3 rounded-md shadow-sm">
                            {rawValue}
                          </div>
                        </div>

                        <div className="col-span-3">
                          <Select
                            value={selectedTargetId}
                            onValueChange={(val) =>
                              handleSelectChange(rawKey, val)
                            }
                          >
                            <SelectTrigger
                              className={cn(
                                'h-10 text-sm w-full font-medium shadow-sm transition-colors',
                                isMapped
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 focus:ring-emerald-500'
                                  : 'bg-white border-slate-300 focus:ring-blue-500',
                              )}
                            >
                              <SelectValue placeholder="Selecione o destino..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[400px]">
                              <SelectItem
                                value="none"
                                className="text-slate-400 italic"
                              >
                                Não mapear / Ignorar
                              </SelectItem>
                              {TARGET_FIELDS.map((f) => {
                                const isUsedByAnother =
                                  targetToRaw[f.id] &&
                                  targetToRaw[f.id] !== rawKey

                                return (
                                  <SelectItem
                                    key={f.id}
                                    value={f.id}
                                    disabled={!!isUsedByAnother}
                                    className="font-medium"
                                  >
                                    {f.label} {isUsedByAnother && `(Já em uso)`}
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>

                          {isMapped && (
                            <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1 font-medium">
                              <ArrowLeftRight className="w-3 h-3" />
                              Mapeado com sucesso
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-white flex justify-between items-center shrink-0">
              <div className="text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
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
                  Voltar e Usar Outra URL
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[200px]"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Confirmar Mapeamento
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
