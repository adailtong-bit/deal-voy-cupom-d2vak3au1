import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import * as cheerio from 'npm:cheerio'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

const browserHeaders = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  Connection: 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Cache-Control': 'max-age=0',
}

function buildSearchQuery(params: {
  query?: string
  siteDomain?: string
  category?: string
  region?: string
}): string {
  const { query, siteDomain, category, region } = params

  const isUS =
    region?.toLowerCase().includes('us') ||
    region?.toLowerCase().includes('usa') ||
    region?.toLowerCase().includes('eua')

  const offerTerms = isUS
    ? ['deal', 'discount', 'limited time offer', 'sale', 'promo', 'coupon']
    : [
        'promoção',
        'desconto',
        'oferta por tempo limitado',
        'válido até',
        'aproveite',
        'imperdível',
      ]

  let parts: string[] = []

  if (query) parts.push(query)
  if (category && category !== 'all') parts.push(category)
  if (region) parts.push(region)

  parts.push(offerTerms[Math.floor(Math.random() * offerTerms.length)])

  if (siteDomain) parts.push(`site:${siteDomain}`)

  return parts.join(' ')
}

function resolveUrl(url: string, base: string): string {
  if (!url) return base
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('//')) return `https:${url}`

  try {
    const baseUrl = new URL(base.startsWith('http') ? base : `https://${base}`)
    if (url.startsWith('/')) {
      return `${baseUrl.origin}${url}`
    }
    return `${baseUrl.origin}/${url}`
  } catch (e) {
    return base
  }
}

