import { Coupon, SeasonalEvent } from './types'

// Mock location (Sao Paulo center-ish)
export const MOCK_USER_LOCATION = {
  lat: -23.55052,
  lng: -46.633308,
}

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
  {
    id: '4',
    title: 'Festival de Inverno',
    date: new Date('2024-06-21'),
    description: 'Ofertas de roupas e comidas típicas da estação.',
    type: 'event',
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
    terms: 'Válido apenas para unidades participantes. Não acumulável.',
    coordinates: { lat: -23.551, lng: -46.634 },
    totalAvailable: 1000,
    reservedCount: 450,
    maxPerUser: 2,
    menu: [
      {
        name: 'Whopper',
        description: 'Hambúrguer grelhado no fogo com queijo, picles e molho.',
        price: 24.9,
        translations: {
          en: {
            name: 'Whopper',
            description:
              'Flame-grilled beef patty with cheese, pickles and sauce.',
          },
          es: {
            name: 'Whopper',
            description:
              'Hamburguesa a la parrilla con queso, pepinillos y salsa.',
          },
        },
      },
      {
        name: 'Batata Frita Média',
        description: 'Batatas fritas crocantes e douradas.',
        price: 12.9,
        translations: {
          en: {
            name: 'Medium Fries',
            description: 'Crispy and golden french fries.',
          },
          es: {
            name: 'Papas Fritas Medianas',
            description: 'Papas fritas crujientes y doradas.',
          },
        },
      },
    ],
  },
  {
    id: '2',
    storeName: 'C&A Modas',
    title: 'R$ 50 de desconto em Jeans',
    description:
      'Nas compras acima de R$ 200,00 em peças jeans femininas ou masculinas.',
    discount: 'R$ 50 OFF',
    category: 'Moda',
    distance: 850,
    expiryDate: '2024-11-15',
    image: 'https://img.usecurling.com/p/600/400?q=jeans%20fashion',
    logo: 'https://img.usecurling.com/i?q=clothes&shape=fill&color=blue',
    code: 'JEANS50',
    isFeatured: true,
    terms: 'Exceto peças remarcadas.',
    coordinates: { lat: -23.548, lng: -46.636 },
    totalAvailable: 500,
    reservedCount: 120,
    maxPerUser: 1,
  },
  {
    id: '3',
    storeName: 'Cinemark',
    title: 'Ingresso 2x1 (Seg-Qui)',
    description: 'Compre um ingresso inteira e ganhe outro grátis.',
    discount: '2x1',
    category: 'Lazer',
    distance: 1200,
    expiryDate: '2024-10-30',
    image: 'https://img.usecurling.com/p/600/400?q=cinema%20popcorn',
    logo: 'https://img.usecurling.com/i?q=film&shape=fill&color=red',
    code: 'CINE2X1',
    isTrending: true,
    terms: 'Válido para sessões 2D. Não válido para feriados.',
    coordinates: { lat: -23.555, lng: -46.64 },
    totalAvailable: 200,
    reservedCount: 180, // High demand
    maxPerUser: 2,
  },
  {
    id: '4',
    storeName: 'Smart Fit',
    title: '1º Mês Grátis + Adesão Zero',
    description: 'Comece a treinar hoje mesmo sem pagar nada no primeiro mês.',
    discount: 'Grátis',
    category: 'Serviços',
    distance: 450,
    expiryDate: '2024-09-20',
    image: 'https://img.usecurling.com/p/600/400?q=gym%20workout',
    logo: 'https://img.usecurling.com/i?q=dumbbell&shape=fill&color=black',
    code: 'SMART-ZERO',
    terms: 'Válido para plano Black.',
    coordinates: { lat: -23.552, lng: -46.631 },
  },
  {
    id: '5',
    storeName: 'Samsung Store',
    title: '15% OFF em Acessórios',
    description: 'Desconto em capas, carregadores e fones Galaxy Buds.',
    discount: '15% OFF',
    category: 'Eletrônicos',
    distance: 2500,
    expiryDate: '2024-12-01',
    image: 'https://img.usecurling.com/p/600/400?q=headphones%20tech',
    logo: 'https://img.usecurling.com/i?q=samsung&shape=fill&color=blue',
    code: 'SAMS15',
    coordinates: { lat: -23.56, lng: -46.65 },
  },
  {
    id: '6',
    storeName: "McDonald's",
    title: 'McOferta Big Mac por R$ 19,90',
    description: 'Sanduíche + Batata Média + Bebida.',
    discount: '30% OFF',
    category: 'Alimentação',
    distance: 150,
    expiryDate: '2024-11-25',
    image: 'https://img.usecurling.com/p/600/400?q=burger%20fries',
    logo: 'https://img.usecurling.com/i?q=mcdonalds&shape=fill&color=yellow',
    code: 'BIGMAC19',
    isTrending: true,
    coordinates: { lat: -23.549, lng: -46.632 },
    isSpecial: true, // Executive lunch style
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
    menu: [
      {
        name: 'Feijoada Completa',
        description: 'Feijão preto, carnes nobres, arroz, couve e farofa.',
        price: 35.0,
        translations: {
          en: {
            name: 'Complete Feijoada',
            description:
              'Black beans stew with pork, rice, collard greens and cassava flour.',
          },
          es: {
            name: 'Feijoada Completa',
            description:
              'Estofado de frijoles negros con cerdo, arroz, col y harina de yuca.',
          },
        },
      },
    ],
  },
]
