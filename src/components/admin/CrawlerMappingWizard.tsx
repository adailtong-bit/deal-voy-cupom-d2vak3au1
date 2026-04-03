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
import { Loader2, Save, Globe } from 'lucide-react'
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

        // Preenchimento inicial inteligente com dados reais (como sugestão)
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

  const extractedKeys = Object.keys(rawData).sort()

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className={
          step === 2
            ? 'max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0'
            : 'sm:max-w-md'
        }
      >
        <DialogHeader
          className={step === 2 ? 'p-6 pb-4 border-b shrink-0 bg-white' : ''}
        >
          <DialogTitle>Mapeamento de Dados Reais</DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Insira a URL de uma página para extrairmos os dados completos. Se for a home, tentaremos encontrar um produto nela.'
              : 'Na esquerda, selecione qual campo extraído corresponde ao campo do nosso banco. Na direita, veja todo o objeto JSON extraído.'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>URL de Exemplo (Produto ou Loja)</Label>
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
                ? 'Varrendo página e extraindo...'
                : 'Extrair Dados Reais'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto flex-1 custom-scrollbar">
              {/* Coluna Esquerda: Mapeamento */}
              <div className="space-y-4">
                <div className="sticky top-0 bg-slate-50 z-10 pb-2 border-b">
                  <h3 className="font-semibold text-lg text-slate-800">
                    Mapeamento dos Campos
                  </h3>
                  <p className="text-sm text-slate-500">
                    Defina de onde virá cada dado do banco.
                  </p>
                </div>

                <div className="space-y-4">
                  {TARGET_FIELDS.map((f) => {
                    const selectedRawKey = targetToRaw[f.id] || 'none'
                    const selectedValue =
                      selectedRawKey !== 'none'
                        ? String(rawData[selectedRawKey] || '')
                        : ''

                    return (
                      <div
                        key={f.id}
                        className={cn(
                          'bg-white p-4 rounded-lg border shadow-sm space-y-3 transition-colors',
                          selectedRawKey !== 'none'
                            ? 'border-emerald-200 bg-emerald-50/10'
                            : 'border-slate-200',
                        )}
                      >
                        <Label className="text-sm font-semibold text-slate-700">
                          {f.label}
                        </Label>
                        <Select
                          value={selectedRawKey}
                          onValueChange={(val) => handleSelectChange(f.id, val)}
                        >
                          <SelectTrigger
                            className={cn(
                              'w-full bg-white',
                              selectedRawKey !== 'none' &&
                                'border-emerald-500 ring-1 ring-emerald-500',
                            )}
                          >
                            <SelectValue placeholder="Selecione o dado extraído..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-[350px]">
                            <SelectItem
                              value="none"
                              className="text-slate-400 italic"
                            >
                              Não mapear (Deixar em branco)
                            </SelectItem>
                            {extractedKeys.map((key) => {
                              const rawVal = String(rawData[key])
                              const isLong = rawVal.length > 60
                              return (
                                <SelectItem
                                  key={key}
                                  value={key}
                                  className="py-2"
                                >
                                  <div className="flex flex-col gap-1 max-w-[300px]">
                                    <span className="font-mono text-xs font-bold text-slate-800">
                                      {key}
                                    </span>
                                    <span
                                      className="text-xs text-slate-500 truncate"
                                      title={rawVal}
                                    >
                                      {isLong
                                        ? rawVal.substring(0, 60) + '...'
                                        : rawVal}
                                    </span>
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>

                        {selectedRawKey !== 'none' && (
                          <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-100 break-words max-h-32 overflow-y-auto custom-scrollbar">
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                              Valor Exemplo:
                            </span>
                            {selectedValue}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Coluna Direita: Objeto Bruto */}
              <div className="space-y-4 flex flex-col h-full overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm">
                <div className="p-4 border-b bg-slate-100/50 shrink-0">
                  <h3 className="font-semibold text-lg text-slate-800">
                    JSON Bruto Extraído
                  </h3>
                  <p className="text-sm text-slate-500">
                    O Payload completo capturado pelo Crawler.
                  </p>
                </div>
                <div className="p-4 overflow-y-auto flex-1 custom-scrollbar bg-slate-900">
                  <pre className="text-emerald-400 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(rawData, null, 2)}
                  </pre>
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
