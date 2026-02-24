/* General utility functions (exposes cn) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string | Date | undefined, locale: string) {
  if (!dateStr) return ''
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date)
}

export function formatCurrency(
  amount: number,
  currency: string = 'BRL',
  locale?: string,
) {
  // Determine locale based on currency to force correct regional formatting
  // overriding the UI locale if necessary to guarantee origin-based formatting.
  let targetLocale = locale
  if (currency === 'USD') targetLocale = 'en-US'
  else if (currency === 'BRL') targetLocale = 'pt-BR'
  else if (currency === 'EUR') targetLocale = 'fr-FR'
  else if (currency === 'GBP') targetLocale = 'en-GB'
  else if (!targetLocale) targetLocale = 'pt-BR'

  return new Intl.NumberFormat(targetLocale, {
    style: 'currency',
    currency: currency,
  }).format(amount)
}
