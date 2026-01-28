import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useNavigate } from 'react-router-dom'
import {
  Settings,
  Plus,
  BarChart,
  ShieldAlert,
  Users,
  Building,
  DollarSign,
  Activity,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { useLanguage } from '@/stores/LanguageContext'
import { MOCK_SYSTEM_LOGS } from '@/lib/data'

export default function AdminDashboard() {
  const { user, companies, franchises, addFranchise, approveCompany } =
    useCouponStore()
  const navigate = useNavigate()
  const { t, formatDate, formatCurrency } = useLanguage()
  const [isFranchiseOpen, setIsFranchiseOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  if (!user || (user.role !== 'super_admin' && user.role !== 'franchisee')) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold">{t('admin.access_denied')}</h1>
        <Button onClick={() => navigate('/login')}>
          {t('admin.go_login')}
        </Button>
      </div>
    )
  }

  const isSuperAdmin = user.role === 'super_admin'

  const onSubmitFranchise = (data: any) => {
    addFranchise({
      id: Math.random().toString(),
      name: data.name,
      region: data.region,
      ownerId: 'new_owner',
      status: 'active',
      licenseExpiry: data.expiry,
    })
    setIsFranchiseOpen(false)
    reset()
  }

  // Determine data based on role
  const relevantFranchises = isSuperAdmin
    ? franchises
    : franchises.filter((f) => f.region === user.region)
  const relevantCompanies = isSuperAdmin
    ? companies
    : companies.filter((c) => c.region === user.region)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {isSuperAdmin
              ? t('admin.super_title')
              : `${t('admin.franchise_title')} - ${user.region || ''}`}
          </h1>
          <p className="text-muted-foreground">
            {isSuperAdmin ? 'Global Management' : 'Regional Management'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-white">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
            System OK
          </Badge>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building className="h-4 w-4" /> {t('admin.active_franchises')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {relevantFranchises.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" /> {t('admin.active_merchants')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{relevantCompanies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> {t('admin.revenue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(125000 + relevantCompanies.length * 1500)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" /> System Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">98%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={isSuperAdmin ? 'franchises' : 'merchants'}>
        <TabsList>
          {isSuperAdmin && (
            <TabsTrigger value="franchises">
              {t('admin.franchises')}
            </TabsTrigger>
          )}
          <TabsTrigger value="merchants">{t('admin.merchants')}</TabsTrigger>
          <TabsTrigger value="logs">{t('admin.logs')}</TabsTrigger>
          <TabsTrigger value="reports">{t('admin.reports')}</TabsTrigger>
        </TabsList>

        {isSuperAdmin && (
          <TabsContent value="franchises">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t('admin.licensing')}</CardTitle>
                </div>
                <Dialog
                  open={isFranchiseOpen}
                  onOpenChange={setIsFranchiseOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" /> {t('admin.new_franchise')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('admin.new_franchise')}</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={handleSubmit(onSubmitFranchise)}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input {...register('name')} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Region</Label>
                        <Input
                          {...register('region')}
                          placeholder="Ex: BR-MG"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Expiry</Label>
                        <Input type="date" {...register('expiry')} required />
                      </div>
                      <DialogFooter>
                        <Button type="submit">{t('common.save')}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {franchises.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">{f.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{f.region}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(f.licenseExpiry)}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">{f.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="merchants">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.active_merchants')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relevantCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        {company.name}
                        <div className="text-xs text-muted-foreground">
                          {company.email}
                        </div>
                      </TableCell>
                      <TableCell>{company.region}</TableCell>
                      <TableCell>
                        {formatDate(company.registrationDate)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            company.status === 'active'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {company.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {company.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => approveCompany(company.id)}
                          >
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_SYSTEM_LOGS.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(log.date)}
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell
                        className="max-w-[200px] truncate"
                        title={log.details}
                      >
                        {log.details}
                      </TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.status === 'error' ? 'destructive' : 'outline'
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="p-10 text-center border rounded-lg bg-muted/20">
            <BarChart className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">{t('admin.reports')}</h3>
            <p className="text-sm text-muted-foreground">
              Detailed analytics unavailable in demo.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
