import { DiscoveredPromotion } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  ExternalLink,
  Image as ImageIcon,
  Check,
  X,
  Trash2,
} from 'lucide-react'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { updatePromotionStatus, deletePromotion } from '@/services/crawler'
import { toast } from 'sonner'

interface Props {
  pendingPromotions: DiscoveredPromotion[]
  basePendingPromotions: DiscoveredPromotion[]
  filterState: string
  setFilterState: (v: string) => void
  filterCity: string
  setFilterCity: (v: string) => void
  filterStore: string
  setFilterStore: (v: string) => void
  filterSource: string
  setFilterSource: (v: string) => void
  filterCategory: string
  setFilterCategory: (v: string) => void
  filterFetchDate: string
  setFilterFetchDate: (v: string) => void
  isLoading?: boolean
  onStatusChange?: () => void
}

export function CrawlerPromotionsTab({
  pendingPromotions,
  filterStore,
  setFilterStore,
  isLoading,
  onStatusChange,
}: Props) {
  const { formatCurrency } = useRegionFormatting()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const toggleSelectAll = () => {
    if (selectedIds.length === pendingPromotions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(
        pendingPromotions.map((p) => p.id as string).filter(Boolean),
      )
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleBulkAction = async (action: 'approved' | 'rejected') => {
    if (selectedIds.length === 0) return
    setIsProcessing(true)
    try {
      await Promise.all(
        selectedIds.map((id) => updatePromotionStatus(id, action)),
      )
      toast.success(
        `Foram ${action === 'approved' ? 'aprovadas' : 'rejeitadas'} ${selectedIds.length} ofertas!`,
      )
      setSelectedIds([])
      if (onStatusChange) onStatusChange()
    } catch (e) {
      toast.error('Erro ao processar as ofertas')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    setIsProcessing(true)
    try {
      await updatePromotionStatus(id, action)
      toast.success(
        `Oferta ${action === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso!`,
      )
      if (onStatusChange) onStatusChange()
    } catch (e) {
      toast.error('Erro ao processar a oferta')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsProcessing(true)
    try {
      await deletePromotion(id)
      toast.success('Oferta excluída permanentemente!')
      if (onStatusChange) onStatusChange()
    } catch (e) {
      toast.error('Erro ao excluir a oferta')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-between">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Buscar por Nome do Site..."
            value={filterStore === 'all' ? '' : filterStore}
            onChange={(e) => setFilterStore(e.target.value || 'all')}
            className="bg-white"
          />
        </div>
        {selectedIds.length > 0 && (
          <div className="flex gap-2 items-center">
            <span className="text-sm text-slate-500 font-medium mr-2">
              {selectedIds.length} selecionados
            </span>
            <Button
              size="sm"
              variant="default"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => handleBulkAction('approved')}
              disabled={isProcessing}
            >
              <Check className="w-4 h-4 mr-1" /> Aprovar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleBulkAction('rejected')}
              disabled={isProcessing}
            >
              <X className="w-4 h-4 mr-1" /> Rejeitar
            </Button>
          </div>
        )}
      </div>

      <div className="border rounded-xl overflow-x-auto bg-white shadow-sm mt-4">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-[11px] text-slate-500 uppercase font-semibold bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th className="px-4 py-4 w-10">
                <Checkbox
                  checked={
                    selectedIds.length > 0 &&
                    selectedIds.length === pendingPromotions.length
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Selecionar todos"
                />
              </th>
              <th className="px-5 py-4 w-16">Imagem</th>
              <th className="px-5 py-4">Nome do Site</th>
              <th className="px-5 py-4">País de Origem</th>
              <th className="px-5 py-4">Preço</th>
              <th className="px-5 py-4 text-center">Link</th>
              <th className="px-5 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-slate-500 bg-slate-50/30"
                >
                  Carregando ofertas...
                </td>
              </tr>
            ) : pendingPromotions.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-slate-500 bg-slate-50/30"
                >
                  Nenhuma oferta pendente encontrada.
                </td>
              </tr>
            ) : (
              pendingPromotions.map((promo) => (
                <tr
                  key={promo.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3">
                    {promo.id && (
                      <Checkbox
                        checked={selectedIds.includes(promo.id)}
                        onCheckedChange={() => toggleSelect(promo.id as string)}
                        aria-label={`Selecionar ${promo.title}`}
                      />
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {promo.image || promo.imageUrl || promo.image_url ? (
                      <div className="w-12 h-12 rounded-md overflow-hidden border border-slate-200 bg-white shrink-0">
                        <img
                          src={promo.image || promo.imageUrl || promo.image_url}
                          alt={promo.title || 'Preview'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src =
                              'https://img.usecurling.com/p/100/100?q=product'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                        <ImageIcon className="h-5 w-5 opacity-50" />
                      </div>
                    )}
                  </td>
                  <td
                    className="px-5 py-4 font-medium text-slate-900 truncate max-w-[200px]"
                    title={promo.storeName || promo.siteName || '-'}
                  >
                    {promo.storeName || promo.siteName || '-'}
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    <Badge
                      variant="secondary"
                      className="font-normal bg-slate-100 text-slate-600 hover:bg-slate-100 shadow-none border-none"
                    >
                      {promo.country || promo.countryOfOrigin || 'Desconhecido'}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 font-semibold text-emerald-600">
                    {formatCurrency(promo.price || 0, promo.currency || 'USD')}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <a
                      href={
                        promo.productLink ||
                        promo.product_link ||
                        promo.sourceUrl ||
                        promo.originalUrl ||
                        promo.source_url ||
                        '#'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 text-blue-600 hover:text-blue-800 text-[11px] uppercase tracking-wider font-bold bg-blue-50/50 px-3 py-2 rounded-md hover:bg-blue-100 transition-colors border border-blue-100"
                    >
                      Acessar <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() =>
                          handleAction(promo.id as string, 'approved')
                        }
                        disabled={isProcessing}
                        title="Aprovar"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                        onClick={() =>
                          handleAction(promo.id as string, 'rejected')
                        }
                        disabled={isProcessing}
                        title="Rejeitar"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(promo.id as string)}
                        disabled={isProcessing}
                        title="Excluir"
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
  )
}
