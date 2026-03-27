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
import { Check, ChevronsUpDown, Filter } from 'lucide-react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { cn } from '@/lib/utils'

export function BillingGenerationTab({
  franchiseId,
}: {
  franchiseId?: string
}) {
  const { user, franchises, companies, generatePartnerInvoice } =
    useCouponStore()
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
  const [invoiceRef, setInvoiceRef] = useState('')

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

  const filteredItems = useMemo(() => {
    return mockItems.filter((item) => {
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
  }, [mockItems, itemFilterStatus, itemFilterId, itemFilterPeriod])

  const handleGenerateInvoice = () => {
    const itemsToBill = filteredItems.filter((i) =>
      selectedItemIds.includes(i.id),
    )
    if (itemsToBill.length === 0 || !invoiceRef.trim()) return

    generatePartnerInvoice({
      referenceNumber: invoiceRef.trim(),
      targetType: selectedTargetType,
      companyId: selectedTargetType === 'merchant' ? selectedTargetId : '',
      franchiseId: selectedTargetType === 'franchise' ? selectedTargetId : '',
      totalCommission: itemsToBill.reduce((a, b) => a + b.amount, 0),
      transactionCount: itemsToBill.length,
      periodStart: itemsToBill[itemsToBill.length - 1]?.date,
      periodEnd: itemsToBill[0]?.date,
      items: itemsToBill,
      status: 'draft',
    })
    setSelectedItemIds([])
    setInvoiceRef('')
    setMockItems((prev) => prev.filter((i) => !selectedItemIds.includes(i.id)))
  }

  const selectedTargetName = useMemo(() => {
    const target = targets.find((t) => t.id === selectedTargetId)
    if (!target) return 'Selecione o destinatário...'
    return `${target.name} - ${target.taxId ? target.taxId : 'Sem Doc'}`
  }, [targets, selectedTargetId])

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
              <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
                <Input
                  placeholder="Nº da Fatura (Ref)..."
                  value={invoiceRef}
                  onChange={(e) => setInvoiceRef(e.target.value)}
                  className="w-full md:w-[180px]"
                />
                <Button
                  onClick={handleGenerateInvoice}
                  disabled={selectedItemIds.length === 0 || !invoiceRef.trim()}
                  className="w-full md:w-auto whitespace-nowrap"
                >
                  Gerar Fatura ({selectedItemIds.length})
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
                          selectedItemIds.length === filteredItems.length &&
                          filteredItems.length > 0
                        }
                        onCheckedChange={(c) => {
                          if (c)
                            setSelectedItemIds(filteredItems.map((i) => i.id))
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
                    <TableRow key={item.id}>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {item.id}
                      </TableCell>
                      <TableCell>{formatShortDate(item.date)}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="capitalize">
                        {item.status}
                      </TableCell>
                      <TableCell className="text-right">
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
      </CardContent>
    </Card>
  )
}
