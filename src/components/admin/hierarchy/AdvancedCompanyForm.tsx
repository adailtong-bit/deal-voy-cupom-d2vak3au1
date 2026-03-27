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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PhoneInput } from '@/components/PhoneInput'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { toast } from 'sonner'
import {
  Building,
  UserCircle,
  Receipt,
  FileText,
  UploadCloud,
  Download,
  Trash2,
} from 'lucide-react'
import { CompanyDocument } from '@/lib/types'

export function AdvancedCompanyForm({
  type,
  initialData,
  franchiseId,
  onSave,
  onCancel,
}: any) {
  const { franchises } = useCouponStore()
  const { t } = useLanguage()

  const [data, setData] = useState<any>({
    status: 'active',
    paymentMethod: 'credit_card',
    billingFrequency: 'monthly',
    documents: [],
    addressCountry: 'BR',
    ...initialData,
  })

  const [docLabel, setDocLabel] = useState('Contrato Social')

  useEffect(() => {
    if (initialData) {
      setData({
        ...initialData,
        email: initialData.email || initialData.contactEmail || '',
        franchiseId: initialData.franchiseId || franchiseId || 'independent',
        documents: initialData.documents || [],
        addressCountry: initialData.addressCountry || 'BR',
      })
    } else if (franchiseId) {
      setData((prev: any) => ({ ...prev, franchiseId }))
    }
  }, [initialData, franchiseId])

  const onChange = (f: string, v: any) => setData({ ...data, [f]: v })

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const newDoc: CompanyDocument = {
        id: Math.random().toString(),
        name: file.name,
        label: docLabel,
        type: file.type,
        url: URL.createObjectURL(file), // Mock URL for preview
        uploadDate: new Date().toISOString(),
      }
      setData({ ...data, documents: [...(data.documents || []), newDoc] })
      toast.success(t('common.success', 'Documento carregado com sucesso.'))
    }
  }

  const removeDoc = (id: string) => {
    setData({
      ...data,
      documents: data.documents?.filter((d: CompanyDocument) => d.id !== id),
    })
    toast.success(t('common.success', 'Documento removido.'))
  }

  const save = () => {
    if (!data.name || !data.email || !data.addressCountry) {
      return toast.error(
        t('common.error', 'Preencha os campos obrigatórios (*).'),
      )
    }
    onSave(data)
  }

  return (
    <div className="flex flex-col space-y-4 pt-2">
      <Tabs defaultValue="controle" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4 bg-slate-100/80 p-1">
          <TabsTrigger value="controle" className="font-semibold">
            <Building className="h-4 w-4 mr-2 text-primary" />{' '}
            {t('admin.overview', 'Controle')}
          </TabsTrigger>
          <TabsTrigger value="contato" className="font-semibold">
            <UserCircle className="h-4 w-4 mr-2 text-blue-500" />{' '}
            {t('profile.personalInfo', 'Contato')}
          </TabsTrigger>
          <TabsTrigger value="cobranca" className="font-semibold">
            <Receipt className="h-4 w-4 mr-2 text-emerald-500" />{' '}
            {t('admin.billing', 'Cobrança')}
          </TabsTrigger>
          <TabsTrigger value="documentos" className="font-semibold">
            <FileText className="h-4 w-4 mr-2 text-orange-500" /> Documentos
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="controle"
          className="grid grid-cols-2 gap-5 animate-in fade-in-50 pt-2"
        >
          <div className="space-y-1.5">
            <Label className="text-slate-700">Razão Social</Label>
            <Input
              value={data.legalName || ''}
              onChange={(e) => onChange('legalName', e.target.value)}
              className="bg-slate-50"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700">Nome Fantasia *</Label>
            <Input
              value={data.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              className="bg-slate-50"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700">
              {t('vendor.settings_tab.country', 'País')} *
            </Label>
            <Select
              value={data.addressCountry || ''}
              onValueChange={(v) => onChange('addressCountry', v)}
            >
              <SelectTrigger className="bg-slate-50">
                <SelectValue
                  placeholder={t('vendor.settings_tab.select', 'Selecione...')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BR">Brasil</SelectItem>
                <SelectItem value="US">Estados Unidos</SelectItem>
                <SelectItem value="ES">Espanha</SelectItem>
                <SelectItem value="PT">Portugal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700">
              {t('admin.status', 'Status')}
            </Label>
            <Select
              value={data.status}
              onValueChange={(v) => onChange('status', v)}
            >
              <SelectTrigger className="bg-slate-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  {t('admin.active', 'Ativo')}
                </SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="pending">
                  {t('admin.pending', 'Pendente')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700">Referência Interna</Label>
            <Input
              value={data.internalRef || ''}
              onChange={(e) => onChange('internalRef', e.target.value)}
              className="bg-slate-50"
            />
          </div>

          {type === 'merchant' && !franchiseId && (
            <div className="space-y-1.5">
              <Label className="text-slate-700">Entidade Pai (Franquia)</Label>
              <Select
                value={data.franchiseId}
                onValueChange={(v) => onChange('franchiseId', v)}
              >
                <SelectTrigger className="bg-slate-50 border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independent">
                    Nenhuma (Independente)
                  </SelectItem>
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
          className="space-y-5 animate-in fade-in-50 pt-2"
        >
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-slate-700">Nome do Contato</Label>
              <Input
                value={data.contactPerson || ''}
                onChange={(e) => onChange('contactPerson', e.target.value)}
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700">Departamento</Label>
              <Input
                value={data.contactDepartment || ''}
                onChange={(e) => onChange('contactDepartment', e.target.value)}
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700">Email Principal *</Label>
              <Input
                type="email"
                value={data.email || ''}
                onChange={(e) => onChange('email', e.target.value)}
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700">Site</Label>
              <Input
                value={data.website || ''}
                onChange={(e) => onChange('website', e.target.value)}
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700">
                {t('profile.phone', 'Telefone')}
              </Label>
              <PhoneInput
                value={data.businessPhone || ''}
                onChange={(v) => onChange('businessPhone', v)}
                countryCode={data.addressCountry}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700">WhatsApp</Label>
              <PhoneInput
                value={data.whatsapp || ''}
                onChange={(v) => onChange('whatsapp', v)}
                countryCode={data.addressCountry}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="cobranca"
          className="space-y-5 animate-in fade-in-50 pt-2"
        >
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-slate-700">
                Tax ID / Documento (CNPJ/EIN)
              </Label>
              <Input
                value={data.taxId || ''}
                onChange={(e) => onChange('taxId', e.target.value)}
                placeholder="Documento fiscal..."
                className="bg-slate-50 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700">
                Inscrição Estadual / Registro
              </Label>
              <Input
                value={data.stateRegistration || ''}
                onChange={(e) => onChange('stateRegistration', e.target.value)}
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700">Banco (Nome/Número)</Label>
              <Input
                value={data.bankName || ''}
                onChange={(e) => onChange('bankName', e.target.value)}
                className="bg-slate-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 space-y-0">
              <div className="space-y-1.5">
                <Label className="text-slate-700">
                  Agência / Routing Number
                </Label>
                <Input
                  value={data.bankAgency || ''}
                  onChange={(e) => onChange('bankAgency', e.target.value)}
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700">Conta</Label>
                <Input
                  value={data.bankAccount || ''}
                  onChange={(e) => onChange('bankAccount', e.target.value)}
                  className="bg-slate-50"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700">Email de Faturamento</Label>
              <Input
                type="email"
                value={data.billingEmail || ''}
                onChange={(e) => onChange('billingEmail', e.target.value)}
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700">Ciclo de Faturamento</Label>
              <Select
                value={data.billingFrequency || 'monthly'}
                onValueChange={(v) => onChange('billingFrequency', v)}
              >
                <SelectTrigger className="bg-slate-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal / Monthly</SelectItem>
                  <SelectItem value="quarterly">
                    Trimestral / Quarterly
                  </SelectItem>
                  <SelectItem value="annually">Anual / Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label className="text-slate-700">Termos do Contrato</Label>
              <Textarea
                value={data.contractTerms || ''}
                onChange={(e) => onChange('contractTerms', e.target.value)}
                className="h-20 bg-slate-50 resize-none"
                placeholder="Detalhes ou condições comerciais específicas..."
              />
            </div>
          </div>
          <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mt-6">
            Endereço Principal
          </h4>
          <div className="grid grid-cols-3 gap-5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-slate-700">
                {t('profile.zip', 'CEP / Zip Code')}
              </Label>
              <Input
                value={data.addressZip || ''}
                onChange={(e) => onChange('addressZip', e.target.value)}
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label className="text-slate-700">Logradouro (Rua)</Label>
              <Input
                value={data.addressStreet || ''}
                onChange={(e) => onChange('addressStreet', e.target.value)}
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700">Número</Label>
              <Input
                value={data.addressNumber || ''}
                onChange={(e) => onChange('addressNumber', e.target.value)}
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700">Complemento</Label>
              <Input
                value={data.addressComplement || ''}
                onChange={(e) => onChange('addressComplement', e.target.value)}
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700">Bairro</Label>
              <Input
                value={data.addressNeighborhood || ''}
                onChange={(e) =>
                  onChange('addressNeighborhood', e.target.value)
                }
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label className="text-slate-700">
                {t('profile.city', 'Cidade')}
              </Label>
              <Input
                value={data.addressCity || ''}
                onChange={(e) => onChange('addressCity', e.target.value)}
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700">
                {t('profile.state', 'Estado')}
              </Label>
              <Input
                value={data.addressState || ''}
                maxLength={2}
                className="uppercase bg-slate-50"
                onChange={(e) => onChange('addressState', e.target.value)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="documentos"
          className="space-y-6 animate-in fade-in-50 pt-2"
        >
          <div className="grid gap-5">
            <div className="flex flex-col space-y-2 max-w-md">
              <Label className="text-slate-700">
                Tipo de Documento para Upload
              </Label>
              <Select value={docLabel} onValueChange={setDocLabel}>
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Contrato Social">
                    Contrato Social
                  </SelectItem>
                  <SelectItem value="Alvará de Funcionamento">
                    Alvará de Funcionamento
                  </SelectItem>
                  <SelectItem value="Comprovante de Endereço">
                    Comprovante de Endereço
                  </SelectItem>
                  <SelectItem value="Documento de Identidade">
                    Documento de Identidade (Sócio)
                  </SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 flex flex-col items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer relative group">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleUpload}
              />
              <UploadCloud className="h-10 w-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold text-slate-800 text-center">
                Clique ou arraste para enviar o documento
              </p>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">
                Arquivos suportados: PDF, JPG, PNG (Máx. 10MB)
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">
                    Arquivo
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Categoria
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Data de Envio
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">
                    {t('common.actions', 'Ações')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.documents?.map((doc: CompanyDocument) => (
                  <TableRow key={doc.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="truncate max-w-[150px] sm:max-w-xs text-slate-800">
                        {doc.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-100">
                        {doc.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 font-medium">
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault()
                          window.open(doc.url, '_blank')
                        }}
                        className="text-slate-500 hover:text-primary hover:bg-primary/10"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeDoc(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data.documents || data.documents.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-slate-500 font-medium"
                    >
                      Nenhum documento anexado ainda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
        <Button
          variant="outline"
          onClick={onCancel}
          className="font-semibold px-6"
        >
          {t('common.cancel', 'Cancelar')}
        </Button>
        <Button onClick={save} className="font-bold px-8 shadow-md">
          {t('common.save', 'Salvar Dados')}
        </Button>
      </div>
    </div>
  )
}
