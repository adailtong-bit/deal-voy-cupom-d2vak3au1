import {
  fetchWebSearchPromotions,
  saveDiscoveredPromotion,
  saveCrawlerLog,
} from '@/lib/api'

export interface CrawlerProgress {
  total: number
  current: number
  found: number
  imported: number
  errors: number
  logs: string[]
  isScanning: boolean
}

let progress: CrawlerProgress = {
  total: 0,
  current: 0,
  found: 0,
  imported: 0,
  errors: 0,
  logs: [],
  isScanning: sessionStorage.getItem('crawler_isScanning') === 'true',
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
  }
  sessionStorage.setItem('crawler_isScanning', 'true')
  notify()

  const errorDetails: string[] = []

  try {
    addLog(`Initiating Organic Search Motor for query: "${query}"...`)

    const items = await fetchWebSearchPromotions(query, limit, {
      platform: source === 'all' ? undefined : source,
    })

    const itemsFound = items.length
    progress.found = itemsFound
    addLog(`Found ${itemsFound} organic results. Starting validation...`)
    notify()

    if (itemsFound === 0) {
      addLog('No items found. Process completed.')
    }

    for (let i = 0; i < items.length; i++) {
      if (abortController?.signal.aborted) {
        errorDetails.push('Extraction aborted by user.')
        break
      }

      progress.current = i + 1
      notify()

      const item = items[i]
      const missingFields = []

      // Mandatory Field Validation
      if (!item.title?.trim()) missingFields.push('Title')
      if (item.price === undefined || item.price === null || item.price <= 0)
        missingFields.push('Price')
      if (!item.image?.trim() && !item.imageUrl?.trim())
        missingFields.push('Image')

      const linkToTest = item.sourceUrl || item.originalUrl || ''
      if (!linkToTest.trim() || !linkToTest.startsWith('http'))
        missingFields.push('Link')

      if (missingFields.length > 0) {
        progress.errors++
        const errMsg = `Discarded Item [${i}]: Missing/Invalid fields (${missingFields.join(', ')})`
        errorDetails.push(errMsg)
        addLog(errMsg)
        notify()
        continue
      }

      // Real-Time Link Validation
      addLog(`Pinging URL for "${item.title.substring(0, 30)}..."`)
      const isLinkValid = await pingUrl(linkToTest)

      if (!isLinkValid) {
        progress.errors++
        const errMsg = `Discarded Item [${i}]: Invalid/Unreachable Link (${linkToTest})`
        errorDetails.push(errMsg)
        addLog(errMsg)
        notify()
        continue
      }

      try {
        // Atomic Persistence Sync
        await saveDiscoveredPromotion({ ...item, sourceUrl: linkToTest })
        progress.imported++
        addLog(`Imported: ${item.title}`)
      } catch (err: any) {
        progress.errors++
        const errMsg = `Failed to save "${item.title}": ${err.message}`
        errorDetails.push(errMsg)
        addLog(errMsg)
      }
      notify()
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
    })

    addLog(
      `Done. ${progress.found} Found, ${progress.imported} Imported, ${progress.errors} Discarded.`,
    )
  } catch (err: any) {
    addLog(`Fatal Error: ${err.message}`)
    await saveCrawlerLog({
      date: new Date().toISOString(),
      storeName: source === 'all' ? 'Organic Web Search' : source,
      status: 'error',
      itemsFound: 0,
      itemsImported: 0,
      sourceId: `organic_${source.toLowerCase()}`,
      errorMessage: err.message,
      errorDetails: [err.message],
    })
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
