import React, { createContext, useContext, useState, useEffect } from 'react'
import { Notification } from '@/lib/types'
import { MOCK_NOTIFICATIONS } from '@/lib/data'
import { useLanguage } from './LanguageContext'
import { toast } from 'sonner'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  addNotification: (
    notification: Omit<Notification, 'id' | 'date' | 'read'>,
  ) => void
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
  const { t } = useLanguage()

  useEffect(() => {
    // Load initial mock data
    setNotifications(MOCK_NOTIFICATIONS)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }

  const addNotification = (
    notification: Omit<Notification, 'id' | 'date' | 'read'>,
  ) => {
    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      read: false,
      ...notification,
    }
    setNotifications((prev) => [newNotification, ...prev])

    // Trigger toast for immediate feedback
    toast(notification.title, {
      description: notification.message,
      action: {
        label: t('common.view'),
        onClick: () => console.log('View notification'),
      },
    })
  }

  const clearAll = () => {
    setNotifications([])
  }

  return React.createElement(
    NotificationContext.Provider,
    {
      value: {
        notifications,
        unreadCount,
        markAsRead,
        addNotification,
        clearAll,
      },
    },
    children,
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    )
  }
  return context
}
