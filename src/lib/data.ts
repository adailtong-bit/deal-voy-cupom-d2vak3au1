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
    id: 'Outros',
    label: 'Outros',
    translationKey: 'category.others',
    icon: 'CircleEllipsis',
  },
]

const generateSeasonalEvents = (): SeasonalEvent[] => {
  const events: SeasonalEvent[] = []
  const statuses: SeasonalEvent['status'][] = [
    'draft',
    'pending',
    'active',
    'expired',
    'active',
  ]

  for (let i = 1; i <= 15; i++) {
    const status = statuses[i % statuses.length]
    const now = new Date()
    let startDate = new Date()
    let endDate = new Date()

    if (status === 'expired') {
      startDate.setDate(now.getDate() - 30)
      endDate.setDate(now.getDate() - 5)
    } else if (status === 'active') {
      startDate.setDate(now.getDate() - (i % 2 === 0 ? 5 : 10))
      endDate.setDate(now.getDate() + (i % 3 === 0 ? 3 : 15))
    } else {
      startDate.setDate(now.getDate() + 5)
      endDate.setDate(now.getDate() + 35)
    }

    events.push({
      id: `se-${i}`,
      title: `Campanha ${i} - ${status.toUpperCase()}`,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      description: `Campanha promocional especial ${i} com descontos exclusivos em vários canais.`,
      instructions: `Resgate este código promocional durante a campanha sazonal. Apenas um uso por pessoa.`,
      type: i % 2 === 0 ? 'sale' : 'event',
      companyId: `c${(i % 5) + 1}`,
      franchiseId: i % 2 === 0 ? 'f1' : 'f2',
      billingAmount: 500 + i * 100,
      price: 500 + i * 100,
      status,
      clickCount:
        status === 'active' || status === 'expired'
          ? Math.floor(Math.random() * 1000) + 100
          : 0,
      image: `https://img.usecurling.com/p/600/400?q=campaign&seed=${i}`,
      vouchers:
        status === 'active'
          ? Array.from({ length: 15 }).map(
              (_, vi) =>
                `VCH-${i}-${vi}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            )
          : [],
      totalAvailable: status === 'active' ? (i % 4 === 0 ? 0 : 50) : undefined,
      translations: {
        en: {
          title: `Campaign ${i} - ${status.toUpperCase()}`,
          description: `Special promotional campaign ${i} with exclusive discounts across multiple channels.`,
          instructions: `Redeem this promotional code during the seasonal campaign. Single use per person.`,
        },
        pt: {
          title: `Campanha ${i} - ${status.toUpperCase()}`,
          description: `Campanha promocional especial ${i} com descontos exclusivos em vários canais.`,
          instructions: `Resgate este código promocional durante a campanha sazonal. Apenas um uso por pessoa.`,
        },
        es: {
          title: `Campaña ${i} - ${status.toUpperCase()}`,
          description: `Campaña promocional especial ${i} con descuentos exclusivos en varios canales.`,
          instructions: `Canjee este código promocional durante la campaña de temporada. Un solo uso por persona.`,
        },
      },
    })
  }
  return events
}

export const SEASONAL_EVENTS: SeasonalEvent[] = generateSeasonalEvents()

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
  const categories = [
    'Alimentação',
    'Moda',
    'Serviços',
    'Eletrônicos',
    'Lazer',
    'Mercado',
    'Beleza',
    'Outros',
  ] as const
  const statuses = ['active', 'used', 'expired'] as const

  // Online Affiliate Offers
  coupons.push({
    id: 'amazon-online-1',
    storeName: 'Amazon',
    companyId: 'c_amazon',
    franchiseId: 'f1',
    title: 'Echo Dot (5ª Geração)',
    description:
      'Smart speaker com Alexa. Use o código para 20% de desconto adicional no checkout.',
    discount: '20% OFF',
    category: 'Eletrônicos',
    distance: 0,
    expiryDate: '2025-12-31',
    image: 'https://img.usecurling.com/p/600/400?q=smart%20speaker',
    logo: 'https://img.usecurling.com/i?q=amazon&color=solid-black&shape=fill',
    code: 'ALEXA20OFF',
    coordinates: { lat: 0, lng: 0 },
    totalAvailable: 10000,
    reservedCount: 1500,
    averageRating: 4.9,
    status: 'active',
    source: 'partner',
    region: 'Global',
    country: 'Global',
    offerType: 'online',
    externalUrl: 'https://www.amazon.com/dp/B09B8V1LZ3',
    affiliateConfig: {
      paramName: 'tag',
      partnerId: 'dealvoy-20',
      discountParamName: 'couponCode',
    },
    price: 299.0,
    currency: 'BRL',
    instructions:
      'Clique em Comprar Agora. O código será copiado e o desconto será aplicado no checkout da Amazon.',
    targetAudience: 'all',
    translations: {
      en: {
        title: 'Echo Dot (5th Gen)',
        description:
          'Smart speaker with Alexa. Use the code for an additional 20% discount at checkout.',
        instructions:
          'Click Buy Now. The code will be copied and the discount will be applied at Amazon checkout.',
      },
      es: {
        title: 'Echo Dot (5ª Generación)',
        description:
          'Altavoz inteligente con Alexa. Usa el código para un 20% de descuento adicional en el carrito.',
        instructions:
          'Haz clic en Comprar Ahora. El código se copiará y el descuento se aplicará en la caja de Amazon.',
      },
      pt: {
        title: 'Echo Dot (5ª Geração)',
        description:
          'Smart speaker com Alexa. Use o código para 20% de desconto adicional no checkout.',
        instructions:
          'Clique em Comprar Agora. O código será copiado e o desconto será aplicado no checkout da Amazon.',
      },
    },
  })

  coupons.push({
    id: 'shopee-online-1',
    storeName: 'Shopee',
    companyId: 'c_shopee',
    franchiseId: 'f2',
    title: 'Fones de Ouvido Bluetooth',
    description:
      'Fones sem fio com cancelamento de ruído. Oferta exclusiva online para dropshipping parceiro.',
    discount: 'R$ 50 OFF',
    category: 'Eletrônicos',
    distance: 0,
    expiryDate: '2025-10-31',
    image: 'https://img.usecurling.com/p/600/400?q=headphones',
    logo: 'https://img.usecurling.com/i?q=shopee&color=orange&shape=fill',
    code: 'SHP50OFF',
    coordinates: { lat: 0, lng: 0 },
    totalAvailable: 0, // Mocked sold out
    status: 'active',
    source: 'aggregated',
    region: 'Global',
    country: 'Global',
    offerType: 'online',
    externalUrl: 'https://shopee.com.br/',
    affiliateConfig: {
      paramName: 'aff_id',
    },
    price: 150.0,
    currency: 'BRL',
    instructions:
      'Resgate online. Não esqueça de colar o código promocional no carrinho de compras.',
    targetAudience: 'all',
    translations: {
      en: {
        title: 'Bluetooth Headphones',
        description:
          'Wireless headphones with noise cancellation. Exclusive online offer for partner dropshipping.',
        instructions:
          'Redeem online. Do not forget to paste the promotional code in the shopping cart.',
      },
      es: {
        title: 'Auriculares Bluetooth',
        description:
          'Auriculares inalámbricos con cancelación de ruido. Oferta en línea exclusiva para dropshipping asociado.',
        instructions:
          'Canjear en línea. No olvide pegar el código promocional en el carrito de compras.',
      },
      pt: {
        title: 'Fones de Ouvido Bluetooth',
        description:
          'Fones sem fio com cancelamento de ruído. Oferta exclusiva online para dropshipping parceiro.',
        instructions:
          'Resgate online. Não esqueça de colar o código promocional no carrinho de compras.',
      },
    },
  })

  // Physical Store Offers
  coupons.push({
    id: 'nike-promo-50',
    storeName: 'Nike Store',
    companyId: 'c1',
    franchiseId: 'f1',
    title: '50% Nike',
    description:
      'Desconto exclusivo de 50% em todos os tênis de corrida. Apenas um uso.',
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
    offerType: 'in-store',
    instructions:
      'Apresente este código no caixa da loja para aplicar o desconto. Válido apenas para itens selecionados.',
    targetAudience: 'all',
    enableProximityAlerts: true,
    alertRadius: 200,
    proximityAlertsSent: 120,
    redeemedViaAlert: 45,
    translations: {
      en: {
        title: '50% Nike',
        description:
          'Exclusive 50% discount on all running shoes. Single use only.',
        instructions:
          'Present this code at the store checkout to apply the discount. Valid only for selected items.',
      },
      es: {
        title: '50% Nike',
        description:
          'Descuento exclusivo del 50% en todas las zapatillas de running. Un solo uso.',
        instructions:
          'Presente este código en la caja de la tienda para aplicar el descuento. Válido solo para artículos seleccionados.',
      },
      pt: {
        title: '50% Nike',
        description:
          'Desconto exclusivo de 50% em todos os tênis de corrida. Apenas um uso.',
        instructions:
          'Apresente este código no caixa da loja para aplicar o desconto. Válido apenas para itens selecionados.',
      },
    },
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

    const titleEn = isUS ? `Super Deal ${i}` : `Unmissable Offer ${i}`
    const descEn = isUS
      ? `Amazing discount on all items in section ${i}. Explore more!`
      : `Incredible discount on all items in section ${i}. Come check it out!`
    const instEn = `Present this code at the establishment checkout to redeem your offer. Make sure the code is visible.`

    const titlePt = isUS ? `Super Oferta ${i}` : `Oferta Imperdível ${i}`
    const descPt = isUS
      ? `Desconto incrível em todos os itens da seção ${i}. Explore mais!`
      : `Desconto incrível em todos os itens da seção ${i}. Venha conferir!`
    const instPt = `Apresente este código no caixa do estabelecimento para resgatar sua oferta. Certifique-se de que o código esteja visível.`

    const titleEs = isUS ? `Súper Oferta ${i}` : `Oferta Imperdible ${i}`
    const descEs = isUS
      ? `¡Increíble descuento en todos los artículos de la sección ${i}. ¡Explora más!`
      : `¡Descuento increíble en todos los artículos de la sección ${i}. ¡Ven a verlo!`
    const instEs = `Presente este código en la caja del establecimiento para canjear su oferta. Asegúrese de que el código sea visible.`

    coupons.push({
      id: `cpn-${i}`,
      storeName: isUS ? `Store #${i} USA` : `Loja #${i} BR`,
      companyId: isUS ? `c${i + 5}` : `c${i}`,
      franchiseId: isUS ? 'f2' : 'f1',
      title: titlePt,
      description: descPt,
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
      totalAvailable: i % 5 === 0 ? 0 : 100 * i, // Some sold out
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
      offerType: 'in-store',
      instructions: instPt,
      targetAudience: i % 5 === 0 ? 'preferred' : 'all',
      enableProximityAlerts: i % 4 === 0,
      alertRadius: 100 + (i % 5) * 50,
      proximityAlertsSent:
        i % 4 === 0 ? Math.floor(Math.random() * 80) + 10 : 0,
      redeemedViaAlert: i % 4 === 0 ? Math.floor(Math.random() * 20) + 2 : 0,
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
      translations: {
        en: { title: titleEn, description: descEn, instructions: instEn },
        pt: { title: titlePt, description: descPt, instructions: instPt },
        es: { title: titleEs, description: descEs, instructions: instEs },
      },
    })
  }

  // Add Franchisee NY Coupons
  coupons.push(
    {
      id: 'cpn_ny_f1',
      companyId: 'c_ny_hq',
      franchiseId: 'f_ny',
      title: 'Desconto NY Empire State',
      description: 'Oferta Exclusiva da Franquia de NY',
      instructions: 'Apresente na recepção para resgatar sua oferta.',
      discount: '20% OFF',
      category: 'Outros',
      distance: 5,
      expiryDate: '2025-12-31',
      image: 'https://img.usecurling.com/p/600/400?q=new%20york',
      code: 'NYEMP20',
      coordinates: { lat: 40.7128, lng: -74.006 },
      totalAvailable: 500,
      reservedCount: 150,
      status: 'active',
      source: 'partner',
      region: 'US-NY',
      country: 'USA',
      state: 'New York',
      city: 'New York',
      storeName: 'Deal Voy NY HQ',
      targetAudience: 'all',
      currency: 'USD',
      translations: {
        en: {
          title: 'NY Empire State Discount',
          description: 'Exclusive NY Franchise Deal',
          instructions: 'Show at the front desk to redeem your offer.',
        },
        pt: {
          title: 'Desconto NY Empire State',
          description: 'Oferta Exclusiva da Franquia de NY',
          instructions: 'Apresente na recepção para resgatar sua oferta.',
        },
        es: {
          title: 'Descuento NY Empire State',
          description: 'Oferta Exclusiva de la Franquicia de NY',
          instructions: 'Mostrar en la recepción para canjear su oferta.',
        },
      },
    },
    {
      id: 'cpn_ny_f2',
      companyId: 'c_ny_hq',
      franchiseId: 'f_ny',
      title: 'Especial de Fim de Semana em Manhattan',
      description: 'Especial de fim de semana para Manhattan.',
      instructions: 'Apresente este código no checkout.',
      discount: '$15.00 OFF',
      category: 'Outros',
      distance: 2,
      expiryDate: '2025-12-31',
      image: 'https://img.usecurling.com/p/600/400?q=manhattan',
      code: 'MAN15',
      coordinates: { lat: 40.7128, lng: -74.006 },
      totalAvailable: 200,
      reservedCount: 50,
      status: 'active',
      source: 'partner',
      region: 'US-NY',
      country: 'USA',
      state: 'New York',
      city: 'New York',
      storeName: 'Deal Voy NY HQ',
      targetAudience: 'all',
      currency: 'USD',
      translations: {
        en: {
          title: 'Manhattan Weekend Special',
          description: 'Weekend special for Manhattan.',
          instructions: 'Present this code at checkout.',
        },
        pt: {
          title: 'Especial de Fim de Semana em Manhattan',
          description: 'Especial de fim de semana para Manhattan.',
          instructions: 'Apresente este código no checkout.',
        },
        es: {
          title: 'Especial de Fin de Semana en Manhattan',
          description: 'Especial de fin de semana para Manhattan.',
          instructions: 'Presente este código en la caja.',
        },
      },
    },
    {
      id: 'cpn_ny_f3',
      companyId: 'c_ny_hq',
      franchiseId: 'f_ny',
      title: 'Desconto de Primeira Compra Big Apple',
      description: 'Desconto para primeira compra em NY.',
      instructions: 'Válido apenas para novos clientes.',
      discount: '10% OFF',
      category: 'Outros',
      distance: 10,
      expiryDate: '2025-12-31',
      image: 'https://img.usecurling.com/p/600/400?q=apple',
      code: 'BIG10',
      coordinates: { lat: 40.7128, lng: -74.006 },
      totalAvailable: 1000,
      reservedCount: 300,
      status: 'active',
      source: 'partner',
      region: 'US-NY',
      country: 'USA',
      state: 'New York',
      city: 'New York',
      storeName: 'Deal Voy NY HQ',
      targetAudience: 'all',
      currency: 'USD',
      translations: {
        en: {
          title: 'Big Apple First Purchase',
          description: 'First purchase discount in NY.',
          instructions: 'Valid only for new customers.',
        },
        pt: {
          title: 'Desconto de Primeira Compra Big Apple',
          description: 'Desconto para primeira compra em NY.',
          instructions: 'Válido apenas para novos clientes.',
        },
        es: {
          title: 'Descuento de Primera Compra Big Apple',
          description: 'Descuento para primera compra en NY.',
          instructions: 'Válido solo para clientes nuevos.',
        },
      },
    },
    {
      id: 'cpn_ny_m1',
      companyId: 'c_ny_1',
      franchiseId: 'f_ny',
      title: 'Compre 1 Leve 2 - Brooklyn Coffee',
      description: 'Especial matinal - Compre um café, ganhe outro grátis.',
      instructions: 'Mostre o cupom no balcão.',
      discount: 'BOGO',
      category: 'Alimentação',
      distance: 1,
      expiryDate: '2025-12-31',
      image: 'https://img.usecurling.com/p/600/400?q=coffee',
      code: 'BK15',
      coordinates: { lat: 40.7128, lng: -74.006 },
      totalAvailable: 100,
      reservedCount: 20,
      status: 'active',
      source: 'partner',
      region: 'US-NY',
      country: 'USA',
      state: 'New York',
      city: 'New York',
      storeName: 'Brooklyn Coffee',
      targetAudience: 'all',
      currency: 'USD',
      translations: {
        en: {
          title: 'Brooklyn Coffee Buy 1 Get 1',
          description: 'Morning coffee special - Buy one coffee, get one free.',
          instructions: 'Show coupon at the counter.',
        },
        pt: {
          title: 'Compre 1 Leve 2 - Brooklyn Coffee',
          description: 'Especial matinal - Compre um café, ganhe outro grátis.',
          instructions: 'Mostre o cupom no balcão.',
        },
        es: {
          title: 'Compra 1 Lleva 2 - Brooklyn Coffee',
          description:
            'Especial de la mañana - Compra un café, llévate otro gratis.',
          instructions: 'Mostrar el cupón en el mostrador.',
        },
      },
    },
    {
      id: 'cpn_ny_m2',
      companyId: 'c_ny_2',
      franchiseId: 'f_ny',
      title: '20% Off Queens Pizza',
      description: 'Desconto em combo de pizza e refrigerante.',
      instructions: 'Apresente este código no caixa da pizzaria.',
      discount: '20% OFF',
      category: 'Alimentação',
      distance: 3,
      expiryDate: '2025-12-31',
      image: 'https://img.usecurling.com/p/600/400?q=pizza',
      code: 'QZ5',
      coordinates: { lat: 40.7128, lng: -74.006 },
      totalAvailable: 100,
      reservedCount: 80,
      status: 'active',
      source: 'partner',
      region: 'US-NY',
      country: 'USA',
      state: 'New York',
      city: 'New York',
      storeName: 'Queens Pizza',
      targetAudience: 'all',
      currency: 'USD',
      enableProximityAlerts: true,
      alertRadius: 150,
      proximityAlertsSent: 45,
      redeemedViaAlert: 12,
      translations: {
        en: {
          title: 'Queens Pizza 20% Off',
          description: 'Pizza and soda combo discount.',
          instructions: 'Present this code at the pizza place checkout.',
        },
        pt: {
          title: '20% Off Queens Pizza',
          description: 'Desconto em combo de pizza e refrigerante.',
          instructions: 'Apresente este código no caixa da pizzaria.',
        },
        es: {
          title: '20% Off Queens Pizza',
          description: 'Descuento en combo de pizza y refresco.',
          instructions: 'Presente este código en la caja de la pizzería.',
        },
      },
    },
    {
      id: 'cpn_ny_m3',
      companyId: 'c_ny_3',
      franchiseId: 'f_ny',
      title: 'Passe de Convidado',
      description: 'Passe de academia com desconto.',
      instructions: 'Mostre na recepção da academia.',
      discount: '50% OFF',
      category: 'Lazer',
      distance: 8,
      expiryDate: '2023-12-31',
      image: 'https://img.usecurling.com/p/600/400?q=gym',
      code: 'BX50',
      coordinates: { lat: 40.7128, lng: -74.006 },
      totalAvailable: 50,
      reservedCount: 50,
      status: 'expired',
      source: 'partner',
      region: 'US-NY',
      country: 'USA',
      state: 'New York',
      city: 'New York',
      storeName: 'Bronx Fitness',
      targetAudience: 'all',
      currency: 'USD',
      translations: {
        en: {
          title: 'Guest Pass Discount',
          description: 'Discounted gym pass.',
          instructions: 'Show at the gym reception.',
        },
        pt: {
          title: 'Passe de Convidado',
          description: 'Passe de academia com desconto.',
          instructions: 'Mostre na recepção da academia.',
        },
        es: {
          title: 'Pase de Invitado',
          description: 'Pase de gimnasio con descuento.',
          instructions: 'Mostrar en la recepción del gimnasio.',
        },
      },
    },
  )

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
      franchiseId: isUS ? 'f2' : 'f1',
      webhookUrl:
        i === 1 ? 'https://api.example-pos.com/webhooks/dealvoy' : undefined,
    })
  }

  // NY Companies
  companies.push(
    {
      id: 'c_ny_hq',
      name: 'Deal Voy NY HQ',
      email: 'hq@dealvoy.com',
      status: 'active',
      region: 'US-NY',
      franchiseId: 'f_ny',
      enableLoyalty: false,
      registrationDate: '2024-01-01',
    },
    {
      id: 'c_ny_1',
      name: 'Brooklyn Coffee',
      email: 'bk@example.com',
      status: 'active',
      region: 'US-NY',
      franchiseId: 'f_ny',
      enableLoyalty: false,
      registrationDate: '2024-01-01',
    },
    {
      id: 'c_ny_2',
      name: 'Queens Pizza',
      email: 'queens@example.com',
      status: 'active',
      region: 'US-NY',
      franchiseId: 'f_ny',
      enableLoyalty: false,
      registrationDate: '2024-01-01',
    },
    {
      id: 'c_ny_3',
      name: 'Bronx Fitness',
      email: 'bronx@example.com',
      status: 'active',
      region: 'US-NY',
      franchiseId: 'f_ny',
      enableLoyalty: false,
      registrationDate: '2024-01-01',
    },
  )

  return companies
}
export const MOCK_COMPANIES: Company[] = generateCompanies()

