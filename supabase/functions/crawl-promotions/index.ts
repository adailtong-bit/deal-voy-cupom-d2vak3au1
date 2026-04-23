import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import * as cheerio from 'npm:cheerio'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
]

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

function resolveUrl(url: string, base: string): string {
  if (!url) return base
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('//')) return `https:${url}`
  try {
    const baseUrl = new URL(base.startsWith('http') ? base : `https://${base}`)
    return new URL(url, baseUrl.origin).toString()
  } catch (e) {
    return base
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '')
  } catch (e) {
    return url.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '')
  }
}

async function fetchWithRetry(url: string, options: any, retries = 2): Promise<Response> {
  let lastError: any
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      const res = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timeoutId)
      if (res.ok || res.status === 404) return res // 404 might mean no products, not a block
      if (res.status === 429 || res.status >= 500) {
        throw new Error(`HTTP ${res.status}`)
      }
      return res // Other statuses (e.g. 403) might be strict blocks, return to handle
    } catch (e) {
      lastError = e
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1))) // Exponential backoff
    }
  }
  throw lastError
}

interface ScrapedItem {
  title: string
  price: string | null
  originalPrice?: string | null
  discount?: string | null
  imageUrl: string | null
  productLink: string
  storeName: string
  description?: string
}

class ProfessionalScraper {
  private debugLogs: any[] = []

  addLog(msg: string, data?: any) {
    this.debugLogs.push({ time: new Date().toISOString(), msg, data })
    console.log(`[Scraper] ${msg}`, data ? JSON.stringify(data) : '')
  }

  getLogs() {
    return this.debugLogs
  }

  // Parser estrito usando regras mapeadas (De/Para) definidas pelo usuário no painel
  parseWithRules($: cheerio.CheerioAPI, html: string, baseUrl: string, rules: any): ScrapedItem[] {
    const items: ScrapedItem[] = []
    const domain = extractDomain(baseUrl)
    const container = rules.containerSelector || rules.container || 'article, .card, [class*="product"]'
    
    $(container).each((_, el) => {
      const title = $(el).find(rules.titleSelector || rules.title).first().text().trim()
      const priceText = $(el).find(rules.priceSelector || rules.price).first().text().trim()
      let link = $(el).find(rules.linkSelector || rules.link || 'a').first().attr('href')
      const img = $(el).find(rules.imageSelector || rules.image || 'img').first().attr('src') || $(el).find(rules.imageSelector || rules.image || 'img').first().attr('data-src')

      if (title && title.length > 5 && link) {
        items.push({
          title,
          price: priceText || null,
          imageUrl: resolveUrl(img || '', baseUrl),
          productLink: resolveUrl(link, baseUrl),
          storeName: domain,
        })
      }
    })
    return items
  }

  // Parser ultra-otimizado específico para Amazon, lidando com múltiplas variações de grid
  parseAmazon($: cheerio.CheerioAPI, baseUrl: string): ScrapedItem[] {
    const items: ScrapedItem[] = []
    const selectors = [
      'div[data-component-type="s-search-result"]',
      '.sg-col-inner',
      '.a-carousel-card',
      '[class*="DealGridItem"]'
    ]

    let elements = $(selectors.join(', '))
    
    elements.each((_, el) => {
      const titleTag = $(el).find('span.a-size-base-plus, h2, [class*="dealTitle"], .a-truncate-cut').first()
      const title = titleTag.text().trim()
      
      const priceWhole = $(el).find('span.a-price-whole').first().text().trim()
      const priceFraction = $(el).find('span.a-price-fraction').first().text().trim()
      let price = priceWhole ? `${priceWhole}${priceFraction ? ','+priceFraction : ''}` : null
      
      if (!price) {
         price = $(el).find('span.a-price, [class*="priceBlock"]').first().text().trim()
      }

      const oldPrice = $(el).find('span.a-price.a-text-price span[aria-hidden="true"]').first().text().trim() || 
                       $(el).find('span.a-price.a-text-price').first().text().trim()

      let link = $(el).find('a.a-link-normal').first().attr('href') || $(el).find('a').first().attr('href')
      let img = $(el).find('img.s-image, img.a-dynamic-image').first().attr('src')

      if (title && link && !link.includes('javascript:')) {
        items.push({
          title,
          price: price || null,
          originalPrice: oldPrice || null,
          imageUrl: img || null,
          productLink: resolveUrl(link, 'https://www.amazon.com'),
          storeName: 'amazon',
        })
      }
    })

    // Deduplicate by URL
    const unique = new Map<string, ScrapedItem>()
    items.forEach(item => {
      const id = item.productLink.split('?')[0] // remove query params for deduplication
      if (!unique.has(id)) unique.set(id, item)
    })
    
    return Array.from(unique.values())
  }

