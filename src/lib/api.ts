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

export const fetchCoupons = async (
  params: FetchCouponsParams = {},
): Promise<FetchCouponsResponse> => {
  const {
    query = '',
    category = 'all',
    page = 1,
    limit = 20,
    franchiseId,
    region,
    language = 'pt',
  } = params

  try {
    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('perPage', limit.toString())
    if (query) queryParams.append('q', query)
    if (category && category !== 'all') queryParams.append('category', category)
    if (region) queryParams.append('region', region)
    if (franchiseId) queryParams.append('franchiseId', franchiseId)

    const res = await fetch(
      `${API_URL}/collections/coupons/records?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    )
    if (res.ok) {
      try {
        const data = await res.json()
        return {
          data: data?.items || [],
          hasMore: (data?.page || 0) < (data?.totalPages || 0),
          total: data?.totalItems || 0,
        }
      } catch (jsonErr) {
        console.warn('Failed to parse coupons response as JSON', jsonErr)
        return { data: [], hasMore: false, total: 0 }
      }
    } else {
      console.warn(`Fetch coupons failed: ${res.status} ${res.statusText}`)
      return { data: [], hasMore: false, total: 0 }
    }
  } catch (e: any) {
    if (e?.name === 'TypeError' && e?.message === 'Failed to fetch') {
      console.warn('Network error: Failed to fetch coupons. Using fallback.')
    } else {
      console.error('Backend unavailable', e)
    }
    return { data: [], hasMore: false, total: 0 }
  }
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
  limit: number = 50,
): Promise<DiscoveredPromotion[]> => {
  let token = localStorage.getItem('auth_token')
  if (!token) {
    const pbAuth = localStorage.getItem('pocketbase_auth')
    if (pbAuth) {
      try {
        token = JSON.parse(pbAuth).token
      } catch (e) {
        /* ignore */
      }
    }
  }

  try {
    const res = await fetch(
      `${API_URL}/crawler/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token
            ? {
                Authorization: token.startsWith('Bearer')
                  ? token
                  : `Bearer ${token}`,
              }
            : {}),
        },
      },
    )
    if (res.ok) {
      try {
        const data = await res.json()
        return data?.items || []
      } catch (jsonErr) {
        console.warn('Failed to parse web search response', jsonErr)
        return []
      }
    } else {
      console.warn(`Fetch web search failed: ${res.status} ${res.statusText}`)
      return []
    }
  } catch (e: any) {
    if (e?.name === 'TypeError' && e?.message === 'Failed to fetch') {
      console.warn('Network error: Failed to fetch web search promotions.')
    } else {
      console.error('Real search API unavailable', e)
    }
    return []
  }
}

/**
 * Mocks a server-side API call for real-time crawler data synchronization.
 */
