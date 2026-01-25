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

export interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  date: string
}

export type Mood =
  | 'Romantic'
  | 'Economic'
  | 'Quick Bite'
  | 'Adventure'
  | 'Relaxing'
  | 'Family'

export interface LoyaltyProgram {
  totalStamps: number
  currentStamps: number
  reward: string
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
  isSpecial?: boolean
  terms?: string
  coordinates: {
    lat: number
    lng: number
  }
  totalAvailable?: number
  maxPerUser?: number
  reservedCount?: number
  menu?: MenuItem[]
  reviews?: Review[]
  averageRating?: number
  moods?: Mood[]
  loyaltyProgram?: LoyaltyProgram
  lastVerified?: string
  upvotes?: number
  downvotes?: number
  status?: 'active' | 'expired' | 'issue'
  acceptsBooking?: boolean
  price?: number // For premium coupons/reservations
  isPaid?: boolean
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

export interface Notification {
  id: string
  title: string
  message: string
  type: 'deal' | 'alert' | 'system'
  read: boolean
  date: string
  link?: string
  priority?: 'high' | 'medium' | 'low'
  category?: 'smart' | 'system'
}

export interface UploadedDocument {
  id: string
  date: string
  status: 'Pending' | 'Verified' | 'Rejected'
  type: 'Receipt' | 'Coupon'
  storeName: string
  image: string
}

export interface Booking {
  id: string
  couponId: string
  storeName: string
  date: string
  time: string
  guests: number
  status: 'confirmed' | 'cancelled' | 'paid'
  price?: number
}

export interface Challenge {
  id: string
  title: string
  description: string
  total: number
  current: number
  reward: string
  icon: string
  completed: boolean
  status: 'active' | 'completed' | 'available'
  type?: 'travel' | 'social' | 'collection'
}

export interface Badge {
  id: string
  name: string
  description: string
  image: string
  earnedDate?: string
}

export interface ABVariant {
  id: string
  name: string
  title: string
  discount: string
  image: string
  views: number
  clicks: number
  redemptions: number
}

export interface ABTest {
  id: string
  couponId: string
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'draft'
  variantA: ABVariant
  variantB: ABVariant
}

export interface Itinerary {
  id: string
  title: string
  description: string
  stops: Coupon[]
  totalSavings: number
  duration: string
  image: string
  tags: string[]
  matchScore: number // 0-100
}
