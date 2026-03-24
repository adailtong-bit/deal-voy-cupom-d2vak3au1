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
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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
        credentialsSent: false,
      }
      addCompany(newCompany)
    }
    setIsDialogOpen(false)
  }

  const getFranchiseName = (id?: string) => {
    if (!id) return 'Independente'
    return franchises.find((f) => f.id === id)?.name || 'Desconhecida'
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
    link.setAttribute('download', 'lojistas_export.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportPdf = () => {
    const w = window.open('', '_blank')
    if (w) {
      w.document.write(`
        <html><head><title>Relatório de Lojistas</title>
        <style>body{font-family:sans-serif; padding:20px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #ddd; padding:8px; text-align:left;}</style></head>
        <body>
        <h1>Relatório de Lojistas</h1>
        <table>
          <tr><th>Nome</th><th>Email</th><th>Franquia</th><th>Região</th><th>Status</th></tr>
          ${displayCompanies.map((c) => `<tr><td>${c.name}</td><td>${c.email}</td><td>${getFranchiseName(c.franchiseId)}</td><td>${c.region}</td><td>${c.status}</td></tr>`).join('')}
        </table>
        <script>window.print(); window.close();</script>
        </body></html>
      `)
      w.document.close()
    }
  }

  const handleSendCredentials = (c: Company) => {
    updateCompany(c.id, { credentialsSent: true })
    toast.success(`Credenciais enviadas para ${c.email}`)
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-lg text-primary hidden sm:block">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Diretório de Lojistas
            </h3>
            <p className="text-sm text-slate-500">
              {franchiseId
                ? 'Gerencie os lojistas vinculados à sua franquia.'
                : 'Gerencie todos os lojistas (independentes e de franquias).'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={exportCsv}
            className="font-semibold"
          >
            <FileText className="w-4 h-4 mr-2" /> CSV
          </Button>
          <Button
            variant="outline"
            onClick={exportPdf}
            className="font-semibold"
          >
            <Download className="w-4 h-4 mr-2" /> PDF
          </Button>
          <Button onClick={() => handleOpenDialog()} className="font-bold">
            <Plus className="w-4 h-4 mr-2" /> Adicionar Lojista
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">
                Nome da Loja
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                E-mail
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Localização
              </TableHead>
              {!franchiseId && (
                <TableHead className="font-semibold text-slate-700">
                  Afiliação
                </TableHead>
              )}
              <TableHead className="font-semibold text-slate-700">
                Status
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Credenciais
              </TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayCompanies.map((c) => {
              const isSent = c.credentialsSent || c.status === 'active'
              return (
                <TableRow key={c.id} className="hover:bg-slate-50/80">
                  <TableCell className="font-bold text-slate-800">
                    {c.name}
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">
                    {c.email}
                  </TableCell>
                  <TableCell className="text-slate-600">{c.region}</TableCell>
                  {!franchiseId && (
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-slate-100 text-slate-700"
                      >
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
                      className={cn(
                        c.status === 'active' && 'bg-emerald-500',
                        'capitalize',
                      )}
                    >
                      {c.status === 'active'
                        ? 'Ativo'
                        : c.status === 'pending'
                          ? 'Pendente'
                          : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isSent ? 'default' : 'secondary'}
                        className={
                          isSent
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }
                      >
                        {isSent ? 'Enviado' : 'Pendente'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-primary hover:text-primary/80 font-bold hover:bg-primary/10"
                        onClick={() => handleSendCredentials(c)}
                      >
                        {isSent ? 'Reenviar' : 'Enviar'}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(c)}
                      className="text-slate-500 hover:text-primary hover:bg-primary/5"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCompany(c.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {displayCompanies.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={franchiseId ? 6 : 7}
                  className="text-center py-12 text-slate-500 font-medium"
                >
                  Nenhum lojista encontrado.
                </TableCell>
              </TableRow>
            )}
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
