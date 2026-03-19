import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'

export function AdvertisersTab() {
  const { advertisers, addAdvertiser } = useCouponStore()
  const [isOpen, setIsOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const onSubmit = (data: any) => {
    addAdvertiser({
      id: Math.random().toString(),
      companyName: data.companyName,
      taxId: data.taxId,
      email: data.email,
      phone: data.phone,
      address: {
        street: data.street,
        number: data.number,
        city: data.city,
        state: data.state,
        zip: data.zip,
      },
    })
    setIsOpen(false)
    reset()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Empresas Anunciantes</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Novo Anunciante</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Anunciante</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Razão Social</Label>
                <Input {...register('companyName')} required />
              </div>
              <div className="space-y-2">
                <Label>CNPJ/CPF</Label>
                <Input {...register('taxId')} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" {...register('email')} required />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input {...register('phone')} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rua</Label>
                <Input {...register('street')} required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input {...register('number')} required />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input {...register('city')} required />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input {...register('state')} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>CEP</Label>
                <Input {...register('zip')} required />
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
              <TableHead>Empresa</TableHead>
              <TableHead>CNPJ/CPF</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Localidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {advertisers.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-bold">{a.companyName}</TableCell>
                <TableCell>{a.taxId}</TableCell>
                <TableCell>
                  {a.email}
                  <br />
                  <span className="text-xs text-muted-foreground">
                    {a.phone}
                  </span>
                </TableCell>
                <TableCell>
                  {a.address.city}, {a.address.state}
                </TableCell>
              </TableRow>
            ))}
            {advertisers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  Nenhum anunciante cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
