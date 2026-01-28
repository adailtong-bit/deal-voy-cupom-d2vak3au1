import { useChat } from '@/stores/ChatContext'
import { ChatWindow } from '@/components/ChatWindow'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useCouponStore } from '@/stores/CouponContext'
import { User, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/stores/LanguageContext'

export default function Messages() {
  const { threads, activeThreadId, setActiveThreadId } = useChat()
  const { user } = useCouponStore()
  const { t } = useLanguage()

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-primary" />
        {t('messages.title') || 'Messages'}
      </h1>

      <div className="flex flex-1 gap-4 overflow-hidden border rounded-xl bg-slate-50">
        <div className="w-1/3 min-w-[250px] border-r bg-white flex flex-col">
          <div className="p-4 border-b font-semibold text-sm text-muted-foreground">
            {threads.length} Conversation{threads.length !== 1 ? 's' : ''}
          </div>
          <ScrollArea className="flex-1">
            {threads.map((thread) => {
              const other = thread.participants.find((p) => p.id !== user?.id)
              const isActive = thread.id === activeThreadId
              return (
                <div
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={cn(
                    'p-4 border-b cursor-pointer hover:bg-slate-50 transition-colors flex gap-3 items-start',
                    isActive && 'bg-slate-100 border-l-4 border-l-primary',
                  )}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={other?.avatar} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-bold text-sm truncate">
                        {other?.name}
                      </span>
                      {thread.unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {thread.lastMessage}
                    </p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {new Date(thread.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )
            })}
            {threads.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No messages yet.
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col bg-slate-100 p-4">
          {activeThreadId ? (
            <ChatWindow threadId={activeThreadId} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
