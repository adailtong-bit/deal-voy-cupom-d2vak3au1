import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from 'react-router-dom'
import { Bell, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useNotification } from '@/stores/NotificationContext'
import { SyncStatus } from './SyncStatus'
import { LanguageSelector } from './LanguageSelector'
import logoImg from '@/assets/whatsapp-image-2026-01-25-at-5.40.56-am.jpeg'
import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/stores/LanguageContext'

export function MobileHeader() {
  const { unreadCount } = useNotification()
  const { t } = useLanguage()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize search value from URL if available
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '')

  useEffect(() => {
    setSearchValue(searchParams.get('q') || '')
  }, [searchParams])

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSearchOpen])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchValue(val)

    // Determine if we need to navigate to Index or just update params
    if (location.pathname !== '/') {
      // If typing on another page, don't update URL immediately to avoid navigation flicker
      // Navigation happens on enter or blur usually, but for live search:
      // We might want to wait for user to stop typing or press enter.
      // For simplicity in this mobile context, we navigate on Enter or let user click button.
    } else {
      setSearchParams(
        (prev) => {
          if (val) prev.set('q', val)
          else prev.delete('q')
          return prev
        },
        { replace: true },
      )
    }
  }

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (location.pathname !== '/') {
      navigate(`/?q=${encodeURIComponent(searchValue)}`)
    }
    inputRef.current?.blur()
  }

  const toggleSearch = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false)
      // Optional: Clear search when closing? No, keep context.
    } else {
      setIsSearchOpen(true)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden flex flex-col justify-center px-4 transition-all duration-300">
      <div className="flex items-center justify-between h-14 w-full">
        {!isSearchOpen ? (
          <Link
            to="/"
            className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300"
          >
            <img
              src={logoImg}
              alt="Deal Voy Logo"
              className="h-8 w-8 rounded-md object-contain"
            />
            <span className="font-bold text-lg tracking-tight text-foreground">
              Deal <span className="text-primary">Voy</span>
            </span>
          </Link>
        ) : (
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 mr-2 animate-in fade-in slide-in-from-right-2 duration-300"
          >
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="search"
                placeholder={t('common.search')}
                className="w-full bg-slate-100 border-none pl-9 h-9 rounded-full focus-visible:ring-1 focus-visible:ring-primary"
                value={searchValue}
                onChange={handleSearchChange}
              />
            </div>
          </form>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSearch}
            className="text-muted-foreground hover:text-foreground hover:bg-transparent"
          >
            {isSearchOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </Button>

          {!isSearchOpen && (
            <>
              <LanguageSelector />
              <SyncStatus />
              <Link to="/notifications">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-secondary/10"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full text-[10px]"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
