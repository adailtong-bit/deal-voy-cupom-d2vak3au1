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
} from './types'

export const MOCK_USER_LOCATION = {
  lat: -23.55052,
  lng: -46.633308,
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
    icon: 'ShoppingBasket',
  },
  {
    id: 'Beleza',
    label: 'Beleza',
    translationKey: 'category.beauty',
    icon: 'Sparkles',
  },
  {
    id: 'Outros',
    label: 'Outros',
    translationKey: 'category.others',
    icon: 'CircleEllipsis',
  },
]

export const SEASONAL_EVENTS: SeasonalEvent[] = [
  {
    id: '1',
    title: 'Black Friday',
    date: new Date('2024-11-29'),
    description: 'As maiores ofertas do ano em todas as lojas.',
    type: 'sale',
    coordinates: { lat: -23.55052, lng: -46.633308 },
    image: 'https://img.usecurling.com/p/600/400?q=black%20friday',
    region: 'BR-SP',
  },
  {
    id: '2',
    title: 'Natal na Paulista',
    date: new Date('2024-12-25'),
    description:
      'Ofertas especiais de presentes e decoração com show de luzes.',
    type: 'holiday',
    coordinates: { lat: -23.5614, lng: -46.656 },
    image: 'https://img.usecurling.com/p/600/400?q=christmas%20lights',
    region: 'BR-SP',
  },
  {
    id: '3',
    title: 'Independence Day Sale',
    date: new Date('2024-07-04'),
    description: 'July 4th Specials across Florida.',
    type: 'sale',
    coordinates: { lat: 28.5383, lng: -81.3792 },
    image: 'https://img.usecurling.com/p/600/400?q=fireworks',
    region: 'US-FL',
  },
]

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Bem-vindo ao CupomGeo!',
    message: 'Explore as melhores ofertas ao seu redor.',
    type: 'system',
    read: false,
    date: new Date().toISOString(),
    priority: 'low',
    category: 'system',
  },
]

export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: 'Caçador Urbano',
    description: 'Visite 5 locais diferentes este mês',
    total: 5,
    current: 3,
    reward: '500 pts',
    icon: 'MapPin',
    completed: false,
    status: 'active',
    type: 'travel',
  },
]

export const MOCK_BADGES: Badge[] = [
  {
    id: '1',
    name: 'Iniciante',
    description: 'Primeiro acesso',
    image: 'https://img.usecurling.com/i?q=medal&color=yellow',
    earnedDate: '2024-01-10',
  },
]

// MOCK DATA GENERATION FOR 10+ ITEMS
const generateCoupons = (): Coupon[] => {
  const coupons: Coupon[] = []
  const categories = [
    'Alimentação',
    'Moda',
    'Lazer',
    'Eletrônicos',
    'Serviços',
  ] as const
  for (let i = 1; i <= 15; i++) {
    coupons.push({
      id: `cpn-${i}`,
      storeName: i % 2 === 0 ? 'Burger King' : 'Local Shop ' + i,
      companyId: i % 2 === 0 ? 'c1' : `c${i}`,
      title: i % 2 === 0 ? 'Whopper Deal' : `Discount Offer ${i}`,
      description: `Great deal number ${i} for everyone.`,
      discount: `${10 + i}% OFF`,
      category: categories[i % categories.length],
      distance: 100 * i,
      expiryDate: '2025-12-31',
      image: `https://img.usecurling.com/p/600/400?q=${categories[i % categories.length]}`,
      logo: `https://img.usecurling.com/i?q=shop&color=${i % 2 === 0 ? 'red' : 'blue'}`,
      code: `CODE-${i}`,
      coordinates: { lat: -23.55 + i * 0.001, lng: -46.63 + i * 0.001 },
      totalAvailable: 100 * i,
      reservedCount: 10 * i,
      averageRating: 4.0 + (i % 10) / 10,
      status: 'active',
      source: i % 3 === 0 ? 'aggregated' : 'partner',
      region: i % 2 === 0 ? 'BR-SP' : 'US-FL',
    })
  }
  return coupons
}

