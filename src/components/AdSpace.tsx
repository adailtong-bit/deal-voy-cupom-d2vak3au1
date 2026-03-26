import { useCouponStore } from '@/stores/CouponContext'
import { cn } from '@/lib/utils'
import { ImageOff } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { Advertisement } from '@/lib/types'
import { getCategoryTranslationKey } from '@/lib/data'
import { useState, useEffect } from 'react'

interface AdSpaceProps {
  position?: 'top' | 'bottom' | 'sidebar' | 'search'
  className?: string
  customAds?: Advertisement[]
  categoryContext?: string
}

export function AdSpace({
  position = 'top',
  className,
  customAds,
  categoryContext,
}: AdSpaceProps) {
  const { ads: storeAds } = useCouponStore()
  const { t } = useLanguage()
  const [imgError, setImgError] = useState(false)

  const adsToUse = customAds || storeAds
  const availableAds = adsToUse.filter(
    (ad) =>
      ad.status === 'active' &&
      ad.placement === position &&
      (!categoryContext ||
        categoryContext === 'all' ||
        ad.category === 'all' ||
        ad.category === categoryContext),
  )

  const ad = availableAds[0]

  useEffect(() => {
    setImgError(false)
  }, [ad?.id])

  if (!ad) return null

  return (
    <div className={cn('w-full py-1.5 md:py-2 bg-slate-50/50', className)}>
      <div className="container mx-auto px-4">
        <div className="relative group overflow-hidden rounded-md border border-slate-200 shadow-sm bg-white hover:border-primary/30 transition-colors">
          <div className="absolute top-0 right-0 bg-slate-100 text-slate-400 text-[8px] px-1.5 py-0.5 z-10 font-medium rounded-bl-sm uppercase tracking-wider">
            {t('ad.sponsored', 'Patrocinado')}
          </div>
          <a
            href={ad.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center h-14 md:h-16"
          >
            <div className="w-20 md:w-28 h-full relative overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
              {!imgError ? (
                <img
                  src={
                    ad.image ||
                    `https://img.usecurling.com/p/400/100?q=${ad.category || 'ad'}`
                  }
                  alt={ad.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={() => setImgError(true)}
                />
              ) : (
                <ImageOff className="h-4 w-4 text-slate-300" />
              )}
            </div>
            <div className="flex-1 px-3 py-1 flex flex-col justify-center min-w-0 h-full">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[9px] md:text-[10px] font-bold text-primary uppercase tracking-wider truncate mr-2">
                  {ad.category && ad.category !== 'all'
                    ? t(getCategoryTranslationKey(ad.category))
                    : t('ad.sponsored', 'Patrocinado')}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-xs md:text-sm text-slate-800 line-clamp-1 flex-1">
                  {ad.title}
                </h4>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

