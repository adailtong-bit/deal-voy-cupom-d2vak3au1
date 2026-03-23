import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { Button } from '@/components/ui/button'
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
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { Franchise } from '@/lib/types'
import { AdvancedCompanyForm } from './AdvancedCompanyForm'

export function FranchisesTab() {
  const { franchises, addFranchise, updateFranchise, deleteFranchise } =
    useCouponStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFranchise, setEditingFranchise] = useState<Franchise | null>(
    null,
  )

  const handleOpenDialog = (franchise?: Franchise) => {
    if (franchise) {
      setEditingFranchise(franchise)
    } else {
      setEditingFranchise(null)
    }
    setIsDialogOpen(true)
  }

  const handleSave = (finalData: any) => {
    if (editingFranchise) {
      updateFranchise(editingFranchise.id, finalData)
    } else {
      const newFranchise: Franchise = {
        ...(finalData as Franchise),
        id: Math.random().toString(),
        region: finalData.addressState || finalData.addressCity || 'Global',
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
                <TableCell>{f.region || f.addressState || f.address}</TableCell>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFranchise ? 'Editar Franquia' : 'Cadastrar Franquia'}
            </DialogTitle>
          </DialogHeader>
          <AdvancedCompanyForm
            type="franchise"
            initialData={editingFranchise}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