export const MOCK_ADS: Advertisement[] = [
  {
    id: 'ad1',
    title: 'Verão Burger King',
    companyId: 'c1',
    franchiseId: 'f1',
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
    description: 'Promoção regional de verão para Burger King.',
    price: 29.9,
    currency: 'BRL',
    advertiserId: 'adv1',
    durationDays: 30,
  },
  {
    id: 'ad2',
    title: 'Oferta do Dia: Smartwatch',
    companyId: 'c2',
    region: 'Global',
    category: 'Eletrônicos',
    billingType: 'cpc',
    placement: 'offer_of_the_day',
    status: 'active',
    views: 5000,
    clicks: 800,
    startDate: '2024-12-01',
    endDate: '2025-01-31',
    image: 'https://img.usecurling.com/p/800/400?q=smartwatch',
    link: 'https://electronics.com',
    price: 0.5,
    currency: 'BRL',
  },
  {
    id: 'ad3',
    title: 'NY Local Business Promo',
    companyId: 'c_ny_1',
    franchiseId: 'f_ny',
    description: 'Support your local NY businesses.',
    region: 'US-NY',
    category: 'Outros',
    billingType: 'fixed',
    placement: 'sidebar',
    status: 'active',
    views: 2000,
    clicks: 150,
    startDate: '2024-12-01',
    endDate: '2025-01-31',
    image: 'https://img.usecurling.com/p/800/400?q=new%20york',
    link: 'https://ny-local.com',
    price: 500,
    currency: 'USD',
  },
  {
    id: 'ad4',
    title: 'Liquidação de Inverno',
    companyId: 'c2',
    region: 'Global',
    category: 'all',
    billingType: 'fixed',
    placement: 'bottom',
    status: 'active',
    views: 8000,
    clicks: 950,
    startDate: '2024-12-01',
    endDate: '2025-12-31',
    image: 'https://img.usecurling.com/p/800/200?q=winter%20sale',
    link: 'https://example.com/winter-sale',
    price: 50,
    currency: 'BRL',
    description: 'Promoção exclusiva de inverno nas lojas parceiras.',
    durationDays: 30,
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
    subscriptionTier: 'free',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=44',
    country: 'USA',
    state: 'Florida',
    city: 'Miami',
    phone: '+1 305 555-9999',
    partnerId: 'user-dropship-123',
    preferences: {
      notifications: true,
      newsletter: true,
      emailAlerts: true,
      pushAlerts: true,
      categories: ['Alimentação', 'Moda'],
      dashboardWidgets: ['featured', 'categories', 'tracked', 'all'],
      travelMode: false,
    },
  },
  {
    id: 'u_fran_ny',
    name: 'NY Franchisee',
    email: 'ny@dealvoy.com',
    role: 'franchisee',
    region: 'US-NY',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=77',
    country: 'USA',
    state: 'New York',
    city: 'New York',
    phone: '+1 212 555-0199',
  },
  {
    id: 'u_shop_ny',
    name: 'Brooklyn Coffee Admin',
    email: 'ny_shop@dealvoy.com',
    role: 'shopkeeper',
    companyId: 'c_ny_1',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=10',
    country: 'USA',
    state: 'New York',
    city: 'Brooklyn',
    phone: '+1 718 555-0101',
  },
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: `u_ny_lead_${i}`,
    name: `NY Customer ${i + 1}`,
    email: `customer${i + 1}@ny.com`,
    role: 'user' as const,
    country: 'USA',
    state: 'New York',
    city: 'Brooklyn',
  })),
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
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: `f${i + 1}`,
    name: `Deal Voy Franchise ${i + 1}`,
    region: i % 2 === 0 ? 'BR-SP' : 'US-FL',
    ownerId: `u_fran_${i}`,
    status: 'active' as const,
    licenseExpiry: `2030-0${(i % 9) + 1}-01`,
  })),
  {
    id: 'f_ny',
    name: 'Deal Voy New York',
    region: 'US-NY',
    ownerId: 'u_fran_ny',
    status: 'active',
    licenseExpiry: '2030-01-01',
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
    hasSeparatedRooms: false,
    source: 'partner',
    translations: {
      en: {
        title: 'São Paulo -> Orlando',
        description: 'Direct round-trip flight. Includes luggage.',
        destination: 'Orlando, FL'
      },
      es: {
        title: 'São Paulo -> Orlando',
        description: 'Vuelo directo ida y vuelta. Incluye equipaje.',
        destination: 'Orlando, FL'
      }
    }
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
    source: 'partner',
    translations: {
      en: {
        title: 'Orlando Family Suite',
        description: 'Spacious suite with 2 separate bedrooms and living room.',
      },
      es: {
        title: 'Suite Familiar Orlando',
        description: 'Amplia suite con 2 dormitorios separados y sala de estar.',
      }
    }
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
    source: 'organic',
    translations: {
      en: {
        title: 'Standard Room',
        description: 'Standard room with 2 queen beds.',
      },
      pt: {
        title: 'Quarto Padrão',
      },
      es: {
        title: 'Habitación Estándar',
        description: 'Habitación estándar con 2 camas queen.',
      }
    }
  },
  {
    id: 'h3',
    type: 'hotel',
    provider: 'Luxury Stays',
    title: 'Executive Apartment',
    description: 'Apartamento executivo com quarto separado e área de trabalho.',
    price: 450,
    currency: 'USD',
    image: 'https://img.usecurling.com/p/300/200?q=luxury%20apartment',
    destination: 'Miami, FL',
    rating: 4.9,
    link: 'https://booking.com',
    region: 'US-FL',
    hasSeparatedRooms: true,
    source: 'partner',
    translations: {
      en: {
        title: 'Executive Apartment',
        description: 'Executive apartment with separate bedroom and workspace.',
      },
      pt: {
        title: 'Apartamento Executivo',
      },
      es: {
        title: 'Apartamento Ejecutivo',
        description: 'Apartamento ejecutivo con dormitorio separado y área de trabajo.',
      }
    }
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
    source: 'organic',
    translations: {
      en: {
        title: 'Double Room',
        description: 'Comfortable room in the city center.',
      },
      pt: {
        title: 'Quarto Duplo',
      },
      es: {
        title: 'Habitación Doble',
        description: 'Cómoda habitación en el centro de la ciudad.',
      }
    }
  },
  {
    id: 'a1',
    type: 'activity',
    provider: 'Universal Studios',
    title: 'Park Admission Ticket',
    description: '1-Day Park-to-Park ticket for an unforgettable adventure.',
    price: 150,
    currency: 'USD',
    image: 'https://img.usecurling.com/p/300/200?q=theme%20park',
    destination: 'Orlando, FL',
    rating: 4.9,
    link: 'https://universalorlando.com',
    region: 'US-FL',
    availability: 100,
    source: 'partner',
    translations: {
      pt: {
        title: 'Ingresso para o Parque',
        description: 'Ingresso de 1 dia Park-to-Park para uma aventura inesquecível.',
      },
      es: {
        title: 'Entrada al Parque',
        description: 'Boleto de 1 día Park-to-Park para una aventura inolvidable.',
      }
    }
  },
  {
    id: 'a2',
    type: 'activity',
    provider: 'MASP',
    title: 'Museum Ticket',
    description: 'General admission to the São Paulo Museum of Art.',
    price: 30,
    currency: 'BRL',
    image: 'https://img.usecurling.com/p/300/200?q=museum',
    destination: 'São Paulo, SP',
    rating: 4.8,
    link: 'https://masp.org.br',
    region: 'BR-SP',
    availability: 50,
    source: 'organic',
    translations: {
      pt: {
        title: 'Ingresso do Museu',
        description: 'Entrada geral para o Museu de Arte de São Paulo.',
      },
      es: {
        title: 'Entrada al Museo',
        description: 'Entrada general al Museo de Arte de São Paulo.',
      }
    }
  }
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