export const fetchCrawlerPromotions = async (
  params: FetchCrawlerPromotionsParams = {},
): Promise<FetchCrawlerPromotionsResponse> => {
  const { page = 1, limit = 20, franchiseId, region, query, category } = params

  try {
    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('perPage', limit.toString())
    if (query) queryParams.append('q', query)
    if (category && category !== 'all') queryParams.append('category', category)
    if (region) queryParams.append('region', region)
    if (franchiseId) queryParams.append('franchiseId', franchiseId)

    const res = await fetch(
      `${API_URL}/collections/discovered_promotions/records?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    )
    if (res.ok) {
      try {
        const data = await res.json()
        return {
          data: data?.items || [],
          hasMore: (data?.page || 0) < (data?.totalPages || 0),
          total: data?.totalItems || 0,
        }
      } catch (jsonErr) {
        console.warn('Failed to parse crawler promotions response', jsonErr)
        return { data: [], hasMore: false, total: 0 }
      }
    } else {
      console.warn(
        `Fetch crawler promotions failed: ${res.status} ${res.statusText}`,
      )
      return { data: [], hasMore: false, total: 0 }
    }
  } catch (e: any) {
    if (e?.name === 'TypeError' && e?.message === 'Failed to fetch') {
      console.warn('Network error: Failed to fetch crawler promotions.')
    } else {
      console.error('Backend unavailable', e)
    }
    return { data: [], hasMore: false, total: 0 }
  }
}

export const saveDiscoveredPromotion = async (
  data: Partial<DiscoveredPromotion>,
): Promise<any> => {
  let token = localStorage.getItem('auth_token')
  if (!token) {
    const pbAuth = localStorage.getItem('pocketbase_auth')
    if (pbAuth) {
      try {
        token = JSON.parse(pbAuth).token
      } catch (e) {
        /* ignore */
      }
    }
  }

  const res = await fetch(
    `${API_URL}/collections/discovered_promotions/records`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token
          ? {
              Authorization: token.startsWith('Bearer')
                ? token
                : `Bearer ${token}`,
            }
          : {}),
      },
      body: JSON.stringify(data),
    },
  )

  if (!res.ok) {
    throw new Error(`Failed to save promotion: ${res.status}`)
  }
  return await res.json()
}

export const saveCrawlerLog = async (data: any): Promise<any> => {
  try {
    let token = localStorage.getItem('auth_token')
    if (!token) {
      const pbAuth = localStorage.getItem('pocketbase_auth')
      if (pbAuth) {
        try {
          token = JSON.parse(pbAuth).token
        } catch (e) {
          /* ignore */
        }
      }
    }

    const res = await fetch(`${API_URL}/collections/crawler_logs/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token
          ? {
              Authorization: token.startsWith('Bearer')
                ? token
                : `Bearer ${token}`,
            }
          : {}),
      },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      console.warn('Failed to save crawler log:', res.status)
      return null
    }
    return await res.json()
  } catch (e) {
    console.error('Network error saving crawler log:', e)
    return null
  }
}

export const fetchCrawlerLogs = async (): Promise<any[]> => {
  let token = localStorage.getItem('auth_token')
  if (!token) {
    const pbAuth = localStorage.getItem('pocketbase_auth')
    if (pbAuth) {
      try {
        token = JSON.parse(pbAuth).token
      } catch (e) {
        /* ignore */
      }
    }
  }

  try {
    const res = await fetch(
      `${API_URL}/collections/crawler_logs/records?sort=-created&perPage=100`,
      {
        headers: {
          Accept: 'application/json',
          ...(token
            ? {
                Authorization: token.startsWith('Bearer')
                  ? token
                  : `Bearer ${token}`,
              }
            : {}),
        },
      },
    )
    if (res.ok) {
      const data = await res.json()
      return data?.items || []
    }
  } catch (e) {
    console.error('Failed to fetch crawler logs from API', e)
  }

  return []
}

export const updateUser = async (userId: string, data: any): Promise<any> => {
  let token = localStorage.getItem('auth_token')

  if (!token) {
    const pbAuth = localStorage.getItem('pocketbase_auth')
    if (pbAuth) {
      try {
        const parsed = JSON.parse(pbAuth)
        token = parsed.token
      } catch (e) {
        // ignore parse error
      }
    }
  }

  const res = await fetch(`${API_URL}/collections/users/records/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token
        ? {
            Authorization: token.startsWith('Bearer')
              ? token
              : `Bearer ${token}`,
          }
        : {}),
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    let errorMessage = `HTTP Error: ${res.status}`
    try {
      const errorData = await res.json()
      if (errorData.message) errorMessage = errorData.message
      if (errorData.data) {
        const fieldErrors = Object.entries(errorData.data)
          .map(
            ([field, err]: [string, any]) => `${field}: ${err?.message || err}`,
          )
          .join(', ')
        if (fieldErrors) errorMessage += ` (${fieldErrors})`
      }
    } catch (e) {
      // Ignore JSON parse error
    }
    throw new Error(errorMessage)
  }

  return await res.json()
}
