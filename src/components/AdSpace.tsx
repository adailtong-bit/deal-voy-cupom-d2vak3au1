import { useCouponStore } from '@/stores/CouponContext'
import { cn } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { Advertisement } from '@/lib/types'
import { getCategoryTranslationKey } from '@/lib/data'

interface AdSpaceProps {
  position?: 'top' | 'bottom'
  className?: string
  customAds?: Advertisement[]
}

export function AdSpace({ position, className, customAds }: AdSpaceProps) {
  const { ads: storeAds } = useCouponStore()
  const { t, formatCurrency } = useLanguage()

  const adsToUse = customAds || storeAds
  const availableAds = adsToUse.filter((ad) => ad.status === 'active')

  if (availableAds.length === 0) return null

  const adIndex =
    position === 'top' ? 0 : position === 'bottom' ? 1 : 0 % availableAds.length
  const ad = availableAds[adIndex] || availableAds[0]

  return (
    <div className={cn('w-full py-2 md:py-4 bg-slate-50', className)}>
      <div className="container mx-auto px-4">
        <div className="relative group overflow-hidden rounded-lg border border-slate-200 shadow-sm bg-white">
          <div className="absolute top-0 right-0 bg-slate-200 text-slate-500 text-[10px] px-2 py-0.5 z-10 font-medium">
            {t('ad.sponsored')}
          </div>
          <a
            href={ad.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-row items-center md:items-stretch h-full"
          >
            <div className="w-24 md:w-1/3 h-16 md:h-24 relative overflow-hidden shrink-0">
              <img
                src={
                  ad.image ||
                  `https://img.usecurling.com/p/600/200?q=${ad.category}`
                }
                alt={ad.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex-1 p-2 md:p-3 flex flex-col justify-center w-full min-w-0">
              <div className="flex items-center justify-between mb-0.5 md:mb-1">
                <span className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-wider truncate mr-2">
                  {t(getCategoryTranslationKey(ad.category))}
                </span>
                <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
              </div>
              <h4 className="font-bold text-xs md:text-base text-slate-800 line-clamp-1">
                {ad.title}
              </h4>
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mt-0.5 md:mt-1">
                {ad.price && (
                  <span className="font-bold text-green-600 text-xs">
                    {formatCurrency(ad.price, ad.currency)}
                  </span>
                )}
                <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-1 md:line-clamp-2">
                  {t('coupon.details')}
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
