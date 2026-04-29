import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: any | null
  role: string | null
  signUp: (
    email: string,
    password: string,
    options?: any,
  ) => Promise<{ error: any; data?: any }>
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: any; data?: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const applyRole = (fetchedRole: string) => {
    setRole(fetchedRole)
    localStorage.setItem('role', fetchedRole)
    localStorage.setItem('userRole', fetchedRole)
  }

  useEffect(() => {
    let isMounted = true

    const loadProfile = async (currentUser: User) => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        if (isMounted) {
          setProfile(data || null)
          const resolvedRole =
            data?.role || currentUser.user_metadata?.role || 'user'

          if (
            currentUser.email?.toLowerCase() === 'adailtong@gmail.com' ||
            resolvedRole === 'super_admin'
          ) {
            applyRole('super_admin')
          } else {
            applyRole(resolvedRole)
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        if (isMounted) {
          const fallback = currentUser.user_metadata?.role || 'user'
          applyRole(
            currentUser.email === 'adailtong@gmail.com'
              ? 'super_admin'
              : fallback,
          )
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!isMounted) return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await loadProfile(session.user)
        } else {
          setProfile(null)
          setRole(null)
          setLoading(false)
        }
      } catch (err) {
        console.error('Auth init error:', err)
        if (isMounted) setLoading(false)
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return

      setSession(session)
      setUser(session?.user ?? null)

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setLoading(true)
          loadProfile(session.user)
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.clear()
        sessionStorage.clear()
        setProfile(null)
        setRole(null)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, options?: any) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: options || { emailRedirectTo: `${window.location.origin}/` },
    })
    return { error, data }
  }

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error, data }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return (
    <AuthContext.Provider
      value={{ user, session, profile, role, signUp, signIn, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}
