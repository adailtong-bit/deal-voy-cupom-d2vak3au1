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
import { Plus, Edit2, Trash2, Download, FileText } from 'lucide-react'
import { Franchise } from '@/lib/types'
import { AdvancedCompanyForm } from './AdvancedCompanyForm'
import { toast } from 'sonner'

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
        credentialsSent: false,
      }
      addFranchise(newFranchise)
    }
    setIsDialogOpen(false)
  }

  const exportCsv = () => {
    const headers = ['ID', 'Name', 'Tax ID', 'Contact', 'Region', 'Status']
    const rows = franchises.map(
      (f) =>
        `"${f.id}","${f.name}","${f.taxId || ''}","${f.contactEmail || ''}","${f.region || ''}","${f.status}"`,
    )
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      headers.join(',') +
      '\n' +
      rows.join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'franchises_export.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportPdf = () => {
    const w = window.open('', '_blank')
    if (w) {
      w.document.write(`
        <html><head><title>Franchises Report</title>
        <style>body{font-family:sans-serif; padding:20px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #ddd; padding:8px; text-align:left;}</style></head>
        <body>
        <h1>Franchises Report</h1>
        <table>
          <tr><th>Name</th><th>Tax ID</th><th>Contact</th><th>Region</th><th>Status</th></tr>
          ${franchises.map((f) => `<tr><td>${f.name}</td><td>${f.taxId || ''}</td><td>${f.contactEmail || ''}</td><td>${f.region || ''}</td><td>${f.status}</td></tr>`).join('')}
        </table>
        <script>window.print(); window.close();</script>
        </body></html>
      `)
      w.document.close()
    }
  }

  const handleSendCredentials = (f: Franchise) => {
    updateFranchise(f.id, { credentialsSent: true })
    toast.success(`Credentials emailed to Franchise Partner`)
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-4 rounded-lg border gap-4">
        <div>
          <h3 className="text-lg font-bold">Franchise Network</h3>
          <p className="text-sm text-muted-foreground">
            Manage your master franchises and their primary contacts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={exportCsv}>
            <FileText className="w-4 h-4 mr-2" /> CSV
          </Button>
          <Button variant="outline" onClick={exportPdf}>
            <Download className="w-4 h-4 mr-2" /> PDF
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" /> Add Franchise
          </Button>
        </div>
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
              <TableHead>Credentials</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {franchises.map((f) => {
              const isSent = f.credentialsSent || f.status === 'active'
              return (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell>{f.taxId || 'N/A'}</TableCell>
                  <TableCell>
                    <p className="text-sm">{f.contactPerson || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">
                      {f.contactEmail || f.ownerId}
                    </p>
                  </TableCell>
                  <TableCell>
                    {f.region || f.addressState || f.address}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={f.status === 'active' ? 'default' : 'secondary'}
                    >
                      {f.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isSent ? 'default' : 'secondary'}
                        className={
                          isSent
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'text-slate-600'
                        }
                      >
                        {isSent ? 'Sent' : 'Pending'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        onClick={() => handleSendCredentials(f)}
                      >
                        {isSent ? 'Resend' : 'Send'}
                      </Button>
                    </div>
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
              )
            })}
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
