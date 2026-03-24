import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhoneInput } from '@/components/PhoneInput'
import { useCouponStore } from '@/stores/CouponContext'
import { toast } from 'sonner'
import { Building, UserCircle, Receipt } from 'lucide-react'

export function AdvancedCompanyForm({
  type,
  initialData,
  franchiseId,
  onSave,
  onCancel,
}: any) {
  const { franchises } = useCouponStore()
  const [data, setData] = useState<any>({
    status: 'active',
    paymentMethod: 'credit_card',
    billingFrequency: 'monthly',
    ...initialData,
  })

  useEffect(() => {
    if (initialData) {
      setData({
        ...initialData,
        email: initialData.email || initialData.contactEmail || '',
        franchiseId: initialData.franchiseId || franchiseId || 'independent',
      })
    }
  }, [initialData, franchiseId])

  const onChange = (f: string, v: any) => setData({ ...data, [f]: v })

  const save = () => {
    if (!data.name || !data.legalName || !data.email || !data.taxId) {
      return toast.error('Preencha os campos obrigatórios (*).')
    }
    onSave(data)
  }

  return (
    <div className="flex flex-col space-y-4 pt-2">
      <Tabs defaultValue="controle" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="controle">
            <Building className="h-4 w-4 mr-2" /> Controle
          </TabsTrigger>
          <TabsTrigger value="contato">
            <UserCircle className="h-4 w-4 mr-2" /> Contato
          </TabsTrigger>
          <TabsTrigger value="cobranca">
            <Receipt className="h-4 w-4 mr-2" /> Cobrança
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="controle"
          className="grid grid-cols-2 gap-4 animate-in fade-in-50"
        >
          <div className="space-y-1">
            <Label>Razão Social *</Label>
            <Input
              value={data.legalName || ''}
              onChange={(e) => onChange('legalName', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Nome Fantasia *</Label>
            <Input
              value={data.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Categoria</Label>
            <Input
              value={data.category || ''}
              onChange={(e) => onChange('category', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <Select
              value={data.status}
              onValueChange={(v) => onChange('status', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Referência Interna</Label>
            <Input
              value={data.internalRef || ''}
              onChange={(e) => onChange('internalRef', e.target.value)}
            />
          </div>
          {type === 'merchant' && (
            <div className="space-y-1">
              <Label>Entidade Pai (Franquia)</Label>
              <Select
                value={data.franchiseId}
                onValueChange={(v) => onChange('franchiseId', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independent">Independente</SelectItem>
                  {franchises.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </TabsContent>
        <TabsContent
          value="contato"
          className="space-y-4 animate-in fade-in-50"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Nome do Contato</Label>
              <Input
                value={data.contactPerson || ''}
                onChange={(e) => onChange('contactPerson', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Departamento</Label>
              <Input
                value={data.contactDepartment || ''}
                onChange={(e) => onChange('contactDepartment', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Email Principal *</Label>
              <Input
                type="email"
                value={data.email || ''}
                onChange={(e) => onChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Site</Label>
              <Input
                value={data.website || ''}
                onChange={(e) => onChange('website', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Telefone</Label>
              <PhoneInput
                value={data.businessPhone || ''}
                onChange={(v) => onChange('businessPhone', v)}
              />
            </div>
            <div className="space-y-1">
              <Label>WhatsApp</Label>
              <PhoneInput
                value={data.whatsapp || ''}
                onChange={(v) => onChange('whatsapp', v)}
              />
            </div>
          </div>
          <h4 className="text-sm font-bold border-b pb-1 mt-4">
            Contato Secundário
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Nome</Label>
              <Input
                value={data.secondaryContactName || ''}
                onChange={(e) =>
                  onChange('secondaryContactName', e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                value={data.secondaryContactEmail || ''}
                onChange={(e) =>
                  onChange('secondaryContactEmail', e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Telefone</Label>
              <PhoneInput
                value={data.secondaryContactPhone || ''}
                onChange={(v) => onChange('secondaryContactPhone', v)}
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent
          value="cobranca"
          className="space-y-4 animate-in fade-in-50"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>CNPJ *</Label>
              <Input
                value={data.taxId || ''}
                maxLength={18}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, '').slice(0, 14)
                  v = v.replace(/^(\d{2})(\d)/, '$1.$2')
                  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                  v = v.replace(/\.(\d{3})(\d)/, '.$1/$2')
                  v = v.replace(/(\d{4})(\d)/, '$1-$2')
                  onChange('taxId', v)
                }}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="space-y-1">
              <Label>Inscrição Estadual</Label>
              <Input
                value={data.stateRegistration || ''}
                onChange={(e) => onChange('stateRegistration', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Banco (Nome/Número)</Label>
              <Input
                value={data.bankName || ''}
                onChange={(e) => onChange('bankName', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 space-y-0">
              <div className="space-y-1">
                <Label>Agência</Label>
                <Input
                  value={data.bankAgency || ''}
                  onChange={(e) => onChange('bankAgency', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Conta</Label>
                <Input
                  value={data.bankAccount || ''}
                  onChange={(e) => onChange('bankAccount', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Email de Faturamento</Label>
              <Input
                type="email"
                value={data.billingEmail || ''}
                onChange={(e) => onChange('billingEmail', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Ciclo de Faturamento</Label>
              <Select
                value={data.billingFrequency || 'monthly'}
                onValueChange={(v) => onChange('billingFrequency', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="annually">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Termos do Contrato</Label>
              <Textarea
                value={data.contractTerms || ''}
                onChange={(e) => onChange('contractTerms', e.target.value)}
                className="h-16"
              />
            </div>
          </div>
          <h4 className="text-sm font-bold border-b pb-1 mt-4">Endereço</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>CEP</Label>
              <Input
                value={data.addressZip || ''}
                maxLength={9}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, '')
                  if (v.length > 8) v = v.slice(0, 8)
                  v = v.replace(/^(\d{5})(\d{0,3})/, '$1-$2')
                  onChange('addressZip', v)
                }}
                placeholder="00000-000"
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Logradouro (Rua)</Label>
              <Input
                value={data.addressStreet || ''}
                onChange={(e) => onChange('addressStreet', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Número</Label>
              <Input
                value={data.addressNumber || ''}
                onChange={(e) => onChange('addressNumber', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Complemento</Label>
              <Input
                value={data.addressComplement || ''}
                onChange={(e) => onChange('addressComplement', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Bairro</Label>
              <Input
                value={data.addressNeighborhood || ''}
                onChange={(e) =>
                  onChange('addressNeighborhood', e.target.value)
                }
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Cidade</Label>
              <Input
                value={data.addressCity || ''}
                onChange={(e) => onChange('addressCity', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>UF</Label>
              <Input
                value={data.addressState || ''}
                maxLength={2}
                className="uppercase"
                onChange={(e) => onChange('addressState', e.target.value)}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <div className="flex justify-end gap-2 pt-4 border-t mt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={save}>Salvar</Button>
      </div>
    </div>
  )
}
