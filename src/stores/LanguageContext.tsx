import React, { createContext, useContext, useState, ReactNode } from 'react'
import { translations, Language } from '@/lib/translations'
import {
  formatCurrency as utilsFormatCurrency,
  formatDate as utilsFormatDate,
} from '@/lib/utils'

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (path: string) => string
  formatCurrency: (amount: number, currency?: string) => string
  formatDate: (date: string | Date) => string
  locale: string
}

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('pt')

  const t = (path: string): string => {
    const keys = path.split('.')
    let current: any = translations[language]
    for (const key of keys) {
      if (!current || current[key] === undefined) {
        return path // Fallback to path string if not found
      }
      current = current[key]
    }
    return current
  }

  const locale =
    language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : 'pt-BR'

  const formatCurrency = (amount: number, currency?: string) => {
    return utilsFormatCurrency(amount, currency, locale)
  }

  const formatDate = (date: string | Date) => {
    return utilsFormatDate(date, locale)
  }

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, formatCurrency, formatDate, locale }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    return {
      language: 'pt',
      setLanguage: () => {},
      t: (k: string) => k,
      formatCurrency: (a: number, c?: string) =>
        utilsFormatCurrency(a, c, 'pt-BR'),
      formatDate: (d: string | Date) => utilsFormatDate(d, 'pt-BR'),
      locale: 'pt-BR',
    }
  }
  return context
}
