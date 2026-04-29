import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface AdSpaceProps {
  position?: 'top' | 'bottom' | 'sidebar' | 'inline'
  className?: string
}

export function AdSpace({ position = 'inline', className }: AdSpaceProps) {
  const [ad, setAd] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchAd = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('ad_campaigns')
          .select('*')
          .eq('status', 'active')
          .eq('placement', position)
          .limit(1)
          .maybeSingle()

        if (error && error.code !== 'PGRST116') {
          console.warn('Error fetching ad:', error)
        }

        if (isMounted) {
          setAd(data || null)
        }
      } catch (err) {
        console.warn('Failed to fetch ad:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchAd()

    return () => {
      isMounted = false
    }
  }, [position])

  if (loading) {
    return null
  }

  // Only render if a real ad from the database exists.
  // No mock/fake ads will be displayed in production.
  if (!ad) {
    return null
  }

  return (
    <a
      href={ad.link || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'block w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow group relative',
        className,
      )}
    >
      <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded backdrop-blur-sm z-10">
        Ad
      </div>
      {ad.image ? (
        <div className="h-24 sm:h-32 w-full relative overflow-hidden bg-slate-50">
          <img
            src={ad.image}
            alt={ad.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      ) : (
        <div className="h-24 sm:h-32 w-full bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-center p-4 text-center">
          <h3 className="text-white font-bold text-lg">{ad.title}</h3>
        </div>
      )}
    </a>
  )
}
