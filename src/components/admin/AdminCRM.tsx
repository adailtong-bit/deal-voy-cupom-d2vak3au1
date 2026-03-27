import { useState, useMemo } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Send, Mail, MessageSquare, Users, Eye, CheckCircle2, LayoutTemplate } from 'lucide-react'
import { toast } from 'sonner'
import { MOCK_USERS, CATEGORIES } from '@/lib/data'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function AdminCRM({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()
  const { coupons } = useCouponStore()
  
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('email')
  const [offerId, setOfferId] = useState('none')
  const [behavior, setBehavior] = useState('all')
  const [interests, setInterests] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [isDispatching, setIsDispatching] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const activeOffers = useMemo(() => coupons.filter(c => c.status === 'active'), [coupons])
  const selectedOffer = useMemo(() => activeOffers.find(c => c.id === offerId), [activeOffers, offerId])

  const filteredUsers = useMemo(() => MOCK_USERS.filter(u => {
    if (u.role !== 'user' && u.role !== 'franchisee') return false
    if (behavior === 'frequent' && !u.preferences?.newsletter) return false
    if (behavior === 'recent' && u.subscriptionTier !== 'premium') return false
    if (behavior === 'inactive' && u.preferences?.newsletter) return false
    if (interests.length > 0 && (!u.preferences?.categories || !u.preferences.categories.some(c => interests.includes(c)))) return false
    return true
  }), [behavior, interests])

  const handleDispatch = () => {
    setIsDispatching(true)
    setTimeout(() => {
      setIsDispatching(false)
      setShowConfirm(false)
      toast.success(t('crm.dispatch_success', 'Campaign dispatched!'))
      setMessage(''); setOfferId('none')
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">{t('crm.title', 'Campaign Dispatch')}</h2>
        <p className="text-slate-500 text-sm">Target and send campaigns via WhatsApp or Email.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader className="pb-4"><CardTitle className="text-lg flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Target Filters</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>User Behavior</Label>
                <Select value={behavior} onValueChange={setBehavior}>
                  <SelectTrigger><SelectValue placeholder="Select behavior" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Active Users</SelectItem>
                    <SelectItem value="frequent">Frequent Buyers</SelectItem>
                    <SelectItem value="recent">Recent Signups</SelectItem>
                    <SelectItem value="inactive">Inactive Users (> 30 days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                    const isSelected = interests.includes(cat.id)
                    return (
                      <Badge key={cat.id} variant={isSelected ? 'default' : 'outline'} className={cn("cursor-pointer", !isSelected && "hover:text-primary")}
                        onClick={() => setInterests(p => isSelected ? p.filter(x => x !== cat.id) : [...p, cat.id])}>
                        {cat.label}
                      </Badge>
                    )
                  })}
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 flex justify-between items-center border">
                <span className="text-sm font-medium text-slate-600">Estimated Audience</span>
                <span className="text-xl font-bold text-primary">{filteredUsers.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4"><CardTitle className="text-lg flex items-center gap-2"><LayoutTemplate className="w-5 h-5 text-primary" /> Campaign Content</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Channel</Label>
                <ToggleGroup type="single" value={channel} onValueChange={(v) => v && setChannel(v as any)} className="justify-start">
                  <ToggleGroupItem value="email" className="w-32 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-700 border"><Mail className="w-4 h-4 mr-2" />Email</ToggleGroupItem>
                  <ToggleGroupItem value="whatsapp" className="w-32 data-[state=on]:bg-green-50 data-[state=on]:text-green-700 border"><MessageSquare className="w-4 h-4 mr-2" />WhatsApp</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="space-y-2">
                <Label>Link Offer</Label>
                <Select value={offerId} onValueChange={setOfferId}>
                  <SelectTrigger><SelectValue placeholder="Select offer" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific offer</SelectItem>
                    {activeOffers.map(o => <SelectItem key={o.id} value={o.id}>{o.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Custom Message</Label>
                <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Type your message..." />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="sticky top-6">
            <CardHeader className="pb-4"><CardTitle className="text-lg flex items-center gap-2"><Eye className="w-5 h-5 text-primary" /> Preview</CardTitle></CardHeader>
            <CardContent className="p-0 sm:px-6 sm:pb-6">
              {channel === 'email' ? (
                <div className="border rounded-lg bg-white overflow-hidden shadow-sm mx-4 sm:mx-0 mb-4 sm:mb-0">
                  <div className="bg-slate-100 p-3 border-b text-sm flex flex-col gap-1">
                    <div><span className="text-slate-500 mr-2">To:</span>{filteredUsers.length} Users</div>
                    <div><span className="text-slate-500 mr-2">Subj:</span>{selectedOffer ? selectedOffer.title : 'Updates'}</div>
                  </div>
                  <div className="p-5 text-center flex flex-col items-center gap-3">
                    {selectedOffer && <img src={selectedOffer.image} className="w-full h-32 object-cover rounded-md" />}
                    <h3 className="font-bold">{selectedOffer?.title || 'Update'}</h3>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{message || selectedOffer?.description}</p>
                    {selectedOffer && <Button size="sm" className="mt-2 w-full">View Offer</Button>}
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg bg-[#efeae2] h-[380px] flex flex-col overflow-hidden shadow-sm mx-4 sm:mx-0 mb-4 sm:mb-0">
                  <div className="bg-[#00a884] text-white p-3 flex items-center gap-2 shrink-0">
                    <MessageSquare className="w-4 h-4" /><span className="font-semibold text-sm">Deal Voy</span>
                  </div>
                  <ScrollArea className="flex-1 p-4 bg-opacity-10">
                    <div className="bg-white rounded-lg p-2 max-w-[90%] shadow-sm text-sm relative pb-5 rounded-tl-none">
                      {selectedOffer && <img src={selectedOffer.image} className="w-full h-24 object-cover rounded-md mb-2" />}
                      {selectedOffer && <p className="font-bold mb-1">*{selectedOffer.title}*</p>}
                      <p className="whitespace-pre-wrap text-slate-700">{message || selectedOffer?.description}</p>
                      {selectedOffer && <a href="#" className="text-blue-500 text-xs mt-1 block">https://dealvoy.app/o/{selectedOffer.id}</a>}
                      <span className="text-[10px] text-slate-400 absolute bottom-1 right-2 flex items-center">12:00 <CheckCircle2 className="w-3 h-3 ml-1 text-blue-500" /></span>
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogTrigger asChild>
                  <Button className="w-full" disabled={filteredUsers.length === 0}><Send className="w-4 h-4 mr-2" /> Review & Dispatch</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Confirm Dispatch</DialogTitle><DialogDescription>Send campaign to audience.</DialogDescription></DialogHeader>
                  <div className="space-y-3 py-4">
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg border">
                      <span className="text-sm text-slate-500">Channel</span><span className="font-semibold">{channel === 'whatsapp' ? 'WhatsApp' : 'Email'}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg border">
                      <span className="text-sm text-slate-500">Audience</span><span className="font-semibold">{filteredUsers.length} Users</span>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
                    <Button onClick={handleDispatch} disabled={isDispatching}>{isDispatching ? 'Sending...' : 'Confirm'}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
