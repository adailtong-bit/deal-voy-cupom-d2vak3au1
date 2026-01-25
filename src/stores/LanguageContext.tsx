import React, { createContext, useContext, useState } from 'react'

type Language = 'pt' | 'en' | 'es'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  pt: {
    'nav.home': 'Início',
    'nav.explore': 'Explorar',
    'nav.saved': 'Salvos',
    'nav.upload': 'Subir Doc',
    'nav.profile': 'Perfil',
    'nav.travel': 'Planejar Viagem',
    'nav.vendor': 'Portal Vendedor',
    'nav.seasonal': 'Sazonal',
    'search.placeholder': 'Buscar lojas, marcas ou produtos...',
    'hero.title': 'Economize perto de você',
    'hero.subtitle':
      'Descubra cupons exclusivos e oportunidades imperdíveis na sua região.',
    'coupon.reserve': 'Reservar Cupom',
    'coupon.reserved': 'Reservado',
    'coupon.available': 'Disponíveis',
    'coupon.menu': 'Ver Menu Traduzido',
    'coupon.reviews': 'Avaliações',
    'coupon.add_review': 'Adicionar Avaliação',
    'coupon.rating': 'Sua nota',
    'coupon.comment': 'Seu comentário',
    'coupon.submit_review': 'Enviar Avaliação',
    'vendor.dashboard': 'Painel do Vendedor',
    'vendor.add': 'Adicionar Cupom',
    'travel.title': 'Planejador de Viagem',
    'seasonal.title': 'Calendário Sazonal',
    'notifications.title': 'Notificações',
    'notifications.empty': 'Sem novas notificações',
    'notifications.mark_read': 'Marcar como lida',
    'offline.mode': 'Modo Offline',
    'offline.message': 'Você está sem internet. Mostrando conteúdo salvo.',
    'common.view': 'Ver',
    'common.close': 'Fechar',
  },
  en: {
    'nav.home': 'Home',
    'nav.explore': 'Explore',
    'nav.saved': 'Saved',
    'nav.upload': 'Upload Doc',
    'nav.profile': 'Profile',
    'nav.travel': 'Trip Planner',
    'nav.vendor': 'Vendor Portal',
    'nav.seasonal': 'Seasonal',
    'search.placeholder': 'Search stores, brands or products...',
    'hero.title': 'Save near you',
    'hero.subtitle':
      'Discover exclusive coupons and unmissable opportunities in your area.',
    'coupon.reserve': 'Reserve Coupon',
    'coupon.reserved': 'Reserved',
    'coupon.available': 'Available',
    'coupon.menu': 'View Translated Menu',
    'coupon.reviews': 'Reviews',
    'coupon.add_review': 'Add Review',
    'coupon.rating': 'Your rating',
    'coupon.comment': 'Your comment',
    'coupon.submit_review': 'Submit Review',
    'vendor.dashboard': 'Vendor Dashboard',
    'vendor.add': 'Add Coupon',
    'travel.title': 'Trip Planner',
    'seasonal.title': 'Seasonal Calendar',
    'notifications.title': 'Notifications',
    'notifications.empty': 'No new notifications',
    'notifications.mark_read': 'Mark as read',
    'offline.mode': 'Offline Mode',
    'offline.message': 'You are offline. Showing saved content.',
    'common.view': 'View',
    'common.close': 'Close',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.explore': 'Explorar',
    'nav.saved': 'Guardados',
    'nav.upload': 'Subir Doc',
    'nav.profile': 'Perfil',
    'nav.travel': 'Planificar Viaje',
    'nav.vendor': 'Portal Vendedor',
    'nav.seasonal': 'Estacional',
    'search.placeholder': 'Buscar tiendas, marcas o productos...',
    'hero.title': 'Ahorra cerca de ti',
    'hero.subtitle':
      'Descubre cupones exclusivos y oportunidades imperdibles en tu zona.',
    'coupon.reserve': 'Reservar Cupón',
    'coupon.reserved': 'Reservado',
    'coupon.available': 'Disponibles',
    'coupon.menu': 'Ver Menú Traducido',
    'coupon.reviews': 'Reseñas',
    'coupon.add_review': 'Agregar Reseña',
    'coupon.rating': 'Tu calificación',
    'coupon.comment': 'Tu comentario',
    'coupon.submit_review': 'Enviar Reseña',
    'vendor.dashboard': 'Panel de Vendedor',
    'vendor.add': 'Agregar Cupón',
    'travel.title': 'Planificador de Viaje',
    'seasonal.title': 'Calendario Estacional',
    'notifications.title': 'Notificaciones',
    'notifications.empty': 'Sin nuevas notificaciones',
    'notifications.mark_read': 'Marcar como leída',
    'offline.mode': 'Modo Offline',
    'offline.message': 'Estás sin internet. Mostrando contenido guardado.',
    'common.view': 'Ver',
    'common.close': 'Cerrar',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('pt')

  const t = (key: string) => {
    return translations[language][key] || key
  }

  return React.createElement(
    LanguageContext.Provider,
    { value: { language, setLanguage, t } },
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
