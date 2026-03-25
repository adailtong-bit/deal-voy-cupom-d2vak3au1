import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  Coupon,
  UserLocation,
  Review,
  UploadedDocument,
  Booking,
  Challenge,
  Badge,
  ABTest,
  Itinerary,
  Company,
  Advertisement,
  User,
  RewardActivity,
  RewardItem,
  PaymentTransaction,
  ConnectedApp,
  Mission,
  Franchise,
  TravelOffer,
  Region,
  ValidationLog,
  CarRental,
  SystemLog,
  UserPreferences,
  ReviewReply,
  BehavioralTrigger,
  CrawlerSource,
  DiscoveredPromotion,
  AdPricing,
  Advertiser,
  AdInvoice,
  PlatformSettings,
  SubscriptionTier,
  PartnerPolicy,
  PartnerInvoice,
  SeasonalEvent,
} from '@/lib/types'
import {
  MOCK_COUPONS,
  MOCK_USER_LOCATION,
  MOCK_CHALLENGES,
  MOCK_BADGES,
  MOCK_AB_TESTS,
  MOCK_ITINERARIES,
  MOCK_COMPANIES,
  MOCK_ADS,
  MOCK_USERS as ORIGINAL_MOCK_USERS,
  MOCK_REWARDS,
  MOCK_FRANCHISES,
  MOCK_TRAVEL_OFFERS,
  MOCK_VALIDATION_LOGS,
  MOCK_CAR_RENTALS,
  REGIONS,
  MOCK_SYSTEM_LOGS,
  MOCK_CRAWLER_SOURCES,
  MOCK_DISCOVERED_PROMOTIONS,
  MOCK_AD_PRICING,
  MOCK_ADVERTISERS,
  MOCK_AD_INVOICES,
  DEFAULT_PLATFORM_SETTINGS,
  MOCK_PARTNER_POLICIES,
  MOCK_PARTNER_INVOICES,
  SEASONAL_EVENTS,
} from '@/lib/data'
import { toast } from 'sonner'
import { useNotification } from './NotificationContext'
import { useLanguage } from './LanguageContext'

const MOCK_USERS: User[] = ORIGINAL_MOCK_USERS.map((u) => ({
  ...u,
  state:
    u.country === 'Brasil'
      ? 'São Paulo'
      : u.country === 'USA'
        ? 'Florida'
        : undefined,
}))

interface CouponContextType {
  allCoupons: Coupon[]
  coupons: Coupon[]
  companies: Company[]
  ads: Advertisement[]
  users: User[]
  user: User | null
  savedIds: string[]
  reservedIds: string[]
  tripIds: string[]
  userLocation: UserLocation | null
  uploads: UploadedDocument[]
  bookings: Booking[]
  points: number
  rewardHistory: RewardActivity[]
  fetchCredits: number
  challenges: Challenge[]
  missions: Mission[]
  badges: Badge[]
  abTests: ABTest[]
  downloadedIds: string[]
  itineraries: Itinerary[]
  activeItineraryId: string | null
  setActiveItineraryId: (id: string | null) => void
  rewards: RewardItem[]
  isFetchConnected: boolean
  birthdayGiftAvailable: boolean
  transactions: PaymentTransaction[]
  connectedApps: ConnectedApp[]
  isDownloading: boolean
  downloadProgress: number
  franchises: Franchise[]
  travelOffers: TravelOffer[]
  selectedRegion: string
  regions: Region[]
  validationLogs: ValidationLog[]
  carRentals: CarRental[]
  systemLogs: SystemLog[]
  crawlerSources: CrawlerSource[]
  discoveredPromotions: DiscoveredPromotion[]
  adPricing: AdPricing[]
  advertisers: Advertiser[]
  adInvoices: AdInvoice[]
  platformSettings: PlatformSettings
  partnerPolicies: PartnerPolicy[]
  partnerInvoices: PartnerInvoice[]
  seasonalEvents: SeasonalEvent[]
  usedVouchers: string[]
  setRegion: (regionCode: string) => void
  toggleSave: (id: string) => void
  toggleTrip: (id: string) => void
  reserveCoupon: (id: string) => boolean
  cancelReservation: (id: string) => void
  addCoupon: (coupon: Coupon) => void
  isSaved: (id: string) => boolean
  isReserved: (id: string) => boolean
  isInTrip: (id: string) => boolean
  isLoadingLocation: boolean
  addReview: (couponId: string, review: Omit<Review, 'id' | 'date'>) => void
  replyToReview: (couponId: string, reviewId: string, text: string) => void
  addUpload: (doc: UploadedDocument) => void
  refreshCoupons: () => void
  voteCoupon: (id: string, type: 'up' | 'down') => void
  reportCoupon: (id: string, issue: string) => void
  makeBooking: (booking: Omit<Booking, 'id' | 'status'>) => void
  updateBooking: (id: string, data: Partial<Booking>) => void
  cancelBooking: (id: string) => void
  redeemPoints: (amount: number, type: 'points' | 'fetch') => boolean
  earnPoints: (amount: number, title: string) => void
  addABTest: (test: ABTest) => void
  downloadOffline: (ids: string[]) => void
  processPayment: (details: {
    couponId?: string
    amount: number
    method?: 'card' | 'fetch' | 'wallet'
    installments?: number
  }) => Promise<boolean>
  isDownloaded: (id: string) => boolean
  joinChallenge: (id: string) => void
  completeMission: (id: string) => void
  login: (email: string, role?: User['role']) => void
  logout: () => void
  approveCompany: (id: string) => void
  rejectCompany: (id: string) => void
  createAd: (ad: Advertisement) => void
  updateAd: (id: string, data: Partial<Advertisement>) => void
  deleteAd: (id: string) => void
  updateCampaign: (id: string, data: Partial<Coupon>) => void
  connectFetch: () => void
  importFetchPoints: (amount: number) => void
  claimBirthdayGift: () => void
  updateUserProfile: (data: Partial<User>) => void
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void
  upgradeSubscription: (tier: SubscriptionTier) => void
  connectApp: (id: string) => void
  saveItinerary: (itinerary: Itinerary) => void
  updateItinerary: (itinerary: Itinerary) => void
  deleteItinerary: (id: string) => void
  publishItinerary: (id: string) => void
  moderateItinerary: (id: string, status: 'approved' | 'rejected') => void
  toggleLoyaltySystem: (companyId: string, enabled: boolean) => void
  validateCoupon: (
    code: string,
    customerEmail?: string,
  ) => { success: boolean; message: string }
  addCarRental: (car: CarRental) => void
  trackVisit: (couponId: string) => void
  trackShare: (type: 'route' | 'coupon', id: string) => void
  updateBehavioralTriggers: (
    couponId: string,
    triggers: BehavioralTrigger[],
  ) => void
  togglePreferredCustomer: (companyId: string, userId: string) => void
  addCrawlerSource: (source: CrawlerSource) => void
  updateCrawlerSource: (id: string, data: Partial<CrawlerSource>) => void
  deleteCrawlerSource: (id: string) => void
  importPromotion: (id: string, customCategory?: string) => void
  ignorePromotion: (id: string) => void
  triggerScan: (sourceId: string) => void
  addAdPricing: (pricing: AdPricing) => void
  addAdvertiser: (advertiser: Advertiser) => void
  createAdCampaign: (ad: Advertisement, invoice: AdInvoice) => void
  updateInvoiceStatus: (id: string, status: AdInvoice['status']) => void
  updatePlatformSettings: (settings: Partial<PlatformSettings>) => void
  updatePartnerPolicy: (policy: PartnerPolicy) => void
  deletePartnerPolicy: (id: string) => void
  generatePartnerInvoice: (
    companyId: string,
    startDate: string,
    endDate: string,
  ) => void
  updatePartnerInvoiceStatus: (
    id: string,
    status: PartnerInvoice['status'],
  ) => void
  reconcilePartnerInvoice: (refNumber: string) => boolean
  addSeasonalEvent: (event: SeasonalEvent) => void
  updateSeasonalEvent: (id: string, event: Partial<SeasonalEvent>) => void
  deleteSeasonalEvent: (id: string) => void
  trackSeasonalClick: (id: string) => void
  approveSeasonalCampaign: (id: string) => void
  rejectSeasonalCampaign: (id: string) => void
  renewSeasonalCampaign: (id: string) => void

