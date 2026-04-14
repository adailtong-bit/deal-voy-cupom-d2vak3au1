import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

async function fetchAffiliateDeals(
  query: string,
  affiliateIds: Record<string, string>,
) {
  // Mocking external affiliate API (CJ, Rakuten, Awin, Amazon)
  const basePrice = Math.floor(Math.random() * 100) + 50

  const amazonId = affiliateIds?.amazon || 'routevoy_amz'
  const aliexpressId = affiliateIds?.aliexpress || 'routevoy_ali'
  const shopeeId = affiliateIds?.shopee || 'routevoy_shp'

  return [
    {
      title: `Oferta Especial Afiliado: ${query} (Amazon)`,
      price: `$${basePrice}`,
      oldPrice: `$${basePrice + 20}`,
      link: `https://amazon.com/dp/B08N5WRWNW?tag=${amazonId}`,
      image: `https://img.usecurling.com/p/400/400?q=${encodeURIComponent(query)}`,
      source: 'affiliate',
      commission: 8, // %
    },
    {
      title: `${query} com Desconto Exclusivo (AliExpress)`,
      price: `$${basePrice - 15}`,
      oldPrice: `$${basePrice + 15}`,
      link: `https://aliexpress.com/item/100500.html?aff_id=${aliexpressId}`,
      image: `https://img.usecurling.com/p/400/400?q=${encodeURIComponent(query)}&color=red`,
      source: 'affiliate',
      commission: 12, // %
    },
    {
      title: `Promoção Parceiro: ${query} (Shopee)`,
      price: `$${basePrice - 5}`,
      oldPrice: `$${basePrice + 10}`,
      link: `https://shopee.com/product/123/456?aff_id=${shopeeId}`,
      image: `https://img.usecurling.com/p/400/400?q=${encodeURIComponent(query)}&color=orange`,
      source: 'affiliate',
      commission: 10, // %
    },
  ]
}

function parsePrice(priceStr: string) {
  if (!priceStr) return 0
  return parseFloat(priceStr.replace(/[^0-9.]/g, ''))
}

function calculateDiscountValue(price: number, oldPrice: number) {
  if (!price || !oldPrice || oldPrice <= price) return 0
  return ((oldPrice - price) / oldPrice) * 100
}

function enrichDeals(deals: any[]) {
  return deals.map((item) => {
    const price = parsePrice(item.price)
    const oldPrice = parsePrice(item.oldPrice)
    const discountValue = calculateDiscountValue(price, oldPrice)

    return {
      ...item,
      price_value: price,
      old_price_value: oldPrice,
      discount_value: discountValue,
      discount: discountValue ? discountValue.toFixed(0) + '%' : null,
      commission: item.commission || Math.random() * 10,
    }
  })
}

function normalize(value: number, max: number) {
  if (!value || !max) return 0
  return value / max
}

function rankDeals(deals: any[]) {
  const maxDiscount = Math.max(...deals.map((d) => d.discount_value || 0), 1)
  const maxCommission = Math.max(...deals.map((d) => d.commission || 0), 1)

  const ranked = deals.map((deal) => {
    const discountScore = normalize(deal.discount_value, maxDiscount)
    const commissionScore = normalize(deal.commission, maxCommission)
    const priceScore = deal.price_value ? 1 / deal.price_value : 0

    const score = discountScore * 0.5 + commissionScore * 0.3 + priceScore * 0.2

    return { ...deal, score }
  })

  return ranked.sort((a, b) => b.score - a.score)
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, limit = 10, affiliateIds = {} } = await req.json()

    const affiliateDeals = query
      ? await fetchAffiliateDeals(query, affiliateIds)
      : []
    const enriched = enrichDeals(affiliateDeals)
    const ranked = rankDeals(enriched)

    // Map to DiscoveredPromotion format
    const mapped = ranked.slice(0, limit).map((r) => ({
      id: crypto.randomUUID(),
      title: r.title,
      description: `Oferta parceira com ${r.discount_value.toFixed(0)}% OFF. Recomendação inteligente (Score: ${r.score.toFixed(2)}) baseada no seu interesse.`,
      price: r.price_value,
      originalPrice: r.old_price_value,
      discount: r.discount,
      discountPercentage: r.discount_value,
      imageUrl: r.image,
      productLink: r.link,
      storeName: r.title.includes('Amazon')
        ? 'Amazon'
        : r.title.includes('AliExpress')
          ? 'AliExpress'
          : 'Parceiro Afiliado',
      status: 'approved',
      category: 'affiliate',
      currency: 'USD',
      matchConfidence: r.score,
    }))

    return new Response(
      JSON.stringify({ items: mapped, total: mapped.length }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