export const MOCK_COUPONS: Coupon[] = generateCoupons()

export const MOCK_AB_TESTS: ABTest[] = []

const generateItineraries = (): Itinerary[] => {
  const itineraries: Itinerary[] = []
  for (let i = 1; i <= 10; i++) {
    itineraries.push({
      id: `it-${i}`,
      title: `Roteiro Incrível ${i}`,
      description: `Um roteiro de ${i + 2} dias explorando o melhor da região.`,
      stops: [MOCK_COUPONS[0], MOCK_COUPONS[1]],
      days: [
        { id: `d1-${i}`, dayNumber: 1, stops: [MOCK_COUPONS[0]] },
        { id: `d2-${i}`, dayNumber: 2, stops: [MOCK_COUPONS[1]] },
      ],
      totalSavings: 50 * i,
      duration: `${i + 2} Dias`,
      image: `https://img.usecurling.com/p/600/300?q=travel%20${i}`,
      tags: i % 2 === 0 ? ['Gastronomia'] : ['Aventura'],
      matchScore: 90 + (i % 10),
      isTemplate: true,
      region: i % 2 === 0 ? 'BR-SP' : 'US-FL',
      agencyId: 'agency1',
    })
  }
  return itineraries
}

export const MOCK_ITINERARIES: Itinerary[] = generateItineraries()

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'c1',
    name: 'Burger King',
    email: 'contact@bk.com',
    status: 'active',
    registrationDate: '2024-01-01',
    region: 'BR-SP',
    enableLoyalty: true,
  },
  {
    id: 'c2',
    name: 'Shop Retail 1',
    email: 'shop.retail@dealvoy.com',
    status: 'active',
    registrationDate: '2024-02-01',
    region: 'BR-SP',
    enableLoyalty: true,
    ownerId: 'u_shop',
  },
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: `c${i + 3}`,
    name: `Retail Store ${i + 3}`,
    email: `store${i + 3}@example.com`,
    status: 'active' as const,
    registrationDate: '2024-03-01',
    region: i % 2 === 0 ? 'BR-SP' : 'US-FL',
    enableLoyalty: false,
  })),
]

export const MOCK_ADS: Advertisement[] = [
  {
    id: 'ad1',
    title: 'Verão Burger King',
    companyId: 'c1',
    region: 'BR-SP',
    category: 'Alimentação',
    billingType: 'fixed',
    placement: 'top',
    status: 'active',
    views: 15000,
    clicks: 3400,
    startDate: '2024-12-01',
    endDate: '2025-01-31',
    image: 'https://img.usecurling.com/p/800/200?q=burger%20ad',
    link: 'https://burgerking.com.br',
  },
]

export const MOCK_USERS: User[] = [
  {
    id: 'u_admin',
    name: 'App Owner',
    email: 'admin@dealvoy.com',
    role: 'super_admin',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
    birthday: '1980-01-01',
    country: 'Brasil',
    state: 'São Paulo',
    city: 'São Paulo',
    phone: '+55 11 99999-9999',
  },
  {
    id: 'u_fran_sp',
    name: 'Franchise SP',
    email: 'franquia.sp@dealvoy.com',
    role: 'franchisee',
    region: 'BR-SP',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=2',
    country: 'Brasil',
    state: 'São Paulo',
    city: 'Campinas',
    phone: '+55 19 98888-8888',
  },
  {
    id: 'u_fran_fl',
    name: 'Franchise FL',
    email: 'franquia.fl@dealvoy.com',
    role: 'franchisee',
    region: 'US-FL',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=3',
    country: 'USA',
    state: 'Florida',
    city: 'Orlando',
    phone: '+1 407 555-0123',
  },
  {
    id: 'u_agency',
    name: 'Travel Agency',
    email: 'agency.travel@dealvoy.com',
    role: 'agency',
    agencyId: 'agency1',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=4',
    country: 'Brasil',
    state: 'Rio de Janeiro',
    city: 'Rio de Janeiro',
    phone: '+55 21 97777-7777',
  },
  {
    id: 'u_shop',
    name: 'Shop Keeper',
    email: 'shop.retail@dealvoy.com',
    role: 'shopkeeper',
    companyId: 'c2',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=5',
    country: 'Brasil',
    state: 'São Paulo',
    city: 'Santos',
    phone: '+55 13 96666-6666',
  },
  {
    id: 'u_user',
    name: 'End User',
    email: 'user.test@dealvoy.com',
    role: 'user',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=6',
    country: 'USA',
    state: 'Florida',
    city: 'Miami',
    phone: '+1 305 555-9999',
  },
]