  // Hierarchy Management
  addUser: (user: User) => void
  updateUser: (id: string, data: Partial<User>) => void
  deleteUser: (id: string) => void
  addCompany: (company: Company) => void
  updateCompany: (id: string, data: Partial<Company>) => void
  deleteCompany: (id: string) => void
  addFranchise: (franchise: Franchise) => void
  updateFranchise: (id: string, data: Partial<Franchise>) => void
  deleteFranchise: (id: string) => void
}

const CouponContext = createContext<CouponContextType | undefined>(undefined)

export function CouponProvider({ children }: { children: React.ReactNode }) {
  const { addNotification } = useNotification()
  const { t } = useLanguage()
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS)
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES)
  const [ads, setAds] = useState<Advertisement[]>(MOCK_ADS)
  const [users, setUsers] = useState<User[]>(MOCK_USERS)

  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      try {
        return JSON.parse(storedUser)
      } catch {
        // ignore parsing error
      }
    }
    const defaultDevUser =
      MOCK_USERS.find((u) => u.role === 'super_admin') || MOCK_USERS[0]
    return defaultDevUser
  })

  const [savedIds, setSavedIds] = useState<string[]>([])
  const [reservedIds, setReservedIds] = useState<string[]>([])
  const [tripIds, setTripIds] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [uploads, setUploads] = useState<UploadedDocument[]>([])
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'b1',
      couponId: 'h1',
      storeName: 'Family Resorts',
      date: '2025-05-10',
      endDate: '2025-05-15',
      time: '14:00',
      guests: 4,
      adults: 2,
      childrenCount: 2,
      childAges: [5, 8],
      status: 'confirmed',
      userId: 'u_user',
      userName: 'End User',
      source: 'partner',
      requiresPrivacy: true,
      type: 'hotel',
    },
    {
      id: 'b2',
      couponId: 'a2',
      storeName: 'MASP',
      date: '2025-06-15',
      time: '10:00',
      guests: 2,
      adults: 2,
      childrenCount: 0,
      childAges: [],
      status: 'pending',
      userId: 'u_user',
      userName: 'End User',
      source: 'organic',
      type: 'ticket',
    },
  ])
  const [points, setPoints] = useState(1250)
  const [fetchCredits, setFetchCredits] = useState(50.0)
  const [challenges, setChallenges] = useState<Challenge[]>(MOCK_CHALLENGES)
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: 'm1',
      title: 'Avalie sua visita ao Burger King',
      description: 'Conta pra gente como foi sua experiência e ganhe pontos.',
      rewardPoints: 100,
      type: 'survey',
      completed: false,
    },
  ])
  const [badges] = useState<Badge[]>(MOCK_BADGES)
  const [abTests, setAbTests] = useState<ABTest[]>(MOCK_AB_TESTS)
  const [downloadedIds, setDownloadedIds] = useState<string[]>([])
  const [itineraries, setItineraries] = useState<Itinerary[]>(MOCK_ITINERARIES)
  const [activeItineraryId, setActiveItineraryId] = useState<string | null>(
    null,
  )
  const [rewards] = useState<RewardItem[]>(MOCK_REWARDS)
  const [isFetchConnected, setIsFetchConnected] = useState(false)
  const [birthdayGiftAvailable, setBirthdayGiftAvailable] = useState(false)
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>([])
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const [franchises, setFranchises] = useState<Franchise[]>(MOCK_FRANCHISES)
  const [travelOffers, setTravelOffers] =
    useState<TravelOffer[]>(MOCK_TRAVEL_OFFERS)
  const [selectedRegion, setSelectedRegion] = useState<string>('Global')
  const [validationLogs, setValidationLogs] =
    useState<ValidationLog[]>(MOCK_VALIDATION_LOGS)
  const [carRentals, setCarRentals] = useState<CarRental[]>(MOCK_CAR_RENTALS)
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(MOCK_SYSTEM_LOGS)

  const [rewardHistory, setRewardHistory] = useState<RewardActivity[]>([])

  const [crawlerSources, setCrawlerSources] =
    useState<CrawlerSource[]>(MOCK_CRAWLER_SOURCES)
  const [discoveredPromotions, setDiscoveredPromotions] = useState<
    DiscoveredPromotion[]
  >(MOCK_DISCOVERED_PROMOTIONS)

  const [adPricing, setAdPricing] = useState<AdPricing[]>(MOCK_AD_PRICING)
  const [advertisers, setAdvertisers] = useState<Advertiser[]>(MOCK_ADVERTISERS)
  const [adInvoices, setAdInvoices] = useState<AdInvoice[]>(MOCK_AD_INVOICES)

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(
    DEFAULT_PLATFORM_SETTINGS,
  )
  const [partnerPolicies, setPartnerPolicies] = useState<PartnerPolicy[]>(
    MOCK_PARTNER_POLICIES,
  )
  const [partnerInvoices, setPartnerInvoices] = useState<PartnerInvoice[]>(
    MOCK_PARTNER_INVOICES,
  )

  const [seasonalEvents, setSeasonalEvents] =
    useState<SeasonalEvent[]>(SEASONAL_EVENTS)

  const [usedVouchers, setUsedVouchers] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('currentUser')
    }
  }, [user])

  useEffect(() => {
    const storedSaved = localStorage.getItem('savedCoupons')
    if (storedSaved) {
      try {
        setSavedIds(JSON.parse(storedSaved))
      } catch {
        // ignore
      }
    }
    const storedActiveItinerary = localStorage.getItem('activeItineraryId')
    if (storedActiveItinerary) setActiveItineraryId(storedActiveItinerary)

    setTimeout(() => {
      setUserLocation(MOCK_USER_LOCATION)
      setIsLoadingLocation(false)
    }, 1500)

    // Notify about expiring campaigns
    const expiring = SEASONAL_EVENTS.filter((e) => {
      if (e.status !== 'active') return false
      const days =
        (new Date(e.endDate).getTime() - Date.now()) / (1000 * 3600 * 24)
      return days >= 0 && days <= 7
    })
    if (expiring.length > 0) {
      setTimeout(() => {
        addNotification({
          title: 'Campanhas Expirando',
          message: `${expiring.length} campanha(s) requer(em) atenção para renovação.`,
          type: 'alert',
          priority: 'high',
          category: 'system',
        })
      }, 2000)
    }
  }, [])

  useEffect(() => {
    if (activeItineraryId) {
      localStorage.setItem('activeItineraryId', activeItineraryId)
    } else {
      localStorage.removeItem('activeItineraryId')
    }
  }, [activeItineraryId])

  const logSystemAction = (
    action: string,
    details: string,
    status: 'success' | 'warning' | 'error' = 'success',
  ) => {
    const log: SystemLog = {
      id: Math.random().toString(),
      date: new Date().toISOString(),
      action,
      details,
      user: user?.id || 'unknown',
      status,
    }
    setSystemLogs((prev) => [log, ...prev])
  }

  const allAudienceCoupons = coupons.filter((c) => {
    let audienceMatch = true
    if (c.targetAudience === 'preferred') {
      const company = companies.find((comp) => comp.id === c.companyId)
      const isMerchant =
        user?.role === 'super_admin' ||
        user?.role === 'shopkeeper' ||
        user?.companyId === c.companyId
      const isPreferred = company?.preferredCustomers?.includes(user?.id || '')
      audienceMatch = isMerchant || !!isPreferred
    }
    return audienceMatch
  })

  const filteredCoupons = allAudienceCoupons.filter((c) => {
    const regionMatch =
      selectedRegion === 'Global' ||
      !c.region ||
      c.region === selectedRegion ||
      c.region === ''
    return regionMatch
  })

  const filteredAds =
    selectedRegion === 'Global'
      ? ads
      : ads.filter(
          (a) =>
            !a.region ||
            a.region === selectedRegion ||
            a.region === '' ||
            a.region === 'Global',
        )

  const filteredItineraries =
    selectedRegion === 'Global'
      ? itineraries
      : itineraries.filter(
          (i) => !i.region || i.region === selectedRegion || i.region === '',
        )

  const filteredTravelOffers =
    selectedRegion === 'Global'
      ? travelOffers
      : travelOffers.filter(
          (t) => !t.region || t.region === selectedRegion || t.region === '',
        )

  const setRegion = (regionCode: string) => {
    setSelectedRegion(regionCode)
    toast.info(`Região alterada para: ${regionCode}`)
  }

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const newSaved = prev.includes(id)
        ? prev.filter((sid) => sid !== id)
        : [...prev, id]
      localStorage.setItem('savedCoupons', JSON.stringify(newSaved))
      return newSaved
    })
  }

  const toggleTrip = (id: string) => {
    setTripIds((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id],
    )
  }

  const reserveCoupon = (id: string) => {
    const coupon = coupons.find((c) => c.id === id)
    const event = seasonalEvents.find((e) => e.id === id)

    let available = 0
    if (coupon)
      available =
        coupon.totalAvailable !== undefined ? coupon.totalAvailable : 100
    if (event)
      available =
        event.totalAvailable !== undefined ? event.totalAvailable : 100

    if (available <= 0) {
      toast.error('Este voucher está esgotado.')
      return false
    }

    setReservedIds((prev) => [...prev, id])

    if (coupon) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                totalAvailable: Math.max(0, (c.totalAvailable ?? 100) - 1),
                reservedCount: (c.reservedCount || 0) + 1,
              }
            : c,
        ),
      )
    } else if (event) {
      setSeasonalEvents((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                totalAvailable: Math.max(0, (e.totalAvailable ?? 100) - 1),
              }
            : e,
        ),
      )
    }

    logSystemAction('Reserve Coupon', `Reserved coupon ${id}`)
    trackVisit(id)
    return true
  }

  const cancelReservation = (id: string) => {
    setReservedIds((prev) => prev.filter((rid) => rid !== id))

    const coupon = coupons.find((c) => c.id === id)
    const event = seasonalEvents.find((e) => e.id === id)

    if (coupon) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                totalAvailable: (c.totalAvailable ?? 100) + 1,
                reservedCount: Math.max(0, (c.reservedCount || 1) - 1),
              }
            : c,
        ),
      )
    } else if (event) {
      setSeasonalEvents((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, totalAvailable: (e.totalAvailable ?? 100) + 1 }
            : e,
        ),
      )
    }

    logSystemAction('Cancel Reservation', `Cancelled reservation for ${id}`)
    toast.success(
      'Reserva cancelada. O voucher voltou para a disponibilidade geral.',
    )
  }

  const addCoupon = (coupon: Coupon) => setCoupons((prev) => [coupon, ...prev])

  const addReview = (
    id: string,
    review: Omit<Review, 'id' | 'date'> & { images?: string[] },
  ) => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newReview: Review = {
            ...review,
            id: Math.random().toString(),
            date: new Date().toISOString(),
            status: 'pending',
            replies: [],
          }
          return { ...c, reviews: [...(c.reviews || []), newReview] }
        }
        return c
      }),
    )
    earnPoints(100, 'Review Submission')
  }

  const replyToReview = (couponId: string, reviewId: string, text: string) => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === couponId && c.reviews) {
          return {
            ...c,
            reviews: c.reviews.map((r) => {
              if (r.id === reviewId) {
                const newReply: ReviewReply = {
                  id: Math.random().toString(),
                  userId: user?.id || 'admin',
                  userName: user?.name || 'Vendor',
                  text,
                  date: new Date().toISOString(),
                  role: 'vendor',
                }
                return { ...r, replies: [...(r.replies || []), newReply] }
              }
              return r
            }),
          }
        }
        return c
      }),
    )
    toast.success('Reply submitted!')
  }

  const trackVisit = (couponId: string) => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === couponId) {
          const newCount = (c.visitCount || 0) + 1
          if (c.behavioralTriggers) {
            c.behavioralTriggers.forEach((trigger) => {
              if (
                trigger.isActive &&
                trigger.type === 'visit' &&
                newCount % trigger.threshold === 0
              ) {
                toast.success(`Promo Unlocked! Reward: ${trigger.reward}`)
                addNotification({
                  title: 'Promo Unlocked!',
                  message: `You earned ${trigger.reward} at ${c.storeName}!`,
                  type: 'deal',
                  category: 'smart',
                })
              }
            })
          }
          return { ...c, visitCount: newCount }
        }
        return c
      }),
    )
  }

  const trackShare = (type: 'route' | 'coupon', id: string) => {
    earnPoints(20, 'Sharing')
    toast.success('Shared successfully! Earned 20 points.')
  }

  const updateBehavioralTriggers = (
    couponId: string,
    triggers: BehavioralTrigger[],
  ) => {
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === couponId ? { ...c, behavioralTriggers: triggers } : c,
      ),
    )
    toast.success('Triggers updated')
  }

  const togglePreferredCustomer = (companyId: string, userId: string) => {
    setCompanies((prev) =>
      prev.map((c) => {
        if (c.id === companyId) {
          const preferred = c.preferredCustomers || []
          const isPref = preferred.includes(userId)
          return {
            ...c,
            preferredCustomers: isPref
              ? preferred.filter((id) => id !== userId)
              : [...preferred, userId],
          }
        }
        return c
      }),
    )
  }

  const addUpload = (doc: any) => {
    /* ... */
  }
  const refreshCoupons = () => {
    /* ... */
  }
  const voteCoupon = (id: string, type: any) => {
    /* ... */
  }
  const reportCoupon = (id: string, issue: string) => {
    /* ... */
  }
  const makeBooking = (booking: Omit<Booking, 'id' | 'status'>) => {
    const newBooking: Booking = {
      ...booking,
      id: Math.random().toString(),
      status: 'pending',
      userId: user?.id,
      userName: user?.name,
    }
    setBookings((prev) => [newBooking, ...prev])
    setPoints((prev) => prev + 50)
    logSystemAction('New Booking', `Booking created for ${booking.storeName}`)
    setRewardHistory((prev) => [
      {
        id: Math.random().toString(),
        title: 'Reserva Realizada',
        points: 50,
        date: new Date().toISOString(),
        type: 'earned',
      },
      ...prev,
    ])
  }

  const updateBooking = (id: string, data: Partial<Booking>) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...data } : b)),
    )
    toast.success(
      t('travel.booking_updated', 'Reserva atualizada com sucesso!'),
    )
    logSystemAction('Booking Updated', `Booking ${id} updated`)
  }

  const cancelBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)),
    )
    toast.success(
      t('travel.booking_cancelled', 'Reserva cancelada com sucesso.'),
    )
    logSystemAction('Booking Cancelled', `Booking ${id} cancelled`)
  }

  const earnPoints = (amount: number, title: string) => {
    setPoints((p) => p + amount)
    setRewardHistory((prev) => [
      {
        id: Math.random().toString(),
        title: title,
        points: amount,
        date: new Date().toISOString(),
        type: 'earned',
      },
      ...prev,
    ])
    toast.success(`You earned ${amount} points!`)
  }

  const redeemPoints = (amount: number, type: any) => {
    if (type === 'points') {
      if (points < amount) return false
      setPoints((p) => p - amount)
      setRewardHistory((prev) => [
        {
          id: Math.random().toString(),
          title: 'Resgate de Pontos',
          points: amount,
          date: new Date().toISOString(),
          type: 'redeemed',
        },
        ...prev,
      ])
      logSystemAction('Points Redeemed', `Redeemed ${amount} points`)
      return true
    }
    return true
  }

  const addABTest = (test: ABTest) => setAbTests((prev) => [test, ...prev])
  const downloadOffline = (ids: string[]) => {
    setIsDownloading(true)
    setDownloadProgress(0)
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setDownloadProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setDownloadedIds((prev) => [...new Set([...prev, ...ids])])
        setIsDownloading(false)
        toast.success('Download complete')
      }
    }, 200)
  }
  const processPayment = async (d: any) => {
    const transaction: PaymentTransaction = {
      id: Math.random().toString(),
      date: new Date().toISOString(),
      amount: d.amount,
      storeName: 'Deal Voy Platform',
      couponTitle: 'Purchase',
      method: d.method || 'card',
      status: 'completed',
      customerName: user?.name,
      installments: d.installments,
      couponId: d.couponId,
    }
    setTransactions((prev) => [transaction, ...prev])
    const pointsEarned = Math.floor(d.amount)
    setPoints((prev) => prev + pointsEarned)
    setRewardHistory((prev) => [
      {
        id: Math.random().toString(),
        title: 'Compra Realizada',
        points: pointsEarned,
        date: new Date().toISOString(),
        type: 'earned',
      },
      ...prev,
    ])
    logSystemAction(
      'Payment Processed',
      `Amount: ${d.amount}, Method: ${d.method}`,
    )
    return Promise.resolve(true)
  }
  const isDownloaded = (id: string) => downloadedIds.includes(id)
  const joinChallenge = (id: string) => {
    /* ... */
  }
  const completeMission = (id: string) => {
    /* ... */
  }

  const login = (email: string, role?: User['role']) => {
    const existingUser = users.find((u) => u.email === email)
    if (existingUser) {
      setUser(existingUser)
      if (existingUser.region) setSelectedRegion(existingUser.region)
      toast.success(`Bem-vindo, ${existingUser.name}!`)
      logSystemAction('User Login', `User ${existingUser.email} logged in`)
    } else {
      const newUser: User = {
        id: Math.random().toString(),
        name: email.split('@')[0],
        email,
        role: role || 'user',
        subscriptionTier: 'free',
        avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male',
      }
      setUser(newUser)
      toast.success('Login realizado com sucesso!')
      logSystemAction('User Login', `New user ${email} logged in`)
    }
  }

  const logout = () => {
    logSystemAction('User Logout', `User ${user?.email} logged out`)
    setUser(null)
  }

  const approveCompany = (id: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'active' } : c)),
    )
    logSystemAction('Company Approved', `Company ${id} approved`)
  }
  const rejectCompany = (id: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'rejected' } : c)),
    )
    logSystemAction('Company Rejected', `Company ${id} rejected`)
  }

  const createAd = (ad: Advertisement) => setAds((prev) => [ad, ...prev])

  const updateAd = (id: string, data: Partial<Advertisement>) => {
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)))
    logSystemAction('Ad Updated', `Updated advertisement ${id}`)
    toast.success('Anúncio atualizado com sucesso')
  }

  const deleteAd = (id: string) => {
    setAds((prev) => prev.filter((a) => a.id !== id))
    logSystemAction('Ad Deleted', `Deleted advertisement ${id}`)
    toast.success('Anúncio removido')
  }

  const updateCampaign = (id: string, data: Partial<Coupon>) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
    toast.success('Campanha atualizada com sucesso')
    logSystemAction('Campaign Updated', `Campaign ${id} updated`)
  }

  const connectFetch = () => {
    /* ... */
  }
  const importFetchPoints = (a: number) => {
    /* ... */
  }
  const claimBirthdayGift = () => {
    /* ... */
  }

  const updateUserProfile = (data: Partial<User>) => {
    if (!user) return
    const updatedUser = { ...user, ...data }
    setUser(updatedUser)
    logSystemAction('Profile Updated', 'User updated profile details')
    toast.success('Perfil atualizado!')
  }

  const updateUserPreferences = (prefs: Partial<UserPreferences>) => {
    if (!user) return
    const updatedUser = {
      ...user,
      preferences: { ...user.preferences, ...prefs },
    }
    setUser(updatedUser)
    logSystemAction('Preferences Updated', 'User updated notification settings')
    toast.success('Preferências salvas!')
  }

  const upgradeSubscription = (tier: SubscriptionTier) => {
    if (!user) return
    setUser({ ...user, subscriptionTier: tier })
    logSystemAction('Subscription Upgrade', `User upgraded to ${tier}`)
    toast.success(`Parabéns! Você agora é ${tier.toUpperCase()}`)
  }

  const connectApp = (id: string) => {
    /* ... */
  }

  const saveItinerary = (it: Itinerary) => {
    const newItinerary = {
      ...it,
      status: 'draft' as const,
      authorId: user?.id,
      authorName: user?.name,
    }
    setItineraries((prev) => [newItinerary, ...prev])
    logSystemAction('Itinerary Saved', `Itinerary ${it.title} saved`)
    toast.success('Itinerary Saved')
  }

  const updateItinerary = (itinerary: Itinerary) => {
    setItineraries((prev) =>
      prev.map((it) => (it.id === itinerary.id ? itinerary : it)),
    )
    logSystemAction('Itinerary Updated', `Itinerary ${itinerary.title} updated`)
    toast.success('Itinerary Updated')
  }

  const deleteItinerary = (id: string) => {
    setItineraries((prev) => prev.filter((it) => it.id !== id))
    logSystemAction('Itinerary Deleted', `Itinerary ${id} deleted`)
    toast.success('Itinerary Deleted')
  }

  const publishItinerary = (id: string) => {
    setItineraries((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, status: 'pending', isPublic: true } : it,
      ),
    )
    logSystemAction('Itinerary Published', `Itinerary ${id} sent for approval`)
    toast.success('Roteiro enviado para moderação!')
  }

  const moderateItinerary = (id: string, status: 'approved' | 'rejected') => {
    setItineraries((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status } : it)),
    )
    logSystemAction('Moderation Action', `Itinerary ${id} ${status}`)
    toast.success(`Roteiro ${status === 'approved' ? 'aprovado' : 'rejeitado'}`)
  }

  const toggleLoyaltySystem = (companyId: string, enabled: boolean) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId ? { ...c, enableLoyalty: enabled } : c,
      ),
    )
    toast.success(
      enabled
        ? 'Sistema de Pontos Ativado.'
        : 'Sistema de Pontos Desativado para economizar custos.',
    )
  }

  const validateCoupon = (code: string, customerEmail?: string) => {
    const coupon = coupons.find((c) => c.code === code)

    if (!coupon) {
      const eventWithVoucher = seasonalEvents.find((e) =>
        e.vouchers?.includes(code),
      )

      if (eventWithVoucher) {
        if (usedVouchers.includes(code)) {
          logSystemAction(
            'Validation Failed',
            `Attempted to use redeemed voucher ${code}`,
            'warning',
          )
          return { success: false, message: 'Already used' }
        }

        setUsedVouchers((prev) => [...prev, code])

        const log: ValidationLog = {
          id: Math.random().toString(),
          couponId: eventWithVoucher.id,
          couponTitle: eventWithVoucher.title,
          customerName: customerEmail || 'Customer Walk-in',
          validatedAt: new Date().toISOString(),
          method: 'qr',
          shopkeeperId: user?.id || 'unknown',
          companyId: eventWithVoucher.companyId,
          userId: customerEmail
            ? users.find((u) => u.email === customerEmail)?.id
            : 'u_user',
          commissionAmount: eventWithVoucher.price || 0,
          cashbackAmount: 0,
        }

        setValidationLogs((prev) => [log, ...prev])
        logSystemAction(
          'Voucher Validated',
          `Seasonal Voucher ${code} validated via QR`,
        )

        setPoints((prev) => prev + 20)
        setRewardHistory((prev) => [
          {
            id: Math.random().toString(),
            title: 'Voucher Utilizado',
            points: 20,
            date: new Date().toISOString(),
            type: 'earned',
          },
          ...prev,
        ])

        return {
          success: true,
          message: 'Validated successfully!',
        }
      }

      return { success: false, message: 'Invalid code' }
    }

    if (coupon.status === 'used') {
      logSystemAction(
        'Validation Failed',
        `Attempted to use redeemed coupon ${coupon.id}`,
        'warning',
      )
      return { success: false, message: 'Already used' }
    }

    if (coupon.status === 'expired') {
      return { success: false, message: 'Coupon expired' }
    }

    const customer = users.find((u) => u.email === customerEmail)
    const customerId = customer?.id || (customerEmail ? 'walk-in' : 'u_user')

    if (coupon.maxPerUser) {
      const userRedemptions = validationLogs.filter(
        (log) => log.couponId === coupon.id && log.userId === customerId,
      ).length
      if (userRedemptions >= coupon.maxPerUser) {
        return {
          success: false,
          message: `Limit reached. Customer has used this coupon ${userRedemptions} times.`,
        }
      }
    }

    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, status: 'used' } : c)),
    )

    const estValue = coupon.price || 50
    const companyPolicy = partnerPolicies.find(
      (p) => p.companyId === coupon.companyId,
    )

    let commission = (estValue * platformSettings.commissionRate) / 100
    let cashback =
      (estValue *
        ((platformSettings.commissionRate *
          platformSettings.cashbackSplitUser) /
          100)) /
      100

    if (companyPolicy) {
      if (companyPolicy.billingModel === 'CPA') {
        commission = (estValue * companyPolicy.commissionRate) / 100
        cashback = (estValue * companyPolicy.cashbackRate) / 100
      } else if (companyPolicy.billingModel === 'CPC') {
        commission = companyPolicy.cpcValue
        cashback = (estValue * companyPolicy.cashbackRate) / 100
      } else if (companyPolicy.billingModel === 'monthly') {
        commission = 0
        cashback = (estValue * companyPolicy.cashbackRate) / 100
      } else if (companyPolicy.billingModel === 'global') {
        commission = (estValue * companyPolicy.commissionRate) / 100
        cashback = (estValue * companyPolicy.cashbackRate) / 100
      }
    }

    const log: ValidationLog = {
      id: Math.random().toString(),
      couponId: coupon.id,
      couponTitle: coupon.title,
      customerName: customer?.name || customerEmail || 'Customer Walk-in',
      validatedAt: new Date().toISOString(),
      method: 'qr',
      shopkeeperId: user?.id || 'unknown',
      companyId: coupon.companyId,
      userId: customerId,
      commissionAmount: commission,
      cashbackAmount: cashback,
    }
    setValidationLogs((prev) => [log, ...prev])
    logSystemAction('Coupon Validated', `Coupon ${coupon.id} validated via QR`)

    setPoints((prev) => prev + 20)
    setRewardHistory((prev) => [
      {
        id: Math.random().toString(),
        title: 'Cupom Utilizado',
        points: 20,
        date: new Date().toISOString(),
        type: 'earned',
      },
      ...prev,
    ])

    trackVisit(coupon.id)
    return {
      success: true,
      message: `Validated successfully! Cashback calculated: ${cashback.toFixed(2)}`,
    }
  }

  const addCarRental = (car: CarRental) => {
    setCarRentals((prev) => [car, ...prev])
    toast.success('Car added successfully')
  }

  const isSaved = (id: string) => savedIds.includes(id)
  const isReserved = (id: string) => reservedIds.includes(id)
  const isInTrip = (id: string) => tripIds.includes(id)

  const addCrawlerSource = (source: CrawlerSource) => {
    setCrawlerSources((prev) => [...prev, source])
    logSystemAction('Crawler Source Added', `Added source ${source.name}`)
    toast.success('Source added successfully')
  }

  const updateCrawlerSource = (id: string, data: Partial<CrawlerSource>) => {
    setCrawlerSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s)),
    )
    logSystemAction('Crawler Source Updated', `Updated source ${id}`)
    toast.success('Source updated successfully')
  }

  const deleteCrawlerSource = (id: string) => {
    setCrawlerSources((prev) => prev.filter((s) => s.id !== id))
    logSystemAction('Crawler Source Deleted', `Deleted source ${id}`)
    toast.success('Source deleted successfully')
  }

  const importPromotion = (id: string, customCategory?: string) => {
    const promo = discoveredPromotions.find((p) => p.id === id)
    if (!promo) return

    setDiscoveredPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'imported' } : p)),
    )

    const newCoupon: Coupon = {
      id: Math.random().toString(),
      storeName: promo.storeName,
      title: promo.title,
      description: promo.description,
      discount: promo.discount,
      category: (customCategory || promo.category || 'Outros') as any,
      distance: 50,
      expiryDate: promo.expiryDate,
      image: promo.image,
      code: `IMPORT-${Math.floor(Math.random() * 10000)}`,
      coordinates: { lat: -23.55052, lng: -46.633308 },
      status: 'active',
      source: 'aggregated',
      region: promo.region,
      price: promo.price,
      currency: promo.currency,
      companyId: companies[0]?.id,
    }
    addCoupon(newCoupon)
    logSystemAction('Promotion Imported', `Imported ${promo.title}`)
    toast.success('Promotion imported successfully')
  }

  const ignorePromotion = (id: string) => {
    setDiscoveredPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'ignored' } : p)),
    )
    logSystemAction('Promotion Ignored', `Ignored discovered promo ${id}`)
    toast.info('Promotion ignored')
  }

  const triggerScan = (sourceId: string) => {
    toast.info('Scanning source... Please wait.')
    setCrawlerSources((prev) =>
      prev.map((s) =>
        s.id === sourceId ? { ...s, lastStatus: 'scanning' as any } : s,
      ),
    )

    setTimeout(() => {
      const source = crawlerSources.find((s) => s.id === sourceId)
      if (!source) return

      let newStatus: 'success' | 'error' | 'warning' = 'success'
      let newMsg = ''
      let newPromos: DiscoveredPromotion[] = []

      const url = source.url.toLowerCase()

      if (url.includes('groupon')) {
        newPromos = [
          {
            id: `dp-grp-${Math.random()}`,
            sourceId: source.id,
            title: 'Groupon Exclusive Deal',
            discount: '60% OFF',
            description: 'Imported special deal from Groupon.',
            expiryDate: '2025-12-31',
            image: 'https://img.usecurling.com/p/300/200?q=deal',
            storeName: 'Groupon Partner',
            status: 'pending',
            region: source.region,
            category: 'Outros',
            capturedAt: new Date().toISOString(),
            rawData: {
              html_title: 'Groupon Exclusive Deal - 60% Off!',
              original_price: '$100.00',
              discount_price: '$40.00',
              merchant: 'Groupon Partner LLC',
              scraped_url: url,
            },
          },
          {
            id: `dp-grp-${Math.random()}`,
            sourceId: source.id,
            title: 'Spa Day Package',
            discount: '40% OFF',
            description: 'Relaxing spa day for two.',
            expiryDate: '2025-10-15',
            image: 'https://img.usecurling.com/p/300/200?q=spa',
            storeName: 'Groupon Partner',
            status: 'pending',
            region: source.region,
            category: 'Beleza',
            capturedAt: new Date().toISOString(),
            rawData: {
              html_title: 'Spa Day Package for Two',
              original_price: '$200.00',
              discount_price: '$120.00',
              merchant: 'Groupon Partner LLC',
              scraped_url: url,
              extracted_images: 3,
            },
          },
        ]
        newMsg = `Success! ${newPromos.length} new promotions extracted from Groupon (${source.region}).`
      } else if (url.includes('timeout') || url.includes('error')) {
        newStatus = 'error'
        newMsg =
          'Connection timeout. Access denied by source or invalid structure.'
      } else {
        newStatus = 'warning'
        newMsg = `No promotions found in the selected region (${source.region}).`
      }

      setCrawlerSources((prev) =>
        prev.map((s) =>
          s.id === sourceId
            ? {
                ...s,
                lastScan: new Date().toISOString(),
                lastStatus: newStatus,
                lastErrorMessage: newMsg,
              }
            : s,
        ),
      )

      if (newPromos.length > 0) {
        setDiscoveredPromotions((prev) => [...newPromos, ...prev])
        toast.success(newMsg)
        logSystemAction('Crawler Success', newMsg)
      } else if (newStatus === 'error') {
        toast.error(newMsg)
        logSystemAction('Crawler Error', newMsg, 'error')
      } else {
        toast.warning(newMsg)
        logSystemAction('Crawler Warning', newMsg, 'warning')
      }
    }, 2500)
  }

  const addAdPricing = (pricing: AdPricing) => {
    setAdPricing((prev) => [...prev, pricing])
    toast.success('Regra de preço adicionada')
  }

  const addAdvertiser = (advertiser: Advertiser) => {
    setAdvertisers((prev) => [...prev, advertiser])
    toast.success('Anunciante cadastrado')
  }

  const createAdCampaign = (ad: Advertisement, invoice: AdInvoice) => {
    setAds((prev) => [ad, ...prev])
    setAdInvoices((prev) => [invoice, ...prev])
    toast.success('Campanha e cobrança geradas com sucesso')
  }

  const updateInvoiceStatus = (id: string, status: AdInvoice['status']) => {
    setAdInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          const updates: Partial<AdInvoice> = { status }
          if (status === 'sent') updates.sentAt = new Date().toISOString()
          return { ...inv, ...updates }
        }
        return inv
      }),
    )
    toast.success(`Fatura atualizada para o status: ${status}`)
  }

  const updatePlatformSettings = (settings: Partial<PlatformSettings>) => {
    setPlatformSettings((prev) => ({ ...prev, ...settings }))
    toast.success('Platform settings updated successfully')
    logSystemAction(
      'Platform Settings Updated',
      'Admin updated platform monetization settings',
    )
  }

  const updatePartnerPolicy = (policy: PartnerPolicy) => {
    setPartnerPolicies((prev) => {
      const exists = prev.find((p) => p.companyId === policy.companyId)
      if (exists) {
        return prev.map((p) => (p.companyId === policy.companyId ? policy : p))
      }
      return [...prev, policy]
    })
    toast.success('Partner policy saved successfully')
    logSystemAction(
      'Partner Policy Updated',
      `Updated policy for company ${policy.companyId}`,
    )
  }

  const deletePartnerPolicy = (id: string) => {
    setPartnerPolicies((prev) => prev.filter((p) => p.id !== id))
    toast.success('Partner policy deleted')
    logSystemAction('Partner Policy Deleted', `Deleted policy ${id}`)
  }

  const generatePartnerInvoice = (
    companyId: string,
    startDate: string,
    endDate: string,
  ) => {
    const logs = validationLogs.filter(
      (l) =>
        l.companyId === companyId &&
        new Date(l.validatedAt) >= new Date(startDate) &&
        new Date(l.validatedAt) <= new Date(endDate),
    )

    const policy = partnerPolicies.find((p) => p.companyId === companyId)

    const totalSales = logs.reduce(
      (sum, l) => sum + (coupons.find((c) => c.id === l.couponId)?.price || 50),
      0,
    )
    let totalCommission = logs.reduce(
      (sum, l) => sum + (l.commissionAmount || 0),
      0,
    )
    const totalCashback = logs.reduce(
      (sum, l) => sum + (l.cashbackAmount || 0),
      0,
    )

    if (policy?.billingModel === 'monthly') {
      totalCommission += policy.fixedFee
    }

    if (logs.length === 0 && totalCommission === 0) {
      toast.warning(
        'No transactions or fees found in this period for this partner.',
      )
      return
    }

    const invoice: PartnerInvoice = {
      id: Math.random().toString(),
      referenceNumber: `INV-${Date.now().toString().slice(-6)}`,
      companyId,
      periodStart: startDate,
      periodEnd: endDate,
      totalSales,
      totalCommission,
      totalCashback,
      status: 'draft',
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
      issueDate: new Date().toISOString(),
      transactionCount: logs.length,
    }

    setPartnerInvoices((prev) => [invoice, ...prev])
    toast.success('Invoice generated successfully')
    logSystemAction(
      'Invoice Generated',
      `Invoice ${invoice.referenceNumber} generated for ${companyId}`,
    )
  }

  const updatePartnerInvoiceStatus = (
    id: string,
    status: PartnerInvoice['status'],
  ) => {
    setPartnerInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status } : inv)),
    )
    toast.success(`Invoice status updated to ${status}`)
  }

  const reconcilePartnerInvoice = (refNumber: string) => {
    const invoice = partnerInvoices.find((i) => i.referenceNumber === refNumber)
    if (!invoice) {
      toast.error('Invoice not found')
      return false
    }
    if (invoice.status === 'paid') {
      toast.info('Invoice is already paid')
      return false
    }

    setPartnerInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoice.id ? { ...inv, status: 'paid' } : inv,
      ),
    )
    toast.success(`Payment confirmed for invoice ${refNumber}`)
    logSystemAction(
      'Payment Reconciled',
      `Invoice ${refNumber} manually marked as paid`,
    )
    return true
  }

  const addSeasonalEvent = (event: SeasonalEvent) => {
    const newEvent = {
      ...event,
      status: event.status || 'pending',
      clickCount: 0,
    }
    setSeasonalEvents((prev) => [...prev, newEvent])
    toast.success(t('common.success'))
    logSystemAction('Seasonal Event Added', `Added event ${event.title}`)
  }

  const updateSeasonalEvent = (id: string, event: Partial<SeasonalEvent>) => {
    setSeasonalEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...event } : e)),
    )
    toast.success(t('common.success'))
    logSystemAction('Seasonal Event Updated', `Updated event ${id}`)
  }

  const deleteSeasonalEvent = (id: string) => {
    setSeasonalEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'archived' } : e)),
    )
    toast.success(t('common.success'))
    logSystemAction('Seasonal Event Deleted/Archived', `Archived event ${id}`)
  }

  const trackSeasonalClick = (id: string) => {
    setSeasonalEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, clickCount: (e.clickCount || 0) + 1 } : e,
      ),
    )
  }

  const approveSeasonalCampaign = (id: string) => {
    const event = seasonalEvents.find((e) => e.id === id)
    if (!event) return

    const newVouchers = Array.from({ length: 15 }).map(
      () => `VCH-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    )

    setSeasonalEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: 'active', vouchers: newVouchers } : e,
      ),
    )

    if (event.companyId && event.price && event.price > 0) {
      const invoice: PartnerInvoice = {
        id: Math.random().toString(),
        referenceNumber: `INV-SEAS-${Date.now().toString().slice(-6)}`,
        companyId: event.companyId,
        periodStart: event.startDate,
        periodEnd: event.endDate,
        totalSales: 0,
        totalCommission: event.price,
        totalCashback: 0,
        status: 'draft',
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
        issueDate: new Date().toISOString(),
        transactionCount: 1,
      }
      setPartnerInvoices((prev) => [...prev, invoice])
    }

    addNotification({
      title: t('seasonal.campaign_approved'),
      message: t('seasonal.campaign_approved_desc'),
      type: 'system',
      priority: 'high',
      category: 'system',
    })

    toast.success(t('admin.vouchersGenerated', 'Vouchers gerados com sucesso.'))
    logSystemAction('Seasonal Event Approved', `Approved event ${id}`)
  }

  const rejectSeasonalCampaign = (id: string) => {
    setSeasonalEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'rejected' } : e)),
    )
    toast.success(t('common.success'))
    logSystemAction('Seasonal Event Rejected', `Rejected event ${id}`)
  }

  const renewSeasonalCampaign = (id: string) => {
    const event = seasonalEvents.find((e) => e.id === id)
    if (!event) return

    const oldEnd = new Date(event.endDate)
    const newStart = new Date(oldEnd)
    newStart.setDate(newStart.getDate() + 1)
    const newEnd = new Date(newStart)
    newEnd.setDate(newEnd.getDate() + 30)

    const newEvent: SeasonalEvent = {
      ...event,
      id: Math.random().toString(),
      title: `${event.title} (Renewed)`,
      startDate: newStart.toISOString(),
      endDate: newEnd.toISOString(),
      status: 'draft',
      clickCount: 0,
      vouchers: [],
    }

    setSeasonalEvents((prev) => [newEvent, ...prev])
    toast.success(
      t('admin.renewSuccess', 'Campanha renovada com sucesso como rascunho.'),
    )
    logSystemAction('Seasonal Event Renewed', `Renewed event ${id}`)
  }

  const addUser = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev])
    toast.success('User saved successfully')
    logSystemAction('User Added', `Added user ${newUser.email}`)
  }

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)))
    toast.success('User updated successfully')
    logSystemAction('User Updated', `Updated user ${id}`)
  }

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
    toast.success('User deleted')
    logSystemAction('User Deleted', `Deleted user ${id}`)
  }

  const addCompany = (company: Company) => {
    setCompanies((prev) => [company, ...prev])
    toast.success('Merchant saved successfully')
    logSystemAction('Merchant Added', `Added company ${company.name}`)
  }

  const updateCompany = (id: string, data: Partial<Company>) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
    )
    toast.success('Merchant updated successfully')
    logSystemAction('Merchant Updated', `Updated company ${id}`)
  }

  const deleteCompany = (id: string) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id))
    toast.success('Merchant deleted')
    logSystemAction('Merchant Deleted', `Deleted company ${id}`)
  }

  const addFranchise = (franchise: Franchise) => {
    setFranchises((prev) => [franchise, ...prev])
    toast.success('Franchise saved successfully')
    logSystemAction('Franchise Added', `Added franchise ${franchise.name}`)
  }

  const updateFranchise = (id: string, data: Partial<Franchise>) => {
    setFranchises((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...data } : f)),
    )
    toast.success('Franchise updated successfully')
    logSystemAction('Franchise Updated', `Updated franchise ${id}`)
  }

  const deleteFranchise = (id: string) => {
    setFranchises((prev) => prev.filter((f) => f.id !== id))
    toast.success('Franchise deleted')
    logSystemAction('Franchise Deleted', `Deleted franchise ${id}`)
  }

  return React.createElement(
    CouponContext.Provider,
    {
      value: {
        allCoupons: allAudienceCoupons,
        coupons: filteredCoupons,
        companies,
        ads: filteredAds,
        users,
        user,
        savedIds,
        reservedIds,
        tripIds,
        userLocation,
        uploads,
        bookings,
        points,
        rewardHistory,
        fetchCredits,
        challenges,
        missions,
        badges,
        abTests,
        downloadedIds,
        itineraries: filteredItineraries,
        activeItineraryId,
        setActiveItineraryId,
        rewards,
        isFetchConnected,
        birthdayGiftAvailable,
        transactions,
        connectedApps,
        isDownloading,
        downloadProgress,
        franchises,
        travelOffers: filteredTravelOffers,
        selectedRegion,
        regions: REGIONS,
        validationLogs,
        carRentals,
        systemLogs,
        crawlerSources,
        discoveredPromotions,
        adPricing,
        advertisers,
        adInvoices,
        platformSettings,
        partnerPolicies,
        partnerInvoices,
        seasonalEvents,
        usedVouchers,
        setRegion,
        toggleSave,
        toggleTrip,
        reserveCoupon,
        cancelReservation,
        addCoupon,
        isSaved,
        isReserved,
        isInTrip,
        isLoadingLocation,
        addReview,
        replyToReview,
        addUpload,
        refreshCoupons,
        voteCoupon,
        reportCoupon,
        makeBooking,
        updateBooking,
        cancelBooking,
        redeemPoints,
        earnPoints,
        addABTest,
        downloadOffline,
        processPayment,
        isDownloaded,
        joinChallenge,
        completeMission,
        login,
        logout,
        approveCompany,
        rejectCompany,
        createAd,
        updateAd,
        deleteAd,
        updateCampaign,
        connectFetch,
        importFetchPoints,
        claimBirthdayGift,
        updateUserProfile,
        updateUserPreferences,
        upgradeSubscription,
        connectApp,
        saveItinerary,
        updateItinerary,
        deleteItinerary,
        publishItinerary,
        moderateItinerary,
        toggleLoyaltySystem,
        addFranchise,
        validateCoupon,
        addCarRental,
        trackVisit,
        trackShare,
        updateBehavioralTriggers,
        togglePreferredCustomer,
        addCrawlerSource,
        updateCrawlerSource,
        deleteCrawlerSource,
        importPromotion,
        ignorePromotion,
        triggerScan,
        addAdPricing,
        addAdvertiser,
        createAdCampaign,
        updateInvoiceStatus,
        updatePlatformSettings,
        updatePartnerPolicy,
        deletePartnerPolicy,
        generatePartnerInvoice,
        updatePartnerInvoiceStatus,
        reconcilePartnerInvoice,
        addSeasonalEvent,
        updateSeasonalEvent,
        deleteSeasonalEvent,
        trackSeasonalClick,
        approveSeasonalCampaign,
        rejectSeasonalCampaign,
        renewSeasonalCampaign,
        addUser,
        updateUser,
        deleteUser,
        addCompany,
        updateCompany,
        deleteCompany,
        updateFranchise,
        deleteFranchise,
      },
    },
    children,
  )
}

export function useCouponStore() {
  const context = useContext(CouponContext)
  if (context === undefined)
    throw new Error('useCouponStore must be used within a CouponProvider')
  return context
}
