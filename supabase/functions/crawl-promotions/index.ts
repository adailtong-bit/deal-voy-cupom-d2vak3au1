import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import * as cheerio from 'cheerio'

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

  const offerTerms = [
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

  let url = $(el).find('a[href]').first().attr('href') || fallbackUrl
  if (url && !url.startsWith('http')) url = fallbackUrl

  const description = $(el)
    .find('[class*="desc"], [class*="snippet"], p, span')
    .first()
    .text()
    .trim()

  const image =
    $(el).find('img').first().attr('src') ||
    $(el).find('img').first().attr('data-src') ||
    undefined

  const bodyText = $(el).text()

  const discountMatch = bodyText.match(
    /(\d+\s*%\s*(?:off|de desconto|desconto))|(?:R\$|€|\$)\s*\d+(?:[.,]\d{2})?/,
  )
  const discount = discountMatch ? discountMatch[0] : undefined

  const validityMatch = bodyText.match(
    /válid[oa] até\s*[\d\/]+|expira em\s*[\d\/]+|até\s*\d{2}\/\d{2}/,
  )
  const validity = validityMatch ? validityMatch[0] : undefined

  const regionMatch = bodyText.match(
    /nacional|todo[s]? o brasil|são paulo|rio de janeiro|[A-Z]{2}\b/,
  )
  const coverage = regionMatch ? regionMatch[0] : 'Nacional'

  const categoryKeywords: Record<string, string[]> = {
    Viagem: ['hotel', 'voo', 'viagem', 'hospedagem', 'resort', 'turismo'],
    Alimentação: ['restaurante', 'delivery', 'comida', 'ifood', 'pizza'],
    Moda: ['roupa', 'moda', 'calçado', 'tênis', 'vestido'],
    Tecnologia: ['celular', 'notebook', 'tv', 'eletrônico', 'smartphone'],
    Serviços: ['plano', 'assinatura', 'serviço', 'app', 'streaming'],
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

  if (!title || !url.startsWith('http')) return null

  return {
    raw_data: {
      html_title: title,
      campaign_name_default: `${sourceName} — ${title.substring(0, 40)}`,
      detected_description_main: description || title,
      category: detectedCategory,
      campaign_rules: validity
        ? `Válido: ${validity}`
        : 'Consulte o parceiro para regras',
      discount_rules: discount || 'Desconto disponível — consulte o site',
      detected_money_text_1: discount,
      extracted_url: url,
      extracted_domain: extractedDomain,
      detected_image_1: image,
      coverage: coverage,
      validity: validity || 'Tempo limitado',
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
    let region = options?.region || ''
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
      const searchFormData = new URLSearchParams()
      searchFormData.append('q', searchQuery)
      searchFormData.append('kl', 'br-pt')
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

            let rawUrl = $search(el).find('a[href]').first().attr('href') || ''
            if (rawUrl.includes('uddg=')) {
              const match = rawUrl.match(/uddg=([^&]+)/)
              if (match) rawUrl = decodeURIComponent(match[1])
            }

            const offer = extractOfferFields(
              $search,
              el,
              rawUrl,
              siteDomain || 'Busca Orgânica',
            )
            if (offer) items.push(offer)
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
        const bingUrl = `https://www.bing.com/search?q=${encodeURIComponent(searchQuery)}&cc=BR&setlang=pt-BR`
        const bingResp = await fetch(bingUrl, {
          headers: { ...browserHeaders, Referer: 'https://www.bing.com/' },
        })

        addLog(`Bing status: ${bingResp.status}`)

        if (bingResp.ok) {
          const bingHtml = await bingResp.text()
          const $bing = cheerio.load(bingHtml)

          $bing('.b_algo').each((i: number, el: any) => {
            if (items.length >= limit) return
            const rawUrl = $bing(el).find('h2 a').attr('href') || ''
            const offer = extractOfferFields(
              $bing,
              el,
              rawUrl,
              siteDomain || 'Bing',
            )
            if (offer) items.push(offer)
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

      try {
        const directResp = await fetch(directUrl, {
          headers: { ...browserHeaders, Referer: `https://${siteDomain}/` },
        })

        addLog(`Extração direta status: ${directResp.status}`)

        if (directResp.ok) {
          const html = await directResp.text()
          const $ = cheerio.load(html)

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
