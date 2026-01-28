import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Building2,
  Settings,
  Globe,
  Plus,
  BarChart,
  ShieldAlert,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
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

export default function AdminDashboard() {
  const { user, companies, franchises, addFranchise, approveCompany } =
    useCouponStore()
  const navigate = useNavigate()
  const [isFranchiseOpen, setIsFranchiseOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  if (!user || (user.role !== 'super_admin' && user.role !== 'franchisee')) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p>Você precisa ser um administrador para ver esta página.</p>
        <Button onClick={() => navigate('/admin/login')}>Ir para Login</Button>
      </div>
    )
  }

  const isSuperAdmin = user.role === 'super_admin'

  const onSubmitFranchise = (data: any) => {
    addFranchise({
      id: Math.random().toString(),
      name: data.name,
      region: data.region,
      ownerId: 'new_owner', // simplified
      status: 'active',
      licenseExpiry: data.expiry,
    })
    setIsFranchiseOpen(false)
    reset()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {isSuperAdmin
              ? 'Painel Super Admin (Dono)'
              : `Painel de Franquia - ${user.region || 'Regional'}`}
          </h1>
          <p className="text-muted-foreground">
            {isSuperAdmin
              ? 'Gerenciamento Global e Licenciamento'
              : 'Gestão Regional de Lojistas e Performance'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-white">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
            Sistema Operacional
          </Badge>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isSuperAdmin ? 'Franquias Ativas' : 'Lojistas Ativos'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isSuperAdmin
                ? franchises.length
                : companies.filter((c) => c.region === user.region).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Recorrente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ 125.000</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={isSuperAdmin ? 'franchises' : 'merchants'}>
        <TabsList>
          {isSuperAdmin && (
            <TabsTrigger value="franchises">Franquias</TabsTrigger>
          )}
          <TabsTrigger value="merchants">Lojistas (Merchants)</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {isSuperAdmin && (
          <TabsContent value="franchises">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Licenciamento de Regiões</CardTitle>
                  <CardDescription>
                    Gerencie os parceiros regionais e suas licenças.
                  </CardDescription>
                </div>
                <Dialog
                  open={isFranchiseOpen}
                  onOpenChange={setIsFranchiseOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" /> Nova Franquia
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Franquia</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={handleSubmit(onSubmitFranchise)}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label>Nome da Franquia</Label>
                        <Input {...register('name')} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Região (Código)</Label>
                        <Input
                          {...register('region')}
                          placeholder="Ex: BR-MG"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Expiração da Licença</Label>
                        <Input type="date" {...register('expiry')} required />
                      </div>
                      <DialogFooter>
                        <Button type="submit">Salvar</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Região</TableHead>
                      <TableHead>Validade</TableHead>
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
                        <TableCell>{f.licenseExpiry}</TableCell>
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
              <CardTitle>Gestão de Lojistas</CardTitle>
              <CardDescription>
                Empresas cadastradas na plataforma
                {!isSuperAdmin && ` em ${user.region}`}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Região</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pontos B2B</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies
                    .filter((c) => isSuperAdmin || c.region === user.region)
                    .map((company) => (
                      <TableRow key={company.id}>
                        <TableCell>{company.name}</TableCell>
                        <TableCell>{company.region}</TableCell>
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
                        <TableCell>
                          {company.enableLoyalty ? 'Ativo' : 'Inativo'}
                        </TableCell>
                        <TableCell className="text-right">
                          {company.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => approveCompany(company.id)}
                            >
                              Aprovar
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

        <TabsContent value="reports">
          <div className="p-10 text-center border rounded-lg bg-muted/20">
            <BarChart className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Relatórios Regionais</h3>
            <p className="text-muted-foreground">
              Métricas de performance detalhadas estarão disponíveis em breve.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
