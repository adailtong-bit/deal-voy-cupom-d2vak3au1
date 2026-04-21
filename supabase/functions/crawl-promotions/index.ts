import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import * as cheerio from 'npm:cheerio'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

const browserHeaders = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
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
      .find('h2, h3, .title, [class*="title"], [class*="name"]')
      .first()
      .text()
      .trim() || $(el).find('a').first().text().trim()

  let url = ''
  const links: string[] = []
  $(el)
    .find('a[href]')
    .each((_: number, a: any) => {
      const href = $(a).attr('href')
      if (href) links.push(href)
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

  const discountMatch = bodyText.match(
    /(\d+\s*%\s*(?:off|de desconto|desconto))|(?:R\$|€|\$)\s*\d+(?:[.,]\d{2})?/,
  )
  const discount = discountMatch ? discountMatch[0] : undefined

  const validityMatch = bodyText.match(
    /válid[oa] até\s*[\d\/]+|expira em\s*[\d\/]+|até\s*\d{2}\/\d{2}|valid until\s*[\d\/]+|expires\s*[\d\/]+/,
  )
  const validity = validityMatch ? validityMatch[0] : undefined

  // Content validation: Ensure there is at least some indication of a real offer/product
  // If we can't find any price, discount, or clear call to action, we skip it
  const ctaMatch = bodyText.match(
    /comprar|buy now|add to cart|adicionar ao carrinho|shop now|shop sale|get deal|resgatar/i,
  )

  if (!discount && !ctaMatch && !title.match(/\d+%/)) {
    return null
  }

  const regionMatch = bodyText.match(
    /nacional|todo[s]? o brasil|são paulo|rio de janeiro|nationwide|[A-Z]{2}\b/,
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
      discount_rules: discount || 'Desconto disponível / Discount available',
      detected_money_text_1: discount,
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
    const { query, limit = 10, options } = await req.json()
    const items: any[] = []

    let targetUrl = options?.url || ''
    let region = options?.region || options?.country || ''
    debugInfo.target_url = targetUrl

    let siteDomain = ''
    if (targetUrl && targetUrl !== 'all') {
      try {
        const urlObj = new URL(
          targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`,
        )
        siteDomain = urlObj.hostname
      } catch (e) {
        siteDomain = targetUrl.replace(/^https?:\/\//, '').split('/')[0]
      }
    }

    const searchQuery = buildSearchQuery({
      query,
      siteDomain,
      category: options?.category,
      region,
    })

    addLog('Query qualificada montada', { searchQuery })

    // TENTATIVA 1: DuckDuckGo
    try {
      const isUS =
        region.toLowerCase().includes('us') ||
        region.toLowerCase().includes('usa') ||
        region.toLowerCase().includes('eua') ||
        targetUrl.includes('.com/us') ||
        targetUrl.includes('.us/')
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
            addLog(`Seletor DDG funcionou: ${sel}`, { count: found.length })
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
              siteDomain || 'Busca Orgânica',
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

    // TENTATIVA 2: Bing
    if (items.length === 0) {
      addLog('Tentando Bing')
      try {
        const isUS =
          region.toLowerCase().includes('us') ||
          region.toLowerCase().includes('usa') ||
          region.toLowerCase().includes('eua') ||
          targetUrl.includes('.com/us') ||
          targetUrl.includes('.us/')
        const bingUrl = isUS
          ? `https://www.bing.com/search?q=${encodeURIComponent(searchQuery)}&cc=US&setlang=en-US`
          : `https://www.bing.com/search?q=${encodeURIComponent(searchQuery)}&cc=BR&setlang=pt-BR`
        const bingResp = await fetch(bingUrl, {
          headers: { ...browserHeaders, Referer: 'https://www.bing.com/' },
        })

        addLog(`Bing status: ${bingResp.status}`)

        if (bingResp.ok) {
          const bingHtml = await bingResp.text()
          const $bing = cheerio.load(bingHtml)

          $bing('.b_algo').each((i: number, el: any) => {
            if (items.length >= limit) return
            let rawUrl =
              $bing(el).find('h2 a').attr('href') ||
              $bing(el).find('a[href]').first().attr('href') ||
              ''

            if (rawUrl.startsWith('//')) {
              rawUrl = 'https:' + rawUrl
            } else if (rawUrl.startsWith('/')) {
              rawUrl = 'https://www.bing.com' + rawUrl
            }

            const offer = extractOfferFields(
              $bing,
              el,
              rawUrl,
              siteDomain || 'Bing',
            )
            if (offer && !offer.raw_data.extracted_url.includes('bing.com')) {
              items.push(offer)
            }
          })

          addLog(`Bing encontrou: ${items.length} ofertas`)
        }
      } catch (e: any) {
        addLog(`Erro no Bing: ${e.message}`)
      }
    }

    // TENTATIVA 3: Extração direta no parceiro
    if (items.length === 0 && targetUrl && targetUrl !== 'all') {
      addLog('Tentando extração direta', { url: targetUrl })
      const directUrl = targetUrl.startsWith('http')
        ? targetUrl
        : `https://${targetUrl}`
      const isAmazon = siteDomain.includes('amazon')

      const amazonHeaders = {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        Referer: 'https://www.amazon.com/',
      }

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)

        const directResp = await fetch(directUrl, {
          headers: isAmazon
            ? amazonHeaders
            : { ...browserHeaders, Referer: `https://${siteDomain}/` },
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        addLog(`Extração direta status: ${directResp.status}`)

        if (directResp.ok) {
          const html = await directResp.text()
          const $ = cheerio.load(html)

          if (isAmazon) {
            addLog('Iniciando parsing específico da Amazon')

            // Pega os cards de promoção conforme script python do usuário adaptado para cheerio
            const itemsList = $(
              'div[data-component-type="s-search-result"], [class*="DealGridItem"], .sg-col-inner, .a-carousel-card',
            )

            itemsList.each((i: number, el: any) => {
              if (items.length >= limit) return

              const title =
                $(el)
                  .find(
                    'span.a-size-base-plus, h2, [class*="dealTitle"], .a-truncate-cut',
                  )
                  .first()
                  .text()
                  .trim() || 'Sem título'
              const price =
                $(el)
                  .find(
                    'span.a-price, span.a-price-whole, [class*="priceBlock"]',
                  )
                  .first()
                  .text()
                  .trim() || 'Preço não encontrado'
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
                  : `https://www.amazon.com${href}`
                : ''

              const img =
                $(el).find('img').first().attr('src') ||
                `https://img.usecurling.com/p/400/400?q=amazon%20product`

              if (
                title &&
                title !== 'Sem título' &&
                link &&
                !link.includes('javascript:')
              ) {
                items.push({
                  raw_data: {
                    html_title: title,
                    campaign_name_default: `Amazon — ${title.substring(0, 40)}`,
                    detected_description_main: title,
                    category: options?.category || 'Geral',
                    campaign_rules: 'Consulte regras na Amazon',
                    discount_rules:
                      discount ||
                      (oldPrice
                        ? `De ${oldPrice} por ${price}`
                        : 'Desconto disponível'),
                    detected_money_text_1: price,
                    extracted_url: link,
                    extracted_domain: 'amazon.com',
                    detected_image_1: img,
                    coverage: region || 'National',
                    validity: 'Tempo limitado / Limited time',
                    source: 'Amazon',
                  },
                  captured_at: new Date().toISOString(),
                })
              }
            })

            addLog(`Amazon scraper encontrou: ${items.length} ofertas`)
          } else {
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
            ]

            for (const sel of offerSelectors) {
              if (items.length >= limit) break
              $(sel).each((i: number, el: any) => {
                if (items.length >= limit) return
                const offer = extractOfferFields($, el, directUrl, siteDomain)
                if (offer) items.push(offer)
              })
              if (items.length > 0) {
                addLog(`Seletor direto funcionou: ${sel}`, {
                  count: items.length,
                })
                break
              }
            }
          }
        } else {
          addLog(`Parceiro bloqueou: HTTP ${directResp.status}`)
        }
      } catch (e: any) {
        addLog(`Erro na extração direta: ${e.message}`)
      }
    }

    if (items.length === 0) {
      throw new Error(
        'Nenhuma oferta encontrada. Verifique se o parceiro tem promoções ativas ou tente uma query diferente.',
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
