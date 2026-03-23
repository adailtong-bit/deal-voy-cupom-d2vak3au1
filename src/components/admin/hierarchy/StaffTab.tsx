import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
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
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { User } from '@/lib/types'

interface StaffTabProps {
  parentType?: 'franchise' | 'company' | 'global'
  parentId?: string
}

export function StaffTab({ parentType = 'global', parentId }: StaffTabProps) {
  const { users, addUser, updateUser, deleteUser, companies, franchises } =
    useCouponStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<User | null>(null)
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    staffRole: '',
    status: 'active',
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
        staffRole: 'Manager',
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

  const getParentName = (u: User) => {
    if (u.companyId) return companies.find((c) => c.id === u.companyId)?.name
    if (u.franchiseId)
      return franchises.find((f) => f.id === u.franchiseId)?.name
    return 'Global'
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
        <div>
          <h3 className="text-lg font-bold">Team Members</h3>
          <p className="text-sm text-muted-foreground">
            Manage employee access and roles within your organization.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" /> Add Staff
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Function / Role</TableHead>
              {parentType === 'global' && <TableHead>Affiliation</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffList.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.staffRole || 'Staff'}</TableCell>
                {parentType === 'global' && (
                  <TableCell>
                    <Badge variant="outline">{getParentName(u)}</Badge>
                  </TableCell>
                )}
                <TableCell>
                  <Badge
                    variant={u.status === 'inactive' ? 'secondary' : 'default'}
                  >
                    {u.status || 'active'}
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
                  No staff members registered.
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
              {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
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
                <Label>Role / Function</Label>
                <Input
                  placeholder="e.g. Manager, Cashier"
                  value={formData.staffRole}
                  onChange={(e) =>
                    setFormData({ ...formData, staffRole: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status || 'active'}
                  onValueChange={(v: any) =>
                    setFormData({ ...formData, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || !formData.email}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
