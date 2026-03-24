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
import { Plus, Edit2, Trash2, Store, Download, FileText } from 'lucide-react'
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

  const exportCsv = () => {
    const headers = ['ID', 'Name', 'Email', 'Franchise', 'Region', 'Status']
    const rows = displayCompanies.map(
      (c) =>
        `"${c.id}","${c.name}","${c.email}","${getFranchiseName(c.franchiseId)}","${c.region}","${c.status}"`,
    )
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      headers.join(',') +
      '\n' +
      rows.join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'merchants_export.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportPdf = () => {
    const w = window.open('', '_blank')
    if (w) {
      w.document.write(`
        <html><head><title>Merchants Report</title>
        <style>body{font-family:sans-serif; padding:20px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #ddd; padding:8px; text-align:left;}</style></head>
        <body>
        <h1>Merchants Report</h1>
        <table>
          <tr><th>Name</th><th>Email</th><th>Franchise</th><th>Region</th><th>Status</th></tr>
          ${displayCompanies.map((c) => `<tr><td>${c.name}</td><td>${c.email}</td><td>${getFranchiseName(c.franchiseId)}</td><td>${c.region}</td><td>${c.status}</td></tr>`).join('')}
        </table>
        <script>window.print(); window.close();</script>
        </body></html>
      `)
      w.document.close()
    }
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-4 rounded-lg border gap-4">
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
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={exportCsv}>
            <FileText className="w-4 h-4 mr-2" /> CSV
          </Button>
          <Button variant="outline" onClick={exportPdf}>
            <Download className="w-4 h-4 mr-2" /> PDF
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" /> Add Merchant
          </Button>
        </div>
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
                    variant={
                      c.status === 'active'
                        ? 'default'
                        : c.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                    }
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
