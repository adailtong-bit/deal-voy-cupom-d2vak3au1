import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { CheckCircle, XCircle } from 'lucide-react'
import { Company } from '@/lib/types'
import { toast } from 'sonner'

export function PendingApprovalsTab() {
  const {
    companies,
    franchises,
    approveCompany,
    rejectCompany,
    updateCompany,
  } = useCouponStore()

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [sendEmail, setSendEmail] = useState(true)

  const pending = companies.filter((c) => c.status === 'pending')

  const getFranchiseName = (id?: string) => {
    if (!id) return 'Independent'
    return franchises.find((f) => f.id === id)?.name || 'Unknown'
  }

  const handleApprove = () => {
    if (selectedCompany) {
      approveCompany(selectedCompany.id)
      if (sendEmail) {
        updateCompany(selectedCompany.id, { credentialsSent: true })
        toast.success(
          `Welcome email and credentials sent to ${selectedCompany.email}`,
        )
      } else {
        toast.success('Company approved without sending credentials.')
      }
      setSelectedCompany(null)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="bg-card p-4 rounded-lg border">
        <h3 className="text-lg font-bold">Pending Merchant Approvals</h3>
        <p className="text-sm text-muted-foreground">
          Review and approve Store Owners registered by Franchisees.
        </p>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Franchise</TableHead>
              <TableHead>Region</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pending.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getFranchiseName(c.franchiseId)}
                  </Badge>
                </TableCell>
                <TableCell>{c.region}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rejectCompany(c.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setSelectedCompany(c)
                        setSendEmail(true)
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Approve
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {pending.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No pending approvals at the moment.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selectedCompany}
        onOpenChange={(o) => !o && setSelectedCompany(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve & Onboard Partner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              You are about to approve <strong>{selectedCompany?.name}</strong>.
              Configure their automated onboarding below.
            </p>

            <div className="flex items-center justify-between border p-4 rounded-lg bg-slate-50/50">
              <div className="space-y-1">
                <Label className="font-semibold text-slate-800">
                  Send Welcome Email
                </Label>
                <p className="text-xs text-muted-foreground">
                  Automatically email platform access credentials and
                  instructions.
                </p>
              </div>
              <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
            </div>

            {sendEmail && (
              <div className="bg-slate-50 p-4 rounded-lg border text-sm space-y-3 animate-in fade-in slide-in-from-top-2">
                <p className="font-semibold text-slate-700 border-b pb-2 mb-2">
                  Email Preview
                </p>
                <p>
                  <strong>Subject:</strong> Bem-vindo ao Deal Voy! Seus acessos
                  estão aqui.
                </p>
                <div className="bg-white p-3 rounded border text-slate-600 text-sm leading-relaxed">
                  <p>Olá Equipe {selectedCompany?.name},</p>
                  <p className="mt-2">
                    Sua conta de lojista foi aprovada com sucesso! Você já pode
                    acessar o painel para gerenciar suas ofertas e cupons.
                  </p>
                  <p className="mt-2">
                    <strong>Login:</strong> {selectedCompany?.email}
                    <br />
                    <strong>Senha Provisória:</strong> DealVoy@2026
                  </p>
                  <p className="mt-4 text-blue-600 font-medium underline cursor-pointer">
                    Acessar Painel do Lojista
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCompany(null)}>
              Cancel
            </Button>
            <Button onClick={handleApprove}>Confirm Approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
