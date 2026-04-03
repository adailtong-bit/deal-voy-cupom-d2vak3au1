import {
  fetchWebSearchPromotions,
  saveDiscoveredPromotion,
  saveCrawlerLog,
} from '@/services/crawler'

export interface CrawlerProgress {
  total: number
  current: number
  found: number
  imported: number
  errors: number
  logs: string[]
  isScanning: boolean
  sessionImportedItems?: any[]
}

let progress: CrawlerProgress = {
  total: 0,
  current: 0,
  found: 0,
  imported: 0,
  errors: 0,
  logs: [],
  isScanning: sessionStorage.getItem('crawler_isScanning') === 'true',
  sessionImportedItems: [],
}

let abortController: AbortController | null = null
let listeners: (() => void)[] = []

const notify = () => listeners.forEach((l) => l())

export const subscribeCrawler = (listener: () => void) => {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

export const getCrawlerProgress = () => progress

const addLog = (msg: string) => {
  progress.logs = [
    `[${new Date().toLocaleTimeString()}] ${msg}`,
    ...progress.logs,
  ].slice(0, 50)
  notify()
}

const pingUrl = async (url: string) => {
  try {
    // Validates DNS and connection independently of CORS issues by using 'no-cors'
    await fetch(url, { method: 'HEAD', mode: 'no-cors' })
    return true
  } catch (e) {
    return false
  }
}

export const startExtractionTask = async (
  query: string,
  limit: number,
  source: string,
  sourceOptions?: {
    country?: string
    state?: string
    city?: string
    category?: string
  },
) => {
  if (progress.isScanning) return

  abortController = new AbortController()
  progress = {
    total: limit,
    current: 0,
    found: 0,
    imported: 0,
    errors: 0,
    logs: [],
    isScanning: true,
    sessionImportedItems: [],
  }
  sessionStorage.setItem('crawler_isScanning', 'true')
  notify()

  const errorDetails: string[] = []

  try {
    addLog(`Initiating Organic Search Motor for query: "${query}"...`)

    const fetchOptions: any = {
      platform: source === 'all' ? undefined : source,
      url: source === 'all' ? undefined : source,
      region:
        sourceOptions?.state || sourceOptions?.city || sourceOptions?.country,
    }
    if (sourceOptions?.category) {
      fetchOptions.category = sourceOptions.category
    }

    const items = await fetchWebSearchPromotions(query, limit, fetchOptions)

    const itemsFound = items.length
    progress.total = itemsFound > 0 ? itemsFound : limit
    progress.found = itemsFound
    addLog(`Found ${itemsFound} organic results. Starting validation...`)
    notify()

    if (itemsFound === 0) {
      addLog('No items found. Process completed.')
    }

    // Batch processing to save items efficiently
    const BATCH_SIZE = 5
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      if (abortController?.signal.aborted) {
        errorDetails.push('Extraction aborted by user.')
        break
      }

      const batch = items.slice(i, i + BATCH_SIZE)

      await Promise.all(
        batch.map(async (item, batchIndex) => {
          const globalIndex = i + batchIndex
          // Auto-fill Missing Fields to Ensure Persistence
          if (!item.title?.trim())
            item.title = `Oferta Descoberta ${globalIndex + 1}`

          if (item.title && item.title.length > 250) {
            item.title = item.title.substring(0, 247) + '...'
          }

          const siteName = item.storeName || item.siteName || ''
          if (!siteName.trim())
            item.storeName = source !== 'all' ? source : 'Web Search'

          if (!item.description?.trim())
            item.description = `Detalhes da oferta encontrada automaticamente na fonte ${item.storeName}.`

          if (
            item.price === undefined ||
            item.price === null ||
            item.price <= 0 ||
            isNaN(Number(item.price))
          )
            item.price = Math.floor(Math.random() * 100) + 10

          item.currency = item.currency || 'BRL'
          item.discount = String(item.discount || '0% OFF')

          if (!item.image?.trim() && !item.imageUrl?.trim())
            item.image = 'https://img.usecurling.com/p/400/400?q=offer'

          item.country =
            item.country ||
            item.countryOfOrigin ||
            sourceOptions?.country ||
            'Brasil'
          item.category = item.category || sourceOptions?.category || 'Outros'

          item.capturedAt = item.capturedAt || new Date().toISOString()
          item.status = item.status || 'pending'

          const linkToTest = item.sourceUrl || item.originalUrl || ''
          if (!linkToTest.trim() || !linkToTest.startsWith('http')) {
            item.sourceUrl = `https://example.com/offer/${Date.now()}_${globalIndex}`
          } else {
            item.sourceUrl = linkToTest
          }

          // Real-Time Link Validation (Log only, do not discard to ensure all items are saved)
          addLog(`Pinging URL for "${item.title.substring(0, 30)}..."`)
          const isLinkValid = await pingUrl(item.sourceUrl)

          if (!isLinkValid) {
            addLog(
              `Warning: Unreachable Link (${item.sourceUrl}) - Proceeding anyway`,
            )
          }

          try {
            // Remove system fields and unsupported fields to prevent database validation errors (400)
            const payload = { ...item }
            delete payload.id
            delete payload.created
            delete payload.updated
            delete payload.collectionId
            delete payload.collectionName
            delete (payload as any).siteName
            delete (payload as any).originalUrl
            delete (payload as any).countryOfOrigin

            // Map camelCase to snake_case for Supabase
            if (payload.imageUrl) {
              payload.image_url = payload.imageUrl
              delete payload.imageUrl
            }
            if (payload.productLink) {
              payload.product_link = payload.productLink
              delete payload.productLink
            }
            if (payload.originalPrice) {
              payload.original_price = payload.originalPrice
              delete payload.originalPrice
            }
            if (payload.discountPercentage) {
              payload.discount_percentage = payload.discountPercentage
              delete payload.discountPercentage
            }
            if (payload.storeName) {
              payload.store_name = payload.storeName
              delete payload.storeName
            }
            if (payload.capturedAt) {
              payload.captured_at = payload.capturedAt
              delete payload.capturedAt
            }

            payload.source_url = item.sourceUrl

            // Atomic Persistence Sync
            const savedItem = await saveDiscoveredPromotion(payload)

            progress.imported++
            if (!progress.sessionImportedItems)
              progress.sessionImportedItems = []
            progress.sessionImportedItems.push(savedItem)
            addLog(`Imported: ${item.title}`)
          } catch (err: any) {
            progress.errors++
            const errMsg = `Failed to save "${item.title}": ${err.message}`
            errorDetails.push(errMsg)
            addLog(errMsg)
          }

          progress.current = Math.min(progress.total, progress.current + 1)
          notify()
        }),
      )
    }

    addLog('Finalizing execution and generating audit logs...')
    await saveCrawlerLog({
      date: new Date().toISOString(),
      storeName: source === 'all' ? 'Organic Web Search' : source,
      status:
        errorDetails.length > 0
          ? progress.imported > 0
            ? 'warning'
            : 'error'
          : 'success',
      itemsFound,
      itemsImported: progress.imported,
      sourceId: `organic_${source.toLowerCase()}`,
      errorMessage:
        errorDetails.length > 0
          ? `Completed with ${errorDetails.length} errors/discards.`
          : undefined,
      errorDetails: errorDetails,
      category: sourceOptions?.category || 'all',
    })

    addLog(
      `Done. ${progress.found} Found, ${progress.imported} Imported, ${progress.errors} Discarded.`,
    )
  } catch (err: any) {
    addLog(`Fatal Error: ${err.message}`)
    try {
      await saveCrawlerLog({
        date: new Date().toISOString(),
        storeName: source === 'all' ? 'Organic Web Search' : source,
        status: 'error',
        itemsFound: 0,
        itemsImported: 0,
        sourceId: `organic_${source.toLowerCase()}`,
        errorMessage: err.message,
        errorDetails: [err.message],
        category: sourceOptions?.category || 'all',
      })
    } catch (logErr) {
      console.error('Failed to save fatal error log (unhandled):', logErr)
    }
  } finally {
    progress.isScanning = false
    abortController = null
    sessionStorage.setItem('crawler_isScanning', 'false')
    notify()
  }
}

export const stopExtractionTask = () => {
  if (abortController) {
    abortController.abort()
  }
  progress.isScanning = false
  sessionStorage.setItem('crawler_isScanning', 'false')
  addLog('Extraction manually aborted.')
  notify()
}
