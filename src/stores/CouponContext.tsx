import React, { createContext, useContext, useState, useEffect } from 'react'
import { Coupon, UserLocation } from '@/lib/types'
import { MOCK_COUPONS, MOCK_USER_LOCATION } from '@/lib/data'

interface CouponContextType {
  coupons: Coupon[]
  savedIds: string[]
  userLocation: UserLocation | null
  toggleSave: (id: string) => void
  addCoupon: (coupon: Coupon) => void
  isSaved: (id: string) => boolean
  isLoadingLocation: boolean
}

const CouponContext = createContext<CouponContextType | undefined>(undefined)

export function CouponProvider({ children }: { children: React.ReactNode }) {
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS)
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)

  // Load saved from local storage on mount
  useEffect(() => {
    const storedSaved = localStorage.getItem('savedCoupons')
    if (storedSaved) {
      setSavedIds(JSON.parse(storedSaved))
    }

    // Simulate getting location
    setTimeout(() => {
      setUserLocation(MOCK_USER_LOCATION)
      setIsLoadingLocation(false)
    }, 1500)
  }, [])

  // Sync saved to local storage
  useEffect(() => {
    localStorage.setItem('savedCoupons', JSON.stringify(savedIds))
  }, [savedIds])

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    )
  }

  const addCoupon = (coupon: Coupon) => {
    setCoupons((prev) => [coupon, ...prev])
  }

  const isSaved = (id: string) => savedIds.includes(id)

  return React.createElement(
    CouponContext.Provider,
    {
      value: {
        coupons,
        savedIds,
        userLocation,
        toggleSave,
        addCoupon,
        isSaved,
        isLoadingLocation,
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
