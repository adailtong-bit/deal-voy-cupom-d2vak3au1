import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number | undefined | null,
  currency = 'BRL',
  locale = 'pt-BR',
) {
  if (amount === undefined || amount === null) return ''
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: string | Date, locale = 'pt-BR') {
  if (!date) return ''
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function extractContactInfo(entity: any) {
  if (!entity) return { name: 'Financeiro', email: '', phone: '' }

  const isSecFin = entity.secondaryContactDepartment
    ?.toLowerCase()
    .includes('financ')
  const isPriFin = entity.contactDepartment?.toLowerCase().includes('financ')

  if (isSecFin && entity.secondaryContactName) {
    return {
      name: entity.secondaryContactName,
      email:
        entity.billingEmail ||
        entity.secondaryContactEmail ||
        entity.email ||
        '',
      phone: entity.secondaryContactPhone || entity.businessPhone || '',
    }
  }
  if (isPriFin && entity.contactPerson) {
    return {
      name: entity.contactPerson,
      email: entity.billingEmail || entity.contactEmail || entity.email || '',
      phone: entity.contactPhone || entity.businessPhone || '',
    }
  }

  return {
    name: entity.contactPerson || entity.secondaryContactName || 'Responsável',
    email:
      entity.billingEmail ||
      entity.contactEmail ||
      entity.secondaryContactEmail ||
      entity.email ||
      '',
    phone:
      entity.contactPhone ||
      entity.secondaryContactPhone ||
      entity.businessPhone ||
      '',
  }
}

export function formatAddress(entity: any) {
  if (!entity) return ''
  const parts = []
  let streetPart = entity.addressStreet || ''
  if (streetPart && entity.addressNumber)
    streetPart += `, ${entity.addressNumber}`
  if (streetPart && entity.addressComplement)
    streetPart += ` (${entity.addressComplement})`
  if (entity.addressNeighborhood)
    streetPart += (streetPart ? ` - ` : '') + entity.addressNeighborhood
  if (streetPart) parts.push(streetPart)

  let cityState = ''
  if (entity.addressCity) cityState += entity.addressCity
  if (entity.addressState)
    cityState += cityState ? ` - ${entity.addressState}` : entity.addressState
  if (cityState) parts.push(cityState)

  if (entity.addressZip) parts.push(`CEP: ${entity.addressZip}`)

  return parts.join(', ')
}