  // Parser ultra-otimizado específico para Mercado Livre
  parseMercadoLivre($: cheerio.CheerioAPI, baseUrl: string): ScrapedItem[] {
    const items: ScrapedItem[] = []
    const domain = extractDomain(baseUrl)
    
    const elements = $('.ui-search-result__wrapper, .ui-search-layout__item, .andes-card, .poly-card')
    
    elements.each((_, el) => {
      const title = $(el).find('h2, .ui-search-item__title, .poly-component__title').first().text().trim()
      
      let currentPrice: string | null = null
      let oldPrice: string | null = null

      // Busca preço promocional primeiro
      const promoPrice = $(el).find('.ui-search-price__part--primary .andes-money-amount__fraction, .poly-price__current .andes-money-amount__fraction').first().text().trim()
      if (promoPrice) currentPrice = `R$ ${promoPrice}`

      // Busca preço antigo
      const strikethroughPrice = $(el).find('s.andes-money-amount .andes-money-amount__fraction, .poly-price__original .andes-money-amount__fraction').first().text().trim()
      if (strikethroughPrice) oldPrice = `R$ ${strikethroughPrice}`

      if (!currentPrice) {
         // Fallback para preço genérico se não tiver promocional
         const priceTag = $(el).find('.andes-money-amount__fraction').first().text().trim()
         if (priceTag) currentPrice = `R$ ${priceTag}`
      }

      let link = $(el).find('a.ui-search-link, a.ui-search-item__group__element, a.poly-component__title').first().attr('href')
      let img = $(el).find('img.ui-search-result-image__image, img.poly-component__picture').first().attr('data-src') || $(el).find('img').first().attr('src')

      if (title && link && !link.includes('javascript:')) {
        items.push({
          title,
          price: currentPrice || null,
          originalPrice: oldPrice || null,
          imageUrl: resolveUrl(img || '', baseUrl),
          productLink: resolveUrl(link.split('#')[0], baseUrl),
          storeName: domain,
        })
      }
    })

    // Deduplicate
    const unique = new Map<string, ScrapedItem>()
    items.forEach(item => {
      const id = item.productLink.split('?')[0]
      if (!unique.has(id)) unique.set(id, item)
    })

    return Array.from(unique.values())
  }

