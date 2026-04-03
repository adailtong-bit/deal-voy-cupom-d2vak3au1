import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import * as cheerio from 'npm:cheerio@1.0.0-rc.12'

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

  try {
    const { query, limit = 10, options } = await req.json()
    const actualLimit = Math.min(limit, 50)
    const items = []

    let targetUrl = options?.url || ''

    if (targetUrl) {
      if (!targetUrl.startsWith('http')) {
        targetUrl = 'https://' + targetUrl
      }
      let rawData: Record<string, any> = {}

      try {
        const fetchPage = async (url: string) => {
          const resp = await fetch(url, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            },
          })
          const text = await resp.text()
          return { text, url: resp.url }
        }

        let page = await fetchPage(targetUrl)
        let $ = cheerio.load(page.text)
        let currentUrl = page.url

        let isProduct = false
        if ($('meta[property="og:type"]').attr('content') === 'product')
          isProduct = true
        if ($('meta[property="product:price:amount"]').length > 0)
          isProduct = true
        if (
          currentUrl.includes('/p/') ||
          currentUrl.includes('/dp/') ||
          currentUrl.includes('/produto/') ||
          currentUrl.includes('/item/')
        )
          isProduct = true
        if (
          $('script[type="application/ld+json"]')
            .text()
            .includes('"@type":"Product"')
        )
          isProduct = true

        if (!isProduct) {
          let productLink = ''
          $('a[href]').each((i, el) => {
            if (productLink) return
            const href = $(el).attr('href')
            if (
              href &&
              (href.includes('/p/') ||
                href.includes('/dp/') ||
                href.includes('/produto/') ||
                href.includes('/item/'))
            ) {
              productLink = href
            }
          })

          if (!productLink) {
            $('a[href]').each((i, el) => {
              if (productLink) return
              const href = $(el).attr('href')
              if (
                href &&
                href.startsWith('/') &&
                href.length > 40 &&
                !href.includes('/category/') &&
                !href.includes('/busca')
              ) {
                productLink = href
              }
            })
          }

          if (productLink) {
            try {
              const absoluteUrl = new URL(productLink, currentUrl).href
              page = await fetchPage(absoluteUrl)
              $ = cheerio.load(page.text)
              currentUrl = absoluteUrl
            } catch (e) {}
          }
        }

        // --- Extract all possible data ---

        rawData['extracted_url'] = currentUrl
        try {
          rawData['extracted_domain'] = new URL(currentUrl).hostname
        } catch (e) {}

        rawData['html_title'] = $('title').text().trim()

        const h1 = $('h1').first().text().trim()
        if (h1) rawData['h1_text'] = h1

        // Meta Tags
        $('meta').each((_, el) => {
          const name =
            $(el).attr('name') ||
            $(el).attr('property') ||
            $(el).attr('itemprop')
          const content = $(el).attr('content')
          if (name && content && content.trim() !== '') {
            const key = `meta_${name.replace(/[:\-]/g, '_').toLowerCase()}`
            if (!rawData[key] || rawData[key].length < content.length) {
              rawData[key] = content.trim()
            }
          }
        })

        // Specific Descriptions
        const metaDesc =
          $('meta[name="description"]').attr('content') ||
          $('meta[property="og:description"]').attr('content')
        if (metaDesc) rawData['detected_meta_description'] = metaDesc

        $(
          '#description, .description, #product-description, .product-description, [data-testid="product-description"], #productDescription',
        ).each((i, el) => {
          if (i === 0) {
            const text = $(el).text().trim().replace(/\s+/g, ' ')
            if (text)
              rawData['detected_description_main'] = text.substring(0, 1000)
          }
        })

        let pIndex = 1
        $('p').each((i, el) => {
          if (pIndex <= 3) {
            const text = $(el).text().trim().replace(/\s+/g, ' ')
            if (text.length > 80) {
              rawData[`detected_paragraph_${pIndex}`] = text.substring(0, 500)
              pIndex++
            }
          }
        })

        // Price finding heuristics
        const priceElements = $(
          '[class*="price" i], [id*="price" i], [data-price]',
        )
        let priceIndex = 1
        priceElements.each((i, el) => {
          if (priceIndex <= 5) {
            const text = $(el).text().trim().replace(/\s+/g, ' ')
            if (text && /\d/.test(text) && text.length < 30) {
              rawData[`detected_price_${priceIndex}`] = text
              priceIndex++
            }
          }
        })

        // Image finding heuristics
        let imgIndex = 1
        $('img').each((i, el) => {
          if (imgIndex <= 3) {
            const src = $(el).attr('src') || $(el).attr('data-src')
            const width = $(el).attr('width')
            // Try to find large images
            if (
              src &&
              !src.includes('data:image') &&
              (!width || parseInt(width) > 100)
            ) {
              rawData[`detected_image_${imgIndex}`] = src
              imgIndex++
            }
          }
        })

        // Extract JSON-LD (Schema.org)
        $('script[type="application/ld+json"]').each((i, el) => {
          try {
            const content = $(el).html() || '{}'
            const parsed = JSON.parse(content.trim())

            const extractProduct = (obj: any, prefix: string) => {
              if (!obj) return
              const type = obj['@type']
              if (
                type === 'Product' ||
                type === 'Offer' ||
                type === 'BreadcrumbList'
              ) {
                if (obj.name) rawData[`${prefix}_name`] = obj.name
                if (obj.description)
                  rawData[`${prefix}_description`] = obj.description
                if (obj.image)
                  rawData[`${prefix}_image`] = Array.isArray(obj.image)
                    ? obj.image[0]
                    : obj.image
                if (obj.brand?.name) rawData[`${prefix}_brand`] = obj.brand.name
                if (obj.sku) rawData[`${prefix}_sku`] = obj.sku

                if (obj.offers) {
                  const offer = Array.isArray(obj.offers)
                    ? obj.offers[0]
                    : obj.offers
                  if (offer.price) rawData[`${prefix}_price`] = offer.price
                  if (offer.priceCurrency)
                    rawData[`${prefix}_currency`] = offer.priceCurrency
                  if (offer.url) rawData[`${prefix}_url`] = offer.url
                }
              }
            }

            if (Array.isArray(parsed)) {
              parsed.forEach((p, idx) => extractProduct(p, `jsonld_${idx}`))
            } else if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
              parsed['@graph'].forEach((p, idx) =>
                extractProduct(p, `jsonld_graph_${idx}`),
              )
            } else {
              extractProduct(parsed, `jsonld_${i}`)
            }
          } catch (e) {}
        })

        Object.keys(rawData).forEach((k) => {
          if (!rawData[k]) delete rawData[k]
        })
      } catch (err: any) {
        rawData['error_fetching'] = err.message
        rawData['extracted_url'] = targetUrl
      }

      items.push({
        raw_data: rawData,
        captured_at: new Date().toISOString(),
      })

      return new Response(JSON.stringify({ items }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Default mock behavior for other queries
    for (let i = 0; i < actualLimit; i++) {
      const originalPrice = Math.floor(Math.random() * 500) + 150
      const currentPrice =
        originalPrice - (Math.floor(Math.random() * (originalPrice * 0.5)) + 10)
      const calculatedDiscountPct = Math.round(
        ((originalPrice - currentPrice) / originalPrice) * 100,
      )

      const productName =
        query && query !== 'ofertas' && query !== 'all'
          ? `${query} Modelo ${i + 1}`
          : `Produto Exclusivo ${i + 1}`

      items.push({
        title: productName,
        campaign_name: `Busca Orgânica`,
        description: `Oferta encontrada: ${productName}. Aproveite os benefícios exclusivos desta promoção.`,
        price: parseFloat(currentPrice.toFixed(2)),
        original_price: originalPrice,
        currency: 'BRL',
        discount: `${calculatedDiscountPct}% OFF`,
        discount_percentage: calculatedDiscountPct,
        image_url: `https://img.usecurling.com/p/400/400?q=${encodeURIComponent(options?.category || 'product')}&dpr=2`,
        product_link: `https://example.com/dp/${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
        source_url: `https://example.com`,
        store_name: 'Store',
        category: options?.category || 'Eletrônicos',
        coverage: 'toda a rede',
        discount_rules: 'percentual',
        country: options?.country || 'Brasil',
        status: 'pending',
        captured_at: new Date().toISOString(),
      })
    }

    return new Response(JSON.stringify({ items }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
