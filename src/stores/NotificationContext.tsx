import React, { createContext, useContext, useState, useEffect } from 'react'
import { Notification } from '@/lib/types'
import { MOCK_NOTIFICATIONS } from '@/lib/data'
import { useLanguage } from './LanguageContext'
import { toast } from 'sonner'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  smartAlertsEnabled: boolean
  toggleSmartAlerts: () => void
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
  const [smartAlertsEnabled, setSmartAlertsEnabled] = useState(true)
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

  const toggleSmartAlerts = () => {
    setSmartAlertsEnabled((prev) => {
      const next = !prev
      toast.success(
        next
          ? t('notifications.smart_alerts_on')
          : t('notifications.smart_alerts_off'),
      )
      return next
    })
  }

  const addNotification = (
    notification: Omit<Notification, 'id' | 'date' | 'read'>,
  ) => {
    if (!smartAlertsEnabled && notification.category === 'smart') return

    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      read: false,
      priority: notification.priority || 'medium',
      category: notification.category || 'system',
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
        smartAlertsEnabled,
        toggleSmartAlerts,
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
