import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import * as cheerio from 'npm:cheerio'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let debugInfo: any = {
    logs: [],
    target_url: '',
    final_url: '',
    status: null,
  }
  const addLog = (msg: string, data?: any) => {
    debugInfo.logs.push({ time: new Date().toISOString(), msg, data })
  }

  try {
    const { query, limit = 10, options } = await req.json()
    const items: any[] = []

    let targetUrl = options?.url || ''
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

    let searchQuery = query || 'ofertas'
    if (siteDomain) {
      searchQuery += ` site:${siteDomain}`
    }
    if (options?.category && options.category !== 'all') {
      searchQuery += ` ${options.category}`
    }

    addLog('Iniciando Busca Orgânica (Sem dados fictícios)', {
      query: searchQuery,
    })

    const searchFormData = new URLSearchParams()
    searchFormData.append('q', searchQuery)

    const searchResp = await fetch('https://html.duckduckgo.com/html/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      body: searchFormData.toString(),
    })

    if (!searchResp.ok) {
      addLog(`Erro HTTP na busca DuckDuckGo: ${searchResp.status}`)
    } else {
      const searchHtml = await searchResp.text()
      const $search = cheerio.load(searchHtml)

      $search('.result').each((i, el) => {
        if (items.length >= limit) return

        const titleEl = $search(el).find('.result__title a')
        const title = titleEl.text().trim()
        let rawUrl = titleEl.attr('href') || ''

        if (rawUrl.includes('uddg=')) {
          const match = rawUrl.match(/uddg=([^&]+)/)
          if (match) rawUrl = decodeURIComponent(match[1])
        }

        const snippet = $search(el).find('.result__snippet').text().trim()

        if (title && rawUrl.startsWith('http')) {
          const priceMatch = snippet.match(/(?:R\$|€|\$)\s*\d+(?:[.,]\d{2})?/)
          const priceText = priceMatch ? priceMatch[0] : undefined

          let extractedDomain = ''
          try {
            extractedDomain = new URL(rawUrl).hostname
          } catch (e) {}

          let price = null
          if (priceText) {
            const numStr = priceText.replace(/[^0-9,.]/g, '').replace(',', '.')
            price = parseFloat(numStr)
            if (isNaN(price)) price = null
          }

          items.push({
            title: title.substring(0, 255),
            description: snippet,
            product_link: rawUrl,
            source_url: rawUrl,
            store_name: extractedDomain,
            campaign_name: siteDomain
              ? `Busca na fonte: ${siteDomain}`
              : 'Busca Multi-fontes Orgânica',
            price: price,
            currency: priceText?.includes('€')
              ? 'EUR'
              : priceText?.includes('$') && !priceText.includes('R$')
                ? 'USD'
                : 'BRL',
            status: 'pending',
            category:
              options?.category && options.category !== 'all'
                ? options.category
                : 'geral',
            captured_at: new Date().toISOString(),
          })
        }
      })
    }

    addLog(`Busca multi-fontes concluída`, { items_encontrados: items.length })

    if (items.length === 0 && targetUrl && targetUrl !== 'all') {
      addLog('Nenhum resultado na busca. Tentando extração direta da página', {
        url: targetUrl,
      })
      let directUrl = targetUrl.startsWith('http')
        ? targetUrl
        : `https://${targetUrl}`

      try {
        const directResp = await fetch(directUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            Accept: 'text/html',
          },
        })

        if (directResp.ok) {
          const html = await directResp.text()
          const $ = cheerio.load(html)
          let rawData: Record<string, any> = {
            extracted_url: directResp.url,
            extracted_domain: new URL(directResp.url).hostname,
            campaign_name_default: 'Busca Orgânica Direta',
            html_title: $('title').text().trim() || siteDomain,
          }

          const metaDesc =
            $('meta[name="description"]').attr('content') ||
            $('meta[property="og:description"]').attr('content')

          const priceRegex = /(?:R\$|€|\$)\s*\d+(?:[.,]\d{2})?/
          const bodyText = $('body').text()
          const priceMatch = bodyText.match(priceRegex)

          let price = null
          let priceText = undefined
          if (priceMatch) {
            priceText = priceMatch[0]
            const numStr = priceText.replace(/[^0-9,.]/g, '').replace(',', '.')
            price = parseFloat(numStr)
            if (isNaN(price)) price = null
          }

          const ogImage = $('meta[property="og:image"]').attr('content')

          items.push({
            title: (
              $('title').text().trim() ||
              siteDomain ||
              'Busca Direta'
            ).substring(0, 255),
            description: metaDesc,
            product_link: directResp.url,
            source_url: directResp.url,
            store_name: new URL(directResp.url).hostname,
            campaign_name: 'Busca Orgânica Direta',
            price: price,
            currency: priceText?.includes('€')
              ? 'EUR'
              : priceText?.includes('$') && !priceText.includes('R$')
                ? 'USD'
                : 'BRL',
            image_url: ogImage,
            status: 'pending',
            category:
              options?.category && options.category !== 'all'
                ? options.category
                : 'geral',
            captured_at: new Date().toISOString(),
          })
        } else {
          addLog(`Falha na extração direta: HTTP ${directResp.status}`)
        }
      } catch (e: any) {
        addLog(`Erro na extração direta: ${e.message}`)
      }
    }

    if (items.length === 0) {
      throw new Error(
        'Nenhum dado pôde ser extraído das fontes orgânicas (Sem resultados).',
      )
    }

    return new Response(JSON.stringify({ items, debug_info: debugInfo }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error: any) {
    addLog(`Erro capturado na execução`, { error_message: error.message })
    return new Response(
      JSON.stringify({ error: error.message, debug_info: debugInfo }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    )
  }
})
