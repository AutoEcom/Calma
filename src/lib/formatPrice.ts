import { localeForCurrency } from './currencyConfig'
import { convertEurCentsToLocal } from './currencyMath'

export function formatEurFromCents(cents: number): string {
  return formatMoneyAmount(cents / 100, 'EUR')
}

export function formatMoneyAmount(amount: number, currency: string): string {
  const zeroDecimal = currency === 'JPY' || currency === 'KRW'
  return new Intl.NumberFormat(localeForCurrency(currency), {
    style: 'currency',
    currency,
    minimumFractionDigits: zeroDecimal ? 0 : 2,
    maximumFractionDigits: zeroDecimal ? 0 : 2,
  }).format(amount)
}

export function formatLocalizedCents(
  centsEur: number,
  currency: string,
  ratesFromEur: Record<string, number>,
): string {
  const local = convertEurCentsToLocal(centsEur, currency, ratesFromEur)
  return formatMoneyAmount(local, currency)
}
