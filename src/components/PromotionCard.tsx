import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DiscoveredPromotion } from '@/lib/types'
import { ExternalLink, Tag } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

export function PromotionCard({
  promotion,
}: {
  promotion: DiscoveredPromotion
}) {
  const { t } = useLanguage()

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden group shrink-0">
        <img
          src={
            promotion.image || 'https://img.usecurling.com/p/400/300?q=shopping'
          }
          alt={promotion.title || 'Promotion image'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src =
              'https://img.usecurling.com/p/400/300?q=shopping'
          }}
        />
        {promotion.discount && (
          <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white font-bold px-2 py-1 shadow-sm border-none">
            {promotion.discount}
          </Badge>
        )}
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="text-xs text-slate-500 font-medium mb-1 truncate">
          {promotion.storeName || t('promotion.unknown_store', 'Loja Parceira')}
        </div>
        <h3
          className="font-bold text-lg leading-tight line-clamp-2 text-slate-800"
          title={promotion.title}
        >
          {promotion.title}
        </h3>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-end">
        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
          {promotion.description || promotion.title}
        </p>
        <div className="mt-auto">
          {promotion.price !== undefined && promotion.price !== null ? (
            <div className="flex items-center gap-1 font-bold text-primary text-xl">
              <span className="text-sm text-slate-500 font-normal">
                {t('promotion.price', 'Por:')}{' '}
              </span>
              <span>{promotion.currency || 'R$'}</span>
              <span>
                {Number(promotion.price).toFixed(2).replace('.', ',')}
              </span>
            </div>
          ) : (
            <div className="h-7" />
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button
          className="w-full font-semibold group/btn"
          asChild={!!promotion.originalUrl}
          variant={promotion.originalUrl ? 'default' : 'secondary'}
          disabled={!promotion.originalUrl}
        >
          {promotion.originalUrl ? (
            <a
              href={promotion.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('promotion.get_offer', 'Ver Oferta')}
              <ExternalLink className="w-4 h-4 ml-2 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
            </a>
          ) : (
            <span>
              <Tag className="w-4 h-4 mr-2" />
              {t('promotion.no_link', 'Indisponível')}
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
