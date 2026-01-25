import React, { createContext, useContext, useState, useEffect } from 'react'
import { Coupon, UserLocation } from '@/lib/types'
import { MOCK_COUPONS, MOCK_USER_LOCATION } from '@/lib/data'

interface CouponContextType {
  coupons: Coupon[]
  savedIds: string[]
  reservedIds: string[]
  userLocation: UserLocation | null
  toggleSave: (id: string) => void
  reserveCoupon: (id: string) => boolean
  addCoupon: (coupon: Coupon) => void
  isSaved: (id: string) => boolean
  isReserved: (id: string) => boolean
  isLoadingLocation: boolean
}

const CouponContext = createContext<CouponContextType | undefined>(undefined)

export function CouponProvider({ children }: { children: React.ReactNode }) {
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS)
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [reservedIds, setReservedIds] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)

  // Load saved from local storage on mount
  useEffect(() => {
    const storedSaved = localStorage.getItem('savedCoupons')
    if (storedSaved) {
      setSavedIds(JSON.parse(storedSaved))
    }
    const storedReserved = localStorage.getItem('reservedCoupons')
    if (storedReserved) {
      setReservedIds(JSON.parse(storedReserved))
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

    // Check availability
    if (
      coupon.totalAvailable !== undefined &&
      coupon.reservedCount !== undefined &&
      coupon.reservedCount >= coupon.totalAvailable
    ) {
      return false
    }

    // Check max per user
    // Simplified logic: reservedIds only stores ID, assuming 1 reservation per ID per session for now
    if (reservedIds.includes(id)) {
      return false // Already reserved
    }

    // Update coupon state
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
        toggleSave,
        reserveCoupon,
        addCoupon,
        isSaved,
        isReserved,
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
