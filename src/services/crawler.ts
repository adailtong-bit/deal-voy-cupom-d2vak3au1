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

  if (data?.error) {
    console.warn('Crawler returned an error:', data.error, data.debug_info)
    throw new Error(data.error)
  }

  return data?.items || []
}

export const saveDiscoveredPromotion = async (promo: any) => {
  try {
    // Garantir que os dados mapeiem corretamente para a tabela e prevenir erros de colunas inexistentes.
    const payload = {
      title: promo.title ? promo.title.substring(0, 255) : 'Oferta sem título',
      description: promo.description || null,
      price: promo.price || null,
      original_price: promo.original_price || null,
      currency: promo.currency || 'BRL',
      discount: promo.discount || null,
      discount_percentage: promo.discount_percentage || null,
      image_url: promo.image_url || null,
      product_link: promo.product_link || null,
      source_url: promo.source_url || null,
      store_name: promo.store_name || null,
      category: promo.category || 'geral',
      country: promo.country || null,
      status: promo.status || 'pending',
      captured_at: promo.captured_at || new Date().toISOString(),
      campaign_name: promo.campaign_name || null,
      coverage: promo.coverage || 'toda a rede',
      discount_rules: promo.discount_rules || 'percentual',
      start_date: promo.start_date || null,
      end_date: promo.end_date || null,
      limit_type: promo.limit_type || null,
      total_limit: promo.total_limit || null,
      enable_proximity_alerts: promo.enable_proximity_alerts || false,
      alert_radius: promo.alert_radius || null,
      is_seasonal: promo.is_seasonal || false,
      enable_trigger: promo.enable_trigger || false,
      trigger_type: promo.trigger_type || null,
      trigger_threshold: promo.trigger_threshold || null,
      reward_id: promo.reward_id || null,
      company_id: promo.company_id || null,
    }

    const { data, error } = await supabase
      .from('discovered_promotions')
      .insert([payload])
      .select()
      .single()

    if (error) {
      console.error(
        'Error saving promotion (DB insert):',
        error.message,
        error.details,
        payload,
      )
      throw error
    }
    return data
  } catch (err: any) {
    console.error('Fatal error in saveDiscoveredPromotion:', err)
    throw err
  }
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
