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
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      const currentUser = session?.user ?? null

      if (currentUser) {
        // Fetch role from profile asynchronously but wait to clear loading state
        supabase
          .from('profiles')
          .select('role, is_affiliate')
          .eq('id', currentUser.id)
          .maybeSingle()
          .then(({ data }) => {
            if (isMounted) {
              const updatedUser = {
                ...currentUser,
                user_metadata: {
                  ...currentUser.user_metadata,
                  role:
                    currentUser.email === 'adailtong@gmail.com'
                      ? 'super_admin'
                      : data?.role || currentUser.user_metadata?.role || 'user',
                  is_affiliate: data?.is_affiliate,
                },
              } as User
              setUser(updatedUser)
              setLoading(false)
            }
          })
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      const currentUser = session?.user ?? null

      if (currentUser) {
        supabase
          .from('profiles')
          .select('role, is_affiliate')
          .eq('id', currentUser.id)
          .maybeSingle()
          .then(({ data }) => {
            if (isMounted) {
              const updatedUser = {
                ...currentUser,
                user_metadata: {
                  ...currentUser.user_metadata,
                  role:
                    currentUser.email === 'adailtong@gmail.com'
                      ? 'super_admin'
                      : data?.role || currentUser.user_metadata?.role || 'user',
                  is_affiliate: data?.is_affiliate,
                },
              } as User
              setUser(updatedUser)
              setLoading(false)
            }
          })
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    })
    return { error }
  }
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return (
    <AuthContext.Provider
      value={{ user, session, signUp, signIn, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}
