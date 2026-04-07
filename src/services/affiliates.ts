import { supabase } from '@/lib/supabase/client'
import { DiscoveredPromotion } from '@/lib/types'

export const searchAffiliateDeals = async (
  query: string,
  limit: number = 10,
): Promise<DiscoveredPromotion[]> => {
  try {
    const { data, error } = await supabase.functions.invoke(
      'search-affiliate-deals',
      {
        body: { query, limit },
      },
    )

    if (error) throw error
    return data?.items || []
  } catch (err) {
    console.error('Error fetching affiliate deals:', err)
    return []
  }
}
