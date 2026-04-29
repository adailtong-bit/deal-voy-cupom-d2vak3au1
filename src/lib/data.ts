import {
  Coupon,
  SeasonalEvent,
  Notification,
  Challenge,
  Badge,
  ABTest,
  Itinerary,
  Company,
  Advertisement,
  User,
  RewardItem,
  TravelOffer,
  Franchise,
  Region,
  ValidationLog,
  CarRental,
  SystemLog,
  ClientHistory,
  ChatThread,
  Review,
  CrawlerSource,
  CrawlerHistory,
  DiscoveredPromotion,
  AdPricing,
  Advertiser,
  AdInvoice,
  PlatformSettings,
  PartnerPolicy,
  PartnerInvoice,
  WebhookLog,
  Booking,
  FinancialTransaction,
} from './types'

export const getCategoryTranslationKey = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'alimentação':
    case 'food':
    case 'comida':
      return 'category.food'
    case 'moda':
    case 'fashion':
      return 'category.fashion'
    case 'serviços':
    case 'services':
    case 'servicios':
      return 'category.services'
    case 'eletrônicos':
    case 'electronics':
    case 'electrónica':
      return 'category.electronics'
    case 'lazer':
    case 'leisure':
    case 'ocio':
      return 'category.leisure'
    case 'mercado':
    case 'market':
      return 'category.market'
    case 'beleza':
    case 'beauty':
    case 'belleza':
      return 'category.beauty'
    case 'hotéis':
    case 'hotels':
    case 'hoteles':
      return 'category.hotels'
    case 'outros':
    case 'others':
    case 'otros':
      return 'category.others'
    case 'viagens':
    case 'travel':
    case 'viajes':
      return 'category.travel'
    default:
      return 'category.others'
  }
}

export const MOCK_USER_LOCATION = {
  lat: -23.55052,
  lng: -46.633308,
}

export const POPULAR_DESTINATIONS: Record<
  string,
  { lat: number; lng: number; label: string }
> = {
  orlando: { lat: 28.5383, lng: -81.3792, label: 'Orlando, FL' },
  'sao paulo': { lat: -23.55052, lng: -46.633308, label: 'São Paulo, BR' },
  miami: { lat: 25.7617, lng: -80.1918, label: 'Miami, FL' },
  nyc: { lat: 40.7128, lng: -74.006, label: 'New York City, NY' },
  paris: { lat: 48.8566, lng: 2.3522, label: 'Paris, FR' },
  london: { lat: 51.5074, lng: -0.1278, label: 'London, UK' },
  tokyo: { lat: 35.6762, lng: 139.6503, label: 'Tokyo, JP' },
  rio: { lat: -22.9068, lng: -43.1729, label: 'Rio de Janeiro, BR' },
  campinas: { lat: -22.9099, lng: -47.0626, label: 'Campinas, SP' },
  santos: { lat: -23.9618, lng: -46.3322, label: 'Santos, SP' },
}

export const REGIONS: Region[] = [
  { id: 'global', name: 'Global', country: 'Global', code: 'Global' },
  { id: 'br-sp', name: 'São Paulo', country: 'Brasil', code: 'BR-SP' },
  { id: 'br-rj', name: 'Rio de Janeiro', country: 'Brasil', code: 'BR-RJ' },
  { id: 'us-fl', name: 'Florida', country: 'USA', code: 'US-FL' },
  { id: 'us-ny', name: 'New York', country: 'USA', code: 'US-NY' },
  { id: 'fr-idf', name: 'Île-de-France', country: 'France', code: 'FR-IDF' },
]

export const CATEGORIES: {
  id: string
  label: string
  translationKey: string
  icon: string
}[] = [
  {
    id: 'all',
    label: 'Todos',
    translationKey: 'category.all',
    icon: 'LayoutGrid',
  },
  {
    id: 'Alimentação',
    label: 'Alimentação',
    translationKey: 'category.food',
    icon: 'Utensils',
  },
  {
    id: 'Moda',
    label: 'Moda',
    translationKey: 'category.fashion',
    icon: 'Shirt',
  },
  {
    id: 'Serviços',
    label: 'Serviços',
    translationKey: 'category.services',
    icon: 'Briefcase',
  },
  {
    id: 'Eletrônicos',
    label: 'Eletrônicos',
    translationKey: 'category.electronics',
    icon: 'Smartphone',
  },
  {
    id: 'Lazer',
    label: 'Lazer',
    translationKey: 'category.leisure',
    icon: 'Ticket',
  },
  {
    id: 'Mercado',
    label: 'Mercado',
    translationKey: 'category.market',
    icon: 'ShoppingCart',
  },
  {
    id: 'Beleza',
    label: 'Beleza',
    translationKey: 'category.beauty',
    icon: 'Sparkles',
  },
  {
    id: 'cat-hoteis',
    label: 'Hotéis',
    translationKey: 'category.hotels',
    icon: 'Bed',
  },
  {
    id: 'cat-viagens',
    label: 'Viagens',
    translationKey: 'category.travel',
    icon: 'Plane',
  },
  {
    id: 'Outros',
    label: 'Outros',
    translationKey: 'category.others',
    icon: 'CircleEllipsis',
  },
]

