import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query, limit = 10, options } = await req.json();

    const actualLimit = Math.min(limit, 50); // cap at 50
    const items = [];
    
    const targetUrl = options?.url || '';

    // Extracao Real (Real scraping for mapping)
    if (targetUrl) {
      let rawData: Record<string, any> = {};
      try {
        const resp = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
          }
        });
        const html = await resp.text();
        
        // Extract Title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) rawData['html_title'] = titleMatch[1].trim();
        
        // Extract Meta Tags
        const metaTags = html.match(/<meta[^>]+>/g) || [];
        metaTags.forEach(tag => {
          const nameMatch = tag.match(/(?:name|property)="([^"]+)"/i);
          const contentMatch = tag.match(/content="([^"]+)"/i);
          if (nameMatch && contentMatch) {
            const key = nameMatch[1].replace(/:/g, '_').toLowerCase();
            if (!rawData[key] || contentMatch[1].trim() !== '') {
               rawData[key] = contentMatch[1].trim();
            }
          }
        });

        // Extract JSON-LD (Schema.org)
        const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/ig) || [];
        jsonLdMatches.forEach((script) => {
           try {
             const contentMatch = script.match(/>([\s\S]*?)</);
             if (contentMatch && contentMatch[1]) {
               const parsed = JSON.parse(contentMatch[1].trim());
               
               const extractProduct = (obj: any) => {
                 if (!obj) return;
                 if (obj['@type'] === 'Product' || obj['@type'] === 'Offer') {
                   if (obj.name) rawData['jsonld_name'] = obj.name;
                   if (obj.description) rawData['jsonld_description'] = obj.description;
                   if (obj.image) rawData['jsonld_image'] = Array.isArray(obj.image) ? obj.image[0] : obj.image;
                   if (obj.brand?.name) rawData['jsonld_brand'] = obj.brand.name;
                   
                   if (obj.offers) {
                     const offer = Array.isArray(obj.offers) ? obj.offers[0] : obj.offers;
                     if (offer.price) rawData['jsonld_price'] = offer.price;
                     if (offer.priceCurrency) rawData['jsonld_currency'] = offer.priceCurrency;
                     if (offer.url) rawData['jsonld_url'] = offer.url;
                   }
                 }
               };

               if (Array.isArray(parsed)) {
                 parsed.forEach(extractProduct);
               } else if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
                 parsed['@graph'].forEach(extractProduct);
               } else {
                 extractProduct(parsed);
               }
             }
           } catch(e) {
             console.error("Error parsing JSON-LD", e);
           }
        });

        rawData['extracted_url'] = targetUrl;
        
        try {
          rawData['extracted_domain'] = new URL(targetUrl).hostname;
        } catch(e) {}
        
      } catch (err: any) {
        rawData['error_fetching'] = err.message;
        rawData['extracted_url'] = targetUrl;
      }

      items.push({
        raw_data: rawData,
        captured_at: new Date().toISOString()
      });

      return new Response(JSON.stringify({ items }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Default mock behavior for other queries
    for (let i = 0; i < actualLimit; i++) {
      const originalPrice = Math.floor(Math.random() * 500) + 150;
      const currentPrice = originalPrice - (Math.floor(Math.random() * (originalPrice * 0.5)) + 10);
      const calculatedDiscountPct = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
      
      const productName = query && query !== 'ofertas' && query !== 'all' 
        ? `${query} Modelo ${i + 1}` 
        : `Produto Exclusivo ${i + 1}`;

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
        captured_at: new Date().toISOString()
      });
    }

    return new Response(JSON.stringify({ items }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
