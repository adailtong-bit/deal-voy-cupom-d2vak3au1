import React, { createContext, useContext, useState, ReactNode } from 'react'
import { translations, Language } from '@/lib/translations'

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (path: string) => string
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

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    return { language: 'pt', setLanguage: () => {}, t: (k: string) => k }
  }
  return context
}
