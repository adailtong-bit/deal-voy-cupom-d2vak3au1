import React, { createContext, useContext, useState } from 'react'
import { Notification } from '@/lib/types'

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (n: Omit<Notification, 'id' | 'date' | 'read'>) => void
  markAsRead: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
)

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (n: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotif: Notification = {
      ...n,
      id: Math.random().toString(),
      date: new Date().toISOString(),
      read: false,
    }
    setNotifications((prev) => [newNotif, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }

  const clearAll = () => setNotifications([])

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAsRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx)
    throw new Error('useNotification must be used within NotificationProvider')
  return ctx
}
