import { useState, useMemo, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Store, Save, MapPin } from 'lucide-react'
import { useCouponStore } from '@/stores/CouponContext'
import { COUNTRIES, LOCATION_DATA } from '@/lib/locationData'
import { toast } from 'sonner'

export function VendorSettingsTab({ company }: any) {
  const { updateCompany } = useCouponStore()
  const [data, setData] = useState<any>({})

  useEffect(() => {
    if (company) setData(company)
  }, [company])

  const handleChange = (k: string, v: string) => setData({ ...data, [k]: v })

  const states = data.addressCountry
    ? Object.keys(LOCATION_DATA[data.addressCountry]?.states || {})
    : []
  const cities =
    data.addressCountry && data.addressState
      ? LOCATION_DATA[data.addressCountry]?.states[data.addressState] || []
      : []

  const formattedAddress = useMemo(() => {
    const {
      addressCountry: c,
      addressState: s,
      addressCity: ci,
      addressZip: z,
      addressStreet: st,
      addressNumber: n,
      addressComplement: comp,
    } = data
    if (!st || !n) return 'Preencha Rua e Número para visualizar'

    const cText = comp ? ` - ${comp}` : ''
    const usCText = comp ? `, ${comp}` : ''

    if (c === 'USA') {
      return `${n} ${st}${usCText}, ${ci || 'Cidade'}, ${s || 'Estado'} ${z || 'CEP'}`
    }
    return `${st}, ${n}${cText}, ${ci || 'Cidade'} - ${s || 'Estado'}, ${z || 'CEP'}`
  }, [data])

  const handleSave = () => {
    updateCompany(company.id, data)
    toast.success('Configurações da loja atualizadas com sucesso')
  }

  return (
    <Card className="max-w-4xl border-slate-200 shadow-sm animate-fade-in-up">
      <CardHeader className="border-b bg-slate-50/50 pb-5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Store className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Configurações da Loja</CardTitle>
            <CardDescription>
              Gerencie o perfil da sua empresa e detalhes de localização.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-slate-700">Nome da Loja</Label>
            <Input
              value={data.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700">E-mail de Contato</Label>
            <Input
              type="email"
              value={data.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700">Telefone Comercial</Label>
            <Input
              value={data.businessPhone || ''}
              onChange={(e) => handleChange('businessPhone', e.target.value)}
              placeholder="+55 11 99999-9999"
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700">Região Atribuída</Label>
            <Input
              value={data.region || 'Global'}
              disabled
              className="bg-slate-50 text-slate-500 font-medium"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-slate-500" />
            <h3 className="text-lg font-semibold text-slate-800">
              Endereço Físico (Mapa)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label className="text-slate-700">País</Label>
              <Select
                value={data.addressCountry || ''}
                onValueChange={(v) =>
                  setData({
                    ...data,
                    addressCountry: v,
                    addressState: '',
                    addressCity: '',
                  })
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Estado / Província</Label>
              <Select
                value={data.addressState || ''}
                onValueChange={(v) =>
                  setData({ ...data, addressState: v, addressCity: '' })
                }
                disabled={!states.length}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {states.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Cidade</Label>
              <Select
                value={data.addressCity || ''}
                onValueChange={(v) => handleChange('addressCity', v)}
                disabled={!cities.length}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">CEP / Postal Code</Label>
              <Input
                value={data.addressZip || ''}
                onChange={(e) => handleChange('addressZip', e.target.value)}
                placeholder={
                  data.addressCountry === 'USA' ? '12345' : '00000-000'
                }
                className="bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="space-y-2 sm:col-span-6">
              <Label className="text-slate-700">Rua / Logradouro</Label>
              <Input
                value={data.addressStreet || ''}
                onChange={(e) => handleChange('addressStreet', e.target.value)}
                placeholder="Ex: Avenida Paulista"
                className="bg-white"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-slate-700">Número</Label>
              <Input
                value={data.addressNumber || ''}
                onChange={(e) => handleChange('addressNumber', e.target.value)}
                placeholder="1000"
                className="bg-white"
              />
            </div>
            <div className="space-y-2 sm:col-span-4">
              <Label className="text-slate-700">Complemento (Opcional)</Label>
              <Input
                value={data.addressComplement || ''}
                onChange={(e) =>
                  handleChange('addressComplement', e.target.value)
                }
                placeholder="Sala, Andar, Bloco"
                className="bg-white"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-5">
            <p className="text-[11px] text-slate-500 font-bold mb-1.5 uppercase tracking-wider">
              Como aparecerá no app
            </p>
            <p className="text-slate-800 font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0" />{' '}
              {formattedAddress}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button onClick={handleSave} className="font-bold shadow-sm">
            <Save className="w-4 h-4 mr-2" /> Salvar Alterações
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
