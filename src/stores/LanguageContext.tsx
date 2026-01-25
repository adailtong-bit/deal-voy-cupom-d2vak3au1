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
    'nav.travel': 'Roteiros',
    'nav.vendor': 'Portal B2B',
    'nav.seasonal': 'Sazonal',
    'search.placeholder': 'Onde você quer economizar hoje?',
    'hero.title': 'Deal Voy: Economia em movimento',
    'hero.subtitle':
      'Descubra descontos exclusivos e planeje roteiros inteligentes na sua região.',
    'coupon.reserve': 'Pegar Cupom',
    'coupon.reserved': 'Cupom Garantido',
    'coupon.available': 'Disponíveis',
    'coupon.menu': 'Ver Menu Traduzido',
    'coupon.reviews': 'Avaliações',
    'coupon.add_review': 'Adicionar Avaliação',
    'coupon.rating': 'Sua nota',
    'coupon.comment': 'Seu comentário',
    'coupon.submit_review': 'Enviar Avaliação',
    'coupon.loyalty': 'Programa de Fidelidade',
    'coupon.collect_stamp': 'Você tem selos acumulados',
    'coupon.reward': 'Recompensa',
    'coupon.report': 'Reportar Problema',
    'coupon.verify': 'Esta oferta ainda está ativa?',
    'coupon.verified_at': 'Verificado em',
    'upload.history': 'Histórico',
    'upload.camera': 'Câmera',
    'upload.pending': 'Em Análise',
    'upload.verified': 'Verificado',
    'upload.rejected': 'Rejeitado',
    'mood.title': 'Qual sua vibe hoje?',
    'common.refresh': 'Atualizar Ofertas',
    'travel.title': 'Planejador de Viagem',
    'seasonal.title': 'Calendário Sazonal',
    'notifications.title': 'Notificações',
    'notifications.empty': 'Sem novas notificações',
    'notifications.mark_read': 'Marcar como lida',
    'offline.mode': 'Modo Offline',
    'offline.message': 'Você está offline. Exibindo roteiros baixados.',
    'common.view': 'Ver',
    'common.close': 'Fechar',
    'vendor.dashboard': 'Painel do Parceiro',
    'vendor.add': 'Nova Campanha',
  },
  en: {
    'nav.home': 'Home',
    'nav.explore': 'Explore',
    'nav.saved': 'Saved',
    'nav.upload': 'Upload Doc',
    'nav.profile': 'Profile',
    'nav.travel': 'Itineraries',
    'nav.vendor': 'B2B Portal',
    'nav.seasonal': 'Seasonal',
    'search.placeholder': 'Where do you want to save today?',
    'hero.title': 'Deal Voy: Savings in Motion',
    'hero.subtitle':
      'Discover exclusive discounts and plan smart itineraries in your area.',
    'coupon.reserve': 'Get Coupon',
    'coupon.reserved': 'Coupon Secured',
    'coupon.available': 'Available',
    'coupon.menu': 'View Translated Menu',
    'coupon.reviews': 'Reviews',
    'coupon.add_review': 'Add Review',
    'coupon.rating': 'Your rating',
    'coupon.comment': 'Your comment',
    'coupon.submit_review': 'Submit Review',
    'coupon.loyalty': 'Loyalty Program',
    'coupon.collect_stamp': 'You have collected stamps',
    'coupon.reward': 'Reward',
    'coupon.report': 'Report Issue',
    'coupon.verify': 'Is this offer still active?',
    'coupon.verified_at': 'Verified at',
    'upload.history': 'History',
    'upload.camera': 'Camera',
    'upload.pending': 'Pending',
    'upload.verified': 'Verified',
    'upload.rejected': 'Rejected',
    'mood.title': 'What is your mood today?',
    'common.refresh': 'Refresh Deals',
    'travel.title': 'Trip Planner',
    'seasonal.title': 'Seasonal Calendar',
    'notifications.title': 'Notifications',
    'notifications.empty': 'No new notifications',
    'notifications.mark_read': 'Mark as read',
    'offline.mode': 'Offline Mode',
    'offline.message': 'You are offline. Showing downloaded itineraries.',
    'common.view': 'View',
    'common.close': 'Close',
    'vendor.dashboard': 'Partner Dashboard',
    'vendor.add': 'New Campaign',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.explore': 'Explorar',
    'nav.saved': 'Guardados',
    'nav.upload': 'Subir Doc',
    'nav.profile': 'Perfil',
    'nav.travel': 'Rutas',
    'nav.vendor': 'Portal B2B',
    'nav.seasonal': 'Estacional',
    'search.placeholder': '¿Dónde quieres ahorrar hoy?',
    'hero.title': 'Deal Voy: Ahorro en Movimiento',
    'hero.subtitle':
      'Descubre descuentos exclusivos y planifica itinerarios inteligentes en tu zona.',
    'coupon.reserve': 'Obtener Cupón',
    'coupon.reserved': 'Cupón Asegurado',
    'coupon.available': 'Disponibles',
    'coupon.menu': 'Ver Menú Traducido',
    'coupon.reviews': 'Reseñas',
    'coupon.add_review': 'Agregar Reseña',
    'coupon.rating': 'Tu calificación',
    'coupon.comment': 'Tu comentario',
    'coupon.submit_review': 'Enviar Reseña',
    'coupon.loyalty': 'Programa de Lealtad',
    'coupon.collect_stamp': 'Tienes sellos acumulados',
    'coupon.reward': 'Recompensa',
    'coupon.report': 'Reportar Problema',
    'coupon.verify': '¿Sigue activa esta oferta?',
    'coupon.verified_at': 'Verificado en',
    'upload.history': 'Historial',
    'upload.camera': 'Cámara',
    'upload.pending': 'Pendiente',
    'upload.verified': 'Verificado',
    'upload.rejected': 'Rechazado',
    'mood.title': '¿Cuál es tu humor hoy?',
    'common.refresh': 'Actualizar Ofertas',
    'travel.title': 'Planificador de Viaje',
    'seasonal.title': 'Calendario Estacional',
    'notifications.title': 'Notificaciones',
    'notifications.empty': 'Sin nuevas notificaciones',
    'notifications.mark_read': 'Marcar como leída',
    'offline.mode': 'Modo Offline',
    'offline.message': 'Estás sin internet. Mostrando itinerarios descargados.',
    'common.view': 'Ver',
    'common.close': 'Cerrar',
    'vendor.dashboard': 'Panel de Socio',
    'vendor.add': 'Nueva Campaña',
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
