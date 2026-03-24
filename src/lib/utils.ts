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
  return new Intl.DateTimeFormat(locale).format(new Date(date))
}
