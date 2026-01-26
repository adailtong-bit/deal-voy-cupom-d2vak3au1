import React, { createContext, useContext, useState } from 'react'

type Language = 'pt' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'zh' | 'ja'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  pt: {
    'nav.home': 'Início',
    'nav.explore': 'Explorar',
    'nav.challenges': 'Desafios',
    'nav.saved': 'Salvos',
    'nav.upload': 'Subir Doc',
    'nav.profile': 'Perfil',
    'nav.travel': 'Roteiros',
    'nav.vendor': 'Portal B2B',
    'nav.seasonal': 'Sazonal',
    'nav.admin': 'Admin',
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
    'travel.subtitle': 'Planeje sua economia, não importa onde você esteja.',
    'travel.gps': 'GPS Atual',
    'travel.plan_destination': 'Planejar Destino',
    'travel.search_placeholder': 'Para onde você vai? (Ex: Orlando, FL)',
    'travel.showing_offers_for': 'Exibindo ofertas para:',
    'travel.events': 'Eventos Locais',
    'travel.savings': 'Economia Total',
    'travel.my_itinerary': 'Meu Roteiro',
    'travel.offers_found': 'ofertas encontradas',
    'travel.no_offers': 'Nenhuma oferta encontrada nesta região.',
    'travel.back_to_gps': 'Voltar ao GPS atual',
    'travel.itinerary_title': 'Meu Roteiro de Economia',
    'travel.saved_coupons': 'cupons salvos para sua viagem.',
    'travel.empty_itinerary': 'Seu roteiro está vazio',
    'travel.empty_desc':
      'Explore ofertas e clique em "Add Trip" para organizar sua viagem.',
    'travel.explore_offers': 'Explorar Ofertas',
    'seasonal.title': 'Calendário Sazonal',
    'notifications.title': 'Notificações',
    'notifications.empty': 'Sem novas notificações',
    'notifications.mark_read': 'Marcar como lida',
    'offline.mode': 'Modo Offline',
    'offline.message': 'Você está offline. Exibindo roteiros baixados.',
    'common.view': 'Ver',
    'common.close': 'Fechar',
    'common.search': 'Buscar',
    'common.hide': 'Ocultar',
    'common.show': 'Mostrar',
    'common.share': 'Compartilhar',
    'common.view_all': 'Ver tudo',
    'common.load_more': 'Carregar Mais',
    'map.error': 'Não foi possível carregar o mapa.',
    'map.loading': 'Carregando mapa...',
    'home.detecting_location': 'Detectando localização...',
    'home.current_location': 'Localização atual:',
    'home.featured_deals': 'Ofertas em Destaque',
    'home.travel_card_title': 'Vai viajar? Economize no caminho.',
    'home.travel_card_desc':
      'Trace sua rota e descubra paradas estratégicas com descontos exclusivos em postos, restaurantes e hotéis.',
    'home.plan_route': 'Planejar Rota Agora',
    'home.tracked_deals': 'Achados da Web (Tracked)',
    'home.all_offers': 'Todas as Ofertas',
    'home.offers_of': 'Ofertas de',
    'home.no_offers':
      'Nenhuma oferta encontrada para esta categoria no momento.',
    'explore.filters': 'Filtros',
    'explore.filter_title': 'Filtrar Ofertas',
    'explore.filter_desc': 'Encontre o que você precisa',
    'explore.max_distance': 'Distância Máxima',
    'explore.categories': 'Categorias',
    'explore.apply_filters': 'Aplicar Filtros',
    'explore.view_map': 'Ver Mapa',
    'explore.view_list': 'Ver Lista',
    'vendor.dashboard': 'Painel do Parceiro',
    'vendor.add': 'Nova Campanha',
    'challenges.title': 'Desafios & Recompensas',
    'challenges.subtitle':
      'Complete missões, ganhe badges e desbloqueie descontos exclusivos.',
    'challenges.active': 'Ativos',
    'challenges.available': 'Disponíveis',
    'challenges.completed': 'Concluídos',
    'challenges.reward': 'Recompensa',
    'challenges.progress': 'Progresso',
    'challenges.accept': 'Aceitar Desafio',
    'challenges.empty': 'Você não tem desafios ativos no momento.',
    'checkout.title': 'Checkout Seguro',
    'checkout.secure': 'Seus dados estão criptografados por Deal Voy',
    'checkout.payment_method': 'Forma de Pagamento',
    'checkout.pay': 'Pagar',
    'checkout.success': 'Pagamento Confirmado!',
    'checkout.redirect': 'Redirecionando para seu cupom...',
    'ad.sponsored': 'Patrocinado',
    'notification.deal': 'Oferta',
    'notification.alert': 'Alerta',
    'notification.event': 'Evento',
    'rewards.title': 'Minhas Recompensas',
    'rewards.subtitle': 'Troque pontos por benefícios exclusivos',
    'rewards.balance': 'Saldo de Pontos',
    'rewards.redeem': 'Resgatar',
    'rewards.external': 'Apps Externos',
    'rewards.history': 'Histórico',
    'rewards.cost': 'pontos',
    'rewards.redeem_now': 'Resgatar Agora',
    'rewards.connect_fetch': 'Conectar FETCH',
    'rewards.fetch_balance': 'Saldo FETCH',
    'rewards.fetch_connected': 'Conectado',
    'rewards.import_points': 'Importar Pontos',
    'rewards.birthday_gift': 'Presente de Aniversário',
    'rewards.happy_birthday': 'Feliz Aniversário!',
    'rewards.birthday_desc':
      'Parabéns! Preparamos um presente especial para você.',
    'rewards.claim_gift': 'Receber Presente',
    'profile.birthday': 'Data de Nascimento',
    'profile.save': 'Salvar Alterações',
    'profile.update_success': 'Perfil atualizado com sucesso!',
  },
  en: {
    // ... existing EN translations ...
    'rewards.title': 'My Rewards',
    'rewards.subtitle': 'Exchange points for exclusive benefits',
    'rewards.balance': 'Points Balance',
    'rewards.redeem': 'Redeem',
    'rewards.external': 'External Apps',
    'rewards.history': 'History',
    'rewards.cost': 'pts',
    'rewards.redeem_now': 'Redeem Now',
    'rewards.connect_fetch': 'Connect FETCH',
    'rewards.fetch_balance': 'FETCH Balance',
    'rewards.fetch_connected': 'Connected',
    'rewards.import_points': 'Import Points',
    'rewards.birthday_gift': 'Birthday Gift',
    'rewards.happy_birthday': 'Happy Birthday!',
    'rewards.birthday_desc':
      'Congratulations! We have prepared a special gift for you.',
    'rewards.claim_gift': 'Claim Gift',
    'profile.birthday': 'Birth Date',
    'profile.save': 'Save Changes',
    'profile.update_success': 'Profile updated successfully!',
  },
  es: {
    // ... existing ES translations ...
    'rewards.title': 'Mis Recompensas',
    'rewards.subtitle': 'Canjea puntos por beneficios exclusivos',
    'rewards.balance': 'Saldo de Puntos',
    'rewards.redeem': 'Canjear',
    'rewards.external': 'Apps Externas',
    'rewards.history': 'Historial',
    'rewards.cost': 'ptos',
    'rewards.redeem_now': 'Canjear Ahora',
    'rewards.connect_fetch': 'Conectar FETCH',
    'rewards.fetch_balance': 'Saldo FETCH',
    'rewards.fetch_connected': 'Conectado',
    'rewards.import_points': 'Importar Puntos',
    'rewards.birthday_gift': 'Regalo de Cumpleaños',
    'rewards.happy_birthday': '¡Feliz Cumpleaños!',
    'rewards.birthday_desc':
      '¡Felicidades! Hemos preparado un regalo especial para ti.',
    'rewards.claim_gift': 'Reclamar Regalo',
    'profile.birthday': 'Fecha de Nacimiento',
    'profile.save': 'Guardar Cambios',
    'profile.update_success': '¡Perfil actualizado con éxito!',
  },
  fr: {
    // ... existing FR translations ...
    'rewards.title': 'Mes Récompenses',
  },
  de: {
    // ... existing DE translations ...
    'rewards.title': 'Meine Belohnungen',
  },
  it: {
    // ... existing IT translations ...
    'rewards.title': 'I miei Premi',
  },
  zh: {
    // ... existing ZH translations ...
    'rewards.title': '我的奖励',
  },
  ja: {
    // ... existing JA translations ...
    'rewards.title': '私の報酬',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('pt')

  const t = (key: string) => {
    // Basic fallback to Portuguese if key missing in current language
    const lang = translations[language] || translations['pt']
    return lang[key] || translations['pt'][key] || key
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
