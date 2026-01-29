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

export interface ReviewReply {
  id: string
  userId: string
  userName: string
  text: string
  date: string
  role: 'vendor' | 'admin'
}

export interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  date: string
  status?: 'pending' | 'approved' | 'rejected'
  images?: string[]
  replies?: ReviewReply[]
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

export interface BehavioralTrigger {
  id: string
  type: 'visit' | 'share'
  threshold: number // e.g., 5 visits
  reward: string // e.g., "20% OFF"
  isActive: boolean
}

export interface Coupon {
  id: string
  storeName: string
  companyId?: string
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
  distance: number
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
  status?: 'active' | 'expired' | 'issue' | 'used'
  acceptsBooking?: boolean
  price?: number
  isPaid?: boolean
  source?: 'partner' | 'aggregated'
  region?: string
  behavioralTriggers?: BehavioralTrigger[]
  visitCount?: number // Tracked locally for user context or mocked
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
  type: 'deal' | 'alert' | 'system' | 'event' | 'gift' | 'mission' | 'chat'
  read: boolean
  date: string
  link?: string
  priority?: 'high' | 'medium' | 'low'
  category?: 'smart' | 'system' | 'gamification' | 'communication'
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
  status: 'confirmed' | 'cancelled' | 'paid' | 'pending'
  price?: number
  userId?: string
  userName?: string
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
  stops: Coupon[]
  days?: DayPlan[]
  totalSavings: number
  duration: string
  image: string
  tags: string[]
  matchScore: number
  isTemplate?: boolean
  region?: string
  agencyId?: string
  isPublic?: boolean
  status?: 'draft' | 'pending' | 'approved' | 'rejected'
  authorId?: string
  authorName?: string
}

export type UserRole =
  | 'super_admin'
  | 'franchisee'
  | 'shopkeeper'
  | 'agency'
  | 'user'

export interface UserPreferences {
  notifications?: boolean
  newsletter?: boolean
  locationTracking?: boolean
  categories?: string[]
  quietHoursStart?: string
  quietHoursEnd?: string
  emailAlerts?: boolean
  pushAlerts?: boolean
  dashboardWidgets?: string[]
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  birthday?: string
  region?: string
  companyId?: string
  agencyId?: string
  country?: string
  state?: string
  city?: string
  phone?: string
  preferences?: UserPreferences
}

export interface Company {
  id: string
  name: string
  email: string
  status: 'active' | 'pending' | 'rejected'
  registrationDate: string
  region: string
  enableLoyalty: boolean
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
  couponId?: string
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
  region: string
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
  link: string
  region?: string
  agencyId?: string
  availability?: number
}

export interface Region {
  id: string
  name: string
  country: string
  code: string
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'wallet'
  last4?: string
  brand?: string
  expiry?: string
  email?: string
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

export interface SystemLog {
  id: string
  date: string
  action: string
  details: string
  user: string
  status: 'success' | 'warning' | 'error'
}

export interface ClientHistory {
  id: string
  clientName: string
  action: string
  date: string
  amount: number
  status: 'completed' | 'pending'
}

export interface Message {
  id: string
  senderId: string
  text: string
  timestamp: string
  isRead: boolean
}

export interface ChatThread {
  id: string
  participants: { id: string; name: string; avatar: string; role: UserRole }[]
  messages: Message[]
  lastMessage: string
  lastUpdated: string
  unreadCount: number
}
