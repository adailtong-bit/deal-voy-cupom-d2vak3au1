import { useMemo } from 'react'

export function useRegionFormatting(regionCode?: string, country?: string) {
  return useMemo(() => {
    let locale = 'en-US'
    let currency = 'USD'
    let distanceUnit = 'mi'

    const targetScope = (country || regionCode || '').toUpperCase()

    if (
      targetScope.includes('BRASIL') ||
      targetScope.includes('BRAZIL') ||
      targetScope === 'BR'
    ) {
      locale = 'pt-BR'
      currency = 'BRL'
      distanceUnit = 'km'
    } else if (targetScope.includes('MEXICO') || targetScope === 'MX') {
      locale = 'es-MX'
      currency = 'MXN'
      distanceUnit = 'km'
    } else if (
      targetScope.includes('ESPANHA') ||
      targetScope.includes('SPAIN') ||
      targetScope === 'ES'
    ) {
      locale = 'es-ES'
      currency = 'EUR'
      distanceUnit = 'km'
    } else if (targetScope.includes('PORTUGAL') || targetScope === 'PT') {
      locale = 'pt-PT'
      currency = 'EUR'
      distanceUnit = 'km'
    } else if (
      targetScope.includes('EU') ||
      targetScope.includes('FRANCE') ||
      targetScope.includes('FR')
    ) {
      locale = 'fr-FR'
      currency = 'EUR'
      distanceUnit = 'km'
    }

    const formatCurrency = (amount: number | null | undefined) => {
      if (amount === undefined || amount === null) return ''
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    }

    const formatDate = (date: string | Date | null | undefined) => {
      if (!date) return ''
      return new Intl.DateTimeFormat(locale).format(new Date(date))
    }

    const formatShortDate = (date: string | Date | null | undefined) => {
      if (!date) return ''
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
      }).format(new Date(date))
    }

    const formatTime = (date: string | Date | null | undefined) => {
      if (!date) return ''
      return new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        minute: 'numeric',
        hour12: locale === 'en-US',
      }).format(new Date(date))
    }

    const formatNumber = (
      num: number | null | undefined,
      options?: Intl.NumberFormatOptions,
    ) => {
      if (num === undefined || num === null) return ''
      return new Intl.NumberFormat(locale, options).format(num)
    }

    const formatDistance = (valueInKm: number) => {
      if (distanceUnit === 'mi') {
        const miles = valueInKm * 0.621371
        return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(miles)} mi`
      }
      return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(valueInKm)} km`
    }

    return {
      locale,
      currency,
      distanceUnit,
      formatCurrency,
      formatDate,
      formatShortDate,
      formatTime,
      formatNumber,
      formatDistance,
    }
  }, [regionCode, country])
}
