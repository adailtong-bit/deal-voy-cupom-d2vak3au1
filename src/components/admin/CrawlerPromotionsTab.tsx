import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ExternalLink,
  Check,
  X,
  Save,
  Copy,
  Filter,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'

export function CrawlerPromotionsTab({
  pendingPromotions,
  basePendingPromotions,
  filterState,
  setFilterState,
  filterCity,
  setFilterCity,
  filterStore,
  setFilterStore,
  filterSource,
  setFilterSource,
  filterCategory,
  setFilterCategory,
  filterFetchDate,
  setFilterFetchDate,
  isLoading,
  onStatusChange,
  type = 'pending',
}: any) {
  const uniqueStates = useMemo(
    () =>
      Array.from(
        new Set(basePendingPromotions.map((p: any) => p.state).filter(Boolean)),
      ),
    [basePendingPromotions],
  )
  const uniqueCities = useMemo(
    () =>
      Array.from(
        new Set(basePendingPromotions.map((p: any) => p.city).filter(Boolean)),
      ),
    [basePendingPromotions],
  )
  const uniqueStores = useMemo(
    () =>
      Array.from(
        new Set(
          basePendingPromotions
            .map((p: any) => p.storeName || p.store_name)
            .filter(Boolean),
        ),
      ),
    [basePendingPromotions],
  )
  const uniqueSources = useMemo(
    () =>
      Array.from(
        new Set(
          basePendingPromotions.map((p: any) => p.sourceId).filter(Boolean),
        ),
      ),
    [basePendingPromotions],
  )
  const uniqueCategories = useMemo(
    () =>
      Array.from(
        new Set(
          basePendingPromotions.map((p: any) => p.category).filter(Boolean),
        ),
      ),
    [basePendingPromotions],
  )
  const uniqueDates = useMemo(
    () =>
      Array.from(
        new Set(
          basePendingPromotions
            .map((p: any) => (p.capturedAt ? p.capturedAt.split('T')[0] : ''))
            .filter(Boolean),
        ),
      ),
    [basePendingPromotions],
  )

  return (
    <div className="space-y-4 min-w-0 w-full overflow-hidden">
      <Card className="min-w-0 w-full border-none shadow-none bg-slate-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4 text-sm font-medium text-slate-700">
            <Filter className="h-4 w-4" />
            Filtros
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Select value={filterState} onValueChange={setFilterState}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Estados</SelectItem>
                {uniqueStates.map((s: any) => (
                  <SelectItem key={s} value={s}>
                    {s as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCity} onValueChange={setFilterCity}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Cidades</SelectItem>
                {uniqueCities.map((s: any) => (
                  <SelectItem key={s} value={s}>
                    {s as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStore} onValueChange={setFilterStore}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Loja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Lojas</SelectItem>
                {uniqueStores.map((s: any) => (
                  <SelectItem key={s} value={s}>
                    {s as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Fonte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Fontes</SelectItem>
                {uniqueSources.map((s: any) => (
                  <SelectItem key={s} value={s}>
                    {s as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {uniqueCategories.map((s: any) => (
                  <SelectItem key={s} value={s}>
                    {s as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterFetchDate} onValueChange={setFilterFetchDate}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer Data</SelectItem>
                {uniqueDates.map((s: any) => (
                  <SelectItem key={s} value={s}>
                    {s as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 min-w-0 w-full overflow-x-hidden pb-4">
        {pendingPromotions.map((promo: any) => (
          <EditablePromotionCard
            key={promo.id}
            promo={promo}
            onSaved={onStatusChange}
            type={type}
          />
        ))}
        {pendingPromotions.length === 0 && (
          <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <p className="text-slate-500 font-medium">
              Nenhuma promoção correspondente aos filtros.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function EditablePromotionCard({ promo, onSaved, type = 'pending' }: any) {
  const [title, setTitle] = useState(promo.title || '')
  const [description, setDescription] = useState(promo.description || '')
  const [storeName, setStoreName] = useState(
    promo.store_name || promo.storeName || '',
  )
  const [link, setLink] = useState(promo.product_link || promo.source_url || '')
  const [isSaving, setIsSaving] = useState(false)
  const [showCampaignDialog, setShowCampaignDialog] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('discovered_promotions')
        .update({
          title,
          description,
          store_name: storeName,
          product_link: link,
        })
        .eq('id', promo.id)

      if (error) throw error
      toast.success('Alterações salvas com sucesso!')
      onSaved()
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleApprove = async () => {
    try {
      const { error } = await supabase
        .from('discovered_promotions')
        .update({ status: 'approved' })
        .eq('id', promo.id)
      if (error) throw error
      toast.success('Promoção aprovada com sucesso!')
      onSaved()
    } catch (err: any) {
      toast.error('Erro ao aprovar: ' + err.message)
    }
  }

  const handleReject = async () => {
    try {
      const { error } = await supabase
        .from('discovered_promotions')
        .update({ status: 'rejected' })
        .eq('id', promo.id)
      if (error) throw error
      toast.success('Promoção rejeitada!')
      onSaved()
    } catch (err: any) {
      toast.error('Erro ao rejeitar: ' + err.message)
    }
  }

  const handlePending = async () => {
    try {
      const { error } = await supabase
        .from('discovered_promotions')
        .update({ status: 'pending' })
        .eq('id', promo.id)
      if (error) throw error
      toast.success('Promoção movida para pendentes!')
      onSaved()
    } catch (err: any) {
      toast.error('Erro ao mover: ' + err.message)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(link)
    toast.success('Link copiado!')
  }

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm flex flex-col xl:flex-row gap-4 w-full max-w-full overflow-hidden transition-all hover:border-primary/30">
      {/* Content Area - CRITICAL: min-w-0 prevents this flex child from blowing past 100% width and pushing buttons off screen */}
      <div className="flex-1 min-w-0 space-y-3 overflow-hidden">
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">
            Título
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full font-medium"
            placeholder="Título da oferta"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
            <span>Descritivo Bruto / Original</span>
            <span className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-400">
              RAW DATA
            </span>
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-y min-h-[80px] text-sm font-mono bg-slate-50"
            placeholder="Descrição da oferta"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
          <div className="min-w-0">
            <label className="text-xs font-semibold text-slate-500 mb-1 block">
              Nome da Loja
            </label>
            <Input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full"
              placeholder="Ex: Booking"
            />
          </div>
          <div className="min-w-0">
            <label className="text-xs font-semibold text-slate-500 mb-1 block">
              Link Direto
            </label>
            <div className="flex gap-2 w-full min-w-0">
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="flex-1 min-w-0 font-mono text-xs"
                placeholder="https://..."
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                title="Copiar link"
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                asChild
                title="Abrir link seguro"
                className="shrink-0"
              >
                <a href={link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - CRITICAL: shrink-0 keeps buttons fixed size. overflow-x-auto provides horizontal scroll on mobile */}
      <div className="flex flex-row xl:flex-col gap-2 shrink-0 xl:w-36 overflow-x-auto pb-2 xl:pb-0 justify-start sm:justify-end xl:justify-start pt-2 xl:pt-0 border-t xl:border-t-0 xl:border-l border-slate-100 xl:pl-4">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="whitespace-nowrap flex-1 xl:flex-none justify-start"
        >
          <Save className="h-4 w-4 mr-2 shrink-0" /> Salvar Edição
        </Button>

        {type === 'pending' && (
          <Button
            size="sm"
            onClick={handleApprove}
            variant="default"
            className="bg-green-600 hover:bg-green-700 whitespace-nowrap flex-1 xl:flex-none justify-start"
          >
            <Check className="h-4 w-4 mr-2 shrink-0" /> Aprovar
          </Button>
        )}

        {type === 'approved' && (
          <>
            <Button
              size="sm"
              onClick={() => setShowCampaignDialog(true)}
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap flex-1 xl:flex-none justify-start text-white"
            >
              <Sparkles className="h-4 w-4 mr-2 shrink-0" /> Publicar Campanha
            </Button>
            <Button
              size="sm"
              onClick={handlePending}
              variant="outline"
              className="whitespace-nowrap flex-1 xl:flex-none justify-start"
            >
              <RotateCcw className="h-4 w-4 mr-2 shrink-0" /> Pendente
            </Button>
          </>
        )}

        <Button
          size="sm"
          onClick={handleReject}
          variant="destructive"
          className="whitespace-nowrap flex-1 xl:flex-none justify-start"
        >
          <X className="h-4 w-4 mr-2 shrink-0" /> Rejeitar
        </Button>
      </div>

      <CampaignFormDialog
        open={showCampaignDialog}
        onOpenChange={(open) => {
          setShowCampaignDialog(open)
          if (!open) {
            onSaved()
          }
        }}
        coupon={{
          id: promo.id,
          title: title || '',
          description: description || '',
          image: promo.image_url || '',
          externalUrl: link || '',
          companyId: promo.company_id || '',
          category: promo.category || 'Outros',
          discount: promo.discount || '',
          startDate: promo.start_date || new Date().toISOString().split('T')[0],
          endDate:
            promo.end_date ||
            new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        }}
      />
    </div>
  )
}
