import { useState } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
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
import { cn } from '@/lib/utils'

export function AdminInterestsTab({ franchiseId }: { franchiseId?: string }) {
  const { platformSettings, updatePlatformSettings } = useCouponStore()
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const searchQuery = (searchParams.get('q') || '').toLowerCase()
  const location = useLocation()
  const isFranchisee = location.pathname.includes('/franchisee')

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
  const [isLoading, setIsLoading] = useState(false)

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setNewId(
      e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-'),
    )
  }

  const handleAdd = async () => {
    if (!newLabel.trim() || !newId.trim() || isLoading) return
    const cleanId = newId.trim().replace(/-$/, '') // remove trailing dash
    const allInterests = platformSettings.availableInterests || []

    if (allInterests.find((i) => i.id === cleanId)) {
      toast.error(t('common.error', 'An error occurred'))
      return
    }

    const newInterest = {
      id: cleanId,
      label: newLabel.trim(),
      icon: 'Tag',
    }

    setIsLoading(true)
    try {
      await updatePlatformSettings({
        availableInterests: [...allInterests, newInterest],
      })
      setNewLabel('')
      setNewId('')
      setNewIdManuallyEdited(false)
      toast.success(t('common.success', 'Success!'))
    } catch (e) {
      toast.error(t('common.error', 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const allInterests = platformSettings.availableInterests || []
    setIsLoading(true)
    try {
      await updatePlatformSettings({
        availableInterests: allInterests.filter((i) => i.id !== id),
      })
      toast.success(t('common.success', 'Success!'))
    } catch (e) {
      toast.error(t('common.error', 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }

  const startEdit = (id: string, label: string) => {
    setEditingId(id)
    setEditLabel(label)
  }

  const saveEdit = async () => {
    if (!editLabel.trim() || isLoading) return
    const allInterests = platformSettings.availableInterests || []
    const cleanLabel = editLabel.replace(/\s{2,}/g, ' ').trim()

    setIsLoading(true)
    try {
      await updatePlatformSettings({
        availableInterests: allInterests.map((i) =>
          i.id === editingId ? { ...i, label: cleanLabel } : i,
        ),
      })
      setEditingId(null)
      toast.success(t('common.success', 'Success!'))
    } catch (e) {
      toast.error(t('common.error', 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
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
    <div
      className={cn(
        'space-y-6 animate-fade-in-up w-full',
        !isFranchisee && 'min-w-0 max-w-full',
      )}
    >
      <Card
        className={cn('w-full', !isFranchisee && 'min-w-0 overflow-hidden')}
      >
        <CardHeader className="min-w-0">
          <CardTitle className="truncate">
            {t('franchisee.interests.title', 'Manage Interests')}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {t(
              'franchisee.interests.desc',
              'Add, edit or remove interest categories users can select in their profiles.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent
          className={cn(
            'p-4 sm:p-6',
            !isFranchisee && 'overflow-x-auto min-w-0',
          )}
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-6 min-w-0">
            <Input
              placeholder={t(
                'franchisee.interests.new',
                'New interest (e.g. Technology)',
              )}
              value={newLabel}
              onChange={handleLabelChange}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1 min-w-[200px]"
              disabled={isLoading}
            />
            <Input
              placeholder={t(
                'franchisee.interests.new_id',
                'ID (e.g. technology)',
              )}
              value={newId}
              onChange={handleIdChange}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="sm:w-48 bg-slate-50 font-mono text-sm shrink-0"
              disabled={isLoading}
            />
            <Button
              onClick={handleAdd}
              className="shrink-0 w-full sm:w-auto"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />{' '}
              {t('franchisee.interests.add', 'Add')}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">
                  {t('franchisee.interests.name', 'Interest Name')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('franchisee.interests.id', 'ID (System)')}
                </TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  {t('franchisee.interests.actions', 'Actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interests.map((interest) => (
                <TableRow key={interest.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {editingId === interest.id ? (
                      <Input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="max-w-[200px]"
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        disabled={isLoading}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate">
                          {getTranslatedInterest(interest)}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell
                    className="text-muted-foreground font-mono text-xs whitespace-nowrap max-w-[150px] truncate"
                    title={interest.id}
                  >
                    {interest.id}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {editingId === interest.id ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={saveEdit}
                          className="text-green-600"
                          disabled={isLoading}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingId(null)}
                          className="text-destructive"
                          disabled={isLoading}
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
                          disabled={isLoading}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(interest.id)}
                          className="text-destructive"
                          disabled={isLoading}
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
                      'No interests found.',
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
