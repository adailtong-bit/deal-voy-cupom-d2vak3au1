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
    throw error
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

export const fetchCrawlerSources = async () => {
  const { data, error } = await supabase
    .from('crawler_sources')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching crawler sources', error)
    return []
  }
  return data
}

export const saveCrawlerSource = async (source: any) => {
  const { data, error } = await supabase
    .from('crawler_sources')
    .insert([source])
    .select()
    .single()

  if (error) {
    console.error('Error saving crawler source', error)
    throw error
  }
  return data
}

export const updateCrawlerSource = async (id: string, source: any) => {
  const { data, error } = await supabase
    .from('crawler_sources')
    .update(source)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating crawler source', error)
    throw error
  }
  return data
}

export const deleteCrawlerSource = async (id: string) => {
  const { error } = await supabase.from('crawler_sources').delete().eq('id', id)

  if (error) {
    console.error('Error deleting crawler source', error)
    throw error
  }
  return true
}
