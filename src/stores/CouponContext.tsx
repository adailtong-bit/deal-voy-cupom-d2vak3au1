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
} from '@/lib/data'
import { toast } from 'sonner'
import { useNotification } from './NotificationContext'

// Extend Mock Users to include state
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
  coupons: Coupon[]
  companies: Company[]
  ads: Advertisement[]
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
  setRegion: (regionCode: string) => void
  toggleSave: (id: string) => void
  toggleTrip: (id: string) => void
  reserveCoupon: (id: string) => boolean
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
  deleteAd: (id: string) => void
  updateCampaign: (id: string, data: Partial<Coupon>) => void
  connectFetch: () => void
  importFetchPoints: (amount: number) => void
  claimBirthdayGift: () => void
  updateUserProfile: (data: Partial<User>) => void
  updateUserPreferences: (prefs: UserPreferences) => void
  connectApp: (id: string) => void
  saveItinerary: (itinerary: Itinerary) => void
  updateItinerary: (itinerary: Itinerary) => void
  deleteItinerary: (id: string) => void
  publishItinerary: (id: string) => void
  moderateItinerary: (id: string, status: 'approved' | 'rejected') => void
  toggleLoyaltySystem: (companyId: string, enabled: boolean) => void
  addFranchise: (franchise: Franchise) => void
  validateCoupon: (code: string) => { success: boolean; message: string }
  addCarRental: (car: CarRental) => void
  trackVisit: (couponId: string) => void
  trackShare: (type: 'route' | 'coupon', id: string) => void
  updateBehavioralTriggers: (
    couponId: string,
    triggers: BehavioralTrigger[],
  ) => void
}

const CouponContext = createContext<CouponContextType | undefined>(undefined)

export function CouponProvider({ children }: { children: React.ReactNode }) {
  const { addNotification } = useNotification()
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS)
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES)
  const [ads, setAds] = useState<Advertisement[]>(MOCK_ADS)
  const [user, setUser] = useState<User | null>(MOCK_USERS[5]) // Default user
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [reservedIds, setReservedIds] = useState<string[]>([])
  const [tripIds, setTripIds] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [uploads, setUploads] = useState<UploadedDocument[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
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
  const [rewards] = useState<RewardItem[]>(MOCK_REWARDS)
  const [isFetchConnected, setIsFetchConnected] = useState(false)
  const [birthdayGiftAvailable, setBirthdayGiftAvailable] = useState(false)
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>([])
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  // New State for Multi-tenant/Travel
  const [franchises, setFranchises] = useState<Franchise[]>(MOCK_FRANCHISES)
  const [travelOffers, setTravelOffers] =
    useState<TravelOffer[]>(MOCK_TRAVEL_OFFERS)
  const [selectedRegion, setSelectedRegion] = useState<string>('Global')
  const [validationLogs, setValidationLogs] =
    useState<ValidationLog[]>(MOCK_VALIDATION_LOGS)
  const [carRentals, setCarRentals] = useState<CarRental[]>(MOCK_CAR_RENTALS)
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(MOCK_SYSTEM_LOGS)

  const [rewardHistory, setRewardHistory] = useState<RewardActivity[]>([])

  useEffect(() => {
    // Initial Load Logic
    const storedSaved = localStorage.getItem('savedCoupons')
    if (storedSaved) setSavedIds(JSON.parse(storedSaved))
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) setUser(JSON.parse(storedUser))

    setTimeout(() => {
      setUserLocation(MOCK_USER_LOCATION)
      setIsLoadingLocation(false)
    }, 1500)
  }, [])

  // Log action helper
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

  // Filter content based on selectedRegion
  const filteredCoupons =
    selectedRegion === 'Global'
      ? coupons
      : coupons.filter(
          (c) => !c.region || c.region === selectedRegion || c.region === '',
        )

  const filteredAds =
    selectedRegion === 'Global'
      ? ads
      : ads.filter(
          (a) => !a.region || a.region === selectedRegion || a.region === '',
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
    setReservedIds((prev) => [...prev, id])
    logSystemAction('Reserve Coupon', `Reserved coupon ${id}`)
    // Increment visit count on reservation for demo purposes
    trackVisit(id)
    return true
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
          // Check for triggers
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

    // Simulate finding a relevant coupon to trigger share reward
    const relevantCoupon = coupons[0]
    if (relevantCoupon && relevantCoupon.behavioralTriggers) {
      // Mock share trigger logic
    }
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
    setPoints((prev) => prev + 50) // Points for booking
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
    // Award points for purchase (1pt per $1)
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
    // Try to find an existing mock user first
    const existingUser = MOCK_USERS.find((u) => u.email === email)
    if (existingUser) {
      setUser(existingUser)
      if (existingUser.region) setSelectedRegion(existingUser.region)
      toast.success(`Bem-vindo, ${existingUser.name}!`)
      logSystemAction('User Login', `User ${existingUser.email} logged in`)
    } else {
      // Fallback or generic logic
      const newUser: User = {
        id: Math.random().toString(),
        name: email.split('@')[0],
        email,
        role: role || 'user',
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
  const deleteAd = (id: string) =>
    setAds((prev) => prev.filter((a) => a.id !== id))
  const updateCampaign = (id: string, data: any) => {
    /* ... */
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

  const updateUserPreferences = (prefs: UserPreferences) => {
    if (!user) return
    const updatedUser = {
      ...user,
      preferences: { ...user.preferences, ...prefs },
    }
    setUser(updatedUser)
    logSystemAction('Preferences Updated', 'User updated notification settings')
    toast.success('Preferências salvas!')
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

  const addFranchise = (franchise: Franchise) => {
    setFranchises((prev) => [...prev, franchise])
    logSystemAction('Franchise Added', `Franchise ${franchise.name} created`)
    toast.success('Franquia criada com sucesso!')
  }

  const validateCoupon = (code: string) => {
    const coupon = coupons.find((c) => c.code === code)

    if (!coupon) {
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

    // Update coupon status to used
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, status: 'used' } : c)),
    )

    const log: ValidationLog = {
      id: Math.random().toString(),
      couponId: coupon.id,
      couponTitle: coupon.title,
      customerName: 'Customer Walk-in',
      validatedAt: new Date().toISOString(),
      method: 'qr',
      shopkeeperId: user?.id || 'unknown',
    }
    setValidationLogs((prev) => [log, ...prev])
    logSystemAction('Coupon Validated', `Coupon ${coupon.id} validated via QR`)

    // Award points for using coupon
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

    // Trigger behavioral logic for visit
    trackVisit(coupon.id)
    return { success: true, message: 'Validated successfully' }
  }

  const addCarRental = (car: CarRental) => {
    setCarRentals((prev) => [car, ...prev])
    toast.success('Car added successfully')
  }

  const isSaved = (id: string) => savedIds.includes(id)
  const isReserved = (id: string) => reservedIds.includes(id)
  const isInTrip = (id: string) => tripIds.includes(id)

  return React.createElement(
    CouponContext.Provider,
    {
      value: {
        coupons: filteredCoupons,
        companies,
        ads: filteredAds,
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
        setRegion,
        toggleSave,
        toggleTrip,
        reserveCoupon,
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
        deleteAd,
        updateCampaign,
        connectFetch,
        importFetchPoints,
        claimBirthdayGift,
        updateUserProfile,
        updateUserPreferences,
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
