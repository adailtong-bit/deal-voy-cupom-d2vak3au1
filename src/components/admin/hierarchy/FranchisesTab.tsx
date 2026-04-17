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
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Edit2,
  Trash2,
  Download,
  FileText,
  FileSpreadsheet,
} from 'lucide-react'
import { Franchise } from '@/lib/types'
import { AdvancedCompanyForm } from './AdvancedCompanyForm'
import { exportAccountingData } from '@/lib/exportUtils'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

export function FranchisesTab() {
  const {
    franchises,
    companies,
    addFranchise,
    updateFranchise,
    deleteFranchise,
  } = useCouponStore()
  const { t } = useLanguage()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
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

  const handleSave = async (finalData: any) => {
    if (editingFranchise) {
      updateFranchise(editingFranchise.id, finalData)
      toast.success(
        t('admin.franchises.updated', 'Franqueado atualizado com sucesso!'),
      )
    } else {
      const tempId = Math.random().toString()
      const newFranchise: Franchise = {
        ...(finalData as Franchise),
        id: tempId,
        region: finalData.addressState || finalData.addressCity || 'Global',
        ownerId: finalData.email || 'u_fran',
        licenseExpiry: new Date(Date.now() + 31536000000).toISOString(),
        credentialsSent: false,
      }

      if (finalData.email) {
        try {
          await supabase
            .from('profiles')
            .insert({
              id: crypto.randomUUID(),
              email: finalData.email,
              name: finalData.contactPerson || finalData.name,
              role: 'franchisee',
            })
            .select()
        } catch (e) {
          console.error('Error creating profile mapping', e)
        }
      }

      addFranchise(newFranchise)
      toast.success(
        t(
          'admin.franchises.created',
          'Franqueado criado com sucesso! O acesso está liberado para o email informado. (Ele deve usar a opção Cadastrar com este email)',
        ),
      )
    }
    setIsDialogOpen(false)
  }

  const filteredFranchises = franchises.filter((f) => {
    if (!searchQuery) return true
    return (
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.taxId && f.taxId.includes(searchQuery)) ||
      (f.region && f.region.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  const exportCsv = () => {
    const headers = ['ID', 'Name', 'Tax ID', 'Contact', 'Region', 'Status']
    const rows = filteredFranchises.map(
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
          ${filteredFranchises.map((f) => `<tr><td>${f.name}</td><td>${f.taxId || ''}</td><td>${f.contactEmail || ''}</td><td>${f.region || ''}</td><td>${f.status}</td></tr>`).join('')}
        </table>
        <script>window.print(); window.close();</script>
        </body></html>
      `)
      w.document.close()
    }
  }

  const handleSendCredentials = async (f: Franchise) => {
    try {
      const email = f.email || f.contactEmail || f.ownerId
      const { error } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: email,
          name: f.name || f.contactPerson,
          role: 'franqueado',
          invitationUrl: `${window.location.origin}/login?tab=register&email=${encodeURIComponent(email || '')}`,
        },
      })
      if (error) throw error

      updateFranchise(f.id, { credentialsSent: true })
      toast.success(
        t(
          'admin.franchises.credentials_emailed',
          'Credentials emailed to Franchise Partner',
        ),
      )
    } catch (err: any) {
      console.error('Error sending credentials:', err)
      toast.error(t('common.error', 'Erro ao enviar credenciais'))
    }
  }

  const handleAccountingExport = (f: Franchise) => {
    const franchiseMerchants = companies.filter((c) => c.franchiseId === f.id)
    const msg = exportAccountingData(f, franchiseMerchants, t)
    toast.success(msg)
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-4 rounded-lg border gap-4">
        <div>
          <h3 className="text-lg font-bold">
            {t('admin.franchises.network', 'Rede de Franqueados')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(
              'admin.franchises.network_desc',
              'Gerencie seus franqueados, crie novos acessos regionais e monitore a rede.',
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder={t('admin.franchises.search', 'Search franchises...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-48 bg-white"
          />
          <Button variant="outline" onClick={exportCsv}>
            <FileText className="w-4 h-4 mr-2" />{' '}
            {t('admin.franchises.export_csv', 'CSV')}
          </Button>
          <Button variant="outline" onClick={exportPdf}>
            <Download className="w-4 h-4 mr-2" />{' '}
            {t('admin.franchises.export_pdf', 'PDF')}
          </Button>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />{' '}
            {t('admin.franchises.add', 'Criar Franqueado')}
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.title', 'Nome / Franquia')}</TableHead>
              <TableHead>{t('admin.tax_id', 'CNPJ/Doc')}</TableHead>
              <TableHead>{t('profile.phone', 'Contato/Acesso')}</TableHead>
              <TableHead>{t('profile.state', 'Região')}</TableHead>
              <TableHead>{t('admin.status', 'Status')}</TableHead>
              <TableHead>
                {t('franchisee.merchants.credentials', 'Credentials')}
              </TableHead>
              <TableHead className="text-right">
                {t('common.actions', 'Action')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFranchises.map((f) => {
              const isSent = f.credentialsSent || f.status === 'active'
              return (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell>{f.taxId || 'N/A'}</TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">
                      {f.contactPerson || 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {f.email || f.contactEmail || f.ownerId}
                    </p>
                  </TableCell>
                  <TableCell>
                    {f.region || f.addressState || f.addressCountry}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={f.status === 'active' ? 'default' : 'secondary'}
                    >
                      {t(`admin.${f.status}`, f.status)}
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
                        {isSent
                          ? t('admin.sent', 'Sent')
                          : t('admin.pending', 'Pending')}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        onClick={() => handleSendCredentials(f)}
                      >
                        {isSent
                          ? t('franchisee.merchants.resend', 'Resend')
                          : t('franchisee.merchants.send', 'Send')}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAccountingExport(f)}
                      title={t(
                        'admin.franchises.export_accounting',
                        'Export Accounting',
                      )}
                      className="text-green-600 hover:text-green-700"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                    </Button>
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
              {editingFranchise
                ? t('admin.franchises.edit', 'Editar Franqueado / Franquia')
                : t('admin.franchises.add', 'Criar Novo Franqueado')}
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
