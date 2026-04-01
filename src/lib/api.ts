import { Coupon, DiscoveredPromotion } from './types'

const API_URL =
  import.meta.env.VITE_API_URL || 'https://routevoy.goskip.app/api'

export const fetchCategories = async (): Promise<any[]> => {
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
    const baseUrl = API_URL.replace(/\/$/, '')
    const res = await fetch(
      `${baseUrl}/collections/categories/records?perPage=100`,
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
    if (!res.ok) {
      throw new Error(`Failed to fetch categories: ${res.status}`)
    }
    const data = await res.json()
    return Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : []
  } catch (e) {
    console.error('Failed to fetch categories', e)
    return []
  }
}

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

    const baseUrl = API_URL.replace(/\/$/, '')
    const res = await fetch(
      `${baseUrl}/collections/coupons/records?${queryParams.toString()}`,
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
        const items = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
            ? data
            : []
        return {
          data: items,
          hasMore: (data?.page || 0) < (data?.totalPages || 0),
          total: data?.totalItems || items.length,
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
  options: {
    region?: string
    category?: string
    minDiscount?: number
    platform?: string
    page?: number
  } = {},
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
    const baseUrl = API_URL.replace(/\/$/, '')
    const url = new URL(`${baseUrl}/crawler/search`)
    url.searchParams.append('q', query)
    url.searchParams.append('limit', limit.toString())
    if (options.region) url.searchParams.append('region', options.region)
    if (options.category && options.category !== 'all')
      url.searchParams.append('category', options.category)
    if (options.minDiscount)
      url.searchParams.append('minDiscount', options.minDiscount.toString())
    if (options.page) url.searchParams.append('page', options.page.toString())
    if (options.platform && options.platform !== 'all')
      url.searchParams.append('platform', options.platform)

    const res = await fetch(url.toString(), {
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
    })

    if (!res.ok) {
      throw new Error(`Connection Error: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()
    return Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : []
  } catch (e: any) {
    console.error(
      `Failed to fetch from organic search engine API for query: ${query}`,
      e,
    )
    return []
  }
}

export const fetchCrawlerPromotions = async (
  params: FetchCrawlerPromotionsParams = {},
): Promise<FetchCrawlerPromotionsResponse> => {
  const { page = 1, limit = 20, franchiseId, region, query, category } = params

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
    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('perPage', limit.toString())
    if (query) queryParams.append('q', query)
    if (category && category !== 'all') queryParams.append('category', category)
    if (region) queryParams.append('region', region)
    if (franchiseId) queryParams.append('franchiseId', franchiseId)

    const baseUrl = API_URL.replace(/\/$/, '')
    const res = await fetch(
      `${baseUrl}/collections/discovered_promotions/records?${queryParams.toString()}`,
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
        const text = await res.text()
        if (!text) return { data: [], hasMore: false, total: 0 }

        const data = JSON.parse(text)
        const apiData = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
            ? data
            : []
        return {
          data: apiData.slice(0, limit),
          hasMore: (data?.page || 0) < (data?.totalPages || 0),
          total: Math.max(data?.totalItems || 0, apiData.length),
        }
      } catch (jsonErr) {
        console.warn(
          'Failed to parse crawler promotions response as JSON',
          jsonErr,
        )
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
      console.warn(
        'Network error: Failed to fetch crawler promotions. Using fallback.',
      )
    } else {
      console.error('Backend unavailable or fetch failed', e)
    }
    return { data: [], hasMore: false, total: 0 }
  }
}

export const saveDiscoveredPromotion = async (
  data: Partial<DiscoveredPromotion>,
  retries = 3,
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

  const baseUrl = API_URL.replace(/\/$/, '')

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(
        `${baseUrl}/collections/discovered_promotions/records`,
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
        if (res.status === 401 || res.status === 403) {
          throw new Error('AuthError: Session expired or invalid token.')
        }
        let errorMsg = `Failed to save promotion: ${res.status}`
        try {
          const errData = await res.json()
          if (errData.message) errorMsg += ` - ${errData.message}`
          if (errData.data) {
            const fieldErrors = Object.entries(errData.data)
              .map(
                ([field, err]: [string, any]) =>
                  `${field}: ${err?.message || err}`,
              )
              .join(', ')
            if (fieldErrors) errorMsg += ` (${fieldErrors})`
          }
        } catch (_) {
          /* ignore */
        }

        // Don't retry on 400 Bad Request, as it's a validation error that won't resolve
        if (res.status >= 400 && res.status < 500) {
          throw new Error(errorMsg)
        }

        if (attempt < retries - 1) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
          continue
        }
        throw new Error(errorMsg)
      }
      return await res.json()
    } catch (e: any) {
      if (
        e.message?.includes('AuthError') ||
        e.message?.includes('Failed to save promotion: 4')
      ) {
        throw e
      }
      console.error(
        `Network error saving discovered promotion (attempt ${attempt + 1}):`,
        e,
      )
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
        continue
      }
      throw e
    }
  }
}

export const saveCrawlerLog = async (data: any, retries = 3): Promise<any> => {
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

  const baseUrl = API_URL.replace(/\/$/, '')

  // Sanitize payload to prevent JSON stringify issues or huge payloads causing network drops
  const payload = { ...data }
  if (Array.isArray(payload.errorDetails)) {
    payload.errorDetails = JSON.stringify(payload.errorDetails.slice(0, 100)) // Limit payload size
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(`${baseUrl}/collections/crawler_logs/records`, {
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
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        console.warn(
          `Failed to save crawler log (attempt ${attempt + 1}):`,
          res.status,
        )
        if (res.status >= 500 && attempt < retries - 1) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
          continue
        }
        // Instead of throwing, resolve gracefully to prevent pipeline crashes
        return null
      }

      return await res.json()
    } catch (e) {
      console.error(
        `Network error saving crawler log (attempt ${attempt + 1}):`,
        e,
      )
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
        continue
      }
      // Completely resolve "Failed to fetch" runtime error by not throwing
      return null
    }
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

  const baseUrl = API_URL.replace(/\/$/, '')
  let apiLogs: any[] = []
  try {
    const res = await fetch(
      `${baseUrl}/collections/crawler_logs/records?sort=-created&perPage=100`,
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
      apiLogs = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : []
    }
  } catch (e) {
    console.warn('Failed to fetch crawler logs from API', e)
    apiLogs = []
  }

  const allLogs = (Array.isArray(apiLogs) ? [...apiLogs] : []).sort((a, b) => {
    return (
      new Date(b.created || b.date).getTime() -
      new Date(a.created || a.date).getTime()
    )
  })

  return allLogs.slice(0, 100)
}

export const updateUser = async (userId: string, data: any): Promise<any> => {
  try {
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

    const baseUrl = API_URL.replace(/\/$/, '')
    const res = await fetch(`${baseUrl}/collections/users/records/${userId}`, {
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
              ([field, err]: [string, any]) =>
                `${field}: ${err?.message || err}`,
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
  } catch (e) {
    console.error('Failed to update user', e)
    throw e
  }
}
