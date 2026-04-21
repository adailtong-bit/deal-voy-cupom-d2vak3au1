import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  updatePromotionStatus,
  updatePromotion,
  deletePromotion,
} from '@/services/crawler'
import { toast } from 'sonner'
import {
  Check,
  X,
  Edit2,
  ExternalLink,
  Copy,
  Save,
  Trash2,
  Tag,
  Calendar,
  DollarSign,
  Image as ImageIcon,
} from 'lucide-react'

const inputClasses =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
const textareaClasses =
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none'
const labelClasses = 'text-sm font-medium text-slate-700 leading-none'

export function CrawlerPromotionsTab({
  pendingPromotions,
  basePendingPromotions,
  filterStore,
  setFilterStore,
  filterCategory,
  setFilterCategory,
  onStatusChange,
}: any) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleApprove = async (id: string) => {
    try {
      await updatePromotionStatus(id, 'approved')
      toast.success('Promoção aprovada com sucesso!')
      onStatusChange()
    } catch (e) {
      toast.error('Erro ao aprovar promoção')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await updatePromotionStatus(id, 'rejected')
      toast.success('Promoção rejeitada')
      onStatusChange()
    } catch (e) {
      toast.error('Erro ao rejeitar promoção')
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        'Tem certeza que deseja excluir esta promoção permanentemente?',
      )
    )
      return
    try {
      await deletePromotion(id)
      toast.success('Promoção excluída')
      onStatusChange()
    } catch (e) {
      toast.error('Erro ao excluir promoção')
    }
  }

  const startEditing = (promo: any) => {
    setEditingId(promo.id)
    setEditForm({
      title: promo.title || '',
      description: promo.description || '',
      price: promo.price || '',
      product_link:
        promo.product_link || promo.productLink || promo.source_url || '',
      store_name: promo.store_name || promo.storeName || '',
      image_url: promo.image_url || promo.imageUrl || '',
      category: promo.category || 'geral',
    })
  }

  const saveEdit = async (id: string) => {
    if (!editForm.title?.trim()) {
      toast.error('O título é obrigatório')
      return
    }

    setIsSubmitting(true)
    try {
      await updatePromotion(id, {
        title: editForm.title.trim(),
        description: editForm.description?.trim() || null,
        price: editForm.price ? parseFloat(editForm.price) : null,
        product_link: editForm.product_link?.trim() || null,
        store_name: editForm.store_name?.trim() || null,
        image_url: editForm.image_url?.trim() || null,
        category: editForm.category?.trim() || 'geral',
      })
      toast.success('Promoção atualizada com sucesso!')
      setEditingId(null)
      onStatusChange()
    } catch (e) {
      toast.error('Erro ao salvar as alterações')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenLink = (url: string) => {
    if (!url) {
      toast.error('Nenhum link disponível')
      return
    }
    try {
      const absoluteUrl = url.startsWith('http') ? url : `https://${url}`
      const a = document.createElement('a')
      a.href = absoluteUrl
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (e) {
      toast.error('Link inválido ou bloqueado')
    }
  }

  const copyLink = (link: string) => {
    if (!link) return
    navigator.clipboard.writeText(link)
    toast.success('Link copiado para a área de transferência')
  }

  const uniqueStores = Array.from(
    new Set(
      basePendingPromotions
        .map((p: any) => p.store_name || p.storeName)
        .filter(Boolean),
    ),
  ).sort() as string[]

  const uniqueCategories = Array.from(
    new Set(basePendingPromotions.map((p: any) => p.category).filter(Boolean)),
  ).sort() as string[]

  return (
    <div className="space-y-6">
      {/* Filters Area */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Filtrar por Loja
          </label>
          <select
            value={filterStore}
            onChange={(e) => setFilterStore(e.target.value)}
            className={inputClasses}
          >
            <option value="all">Todas as Lojas</option>
            {uniqueStores.map((store) => (
              <option key={store} value={store}>
                {store}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Filtrar por Categoria
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={inputClasses}
          >
            <option value="all">Todas as Categorias</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Promotions List */}
      <div className="grid gap-6">
        {pendingPromotions.map((promo: any) => {
          const isEditing = editingId === promo.id
          const link =
            promo.product_link || promo.productLink || promo.source_url
          const imageUrl = promo.image_url || promo.imageUrl

          return (
            <div
              key={promo.id}
              className="group flex flex-col md:flex-row bg-white rounded-xl border shadow-sm overflow-hidden hover:border-slate-300 transition-colors duration-200"
            >
              {/* Image Column */}
              <div className="md:w-56 h-48 md:h-auto bg-slate-50 flex items-center justify-center shrink-0 border-b md:border-b-0 md:border-r relative">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={promo.title || 'Oferta'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        'https://img.usecurling.com/p/400/400?q=box&color=gray'
                    }}
                  />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center p-4 text-center">
                    <ImageIcon className="w-10 h-10 mb-2 opacity-30" />
                    <span className="text-xs font-medium uppercase tracking-wider">
                      Sem Imagem
                    </span>
                  </div>
                )}

                {/* Absolute delete button for clean UI when not editing */}
                {!isEditing && (
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="absolute top-2 left-2 p-1.5 bg-white/80 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-md backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100 border shadow-sm"
                    title="Excluir Permanentemente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Content Column */}
              <div className="flex-1 p-5 md:p-6">
                {isEditing ? (
                  /* --- EDIT MODE --- */
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h4 className="font-semibold text-slate-900 flex items-center">
                        <Edit2 className="w-4 h-4 mr-2 text-primary" />
                        Editando Oferta
                      </h4>
                      <span className="text-xs text-slate-500 font-mono">
                        ID: {promo.id.split('-')[0]}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="space-y-1.5 md:col-span-12">
                        <label className={labelClasses}>Título da Oferta</label>
                        <input
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm({ ...editForm, title: e.target.value })
                          }
                          className={inputClasses}
                          placeholder="Ex: Smartphone Samsung Galaxy..."
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-12">
                        <label className={labelClasses}>Descrição</label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              description: e.target.value,
                            })
                          }
                          className={textareaClasses}
                          placeholder="Detalhes, regras, cupons aplicáveis..."
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-3">
                        <label className={labelClasses}>Preço</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-500 text-sm">
                            R$
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.price}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                price: e.target.value,
                              })
                            }
                            className={`${inputClasses} pl-9`}
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 md:col-span-5">
                        <label className={labelClasses}>Nome da Loja</label>
                        <input
                          value={editForm.store_name}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              store_name: e.target.value,
                            })
                          }
                          className={inputClasses}
                          placeholder="Ex: Amazon, Shopee..."
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-4">
                        <label className={labelClasses}>Categoria</label>
                        <input
                          value={editForm.category}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              category: e.target.value,
                            })
                          }
                          className={inputClasses}
                          placeholder="Ex: eletrônicos, casa..."
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-12">
                        <label className={labelClasses}>
                          Link do Produto / Destino
                        </label>
                        <div className="flex gap-2">
                          <input
                            value={editForm.product_link}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                product_link: e.target.value,
                              })
                            }
                            className={inputClasses}
                            placeholder="https://..."
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                              handleOpenLink(editForm.product_link)
                            }
                            title="Testar Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1.5 md:col-span-12">
                        <label className={labelClasses}>URL da Imagem</label>
                        <input
                          value={editForm.image_url}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              image_url: e.target.value,
                            })
                          }
                          className={inputClasses}
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                      <Button
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => saveEdit(promo.id)}
                        disabled={isSubmitting}
                        className="bg-primary text-white"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* --- VIEW MODE --- */
                  <div className="flex flex-col h-full justify-between gap-6">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <h3 className="font-bold text-lg text-slate-900 leading-tight">
                          {promo.title || (
                            <span className="text-red-500 italic font-normal">
                              Sem título capturado
                            </span>
                          )}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap shrink-0">
                          {promo.store_name ||
                            promo.storeName ||
                            'Loja Desconhecida'}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 line-clamp-3 mb-5 leading-relaxed">
                        {promo.description || (
                          <span className="text-slate-400 italic">
                            Nenhuma descrição foi extraída para esta oferta.
                          </span>
                        )}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                        {promo.price ? (
                          <div className="flex items-center text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                            <DollarSign className="w-4 h-4 mr-0.5" />
                            {Number(promo.price).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                            <DollarSign className="w-4 h-4 mr-0.5" />
                            Preço Indisponível
                          </div>
                        )}

                        {promo.category && promo.category !== 'geral' && (
                          <div className="flex items-center capitalize">
                            <Tag className="w-4 h-4 mr-1.5 opacity-70" />
                            {promo.category}
                          </div>
                        )}

                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1.5 opacity-70" />
                          {new Date(
                            promo.captured_at || promo.createdAt || new Date(),
                          ).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {link ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenLink(link)}
                              className="h-9"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Acessar Destino
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyLink(link)}
                              title="Copiar Link"
                              className="h-9 w-9"
                            >
                              <Copy className="h-4 w-4 text-slate-500" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200">
                            URL de destino ausente
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => startEditing(promo)}
                          className="h-9 bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReject(promo.id)}
                          className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1.5" />
                          Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(promo.id)}
                          className="h-9 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                        >
                          <Check className="h-4 w-4 mr-1.5" />
                          Aprovar Oferta
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
