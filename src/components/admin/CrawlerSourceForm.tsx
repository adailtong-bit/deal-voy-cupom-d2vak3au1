import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Play } from 'lucide-react'
import { startExtractionTask } from '@/lib/crawlerTask'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DialogFooter } from '@/components/ui/dialog'
import { REGIONS } from '@/lib/data'
import { CrawlerSource } from '@/lib/types'
import { fetchCategories } from '@/lib/api'

interface CrawlerSourceFormProps {
  initialData?: CrawlerSource | null
  onSave: (data: Omit<CrawlerSource, 'id' | 'status' | 'lastScan'>) => void
  userRegion: string
  isFranchisee: boolean
}

export function CrawlerSourceForm({
  initialData,
  onSave,
  userRegion,
  isFranchisee,
}: CrawlerSourceFormProps) {
  const { toast } = useToast()
  const [categories, setCategories] = useState<{ id: string; label: string }[]>(
    [],
  )

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories()
        setCategories(
          cats.map((c: any) => ({
            id: c.id,
            label: c.name || c.label || 'Categoria',
          })),
        )
      } catch (err) {
        console.error('Failed to load categories', err)
      }
    }
    loadCategories()
  }, [])

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'web',
    region: userRegion || 'Global',
    country: '',
    state: '',
    city: '',
    scanRadius: 50,
    maxResults: 200,
    category: '',
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        url: initialData.url,
        type: initialData.type,
        region: initialData.region,
        country: initialData.country || '',
        state: initialData.state || '',
        city: initialData.city || '',
        scanRadius: initialData.scanRadius || 50,
        maxResults: 200,
        category: initialData.category || '',
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name,
      url: formData.url,
      type: formData.type as 'web' | 'api' | 'app',
      region: formData.region,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      scanRadius: formData.scanRadius,
      category: formData.category,
    })
  }

  const handleStartSearch = () => {
    if (!formData.name && !formData.url) {
      toast({
        title: 'Dados Incompletos',
        description: 'Preencha o nome ou URL da fonte para iniciar a busca.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.category) {
      toast({
        title: 'Categoria Obrigatória',
        description: 'Selecione uma categoria antes de iniciar a busca.',
        variant: 'destructive',
      })
      return
    }

    startExtractionTask(
      formData.name || 'ofertas',
      formData.maxResults || 200,
      formData.url || 'all',
      {
        country: formData.country,
        state: formData.state,
        city: formData.city,
        category: formData.category,
      },
    )

    toast({
      title: 'Busca Iniciada',
      description: `Iniciando rastreamento para ${formData.name || formData.url}`,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full relative">
      <div className="space-y-4 overflow-y-auto p-1 pr-4 max-h-[65vh]">
        <div className="space-y-2">
          <Label>Nome do Site</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Ex: Ofertas Locais"
          />
        </div>
        <div className="space-y-2">
          <Label>URL / Link da Fonte</Label>
          <Input
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            required
            placeholder="https://"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo de Fonte</Label>
            <Select
              value={formData.type}
              onValueChange={(v) => setFormData({ ...formData, type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Website Scraper</SelectItem>
                <SelectItem value="api">JSON API</SelectItem>
                <SelectItem value="app">Mobile App Link</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Região Alvo</Label>
            <Select
              disabled={isFranchisee}
              value={formData.region}
              onValueChange={(v) => setFormData({ ...formData, region: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r.code} value={r.code}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>País</Label>
            <Input
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              placeholder="Ex: Brasil"
            />
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <Input
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              placeholder="Ex: SP"
            />
          </div>
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              placeholder="Ex: São Paulo"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(v) => setFormData({ ...formData, category: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <SelectItem key={c.id} value={c.label}>
                      {c.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="Geral" disabled>
                    Carregando categorias...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Raio de Busca (km)</Label>
            <Input
              type="number"
              value={formData.scanRadius}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  scanRadius: Number(e.target.value),
                })
              }
              min={1}
            />
          </div>
          <div className="space-y-2">
            <Label>Limite de Resultados</Label>
            <Input
              type="number"
              value={formData.maxResults}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxResults: Number(e.target.value),
                })
              }
              min={10}
              max={2000}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Parâmetros de Validação (Obrigatórios)</Label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked
                disabled
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Preço
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked
                disabled
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Link do Produto
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked
                disabled
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Imagem
            </label>
          </div>
          <p className="text-xs text-slate-500">
            Estes parâmetros são validados automaticamente pelo motor de busca
            na captura dos links.
          </p>
        </div>
      </div>
      <div className="pt-4 pb-2 bg-background border-t mt-4 z-10 shrink-0">
        <DialogFooter className="flex flex-col sm:flex-row justify-between w-full sm:justify-between gap-3">
          <Button
            type="button"
            onClick={handleStartSearch}
            className="bg-green-600 hover:bg-green-700 text-white shadow-md transition-all w-full sm:w-auto order-last sm:order-first"
          >
            <Play className="w-4 h-4 mr-2" fill="currentColor" />
            Iniciar Busca
          </Button>
          <Button type="submit" className="w-full sm:w-auto">
            Salvar Configuração
          </Button>
        </DialogFooter>
      </div>
    </form>
  )
}
