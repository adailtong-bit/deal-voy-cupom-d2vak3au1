import { supabase } from '@/lib/supabase/client'

export interface Advertiser {
  id?: string
  company_name: string
  contact_name?: string | null
  tax_id?: string | null
  email?: string | null
  phone?: string | null
  street?: string | null
  address_number?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  status?: string | null
  created_at?: string | null
}

export const fetchAdvertisers = async (): Promise<Advertiser[]> => {
  const { data, error } = await supabase
    .from('ad_advertisers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching advertisers:', error)
    throw new Error(error.message)
  }

  return data as Advertiser[]
}

export const createAdvertiser = async (
  advertiser: Advertiser,
): Promise<Advertiser> => {
  const { data, error } = await supabase
    .from('ad_advertisers')
    .insert([advertiser])
    .select()
    .single()

  if (error) {
    console.error('Error creating advertiser:', error)
    throw new Error(error.message)
  }

  return data as Advertiser
}
