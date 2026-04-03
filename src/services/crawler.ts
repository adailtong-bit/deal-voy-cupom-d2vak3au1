import { supabase } from '@/lib/supabase/client'

export const fetchWebSearchPromotions = async (
  query: string,
  limit: number,
  options?: any,
) => {
  const { data, error } = await supabase.functions.invoke('crawl-promotions', {
    body: { query, limit, options },
  })

  if (error) {
    console.error('Error fetching promotions:', error)
    // fallback to mock data if edge function fails or doesn't exist
    return Array.from({ length: Math.min(limit, 5) }).map((_, i) => ({
      title: `${query} Offer ${i + 1}`,
      description: `Description for ${query} offer`,
      price: Math.floor(Math.random() * 100) + 10,
      image_url: `https://img.usecurling.com/p/400/400?q=${encodeURIComponent(query)}`,
      product_link: `https://example.com/offer/${i}`,
      store_name: 'Mock Store',
      status: 'pending',
      captured_at: new Date().toISOString(),
    }))
  }

  return data?.items || []
}

export const saveDiscoveredPromotion = async (promo: any) => {
  const { data, error } = await supabase
    .from('discovered_promotions')
    .insert([promo])
    .select()
    .single()

  if (error) {
    console.error('Error saving promotion', error)
    throw error
  }
  return data
}

export const saveCrawlerLog = async (log: any) => {
  const { data, error } = await supabase.from('crawler_logs').insert([log])

  if (error) {
    console.error('Error saving log', error)
  }
  return data
}

export const fetchCrawlerPromotions = async (filters?: any) => {
  let query = supabase
    .from('discovered_promotions')
    .select('*')
    .order('captured_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching crawler promotions', error)
    return { data: [] }
  }
  return { data }
}

export const updatePromotionStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('discovered_promotions')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deletePromotion = async (id: string) => {
  const { error } = await supabase
    .from('discovered_promotions')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}
