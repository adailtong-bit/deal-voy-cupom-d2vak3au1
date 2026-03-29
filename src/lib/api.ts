import { Coupon, DiscoveredPromotion } from './types'
import { MOCK_COUPONS, MOCK_DISCOVERED_PROMOTIONS } from './data'

export interface FetchCouponsParams {
  query?: string
  category?: string
  page?: number
  limit?: number
  franchiseId?: string
  region?: string
  language?: string
}

export interface FetchCouponsResponse {
  data: Coupon[]
  hasMore: boolean
  total: number
}

/**
 * Mocks a server-side API call to a database (like Supabase or Skip Cloud).
 * Supports search, filtering, franchise scoping, pagination and server-side relevance logic.
 */
export const fetchCoupons = async ({
  query = '',
  category = 'all',
  page = 1,
  limit = 20,
  franchiseId,
  region,
  language = 'pt',
}: FetchCouponsParams): Promise<FetchCouponsResponse> => {
  return new Promise((resolve) => {
    // Simulate network delay to test loading states (under 300ms as per acceptance criteria)
    setTimeout(() => {
      let results = [...MOCK_COUPONS]

      // Server-side Franchise Scoping
      if (franchiseId) {
        results = results.filter(
          (c) => !c.franchiseId || c.franchiseId === franchiseId,
        )
      }

      // Server-side Regional Scoping (if no specific franchise)
      if (region && region !== 'Global') {
        const regionLower = region.toLowerCase()
        results = results.filter(
          (c) =>
            !c.region ||
            c.region === '' ||
            c.region.toLowerCase() === regionLower ||
            c.country?.toLowerCase() === regionLower ||
            c.state?.toLowerCase() === regionLower ||
            (regionLower === 'usa' && c.country?.toLowerCase() === 'usa') ||
            (regionLower === 'us' && c.country?.toLowerCase() === 'usa'),
        )
      }

      // Server-side Category Filtering
      if (category !== 'all') {
        results = results.filter((c) => c.category === category)
      }

      // Server-side Search Logic
      if (query) {
        const q = query.toLowerCase()
        results = results.filter((c) => {
          const title = (
            c.translations?.[language]?.title || c.title
          ).toLowerCase()
          const desc = (
            c.translations?.[language]?.description || c.description
          ).toLowerCase()
          const store = c.storeName.toLowerCase()
          return title.includes(q) || desc.includes(q) || store.includes(q)
        })
      }

      // Return calculated expirationDate and externalUrl as per crawler logic
      results = results.map((c) => {
        if (!c.expiryDate) {
          const defaultExpiry = new Date()
          defaultExpiry.setDate(defaultExpiry.getDate() + 30) // Default 30 days
          return { ...c, expiryDate: defaultExpiry.toISOString() }
        }
        return c
      })

      const total = results.length
      const start = (page - 1) * limit
      const end = start + limit
      const paginatedResults = results.slice(start, end)

      resolve({
        data: paginatedResults,
        hasMore: end < total,
        total,
      })
    }, 250)
  })
}

export interface FetchCrawlerPromotionsParams {
  page?: number
  limit?: number
  franchiseId?: string
  region?: string
}

export interface FetchCrawlerPromotionsResponse {
  data: DiscoveredPromotion[]
  hasMore: boolean
  total: number
}

/**
 * Mocks a server-side API call for real-time crawler data synchronization.
 */
export const fetchCrawlerPromotions = async ({
  page = 1,
  limit = 20,
  franchiseId,
  region,
}: FetchCrawlerPromotionsParams): Promise<FetchCrawlerPromotionsResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let results = [...MOCK_DISCOVERED_PROMOTIONS]

      if (franchiseId) {
        results = results.filter(
          (p) => !p.franchiseId || p.franchiseId === franchiseId,
        )
      } else if (region && region !== 'Global') {
        const regionLower = region.toLowerCase()
        results = results.filter(
          (p) =>
            !p.region ||
            p.region === '' ||
            p.region.toLowerCase() === regionLower ||
            p.country?.toLowerCase() === regionLower ||
            p.state?.toLowerCase() === regionLower ||
            (regionLower === 'usa' && p.country?.toLowerCase() === 'usa') ||
            (regionLower === 'us' && p.country?.toLowerCase() === 'usa'),
        )
      }

      // Only pending for crawler dashboard
      results = results.filter((p) => p.status === 'pending')

      const total = results.length
      const start = (page - 1) * limit
      const end = start + limit

      resolve({
        data: results.slice(start, end),
        hasMore: end < total,
        total,
      })
    }, 250)
  })
}
