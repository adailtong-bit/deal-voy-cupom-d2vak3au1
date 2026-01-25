import { useState } from 'react'
import { Coupon } from '@/lib/types'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Utensils, Languages } from 'lucide-react'

interface CouponMenuProps {
  coupon: Coupon
}

export function CouponMenu({ coupon }: CouponMenuProps) {
  const { t, language } = useLanguage()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [menuLang, setMenuLang] = useState(language)

  if (!coupon.menu || coupon.menu.length === 0) return null

  return (
    <div className="mb-6">
      <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full gap-2 border-primary/50 text-primary"
          >
            <Utensils className="h-4 w-4" /> {t('coupon.menu')}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              Menu: {coupon.storeName}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMenuLang(menuLang === 'pt' ? language : 'pt')}
              >
                <Languages className="h-4 w-4 mr-2" />
                {menuLang === 'pt' ? 'Original' : 'Traduzido'}
              </Button>
            </DialogTitle>
            <DialogDescription>
              Itens disponíveis nesta oferta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {coupon.menu.map((item, idx) => {
              const translation =
                menuLang !== 'pt' && item.translations?.[menuLang]
                  ? item.translations[menuLang]
                  : item
              return (
                <div
                  key={idx}
                  className="flex justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-bold">{translation.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {translation.description}
                    </p>
                  </div>
                  <p className="font-medium ml-4">R$ {item.price.toFixed(2)}</p>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
      <Separator className="my-6" />
    </div>
  )
}
