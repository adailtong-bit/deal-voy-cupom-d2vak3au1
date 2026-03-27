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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  ChevronsUpDown,
  Filter,
  Building2,
  Store,
  MapPin,
  User as UserIcon,
  Phone,
  Mail,
  CheckCircle2,
} from 'lucide-react'
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
      // Allow re-billing if the previous invoice was canceled
      if (inv.status !== 'canceled') {
        inv.items?.forEach((item) => {
          if (item.id) ids.add(item.id)
        })
      }
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
    return `${prefix}-${year}-${count.toString().padStart(3, '0')}`
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
    const loc = [city, state].filter(Boolean).join(' - ')
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
    <Card className="min-w-0 w-full animate-fade-in-up border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50/50 border-b pb-4">
        <CardTitle className="text-xl text-slate-800">
          Seleção e Geração de Fatura
        </CardTitle>
        <CardDescription className="text-slate-500">
          Escolha o destinatário e os itens faturáveis para compor a cobrança.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 bg-white border rounded-lg shadow-sm">
          {isSuperAdmin && (
            <div className="space-y-1.5 w-full sm:w-auto">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tipo
              </Label>
              <Select
                value={selectedTargetType}
                onValueChange={(v: any) => {
                  setSelectedTargetType(v)
                  setSelectedTargetId('')
                  setSelectedItemIds([])
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px] bg-slate-50">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="franchise">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>Franquias</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="merchant">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-slate-400" />
                      <span>Lojistas</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5 w-full flex-1">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Destinatário
            </Label>
            <Popover open={openTargetCombo} onOpenChange={setOpenTargetCombo}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between bg-slate-50 font-medium"
                >
                  <span className="truncate">{selectedTargetName}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
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
                                ? 'opacity-100 text-primary'
                                : 'opacity-0',
                            )}
                          />
                          <div className="flex flex-col truncate">
                            <span className="truncate font-medium">
                              {tgt.name}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {tgt.taxId
                                ? `Doc: ${tgt.taxId}`
                                : 'Sem documento'}
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
        </div>

        {selectedTargetId && (
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center bg-slate-50 p-4 rounded-lg border flex-wrap">
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2 bg-white rounded-md border px-3 py-1.5">
                  <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-sm font-medium text-slate-600">
                    Filtros
                  </span>
                </div>
                <Select
                  value={itemFilterStatus}
                  onValueChange={setItemFilterStatus}
                >
                  <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="open">Abertos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={itemFilterPeriod}
                  onValueChange={setItemFilterPeriod}
                >
                  <SelectTrigger className="w-[160px] bg-white">
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
                <Input
                  placeholder="Buscar por ID..."
                  value={itemFilterId}
                  onChange={(e) => setItemFilterId(e.target.value)}
                  className="w-[180px] bg-white"
                />
              </div>

              <div className="flex items-center gap-4 w-full lg:w-auto lg:ml-auto">
                <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-md border flex items-center gap-2">
                  <span>Próxima Fatura:</span>
                  <span className="text-primary font-bold tracking-wider">
                    {nextInvoiceNumber}
                  </span>
                </div>
                <Button
                  onClick={() => setIsConfirmDialogOpen(true)}
                  disabled={selectedItemIds.length === 0}
                  className="w-full sm:w-auto whitespace-nowrap shadow-sm"
                  size="lg"
                >
                  Gerar Fatura ({selectedItemIds.length})
                </Button>
              </div>
            </div>

            <div className="border rounded-lg bg-white overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50 border-b">
                  <TableRow>
                    <TableHead className="w-[50px] text-center">
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
                    <TableHead className="font-semibold text-slate-700">
                      ID da Transação
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Data
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Descrição
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Status
                    </TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">
                      Valor
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className={cn(
                        'transition-colors',
                        item.isBilled
                          ? 'bg-slate-50/80 opacity-60'
                          : 'hover:bg-slate-50/50',
                      )}
                    >
                      <TableCell className="text-center">
                        {item.isBilled ? (
                          <CheckCircle2
                            className="w-4 h-4 mx-auto text-slate-300"
                            title="Processado"
                          />
                        ) : (
                          <Checkbox
                            checked={selectedItemIds.includes(item.id)}
                            onCheckedChange={(c) => {
                              if (c)
                                setSelectedItemIds((prev) => [...prev, item.id])
                              else
                                setSelectedItemIds((prev) =>
                                  prev.filter((id) => id !== item.id),
                                )
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        {item.id}
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">
                        {formatShortDate(item.date)}
                      </TableCell>
                      <TableCell className="text-slate-800">
                        {item.description}
                      </TableCell>
                      <TableCell>
                        {item.isBilled ? (
                          <Badge
                            variant="outline"
                            className="bg-slate-200 text-slate-500 border-slate-300"
                          >
                            Processado
                          </Badge>
                        ) : (
                          <Badge
                            variant={
                              item.status === 'pending'
                                ? 'secondary'
                                : 'default'
                            }
                            className={cn(
                              'capitalize',
                              item.status === 'open' &&
                                'bg-blue-500 hover:bg-blue-600',
                            )}
                          >
                            {item.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-900">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredItems.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-12 text-slate-500 font-medium"
                      >
                        Nenhum item faturável encontrado para os filtros
                        selecionados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <Dialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
        >
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-50 sm:rounded-xl">
            <div className="relative">
              {/* Watermark effect */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.02] flex items-center justify-center overflow-hidden z-0">
                <div className="text-[12rem] font-black rotate-[-35deg] tracking-widest uppercase text-slate-900">
                  INVOICE
                </div>
              </div>

              <div className="relative z-10 p-6 sm:p-8 max-h-[90vh] overflow-y-auto flex flex-col gap-6">
                <DialogHeader>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                      <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                        Pré-visualização da Fatura
                      </DialogTitle>
                      <DialogDescription className="text-slate-500 mt-1">
                        Verifique os dados antes da geração definitiva.
                      </DialogDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">
                        Nº Fatura
                      </div>
                      <div className="text-2xl font-black text-primary tracking-tight">
                        {nextInvoiceNumber}
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Issuer Card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span>De (Emissor)</span>
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="font-bold text-slate-900 text-base mb-2 border-b border-slate-100 pb-2">
                        {issuer.name}
                      </div>
                      <div className="flex items-start gap-2 text-slate-600">
                        <UserIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0 break-words">
                          <span className="font-medium text-slate-700">
                            Contato:
                          </span>{' '}
                          {issuer.contact}
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0 break-words">
                          <span className="font-medium text-slate-700">
                            Email:
                          </span>{' '}
                          {issuer.email}
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0 break-words">
                          <span className="font-medium text-slate-700">
                            Telefone:
                          </span>{' '}
                          {issuer.phone}
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0 break-words">
                          <span className="font-medium text-slate-700">
                            Endereço:
                          </span>{' '}
                          {issuer.address}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Client Card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span>Para (Cliente)</span>
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="font-bold text-slate-900 text-base mb-2 border-b border-slate-100 pb-2">
                        {client.name}
                      </div>
                      <div className="flex items-start gap-2 text-slate-600">
                        <UserIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0 break-words">
                          <span className="font-medium text-slate-700">
                            Contato:
                          </span>{' '}
                          {client.contact}
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0 break-words">
                          <span className="font-medium text-slate-700">
                            Email:
                          </span>{' '}
                          {client.email}
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0 break-words">
                          <span className="font-medium text-slate-700">
                            Telefone:
                          </span>{' '}
                          {client.phone}
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0 break-words">
                          <span className="font-medium text-slate-700">
                            Endereço:
                          </span>{' '}
                          {client.address}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Itens Selecionados
                      </Label>
                      <div className="font-medium text-slate-900 text-lg py-2">
                        {selectedItemIds.length}{' '}
                        {selectedItemIds.length === 1
                          ? 'transação'
                          : 'transações'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Data de Vencimento
                      </Label>
                      <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="font-medium bg-slate-50 border-slate-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-right block">
                        Valor Total
                      </Label>
                      <Input
                        value={formatCurrency(selectedAmount)}
                        readOnly
                        className="bg-slate-50 font-black text-2xl text-slate-900 cursor-not-allowed border-slate-200 text-right h-12"
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-2 pt-4 border-t border-slate-200">
                  <Button
                    variant="outline"
                    onClick={() => setIsConfirmDialogOpen(false)}
                    className="font-medium"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleGenerateInvoice}
                    className="font-bold shadow-md"
                    size="lg"
                  >
                    Confirmar e Gerar Fatura
                  </Button>
                </DialogFooter>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
