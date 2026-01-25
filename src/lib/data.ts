import { Coupon, SeasonalEvent, Notification, Challenge, Badge } from './types'

export const MOCK_USER_LOCATION = {
  lat: -23.55052,
  lng: -46.633308,
}

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
]

export const SEASONAL_EVENTS: SeasonalEvent[] = [
  {
    id: '1',
    title: 'Black Friday',
    date: new Date('2024-11-29'),
    description: 'As maiores ofertas do ano em todas as lojas.',
    type: 'sale',
  },
  {
    id: '2',
    title: 'Natal',
    date: new Date('2024-12-25'),
    description: 'Ofertas especiais de presentes e decoração.',
    type: 'holiday',
  },
  {
    id: '3',
    title: 'Dia do Consumidor',
    date: new Date('2024-03-15'),
    description: 'Descontos exclusivos para celebrar o consumidor.',
    type: 'sale',
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
  },
  {
    id: '2',
    title: 'Foodie Master',
    description: 'Faça 3 reservas em restaurantes',
    total: 3,
    current: 1,
    reward: 'Super Cupom',
    icon: 'Utensils',
    completed: false,
  },
  {
    id: '3',
    title: 'Explorador',
    description: 'Envie 2 novos cupons',
    total: 2,
    current: 2,
    reward: 'Badge',
    icon: 'Camera',
    completed: true,
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
  {
    id: '2',
    name: 'Explorador',
    description: 'Contribuiu com ofertas',
    image: 'https://img.usecurling.com/i?q=compass&color=blue',
    earnedDate: '2024-02-15',
  },
]

export const MOCK_COUPONS: Coupon[] = [
  {
    id: '1',
    storeName: 'Burger King',
    title: '2 Whoppers por R$ 25,90',
    description:
      'Aproveite a oferta clássica de 2 sanduíches Whopper por um preço especial.',
    discount: '40% OFF',
    category: 'Alimentação',
    distance: 300,
    expiryDate: '2024-12-31',
    image: 'https://img.usecurling.com/p/600/400?q=burger%20whopper',
    logo: 'https://img.usecurling.com/i?q=burger%20king&shape=fill&color=orange',
    code: 'BK-WHOP-2X',
    isFeatured: true,
    isTrending: true,
    terms: 'Válido apenas para unidades participantes.',
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
    lastVerified: new Date().toISOString(),
    upvotes: 120,
    downvotes: 2,
    status: 'active',
    reviews: [
      {
        id: 'r1',
        userId: 'u1',
        userName: 'Carlos Silva',
        rating: 5,
        comment: 'Muito bom e barato!',
        date: '2024-01-15',
      },
    ],
    menu: [
      {
        name: 'Whopper',
        description: 'Hambúrguer grelhado no fogo.',
        price: 24.9,
        translations: {
          en: { name: 'Whopper', description: 'Flame-grilled beef patty.' },
        },
      },
    ],
  },
  {
    id: '7',
    storeName: 'Restaurante da Vila',
    title: 'Menu Executivo - Prato do Dia',
    description: 'Almoço completo com entrada, prato principal e sobremesa.',
    discount: 'R$ 35,00',
    category: 'Alimentação',
    distance: 50,
    expiryDate: '2024-12-31',
    image: 'https://img.usecurling.com/p/600/400?q=lunch%20plate',
    logo: 'https://img.usecurling.com/i?q=fork&shape=fill&color=green',
    code: 'ALMOCO35',
    isSpecial: true,
    coordinates: { lat: -23.55, lng: -46.633 },
    averageRating: 5.0,
    moods: ['Relaxing', 'Economic'],
    acceptsBooking: true,
    reviews: [],
    menu: [],
  },
  {
    id: '2',
    storeName: 'C&A Modas',
    title: 'R$ 50 de desconto em Jeans',
    description: 'Nas compras acima de R$ 200,00 em peças jeans.',
    discount: 'R$ 50 OFF',
    category: 'Moda',
    distance: 850,
    expiryDate: '2024-11-15',
    image: 'https://img.usecurling.com/p/600/400?q=jeans%20fashion',
    logo: 'https://img.usecurling.com/i?q=clothes&shape=fill&color=blue',
    code: 'JEANS50',
    isFeatured: true,
    coordinates: { lat: -23.548, lng: -46.636 },
    totalAvailable: 500,
    reservedCount: 120,
    averageRating: 4.0,
    reviews: [],
  },
]
