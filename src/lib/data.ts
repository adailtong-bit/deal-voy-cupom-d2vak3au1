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
  DiscoveredPromotion,
  AdPricing,
  Advertiser,
  AdInvoice,
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
    case 'outros':
    case 'others':
    case 'otros':
      return 'category.others'
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

const generateCoupons = (): Coupon[] => {
  const coupons: Coupon[] = []
  const categories = ['Alimentação', 'Moda', 'Serviços', 'Outros'] as const
  const statuses = ['active', 'used', 'expired'] as const

  coupons.push({
    id: 'nike-promo-50',
    storeName: 'Nike Store',
    companyId: 'c1',
    title: '50% Nike',
    description:
      'Exclusive 50% discount on all running shoes. Single use only.',
    discount: '50% OFF',
    category: 'Moda',
    distance: 150,
    expiryDate: '2025-12-31',
    image: 'https://img.usecurling.com/p/600/400?q=nike%20shoes',
    logo: 'https://img.usecurling.com/i?q=nike&color=black&shape=fill',
    code: 'NIKE-50-PROMO',
    coordinates: { lat: -23.55052, lng: -46.633308 },
    totalAvailable: 1000,
    reservedCount: 50,
    averageRating: 4.8,
    status: 'active',
    source: 'partner',
    region: 'BR-SP',
    country: 'Brasil',
    state: 'São Paulo',
    city: 'São Paulo',
    visitCount: 0,
    price: 199.99,
    currency: 'BRL',
    address: 'Av. Paulista, 1230, São Paulo, SP',
    instructions:
      'Apresente este código no caixa da loja para aplicar o desconto. Válido apenas para itens selecionados.',
    targetAudience: 'all',
  })

  for (let i = 1; i <= 30; i++) {
    const isUS = i % 2 !== 0
    const cityBR = i % 2 === 0 ? 'São Paulo' : 'Campinas'
    const cityUS = i % 2 === 0 ? 'Miami' : 'Orlando'
    const country = isUS ? 'USA' : 'Brasil'
    const state = isUS ? 'Florida' : 'São Paulo'
    const city = isUS ? cityUS : cityBR

    const reviews: Review[] = []
    if (i <= 5) {
      reviews.push({
        id: `rev-${i}-1`,
        userId: `u_user`,
        userName: 'Happy Customer',
        rating: 5,
        comment: 'Great service and amazing food!',
        date: new Date().toISOString(),
        replies:
          i === 1
            ? [
                {
                  id: `rep-${i}-1`,
                  userId: `u_shop`,
                  userName: 'Store Owner',
                  text: 'Thank you for your feedback! Hope to see you again.',
                  date: new Date().toISOString(),
                  role: 'vendor',
                },
              ]
            : [],
      })
    }

    const discountTypes = ['percentage', 'fixed', 'free_shipping'] as const
    const type = discountTypes[i % 3]
    let discountStr = ''
    if (type === 'percentage') discountStr = `${10 + (i % 50)}% OFF`
    else if (type === 'fixed')
      discountStr = isUS ? `${5 + (i % 20)} OFF` : `R$ ${10 + (i % 30)} OFF`
    else discountStr = isUS ? 'Free Shipping' : 'Frete Grátis'

    coupons.push({
      id: `cpn-${i}`,
      storeName: isUS ? `Store #${i} USA` : `Loja #${i} BR`,
      companyId: isUS ? `c${i + 5}` : `c${i}`,
      title: isUS ? `Super Deal ${i}` : `Oferta Imperdível ${i}`,
      description: isUS
        ? `Amazing discount on all items in section ${i}. Explore more!`
        : `Desconto incrível em todos os itens da seção ${i}. Venha conferir!`,
      discount: discountStr,
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
      country,
      state,
      city,
      price: i % 2 === 0 ? 50 + i * 10 : undefined,
      currency: isUS ? 'USD' : 'BRL',
      reviews: reviews,
      address: isUS
        ? `${1000 + i} Ocean Drive, Miami, FL`
        : `Av. Paulista, ${1000 + i}, São Paulo, SP`,
      instructions: `Apresente este código no caixa do ${isUS ? 'estabelecimento' : 'estabelecimento'} para resgatar sua oferta. Certifique-se de que o código esteja visível.`,
      targetAudience: i % 5 === 0 ? 'preferred' : 'all',
      behavioralTriggers:
        i === 1
          ? [
              {
                id: 'bt-1',
                type: 'visit',
                threshold: 3,
                reward: 'Free Coffee',
                isActive: true,
              },
            ]
          : [],
    })
  }
  return coupons
}

export const MOCK_COUPONS: Coupon[] = generateCoupons()

export const MOCK_AB_TESTS: ABTest[] = []

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
      preferredCustomers: i === 1 ? ['u_user'] : [],
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
    price: 29.9,
    currency: 'BRL',
    advertiserId: 'adv1',
    durationDays: 30,
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
    price: 49.99,
    currency: 'USD',
  },
]

