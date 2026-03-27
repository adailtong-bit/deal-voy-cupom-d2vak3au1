import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, Mail, Send } from 'lucide-react'
import { User } from '@/lib/types'
import { toast } from 'sonner'

interface StaffTabProps {
  parentType?: 'franchise' | 'company' | 'global'
  parentId?: string
}

export function StaffTab({ parentType = 'global', parentId }: StaffTabProps) {
  const { users, addUser, updateUser, deleteUser, companies, franchises } =
    useCouponStore()
  const { t } = useLanguage()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<User | null>(null)

  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    staffRole: '',
    status: 'active',
  })

  const [inviteData, setInviteData] = useState({
    name: '',
    email: '',
    staffRole: t('franchisee.staff.default_manager', 'Manager'),
  })

  const staffList = users.filter((u) => {
    if (u.role !== 'staff') return false
    if (parentType === 'company' && u.companyId !== parentId) return false
    if (parentType === 'franchise' && u.franchiseId !== parentId) return false
    return true
  })

  const handleOpenDialog = (staff?: User) => {
    if (staff) {
      setEditingStaff(staff)
      setFormData(staff)
    } else {
      setEditingStaff(null)
      setFormData({
        name: '',
        email: '',
        staffRole: t('franchisee.staff.default_manager', 'Manager'),
        status: 'active',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingStaff) {
      updateUser(editingStaff.id, formData)
    } else {
      const newUser: User = {
        ...(formData as User),
        id: Math.random().toString(),
        role: 'staff',
        companyId: parentType === 'company' ? parentId : undefined,
        franchiseId: parentType === 'franchise' ? parentId : undefined,
      }
      addUser(newUser)
    }
    setIsDialogOpen(false)
  }

  const handleInvite = () => {
    const newUser: User = {
      id: Math.random().toString(),
      name: inviteData.name,
      email: inviteData.email,
      role: 'staff',
      staffRole: inviteData.staffRole,
      companyId: parentType === 'company' ? parentId : undefined,
      franchiseId: parentType === 'franchise' ? parentId : undefined,
      status: 'invited',
    }
    addUser(newUser)
    toast.success(
      t(
        'common.success',
        `Convite enviado para ${inviteData.email} com link seguro.`,
      ),
    )
    setIsInviteDialogOpen(false)
    setInviteData({
      name: '',
      email: '',
      staffRole: t('franchisee.staff.default_manager', 'Manager'),
    })
  }

  const getParentName = (u: User) => {
    if (u.companyId) return companies.find((c) => c.id === u.companyId)?.name
    if (u.franchiseId)
      return franchises.find((f) => f.id === u.franchiseId)?.name
    return t('franchisee.staff.global', 'Global')
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-4 rounded-lg border gap-4">
        <div>
          <h3 className="text-lg font-bold">
            {t('franchisee.staff.title', 'Equipe')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(
              'franchisee.staff.desc',
              'Gerencie o acesso e as funções dos funcionários na sua organização.',
            )}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setIsInviteDialogOpen(true)}>
            <Mail className="w-4 h-4 mr-2" />{' '}
            {t('franchisee.staff.invite', 'Convidar Usuário')}
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />{' '}
            {t('franchisee.staff.add', 'Adicionar Membro')}
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {t('franchisee.staff.name', 'Nome do Funcionário')}
              </TableHead>
              <TableHead>{t('franchisee.staff.email', 'E-mail')}</TableHead>
              <TableHead>
                {t('franchisee.staff.role', 'Função / Cargo')}
              </TableHead>
              {parentType === 'global' && (
                <TableHead>
                  {t('franchisee.staff.affiliation', 'Afiliação')}
                </TableHead>
              )}
              <TableHead>{t('franchisee.staff.status', 'Status')}</TableHead>
              <TableHead className="text-right">
                {t('franchisee.staff.action', 'Ação')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffList.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  {u.staffRole || t('franchisee.staff.default_staff', 'Staff')}
                </TableCell>
                {parentType === 'global' && (
                  <TableCell>
                    <Badge variant="outline">{getParentName(u)}</Badge>
                  </TableCell>
                )}
                <TableCell>
                  <Badge
                    variant={
                      u.status === 'invited'
                        ? 'outline'
                        : u.status === 'inactive'
                          ? 'secondary'
                          : 'default'
                    }
                  >
                    {t(`franchisee.staff.${u.status || 'active'}`)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(u)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteUser(u.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {staffList.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-muted-foreground"
                >
                  {t(
                    'franchisee.staff.no_staff',
                    'Nenhum membro da equipe registrado.',
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStaff
                ? t('franchisee.staff.edit', 'Editar Membro')
                : t('franchisee.staff.add', 'Adicionar Membro')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('franchisee.staff.form_name', 'Nome')}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('franchisee.staff.form_email', 'E-mail')}</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {t('franchisee.staff.form_role', 'Cargo / Função')}
                </Label>
                <Input
                  placeholder={t(
                    'franchisee.staff.form_role_ph',
                    'ex. Gerente, Caixa',
                  )}
                  value={formData.staffRole}
                  onChange={(e) =>
                    setFormData({ ...formData, staffRole: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('franchisee.staff.form_status', 'Status')}</Label>
                <Select
                  value={formData.status || 'active'}
                  onValueChange={(v: any) =>
                    setFormData({ ...formData, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('franchisee.staff.form_status', 'Status')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      {t('franchisee.staff.active', 'Ativo')}
                    </SelectItem>
                    <SelectItem value="inactive">
                      {t('franchisee.staff.inactive', 'Inativo')}
                    </SelectItem>
                    <SelectItem value="invited">
                      {t('franchisee.staff.invited', 'Convidado')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('common.cancel', 'Cancelar')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || !formData.email}
            >
              {t('common.save', 'Salvar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('franchisee.staff.send_invite', 'Enviar Convite')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('franchisee.staff.form_name', 'Nome')}</Label>
              <Input
                value={inviteData.name}
                onChange={(e) =>
                  setInviteData({ ...inviteData, name: e.target.value })
                }
                placeholder={t('franchisee.staff.form_name', 'Nome')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('franchisee.staff.form_email', 'E-mail')}</Label>
              <Input
                type="email"
                value={inviteData.email}
                onChange={(e) =>
                  setInviteData({ ...inviteData, email: e.target.value })
                }
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('franchisee.staff.form_role', 'Cargo / Função')}</Label>
              <Input
                value={inviteData.staffRole}
                onChange={(e) =>
                  setInviteData({ ...inviteData, staffRole: e.target.value })
                }
                placeholder={t(
                  'franchisee.staff.form_role_ph',
                  'ex. Gerente, Caixa',
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInviteDialogOpen(false)}
            >
              {t('common.cancel', 'Cancelar')}
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!inviteData.email || !inviteData.name}
            >
              <Send className="w-4 h-4 mr-2" />{' '}
              {t('franchisee.staff.send_invite', 'Enviar Convite')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
