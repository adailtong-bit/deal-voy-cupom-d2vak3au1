import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
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

export function AdminInterestsTab({ franchiseId }: { franchiseId?: string }) {
  const { platformSettings, updatePlatformSettings } = useCouponStore()
  const { t } = useLanguage()

  const interests = platformSettings.availableInterests || []
  const [newLabel, setNewLabel] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')

  const handleAdd = () => {
    if (!newLabel.trim()) return
    const id = newLabel.trim().toLowerCase().replace(/\s+/g, '-')
    if (interests.find((i) => i.id === id)) return // prevent duplicate ids

    const newInterest = {
      id,
      label: newLabel.trim(),
      icon: 'Tag',
    }
    updatePlatformSettings({
      availableInterests: [...interests, newInterest],
    })
    setNewLabel('')
  }

  const handleDelete = (id: string) => {
    updatePlatformSettings({
      availableInterests: interests.filter((i) => i.id !== id),
    })
  }

  const startEdit = (id: string, label: string) => {
    setEditingId(id)
    setEditLabel(label)
  }

  const saveEdit = () => {
    if (!editLabel.trim()) return
    updatePlatformSettings({
      availableInterests: interests.map((i) =>
        i.id === editingId ? { ...i, label: editLabel.trim() } : i,
      ),
    })
    setEditingId(null)
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
          <div className="flex gap-4 mb-6">
            <Input
              placeholder={t(
                'franchisee.interests.new',
                'Novo interesse (ex: Tecnologia)',
              )}
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd}>
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
                        {interest.label}
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
                      'Nenhum interesse cadastrado.',
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
