import { useLanguage } from '@/stores/LanguageContext'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ExternalLink, Check, X, Tag } from 'lucide-react'
import { format } from 'date-fns'

export function CrawlerPromotionsTab({
  pendingPromotions,
  basePendingPromotions,
  filterState,
  setFilterState,
  filterCity,
  setFilterCity,
  filterStore,
  setFilterStore,
  filterSource,
  setFilterSource,
  filterCategory,
  setFilterCategory,
  filterFetchDate,
  setFilterFetchDate,
}: any) {
  const { t } = useLanguage()

  // Extract unique filters
  const states = Array.from(
    new Set(basePendingPromotions.map((p: any) => p.state).filter(Boolean)),
  )
  const cities = Array.from(
    new Set(basePendingPromotions.map((p: any) => p.city).filter(Boolean)),
  )
  const stores = Array.from(
    new Set(basePendingPromotions.map((p: any) => p.storeName).filter(Boolean)),
  )
  const sources = Array.from(
    new Set(basePendingPromotions.map((p: any) => p.sourceId).filter(Boolean)),
  )
  const categories = Array.from(
    new Set(basePendingPromotions.map((p: any) => p.category).filter(Boolean)),
  )
  const fetchDates = Array.from(
    new Set(
      basePendingPromotions
        .map((p: any) => (p.capturedAt ? p.capturedAt.split('T')[0] : ''))
        .filter(Boolean),
    ),
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 bg-slate-50 p-4 rounded-lg border">
        <Select value={filterStore} onValueChange={setFilterStore}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Loja" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Lojas</SelectItem>
            {stores.map((s: any) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Fonte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Fontes</SelectItem>
            {sources.map((s: any) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            {categories.map((c: any) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterFetchDate} onValueChange={setFilterFetchDate}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Data" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Qualquer Data</SelectItem>
            {fetchDates.map((d: any) => (
              <SelectItem key={d} value={d}>
                {format(new Date(d), 'dd/MM/yyyy')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterState} onValueChange={setFilterState}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Estados</SelectItem>
            {states.map((s: any) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterCity} onValueChange={setFilterCity}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Cidades</SelectItem>
            {cities.map((c: any) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {pendingPromotions.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground border rounded-lg bg-card">
          {t(
            'franchisee.crawler.no_pending',
            'Nenhuma oferta pendente encontrada.',
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pendingPromotions.map((promo: any) => {
            const currentPrice =
              promo.price || promo.currentPrice || promo.rawData?.currentPrice
            const originalPrice =
              promo.rawData?.originalPrice || promo.originalPrice
            const imageSrc = promo.image || promo.imageUrl
            const targetUrl = promo.originalUrl || promo.sourceUrl || '#'
            const currency = promo.currency || promo.rawData?.currency || '$'

            return (
              <Card
                key={promo.id}
                className="overflow-hidden flex flex-col bg-card hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-video bg-muted border-b">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={promo.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      Sem imagem
                    </div>
                  )}
                  {promo.discount && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge
                        variant="secondary"
                        className="bg-red-600 text-white font-bold border-none shadow-sm"
                      >
                        {promo.discount} OFF
                      </Badge>
                    </div>
                  )}
                  <Badge className="absolute top-2 left-2 shadow-sm bg-white/90 text-black hover:bg-white/90">
                    {promo.storeName}
                  </Badge>
                </div>
                <CardContent className="p-4 flex-1 flex flex-col gap-2">
                  <h4
                    className="font-semibold text-sm line-clamp-2"
                    title={promo.title}
                  >
                    {promo.title}
                  </h4>

                  <div className="flex items-end gap-2 mt-auto pt-2">
                    {currentPrice ? (
                      <span className="text-xl font-bold text-primary">
                        {currency}
                        {Number(currentPrice).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-xl font-bold text-primary">
                        Preço não extraído
                      </span>
                    )}
                    {originalPrice && (
                      <span className="text-sm text-muted-foreground line-through pb-0.5">
                        {currency}
                        {Number(originalPrice).toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span className="truncate max-w-[100px]">
                        {promo.category}
                      </span>
                    </div>
                    {promo.capturedAt && (
                      <span>
                        {format(new Date(promo.capturedAt), 'dd/MM/yyyy')}
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full"
                  >
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Acessar Link Original
                    </a>
                  </Button>
                  <div className="flex gap-2 w-full">
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button size="sm" variant="destructive" className="px-3">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
