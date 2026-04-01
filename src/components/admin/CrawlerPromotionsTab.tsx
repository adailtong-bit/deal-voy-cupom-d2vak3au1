import { DiscoveredPromotion } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ExternalLink, Image as ImageIcon } from 'lucide-react'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'

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
}

export function CrawlerPromotionsTab({
  pendingPromotions,
  filterStore,
  setFilterStore,
  isLoading,
}: Props) {
  const { formatCurrency } = useRegionFormatting()

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex gap-4 mt-4">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Buscar por Nome do Site..."
            value={filterStore === 'all' ? '' : filterStore}
            onChange={(e) => setFilterStore(e.target.value || 'all')}
            className="bg-white"
          />
        </div>
      </div>

      <div className="border rounded-xl overflow-x-auto bg-white shadow-sm mt-4">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-[11px] text-slate-500 uppercase font-semibold bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th className="px-5 py-4 w-16">Imagem</th>
              <th className="px-5 py-4">Nome do Site</th>
              <th className="px-5 py-4">País de Origem</th>
              <th className="px-5 py-4">Preço</th>
              <th className="px-5 py-4 text-center">Link</th>
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
                  <td className="px-5 py-3">
                    {promo.image || promo.imageUrl ? (
                      <div className="w-12 h-12 rounded-md overflow-hidden border border-slate-200 bg-white shrink-0">
                        <img
                          src={promo.image || promo.imageUrl}
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
                      href={promo.sourceUrl || promo.originalUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 text-blue-600 hover:text-blue-800 text-[11px] uppercase tracking-wider font-bold bg-blue-50/50 px-3 py-2 rounded-md hover:bg-blue-100 transition-colors border border-blue-100"
                    >
                      Acessar <ExternalLink className="h-3.5 w-3.5" />
                    </a>
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
