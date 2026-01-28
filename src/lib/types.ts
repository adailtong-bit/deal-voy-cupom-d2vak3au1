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
  companyId?: string // Link to Company for settings
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
    | 'Mercado'
    | 'Beleza'
  distance: number // in meters
  expiryDate: string
  startDate?: string
  endDate?: string
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
  status?: 'active' | 'expired' | 'issue' | 'validated'
  acceptsBooking?: boolean
  price?: number // For premium coupons/reservations
  isPaid?: boolean
  source?: 'partner' | 'aggregated'
  region?: string // 'Country-State' format e.g. 'BR-SP', 'US-FL'
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
  coordinates?: {
    lat: number
    lng: number
  }
  image?: string
  region?: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'deal' | 'alert' | 'system' | 'event' | 'gift' | 'mission'
  read: boolean
  date: string
  link?: string
  priority?: 'high' | 'medium' | 'low'
  category?: 'smart' | 'system' | 'gamification'
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

export interface Mission {
  id: string
  title: string
  description: string
  rewardPoints: number
  type: 'survey' | 'action'
  completed: boolean
  expiresAt?: string
}

export interface Badge {
  id: string
  name: string
  description: string
  image: string
  earnedDate?: string
}

export interface RewardActivity {
  id: string
  title: string
  points: number
  date: string
  type: 'earned' | 'redeemed' | 'imported'
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

export interface DayPlan {
  id: string
  dayNumber: number
  stops: Coupon[]
  date?: string
}

export interface Itinerary {
  id: string
  title: string
  description: string
  stops: Coupon[] // Keeps compatibility with old structure for now, represents "All stops"
  days?: DayPlan[] // New multi-day structure
  totalSavings: number
  duration: string
  image: string
  tags: string[]
  matchScore: number // 0-100
  isTemplate?: boolean
  region?: string
  agencyId?: string
}

export type UserRole =
  | 'super_admin'
  | 'franchisee'
  | 'shopkeeper'
  | 'agency'
  | 'user'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  birthday?: string // YYYY-MM-DD
  region?: string // Assigned region for Franchisee
  companyId?: string // Assigned company for Shopkeeper
  agencyId?: string // Assigned agency
  country?: string
  state?: string
  city?: string
  phone?: string
  preferences?: {
    notifications?: boolean
    newsletter?: boolean
    locationTracking?: boolean
  }
}

export interface Company {
  id: string
  name: string
  email: string
  status: 'active' | 'pending' | 'rejected'
  registrationDate: string
  region: string
  enableLoyalty: boolean // B2B Points Toggle
  ownerId?: string
}

export type AdBillingType = 'fixed' | 'ppc' | 'ticketing'

export interface Advertisement {
  id: string
  title: string
  companyId: string
  region: string
  category: string
  billingType: AdBillingType
  placement:
    | 'home_hero'
    | 'sidebar'
    | 'feed'
    | 'footer'
    | 'content'
    | 'top'
    | 'bottom'
  status: 'active' | 'paused' | 'ended'
  budget?: number
  costPerClick?: number
  views: number
  clicks: number
  startDate: string
  endDate: string
  image: string
  link: string
}

export interface RewardItem {
  id: string
  title: string
  description: string
  cost: number
  image: string
  category: 'coupon' | 'product' | 'experience'
  available: boolean
}

export interface PaymentTransaction {
  id: string
  date: string
  amount: number
  storeName: string
  couponTitle: string
  method: 'card' | 'fetch' | 'points' | 'wallet'
  status: 'completed' | 'pending' | 'failed'
  customerName?: string
  pointsAwarded?: number
  installments?: number
}

export interface ConnectedApp {
  id: string
  name: string
  connected: boolean
  points?: number
  lastSync?: string
  icon: string
  color: string
}

export interface Franchise {
  id: string
  name: string
  region: string // 'Country-State'
  ownerId: string
  status: 'active' | 'inactive'
  licenseExpiry: string
}

export type TravelOfferType = 'flight' | 'hotel' | 'package' | 'car_rental'

export interface TravelOffer {
  id: string
  type: TravelOfferType
  provider: string
  title: string
  description: string
  price: number
  currency: string
  image: string
  destination: string
  rating?: number
  link: string // External link
  region?: string
  agencyId?: string
  availability?: number
}

export interface Region {
  id: string
  name: string
  country: string
  code: string // e.g., US-FL, BR-SP
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'wallet'
  last4?: string
  brand?: string
  expiry?: string
  email?: string // For wallet
  isDefault: boolean
}

export interface ValidationLog {
  id: string
  couponId: string
  couponTitle: string
  customerName: string
  validatedAt: string
  method: 'qr' | 'manual'
  shopkeeperId: string
}

export interface CarRental {
  id: string
  model: string
  brand: string
  year: number
  plate: string
  category: 'Economy' | 'SUV' | 'Luxury' | 'Convertible'
  pricePerDay: number
  status: 'available' | 'rented' | 'maintenance'
  location: string
  image: string
  agencyId: string
}
