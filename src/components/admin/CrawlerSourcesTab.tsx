import React from 'react'
import { useLanguage } from '@/stores/LanguageContext'

export function CrawlerSourcesTab() {
  const { t } = useLanguage()
  return (
    <div className="p-4 text-muted-foreground">
      {t('franchisee.crawler.sources_content', 'Crawler Sources Tab Content')}
    </div>
  )
}
