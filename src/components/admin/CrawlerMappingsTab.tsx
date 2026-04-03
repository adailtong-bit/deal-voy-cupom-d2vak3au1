import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Settings2, FileJson, CheckCircle2 } from 'lucide-react'
import { CrawlerMappingWizard } from './CrawlerMappingWizard'

type SiteMapping = {
  id: string
  domain: string
  name: string
  mapping_rules: Record<string, string>
  created_at: string
}

export function CrawlerMappingsTab() {
  const { toast } = useToast()
  const [mappings, setMappings] = useState<SiteMapping[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  const fetchMappings = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('site_mappings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMappings((data as SiteMapping[]) || [])
    } catch (err: any) {
      console.error('Error fetching mappings', err)
      toast({
        title: 'Erro ao carregar',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMappings()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este mapeamento?')) return
    try {
      const { error } = await supabase
        .from('site_mappings')
        .delete()
        .eq('id', id)
      if (error) throw error
      setMappings(mappings.filter((m) => m.id !== id))
      toast({ title: 'Mapeamento removido com sucesso' })
    } catch (err: any) {
      toast({
        title: 'Erro ao remover',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Settings2 className="h-5 w-5 text-emerald-600" />
              Mapeamento Assistido (De/Para)
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Configure as regras exatas de extração dos 10 campos para cada
              site, garantindo 100% de precisão na curadoria.
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsWizardOpen(true)}
            className="gap-2 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Novo Mapeamento (Wizard)
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-slate-500">
              Carregando mapeamentos...
            </div>
          ) : mappings.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <FileJson className="h-10 w-10 text-slate-300 mb-3" />
              <h3 className="font-medium text-slate-900 mb-1">
                Nenhum mapeamento configurado
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mb-4">
                Crie seu primeiro mapeamento "De/Para" para ensinar o Crawler a
                ler perfeitamente os dados de um novo site.
              </p>
              <Button onClick={() => setIsWizardOpen(true)} variant="outline">
                Configurar Primeiro Site
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mappings.map((mapping) => (
                <div
                  key={mapping.id}
                  className="group flex flex-col p-5 border rounded-xl bg-white shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(mapping.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-emerald-100 text-emerald-700 p-1.5 rounded-md">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    <h4 className="font-semibold text-slate-900 truncate">
                      {mapping.name}
                    </h4>
                  </div>
                  <p className="text-sm font-medium text-blue-600 mb-4">
                    {mapping.domain}
                  </p>
                  <div className="mt-auto pt-4 border-t text-xs text-slate-500 flex justify-between items-center">
                    <span>
                      {Object.keys(mapping.mapping_rules).length} regras ativas
                    </span>
                    <span>
                      {new Date(mapping.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isWizardOpen && (
        <CrawlerMappingWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onSuccess={() => {
            setIsWizardOpen(false)
            fetchMappings()
          }}
        />
      )}
    </div>
  )
}
