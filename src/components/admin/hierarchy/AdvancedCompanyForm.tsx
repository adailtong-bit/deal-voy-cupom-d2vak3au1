import React, { useState, useEffect } from 'react'
import { Company } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DialogFooter } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { COUNTRIES } from '@/lib/locationData'
import { useLanguage } from '@/stores/LanguageContext'

type ExtendedCompany = Partial<Company> & {
  addressStreet?: string
  addressNumber?: string
  addressNeighborhood?: string
  addressCity?: string
  addressState?: string
  addressZip?: string
}

interface Props {
  type: 'merchant' | 'franchise'
  initialData?: Company | null
  franchiseId?: string
  onSave: (data: Partial<Company>) => void
  onCancel: () => void
}

export function AdvancedCompanyForm({
  type,
  initialData,
  franchiseId,
  onSave,
  onCancel,
}: Props) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<ExtendedCompany>({
    name: '',
    email: '',
    status: 'active',
    franchiseId: franchiseId || 'independent',
    contactPerson: '',
    contactDepartment: '',
    billingEmail: '',
    stateRegistration: '',
    addressCountry: 'USA',
    addressStreet: '',
    addressNumber: '',
    addressNeighborhood: '',
    addressCity: '',
    addressState: '',
    addressZip: '',
  })

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData as Partial<Company>)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            {t('admin.company.tabs.general', 'Geral')}
          </TabsTrigger>
          <TabsTrigger value="contact">
            {t('admin.company.tabs.contact', 'Contato')}
          </TabsTrigger>
          <TabsTrigger value="billing">
            {t('admin.company.tabs.billing', 'Faturamento')}
          </TabsTrigger>
          <TabsTrigger value="address">
            {t('admin.company.tabs.address', 'Endereçamento')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('admin.company.name', 'Nome da Loja')}</Label>
              <Input
                required
                value={formData.name || ''}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.company.email', 'E-mail Principal')}</Label>
              <Input
                required
                type="email"
                value={formData.email || ''}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('profile.country', 'País')}</Label>
              <Select
                required
                value={formData.addressCountry || ''}
                onValueChange={(v) =>
                  setFormData({ ...formData, addressCountry: v })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('common.select', 'Selecione...')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES?.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t('admin.company.contact_name', 'Nome do Contato')}
              </Label>
              <Input
                value={formData.contactPerson || ''}
                onChange={(e) =>
                  setFormData({ ...formData, contactPerson: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.company.department', 'Departamento')}</Label>
              <Input
                value={formData.contactDepartment || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactDepartment: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t('admin.company.state_reg', 'Inscrição Estadual')}
              </Label>
              <Input
                value={formData.stateRegistration || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stateRegistration: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t('admin.company.billing_email', 'E-mail de Faturamento')}
              </Label>
              <Input
                type="email"
                value={formData.billingEmail || ''}
                onChange={(e) =>
                  setFormData({ ...formData, billingEmail: e.target.value })
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="address" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('admin.company.address.street', 'Rua/Avenida')}</Label>
              <Input
                required
                value={formData.addressStreet || ''}
                onChange={(e) =>
                  setFormData({ ...formData, addressStreet: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.company.address.number', 'Número')}</Label>
              <Input
                required
                value={formData.addressNumber || ''}
                onChange={(e) =>
                  setFormData({ ...formData, addressNumber: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.company.address.neighborhood', 'Bairro')}</Label>
              <Input
                required
                value={formData.addressNeighborhood || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    addressNeighborhood: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.company.address.city', 'Cidade')}</Label>
              <Input
                required
                value={formData.addressCity || ''}
                onChange={(e) =>
                  setFormData({ ...formData, addressCity: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.company.address.state', 'Estado')}</Label>
              <Input
                required
                value={formData.addressState || ''}
                onChange={(e) =>
                  setFormData({ ...formData, addressState: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.company.address.zip', 'CEP')}</Label>
              <Input
                required
                value={formData.addressZip || ''}
                onChange={(e) =>
                  setFormData({ ...formData, addressZip: e.target.value })
                }
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="mt-6 pt-4 border-t">
        <Button variant="outline" type="button" onClick={onCancel}>
          {t('common.cancel', 'Cancelar')}
        </Button>
        <Button type="submit">{t('common.save', 'Salvar')}</Button>
      </DialogFooter>
    </form>
  )
}
