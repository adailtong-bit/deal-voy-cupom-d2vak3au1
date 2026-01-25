import { Card, CardContent } from '@/components/ui/card'
import { LoyaltyProgram } from '@/lib/types'
import { useLanguage } from '@/stores/LanguageContext'
import { Stamp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoyaltyCardProps {
  program: LoyaltyProgram
}

export function LoyaltyCard({ program }: LoyaltyCardProps) {
  const { t } = useLanguage()
  const stamps = Array.from({ length: program.totalStamps }, (_, i) => i + 1)

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-primary">
          <Stamp className="h-5 w-5" />
          {t('coupon.loyalty')}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t('coupon.collect_stamp')}:{' '}
          <strong className="text-foreground">
            {program.currentStamps}/{program.totalStamps}
          </strong>
        </p>

        <div className="grid grid-cols-5 gap-2 mb-4">
          {stamps.map((num) => {
            const isCollected = num <= program.currentStamps
            return (
              <div
                key={num}
                className={cn(
                  'aspect-square rounded-full flex items-center justify-center border-2 border-dashed transition-all',
                  isCollected
                    ? 'bg-primary border-primary text-white scale-100 shadow-md'
                    : 'bg-transparent border-muted-foreground/30 text-muted-foreground/30',
                )}
              >
                {isCollected ? (
                  <Stamp className="h-4 w-4 fill-current" />
                ) : (
                  <span className="text-xs font-bold">{num}</span>
                )}
              </div>
            )
          })}
        </div>

        <div className="bg-background rounded-md p-3 border text-center text-sm">
          <span className="text-muted-foreground">{t('coupon.reward')}:</span>
          <span className="font-bold block text-primary">{program.reward}</span>
        </div>
      </CardContent>
    </Card>
  )
}
