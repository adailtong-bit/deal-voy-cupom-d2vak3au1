import { Coupon, DiscoveredPromotion } from './types'

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
const API_URL =
  import.meta.env.VITE_API_URL || 'https://routevoy.goskip.app/api'

export const fetchCoupons = async ({
  query = '',
  category = 'all',
  page = 1,
  limit = 20,
  franchiseId,
  region,
  language = 'pt',
}: FetchCouponsParams): Promise<FetchCouponsResponse> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      perPage: limit.toString(),
      q: query,
      category,
      region: region || '',
      franchiseId: franchiseId || '',
    })
    const res = await fetch(
      `${API_URL}/collections/coupons/records?${queryParams}`,
    )
    if (res.ok) {
      const data = await res.json()
      return {
        data: data.items,
        hasMore: data.page < data.totalPages,
        total: data.totalItems,
      }
    }
  } catch (e) {
    console.error('Backend unavailable', e)
  }

  return { data: [], hasMore: false, total: 0 }
}

export interface FetchCrawlerPromotionsParams {
  page?: number
  limit?: number
  franchiseId?: string
  region?: string
  query?: string
  category?: string
}

export interface FetchCrawlerPromotionsResponse {
  data: DiscoveredPromotion[]
  hasMore: boolean
  total: number
}

export const fetchWebSearchPromotions = async (
  query: string,
): Promise<DiscoveredPromotion[]> => {
  try {
    const res = await fetch(
      `${API_URL}/crawler/search?q=${encodeURIComponent(query)}`,
    )
    if (res.ok) {
      const data = await res.json()
      return data.items || []
    }
  } catch (e) {
    console.error('Real search API unavailable', e)
  }

  return []
}

/**
 * Mocks a server-side API call for real-time crawler data synchronization.
 */
export const fetchCrawlerPromotions = async ({
  page = 1,
  limit = 20,
  franchiseId,
  region,
  query,
  category,
}: FetchCrawlerPromotionsParams): Promise<FetchCrawlerPromotionsResponse> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      perPage: limit.toString(),
      q: query || '',
      category: category || '',
      region: region || '',
      franchiseId: franchiseId || '',
    })
    const res = await fetch(
      `${API_URL}/collections/discovered_promotions/records?${queryParams}`,
    )
    if (res.ok) {
      const data = await res.json()
      return {
        data: data.items,
        hasMore: data.page < data.totalPages,
        total: data.totalItems,
      }
    }
  } catch (e) {
    console.error('Backend unavailable', e)
  }

  return { data: [], hasMore: false, total: 0 }
}
