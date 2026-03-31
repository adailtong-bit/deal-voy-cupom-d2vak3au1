import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Play,
  Square,
  Loader2,
  Globe,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import {
  startExtractionTask,
  stopExtractionTask,
  getCrawlerProgress,
  subscribeCrawler,
} from '@/lib/crawlerTask'
import { cn } from '@/lib/utils'
import { CrawlerSourceForm } from './CrawlerSourceForm'
import { CrawlerSource } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

export function CrawlerSourcesTab() {
  const { toast } = useToast()
  const [sources, setSources] = useState<CrawlerSource[]>(() => {
    const saved = localStorage.getItem('crawler_sources')
    if (saved) return JSON.parse(saved)
    return [
      {
        id: '1',
        name: 'Promoções Globais Web',
        url: 'https://example.com/promos',
        type: 'web',
        region: 'Global',
        country: 'Brasil',
        state: 'SP',
        city: 'São Paulo',
        scanRadius: 50,
        status: 'active',
        lastScan: new Date(Date.now() - 86400000).toISOString(),
      },
    ]
  })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<CrawlerSource | null>(null)

  const [progress, setProgress] = useState(getCrawlerProgress())

  useEffect(() => {
    return subscribeCrawler(() => {
      setProgress({ ...getCrawlerProgress() })
    })
  }, [])

  useEffect(() => {
    localStorage.setItem('crawler_sources', JSON.stringify(sources))
  }, [sources])

  const pingUrl = async (url: string) => {
    try {
      await fetch(url, { method: 'HEAD', mode: 'no-cors' })
      return true
    } catch (e) {
      return false
    }
  }

  const handleSaveSource = async (
    data: Omit<CrawlerSource, 'id' | 'status' | 'lastScan'>,
  ) => {
    const isValid = await pingUrl(data.url)
    if (!isValid) {
      toast({
        title: 'URL Inválida ou Inacessível',
        description:
          'Não foi possível estabelecer conexão (Handshake) com a fonte. A entrada foi descartada.',
        variant: 'destructive',
      })
      return
    }

    if (editingSource) {
      setSources(
        sources.map((s) => (s.id === editingSource.id ? { ...s, ...data } : s)),
      )
      toast({ title: 'Fonte atualizada com sucesso' })
    } else {
      const newSource: CrawlerSource = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        status: 'active',
        lastScan: null,
      }
      setSources([newSource, ...sources])
      toast({ title: 'Fonte adicionada com sucesso' })
    }
    setIsFormOpen(false)
    setEditingSource(null)
  }

  const handleDelete = (id: string) => {
    setSources(sources.filter((s) => s.id !== id))
    toast({ title: 'Fonte removida' })
  }

  const handleStart = (source: CrawlerSource) => {
    if (progress.isScanning) return
    startExtractionTask(source.name, 50, source.type)
    setSources(
      sources.map((s) =>
        s.id === source.id ? { ...s, lastScan: new Date().toISOString() } : s,
      ),
    )
  }

  const handleStop = () => {
    stopExtractionTask()
  }

  const percentage =
    progress.total > 0 ? (progress.current / progress.total) * 100 : 0

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Globe className="h-5 w-5 text-blue-600" />
              Fontes de Dados (Data Sources)
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Gerencie e monitore as fontes de busca orgânica na web ou via API.
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              setEditingSource(null)
              setIsFormOpen(true)
            }}
            className="gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Adicionar Fonte
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Site</th>
                    <th className="px-4 py-3 font-medium">URL</th>
                    <th className="px-4 py-3 font-medium">Região / País</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Última Varredura</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sources.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        Nenhuma fonte de dados configurada.
                      </td>
                    </tr>
                  ) : (
                    sources.map((source) => (
                      <tr
                        key={source.id}
                        className="hover:bg-slate-50/50 transition-colors bg-white"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                          {source.name}
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline max-w-[200px] truncate block"
                          >
                            {source.url}
                          </a>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {source.country
                            ? `${source.country}${source.state ? ` - ${source.state}` : ''}`
                            : source.region}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                              source.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-700',
                            )}
                          >
                            {source.status === 'active' ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                            {source.status === 'active' ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {source.lastScan
                            ? new Date(source.lastScan).toLocaleString()
                            : 'Nunca'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => handleStart(source)}
                              disabled={progress.isScanning}
                            >
                              <Play className="h-3.5 w-3.5" />
                              Start
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-slate-600"
                              onClick={() => {
                                setEditingSource(source)
                                setIsFormOpen(true)
                              }}
                              disabled={progress.isScanning}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-red-600"
                              onClick={() => handleDelete(source.id)}
                              disabled={progress.isScanning}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {(progress.isScanning || progress.total > 0) && (
            <div className="space-y-5 p-5 mt-6 border rounded-xl bg-slate-50 shadow-inner">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                <span className="flex items-center gap-2">
                  {progress.isScanning && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                  {progress.isScanning
                    ? 'Executando Varredura...'
                    : 'Ciclo de Varredura Concluído'}
                </span>
                <span className="text-slate-500">
                  {progress.current} / {progress.total} verificados
                </span>
              </div>

              <Progress value={percentage} className="h-2.5 bg-slate-200" />

              <div className="grid grid-cols-3 gap-4 text-center mt-6">
                <div className="p-4 bg-white rounded-lg border shadow-sm flex flex-col justify-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {progress.found}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    Itens Encontrados
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg border shadow-sm flex flex-col justify-center">
                  <div className="text-3xl font-bold text-emerald-600">
                    {progress.imported}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    Validados & Importados
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg border shadow-sm flex flex-col justify-center">
                  <div className="text-3xl font-bold text-red-500">
                    {progress.errors}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    Descartados (Erros)
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-4 border-t border-slate-200 mt-4">
                {progress.isScanning && (
                  <Button
                    onClick={handleStop}
                    variant="destructive"
                    className="gap-2 w-full md:w-auto px-6 font-semibold shadow-sm"
                  >
                    <Square className="h-4 w-4" />
                    Parar Processo
                  </Button>
                )}
              </div>

              <div className="mt-4 bg-slate-900 text-slate-300 p-4 rounded-lg h-48 overflow-y-auto font-mono text-[11px] leading-relaxed shadow-inner border border-slate-800">
                {progress.logs.map((log, i) => (
                  <div
                    key={i}
                    className="mb-1.5 border-b border-slate-800/60 pb-1.5 break-words"
                  >
                    <span
                      className={cn(
                        'opacity-90',
                        log.includes('Fatal Error') && 'text-red-400 font-bold',
                        log.includes('Imported:') &&
                          'text-emerald-400 font-medium',
                        log.includes('Discarded') && 'text-amber-400',
                        log.includes('Initiating') &&
                          'text-blue-300 font-medium',
                        log.includes('Done.') && 'text-blue-300 font-medium',
                      )}
                    >
                      {log}
                    </span>
                  </div>
                ))}
                {progress.logs.length === 0 && (
                  <div className="opacity-40 italic">
                    Aguardando logs de execução...
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] w-[95vw]">
          <DialogHeader>
            <DialogTitle>
              {editingSource ? 'Editar Fonte de Dados' : 'Nova Fonte de Dados'}
            </DialogTitle>
            <DialogDescription>
              Configure os parâmetros e limites para a busca orgânica nesta
              fonte.
            </DialogDescription>
          </DialogHeader>
          <CrawlerSourceForm
            initialData={editingSource}
            onSave={handleSaveSource}
            userRegion="Global"
            isFranchisee={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