export const MOCK_VALIDATION_LOGS: ValidationLog[] = [
  ...Array.from({ length: 20 }).map((_, i) => ({
    id: `vl-${i}`,
    couponId: `cpn-${(i % 5) + 1}`,
    couponTitle: `Coupon Offer ${(i % 5) + 1}`,
    customerName: `Customer ${i}`,
    validatedAt: new Date(Date.now() - i * 3600000).toISOString(),
    method: i % 2 === 0 ? ('qr' as const) : ('manual' as const),
    shopkeeperId: 'u_shop',
    companyId: `c${(i % 5) + 1}`,
    franchiseId: (i % 5) + 1 > 5 ? 'f2' : 'f1',
    userId: i % 3 === 0 ? 'u_user' : 'u_agency',
    commissionAmount: 5.0,
    cashbackAmount: 2.0,
  })),
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `vl_ny_${i}`,
    couponId: `cpn_ny_m1`,
    couponTitle: 'Brooklyn Coffee Buy 1 Get 1',
    customerName: `NY Customer ${i + 1}`,
    validatedAt: new Date(Date.now() - i * 3600000 * 24).toISOString(),
    method: i % 2 === 0 ? ('qr' as const) : ('manual' as const),
    shopkeeperId: 'u_shop_ny',
    companyId: 'c_ny_1',
    franchiseId: 'f_ny',
    userId: `u_ny_lead_${i}`,
    commissionAmount: 2.5,
    cashbackAmount: 0.5,
  })),
]

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
  {
    id: 'ap1',
    placement: 'top',
    billingType: 'fixed',
    durationDays: 7,
    price: 150,
  },
  {
    id: 'ap2',
    placement: 'bottom',
    billingType: 'fixed',
    durationDays: 30,
    price: 400,
  },
  {
    id: 'ap3',
    placement: 'search',
    billingType: 'fixed',
    durationDays: 15,
    price: 200,
  },
  { id: 'ap4', placement: 'offer_of_the_day', billingType: 'cpc', price: 0.5 },
  { id: 'ap5', placement: 'top_ranking', billingType: 'cpa', price: 5.0 },
  {
    id: 'ap6',
    placement: 'sponsored_push',
    billingType: 'fixed',
    durationDays: 1,
    price: 500,
  },
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
    referenceNumber: 'INV-2024-AD1',
    adId: 'ad1',
    advertiserId: 'adv1',
    amount: 150,
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    status: 'paid',
  },
]

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

