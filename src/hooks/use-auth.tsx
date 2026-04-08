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

  useEffect(() => {
    let isMounted = true

    const fetchProfile = async (
      userId: string,
      currentEmail: string | undefined,
    ) => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (isMounted) {
          if (data) {
            setProfile(data)
            if (
              currentEmail === 'adailtong@gmail.com' ||
              data.role === 'super_admin'
            ) {
              setRole('super_admin')
            } else {
              setRole(data.role || 'user')
            }
          } else if (currentEmail === 'adailtong@gmail.com') {
            setRole('super_admin')
          }
        }
      } catch (e) {
        console.error('Error fetching profile:', e)
        if (isMounted && currentEmail === 'adailtong@gmail.com') {
          setRole('super_admin')
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return

      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (!currentUser) {
        setProfile(null)
        setRole(null)
        setLoading(false)
      } else {
        // Assume basic role quickly, then update
        setRole(
          currentUser.email === 'adailtong@gmail.com' ||
            currentUser.user_metadata?.role === 'super_admin'
            ? 'super_admin'
            : currentUser.user_metadata?.role || 'user',
        )
        fetchProfile(currentUser.id, currentUser.email).finally(() => {
          if (isMounted) setLoading(false)
        })
      }

      if (event === 'SIGNED_OUT') {
        localStorage.clear()
        sessionStorage.clear()
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return

      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (!currentUser) {
        setLoading(false)
      } else {
        setRole(
          currentUser.email === 'adailtong@gmail.com' ||
            currentUser.user_metadata?.role === 'super_admin'
            ? 'super_admin'
            : currentUser.user_metadata?.role || 'user',
        )
        fetchProfile(currentUser.id, currentUser.email).finally(() => {
          if (isMounted) setLoading(false)
        })
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
