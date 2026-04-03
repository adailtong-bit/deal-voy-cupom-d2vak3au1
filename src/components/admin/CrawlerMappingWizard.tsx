import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowRight, Save, Globe } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const MAPPING_FIELDS = [
  { id: 'partner', label: '1. Parceiro (Empresa)', placeholder: 'Ex: Amazon' },
  {
    id: 'campaign_name',
    label: '2. Nome da Campanha',
    placeholder: 'Ex: busca organica- site www.site.com',
  },
  {
    id: 'description',
    label: '3. Descrição (Texto Chamada)',
    placeholder: 'Chave do JSON ou CSS Selector',
  },
  {
    id: 'category',
    label: '4. Categoria (IA baseada no produto)',
    placeholder: 'Ex: breadcrumb_path',
  },
  {
    id: 'campaign_rules',
    label: '5. Regras de Campanha',
    placeholder: 'Ex: Conforme combinado previamente',
  },
  { id: 'url', label: '6. URL (Link exato)', placeholder: 'Ex: meta_url' },
  {
    id: 'image',
    label: '7. Imagem (1ª Imagem)',
    placeholder: 'Ex: main_image_src',
  },
  { id: 'coverage', label: '8. Abrangência', placeholder: 'Ex: toda a rede' },
  {
    id: 'discount_rules',
    label: '9. Regras de Desconto',
    placeholder: 'Ex: percentual',
  },
  {
    id: 'discount',
    label: '10. Desconto (Cálculo Valor)',
    placeholder: 'Ex: price_current',
  },
]

export function CrawlerMappingWizard({ isOpen, onClose, onSuccess }: Props) {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [rawData, setRawData] = useState<any>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})

  const handleFetch = async () => {
    if (!url) return toast({ title: 'URL obrigatória', variant: 'destructive' })
    setIsLoading(true)
    // Simulating raw extraction from a target site
    await new Promise((r) => setTimeout(r, 1500))
    try {
      const domain = new URL(
        url.startsWith('http') ? url : `https://${url}`,
      ).hostname.replace('www.', '')
      const mockData = {
        _meta: { url, domain },
        html_title: `Produto Fantástico Exemplo - ${domain}`,
        price_current: 'R$ 199,90',
        price_original: 'R$ 299,90',
        main_image_src: `https://img.usecurling.com/p/400/400?q=product&dpr=2`,
        product_description:
          'Detalhes completos e especificações técnicas extraídas do corpo da página.',
        breadcrumb: 'Home > Eletrônicos > Ofertas',
        discount_badge: '33% OFF',
      }
      setRawData(mockData)

      // Pre-fill sensible defaults as requested
      setMapping({
        partner: domain.split('.')[0].toUpperCase(),
        campaign_name: `busca organica- site www.${domain}`,
        description: 'product_description',
        category: 'breadcrumb',
        campaign_rules: 'Regras de campanha padrão da rede aplicáveis.',
        url: '_meta.url',
        image: 'main_image_src',
        coverage: 'toda a rede',
        discount_rules: 'percentual',
        discount: 'price_current',
      })
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

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const domain = rawData?._meta?.domain || 'unknown'
      const { error } = await supabase.from('site_mappings').upsert(
        {
          domain,
          name: `Mapeamento ${domain}`,
          mapping_rules: mapping,
        },
        { onConflict: 'domain' },
      )

      if (error) throw error
      toast({
        title: 'Mapeamento salvo com sucesso!',
        description: 'O Crawler agora usará esta regra para o site.',
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
            ? 'max-w-6xl w-[95vw] h-[85vh] flex flex-col p-0 gap-0'
            : 'sm:max-w-md'
        }
      >
        <DialogHeader
          className={step === 2 ? 'p-6 pb-4 border-b shrink-0' : ''}
        >
          <DialogTitle>Wizard de Mapeamento Assistido (De/Para)</DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Insira a URL de um produto do site que deseja mapear.'
              : 'Revise os dados brutos à esquerda e associe aos 10 parâmetros obrigatórios à direita.'}
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
                ? 'Extraindo dados brutos...'
                : 'Extrair Anúncio (Bruto)'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden bg-slate-50">
            {/* Left Panel: Raw JSON */}
            <div className="w-full md:w-1/2 flex flex-col border-r border-slate-200 bg-slate-950 text-emerald-400">
              <div className="p-3 border-b border-slate-800 bg-slate-900 text-slate-300 text-xs font-semibold uppercase tracking-wider">
                1. Anúncio Extraído (JSON Bruto)
              </div>
              <div className="p-4 overflow-y-auto text-xs font-mono whitespace-pre-wrap flex-1 custom-scrollbar">
                {JSON.stringify(rawData, null, 2)}
              </div>
            </div>

            {/* Right Panel: Mapping Fields */}
            <div className="w-full md:w-1/2 flex flex-col bg-white">
              <div className="p-3 border-b bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider">
                2. Associação (De/Para)
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MAPPING_FIELDS.map((field) => (
                    <div key={field.id} className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">
                        {field.label}
                      </Label>
                      <Input
                        className="h-9 text-xs font-mono bg-slate-50 focus:bg-white transition-colors"
                        placeholder={field.placeholder}
                        value={mapping[field.id] || ''}
                        onChange={(e) =>
                          setMapping({ ...mapping, [field.id]: e.target.value })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t bg-slate-50 flex justify-end gap-3 shrink-0">
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
