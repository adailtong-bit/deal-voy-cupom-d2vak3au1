import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, Trash2, Plus, Wallet } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { AdSpace } from '@/components/AdSpace'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function PaymentMethods() {
  const { t } = useLanguage()
  const [methods, setMethods] = useState([
    { id: '1', type: 'card', brand: 'Visa', last4: '4242', expiry: '12/25' },
    {
      id: '2',
      type: 'card',
      brand: 'Mastercard',
      last4: '8888',
      expiry: '01/26',
    },
  ])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleRemove = (id: string) => {
    setMethods(methods.filter((m) => m.id !== id))
    toast.success(t('common.success'))
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    setMethods([
      ...methods,
      {
        id: Math.random().toString(),
        type: 'card',
        brand: 'Visa',
        last4: '0000',
        expiry: '12/28',
      },
    ])
    setIsDialogOpen(false)
    toast.success(t('common.success'))
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <AdSpace
        position="top"
        className="mb-6 rounded-lg border-none bg-transparent px-0"
      />

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-primary" />
          {t('payment.title')}
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> {t('payment.add')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('payment.add')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>{t('checkout.card_number')}</Label>
                <Input placeholder="0000 0000 0000 0000" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('checkout.expiry')}</Label>
                  <Input placeholder="MM/YY" required />
                </div>
                <div className="space-y-2">
                  <Label>{t('checkout.cvc')}</Label>
                  <Input placeholder="123" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{t('common.save')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {methods.map((method) => (
          <Card key={method.id} className="overflow-hidden">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-14 bg-slate-100 rounded flex items-center justify-center border">
                  {method.brand === 'Visa' ? (
                    <span className="font-bold text-blue-800 italic">VISA</span>
                  ) : (
                    <div className="flex">
                      <div className="w-4 h-4 rounded-full bg-red-500 opacity-80" />
                      <div className="w-4 h-4 rounded-full bg-yellow-500 opacity-80 -ml-2" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {method.brand} •••• {method.last4}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires {method.expiry}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:bg-red-50"
                onClick={() => handleRemove(method.id)}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="h-10 w-14 bg-blue-50 rounded flex items-center justify-center border border-blue-100">
              <Wallet className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Apple Pay / Google Pay</p>
              <p className="text-xs text-muted-foreground">
                Connected via device
              </p>
            </div>
            <Button variant="link">{t('common.view')}</Button>
          </CardContent>
        </Card>
      </div>

      <AdSpace
        position="bottom"
        className="mt-8 rounded-lg border-none bg-transparent px-0"
      />
    </div>
  )
}
