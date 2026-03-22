import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number | null | undefined,
  currency = 'USD',
  locale = 'en-US',
) {
  if (amount == null) return ''
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
    amount,
  )
}

export function formatDate(date: string | Date, locale = 'en-US') {
  if (!date) return ''
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}