  // Heurística de alta qualidade para sites não mapeados
  parseGeneric($: cheerio.CheerioAPI, baseUrl: string): ScrapedItem[] {
    const items: ScrapedItem[] = []
    const domain = extractDomain(baseUrl)
    
    // Procura por containers que parecem ser de produtos
    const containerSelectors = [
      '[class*="product-card"]', '[class*="ProductCard"]',
      '[class*="item-card"]', '[class*="ItemCard"]',
      'article', '.card', '.item', 'li[class*="product"]'
    ]

    let containers = $(containerSelectors.join(', '))
    if (containers.length === 0) {
      // Fallback agressivo: qualquer div que contenha um link e uma imagem
      containers = $('div:has(a):has(img)')
    }

    containers.each((_, el) => {
      // Tenta encontrar o título mais provável
      let title = $(el).find('h2, h3, [class*="title"], [class*="name"]').first().text().trim()
      if (!title) title = $(el).find('img').first().attr('alt') || ''
      if (!title) title = $(el).find('a').first().text().trim()

      // Tenta encontrar o preço
      const prices = $(el).find('[class*="price"], [class*="valor"], [class*="preco"], [class*="amount"]')
      
      let oldPrice: string | null = null
      let currentPrice: string | null = null
      
      // Busca preço riscado (antigo)
      const strikethrough = $(el).find('s, strike, del, [class*="old"], [class*="original"]').first().text().trim()
      if (strikethrough) {
          const match = strikethrough.match(/(?:R\$|€|\$)\s*\d+(?:[.,]\d{2})?/)
          if (match) oldPrice = match[0]
      }
      
      const allPrices: string[] = []
      prices.each((_, p) => {
          const pt = $(p).text().trim()
          const match = pt.match(/(?:R\$|€|\$)\s*\d+(?:[.,]\d{2})?/)
          if (match && !allPrices.includes(match[0])) {
              allPrices.push(match[0])
          }
      })
      
      if (allPrices.length === 1) {
          currentPrice = allPrices[0]
      } else if (allPrices.length > 1) {
          const parsedPrices = allPrices.map(p => ({ str: p, val: parseFloat(p.replace(/[^\d,]/g, '').replace(',', '.')) }))
          parsedPrices.sort((a, b) => a.val - b.val)
          
          currentPrice = parsedPrices[0].str
          if (!oldPrice) {
              oldPrice = parsedPrices[parsedPrices.length - 1].str
          }
      } else {
        // Fallback genérico final
        const priceText = $(el).text().trim()
        const priceMatch = priceText.match(/(?:R\$|€|\$)\s*\d+(?:[.,]\d{2})?/)
        if (priceMatch) currentPrice = priceMatch[0]
      }

      let link = $(el).find('a[href]').first().attr('href')
      let img = $(el).find('img[src], img[data-src]').first().attr('src') || $(el).find('img').first().attr('data-src')

      // Validação estrita para heurística: só aceita se tiver título claro e link
      if (title && title.length > 10 && link && !link.startsWith('javascript:')) {
        items.push({
          title: title.substring(0, 200),
          price: currentPrice,
          originalPrice: oldPrice,
          imageUrl: resolveUrl(img || '', baseUrl),
          productLink: resolveUrl(link, baseUrl),
          storeName: domain,
        })
      }
    })

    // Deduplicate generic items by title to avoid messy duplications
    const unique = new Map<string, ScrapedItem>()
    items.forEach(item => {
      const id = item.title.toLowerCase().substring(0, 30)
      if (!unique.has(id)) unique.set(id, item)
    })

    return Array.from(unique.values())
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const scraper = new ProfessionalScraper()
  scraper.addLog('Iniciando motor de extração Profissional (Node.js/Cheerio)')

  try {
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const payload = await req.json()
    const { query, limit = 10, options } = payload
    let targetSources: any[] = []
    let siteMappings: Record<string, any> = {}

    // 1. Fetch configurated Site Mappings
    const { data: mappingsData } = await supabaseClient.from('site_mappings').select('*')
    if (mappingsData && mappingsData.length > 0) {
      mappingsData.forEach(m => {
        siteMappings[m.domain.toLowerCase()] = m.mapping_rules
      })
      scraper.addLog(`Carregados ${mappingsData.length} mapeamentos estruturados de sites.`)
    }

    // 2. Determine Sources to Crawl
    if (options?.url && options.url !== 'all') {
      targetSources = [{ url: options.url, name: extractDomain(options.url), category: options.category }]
    } else if (options?.useConfiguredSources || options?.url === 'all') {
      scraper.addLog('Buscando fontes ativas configuradas no banco de dados...')
      const { data: sourcesData, error: sourcesError } = await supabaseClient
        .from('crawler_sources')
        .select('*')
        .eq('status', 'active')

      if (sourcesError) throw sourcesError
      targetSources = (sourcesData || []).filter(s => s.url && s.url !== 'all')
      scraper.addLog(`Encontradas ${targetSources.length} fontes ativas.`)
    }

    if (targetSources.length === 0) {
      throw new Error('Nenhuma fonte de dados válida fornecida ou configurada.')
    }

    const finalItems: ScrapedItem[] = []

    // 3. Execution Loop over Sources
    for (let i = 0; i < targetSources.length; i++) {
      if (finalItems.length >= limit) break

      const source = targetSources[i]
      const targetUrl = source.url.startsWith('http') ? source.url : `https://${source.url}`
      const domain = extractDomain(targetUrl)

      scraper.addLog(`Iniciando extração em: ${domain} (${targetUrl})`)

      if (i > 0) {
        scraper.addLog('Aguardando 2.5s (Delay de Segurança) para evitar bloqueios de IP...')
        await new Promise(r => setTimeout(r, 2500))
      }

      const headers: Record<string, string> = {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }

      // Headers específicos para burlar bloqueios baseados na origem
      if (domain.includes('amazon')) {
        headers['Referer'] = 'https://www.amazon.com/'
        headers['Accept-Language'] = 'en-US,en;q=0.9'
      } else {
        headers['Referer'] = `https://${domain}/`
      }

      try {
        const response = await fetchWithRetry(targetUrl, { headers }, 2)
        scraper.addLog(`Resposta HTTP [${domain}]: ${response.status}`)

        if (!response.ok) {
          scraper.addLog(`Falha ao acessar ${domain} - ignorando fonte.`)
          continue
        }

        const html = await response.text()
        const $ = cheerio.load(html)
        let extracted: ScrapedItem[] = []

        // Estratégia de Parsing baseada no Domínio
        const mapping = siteMappings[domain.toLowerCase()] || Object.values(siteMappings).find((m: any) => domain.includes(m.domain))
        
        if (domain.includes('amazon')) {
          scraper.addLog(`Aplicando parser ultra-específico para Amazon...`)
          extracted = scraper.parseAmazon($, targetUrl)
        } else if (domain.includes('mercadolivre') || domain.includes('mercadolibre')) {
          scraper.addLog(`Aplicando parser ultra-específico para Mercado Livre...`)
          extracted = scraper.parseMercadoLivre($, targetUrl)
        } else if (mapping) {
          scraper.addLog(`Aplicando mapeamento estrito (De/Para) para ${domain}...`)
          extracted = scraper.parseWithRules($, html, targetUrl, mapping)
        } else {
          scraper.addLog(`Nenhum mapeamento encontrado. Aplicando heurística avançada (Genérica) para ${domain}...`)
          extracted = scraper.parseGeneric($, targetUrl)
        }

        scraper.addLog(`Encontrados ${extracted.length} itens brutos em ${domain}.`)

        // Aplicar informações adicionais da fonte (Região, Categoria)
        extracted.forEach(item => {
          item.category = source.category || options?.category || 'Geral'
          // Add to final list ensuring we don't exceed limit significantly
          if (finalItems.length < limit) finalItems.push(item)
        })

      } catch (err: any) {
        scraper.addLog(`Erro Crítico na extração de ${domain}: ${err.message}`)
      }
    }

    if (finalItems.length === 0) {
      scraper.addLog('Processo concluído, mas nenhum item válido foi extraído.')
      return new Response(JSON.stringify({ items: [], debug_info: { logs: scraper.getLogs(), target_url: options?.url } }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    scraper.addLog(`Extração bem sucedida. Retornando ${finalItems.length} itens normalizados.`)

    return new Response(JSON.stringify({ items: finalItems, debug_info: { logs: scraper.getLogs(), target_url: options?.url } }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })

  } catch (error: any) {
    scraper.addLog(`Falha Fatal na Execução: ${error.message}`)
    return new Response(JSON.stringify({ error: error.message, debug_info: { logs: scraper.getLogs() } }), {
      status: 200, // Return 200 so crawlerTask can read the payload and log properly instead of breaking the UI
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