// Emptying out all mock data arrays to force reliance on real DB data
export const SEASONAL_EVENTS: SeasonalEvent[] = []
export const MOCK_NOTIFICATIONS: Notification[] = []
export const MOCK_CHALLENGES: Challenge[] = []
export const MOCK_BADGES: Badge[] = []
export const MOCK_COUPONS: Coupon[] = []
export const MOCK_AB_TESTS: ABTest[] = []
export const MOCK_ITINERARIES: Itinerary[] = []
export const MOCK_COMPANIES: Company[] = []
export const MOCK_ADS: Advertisement[] = []
export const MOCK_USERS: User[] = []
export const MOCK_REWARDS: RewardItem[] = []
export const MOCK_FRANCHISES: Franchise[] = []
export const MOCK_TRAVEL_OFFERS: TravelOffer[] = []
export const MOCK_CAR_RENTALS: CarRental[] = []
export const MOCK_VALIDATION_LOGS: ValidationLog[] = []
export const MOCK_SYSTEM_LOGS: SystemLog[] = []
export const MOCK_CLIENT_HISTORY: ClientHistory[] = []
export const MOCK_CHATS: ChatThread[] = []
export const MOCK_CRAWLER_HISTORY: CrawlerHistory[] = []
export const MOCK_CRAWLER_SOURCES: CrawlerSource[] = []
export const MOCK_DISCOVERED_PROMOTIONS: DiscoveredPromotion[] = []
export const MOCK_AD_PRICING: AdPricing[] = [
  { id: 'adp-1', placement: 'top', billingType: 'cpc', price: 0.5 },
  {
    id: 'adp-2',
    placement: 'top',
    billingType: 'fixed',
    durationDays: 7,
    price: 150.0,
  },
  { id: 'adp-3', placement: 'bottom', billingType: 'cpc', price: 0.3 },
  {
    id: 'adp-4',
    placement: 'sidebar',
    billingType: 'fixed',
    durationDays: 30,
    price: 500.0,
  },
  { id: 'adp-5', placement: 'search', billingType: 'cpc', price: 0.4 },
  {
    id: 'adp-6',
    placement: 'offer_of_the_day',
    billingType: 'fixed',
    durationDays: 1,
    price: 100.0,
  },
]

export const MOCK_ADVERTISERS: Advertiser[] = [
  {
    id: 'adv-internal',
    companyName: 'Routevoy (Parceiro Interno)',
    contactName: 'Administração',
    email: 'admin@routevoy.com',
    status: 'active',
  },
  {
    id: 'adv-demo',
    companyName: 'Anunciante Demonstração',
    contactName: 'Cliente',
    email: 'anunciante@exemplo.com',
    status: 'active',
  },
]
export const MOCK_AD_INVOICES: AdInvoice[] = []
export const MOCK_PARTNER_POLICIES: PartnerPolicy[] = []
export const MOCK_PARTNER_INVOICES: PartnerInvoice[] = []
export const MOCK_WEBHOOK_LOGS: WebhookLog[] = []
export const MOCK_BOOKINGS: Booking[] = []
export const MOCK_FINANCIAL_TRANSACTIONS: FinancialTransaction[] = []

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  commissionRate: 10,
  cashbackSplitUser: 40,
  cashbackSplitPlatform: 60,
  franchiseRoyaltyRate: 15,
  mainCategories: ['Alimentação', 'Moda', 'Serviços', 'Eletrônicos'],
  availableInterests: CATEGORIES.filter((c) => c.id !== 'all').map((c) => ({
    id: c.id,
    label: c.label,
    icon: c.icon,
  })),
  categories: [
    ...CATEGORIES.filter((c) => c.id !== 'all').map((c) => ({
      ...c,
      description:
        c.id === 'cat-viagens'
          ? 'Ofertas e promoções de viagens e pacotes'
          : c.id === 'cat-hoteis'
            ? 'Ofertas e promoções de hospedagem'
            : `Ofertas e promoções de ${c.label.toLowerCase()}`,
      status: 'active',
      createdAt: '2024-01-01',
    })),
  ],
  travelMargins: {
    hotels: 12,
    flights: 3,
    cars: 8,
    insurance: 25,
  },
  subscriptionPricing: {
    premium: 4.99,
    vip: 14.99,
  },
  withdrawal: {
    minAmount: 25,
    instantFee: 1.5,
  },
  referral: {
    fixedReward: 5.0,
    friendCashbackPercentage: 10,
    durationDays: 30,
  },
  globalProximityAlertsEnabled: true,
}
