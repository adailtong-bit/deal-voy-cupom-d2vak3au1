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
import { COUNTRIES } from '@/lib/locationData'
import { useLanguage } from '@/stores/LanguageContext'

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
  const [formData, setFormData] = useState<Partial<Company>>({
    name: '',
    email: '',
    status: 'active',
    franchiseId: franchiseId || 'independent',
    contactPerson: '',
    contactDepartment: '',
    billingEmail: '',
    stateRegistration: '',
    addressCountry: 'USA',
  })

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('admin.company.name', 'Nome da Loja')}</Label>
          <Input
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('admin.company.email', 'E-mail Principal')}</Label>
          <Input
            required
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>{t('profile.country', 'País')}</Label>
          <Select
            required
            value={formData.addressCountry}
            onValueChange={(v) =>
              setFormData({ ...formData, addressCountry: v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t('common.select', 'Selecione...')} />
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
        <div className="space-y-2">
          <Label>{t('admin.company.contact_name', 'Nome do Contato')}</Label>
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
              setFormData({ ...formData, contactDepartment: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>{t('admin.company.state_reg', 'Inscrição Estadual')}</Label>
          <Input
            value={formData.stateRegistration || ''}
            onChange={(e) =>
              setFormData({ ...formData, stateRegistration: e.target.value })
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
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          {t('common.cancel', 'Cancelar')}
        </Button>
        <Button type="submit">{t('common.save', 'Salvar')}</Button>
      </DialogFooter>
    </form>
  )
}
