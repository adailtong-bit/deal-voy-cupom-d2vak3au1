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
import { CheckCircle, XCircle } from 'lucide-react'

export function PendingApprovalsTab() {
  const { companies, franchises, approveCompany, rejectCompany } =
    useCouponStore()

  const pending = companies.filter((c) => c.status === 'pending')

  const getFranchiseName = (id?: string) => {
    if (!id) return 'Independent'
    return franchises.find((f) => f.id === id)?.name || 'Unknown'
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
                      onClick={() => approveCompany(c.id)}
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
    </div>
  )
}
