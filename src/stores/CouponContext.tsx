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
  MOCK_REWARDS,
} from '@/lib/data'
import { toast } from 'sonner'
import { useNotification } from './NotificationContext'

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
  login: (email: string, role: User['role']) => void
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
}

const CouponContext = createContext<CouponContextType | undefined>(undefined)

export function CouponProvider({ children }: { children: React.ReactNode }) {
  const { addNotification } = useNotification()
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
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: 'm1',
      title: 'Avalie sua visita ao Burger King',
      description: 'Conta pra gente como foi sua experiência e ganhe pontos.',
      rewardPoints: 100,
      type: 'survey',
      completed: false,
    },
    {
      id: 'm2',
      title: 'Compartilhe um roteiro',
      description: 'Ajude outros viajantes compartilhando seus planos.',
      rewardPoints: 50,
      type: 'action',
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
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([
    {
      id: 'tx1',
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
      amount: 45.9,
      storeName: 'Spa Relax',
      couponTitle: 'Massagem Relaxante',
      method: 'card',
      status: 'completed',
      customerName: 'João da Silva',
      pointsAwarded: 45,
      installments: 1,
    },
    {
      id: 'tx2',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      amount: 25.9,
      storeName: 'Burger King',
      couponTitle: '2 Whoppers',
      method: 'wallet',
      status: 'completed',
      customerName: 'Maria Oliveira',
      pointsAwarded: 25,
      installments: 1,
    },
  ])
  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>([
    {
      id: 'fetch',
      name: 'FETCH',
      connected: false,
      points: 1500,
      icon: 'dog',
      color: 'yellow',
    },
    {
      id: 'latam',
      name: 'Latam Pass',
      connected: false,
      points: 4200,
      icon: 'plane',
      color: 'red',
    },
    {
      id: 'dotz',
      name: 'Dotz',
      connected: false,
      points: 850,
      icon: 'coins',
      color: 'orange',
    },
    {
      id: 'sephora',
      name: 'Sephora Beauty',
      connected: false,
      points: 300,
      icon: 'sparkles',
      color: 'black',
    },
  ])
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

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

    const storedItineraries = localStorage.getItem('savedItineraries')
    if (storedItineraries) {
      const parsed = JSON.parse(storedItineraries) as Itinerary[]
      setItineraries((prev) => {
        const newIds = parsed.map((i) => i.id)
        const filteredPrev = prev.filter((i) => !newIds.includes(i.id))
        return [...filteredPrev, ...parsed]
      })
    }

    const storedFetch = localStorage.getItem('isFetchConnected')
    if (storedFetch) {
      const connected = JSON.parse(storedFetch)
      setIsFetchConnected(connected)
      setConnectedApps((prev) =>
        prev.map((app) =>
          app.id === 'fetch' ? { ...app, connected: connected } : app,
        ),
      )
    }

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

  useEffect(() => {
    if (user && user.birthday) {
      const today = new Date()
      const birthday = new Date(user.birthday)
      if (
        today.getDate() === birthday.getDate() &&
        today.getMonth() === birthday.getMonth()
      ) {
        setBirthdayGiftAvailable(true)
        addNotification({
          title: 'Feliz Aniversário!',
          message: 'Você tem um presente especial te esperando.',
          type: 'gift',
          priority: 'high',
          category: 'smart',
        })
      }
    }
  }, [user, addNotification])

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
  useEffect(
    () => localStorage.setItem('savedItineraries', JSON.stringify(itineraries)),
    [itineraries],
  )
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('currentUser')
    }
  }, [user])

  useEffect(
    () =>
      localStorage.setItem(
        'isFetchConnected',
        JSON.stringify(isFetchConnected),
      ),
    [isFetchConnected],
  )

  const addPoints = (
    amount: number,
    reason: string,
    type: RewardActivity['type'] = 'earned',
  ) => {
    setPoints((prev) => prev + amount)
    setRewardHistory((prev) => [
      {
        id: Math.random().toString(),
        title: reason,
        points: amount,
        date: new Date().toISOString(),
        type,
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
          description: 'Acesse na aba "Planejador".',
        })
        setTimeout(() => {
          addNotification({
            title: 'Roteiro Atualizado',
            message: 'Novas ofertas foram adicionadas ao seu plano de viagem.',
            type: 'system',
            priority: 'medium',
            category: 'smart',
          })
        }, 5000)

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
      addNotification({
        title: 'Recompensa Resgatada',
        message: `Você usou ${amount} pontos com sucesso.`,
        type: 'gift',
        priority: 'medium',
        category: 'system',
      })
      return true
    } else {
      if (fetchCredits < amount) return false
      setFetchCredits((prev) => prev - amount)
      return true
    }
  }

  const addABTest = (test: ABTest) => setAbTests((prev) => [test, ...prev])

  const downloadOffline = (ids: string[]) => {
    setIsDownloading(true)
    setDownloadProgress(0)
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setDownloadedIds((prevIds) =>
            Array.from(new Set([...prevIds, ...ids])),
          )
          setIsDownloading(false)
          toast.success('Conteúdo salvo offline com sucesso!', {
            description: 'Mapas, imagens e códigos disponíveis sem internet.',
          })
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const processPayment = async (details: {
    couponId?: string
    amount: number
    method?: 'card' | 'fetch' | 'wallet'
    installments?: number
  }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const coupon = details.couponId
          ? coupons.find((c) => c.id === details.couponId)
          : null

        if (details.couponId && coupon) {
          setCoupons((prev) =>
            prev.map((c) =>
              c.id === details.couponId ? { ...c, isPaid: true } : c,
            ),
          )
          reserveCoupon(details.couponId)
          const newTx: PaymentTransaction = {
            id: 'tx-' + Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
            amount: details.amount,
            storeName: coupon.storeName,
            couponTitle: coupon.title,
            method: details.method || 'card',
            status: 'completed',
            customerName: user?.name || 'Cliente',
            pointsAwarded: Math.floor(details.amount),
            installments: details.installments || 1,
          }
          setTransactions((prev) => [newTx, ...prev])
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

  const completeMission = (id: string) => {
    const mission = missions.find((m) => m.id === id)
    if (mission && !mission.completed) {
      setMissions((prev) =>
        prev.map((m) => (m.id === id ? { ...m, completed: true } : m)),
      )
      addPoints(mission.rewardPoints, `Missão Completa: ${mission.title}`)
      toast.success(
        `Missão completada! +${mission.rewardPoints} pontos ganhos.`,
      )
    }
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

  const connectFetch = () => {
    setIsFetchConnected(true)
    setFetchCredits((prev) => prev + 1500)
    setConnectedApps((prev) =>
      prev.map((app) =>
        app.id === 'fetch' ? { ...app, connected: true } : app,
      ),
    )
    toast.success('FETCH conectado com sucesso!', {
      description: 'Seus pontos foram sincronizados.',
    })
  }

  const connectApp = (id: string) => {
    setConnectedApps((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, connected: !app.connected } : app,
      ),
    )
    const app = connectedApps.find((a) => a.id === id)
    if (app && !app.connected) {
      toast.success(`${app.name} conectado!`, {
        description: 'Pontos sincronizados.',
      })
      if (app.points && app.points > 1000) {
        addNotification({
          title: 'Novas Recompensas Disponíveis',
          message: `Seus pontos do ${app.name} desbloquearam novas ofertas.`,
          type: 'gift',
          priority: 'medium',
          category: 'smart',
        })
      }
    } else {
      toast.info(`${app?.name} desconectado.`)
    }
  }

  const importFetchPoints = (amount: number) => {
    if (fetchCredits >= amount) {
      setFetchCredits((prev) => prev - amount)
      addPoints(amount, 'Importação FETCH', 'imported')
      toast.success(`${amount} pontos importados com sucesso!`)
    } else {
      toast.error('Saldo FETCH insuficiente.')
    }
  }

  const claimBirthdayGift = () => {
    if (birthdayGiftAvailable) {
      addPoints(1000, 'Presente de Aniversário')
      setBirthdayGiftAvailable(false)
      toast.success('Parabéns! Você ganhou 1000 pontos!')
    }
  }

  const updateUserProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data })
      toast.success('Perfil atualizado com sucesso!')
    }
  }

  const saveItinerary = (itinerary: Itinerary) => {
    setItineraries((prev) => {
      const exists = prev.find((i) => i.id === itinerary.id)
      if (exists) {
        return prev.map((i) => (i.id === itinerary.id ? itinerary : i))
      }
      return [itinerary, ...prev]
    })
    toast.success('Roteiro salvo com sucesso!', {
      description: 'Acesse na aba "Meus Roteiros"',
    })
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
        missions,
        badges,
        abTests,
        downloadedIds,
        itineraries,
        rewards,
        isFetchConnected,
        birthdayGiftAvailable,
        transactions,
        connectedApps,
        isDownloading,
        downloadProgress,
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
