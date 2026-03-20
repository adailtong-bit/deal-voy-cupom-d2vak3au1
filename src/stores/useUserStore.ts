import { useState, useEffect } from 'react'

type User = {
  name: string
  email: string
  phone: string
  avatar: string | null
}

let globalUser: User = {
  name: 'Administrador',
  email: 'admin@dealvoy.com',
  phone: '+55 11 99999-9999',
  avatar: null,
}

const listeners = new Set<() => void>()

export default function useUserStore() {
  const [user, setUserState] = useState<User>(globalUser)

  useEffect(() => {
    const listener = () => setUserState({ ...globalUser })
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const setUser = (newUser: Partial<User>) => {
    globalUser = { ...globalUser, ...newUser }
    listeners.forEach((l) => l())
  }

  return { user, setUser }
}
