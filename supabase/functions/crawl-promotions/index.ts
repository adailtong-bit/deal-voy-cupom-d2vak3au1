import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import * as cheerio from 'npm:cheerio@1.0.0-rc.12';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let debugInfo: any = { logs: [], target_url: '', final_url: '', status: null, html_snippet: '' };
  const addLog = (msg: string, data?: any) => {
    debugInfo.logs.push({ time: new Date().toISOString(), msg, data });
  };

  try {
    const { query, limit = 10, options } = await req.json();
    const items = [];
    
    let targetUrl = options?.url || '';
    debugInfo.target_url = targetUrl;

    if (targetUrl) {
      if (!targetUrl.startsWith('http')) {
        targetUrl = 'https://' + targetUrl;
      }
      debugInfo.target_url = targetUrl;
      addLog('Iniciando extração', { url: targetUrl });
      
      let rawData: Record<string, any> = {};
      
      try {
        const fetchPage = async (url: string) => {
           addLog(`Fazendo requisição HTTP GET`, { url });
           const resp = await fetch(url, {
             headers: {
               'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
               'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
               'Accept-Language': 'en-US,en;q=0.9',
               'Sec-Ch-Ua': '"Chromium";v="122", "Google Chrome";v="122", "Not-A.Brand";v="99"',
               'Sec-Ch-Ua-Mobile': '?0',
               'Sec-Ch-Ua-Platform': '"Windows"'
             }
           });
           const text = await resp.text();
           addLog(`Resposta recebida`, { status: resp.status, final_url: resp.url, text_length: text.length });
           return { text, url: resp.url, status: resp.status };
        };

        let page;
        try {
          page = await fetchPage(targetUrl);
        } catch (fetchErr: any) {
          addLog(`Falha na requisição de rede`, { error: fetchErr.message });
          throw new Error(`Falha de conexão com o site: ${fetchErr.message}`);
        }

        debugInfo.status = page.status;
        debugInfo.final_url = page.url;
        debugInfo.html_snippet = page.text.substring(0, 500) + '...';

        let $ = cheerio.load(page.text);
        let currentUrl = page.url;

        let isProduct = false;
        if ($('meta[property="og:type"]').attr('content') === 'product') isProduct = true;
        if ($('meta[property="product:price:amount"]').length > 0) isProduct = true;
        if (currentUrl.includes('/p/') || currentUrl.includes('/dp/') || currentUrl.includes('/produto/') || currentUrl.includes('/item/') || currentUrl.includes('/ip/')) isProduct = true;
        if ($('script[type="application/ld+json"]').text().includes('"@type":"Product"')) isProduct = true;

        if (!isProduct) {
           let productLink = '';
           $('a[href]').each((i, el) => {
             if (productLink) return;
             const href = $(el).attr('href');
             if (href && (href.includes('/p/') || href.includes('/dp/') || href.includes('/produto/') || href.includes('/item/') || href.includes('/ip/'))) {
               productLink = href;
             }
           });
           
           if (!productLink) {
             $('a[href]').each((i, el) => {
               if (productLink) return;
               const href = $(el).attr('href');
               if (href && href.startsWith('/') && href.length > 40 && !href.includes('/category/') && !href.includes('/busca')) {
                 productLink = href;
               }
             });
           }

           if (productLink) {
             try {
                const absoluteUrl = new URL(productLink, currentUrl).href;
                page = await fetchPage(absoluteUrl);
                $ = cheerio.load(page.text);
                currentUrl = absoluteUrl;
             } catch(e) {}
           }
        }

        // Check for anti-bot blocks
        const pageTitle = $('title').text().toLowerCase();
        const isBlocked = page.status === 403 || page.status === 429 || pageTitle.includes('robot') || pageTitle.includes('verify') || pageTitle.includes('captcha') || pageTitle.includes('security') || pageTitle.includes('blocked') || pageTitle.includes('distil');

        if (isBlocked) {
            addLog(`Bloqueio anti-bot detectado`, { status: page.status, title: pageTitle });
            throw new Error(`Acesso bloqueado pelo site de destino (Status HTTP: ${page.status}). Título da página: "${$('title').text()}". O site está utilizando proteção anti-bot que impede a leitura automatizada.`);
        }
        
        addLog(`Página carregada com sucesso`, { is_product_page: isProduct, title: pageTitle });

        // --- Extract all possible data ---
        
        rawData['extracted_url'] = currentUrl;
        try { 
            const urlObj = new URL(currentUrl);
            rawData['extracted_domain'] = urlObj.hostname; 
            rawData['partner_url'] = urlObj.origin;
        } catch(e) {}
        
        rawData['campaign_name_default'] = 'Busca organica';
        rawData['html_title'] = $('title').text().trim();
        
        const h1 = $('h1').first().text().trim();
        if (h1) rawData['h1_text'] = h1;

        // Meta Tags
        $('meta').each((_, el) => {
          const name = $(el).attr('name') || $(el).attr('property') || $(el).attr('itemprop');
          const content = $(el).attr('content');
          if (name && content && content.trim() !== '') {
            const key = `meta_${name.replace(/[:\-]/g, '_').toLowerCase()}`;
            if (!rawData[key] || rawData[key].length < content.length) {
               rawData[key] = content.trim();
            }
          }
        });

        // Specific Descriptions
        const metaDesc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content');
        if (metaDesc) rawData['detected_meta_description'] = metaDesc;

        $('#description, .description, [class*="description" i], #product-description, .product-description, [data-testid="product-description"], #productDescription').each((i, el) => {
           if (i === 0) {
             const text = $(el).text().trim().replace(/\s+/g, ' ');
             if (text && text.length > 20) rawData['detected_description_main'] = text.substring(0, 1000);
           }
        });

        let pIndex = 1;
        $('p').each((i, el) => {
           if (pIndex <= 3) {
             const text = $(el).text().trim().replace(/\s+/g, ' ');
             if (text.length > 80) {
                rawData[`detected_paragraph_${pIndex}`] = text.substring(0, 500);
                pIndex++;
             }
           }
        });

        // Price finding heuristics
        const priceElements = $('[class*="price" i], [id*="price" i], [data-price], [class*="discount" i], [class*="savings" i], [class*="savings" i], *:contains("You save"), *:contains("was $")');
        let priceIndex = 1;
        priceElements.each((i, el) => {
           if (priceIndex <= 20) {
             const text = $(el).text().trim().replace(/\s+/g, ' ');
             if (text && /\d/.test(text) && text.length < 150) {
               const exists = Object.values(rawData).some(v => v === text);
               if (!exists) {
                 rawData[`detected_money_text_${priceIndex}`] = text;
                 priceIndex++;
               }
             }
           }
        });
        
        // Dollar/Currency sign heuristics
        const moneySymbols = $('*:contains("$"), *:contains("R$"), *:contains("€")').filter((i, el) => {
            return $(el).children().length < 3 && $(el).text().trim().length > 0;
        });
        let mIdx = 1;
        moneySymbols.each((i, el) => {
            if (mIdx <= 10) {
                const text = $(el).text().replace(/\s+/g, ' ').trim();
                if (text.length > 0 && text.length < 100) {
                    rawData[`detected_currency_block_${mIdx}`] = text;
                    mIdx++;
                }
            }
        });

        // Image finding heuristics
        let imgIndex = 1;
        $('img').each((i, el) => {
           if (imgIndex <= 10) {
             const src = $(el).attr('src') || $(el).attr('data-src');
             const width = $(el).attr('width');
             if (src && !src.includes('data:image') && (!width || parseInt(width) > 100)) {
               rawData[`detected_image_${imgIndex}`] = src;
               imgIndex++;
             }
           }
        });

        // Application/json extraction (React/Next.js/etc)
        $('script[type="application/json"], script[id="__NEXT_DATA__"]').each((i, el) => {
           try {
             const content = $(el).html() || '{}';
             if (content.length > 1000000) return; // Skip if extremely large
             const parsed = JSON.parse(content.trim());
             
             let found = 0;
             const searchObj = (obj: any, path: string = '') => {
                if (found > 100) return;
                if (!obj || typeof obj !== 'object') return;
                
                for (const [k, v] of Object.entries(obj)) {
                  if (typeof v === 'string' || typeof v === 'number') {
                     const kl = k.toLowerCase();
                     if (kl.includes('price') || kl.includes('title') || kl.includes('description') || kl.includes('imageurl') || kl.includes('currency') || kl.includes('discount') || kl.includes('savings')) {
                        const strV = String(v);
                        if (strV.length > 0 && strV.length < 1000) {
                           rawData[`json_data_${path ? path + '_' : ''}${k}`] = v;
                           found++;
                        }
                     }
                  } else if (typeof v === 'object' && v !== null && path.split('_').length < 4) {
                     searchObj(v, path ? `${path}_${k}` : k);
                  }
                }
             };
             searchObj(parsed);
           } catch(e) {}
        });

        // Extract JSON-LD (Schema.org)
        $('script[type="application/ld+json"]').each((i, el) => {
           try {
             const content = $(el).html() || '{}';
             const parsed = JSON.parse(content.trim());
             
             const extractProduct = (obj: any, prefix: string) => {
               if (!obj) return;
               const type = obj['@type'];
               if (type === 'Product' || type === 'Offer' || type === 'BreadcrumbList') {
                 if (obj.name) rawData[`${prefix}_name`] = obj.name;
                 if (obj.description) rawData[`${prefix}_description`] = obj.description;
                 if (obj.image) rawData[`${prefix}_image`] = Array.isArray(obj.image) ? obj.image[0] : obj.image;
                 if (obj.brand?.name) rawData[`${prefix}_brand`] = obj.brand.name;
                 if (obj.sku) rawData[`${prefix}_sku`] = obj.sku;
                 
                 if (obj.offers) {
                   const offer = Array.isArray(obj.offers) ? obj.offers[0] : obj.offers;
                   if (offer.price) rawData[`${prefix}_price`] = offer.price;
                   if (offer.priceCurrency) rawData[`${prefix}_currency`] = offer.priceCurrency;
                   if (offer.url) rawData[`${prefix}_url`] = offer.url;
                 }
               }
             };

             if (Array.isArray(parsed)) {
               parsed.forEach((p, idx) => extractProduct(p, `jsonld_${idx}`));
             } else if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
               parsed['@graph'].forEach((p, idx) => extractProduct(p, `jsonld_graph_${idx}`));
             } else {
               extractProduct(parsed, `jsonld_${i}`);
             }
           } catch(e) {}
        });

        Object.keys(rawData).forEach(k => {
          if (!rawData[k]) delete rawData[k];
        });

      } catch (err: any) {
        throw new Error(`Erro na extração: ${err.message}`);
      }

      if (Object.keys(rawData).length > 0) {
        items.push({
          raw_data: rawData,
          captured_at: new Date().toISOString()
        });
      }
    }

    if (items.length === 0) {
      if (!targetUrl) {
        throw new Error('Nenhuma URL fornecida. A extração real exige uma URL específica.');
      } else {
        throw new Error('A página foi acessada, mas nenhum dado pôde ser extraído da estrutura HTML fornecida.');
      }
    }

    addLog(`Extração concluída com sucesso`, { items_extracted: items.length });

    return new Response(JSON.stringify({ items, debug_info: debugInfo }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error: any) {
    addLog(`Erro capturado na execução`, { error_message: error.message });
    // Retornamos 200 para garantir que o cliente (frontend) receba o JSON com o debug_info
    // em vez de uma exceção genérica do supabase sdk (FunctionsHttpError)
    return new Response(JSON.stringify({ error: error.message, debug_info: debugInfo }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
