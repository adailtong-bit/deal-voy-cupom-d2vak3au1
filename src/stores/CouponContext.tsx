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
  addUpload: (doc: UploadedDocument) => void
  refreshCoupons: () => void
  voteCoupon: (id: string, type: 'up' | 'down') => void
  reportCoupon: (id: string, issue: string) => void
  makeBooking: (booking: Omit<Booking, 'id' | 'status'>) => void
  redeemPoints: (amount: number, type: 'points' | 'fetch') => boolean
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
  connectApp: (id: string) => void
  saveItinerary: (itinerary: Itinerary) => void
  toggleLoyaltySystem: (companyId: string, enabled: boolean) => void
  addFranchise: (franchise: Franchise) => void
  validateCoupon: (code: string) => boolean
  addCarRental: (car: CarRental) => void
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

  const [rewardHistory, setRewardHistory] = useState<RewardActivity[]>([])

  useEffect(() => {
    // Initial Load Logic
    const storedSaved = localStorage.getItem('savedCoupons')
    if (storedSaved) setSavedIds(JSON.parse(storedSaved))
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) setUser(JSON.parse(storedUser))
    // ... other initial loads

    setTimeout(() => {
      setUserLocation(MOCK_USER_LOCATION)
      setIsLoadingLocation(false)
    }, 1500)
  }, [])

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
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    )
  }

  const toggleTrip = (id: string) => {
    setTripIds((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id],
    )
  }

  const reserveCoupon = (id: string) => {
    setReservedIds((prev) => [...prev, id])
    return true
  }

  const addCoupon = (coupon: Coupon) => setCoupons((prev) => [coupon, ...prev])

  const addReview = (id: string, review: any) => {
    /* ... */
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
  const makeBooking = (booking: any) => {
    /* ... */
  }
  const redeemPoints = (amount: number, type: any) => {
    if (type === 'points') {
      if (points < amount) return false
      setPoints((p) => p - amount)
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
  const processPayment = async (d: any) => Promise.resolve(true)
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
    }
  }

  const logout = () => setUser(null)
  const approveCompany = (id: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'active' } : c)),
    )
  }
  const rejectCompany = (id: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'rejected' } : c)),
    )
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
    // Update MOCK_USERS or persist to backend in real app
    toast.success('Perfil atualizado!')
  }

  const connectApp = (id: string) => {
    /* ... */
  }
  const saveItinerary = (it: Itinerary) => {
    setItineraries((prev) => [it, ...prev])
    toast.success('Itinerary Saved')
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
    toast.success('Franquia criada com sucesso!')
  }

  const validateCoupon = (code: string) => {
    const coupon = coupons.find((c) => c.code === code)
    if (coupon && coupon.status !== 'validated') {
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
      return true
    }
    return false
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
        addUpload,
        refreshCoupons,
        voteCoupon,
        reportCoupon,
        makeBooking,
        redeemPoints,
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
        connectApp,
        saveItinerary,
        toggleLoyaltySystem,
        addFranchise,
        validateCoupon,
        addCarRental,
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
