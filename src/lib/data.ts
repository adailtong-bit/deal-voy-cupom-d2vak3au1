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
    title: 'Bem-vindo ao Deal Voy!',
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

// Coupons (30 items)
const generateCoupons = (): Coupon[] => {
  const coupons: Coupon[] = []
  const categories = ['Alimentação', 'Moda', 'Serviços', 'Outros'] as const
  const statuses = ['active', 'validated', 'expired'] as const

  for (let i = 1; i <= 30; i++) {
    const isUS = i % 2 !== 0 // Odd IDs for US, Even for BR
    coupons.push({
      id: `cpn-${i}`,
      storeName: isUS ? `Store #${i} USA` : `Loja #${i} BR`,
      companyId: isUS ? `c${i + 5}` : `c${i}`,
      title: isUS ? `Super Deal ${i}` : `Oferta Imperdível ${i}`,
      description: isUS
        ? `Amazing discount on all items in section ${i}.`
        : `Desconto incrível em todos os itens da seção ${i}.`,
      discount: `${10 + (i % 50)}% OFF`,
      category: categories[i % categories.length],
      distance: 100 * i,
      expiryDate: '2025-12-31',
      image: `https://img.usecurling.com/p/600/400?q=${categories[i % categories.length]}&seed=${i}`,
      logo: `https://img.usecurling.com/i?q=logo&color=${i % 2 === 0 ? 'red' : 'blue'}&seed=${i}`,
      code: `CODE-${i + 1000}`,
      coordinates: isUS
        ? { lat: 28.5383 + i * 0.001, lng: -81.3792 + i * 0.001 }
        : { lat: -23.55 + i * 0.001, lng: -46.63 + i * 0.001 },
      totalAvailable: 100 * i,
      reservedCount: 10 * i,
      averageRating: 4.0 + (i % 10) / 10,
      status: statuses[i % 3],
      source: i % 3 === 0 ? 'aggregated' : 'partner',
      region: isUS ? 'US-FL' : 'BR-SP',
      price: i % 5 === 0 ? 50 + i : undefined,
    })
  }
  return coupons
}

export const MOCK_COUPONS: Coupon[] = generateCoupons()

export const MOCK_AB_TESTS: ABTest[] = []

// Itineraries (15 items)
const generateItineraries = (): Itinerary[] => {
  const itineraries: Itinerary[] = []
  for (let i = 1; i <= 15; i++) {
    const isUS = i % 2 !== 0
    itineraries.push({
      id: `it-${i}`,
      title: isUS ? `Florida Trip ${i}` : `Roteiro SP ${i}`,
      description: isUS
        ? `A ${i + 2} day trip exploring the best of Florida.`
        : `Um roteiro de ${i + 2} dias explorando o melhor de São Paulo.`,
      stops: [MOCK_COUPONS[0], MOCK_COUPONS[1], MOCK_COUPONS[2]],
      days: [
        { id: `d1-${i}`, dayNumber: 1, stops: [MOCK_COUPONS[0]] },
        { id: `d2-${i}`, dayNumber: 2, stops: [MOCK_COUPONS[1]] },
      ],
      totalSavings: 50 * i,
      duration: `${i + 2} Days`,
      image: `https://img.usecurling.com/p/600/300?q=travel&seed=${i}`,
      tags: i % 2 === 0 ? ['Food', 'City'] : ['Adventure', 'Nature'],
      matchScore: 80 + (i % 20),
      isTemplate: true,
      region: isUS ? 'US-FL' : 'BR-SP',
      agencyId: 'agency1',
      status: i % 3 === 0 ? 'pending' : 'approved',
      isPublic: i % 2 === 0,
      authorName: isUS ? 'Travel Agency' : 'User Explorer',
    })
  }
  return itineraries
}

export const MOCK_ITINERARIES: Itinerary[] = generateItineraries()

// Companies (20 items)
const generateCompanies = (): Company[] => {
  const companies: Company[] = []
  for (let i = 1; i <= 20; i++) {
    const isUS = i % 2 !== 0
    companies.push({
      id: `c${i}`,
      name: isUS ? `Merchant USA ${i}` : `Comércio BR ${i}`,
      email: `merchant${i}@dealvoy.com`,
      status: i % 10 === 0 ? 'pending' : 'active',
      registrationDate: '2024-01-01',
      region: isUS ? 'US-FL' : 'BR-SP',
      enableLoyalty: i % 3 === 0,
      ownerId: `u_shop_${i}`,
    })
  }
  return companies
}
export const MOCK_COMPANIES: Company[] = generateCompanies()

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
  {
    id: 'ad2',
    title: 'Fashion Week Sale',
    companyId: 'c2',
    region: 'US-FL',
    category: 'Moda',
    billingType: 'ppc',
    placement: 'bottom',
    status: 'active',
    views: 10000,
    clicks: 1200,
    startDate: '2024-12-01',
    endDate: '2025-01-31',
    image: 'https://img.usecurling.com/p/800/200?q=fashion%20sale',
    link: 'https://fashionweek.com',
  },
]

