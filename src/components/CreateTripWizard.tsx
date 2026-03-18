import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useCouponStore } from '@/stores/CouponContext'
import { toast } from 'sonner'
import { DayPlan, Itinerary } from '@/lib/types'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

const INTERESTS = [
  'Gastronomy',
  'Culture',
  'Shopping',
  'Nightlife',
  'Relaxation',
  'Adventure',
]

interface CreateTripWizardProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (trip: Itinerary) => void
}

export function CreateTripWizard({
  isOpen,
  onClose,
  onCreated,
}: CreateTripWizardProps) {
  const { user, saveItinerary } = useCouponStore()
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [days, setDays] = useState('3')
  const [interests, setInterests] = useState<string[]>([])

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setStep(1)
      setTitle('')
      setDays('3')
      setInterests([])
    }, 200)
  }

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    const numDays = parseInt(days) || 1
    const tripDays: DayPlan[] = Array.from({ length: numDays }).map((_, i) => ({
      id: `day-${Math.random().toString(36).substring(2, 9)}`,
      dayNumber: i + 1,
      stops: [],
    }))

    const newTrip: Itinerary = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      description: `A new adventure exploring ${interests.length ? interests.join(', ') : 'everything'}.`,
      stops: [],
      days: tripDays,
      tags: interests.length ? interests : ['New'],
      duration: `${numDays} Days`,
      totalSavings: 0,
      image: `https://img.usecurling.com/p/800/400?q=${encodeURIComponent(title || 'travel')}`,
      status: 'draft',
      authorId: user?.id,
      authorName: user?.name,
      matchScore: 100,
    }

    saveItinerary(newTrip)
    handleClose()
    onCreated(newTrip)
  }

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && 'Step 1: Destination'}
            {step === 2 && 'Step 2: Dates & Duration'}
            {step === 3 && 'Step 3: Activities & Interests'}
            {step === 4 && 'Step 4: Review'}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 min-h-[160px] flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label>Destination or Trip Name</Label>
                <Input
                  placeholder="e.g. Summer in Paris"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label>Duration (Days)</Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <Label>Select your interests</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {INTERESTS.map((interest) => (
                  <Badge
                    key={interest}
                    variant={
                      interests.includes(interest) ? 'default' : 'outline'
                    }
                    className="cursor-pointer text-sm py-1.5 px-3 transition-colors"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4 bg-slate-50 p-5 rounded-lg border animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Destination</span>{' '}
                <strong className="text-right">{title}</strong>
              </p>
              <p className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Duration</span>{' '}
                <strong>{days} Days</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">Interests</span>{' '}
                <strong className="text-right">
                  {interests.length ? interests.join(', ') : 'None'}
                </strong>
              </p>
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-between items-center sm:justify-between w-full">
          <Button
            variant="ghost"
            onClick={step === 1 ? handleClose : () => setStep(step - 1)}
          >
            {step === 1 ? (
              'Cancel'
            ) : (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </>
            )}
          </Button>
          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !title.trim()}
            >
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleCreate} className="bg-primary">
              <Check className="w-4 h-4 mr-2" /> Create Trip
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