function extractOfferFields(
  $: cheerio.CheerioAPI,
  el: any,
  fallbackUrl: string,
  sourceName: string,
) {
  const title =
    $(el)
      .find(
        'h2, h3, .title, [class*="title"], [class*="name"], span[class*="size-base-plus"]',
      )
      .first()
      .text()
      .trim() || $(el).find('a').first().text().trim()

  let url = ''
  const links: string[] = []
  $(el)
    .find('a[href]')
    .each((_: number, a: any) => {
      const href = $(a).attr('href')
      if (href && !href.startsWith('javascript:')) links.push(href)
    })

  for (const href of links) {
    if (href.includes('uddg=')) {
      const match = href.match(/uddg=([^&]+)/)
      if (match) {
        url = decodeURIComponent(match[1])
        break
      }
    }
    if (href.includes('/url?q=')) {
      const match = href.match(/\/url\?q=([^&]+)/)
      if (match) {
        url = decodeURIComponent(match[1])
        break
      }
    }
  }

  if (!url && links.length > 0) {
    url = links[0]
  }

  url = resolveUrl(url, fallbackUrl)

  // Avoid saving purely search engine URLs and fictitious/example domains
  if (
    url.includes('duckduckgo.com') ||
    url.includes('bing.com') ||
    url.includes('google.com') ||
    url.includes('example.com') ||
    url.includes('test.com')
  ) {
    return null // Ignore purely search engine links completely
  }

  const description = $(el)
    .find('[class*="desc"], [class*="snippet"], p, span')
    .first()
    .text()
    .trim()

  const rawImage =
    $(el).find('img').first().attr('src') ||
    $(el).find('img').first().attr('data-src') ||
    undefined

  const bodyText = $(el).text()

  const priceMatch = bodyText.match(/(?:R\$|€|\$)\s*\d+(?:[.,]\d{2})?/)
  const priceText = priceMatch ? priceMatch[0] : undefined

  const discountMatch = bodyText.match(
    /(\d+\s*%\s*(?:off|de desconto|desconto))/i,
  )
  const discountText = discountMatch ? discountMatch[0] : undefined

  const validityMatch = bodyText.match(
    /válid[oa] até\s*[\d\/]+|expira em\s*[\d\/]+|até\s*\d{2}\/\d{2}|valid until\s*[\d\/]+|expires\s*[\d\/]+/,
  )
  const validity = validityMatch ? validityMatch[0] : undefined

  // Content validation: Ensure there is at least some indication of a real offer/product
  const ctaMatch = bodyText.match(
    /comprar|buy now|add to cart|adicionar ao carrinho|shop now|shop sale|get deal|resgatar/i,
  )

  if (!priceText && !discountText && !ctaMatch && !title.match(/\d+%/)) {
    return null
  }

  const regionMatch = bodyText.match(
    /nacional|todo[s]? o brasil|são paulo|rio de janeiro|nationwide|[A-Z]{2}\b/i,
  )
  const coverage = regionMatch ? regionMatch[0] : 'National'

  const categoryKeywords: Record<string, string[]> = {
    Viagem: [
      'hotel',
      'voo',
      'viagem',
      'hospedagem',
      'resort',
      'turismo',
      'flight',
      'travel',
      'vacation',
    ],
    Alimentação: [
      'restaurante',
      'delivery',
      'comida',
      'ifood',
      'pizza',
      'food',
      'restaurant',
      'meal',
      'burger',
    ],
    Moda: [
      'roupa',
      'moda',
      'calçado',
      'tênis',
      'vestido',
      'fashion',
      'shoes',
      'clothing',
      'apparel',
    ],
    Tecnologia: [
      'celular',
      'notebook',
      'tv',
      'eletrônico',
      'smartphone',
      'laptop',
      'electronics',
      'phone',
    ],
    Serviços: [
      'plano',
      'assinatura',
      'serviço',
      'app',
      'streaming',
      'subscription',
      'service',
    ],
  }

  let detectedCategory = 'Geral'
  const lowerText = bodyText.toLowerCase()
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((k) => lowerText.includes(k))) {
      detectedCategory = cat
      break
    }
  }

  let extractedDomain = ''
  try {
    extractedDomain = new URL(url).hostname
  } catch (e) {}

  let finalImage = rawImage
  if (!finalImage || finalImage.startsWith('data:image')) {
    const query =
      detectedCategory !== 'Geral'
        ? detectedCategory
        : extractedDomain.replace(/^www\./, '').split('.')[0] || 'offer'
    finalImage = `https://img.usecurling.com/p/400/400?q=${encodeURIComponent(query)}`
  } else {
    finalImage = resolveUrl(finalImage, url)
  }

  if (!title || !url.startsWith('http')) return null

  try {
    const parsedUrl = new URL(url)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) return null
  } catch (e) {
    return null
  }

  // Filter out generic SEO descriptions, empty titles, or fictitious data
  if (
    title.length < 5 ||
    title.toLowerCase().includes('compre online') ||
    title.toLowerCase().includes('encontre promoções') ||
    title.toLowerCase().includes('example') ||
    title.toLowerCase().includes('fictíci') ||
    title.toLowerCase().includes('mock') ||
    title.toLowerCase().includes('teste')
  ) {
    return null
  }

  return {
    raw_data: {
      html_title: title,
      campaign_name_default: `${sourceName} — ${title.substring(0, 40)}`,
      detected_description_main: description || title,
      category: detectedCategory,
      campaign_rules: validity
        ? `Válido/Valid: ${validity}`
        : 'Consulte o parceiro para regras / Check partner for rules',
      discount_rules:
        discountText || 'Desconto disponível / Discount available',
      detected_money_text_1: priceText || discountText,
      extracted_url: url,
      extracted_domain: extractedDomain,
      detected_image_1: finalImage,
      coverage: coverage,
      validity: validity || 'Tempo limitado / Limited time',
      source: sourceName,
    },
    captured_at: new Date().toISOString(),
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let debugInfo: any = { logs: [], target_url: '', status: null }
  const addLog = (msg: string, data?: any) => {
    debugInfo.logs.push({ time: new Date().toISOString(), msg, data })
  }

  try {
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const { query, limit = 10, options } = await req.json()
    const items: any[] = []

    let targetUrl = options?.url || ''
    let region = options?.region || options?.country || ''
    debugInfo.target_url = targetUrl

    let targetSources: any[] = []

    if (targetUrl === 'all' || options?.useConfiguredSources) {
      addLog('Buscando fontes configuradas no banco de dados...')
      const { data: sourcesData, error: sourcesError } = await supabaseClient
        .from('crawler_sources')
        .select('*')
        .eq('status', 'active')

      if (sourcesError) {
        addLog(`Erro ao buscar fontes: ${sourcesError.message}`)
      } else if (sourcesData && sourcesData.length > 0) {
        targetSources = sourcesData.filter((s: any) => s.url && s.url !== 'all')
        addLog(
          `Encontradas ${targetSources.length} fontes ativas para loop automático`,
        )
      }
    } else if (targetUrl) {
      let siteDomain = ''
      try {
        const urlObj = new URL(
          targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`,
        )
        siteDomain = urlObj.hostname
      } catch (e) {
        siteDomain = targetUrl.replace(/^https?:\/\//, '').split('/')[0]
      }
      targetSources = [
        {
          url: targetUrl,
          name: siteDomain,
          category: options?.category,
          country: region,
        },
      ]
    }

    const searchQuery = buildSearchQuery({
      query,
      siteDomain:
        targetSources.length === 1 ? targetSources[0].name : undefined,
      category: options?.category,
      region,
    })

    // TENTATIVA 1 & 2: Search engines (só se tivermos query específica e poucas fontes para não demorar demais)
    if (query && !options?.useConfiguredSources) {
      addLog('Query qualificada montada', { searchQuery })
      // DuckDuckGo
      try {
        const isUS =
          region.toLowerCase().includes('us') ||
          region.toLowerCase().includes('usa') ||
          region.toLowerCase().includes('eua')
        const searchFormData = new URLSearchParams()
        searchFormData.append('q', searchQuery)
        searchFormData.append('kl', isUS ? 'us-en' : 'br-pt')
        searchFormData.append('kp', '-2')

        const searchResp = await fetch('https://html.duckduckgo.com/html/', {
          method: 'POST',
          headers: {
            ...browserHeaders,
            'Content-Type': 'application/x-www-form-urlencoded',
            Origin: 'https://duckduckgo.com',
            Referer: 'https://duckduckgo.com/',
          },
          body: searchFormData.toString(),
        })

        addLog(`DuckDuckGo status: ${searchResp.status}`)

        if (searchResp.ok) {
          const searchHtml = await searchResp.text()
          const $search = cheerio.load(searchHtml)

          const selectors = [
            '.result',
            '.results_links',
            '[data-testid="result"]',
            '.web-result',
          ]
          let resultEls: any = null

          for (const sel of selectors) {
            const found = $search(sel)
            if (found.length > 0) {
              resultEls = found
              break
            }
          }

          if (resultEls) {
            resultEls.each((i: number, el: any) => {
              if (items.length >= limit) return

              let rawUrl =
                $search(el)
                  .find('a[data-testid="result-title-a"], a.result__url')
                  .first()
                  .attr('href') ||
                $search(el).find('a[href]').first().attr('href') ||
                ''
              if (rawUrl.includes('uddg=')) {
                const match = rawUrl.match(/uddg=([^&]+)/)
                if (match) rawUrl = decodeURIComponent(match[1])
              } else if (rawUrl.startsWith('//')) {
                rawUrl = 'https:' + rawUrl
              } else if (rawUrl.startsWith('/')) {
                rawUrl = 'https://duckduckgo.com' + rawUrl
              }

              const offer = extractOfferFields(
                $search,
                el,
                rawUrl,
                targetSources.length === 1
                  ? targetSources[0].name
                  : 'Busca Orgânica',
              )
              if (
                offer &&
                !offer.raw_data.extracted_url.includes('duckduckgo.com')
              ) {
                items.push(offer)
              }
            })
            addLog(`DDG encontrou: ${items.length} ofertas`)
          }
        }
      } catch (e: any) {
        addLog(`Erro no DuckDuckGo: ${e.message}`)
      }
    }

    // TENTATIVA 3: Extração direta iterando sobre as fontes configuradas (O LOOP)
    if (items.length < limit && targetSources.length > 0) {
      addLog('Tentando extração direta nas fontes', {
        sourcesCount: targetSources.length,
      })

      for (let i = 0; i < targetSources.length; i++) {
        if (items.length >= limit) break

        const source = targetSources[i]
        const directUrl = source.url.startsWith('http')
          ? source.url
          : `https://${source.url}`

        let siteDomain = ''
        try {
          siteDomain = new URL(directUrl).hostname
        } catch (e) {
          siteDomain = directUrl.replace(/^https?:\/\//, '').split('/')[0]
        }

        const isAmazon = siteDomain.includes('amazon')

        // Sistema de Atraso para evitar bloqueios (simulando time.sleep)
        if (i > 0) {
          addLog(
            `Aguardando 2s antes de acessar ${siteDomain} para evitar bloqueios...`,
          )
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }

        const sourceHeaders = isAmazon
          ? {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
              Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
              'Accept-Encoding': 'gzip, deflate, br',
              Referer: 'https://www.amazon.com/',
            }
          : { ...browserHeaders, Referer: `https://${siteDomain}/` }

        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 15000)

          const directResp = await fetch(directUrl, {
            headers: sourceHeaders,
            signal: controller.signal,
          })
          clearTimeout(timeoutId)

          addLog(`Extração direta [${siteDomain}] status: ${directResp.status}`)

          if (directResp.ok) {
            const html = await directResp.text()
            const $ = cheerio.load(html)
            let foundInSource = 0

            if (isAmazon) {
              addLog(`Iniciando parsing específico da Amazon em ${siteDomain}`)
              const itemsList = $(
                'div[data-component-type="s-search-result"], [class*="DealGridItem"], .sg-col-inner, .a-carousel-card',
              )

              itemsList.each((idx: number, el: any) => {
                if (items.length >= limit) return

                const title = $(el)
                  .find(
                    'span.a-size-base-plus, h2, [class*="dealTitle"], .a-truncate-cut',
                  )
                  .first()
                  .text()
                  .trim()
                const price = $(el)
                  .find(
                    'span.a-price-whole, span.a-price, [class*="priceBlock"]',
                  )
                  .first()
                  .text()
                  .trim()
                const oldPrice = $(el)
                  .find('span.a-price.a-text-price, [class*="basisPrice"]')
                  .first()
                  .text()
                  .trim()

                let discount = ''
                $(el)
                  .find('*')
                  .each((_: number, textEl: any) => {
                    const text = $(textEl).text()
                    if (text && text.includes('%')) {
                      const match = text.match(/\d+%\s*(?:off|desconto)?/i)
                      if (match) discount = match[0]
                    }
                  })

                let href = $(el).find('a').first().attr('href')
                let link = href
                  ? href.startsWith('http')
                    ? href
                    : `https://${siteDomain}${href}`
                  : ''

                const img =
                  $(el).find('img').first().attr('src') ||
                  `https://img.usecurling.com/p/400/400?q=amazon%20product`

                // Content Scrubber para Amazon
                if (title && link && !link.includes('javascript:')) {
                  items.push({
                    raw_data: {
                      html_title: title,
                      campaign_name_default: `Amazon — ${title.substring(0, 40)}`,
                      detected_description_main: title,
                      category: source.category || options?.category || 'Geral',
                      campaign_rules: 'Consulte regras na Amazon',
                      discount_rules:
                        discount ||
                        (oldPrice
                          ? `De ${oldPrice} por ${price}`
                          : 'Desconto disponível'),
                      detected_money_text_1: price || 'Ver no site',
                      extracted_url: link,
                      extracted_domain: siteDomain,
                      detected_image_1: img,
                      coverage: source.country || region || 'National',
                      validity: 'Tempo limitado / Limited time',
                      source: source.name || 'Amazon',
                    },
                    captured_at: new Date().toISOString(),
                  })
                  foundInSource++
                }
              })
              addLog(`Amazon scraper encontrou: ${foundInSource} ofertas`)
            } else {
              // Generic parser loop
              const offerSelectors = [
                '[class*="offer"]',
                '[class*="promo"]',
                '[class*="deal"]',
                '[class*="discount"]',
                '[class*="campanha"]',
                '[class*="desconto"]',
                'article',
                '.card',
                '[class*="card"]',
                '.product-card',
                '.item',
              ]

              for (const sel of offerSelectors) {
                if (foundInSource > 0 || items.length >= limit) break
                $(sel).each((idx: number, el: any) => {
                  if (items.length >= limit) return
                  const offer = extractOfferFields(
                    $,
                    el,
                    directUrl,
                    source.name || siteDomain,
                  )
                  if (offer) {
                    offer.raw_data.category =
                      source.category || offer.raw_data.category
                    offer.raw_data.coverage =
                      source.country || offer.raw_data.coverage
                    items.push(offer)
                    foundInSource++
                  }
                })
                if (foundInSource > 0) {
                  addLog(`Seletor direto funcionou: ${sel}`, {
                    count: foundInSource,
                  })
                }
              }
            }
          } else {
            addLog(
              `Parceiro bloqueou acesso a ${siteDomain}: HTTP ${directResp.status}`,
            )
          }
        } catch (e: any) {
          addLog(`Erro na extração direta de ${siteDomain}: ${e.message}`)
        }
      }
    }

    if (items.length === 0) {
      throw new Error(
        'Nenhuma oferta real encontrada. As páginas podem estar usando templates vazios ou bloqueando acesso.',
      )
    }

    return new Response(JSON.stringify({ items, debug_info: debugInfo }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error: any) {
    addLog(`Erro geral`, { error_message: error.message })
    return new Response(
      JSON.stringify({ error: error.message, debug_info: debugInfo }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    )
  }
})
