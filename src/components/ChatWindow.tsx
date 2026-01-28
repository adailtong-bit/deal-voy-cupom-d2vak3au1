import { useState, useEffect, useRef } from 'react'
import { ChatThread, UserRole } from '@/lib/types'
import { useChat } from '@/stores/ChatContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, User } from 'lucide-react'
import { useCouponStore } from '@/stores/CouponContext'

interface ChatWindowProps {
  threadId: string
}

export function ChatWindow({ threadId }: ChatWindowProps) {
  const { threads, sendMessage, markAsRead } = useChat()
  const { user } = useCouponStore()
  const [inputText, setInputText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const thread = threads.find((t) => t.id === threadId)
  const otherParticipant = thread?.participants.find((p) => p.id !== user?.id)

  useEffect(() => {
    if (threadId) {
      markAsRead(threadId)
    }
  }, [threadId, markAsRead])

  useEffect(() => {
    // Scroll to bottom on new message
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [thread?.messages])

  if (!thread)
    return <div className="p-4">Select a chat to start messaging</div>

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputText.trim()) {
      sendMessage(threadId, inputText)
      setInputText('')
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="p-4 border-b bg-slate-50 flex items-center gap-3">
        <Avatar>
          <AvatarImage src={otherParticipant?.avatar} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-bold text-sm">{otherParticipant?.name}</h3>
          <p className="text-xs text-muted-foreground capitalize">
            {otherParticipant?.role}
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
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 text-sm ${
                    isMe
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="text-[10px] opacity-70 block text-right mt-1">
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

      <form onSubmit={handleSend} className="p-4 border-t bg-white flex gap-2">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!inputText.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
