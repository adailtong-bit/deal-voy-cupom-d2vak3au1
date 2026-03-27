import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Check, ChevronsUpDown, Filter, AlertCircle } from 'lucide-react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { cn } from '@/lib/utils'

export function BillingGenerationTab({
  franchiseId,
}: {
  franchiseId?: string
}) {
  const {
    user,
    franchises,
    companies,
    partnerInvoices,
    generatePartnerInvoice,
  } = useCouponStore()
  const { t } = useLanguage()
  const myFranchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency, formatShortDate } = useRegionFormatting(
    myFranchise?.region,
  )

  const isSuperAdmin = user?.role === 'super_admin'
  const availableTargetTypes = isSuperAdmin
    ? ['franchise', 'merchant']
    : ['merchant']

  const [selectedTargetType, setSelectedTargetType] = useState<
    'franchise' | 'merchant'
  >(availableTargetTypes[0] as any)
  const [selectedTargetId, setSelectedTargetId] = useState('')
  const [openTargetCombo, setOpenTargetCombo] = useState(false)

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
  )

  const displayCompanies = franchiseId
    ? companies.filter((c) => c.franchiseId === franchiseId)
    : companies
  const targets =
    selectedTargetType === 'franchise' ? franchises : displayCompanies

  const [itemFilterStatus, setItemFilterStatus] = useState('all')
  const [itemFilterId, setItemFilterId] = useState('')
  const [itemFilterPeriod, setItemFilterPeriod] = useState('all')

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [mockItems, setMockItems] = useState<any[]>([])

  useEffect(() => {
    if (!selectedTargetId) {
      setMockItems([])
      return
    }
    const items = Array.from({ length: 15 }).map((_, i) => ({
      id: `TXN-${selectedTargetId.substring(0, 4).toUpperCase()}-${1000 + i}`,
      date: new Date(Date.now() - i * 86400000 * 3).toISOString(),
      description:
        selectedTargetType === 'franchise'
          ? 'Royalties & Licenciamento'
          : 'Comissão sobre Vendas',
      amount: 50 + Math.random() * 200,
      status: i % 4 === 0 ? 'pending' : 'open',
    }))
    setMockItems(items)
  }, [selectedTargetId, selectedTargetType])

  const billedItemIds = useMemo(() => {
    const ids = new Set<string>()
    partnerInvoices.forEach((inv) => {
      inv.items?.forEach((item) => {
        if (item.id) ids.add(item.id)
      })
    })
    return ids
  }, [partnerInvoices])

  const filteredItems = useMemo(() => {
    return mockItems
      .map((item) => ({
        ...item,
        isBilled: billedItemIds.has(item.id),
      }))
      .filter((item) => {
        if (itemFilterStatus !== 'all' && item.status !== itemFilterStatus)
          return false
        if (
          itemFilterId &&
          !item.id.toLowerCase().includes(itemFilterId.toLowerCase())
        )
          return false
        if (itemFilterPeriod !== 'all') {
          const d = new Date(item.date)
          const now = new Date()
          if (itemFilterPeriod === 'month')
            return (
              d.getMonth() === now.getMonth() &&
              d.getFullYear() === now.getFullYear()
            )
          if (itemFilterPeriod === 'quarter')
            return (
              Math.floor(d.getMonth() / 3) === Math.floor(now.getMonth() / 3) &&
              d.getFullYear() === now.getFullYear()
            )
          if (itemFilterPeriod === 'semester')
            return (
              Math.floor(d.getMonth() / 6) === Math.floor(now.getMonth() / 6) &&
              d.getFullYear() === now.getFullYear()
            )
          if (itemFilterPeriod === 'year')
            return d.getFullYear() === now.getFullYear()
        }
        return true
      })
  }, [
    mockItems,
    itemFilterStatus,
    itemFilterId,
    itemFilterPeriod,
    billedItemIds,
  ])

  const nextInvoiceNumber = useMemo(() => {
    const prefix = 'INV'
    const year = new Date().getFullYear()
    const count = partnerInvoices.length + 1
    return `${prefix}-${year}-${count.toString().padStart(4, '0')}`
  }, [partnerInvoices.length])

  const handleGenerateInvoice = () => {
    const itemsToBill = filteredItems.filter(
      (i) => selectedItemIds.includes(i.id) && !i.isBilled,
    )
    if (itemsToBill.length === 0) return

    generatePartnerInvoice({
      referenceNumber: nextInvoiceNumber,
      targetType: selectedTargetType,
      companyId: selectedTargetType === 'merchant' ? selectedTargetId : '',
      franchiseId: selectedTargetType === 'franchise' ? selectedTargetId : '',
      totalCommission: itemsToBill.reduce((a, b) => a + b.amount, 0),
      transactionCount: itemsToBill.length,
      periodStart: itemsToBill[itemsToBill.length - 1]?.date,
      periodEnd: itemsToBill[0]?.date,
      items: itemsToBill,
      status: 'draft',
      dueDate: new Date(dueDate).toISOString(),
    })
    setIsConfirmDialogOpen(false)
    setSelectedItemIds([])
  }

  const selectedTargetName = useMemo(() => {
    const target = targets.find((t) => t.id === selectedTargetId)
    if (!target) return 'Selecione o destinatário...'
    return `${target.name} - ${target.taxId ? target.taxId : 'Sem Doc'}`
  }, [targets, selectedTargetId])

  const formatAddress = (
    street?: string,
    num?: string,
    city?: string,
    state?: string,
  ) => {
    const parts = [street, num].filter(Boolean).join(', ')
    const loc = [city, state].filter(Boolean).join('/')
    return [parts, loc].filter(Boolean).join(' - ') || 'Endereço não informado'
  }

  const getIssuerDetails = () => {
    if (myFranchise) {
      return {
        name: myFranchise.legalName || myFranchise.name,
        address: formatAddress(
          myFranchise.addressStreet,
          myFranchise.addressNumber,
          myFranchise.addressCity,
          myFranchise.addressState,
        ),
        contact: myFranchise.contactPerson || 'N/A',
        phone: myFranchise.businessPhone || myFranchise.whatsapp || 'N/A',
        email: myFranchise.billingEmail || myFranchise.contactEmail || 'N/A',
      }
    }
    return {
      name: 'Deal Voy (Platform HQ)',
      address: 'Av. Paulista, 1000 - São Paulo/SP',
      contact: 'Admin',
      phone: '+55 11 99999-9999',
      email: 'billing@dealvoy.com',
    }
  }

  const getClientDetails = () => {
    if (selectedTargetType === 'franchise') {
      const f = franchises.find((f) => f.id === selectedTargetId)
      return {
        name: f?.legalName || f?.name || '',
        address: formatAddress(
          f?.addressStreet,
          f?.addressNumber,
          f?.addressCity,
          f?.addressState,
        ),
        contact: f?.contactPerson || 'N/A',
        phone: f?.businessPhone || f?.whatsapp || 'N/A',
        email: f?.billingEmail || f?.contactEmail || 'N/A',
      }
    } else {
      const c = companies.find((c) => c.id === selectedTargetId)
      return {
        name: c?.legalName || c?.name || '',
        address: formatAddress(
          c?.addressStreet,
          c?.addressNumber,
          c?.addressCity,
          c?.addressState,
        ),
        contact: c?.contactPerson || 'N/A',
        phone: c?.businessPhone || c?.whatsapp || 'N/A',
        email: c?.billingEmail || c?.email || 'N/A',
      }
    }
  }

  const issuer = getIssuerDetails()
  const client = getClientDetails()

  const availableItems = filteredItems.filter((i) => !i.isBilled)
  const selectedAmount = selectedItemIds.reduce((acc, id) => {
    const item = mockItems.find((i) => i.id === id)
    return acc + (item ? item.amount : 0)
  }, 0)

  return (
    <Card className="min-w-0 w-full animate-fade-in-up">
      <CardHeader>
        <CardTitle>Seleção e Geração de Fatura</CardTitle>
        <CardDescription>
          Escolha o destinatário e os itens faturáveis para compor a cobrança.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {isSuperAdmin && (
            <Select
              value={selectedTargetType}
              onValueChange={(v: any) => {
                setSelectedTargetType(v)
                setSelectedTargetId('')
                setSelectedItemIds([])
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="franchise">Franquias</SelectItem>
                <SelectItem value="merchant">Lojistas</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Popover open={openTargetCombo} onOpenChange={setOpenTargetCombo}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full sm:w-[400px] justify-between"
              >
                <span className="truncate">{selectedTargetName}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Buscar destinatário..." />
                <CommandList>
                  <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                  <CommandGroup>
                    {targets.map((tgt) => (
                      <CommandItem
                        key={tgt.id}
                        value={tgt.name}
                        onSelect={() => {
                          setSelectedTargetId(tgt.id)
                          setOpenTargetCombo(false)
                          setSelectedItemIds([])
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4 shrink-0',
                            selectedTargetId === tgt.id
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                        <div className="flex flex-col truncate">
                          <span className="truncate">{tgt.name}</span>
                          <span className="text-xs text-muted-foreground truncate">
                            {tgt.taxId ? `Doc: ${tgt.taxId}` : 'Sem documento'}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {selectedTargetId && (
          <>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-slate-50 p-4 rounded-lg border flex-wrap">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="h-5 w-5 text-slate-500 shrink-0" />
                <Select
                  value={itemFilterStatus}
                  onValueChange={setItemFilterStatus}
                >
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="open">Abertos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="Buscar por ID..."
                value={itemFilterId}
                onChange={(e) => setItemFilterId(e.target.value)}
                className="w-full md:w-[180px]"
              />
              <Select
                value={itemFilterPeriod}
                onValueChange={setItemFilterPeriod}
              >
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo o Período</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="quarter">Este Trimestre</SelectItem>
                  <SelectItem value="semester">Este Semestre</SelectItem>
                  <SelectItem value="year">Este Ano</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-4 w-full md:w-auto md:ml-auto">
                <div className="text-sm font-medium text-slate-500">
                  Fatura:{' '}
                  <span className="text-slate-900 font-bold">
                    {nextInvoiceNumber}
                  </span>
                </div>
                <Button
                  onClick={() => setIsConfirmDialogOpen(true)}
                  disabled={selectedItemIds.length === 0}
                  className="w-full md:w-auto whitespace-nowrap"
                >
                  Revisar Fatura ({selectedItemIds.length})
                </Button>
              </div>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          selectedItemIds.length === availableItems.length &&
                          availableItems.length > 0
                        }
                        disabled={availableItems.length === 0}
                        onCheckedChange={(c) => {
                          if (c)
                            setSelectedItemIds(availableItems.map((i) => i.id))
                          else setSelectedItemIds([])
                        }}
                      />
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className={cn(item.isBilled && 'bg-slate-50 opacity-60')}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedItemIds.includes(item.id)}
                          disabled={item.isBilled}
                          onCheckedChange={(c) => {
                            if (c)
                              setSelectedItemIds((prev) => [...prev, item.id])
                            else
                              setSelectedItemIds((prev) =>
                                prev.filter((id) => id !== item.id),
                              )
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {item.id}
                      </TableCell>
                      <TableCell>{formatShortDate(item.date)}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        {item.isBilled ? (
                          <Badge variant="outline" className="bg-slate-200">
                            Faturado
                          </Badge>
                        ) : (
                          <Badge
                            variant={
                              item.status === 'pending'
                                ? 'secondary'
                                : 'default'
                            }
                            className="capitalize"
                          >
                            {item.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredItems.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Nenhum item faturável encontrado para os filtros
                        selecionados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        <Dialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Revisar e Confirmar Fatura
              </DialogTitle>
              <DialogDescription>
                Confirme as informações de faturamento e dados de contato.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-3 bg-slate-50 border-b">
                  <CardTitle className="text-sm font-semibold text-slate-700">
                    Cobrador (Emissor)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm space-y-2">
                  <div className="grid grid-cols-[80px_1fr] gap-1">
                    <span className="text-slate-500 font-medium">Nome:</span>
                    <span className="font-semibold text-slate-800">
                      {issuer.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-1">
                    <span className="text-slate-500 font-medium">
                      Endereço:
                    </span>
                    <span className="text-slate-700">{issuer.address}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-1">
                    <span className="text-slate-500 font-medium">Contato:</span>
                    <span className="text-slate-700">{issuer.contact}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-1">
                    <span className="text-slate-500 font-medium">
                      Telefone:
                    </span>
                    <span className="text-slate-700">{issuer.phone}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-1">
                    <span className="text-slate-500 font-medium">E-mail:</span>
                    <span className="text-slate-700">{issuer.email}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-3 bg-slate-50 border-b">
                  <CardTitle className="text-sm font-semibold text-slate-700">
                    Cobrado (Cliente)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm space-y-2">
                  <div className="grid grid-cols-[80px_1fr] gap-1">
                    <span className="text-slate-500 font-medium">Nome:</span>
                    <span className="font-semibold text-slate-800">
                      {client.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-1">
                    <span className="text-slate-500 font-medium">
                      Endereço:
                    </span>
                    <span className="text-slate-700">{client.address}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-1">
                    <span className="text-slate-500 font-medium">Contato:</span>
                    <span className="text-slate-700">{client.contact}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-1">
                    <span className="text-slate-500 font-medium">
                      Telefone:
                    </span>
                    <span className="text-slate-700">{client.phone}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-1">
                    <span className="text-slate-500 font-medium">E-mail:</span>
                    <span className="text-slate-700">{client.email}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-t mt-2 pt-6">
              <div className="space-y-2">
                <Label className="text-slate-600">Nº da Fatura (Ref)</Label>
                <Input
                  value={nextInvoiceNumber}
                  readOnly
                  className="bg-slate-100 font-mono text-slate-600 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600">Data de Vencimento</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="font-medium"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-slate-600 font-bold">Valor Total</Label>
                <div className="relative">
                  <Input
                    value={formatCurrency(selectedAmount)}
                    readOnly
                    className="bg-slate-100 font-bold text-lg text-slate-800 pl-10 cursor-not-allowed"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 text-lg font-bold">R$</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setIsConfirmDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleGenerateInvoice} className="font-semibold">
                Gerar Fatura Definitiva
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