export const MOCK_PARTNER_POLICIES: PartnerPolicy[] = [
  {
    id: 'pol-1',
    companyId: 'c1',
    billingModel: 'CPA',
    commissionRate: 15,
    cashbackRate: 5,
    cpcValue: 0,
    fixedFee: 0,
    billingCycle: 'monthly',
    taxId: '11.222.333/0001-44',
    contractTerms: 'Standard 15% commission, 5% direct cashback to user.',
  },
]

const generatedSeasonalInvoices: PartnerInvoice[] = SEASONAL_EVENTS.filter(
  (e) => e.status === 'active' || e.status === 'expired',
).map((e) => ({
  id: `inv-se-${e.id}`,
  referenceNumber: `INV-SEAS-${e.id.toUpperCase()}`,
  companyId: e.companyId || 'c1',
  periodStart: e.startDate,
  periodEnd: e.endDate,
  totalSales: 0,
  totalCommission: e.price || e.billingAmount || 0,
  totalCashback: 0,
  status: e.status === 'expired' ? 'paid' : 'sent',
  dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
  issueDate: e.startDate,
  transactionCount: 1,
}))

export const MOCK_PARTNER_INVOICES: PartnerInvoice[] = [
  {
    id: 'pinv-1',
    referenceNumber: 'PINV-2024-C1-001',
    companyId: 'c1',
    periodStart: '2024-10-01T00:00:00.000Z',
    periodEnd: '2024-10-31T23:59:59.000Z',
    totalSales: 5000,
    totalCommission: 750,
    totalCashback: 250,
    status: 'paid',
    dueDate: '2024-11-15T00:00:00.000Z',
    issueDate: '2024-11-01T10:00:00.000Z',
    transactionCount: 45,
  },
  ...generatedSeasonalInvoices,
]

