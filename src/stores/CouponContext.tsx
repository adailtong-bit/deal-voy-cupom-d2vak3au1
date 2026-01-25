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
} from '@/lib/types'
import {
  MOCK_COUPONS,
  MOCK_USER_LOCATION,
  MOCK_CHALLENGES,
  MOCK_BADGES,
  MOCK_AB_TESTS,
} from '@/lib/data'
import { toast } from 'sonner'

interface CouponContextType {
  coupons: Coupon[]
  savedIds: string[]
  reservedIds: string[]
  userLocation: UserLocation | null
  uploads: UploadedDocument[]
  bookings: Booking[]
  points: number
  fetchCredits: number
  challenges: Challenge[]
  badges: Badge[]
  abTests: ABTest[]
  downloadedIds: string[]
  toggleSave: (id: string) => void
  reserveCoupon: (id: string) => boolean
  addCoupon: (coupon: Coupon) => void
  isSaved: (id: string) => boolean
  isReserved: (id: string) => boolean
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
}

const CouponContext = createContext<CouponContextType | undefined>(undefined)

export function CouponProvider({ children }: { children: React.ReactNode }) {
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS)
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [reservedIds, setReservedIds] = useState<string[]>([])
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

  useEffect(() => {
    const storedSaved = localStorage.getItem('savedCoupons')
    if (storedSaved) setSavedIds(JSON.parse(storedSaved))

    const storedReserved = localStorage.getItem('reservedCoupons')
    if (storedReserved) setReservedIds(JSON.parse(storedReserved))

    const storedDownloaded = localStorage.getItem('downloadedCoupons')
    if (storedDownloaded) setDownloadedIds(JSON.parse(storedDownloaded))

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
    () =>
      localStorage.setItem('downloadedCoupons', JSON.stringify(downloadedIds)),
    [downloadedIds],
  )

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    )
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
    setPoints((prev) => prev + 10)
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
    setPoints((prev) => prev + 25)
  }

  const addUpload = (doc: UploadedDocument) => {
    setUploads((prev) => [doc, ...prev])
    setPoints((prev) => prev + 50)
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
    setPoints((prev) => prev + 5)
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
    setPoints((prev) => prev + 100)
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === '2'
          ? {
              ...c,
              current: Math.min(c.current + 1, c.total),
              completed: c.current + 1 >= c.total,
            }
          : c,
      ),
    )
  }

  const redeemPoints = (amount: number, type: 'points' | 'fetch') => {
    if (type === 'points') {
      if (points < amount) return false
      setPoints((prev) => prev - amount)
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

  const isSaved = (id: string) => savedIds.includes(id)
  const isReserved = (id: string) => reservedIds.includes(id)
  const isDownloaded = (id: string) => downloadedIds.includes(id)

  return React.createElement(
    CouponContext.Provider,
    {
      value: {
        coupons,
        savedIds,
        reservedIds,
        userLocation,
        uploads,
        bookings,
        points,
        fetchCredits,
        challenges,
        badges,
        abTests,
        downloadedIds,
        toggleSave,
        reserveCoupon,
        addCoupon,
        isSaved,
        isReserved,
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
