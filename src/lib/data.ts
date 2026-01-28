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

export const MOODS: { id: string; label: string; icon: string }[] = [
  { id: 'Romantic', label: 'Romântico', icon: 'Heart' },
  { id: 'Economic', label: 'Econômico', icon: 'PiggyBank' },
  { id: 'Quick Bite', label: 'Rápido', icon: 'Zap' },
  { id: 'Adventure', label: 'Aventura', icon: 'Compass' },
  { id: 'Relaxing', label: 'Relax', icon: 'Coffee' },
  { id: 'Family', label: 'Família', icon: 'Users' },
]

export const CATEGORIES: { id: string; label: string; icon: string }[] = [
  { id: 'all', label: 'Todos', icon: 'LayoutGrid' },
  { id: 'Alimentação', label: 'Alimentação', icon: 'Utensils' },
  { id: 'Moda', label: 'Moda', icon: 'Shirt' },
  { id: 'Serviços', label: 'Serviços', icon: 'Briefcase' },
  { id: 'Eletrônicos', label: 'Eletrônicos', icon: 'Smartphone' },
  { id: 'Lazer', label: 'Lazer', icon: 'Ticket' },
  { id: 'Mercado', label: 'Mercado', icon: 'ShoppingBasket' },
  { id: 'Beleza', label: 'Beleza', icon: 'Sparkles' },
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

export const MOCK_COUPONS: Coupon[] = [
  {
    id: '1',
    storeName: 'Burger King',
    companyId: 'c1',
    title: '2 Whoppers por R$ 25,90',
    description: 'Aproveite a oferta clássica de 2 sanduíches Whopper.',
    discount: '40% OFF',
    category: 'Alimentação',
    distance: 300,
    expiryDate: '2024-12-31',
    image: 'https://img.usecurling.com/p/600/400?q=burger%20whopper',
    logo: 'https://img.usecurling.com/i?q=burger%20king&shape=fill&color=orange',
    code: 'BK-WHOP-2X',
    isFeatured: true,
    coordinates: { lat: -23.551, lng: -46.634 },
    totalAvailable: 1000,
    reservedCount: 450,
    maxPerUser: 2,
    averageRating: 4.5,
    moods: ['Quick Bite', 'Family', 'Economic'],
    loyaltyProgram: {
      totalStamps: 5,
      currentStamps: 3,
      reward: '1 Combo Grátis',
    },
    status: 'active',
    source: 'partner',
    region: 'BR-SP',
  },
  {
    id: 'orl1',
    storeName: 'Orlando Theme Park',
    companyId: 'c_us_1',
    title: 'Fast Pass Universal',
    description: 'Corte as filas nos melhores brinquedos da Universal.',
    discount: '20% OFF',
    category: 'Lazer',
    distance: 0,
    expiryDate: '2025-06-30',
    image: 'https://img.usecurling.com/p/600/400?q=theme%20park',
    logo: 'https://img.usecurling.com/i?q=globe&shape=fill&color=blue',
    code: 'UNIV-FAST-20',
    isFeatured: true,
    coordinates: { lat: 28.5383, lng: -81.3792 },
    totalAvailable: 500,
    reservedCount: 150,
    averageRating: 4.9,
    source: 'partner',
    region: 'US-FL',
  },
]

export const MOCK_AB_TESTS: ABTest[] = []

export const MOCK_ITINERARIES: Itinerary[] = [
  {
    id: 'it1',
    title: 'Tour Gastronômico SP',
    description: 'Um passeio pelos sabores de São Paulo.',
    stops: [MOCK_COUPONS[0]],
    days: [
      {
        id: 'd1',
        dayNumber: 1,
        stops: [MOCK_COUPONS[0]],
      },
    ],
    totalSavings: 60,
    duration: '4h',
    image: 'https://img.usecurling.com/p/600/300?q=food%20tour',
    tags: ['Gastronomia', 'Econômico'],
    matchScore: 95,
    region: 'BR-SP',
  },
  {
    id: 'template1',
    title: 'Orlando 10 Dias',
    description: 'Roteiro completo para curtir os parques em Orlando.',
    stops: [MOCK_COUPONS[1]],
    days: Array.from({ length: 10 }).map((_, i) => ({
      id: `d${i + 1}`,
      dayNumber: i + 1,
      stops: i === 0 ? [MOCK_COUPONS[1]] : [],
    })),
    totalSavings: 450,
    duration: '10 Dias',
    image: 'https://img.usecurling.com/p/600/300?q=orlando%20park',
    tags: ['Família', 'Internacional'],
    matchScore: 100,
    isTemplate: true,
    region: 'US-FL',
  },
]

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
    id: 'c_us_1',
    name: 'Universal Resorts',
    email: 'info@universal.com',
    status: 'active',
    registrationDate: '2024-03-01',
    region: 'US-FL',
    enableLoyalty: false,
  },
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
  {
    id: 'ad_us',
    title: 'Visit Florida',
    companyId: 'admin',
    region: 'US-FL',
    category: 'Lazer',
    billingType: 'fixed',
    placement: 'bottom',
    status: 'active',
    views: 5000,
    clicks: 120,
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    image: 'https://img.usecurling.com/p/800/200?q=florida%20beach',
    link: 'https://visitflorida.com',
  },
]

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Super Admin',
    email: 'admin@dealvoy.com',
    role: 'super_admin',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male',
    birthday: '1990-05-15',
    country: 'Brasil',
    city: 'São Paulo',
    phone: '+55 11 99999-9999',
  },
  {
    id: 'u2',
    name: 'João da Silva',
    email: 'joao@email.com',
    role: 'user',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male',
    birthday: '1995-10-20',
    country: 'Brasil',
    city: 'Rio de Janeiro',
    phone: '+55 21 98888-8888',
  },
  {
    id: 'u3',
    name: 'Florida Franchise',
    email: 'florida@dealvoy.com',
    role: 'franchisee',
    region: 'US-FL',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female',
    country: 'USA',
    city: 'Orlando',
    phone: '+1 407 555-0123',
  },
  {
    id: 'u4',
    name: 'Merchant User',
    email: 'merchant@bk.com',
    role: 'merchant',
    companyId: 'c1',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male',
    country: 'Brasil',
    city: 'São Paulo',
    phone: '+55 11 3333-3333',
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
    ownerId: 'u_franchise_sp',
    status: 'active',
    licenseExpiry: '2030-01-01',
  },
  {
    id: 'f2',
    name: 'Deal Voy USA - FL',
    region: 'US-FL',
    ownerId: 'u3',
    status: 'active',
    licenseExpiry: '2028-06-15',
  },
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
  {
    id: 't2',
    type: 'hotel',
    provider: 'Booking.com',
    title: 'Universal Cabana Bay',
    description: 'Resort temático com acesso antecipado aos parques.',
    price: 850,
    currency: 'USD',
    image: 'https://img.usecurling.com/p/300/200?q=hotel%20resort',
    destination: 'Orlando, FL',
    rating: 4.8,
    link: 'https://booking.com',
    region: 'US-FL',
  },
  {
    id: 't3',
    type: 'package',
    provider: 'CVC Viagens',
    title: 'Disney Mágica - 7 Dias',
    description: 'Aéreo + Hotel + Ingressos para 4 parques.',
    price: 12000,
    currency: 'BRL',
    image: 'https://img.usecurling.com/p/300/200?q=disney%20castle',
    destination: 'Orlando, FL',
    rating: 4.9,
    link: 'https://cvc.com.br',
    region: 'BR-SP',
  },
  {
    id: 't4',
    type: 'car_rental',
    provider: 'Hertz',
    title: 'SUV Familiar - Dodge Journey',
    description: 'Perfeito para família e compras. KM Livre.',
    price: 250,
    currency: 'USD',
    image: 'https://img.usecurling.com/p/300/200?q=suv%20car',
    destination: 'Miami, FL',
    rating: 4.6,
    link: 'https://hertz.com',
    region: 'US-FL',
  },
]
