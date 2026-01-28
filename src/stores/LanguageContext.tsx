import React, { createContext, useContext, useState } from 'react'
import { translations } from '@/lib/translations'
import { formatDate, formatCurrency } from '@/lib/utils'

type Language = 'pt' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  formatDate: (date: string | Date | undefined) => string
  formatCurrency: (amount: number, currency?: string) => string
  locale: string
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('pt')

  const t = (key: string) => {
    const langObj = translations[language] || translations['pt']
    // @ts-expect-error - key indexing
    return langObj[key] || translations['pt'][key] || key
  }

  const locale = language === 'pt' ? 'pt-BR' : 'en-US'

  const formattedDate = (date: string | Date | undefined) =>
    formatDate(date, locale)

  const formattedCurrency = (amount: number, currency: string = 'BRL') =>
    formatCurrency(amount, currency, locale)

  return React.createElement(
    LanguageContext.Provider,
    {
      value: {
        language,
        setLanguage,
        t,
        formatDate: formattedDate,
        formatCurrency: formattedCurrency,
        locale,
      },
    },
    children,
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
