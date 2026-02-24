import React, { useState, useRef, useEffect } from 'react'
import { useChat } from '@/stores/ChatContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCouponStore } from '@/stores/CouponContext'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/stores/LanguageContext'

export function ChatWindow({ threadId }: { threadId: string }) {
  const { threads, sendMessage, markAsRead } = useChat()
  const { user } = useCouponStore()
  const { t } = useLanguage()
  const [text, setText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const thread = threads.find((t) => t.id === threadId)
  const otherParticipant = thread?.participants.find((p) => p.id !== user?.id)
  const unreadCount = thread?.unreadCount || 0

  useEffect(() => {
    if (threadId && unreadCount > 0) {
      markAsRead(threadId)
    }
  }, [threadId, unreadCount, markAsRead])

  useEffect(() => {
    // Scroll to bottom on new message
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [thread?.messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      sendMessage(threadId, text)
      setText('')
    }
  }

  if (!thread) return null

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="p-4 border-b bg-slate-50 flex items-center gap-3">
        <Avatar>
          <AvatarImage src={otherParticipant?.avatar} />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-bold text-sm">{otherParticipant?.name}</h3>
          <p className="text-xs text-muted-foreground capitalize">
            {otherParticipant?.role.replace('_', ' ')}
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {thread.messages.map((msg) => {
            const isMe = msg.senderId === user?.id
            return (
              <div
                key={msg.id}
                className={cn(
                  'flex w-full',
                  isMe ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] p-3 rounded-lg text-sm',
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-slate-100 text-foreground rounded-bl-none',
                  )}
                >
                  <p>{msg.text}</p>
                  <span
                    className={cn(
                      'text-[10px] block mt-1 opacity-70',
                      isMe
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            )
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('messages.type_message')}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!text.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
