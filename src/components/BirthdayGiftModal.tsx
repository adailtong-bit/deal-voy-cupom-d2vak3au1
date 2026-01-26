import { useCouponStore } from '@/stores/CouponContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Gift } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useState, useEffect } from 'react'
import Confetti from 'react-dom-confetti'

export function BirthdayGiftModal() {
  const { birthdayGiftAvailable, claimBirthdayGift } = useCouponStore()
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (birthdayGiftAvailable) {
      setIsOpen(true)
      setTimeout(() => setShowConfetti(true), 500)
    }
  }, [birthdayGiftAvailable])

  const handleClaim = () => {
    claimBirthdayGift()
    setIsOpen(false)
  }

  const confettiConfig = {
    angle: 90,
    spread: 360,
    startVelocity: 40,
    elementCount: 70,
    dragFriction: 0.12,
    duration: 3000,
    stagger: 3,
    width: '10px',
    height: '10px',
    perspective: '500px',
    colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'],
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="flex justify-center items-center mb-4 relative">
            <Confetti active={showConfetti} config={confettiConfig} />
            <div className="bg-primary/10 p-4 rounded-full">
              <Gift className="h-12 w-12 text-primary animate-bounce" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            {t('rewards.happy_birthday')}
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            {t('rewards.birthday_desc')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-4xl font-extrabold text-primary mb-2">+1000 PTS</p>
          <p className="text-sm text-muted-foreground">
            Use seus pontos para resgatar prêmios incríveis.
          </p>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button
            onClick={handleClaim}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 font-bold"
          >
            {t('rewards.claim_gift')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
