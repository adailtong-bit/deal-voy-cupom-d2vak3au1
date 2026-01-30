import { LoyaltyProgram } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Gift, Star } from 'lucide-react'

export function LoyaltyCard({ program }: { program: LoyaltyProgram }) {
  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-bold text-primary flex items-center gap-2">
            <Star className="h-4 w-4 fill-primary" /> Loyalty Card
          </h4>
          <span className="text-xs font-medium bg-white px-2 py-1 rounded-full shadow-sm text-primary">
            {program.currentStamps} / {program.totalStamps} Stamps
          </span>
        </div>
        <div className="flex justify-between gap-2">
          {Array.from({ length: program.totalStamps }).map((_, i) => (
            <div
              key={i}
              className={`h-8 flex-1 rounded-full flex items-center justify-center transition-all ${
                i < program.currentStamps
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white border border-dashed border-slate-300 text-slate-200'
              }`}
            >
              <Star className="h-3 w-3 fill-current" />
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-center text-primary/80 font-medium flex items-center justify-center gap-1">
          <Gift className="h-3 w-3" /> Reward: {program.reward}
        </div>
      </CardContent>
    </Card>
  )
}