export const MOCK_USERS: User[] = [
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
  {
    id: 'u_shop',
    name: 'Shop Merchant',
    email: 'shop@dealvoy.com',
    role: 'shopkeeper',
    companyId: 'c1',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=55',
    country: 'Brasil',
    state: 'São Paulo',
    city: 'Santos',
    phone: '+55 13 96666-6666',
  },
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
    hasSeparatedRooms: false,
  },
  {
    id: 'h1',
    type: 'hotel',
    provider: 'Family Resorts',
    title: 'Orlando Family Suite',
    description: 'Espaçosa suíte com 2 quartos separados e sala de estar.',
    price: 850,
    currency: 'USD',
    image: 'https://img.usecurling.com/p/300/200?q=hotel%20suite',
    destination: 'Orlando, FL',
    rating: 4.8,
    link: 'https://booking.com',
    region: 'US-FL',
    hasSeparatedRooms: true,
  },
  {
    id: 'h2',
    type: 'hotel',
    provider: 'Budget Inn',
    title: 'Standard Room',
    description: 'Quarto padrão com 2 camas queen.',
    price: 120,
    currency: 'USD',
    image: 'https://img.usecurling.com/p/300/200?q=hotel%20room',
    destination: 'Orlando, FL',
    rating: 3.5,
    link: 'https://booking.com',
    region: 'US-FL',
    hasSeparatedRooms: false,
  },
  {
    id: 'h3',
    type: 'hotel',
    provider: 'Luxury Stays',
    title: 'Executive Apartment',
    description:
      'Apartamento executivo com quarto separado e área de trabalho.',
    price: 450,
    currency: 'USD',
    image: 'https://img.usecurling.com/p/300/200?q=luxury%20apartment',
    destination: 'Miami, FL',
    rating: 4.9,
    link: 'https://booking.com',
    region: 'US-FL',
    hasSeparatedRooms: true,
  },
  {
    id: 'h4',
    type: 'hotel',
    provider: 'City Center Hotel',
    title: 'Double Room',
    description: 'Quarto confortável no centro da cidade.',
    price: 180,
    currency: 'BRL',
    image: 'https://img.usecurling.com/p/300/200?q=hotel%20city',
    destination: 'São Paulo, SP',
    rating: 4.0,
    link: 'https://booking.com',
    region: 'BR-SP',
    hasSeparatedRooms: false,
  },
]

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

export const MOCK_VALIDATION_LOGS: ValidationLog[] = Array.from({
  length: 20,
}).map((_, i) => ({
  id: `vl-${i}`,
  couponId: `cpn-${(i % 5) + 1}`,
  couponTitle: `Coupon Offer ${(i % 5) + 1}`,
  customerName: `Customer ${i}`,
  validatedAt: new Date(Date.now() - i * 3600000).toISOString(),
  method: i % 2 === 0 ? 'qr' : 'manual',
  shopkeeperId: 'u_shop',
  userId: i % 3 === 0 ? 'u_user' : 'u_agency',
}))

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

export const MOCK_CRAWLER_SOURCES: CrawlerSource[] = [
  {
    id: 'cs1',
    name: 'Local Deals API',
    url: 'https://api.localdeals.com',
    type: 'api',
    region: 'BR-SP',
    scanRadius: 50,
    status: 'active',
    lastScan: new Date().toISOString(),
  },
  {
    id: 'cs2',
    name: 'Florida Coupons Web',
    url: 'https://flcoupons.com',
    type: 'web',
    region: 'US-FL',
    scanRadius: 100,
    status: 'active',
  },
]

export const MOCK_DISCOVERED_PROMOTIONS: DiscoveredPromotion[] = [
  {
    id: 'dp1',
    sourceId: 'cs1',
    title: 'Pizza 50% Off',
    discount: '50% OFF',
    description:
      'Half price on all family sized pizzas. Enjoy this local deal!',
    expiryDate: '2025-12-31',
    image: 'https://img.usecurling.com/p/300/200?q=pizza',
    storeName: 'Papa Johns',
    status: 'pending',
    region: 'BR-SP',
    category: 'Alimentação',
    capturedAt: new Date(Date.now() - 3600000).toISOString(),
    rawData: {
      original_title: 'Papa Johns Special 50%',
      price_info: '50% Off Regular Price',
      vendor: 'Papa Johns Local',
      api_timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
  },
  {
    id: 'dp2',
    sourceId: 'cs2',
    title: 'Theme Park Tickets',
    discount: '$20 OFF',
    description: 'Discounted tickets for the whole family.',
    expiryDate: '2025-10-31',
    image: 'https://img.usecurling.com/p/300/200?q=theme%20park',
    storeName: 'Orlando Parks',
    status: 'pending',
    region: 'US-FL',
    category: 'Lazer',
    capturedAt: new Date(Date.now() - 86400000).toISOString(),
    rawData: {
      headline: 'Orlando Parks - Save Big!',
      discount_value: '$20',
      source_link: 'https://flcoupons.com/deal/orlando-parks',
      scraped_images: ['url1', 'url2'],
    },
  },
]

export const MOCK_AD_PRICING: AdPricing[] = [
  { id: 'ap1', placement: 'top', durationDays: 7, price: 150 },
  { id: 'ap2', placement: 'bottom', durationDays: 30, price: 400 },
  { id: 'ap3', placement: 'search', durationDays: 15, price: 200 },
]

export const MOCK_ADVERTISERS: Advertiser[] = [
  {
    id: 'adv1',
    companyName: 'Local Burger Co.',
    taxId: '12.345.678/0001-90',
    email: 'marketing@localburger.com',
    phone: '11 98888-7777',
    address: {
      street: 'Av. Paulista',
      number: '1000',
      city: 'São Paulo',
      state: 'SP',
      zip: '01310-100',
    },
  },
]

export const MOCK_AD_INVOICES: AdInvoice[] = [
  {
    id: 'inv1',
    adId: 'ad1',
    advertiserId: 'adv1',
    amount: 150,
    issueDate: new Date().toISOString(),
    status: 'paid',
  },
]
