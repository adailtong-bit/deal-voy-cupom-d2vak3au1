import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DiscoveredPromotion } from '@/lib/types'
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

interface CrawlerPromotionsTabProps {
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
}

export function CrawlerPromotionsTab({
  pendingPromotions,
}: CrawlerPromotionsTabProps) {
  const { t } = useLanguage()
  const [search, setSearch] = useState('')

  const filtered = pendingPromotions.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.storeName?.toLowerCase().includes(search.toLowerCase()) ||
      p.country?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <Input
          placeholder={t('common.search', 'Search verified items...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm bg-white"
        />
      </div>

      <div className="border rounded-xl overflow-x-auto bg-white shadow-sm">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-[11px] text-slate-500 uppercase font-semibold bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th className="px-5 py-4">Image</th>
              <th className="px-5 py-4">Title</th>
              <th className="px-5 py-4">Price</th>
              <th className="px-5 py-4">Site Name</th>
              <th className="px-5 py-4">Country of Origin</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-slate-500 bg-slate-50/30"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <span className="font-medium text-slate-600">
                      {t('admin.no_items', 'No verified items found.')}
                    </span>
                    <span className="text-xs">
                      Run a search from the Sources tab to populate data.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-5 py-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded shadow-sm border border-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs font-medium shadow-sm border border-slate-200">
                        No Img
                      </div>
                    )}
                  </td>
                  <td
                    className="px-5 py-4 font-medium max-w-[220px] truncate text-slate-800"
                    title={item.title}
                  >
                    {item.title}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">
                        {item.price
                          ? `${item.currency || '$'} ${item.price}`
                          : 'N/A'}
                      </span>
                      {item.discount && (
                        <span className="text-xs text-emerald-600 font-semibold tracking-wide">
                          {item.discount}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-700">
                    {item.storeName || item.rawData?.vendor || 'N/A'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                    {item.country || 'N/A'}
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 border-amber-200 shadow-none font-medium"
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      {(item.originalUrl || item.sourceUrl) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          asChild
                        >
                          <a
                            href={item.originalUrl || item.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4" />
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
