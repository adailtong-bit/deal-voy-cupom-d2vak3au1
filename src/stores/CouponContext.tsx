import React, { createContext, useContext, useState, useEffect } from 'react'
import { Coupon, UserLocation, Review, UploadedDocument } from '@/lib/types'
import { MOCK_COUPONS, MOCK_USER_LOCATION } from '@/lib/data'
import { toast } from 'sonner'

interface CouponContextType {
  coupons: Coupon[]
  savedIds: string[]
  reservedIds: string[]
  userLocation: UserLocation | null
  uploads: UploadedDocument[]
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
}

const CouponContext = createContext<CouponContextType | undefined>(undefined)

export function CouponProvider({ children }: { children: React.ReactNode }) {
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS)
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [reservedIds, setReservedIds] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [uploads, setUploads] = useState<UploadedDocument[]>([])

  useEffect(() => {
    const storedSaved = localStorage.getItem('savedCoupons')
    if (storedSaved) {
      setSavedIds(JSON.parse(storedSaved))
    }
    const storedReserved = localStorage.getItem('reservedCoupons')
    if (storedReserved) {
      setReservedIds(JSON.parse(storedReserved))
    }
    // Mock upload history
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
    localStorage.setItem('savedCoupons', JSON.stringify(savedIds))
  }, [savedIds])

  useEffect(() => {
    localStorage.setItem('reservedCoupons', JSON.stringify(reservedIds))
  }, [reservedIds])

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    )
  }

  const reserveCoupon = (id: string) => {
    const couponIndex = coupons.findIndex((c) => c.id === id)
    if (couponIndex === -1) return false
    const coupon = coupons[couponIndex]

    if (
      coupon.totalAvailable !== undefined &&
      coupon.reservedCount !== undefined &&
      coupon.reservedCount >= coupon.totalAvailable
    ) {
      return false
    }

    if (reservedIds.includes(id)) {
      return false
    }

    const updatedCoupons = [...coupons]
    updatedCoupons[couponIndex] = {
      ...coupon,
      reservedCount: (coupon.reservedCount || 0) + 1,
    }
    setCoupons(updatedCoupons)
    setReservedIds((prev) => [...prev, id])
    return true
  }

  const addCoupon = (coupon: Coupon) => {
    setCoupons((prev) => [coupon, ...prev])
  }

  const addReview = (
    couponId: string,
    reviewData: Omit<Review, 'id' | 'date'>,
  ) => {
    setCoupons((prev) =>
      prev.map((coupon) => {
        if (coupon.id !== couponId) return coupon
        const newReview: Review = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString(),
          ...reviewData,
        }
        const currentReviews = coupon.reviews || []
        const updatedReviews = [newReview, ...currentReviews]
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0)
        const averageRating = totalRating / updatedReviews.length
        return {
          ...coupon,
          reviews: updatedReviews,
          averageRating,
        }
      }),
    )
  }

  const addUpload = (doc: UploadedDocument) => {
    setUploads((prev) => [doc, ...prev])
  }

  const refreshCoupons = () => {
    // Mock refresh
    toast.success('Ofertas atualizadas com sucesso!')
    setCoupons([...MOCK_COUPONS])
  }

  const voteCoupon = (id: string, type: 'up' | 'down') => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        return {
          ...c,
          upvotes: type === 'up' ? (c.upvotes || 0) + 1 : c.upvotes,
          downvotes: type === 'down' ? (c.downvotes || 0) + 1 : c.downvotes,
          lastVerified: new Date().toISOString(),
        }
      }),
    )
    toast.success('Obrigado pelo seu voto!')
  }

  const reportCoupon = (id: string, issue: string) => {
    console.log('Reported issue for', id, issue)
    toast.success('Problema reportado. Obrigado por ajudar!')
  }

  const isSaved = (id: string) => savedIds.includes(id)
  const isReserved = (id: string) => reservedIds.includes(id)

  return React.createElement(
    CouponContext.Provider,
    {
      value: {
        coupons,
        savedIds,
        reservedIds,
        userLocation,
        uploads,
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
      },
    },
    children,
  )
}

export function useCouponStore() {
  const context = useContext(CouponContext)
  if (context === undefined) {
    throw new Error('useCouponStore must be used within a CouponProvider')
  }
  return context
}
