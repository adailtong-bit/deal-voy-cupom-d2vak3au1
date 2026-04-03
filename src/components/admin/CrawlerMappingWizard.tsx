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

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const TARGET_FIELDS = [
  { id: 'partner', number: 1, label: 'Parceiro (Empresa)' },
  { id: 'campaign_name', number: 2, label: 'Nome da Campanha' },
  { id: 'description', number: 3, label: 'Descrição (Texto Chamada)' },
  { id: 'category', number: 4, label: 'Categoria (IA baseada no produto)' },
  { id: 'campaign_rules', number: 5, label: 'Regras de Campanha' },
  { id: 'url', number: 6, label: 'URL (Link exato)' },
  { id: 'image', number: 7, label: 'Imagem (1ª Imagem)' },
  { id: 'coverage', number: 8, label: 'Abrangência' },
  { id: 'discount_rules', number: 9, label: 'Regras de Desconto' },
  { id: 'discount', number: 10, label: 'Desconto (Cálculo Valor)' },
]

export function CrawlerMappingWizard({ isOpen, onClose, onSuccess }: Props) {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [rawData, setRawData] = useState<Record<string, any>>({})
  const [rawToTarget, setRawToTarget] = useState<Record<string, string>>({})

  const handleFetch = async () => {
    if (!url) return toast({ title: 'URL obrigatória', variant: 'destructive' })
    setIsLoading(true)
    // Simulating raw extraction from a target site
    await new Promise((r) => setTimeout(r, 1500))
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      const domain = urlObj.hostname.replace('www.', '')

      const mockData = {
        meta_domain: domain,
        meta_url: url,
        page_title: `Produto Fantástico Exemplo - ${domain}`,
        price_current: '199.90',
        price_original: '299.90',
        main_image_src: `https://img.usecurling.com/p/400/400?q=product&dpr=2`,
        product_description:
          'Detalhes completos e especificações técnicas extraídas do corpo da página.',
        breadcrumb_path: 'Home > Eletrônicos > Ofertas',
        discount_badge: '33% OFF',
        company_name: domain.split('.')[0].toUpperCase(),
      }
      setRawData(mockData)
      setRawToTarget({})
      setStep(2)
    } catch (e) {
      toast({
        title: 'URL Inválida',
        description: 'Verifique o formato da URL e tente novamente.',
        variant: 'destructive',
      })
    }
    setIsLoading(false)
  }

  const handleSelectChange = (rawKey: string, targetId: string) => {
    setRawToTarget((prev) => {
      const newMapping = { ...prev }
      // Remove any existing assignment of this targetId
      if (targetId !== 'none') {
        Object.keys(newMapping).forEach((k) => {
          if (newMapping[k] === targetId) {
            delete newMapping[k]
          }
        })
      }
      if (targetId === 'none') {
        delete newMapping[rawKey]
      } else {
        newMapping[rawKey] = targetId
      }
      return newMapping
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const domain = rawData.meta_domain || 'unknown'

      const finalMapping: Record<string, string> = {}
      // Build final mapping: targetId -> rawKey
      Object.entries(rawToTarget).forEach(([rawKey, targetId]) => {
        if (targetId && targetId !== 'none') {
          finalMapping[targetId] = rawKey
        }
      })

      // Adicionando valores fixos para campos que podem não ser mapeados,
      // mas são requeridos logicamente pelo sistema.
      if (!finalMapping['coverage']) finalMapping['coverage'] = 'toda a rede'
      if (!finalMapping['discount_rules'])
        finalMapping['discount_rules'] = 'percentual'
      if (!finalMapping['campaign_rules'])
        finalMapping['campaign_rules'] = 'Regras padrão aplicáveis'
      if (!finalMapping['partner'] && rawData.company_name)
        finalMapping['partner'] = 'company_name'

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
        description: 'O banco de dados agora possui o De/Para correto.',
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
            ? 'max-w-4xl w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0'
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
              : 'Associe os dados extraídos do site aos nossos 10 campos no banco de dados.'}
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
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Globe className="w-4 h-4 mr-2" />
              )}
              {isLoading
                ? 'Buscando dados na URL...'
                : 'Trazer Dados do Anúncio'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-slate-50">
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="grid grid-cols-12 gap-4 font-semibold text-xs text-slate-500 p-4 border-b bg-slate-100 uppercase tracking-wider rounded-t-lg">
                  <div className="col-span-5">Valor Encontrado no Site</div>
                  <div className="col-span-3">Chave Origem</div>
                  <div className="col-span-4">Numerar no Nosso Banco</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {Object.entries(rawData).map(([key, value]) => (
                    <div
                      key={key}
                      className="grid grid-cols-12 gap-4 items-center p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className="col-span-5 text-sm font-medium text-slate-900 truncate"
                        title={String(value)}
                      >
                        {String(value)}
                      </div>
                      <div
                        className="col-span-3 text-xs font-mono text-slate-500 truncate"
                        title={key}
                      >
                        {key}
                      </div>
                      <div className="col-span-4">
                        <Select
                          value={rawToTarget[key] || 'none'}
                          onValueChange={(val) => handleSelectChange(key, val)}
                        >
                          <SelectTrigger className="h-9 text-xs w-full bg-white border-slate-200 hover:bg-slate-50">
                            <SelectValue placeholder="Não mapear" />
                          </SelectTrigger>
                          <SelectContent className="max-h-64">
                            <SelectItem
                              value="none"
                              className="text-slate-500 italic"
                            >
                              Não mapear este dado
                            </SelectItem>
                            {TARGET_FIELDS.map((f) => (
                              <SelectItem
                                key={f.id}
                                value={f.id}
                                className="font-medium"
                              >
                                <span className="text-emerald-600 mr-2 font-bold">
                                  {f.number}.
                                </span>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-white flex justify-between items-center shrink-0">
              <div className="text-sm text-slate-500">
                <span className="font-bold text-emerald-600">
                  {Object.keys(rawToTarget).length}
                </span>{' '}
                de {TARGET_FIELDS.length} campos mapeados
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Voltar
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
                  Testar e Salvar Mapeamento
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
