import React from 'react'
import { useLanguage } from '@/stores/LanguageContext'

export function CrawlerPromotionsTab() {
  const { t } = useLanguage()
  return (
    <div className="p-4 text-muted-foreground">
      {t(
        'franchisee.crawler.promotions_content',
        'Crawler Promotions Tab Content',
      )}
    </div>
  )
}
