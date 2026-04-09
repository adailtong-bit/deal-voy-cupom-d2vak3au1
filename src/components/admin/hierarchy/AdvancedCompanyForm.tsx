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
import { Separator } from '@/components/ui/separator'
import { COUNTRIES } from '@/lib/locationData'
import { useLanguage } from '@/stores/LanguageContext'

interface Props {
  type: 'merchant' | 'franchise' | 'advertiser' | string
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
  const [formData, setFormData] = useState<
    Partial<Company & { country?: string }>
  >({
    name: '',
    email: '',
    status: 'active',
    franchiseId: franchiseId || 'independent',
    businessPhone: '',
    addressCountry: 'USA',
    country: 'USA',

    // Primary contact
    contactPerson: '',
    contactDepartment: '',
    contactEmail: '',
    contactPhone: '',

    // Secondary contact
    secondaryContactName: '',
    secondaryContactDepartment: '',
    secondaryContactEmail: '',
    secondaryContactPhone: '',

    // Billing
    stateRegistration: '',
    billingEmail: '',

    // Address
    addressStreet: '',
    addressNumber: '',
    addressNeighborhood: '',
    addressCity: '',
    addressState: '',
    addressZip: '',
    addressLat: undefined,
    addressLng: undefined,
  })

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleNumberChange = (field: keyof Company, value: string) => {
    const num = parseFloat(value)
    setFormData((prev) => ({ ...prev, [field]: isNaN(num) ? undefined : num }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            {t('admin.company.tabs.general', 'General')}
          </TabsTrigger>
          <TabsTrigger value="contacts">
            {t('admin.company.tabs.contacts', 'Contacts')}
          </TabsTrigger>
          <TabsTrigger value="billing">
            {t('admin.company.tabs.billing', 'Billing')}
          </TabsTrigger>
          <TabsTrigger value="address">
            {t('admin.company.tabs.address', 'Addressing')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {type === 'franchise'
                  ? t('admin.company.name', 'Franchise / Region Name')
                  : t('admin.company.name', 'Company Name')}
              </Label>
              <Input
                required
                placeholder={
                  type === 'franchise' ? 'Ex: Franquia São Paulo' : ''
                }
                value={formData.name || ''}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                {type === 'franchise'
                  ? t(
                      'admin.company.master_email',
                      'Franchisee Access Email (Login)',
                    )
                  : t('admin.company.master_email', 'Main Email')}
              </Label>
              <Input
                required
                type="email"
                placeholder="email@example.com"
                value={formData.email || ''}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t('admin.company.business_phone', 'Business Phone')}
              </Label>
              <Input
                required
                value={formData.businessPhone || ''}
                onChange={(e) =>
                  setFormData({ ...formData, businessPhone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('profile.country', 'Country')}</Label>
              <Select
                required
                value={formData.addressCountry || formData.country || ''}
                onValueChange={(v) =>
                  setFormData({ ...formData, addressCountry: v, country: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select', 'Select...')} />
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
            <div className="space-y-2 md:col-span-2">
              <Label>
                {t('vendor.settings_tab.assigned_region', 'Assigned Region')}
              </Label>
              <Input
                value={formData.region || ''}
                placeholder="Ex: Global, Europe, North America"
                onChange={(e) =>
                  setFormData({ ...formData, region: e.target.value })
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6 mt-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium leading-none">
              {t('admin.company.primary_contact', 'Primary Contact')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('admin.company.contact_name', 'Full Name')}</Label>
                <Input
                  required
                  value={formData.contactPerson || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPerson: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.company.department', 'Department')}</Label>
                <Input
                  required
                  value={formData.contactDepartment || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactDepartment: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.company.contact_email', 'Email')}</Label>
                <Input
                  required
                  type="email"
                  value={formData.contactEmail || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.company.contact_phone', 'Phone')}</Label>
                <Input
                  required
                  value={formData.contactPhone || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPhone: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium leading-none">
              {t('admin.company.secondary_contact', 'Secondary Contact')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('admin.company.contact_name', 'Full Name')}</Label>
                <Input
                  value={formData.secondaryContactName || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      secondaryContactName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.company.department', 'Department')}</Label>
                <Input
                  value={formData.secondaryContactDepartment || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      secondaryContactDepartment: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.company.contact_email', 'Email')}</Label>
                <Input
                  type="email"
                  value={formData.secondaryContactEmail || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      secondaryContactEmail: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.company.contact_phone', 'Phone')}</Label>
                <Input
                  value={formData.secondaryContactPhone || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      secondaryContactPhone: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t('admin.company.state_reg', 'State Registration / Tax ID')}
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
              <Label>{t('admin.company.billing_email', 'Billing Email')}</Label>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t('admin.company.address.street', 'Street Address')}
              </Label>
              <Input
                required
                value={formData.addressStreet || ''}
                onChange={(e) =>
                  setFormData({ ...formData, addressStreet: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.company.address.number', 'Number')}</Label>
              <Input
                required
                value={formData.addressNumber || ''}
                onChange={(e) =>
                  setFormData({ ...formData, addressNumber: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t('admin.company.address.neighborhood', 'Neighborhood')}
              </Label>
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
              <Label>{t('admin.company.address.city', 'City')}</Label>
              <Input
                required
                value={formData.addressCity || ''}
                onChange={(e) =>
                  setFormData({ ...formData, addressCity: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t('admin.company.address.state', 'State / Province')}
              </Label>
              <Input
                required
                value={formData.addressState || ''}
                onChange={(e) =>
                  setFormData({ ...formData, addressState: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.company.address.zip', 'ZIP Code')}</Label>
              <Input
                required
                value={formData.addressZip || ''}
                onChange={(e) =>
                  setFormData({ ...formData, addressZip: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.company.address.lat', 'Latitude')}</Label>
              <Input
                required
                type="number"
                step="any"
                value={formData.addressLat ?? ''}
                onChange={(e) =>
                  handleNumberChange('addressLat', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.company.address.lng', 'Longitude')}</Label>
              <Input
                required
                type="number"
                step="any"
                value={formData.addressLng ?? ''}
                onChange={(e) =>
                  handleNumberChange('addressLng', e.target.value)
                }
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="mt-6 pt-4 border-t">
        <Button variant="outline" type="button" onClick={onCancel}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button type="submit">{t('common.save', 'Save')}</Button>
      </DialogFooter>
    </form>
  )
}
