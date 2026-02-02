import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import { ChatThread, Message } from '@/lib/types'
import { MOCK_CHATS } from '@/lib/data'
import { useCouponStore } from './CouponContext'
import { toast } from 'sonner'

interface ChatContextType {
  threads: ChatThread[]
  activeThreadId: string | null
  setActiveThreadId: (id: string | null) => void
  sendMessage: (threadId: string, text: string) => void
  startChat: (participantId: string, participantName: string) => string
  markAsRead: (threadId: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useCouponStore()
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)

  useEffect(() => {
    // Load mock chats for current user
    // In a real app, this would filter based on authenticated user ID
    if (user) {
      setThreads(MOCK_CHATS)
    } else {
      setThreads([])
    }
  }, [user])

  const sendMessage = useCallback(
    (threadId: string, text: string) => {
      if (!user) return

      const newMessage: Message = {
        id: Math.random().toString(),
        senderId: user.id,
        text,
        timestamp: new Date().toISOString(),
        isRead: false,
      }

      setThreads((prev) =>
        prev.map((thread) => {
          if (thread.id === threadId) {
            return {
              ...thread,
              messages: [...thread.messages, newMessage],
              lastMessage: text,
              lastUpdated: new Date().toISOString(),
            }
          }
          return thread
        }),
      )

      // Simulate response after 1 second
      setTimeout(() => {
        const responseMessage: Message = {
          id: Math.random().toString(),
          senderId: 'system',
          text: 'This is an automated response. An agent will be with you shortly.',
          timestamp: new Date().toISOString(),
          isRead: false,
        }
        setThreads((prev) =>
          prev.map((thread) => {
            if (thread.id === threadId) {
              return {
                ...thread,
                messages: [...thread.messages, responseMessage],
                lastMessage: responseMessage.text,
                lastUpdated: new Date().toISOString(),
                unreadCount: thread.unreadCount + 1,
              }
            }
            return thread
          }),
        )
        toast('New message received', {
          description: 'You have a new message from Agent',
        })
      }, 1000)
    },
    [user],
  )

  const startChat = useCallback(
    (participantId: string, participantName: string) => {
      // Check if chat already exists
      const existing = threads.find((t) =>
        t.participants.some((p) => p.id === participantId),
      )
      if (existing) {
        setActiveThreadId(existing.id)
        return existing.id
      }

      const newThread: ChatThread = {
        id: Math.random().toString(),
        participants: [
          {
            id: user?.id || 'me',
            name: user?.name || 'Me',
            avatar: user?.avatar || '',
            role: user?.role || 'user',
          },
          {
            id: participantId,
            name: participantName,
            avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male',
            role: 'agency', // Simplified
          },
        ],
        messages: [],
        lastMessage: '',
        lastUpdated: new Date().toISOString(),
        unreadCount: 0,
      }

      setThreads((prev) => [newThread, ...prev])
      setActiveThreadId(newThread.id)
      return newThread.id
    },
    [threads, user],
  )

  const markAsRead = useCallback((threadId: string) => {
    setThreads((prev) =>
      prev.map((thread) => {
        // Only update if there are unread messages to avoid unnecessary state updates
        if (thread.id === threadId && thread.unreadCount > 0) {
          return { ...thread, unreadCount: 0 }
        }
        return thread
      }),
    )
  }, [])

  const value = useMemo(
    () => ({
      threads,
      activeThreadId,
      setActiveThreadId,
      sendMessage,
      startChat,
      markAsRead,
    }),
    [
      threads,
      activeThreadId,
      sendMessage,
      startChat,
      markAsRead,
      setActiveThreadId,
    ],
  )

  return React.createElement(ChatContext.Provider, { value }, children)
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined)
    throw new Error('useChat must be used within a ChatProvider')
  return context
}