export const MOCK_WEBHOOK_LOGS: WebhookLog[] = [
  {
    id: 'wl-1',
    companyId: 'c1',
    endpoint: 'https://api.pos-system.com/webhooks/dealvoy',
    event: 'coupon.redeemed',
    payload: { couponId: 'cpn-1' },
    status: 200,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'wl-2',
    companyId: 'c1',
    endpoint: 'https://api.pos-system.com/webhooks/dealvoy',
    event: 'coupon.redeemed',
    payload: { couponId: 'cpn-2' },
    status: 500,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
]

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    couponId: 'h1',
    storeName: 'Family Resorts',
    date: '2025-05-10',
    time: '14:00',
    guests: 4,
    status: 'confirmed',
    userId: 'u_user',
    userName: 'End User',
    source: 'partner',
    requiresPrivacy: true,
    type: 'hotel',
    companyId: 'c_amazon',
    franchiseId: 'f1',
  },
  {
    id: 'b2',
    couponId: 'a2',
    storeName: 'MASP',
    date: '2025-06-15',
    time: '10:00',
    guests: 2,
    status: 'pending',
    userId: 'u_user',
    userName: 'End User',
    source: 'organic',
    type: 'ticket',
    companyId: 'c1',
    franchiseId: 'f1',
  },
  ...Array.from({ length: 5 }).map((_, i) => ({
    id: `b_ny_${i}`,
    couponId: `cpn_ny_m1`,
    storeName: 'Brooklyn Coffee',
    date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
    time: '09:00',
    guests: 1,
    status: 'confirmed' as const,
    userId: `u_ny_lead_${i}`,
    userName: `NY Customer ${i + 1}`,
    source: 'partner' as const,
    type: 'general' as const,
    companyId: 'c_ny_1',
    franchiseId: 'f_ny',
  })),
]

export const MOCK_FINANCIAL_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'ft-1',
    franchiseId: 'f_ny',
    type: 'receipt',
    amount: 1500,
    date: new Date().toISOString(),
    description: 'Ad Revenue - NY Local Promo',
    status: 'completed',
  },
  {
    id: 'ft-2',
    franchiseId: 'f_ny',
    type: 'payment',
    amount: 250,
    date: new Date(Date.now() - 86400000).toISOString(),
    description: 'Office Supplies',
    status: 'completed',
  },
  {
    id: 'ft-3',
    franchiseId: 'f_ny',
    type: 'royalty_payment',
    amount: 100,
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    description: 'Royalty Payment - Nov 2024',
    status: 'completed',
  },
  {
    id: 'ft-4',
    franchiseId: 'f1',
    type: 'receipt',
    amount: 3200,
    date: new Date().toISOString(),
    description: 'Local Merchants Monthly Fees',
    status: 'completed',
  },
]

