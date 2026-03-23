import { useState, useMemo } from 'react'
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
  'Gastronomia',
  'Cultura',
  'Compras',
  'Vida Noturna',
  'Relaxamento',
  'Aventura',
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
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [interests, setInterests] = useState<string[]>([])

  const numDays = useMemo(() => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (end >= start) {
        return (
          Math.floor((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1
        )
      }
    }
    return 1
  }, [startDate, endDate])

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setStep(1)
      setTitle('')
      setStartDate('')
      setEndDate('')
      setInterests([])
    }, 200)
  }

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error('O nome da viagem é obrigatório')
      return
    }

    const tripDays: DayPlan[] = Array.from({ length: numDays }).map((_, i) => {
      const dayDate = startDate ? new Date(startDate) : new Date()
      if (startDate) dayDate.setDate(dayDate.getDate() + i)

      return {
        id: `day-${Math.random().toString(36).substring(2, 9)}`,
        dayNumber: i + 1,
        date: startDate ? dayDate.toISOString() : undefined,
        stops: [],
      }
    })

    const newTrip: Itinerary = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      description: `Uma nova aventura explorando ${interests.length ? interests.join(', ') : 'tudo'}.`,
      stops: [],
      days: tripDays,
      tags: interests.length ? interests : ['Nova'],
      duration: `${numDays} Dias`,
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
            {step === 1 && 'Passo 1: Destino'}
            {step === 2 && 'Passo 2: Datas & Duração'}
            {step === 3 && 'Passo 3: Interesses'}
            {step === 4 && 'Passo 4: Revisão'}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 min-h-[160px] flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label>Nome ou Destino da Viagem</Label>
                <Input
                  placeholder="ex. Verão em Paris"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Fim</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                  />
                </div>
              </div>
              {startDate && endDate && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  Duração Total: <strong>{numDays} Dias</strong>
                </p>
              )}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <Label>Selecione seus interesses</Label>
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
                <span className="text-muted-foreground">Destino</span>{' '}
                <strong className="text-right">{title}</strong>
              </p>
              <p className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Duração</span>{' '}
                <strong>{numDays} Dias</strong>
              </p>
              <p className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Período</span>{' '}
                <strong className="text-right">
                  {startDate ? new Date(startDate).toLocaleDateString() : 'N/D'}{' '}
                  - {endDate ? new Date(endDate).toLocaleDateString() : 'N/D'}
                </strong>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">Interesses</span>{' '}
                <strong className="text-right">
                  {interests.length ? interests.join(', ') : 'Nenhum'}
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
              'Cancelar'
            ) : (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </>
            )}
          </Button>
          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !title.trim()) ||
                (step === 2 && (!startDate || !endDate))
              }
            >
              Próximo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleCreate} className="bg-primary">
              <Check className="w-4 h-4 mr-2" /> Criar Viagem
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
