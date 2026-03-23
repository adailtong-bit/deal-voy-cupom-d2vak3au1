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
import { Plus, Edit2, Trash2, Store } from 'lucide-react'
import { Company } from '@/lib/types'
import { AdvancedCompanyForm } from './AdvancedCompanyForm'

export function MerchantsTab({ franchiseId }: { franchiseId?: string }) {
  const { companies, franchises, addCompany, updateCompany, deleteCompany } =
    useCouponStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMerchant, setEditingMerchant] = useState<Company | null>(null)

  const displayCompanies = franchiseId
    ? companies.filter((c) => c.franchiseId === franchiseId)
    : companies

  const handleOpenDialog = (merchant?: Company) => {
    if (merchant) {
      setEditingMerchant(merchant)
    } else {
      setEditingMerchant(null)
    }
    setIsDialogOpen(true)
  }

  const handleSave = (finalData: any) => {
    const formattedData = {
      ...finalData,
      franchiseId:
        finalData.franchiseId === 'independent'
          ? undefined
          : finalData.franchiseId,
      region: finalData.addressState || finalData.addressCity || 'Global',
    }

    if (editingMerchant) {
      updateCompany(editingMerchant.id, formattedData)
    } else {
      const newCompany: Company = {
        ...formattedData,
        id: Math.random().toString(),
        registrationDate: new Date().toISOString(),
        enableLoyalty: false,
      }
      addCompany(newCompany)
    }
    setIsDialogOpen(false)
  }

  const getFranchiseName = (id?: string) => {
    if (!id) return 'Independent'
    return franchises.find((f) => f.id === id)?.name || 'Unknown'
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full text-primary hidden sm:block">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Merchants Directory</h3>
            <p className="text-sm text-muted-foreground">
              {franchiseId
                ? 'Manage merchants linked to your franchise.'
                : 'Manage all independent and franchise-linked merchants.'}
            </p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" /> Add Merchant
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Location</TableHead>
              {!franchiseId && <TableHead>Affiliation</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayCompanies.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.region}</TableCell>
                {!franchiseId && (
                  <TableCell>
                    <Badge variant="outline">
                      {getFranchiseName(c.franchiseId)}
                    </Badge>
                  </TableCell>
                )}
                <TableCell>
                  <Badge
                    variant={c.status === 'active' ? 'default' : 'secondary'}
                  >
                    {c.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(c)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCompany(c.id)}
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
              {editingMerchant ? 'Editar Lojista' : 'Cadastrar Lojista'}
            </DialogTitle>
          </DialogHeader>
          <AdvancedCompanyForm
            type="merchant"
            initialData={editingMerchant}
            franchiseId={franchiseId}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