export const MOCK_REWARDS: RewardItem[] = [
  {
    id: 'r1',
    title: 'Voucher R$ 20 iFood',
    description: 'Vale presente para usar em qualquer pedido no iFood.',
    cost: 1500,
    image: 'https://img.usecurling.com/i?q=food&color=red&shape=fill',
    category: 'coupon',
    available: true,
  },
]

export const MOCK_FRANCHISES: Franchise[] = [
  {
    id: 'f1',
    name: 'Deal Voy Brasil - SP',
    region: 'BR-SP',
    ownerId: 'u_fran_sp',
    status: 'active',
    licenseExpiry: '2030-01-01',
  },
  {
    id: 'f2',
    name: 'Deal Voy USA - FL',
    region: 'US-FL',
    ownerId: 'u_fran_fl',
    status: 'active',
    licenseExpiry: '2028-06-15',
  },
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: `f${i + 3}`,
    name: `Franchise Region ${i + 3}`,
    region: i % 2 === 0 ? 'BR-RJ' : 'US-NY',
    ownerId: `u_fran_${i + 3}`,
    status: 'active' as const,
    licenseExpiry: '2029-01-01',
  })),
]

export const MOCK_TRAVEL_OFFERS: TravelOffer[] = [
  {
    id: 't1',
    type: 'flight',
    provider: 'SkyHigh',
    title: 'São Paulo -> Orlando',
    description: 'Voo direto, ida e volta. Inclui bagagem.',
    price: 3200,
    currency: 'BRL',
    image: 'https://img.usecurling.com/p/300/200?q=airplane',
    destination: 'Orlando, FL',
    rating: 4.5,
    link: 'https://google.com/flights',
    region: 'BR-SP',
  },
]

export const MOCK_CAR_RENTALS: CarRental[] = Array.from({ length: 10 }).map(
  (_, i) => ({
    id: `car-${i}`,
    model: i % 2 === 0 ? 'Corolla' : 'Mustang',
    brand: i % 2 === 0 ? 'Toyota' : 'Ford',
    year: 2024,
    plate: `ABC-123${i}`,
    category: i % 2 === 0 ? 'Economy' : 'Convertible',
    pricePerDay: 100 + i * 10,
    status: 'available',
    location: i % 2 === 0 ? 'São Paulo, SP' : 'Miami, FL',
    image: `https://img.usecurling.com/p/300/200?q=car%20${i % 2 === 0 ? 'sedan' : 'convertible'}`,
    agencyId: 'agency1',
  }),
)

export const MOCK_VALIDATION_LOGS: ValidationLog[] = Array.from({
  length: 15,
}).map((_, i) => ({
  id: `vl-${i}`,
  couponId: `cpn-${i}`,
  couponTitle: `Discount Offer ${i}`,
  customerName: `Customer ${i}`,
  validatedAt: new Date(Date.now() - i * 86400000).toISOString(),
  method: i % 2 === 0 ? 'qr' : 'manual',
  shopkeeperId: 'u_shop',
}))
