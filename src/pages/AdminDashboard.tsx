import AdminDashboardComponent from '@/components/admin/AdminDashboard'
import { Button } from '@/components/ui/button'
import { clearCrawlerLogs, fetchCrawlerLogs } from '@/lib/api'
import { exportToCSV } from '@/lib/exportUtils'
import { Trash2, Download, History, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AdminDashboard() {
  const [isClearing, setIsClearing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [stats, setStats] = useState({
    totalFound: 0,
    totalImported: 0,
    totalSearches: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const logs = await fetchCrawlerLogs()
        let totalFound = 0
        let totalImported = 0
        logs.forEach((log) => {
          totalFound += Number(log.itemsFound || 0)
          totalImported += Number(log.itemsImported || 0)
        })
        setStats({
          totalFound,
          totalImported,
          totalSearches: logs.length,
        })
      } catch (e) {
        console.error('Error loading stats', e)
      }
    }
    loadStats()

    const sub = supabase
      .channel('crawler_logs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'crawler_logs' },
        loadStats,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(sub)
    }
  }, [])

  const handleClearHistory = async () => {
    if (
      !window.confirm(
        'Tem certeza que deseja limpar todo o histórico de buscas do sistema? Esta ação não pode ser desfeita.',
      )
    )
      return

    setIsClearing(true)
    try {
      const success = await clearCrawlerLogs()
      if (success) {
        toast.success('Histórico de buscas limpo com sucesso')
        setStats({ totalFound: 0, totalImported: 0, totalSearches: 0 })
        // Force reload to update inner component state after a short delay
        setTimeout(() => window.location.reload(), 1500)
      } else {
        toast.error('Erro ao limpar histórico. Tente novamente.')
      }
    } finally {
      setIsClearing(false)
    }
  }

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const logs = await fetchCrawlerLogs()
      if (logs && logs.length > 0) {
        const headers = [
          'Data e Hora',
          'Fonte/Loja',
          'Status',
          'Itens Encontrados',
          'Itens Importados',
          'Categoria',
          'Detalhes do Erro',
        ]
        const rows = logs.map((log) => [
          log.created ? new Date(log.created).toLocaleString('pt-BR') : '',
          log.storeName || log.sourceId || 'Busca Orgânica',
          log.status || 'concluído',
          (log.itemsFound ?? 0).toString(),
          (log.itemsImported ?? 0).toString(),
          log.category || 'Geral',
          log.errorMessage || '',
        ])
        exportToCSV(
          headers,
          rows,
          `historico_buscas_routevoy_${new Date().toISOString().split('T')[0]}.csv`,
        )
        toast.success('Histórico exportado com sucesso!')
      } else {
        toast.error('Nenhum dado encontrado para exportar.')
      }
    } catch (e) {
      toast.error('Erro ao exportar dados.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col">
      {/* Header Administrativo com Métricas do Histórico de Buscas */}
      <div className="sticky top-0 z-40 bg-white border-b px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shadow-md">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">
              Painel de Controle
            </h2>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <History className="w-3 h-3" />
                Buscas:{' '}
                <strong className="text-slate-900">
                  {stats.totalSearches}
                </strong>
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
              <span className="hidden sm:inline">
                Encontrados:{' '}
                <strong className="text-emerald-600">{stats.totalFound}</strong>
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
              <span className="hidden sm:inline">
                Importados:{' '}
                <strong className="text-blue-600">{stats.totalImported}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex-1 sm:flex-none bg-white border-slate-200 hover:bg-slate-50 font-medium"
          >
            <Download className="w-4 h-4 mr-2 text-slate-500" />
            Exportar CSV
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearHistory}
            disabled={isClearing}
            className="flex-1 sm:flex-none font-medium shadow-sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Histórico
          </Button>
        </div>
      </div>

      {/* Componente Administrativo Original */}
      <div className="flex-1 relative">
        <AdminDashboardComponent />
      </div>
    </div>
  )
}
