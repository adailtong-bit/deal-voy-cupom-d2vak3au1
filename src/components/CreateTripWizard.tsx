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
import { useLanguage } from '@/stores/LanguageContext'
import { toast } from 'sonner'
import { DayPlan, Itinerary } from '@/lib/types'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

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
  const { t } = useLanguage()
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [interests, setInterests] = useState<string[]>([])

  const INTERESTS = [
    t('travel.int_gastronomy', 'Gastronomia'),
    t('travel.int_culture', 'Cultura'),
    t('travel.int_shopping', 'Compras'),
    t('travel.int_nightlife', 'Vida Noturna'),
    t('travel.int_relaxation', 'Relaxamento'),
    t('travel.int_adventure', 'Aventura'),
  ]

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
      toast.error(
        t('travel.trip_name_required', 'O nome do roteiro é obrigatório'),
      )
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
      description: `${t('travel.new_adventure', 'Um novo roteiro explorando')} ${interests.length ? interests.join(', ') : t('travel.all', 'tudo')}.`,
      stops: [],
      days: tripDays,
      tags: interests.length ? interests : [t('common.new', 'Novo')],
      duration: `${numDays} ${t('travel.days', 'Dias')}`,
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
            {step === 1 && t('travel.step_destination', 'Passo 1: Destino')}
            {step === 2 && t('travel.step_dates', 'Passo 2: Datas & Duração')}
            {step === 3 && t('travel.step_interests', 'Passo 3: Interesses')}
            {step === 4 && t('travel.step_review', 'Passo 4: Revisão')}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 min-h-[160px] flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label>
                  {t('travel.destination_name', 'Nome do Roteiro ou Destino')}
                </Label>
                <Input
                  placeholder={t(
                    'travel.destination_placeholder',
                    'ex. Verão em Paris',
                  )}
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
                  <Label>{t('travel.start_date', 'Data de Início')}</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('travel.end_date', 'Data de Fim')}</Label>
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
                  {t('travel.total_duration', 'Duração Total')}:{' '}
                  <strong>
                    {numDays} {t('travel.days', 'Dias')}
                  </strong>
                </p>
              )}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <Label>
                {t('travel.select_interests', 'Selecione seus interesses')}
              </Label>
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
                <span className="text-muted-foreground">
                  {t('travel.destination', 'Destino')}
                </span>{' '}
                <strong className="text-right">{title}</strong>
              </p>
              <p className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">
                  {t('travel.duration', 'Duração')}
                </span>{' '}
                <strong>
                  {numDays} {t('travel.days', 'Dias')}
                </strong>
              </p>
              <p className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">
                  {t('travel.period', 'Período')}
                </span>{' '}
                <strong className="text-right">
                  {startDate
                    ? new Date(startDate).toLocaleDateString()
                    : t('travel.n_a', 'N/D')}{' '}
                  -{' '}
                  {endDate
                    ? new Date(endDate).toLocaleDateString()
                    : t('travel.n_a', 'N/D')}
                </strong>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('travel.interests', 'Interesses')}
                </span>{' '}
                <strong className="text-right">
                  {interests.length
                    ? interests.join(', ')
                    : t('travel.none', 'Nenhum')}
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
              t('travel.cancel', 'Cancelar')
            ) : (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" />{' '}
                {t('travel.back', 'Voltar')}
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
              {t('travel.next', 'Próximo')}{' '}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleCreate} className="bg-primary">
              <Check className="w-4 h-4 mr-2" />{' '}
              {t('travel.create_trip', 'Criar Roteiro')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
