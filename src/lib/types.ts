export interface MenuItem {
  name: string
  description: string
  price: number
  translations?: {
    [key: string]: {
      name: string
      description: string
    }
  }
}

export interface Coupon {
  id: string
  storeName: string
  title: string
  description: string
  discount: string
  category:
    | 'Alimentação'
    | 'Moda'
    | 'Serviços'
    | 'Eletrônicos'
    | 'Lazer'
    | 'Outros'
  distance: number // in meters
  expiryDate: string
  image: string
  logo?: string
  code: string
  isFeatured?: boolean
  isTrending?: boolean
  isSpecial?: boolean // For hidden/local specials like Happy Hour
  terms?: string
  coordinates: {
    lat: number
    lng: number
  }
  // Inventory management
  totalAvailable?: number
  maxPerUser?: number
  reservedCount?: number
  // Menu for restaurants
  menu?: MenuItem[]
}

export type CategoryType = Coupon['category']

export interface UserLocation {
  lat: number
  lng: number
  address?: string
}

export interface SeasonalEvent {
  id: string
  title: string
  date: Date
  description: string
  type: 'sale' | 'holiday' | 'event'
}
