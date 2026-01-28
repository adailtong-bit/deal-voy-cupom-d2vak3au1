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
    'nav.travel': 'Planejador',
    'nav.vendor': 'Portal B2B',
    'nav.seasonal': 'Sazonal',
    'nav.admin': 'Admin',
    'auth.google': 'Entrar com Google',
    'auth.apple': 'Entrar com Apple',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.login': 'Entrar',
    'auth.no_account': 'Não tem uma conta? Cadastre-se',
    'profile.onboarding_title': 'Complete seu Perfil',
    'profile.onboarding_desc':
      'Precisamos de mais alguns detalhes para personalizar sua experiência.',
    'profile.country': 'País',
    'profile.city': 'Cidade',
    'profile.phone': 'Telefone',
    'profile.birthday': 'Data de Nascimento',
    'profile.save': 'Salvar Perfil',
    'profile.payment_methods': 'Métodos de Pagamento',
    'profile.notifications': 'Notificações',
    'profile.settings': 'Configurações',
    'common.search': 'Buscar',
    'settings.title': 'Configurações',
    'payment.title': 'Métodos de Pagamento',
    'payment.add': 'Adicionar Cartão',
    'payment.remove': 'Remover',
  },
  en: {
    'nav.home': 'Home',
    'nav.explore': 'Explore',
    'nav.challenges': 'Challenges',
    'nav.saved': 'Saved',
    'nav.upload': 'Upload Doc',
    'nav.profile': 'Profile',
    'nav.travel': 'Travel Planner',
    'nav.vendor': 'Vendor Portal',
    'nav.seasonal': 'Seasonal',
    'nav.admin': 'Admin',
    'auth.google': 'Sign in with Google',
    'auth.apple': 'Sign in with Apple',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.login': 'Login',
    'auth.no_account': 'No account? Sign up',
    'profile.onboarding_title': 'Complete your Profile',
    'profile.onboarding_desc':
      'We need a few more details to personalize your experience.',
    'profile.country': 'Country',
    'profile.city': 'City',
    'profile.phone': 'Phone',
    'profile.birthday': 'Date of Birth',
    'profile.save': 'Save Profile',
    'profile.payment_methods': 'Payment Methods',
    'profile.notifications': 'Notifications',
    'profile.settings': 'Settings',
    'common.search': 'Search',
    'settings.title': 'Settings',
    'payment.title': 'Payment Methods',
    'payment.add': 'Add Card',
    'payment.remove': 'Remove',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.explore': 'Explorar',
    'nav.challenges': 'Desafíos',
    'nav.saved': 'Guardados',
    'nav.upload': 'Subir Doc',
    'nav.profile': 'Perfil',
    'nav.travel': 'Planificador',
    'nav.vendor': 'Portal B2B',
    'nav.seasonal': 'Estacional',
    'nav.admin': 'Admin',
    'auth.google': 'Entrar con Google',
    'auth.apple': 'Entrar con Apple',
    'auth.email': 'Correo',
    'auth.password': 'Contraseña',
    'auth.login': 'Entrar',
    'auth.no_account': '¿No tienes cuenta? Regístrate',
    'profile.onboarding_title': 'Completa tu Perfil',
    'profile.onboarding_desc':
      'Necesitamos algunos detalles más para personalizar tu experiencia.',
    'profile.country': 'País',
    'profile.city': 'Ciudad',
    'profile.phone': 'Teléfono',
    'profile.birthday': 'Fecha de Nacimiento',
    'profile.save': 'Guardar Perfil',
    'profile.payment_methods': 'Métodos de Pago',
    'profile.notifications': 'Notificaciones',
    'profile.settings': 'Configuración',
    'common.search': 'Buscar',
    'settings.title': 'Configuración',
    'payment.title': 'Métodos de Pago',
    'payment.add': 'Añadir Tarjeta',
    'payment.remove': 'Eliminar',
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.profile': 'Profil',
    'profile.country': 'Pays',
    'profile.city': 'Ville',
    'profile.phone': 'Téléphone',
    'profile.save': 'Enregistrer',
  },
  de: {
    'nav.home': 'Startseite',
    'nav.profile': 'Profil',
    'profile.country': 'Land',
    'profile.city': 'Stadt',
    'profile.phone': 'Telefon',
    'profile.save': 'Speichern',
  },
  it: {
    'nav.home': 'Home',
    'nav.profile': 'Profilo',
    'profile.country': 'Paese',
    'profile.city': 'Città',
    'profile.phone': 'Telefono',
    'profile.save': 'Salva',
  },
  zh: {
    'nav.home': '首页',
    'nav.profile': '个人资料',
    'profile.country': '国家',
    'profile.city': '城市',
    'profile.phone': '电话',
    'profile.save': '保存',
  },
  ja: {
    'nav.home': 'ホーム',
    'nav.profile': 'プロフィール',
    'profile.country': '国',
    'profile.city': '市',
    'profile.phone': '電話番号',
    'profile.save': '保存',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('pt')

  const t = (key: string) => {
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
