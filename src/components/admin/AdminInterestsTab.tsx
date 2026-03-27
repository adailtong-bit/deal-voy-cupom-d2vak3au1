import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { CATEGORIES } from '@/lib/data'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Trash2, Edit2, Check, X, Tag } from 'lucide-react'
import { toast } from 'sonner'

export function AdminInterestsTab({ franchiseId }: { franchiseId?: string }) {
  const { platformSettings, updatePlatformSettings } = useCouponStore()
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const searchQuery = (searchParams.get('q') || '').toLowerCase()

  const interests = (platformSettings.availableInterests || []).filter((i) => {
    if (!searchQuery) return true
    return (
      i.label.toLowerCase().includes(searchQuery) ||
      i.id.toLowerCase().includes(searchQuery)
    )
  })

  const [newLabel, setNewLabel] = useState('')
  const [newId, setNewId] = useState('')
  const [newIdManuallyEdited, setNewIdManuallyEdited] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mask: Prevent double spaces and start with letter
    const val = e.target.value.replace(/\s{2,}/g, ' ')
    setNewLabel(val)

    if (!newIdManuallyEdited) {
      setNewId(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-'),
      )
    }
  }

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewIdManuallyEdited(true)
    // Mask: Only lowercase letters, numbers, and hyphens
    setNewId(
      e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-'),
    )
  }

  const handleAdd = () => {
    if (!newLabel.trim() || !newId.trim()) return
    const cleanId = newId.trim().replace(/-$/, '') // remove trailing dash
    const allInterests = platformSettings.availableInterests || []

    if (allInterests.find((i) => i.id === cleanId)) {
      toast.error(t('common.error', 'Ocorreu um erro'))
      return
    }

    const newInterest = {
      id: cleanId,
      label: newLabel.trim(),
      icon: 'Tag',
    }
    updatePlatformSettings({
      availableInterests: [...allInterests, newInterest],
    })
    setNewLabel('')
    setNewId('')
    setNewIdManuallyEdited(false)
  }

  const handleDelete = (id: string) => {
    const allInterests = platformSettings.availableInterests || []
    updatePlatformSettings({
      availableInterests: allInterests.filter((i) => i.id !== id),
    })
  }

  const startEdit = (id: string, label: string) => {
    setEditingId(id)
    setEditLabel(label)
  }

  const saveEdit = () => {
    if (!editLabel.trim()) return
    const allInterests = platformSettings.availableInterests || []
    // Mask edit label as well to prevent double spaces
    const cleanLabel = editLabel.replace(/\s{2,}/g, ' ').trim()
    updatePlatformSettings({
      availableInterests: allInterests.map((i) =>
        i.id === editingId ? { ...i, label: cleanLabel } : i,
      ),
    })
    setEditingId(null)
  }

  const getTranslatedInterest = (interest: { id: string; label: string }) => {
    const cat = CATEGORIES.find(
      (c) =>
        c.id.toLowerCase() === interest.id.toLowerCase() ||
        c.label.toLowerCase() === interest.label.toLowerCase() ||
        interest.id.includes(c.id.toLowerCase()) ||
        interest.id.includes(c.label.toLowerCase()),
    )
    if (cat) {
      return t(cat.translationKey, interest.label)
    }

    const lowerId = interest.id.toLowerCase()
    const lowerLabel = interest.label.toLowerCase()

    if (lowerId === 'lazer' || lowerLabel === 'lazer') {
      return t('category.leisure', 'Leisure')
    }
    if (
      lowerId === 'eletronicos' ||
      lowerId === 'eletrônicos' ||
      lowerLabel === 'eletronicos' ||
      lowerLabel === 'eletrônicos'
    ) {
      return t('category.electronics', 'Electronics')
    }
    if (lowerId === 'beleza' || lowerLabel === 'beleza') {
      return t('category.beauty', 'Beauty')
    }

    return interest.label
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card>
        <CardHeader>
          <CardTitle>
            {t('franchisee.interests.title', 'Gerenciar Interesses')}
          </CardTitle>
          <CardDescription>
            {t(
              'franchisee.interests.desc',
              'Adicione, edite ou remova as categorias de interesse que os usuários podem selecionar em seus perfis.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder={t(
                'franchisee.interests.new',
                'Novo interesse (ex: Tecnologia)',
              )}
              value={newLabel}
              onChange={handleLabelChange}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1"
            />
            <Input
              placeholder={t(
                'franchisee.interests.new_id',
                'ID (ex: tecnologia)',
              )}
              value={newId}
              onChange={handleIdChange}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="sm:w-48 bg-slate-50 font-mono text-sm"
            />
            <Button onClick={handleAdd} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />{' '}
              {t('franchisee.interests.add', 'Adicionar')}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t('franchisee.interests.name', 'Nome do Interesse')}
                </TableHead>
                <TableHead>
                  {t('franchisee.interests.id', 'ID (Sistema)')}
                </TableHead>
                <TableHead className="text-right">
                  {t('franchisee.interests.actions', 'Ações')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interests.map((interest) => (
                <TableRow key={interest.id}>
                  <TableCell className="font-medium">
                    {editingId === interest.id ? (
                      <Input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="max-w-[200px]"
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        {getTranslatedInterest(interest)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {interest.id}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === interest.id ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={saveEdit}
                          className="text-green-600"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingId(null)}
                          className="text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(interest.id, interest.label)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(interest.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {interests.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t(
                      'franchisee.interests.no_interests',
                      'Nenhum interesse encontrado.',
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
