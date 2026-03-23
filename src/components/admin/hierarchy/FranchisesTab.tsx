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
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { Franchise } from '@/lib/types'

export function FranchisesTab() {
  const { franchises, addFranchise, updateFranchise, deleteFranchise } =
    useCouponStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFranchise, setEditingFranchise] = useState<Franchise | null>(
    null,
  )
  const [formData, setFormData] = useState<Partial<Franchise>>({
    name: '',
    taxId: '',
    contactPerson: '',
    contactEmail: '',
    address: '',
    status: 'active',
  })

  const handleOpenDialog = (franchise?: Franchise) => {
    if (franchise) {
      setEditingFranchise(franchise)
      setFormData(franchise)
    } else {
      setEditingFranchise(null)
      setFormData({
        name: '',
        taxId: '',
        contactPerson: '',
        contactEmail: '',
        address: '',
        status: 'active',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingFranchise) {
      updateFranchise(editingFranchise.id, formData)
    } else {
      const newFranchise: Franchise = {
        ...(formData as Franchise),
        id: Math.random().toString(),
        region: formData.address || 'Global',
        ownerId: 'u_fran', // Mocked, ideally from dropdown of users
        licenseExpiry: new Date(Date.now() + 31536000000).toISOString(),
      }
      addFranchise(newFranchise)
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
        <div>
          <h3 className="text-lg font-bold">Franchise Network</h3>
          <p className="text-sm text-muted-foreground">
            Manage your master franchises and their primary contacts.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" /> Add Franchise
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Franchise Name</TableHead>
              <TableHead>CNPJ / Tax ID</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {franchises.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.name}</TableCell>
                <TableCell>{f.taxId || 'N/A'}</TableCell>
                <TableCell>
                  <p className="text-sm">{f.contactPerson || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">
                    {f.contactEmail || f.ownerId}
                  </p>
                </TableCell>
                <TableCell>{f.region || f.address}</TableCell>
                <TableCell>
                  <Badge
                    variant={f.status === 'active' ? 'default' : 'secondary'}
                  >
                    {f.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(f)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteFranchise(f.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFranchise ? 'Edit Franchise' : 'Register Franchise'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Business ID (CNPJ)</Label>
                <Input
                  value={formData.taxId}
                  onChange={(e) =>
                    setFormData({ ...formData, taxId: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input
                  value={formData.contactPerson}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPerson: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Region / Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || !formData.contactEmail}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
