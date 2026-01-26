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
  MOCK_USERS,
} from '@/lib/data'
import { toast } from 'sonner'

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
  badges: Badge[]
  abTests: ABTest[]
  downloadedIds: string[]
  itineraries: Itinerary[]
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
  }) => Promise<boolean>
  isDownloaded: (id: string) => boolean
  joinChallenge: (id: string) => void
  login: (email: string, role: User['role']) => void
  logout: () => void
  approveCompany: (id: string) => void
  rejectCompany: (id: string) => void
  createAd: (ad: Advertisement) => void
  deleteAd: (id: string) => void
  updateCampaign: (id: string, data: Partial<Coupon>) => void
}

const CouponContext = createContext<CouponContextType | undefined>(undefined)

export function CouponProvider({ children }: { children: React.ReactNode }) {
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS)
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES)
  const [ads, setAds] = useState<Advertisement[]>(MOCK_ADS)
  const [user, setUser] = useState<User | null>(MOCK_USERS[1])
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
  const [badges] = useState<Badge[]>(MOCK_BADGES)
  const [abTests, setAbTests] = useState<ABTest[]>(MOCK_AB_TESTS)
  const [downloadedIds, setDownloadedIds] = useState<string[]>([])
  const [itineraries] = useState<Itinerary[]>(MOCK_ITINERARIES)
  const [rewardHistory, setRewardHistory] = useState<RewardActivity[]>([
    {
      id: '1',
      title: 'Bônus de Boas-vindas',
      points: 500,
      date: new Date(Date.now() - 86400000 * 30).toISOString(),
      type: 'earned',
    },
    {
      id: '2',
      title: 'Cupom Resgatado - Burger King',
      points: -50,
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
      type: 'redeemed',
    },
    {
      id: '3',
      title: 'Check-in Diário',
      points: 10,
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      type: 'earned',
    },
  ])

  useEffect(() => {
    const storedSaved = localStorage.getItem('savedCoupons')
    if (storedSaved) setSavedIds(JSON.parse(storedSaved))

    const storedReserved = localStorage.getItem('reservedCoupons')
    if (storedReserved) setReservedIds(JSON.parse(storedReserved))

    const storedTrip = localStorage.getItem('tripCoupons')
    if (storedTrip) setTripIds(JSON.parse(storedTrip))

    const storedDownloaded = localStorage.getItem('downloadedCoupons')
    if (storedDownloaded) setDownloadedIds(JSON.parse(storedDownloaded))

    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) setUser(JSON.parse(storedUser))

    setUploads([
      {
        id: 'u1',
        date: new Date().toISOString(),
        status: 'Verified',
        type: 'Receipt',
        storeName: 'Burger King',
        image: 'mock-url',
      },
    ])

    setTimeout(() => {
      setUserLocation(MOCK_USER_LOCATION)
      setIsLoadingLocation(false)
    }, 1500)
  }, [])

  useEffect(
    () => localStorage.setItem('savedCoupons', JSON.stringify(savedIds)),
    [savedIds],
  )
  useEffect(
    () => localStorage.setItem('reservedCoupons', JSON.stringify(reservedIds)),
    [reservedIds],
  )
  useEffect(
    () => localStorage.setItem('tripCoupons', JSON.stringify(tripIds)),
    [tripIds],
  )
  useEffect(
    () =>
      localStorage.setItem('downloadedCoupons', JSON.stringify(downloadedIds)),
    [downloadedIds],
  )
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('currentUser')
    }
  }, [user])

  const addPoints = (amount: number, reason: string) => {
    setPoints((prev) => prev + amount)
    setRewardHistory((prev) => [
      {
        id: Math.random().toString(),
        title: reason,
        points: amount,
        date: new Date().toISOString(),
        type: 'earned',
      },
      ...prev,
    ])
  }

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    )
  }

  const toggleTrip = (id: string) => {
    setTripIds((prev) => {
      const exists = prev.includes(id)
      if (exists) {
        toast.info('Removido do roteiro de viagem.')
        return prev.filter((tid) => tid !== id)
      } else {
        toast.success('Salvo para sua viagem!', {
          description: 'Acesse na aba "Meu Roteiro" no Planejador.',
        })
        return [...prev, id]
      }
    })
  }

  const reserveCoupon = (id: string) => {
    const coupon = coupons.find((c) => c.id === id)
    if (!coupon) return false
    if (
      coupon.totalAvailable &&
      coupon.reservedCount &&
      coupon.reservedCount >= coupon.totalAvailable
    )
      return false
    if (reservedIds.includes(id)) return false

    setCoupons((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, reservedCount: (c.reservedCount || 0) + 1 } : c,
      ),
    )
    setReservedIds((prev) => [...prev, id])
    addPoints(10, `Reserva: ${coupon.storeName}`)
    return true
  }

  const addCoupon = (coupon: Coupon) => setCoupons((prev) => [coupon, ...prev])

  const addReview = (
    couponId: string,
    reviewData: Omit<Review, 'id' | 'date'>,
  ) => {
    setCoupons((prev) =>
      prev.map((coupon) => {
        if (coupon.id !== couponId) return coupon
        const newReview: Review = {
          id: Math.random().toString(),
          date: new Date().toISOString(),
          ...reviewData,
        }
        const reviews = [newReview, ...(coupon.reviews || [])]
        return {
          ...coupon,
          reviews,
          averageRating:
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
        }
      }),
    )
    addPoints(25, 'Avaliação de oferta')
  }

  const addUpload = (doc: UploadedDocument) => {
    setUploads((prev) => [doc, ...prev])
    addPoints(50, 'Upload de documento')
  }
  const refreshCoupons = () => {
    toast.success('Ofertas atualizadas com sucesso!')
    setCoupons([...MOCK_COUPONS])
  }
  const voteCoupon = (id: string, type: 'up' | 'down') => {
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              upvotes: type === 'up' ? (c.upvotes || 0) + 1 : c.upvotes,
              downvotes: type === 'down' ? (c.downvotes || 0) + 1 : c.downvotes,
              lastVerified: new Date().toISOString(),
            }
          : c,
      ),
    )
    toast.success('Obrigado pelo seu voto!')
    addPoints(5, 'Voto na comunidade')
  }
  const reportCoupon = (id: string, issue: string) => {
    console.log('Reported', id, issue)
    toast.success('Problema reportado.')
  }

  const makeBooking = (bookingData: Omit<Booking, 'id' | 'status'>) => {
    const newBooking: Booking = {
      id: Math.random().toString(),
      status: 'confirmed',
      ...bookingData,
    }
    setBookings((prev) => [newBooking, ...prev])
    addPoints(100, `Reserva confirmada: ${bookingData.storeName}`)
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === '2'
          ? {
              ...c,
              current: Math.min(c.current + 1, c.total),
              completed: c.current + 1 >= c.total,
              status: c.current + 1 >= c.total ? 'completed' : 'active',
            }
          : c,
      ),
    )
  }

  const redeemPoints = (amount: number, type: 'points' | 'fetch') => {
    if (type === 'points') {
      if (points < amount) return false
      setPoints((prev) => prev - amount)
      setRewardHistory((prev) => [
        {
          id: Math.random().toString(),
          title: 'Resgate de Recompensa',
          points: -amount,
          date: new Date().toISOString(),
          type: 'redeemed',
        },
        ...prev,
      ])
      return true
    } else {
      if (fetchCredits < amount) return false
      setFetchCredits((prev) => prev - amount)
      return true
    }
  }

  const addABTest = (test: ABTest) => setAbTests((prev) => [test, ...prev])

  const downloadOffline = (ids: string[]) => {
    setDownloadedIds((prev) => Array.from(new Set([...prev, ...ids])))
    toast.success('Itens baixados para acesso offline!')
  }

  const processPayment = async (details: {
    couponId?: string
    amount: number
  }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (details.couponId) {
          setCoupons((prev) =>
            prev.map((c) =>
              c.id === details.couponId ? { ...c, isPaid: true } : c,
            ),
          )
          reserveCoupon(details.couponId)
        }
        resolve(true)
      }, 1500)
    })
  }

  const joinChallenge = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'active' } : c)),
    )
    toast.success('Desafio aceito! Boa sorte.')
  }

  const login = (email: string, role: User['role']) => {
    const user = MOCK_USERS.find((u) => u.email === email && u.role === role)
    if (user) {
      setUser(user)
      toast.success(`Bem-vindo, ${user.name}!`)
    } else {
      const newUser: User = {
        id: Math.random().toString(),
        name: email.split('@')[0],
        email,
        role,
        avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male',
      }
      setUser(newUser)
      toast.success('Login realizado com sucesso!')
    }
  }

  const logout = () => {
    setUser(null)
    toast.info('Sessão encerrada.')
  }

  const approveCompany = (id: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'active' } : c)),
    )
    toast.success('Empresa aprovada com sucesso!')
  }

  const rejectCompany = (id: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'rejected' } : c)),
    )
    toast.error('Empresa rejeitada.')
  }

  const createAd = (ad: Advertisement) => {
    setAds((prev) => [ad, ...prev])
    toast.success('Anúncio criado com sucesso!')
  }

  const deleteAd = (id: string) => {
    setAds((prev) => prev.filter((a) => a.id !== id))
    toast.info('Anúncio removido.')
  }

  const updateCampaign = (id: string, data: Partial<Coupon>) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
    toast.success('Campanha atualizada.')
  }

  const isSaved = (id: string) => savedIds.includes(id)
  const isReserved = (id: string) => reservedIds.includes(id)
  const isDownloaded = (id: string) => downloadedIds.includes(id)
  const isInTrip = (id: string) => tripIds.includes(id)

  return React.createElement(
    CouponContext.Provider,
    {
      value: {
        coupons,
        companies,
        ads,
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
        badges,
        abTests,
        downloadedIds,
        itineraries,
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
        login,
        logout,
        approveCompany,
        rejectCompany,
        createAd,
        deleteAd,
        updateCampaign,
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