// Users (Test Accounts for all roles)
export const MOCK_USERS: User[] = [
  // 1. App Owner
  {
    id: 'u_admin',
    name: 'App Owner',
    email: 'admin@dealvoy.com',
    role: 'super_admin',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=99',
    birthday: '1980-01-01',
    country: 'Brasil',
    state: 'São Paulo',
    city: 'São Paulo',
    phone: '+55 11 99999-9999',
    preferences: {
      notifications: true,
      emailAlerts: true,
    },
  },
  // 2. Franchisee
  {
    id: 'u_fran',
    name: 'Franchise Partner',
    email: 'franchise@dealvoy.com',
    role: 'franchisee',
    region: 'BR-SP',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=88',
    country: 'Brasil',
    state: 'São Paulo',
    city: 'Campinas',
    phone: '+55 19 98888-8888',
  },
  // 3. Agency
  {
    id: 'u_agency',
    name: 'Travel Agency',
    email: 'agency@dealvoy.com',
    role: 'agency',
    agencyId: 'agency1',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=66',
    country: 'Brasil',
    state: 'Rio de Janeiro',
    city: 'Rio de Janeiro',
    phone: '+55 21 97777-7777',
  },
  // 4. Merchant (Shopkeeper)
  {
    id: 'u_shop',
    name: 'Shop Merchant',
    email: 'shop@dealvoy.com',
    role: 'shopkeeper',
    companyId: 'c2', // Linked to a BR company usually
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=55',
    country: 'Brasil',
    state: 'São Paulo',
    city: 'Santos',
    phone: '+55 13 96666-6666',
  },
  // 5. End User
  {
    id: 'u_user',
    name: 'End User',
    email: 'user@dealvoy.com',
    role: 'user',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=44',
    country: 'USA',
    state: 'Florida',
    city: 'Miami',
    phone: '+1 305 555-9999',
    preferences: {
      notifications: true,
      newsletter: true,
      emailAlerts: true,
      pushAlerts: true,
      categories: ['Alimentação', 'Moda'],
      dashboardWidgets: ['featured', 'categories', 'tracked', 'all'],
    },
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

// Franchises (12 items)
export const MOCK_FRANCHISES: Franchise[] = Array.from({ length: 12 }).map(
  (_, i) => ({
    id: `f${i + 1}`,
    name: `Deal Voy Franchise ${i + 1}`,
    region: i % 2 === 0 ? 'BR-SP' : 'US-FL',
    ownerId: `u_fran_${i}`,
    status: 'active',
    licenseExpiry: `2030-0${(i % 9) + 1}-01`,
  }),
)

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

// Car Rentals (15 items)
export const MOCK_CAR_RENTALS: CarRental[] = Array.from({ length: 15 }).map(
  (_, i) => ({
    id: `car-${i}`,
    model: i % 2 === 0 ? 'Corolla' : 'Mustang',
    brand: i % 2 === 0 ? 'Toyota' : 'Ford',
    year: 2024,
    plate: `ABC-${100 + i}`,
    category: i % 2 === 0 ? 'Economy' : 'SUV',
    pricePerDay: 100 + i * 5,
    status: i % 5 === 0 ? 'rented' : 'available',
    location: i % 2 === 0 ? 'São Paulo, SP' : 'Miami, FL',
    image: `https://img.usecurling.com/p/300/200?q=car%20${i % 2 === 0 ? 'sedan' : 'convertible'}&seed=${i}`,
    agencyId: 'agency1',
  }),
)

// Validation Logs (20 items)
export const MOCK_VALIDATION_LOGS: ValidationLog[] = Array.from({
  length: 20,
}).map((_, i) => ({
  id: `vl-${i}`,
  couponId: `cpn-${i}`,
  couponTitle: `Coupon Offer ${i}`,
  customerName: `Customer ${i}`,
  validatedAt: new Date(Date.now() - i * 3600000).toISOString(),
  method: i % 2 === 0 ? 'qr' : 'manual',
  shopkeeperId: 'u_shop',
}))

// System Logs (15 items)
export const MOCK_SYSTEM_LOGS: SystemLog[] = Array.from({ length: 15 }).map(
  (_, i) => ({
    id: `log-${i}`,
    date: new Date(Date.now() - i * 1800000).toISOString(),
    action: i % 2 === 0 ? 'User Login' : 'System Backup',
    details: i % 2 === 0 ? 'User logged in via mobile' : 'Backup successful',
    user: i % 2 === 0 ? 'u_user' : 'system',
    status: i % 10 === 0 ? 'error' : 'success',
  }),
)

// Client History (15 items)
export const MOCK_CLIENT_HISTORY: ClientHistory[] = Array.from({
  length: 15,
}).map((_, i) => ({
  id: `ch-${i}`,
  clientName: `Client ${i}`,
  action: 'Booking Confirmed',
  date: new Date(Date.now() - i * 86400000).toISOString(),
  amount: 1500 + i * 100,
  status: 'completed',
}))

export const MOCK_CHATS: ChatThread[] = [
  {
    id: 'chat1',
    participants: [
      {
        id: 'u_user',
        name: 'End User',
        avatar:
          'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=44',
        role: 'user',
      },
      {
        id: 'u_agency',
        name: 'Travel Agency',
        avatar:
          'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=66',
        role: 'agency',
      },
    ],
    messages: [
      {
        id: 'm1',
        senderId: 'u_agency',
        text: 'Hello! How can I help you with your itinerary?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: true,
      },
      {
        id: 'm2',
        senderId: 'u_user',
        text: 'I need to change the date of my flight.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        isRead: true,
      },
    ],
    lastMessage: 'I need to change the date of my flight.',
    lastUpdated: new Date(Date.now() - 1800000).toISOString(),
    unreadCount: 0,
  },
]
