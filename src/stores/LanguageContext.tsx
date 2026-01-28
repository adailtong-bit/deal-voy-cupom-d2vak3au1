import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '@/lib/translations'
import { formatDate, formatCurrency } from '@/lib/utils'

export type Language = 'pt' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'zh' | 'ja'

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

const LOCALE_MAP: Record<Language, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  zh: 'zh-CN',
  ja: 'ja-JP',
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt')

  useEffect(() => {
    const storedLang = localStorage.getItem('language') as Language
    if (storedLang && Object.keys(LOCALE_MAP).includes(storedLang)) {
      setLanguageState(storedLang)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string) => {
    const langObj = translations[language] || translations['pt']
    // @ts-expect-error - key indexing
    return langObj[key] || translations['pt'][key] || key
  }

  const locale = LOCALE_MAP[language] || 'en-US'

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
