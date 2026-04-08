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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (event === 'SIGNED_OUT') {
        try {
          const localUserStr = localStorage.getItem('currentUser')
          let isMock = false
          if (localUserStr) {
            const userObj = JSON.parse(localUserStr)
            isMock = Boolean(userObj?.id?.toString().startsWith('mock-'))
          }

          if (!isMock) {
            localStorage.removeItem('currentUser')
            localStorage.removeItem('pocketbase_auth')
            localStorage.removeItem('auth_token')
            sessionStorage.clear()
            // Reset forçado em caso de logout assíncrono para garantir que não haja tela presa
            if (window.location.pathname !== '/login') {
              window.location.href = '/login'
            }
          }
        } catch (error) {
          localStorage.removeItem('currentUser')
          localStorage.removeItem('pocketbase_auth')
          localStorage.removeItem('auth_token')
          sessionStorage.clear()
        }
      }

      setLoading(false)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
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
    try {
      const { error } = await supabase.auth.signOut()
      localStorage.removeItem('currentUser')
      localStorage.removeItem('pocketbase_auth')
      localStorage.removeItem('auth_token')
      sessionStorage.clear()
      window.location.href = '/login'
      return { error }
    } catch (error) {
      localStorage.removeItem('currentUser')
      localStorage.removeItem('pocketbase_auth')
      localStorage.removeItem('auth_token')
      sessionStorage.clear()
      window.location.href = '/login'
      return { error: error }
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, session, signUp, signIn, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}
