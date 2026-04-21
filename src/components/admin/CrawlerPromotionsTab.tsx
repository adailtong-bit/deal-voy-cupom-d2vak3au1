import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  updatePromotionStatus,
  updatePromotion,
  deletePromotion,
} from '@/services/crawler'
import { toast } from 'sonner'
import { Check, X, Edit2, ExternalLink, Copy, Save, Trash2 } from 'lucide-react'

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
    })
  }

  const saveEdit = async (id: string) => {
    try {
      await updatePromotion(id, {
        title: editForm.title,
        description: editForm.description,
        price: editForm.price ? parseFloat(editForm.price) : null,
        product_link: editForm.product_link,
        store_name: editForm.store_name,
      })
      toast.success('Promoção atualizada!')
      setEditingId(null)
      onStatusChange()
    } catch (e) {
      toast.error('Erro ao atualizar promoção')
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
  ) as string[]

  const uniqueCategories = Array.from(
    new Set(basePendingPromotions.map((p: any) => p.category).filter(Boolean)),
  ) as string[]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <select
            value={filterStore}
            onChange={(e) => setFilterStore(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="all">Todas as Lojas</option>
            {uniqueStores.map((store) => (
              <option key={store} value={store}>
                {store}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

      {/* List */}
      <div className="grid gap-4">
        {pendingPromotions.map((promo: any) => {
          const isEditing = editingId === promo.id
          const link =
            promo.product_link || promo.productLink || promo.source_url

          return (
            <div
              key={promo.id}
              className="p-4 border rounded-lg bg-white shadow-sm flex flex-col md:flex-row gap-4"
            >
              {/* Image */}
              <div className="w-24 h-24 shrink-0 bg-slate-100 rounded-md overflow-hidden flex items-center justify-center">
                {promo.image_url || promo.imageUrl ? (
                  <img
                    src={promo.image_url || promo.imageUrl}
                    alt={promo.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-slate-400">Sem imagem</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-3 min-w-0">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500">
                        Título
                      </label>
                      <input
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                        className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500">
                        Descrição
                      </label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                        className="flex min-h-[64px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-slate-500">
                          Preço
                        </label>
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) =>
                            setEditForm({ ...editForm, price: e.target.value })
                          }
                          className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium text-slate-500">
                          Loja
                        </label>
                        <input
                          value={editForm.store_name}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              store_name: e.target.value,
                            })
                          }
                          className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500">
                        Link do Produto
                      </label>
                      <input
                        value={editForm.product_link}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            product_link: e.target.value,
                          })
                        }
                        className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-semibold text-base line-clamp-2">
                        {promo.title || (
                          <span className="text-red-500 italic">
                            Sem título
                          </span>
                        )}
                      </h4>
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                        {promo.store_name ||
                          promo.storeName ||
                          'Loja Desconhecida'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {promo.description || (
                        <span className="text-slate-400 italic">
                          Sem descrição
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      <span className="font-bold text-emerald-600">
                        {promo.price
                          ? `R$ ${Number(promo.price).toFixed(2)}`
                          : 'Preço não capturado'}
                      </span>
                      <span className="text-slate-500 text-xs">
                        Capturado em:{' '}
                        {new Date(
                          promo.captured_at || promo.createdAt || new Date(),
                        ).toLocaleDateString()}
                      </span>

                      {link && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs px-2"
                            onClick={() =>
                              window.open(link, '_blank', 'noopener,noreferrer')
                            }
                            title="Abrir em nova guia (sem referer)"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Acessar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => copyLink(link)}
                            title="Copiar Link"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex md:flex-col gap-2 shrink-0 md:w-32 border-t md:border-t-0 pt-3 md:pt-0 md:border-l md:pl-4">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => saveEdit(promo.id)}
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-1" /> Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                      className="w-full"
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(promo.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="h-4 w-4 mr-1" /> Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing(promo)}
                      className="w-full"
                    >
                      <Edit2 className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReject(promo.id)}
                      className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    >
                      <X className="h-4 w-4 mr-1" /> Rejeitar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(promo.id)}
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Excluir
                    </Button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
