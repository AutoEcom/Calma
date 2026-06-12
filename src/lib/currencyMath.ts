const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'VND', 'CLP', 'IDR'])

/** Charm pricing: premium .99 endings (or whole units for zero-decimal currencies). */
export function roundPremiumLocalAmount(amount: number, currency: string): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0

  if (ZERO_DECIMAL.has(currency)) {
    const step = currency === 'JPY' ? 10 : 100
    return Math.max(step, Math.ceil(amount / step) * step)
  }

  if (amount < 3) {
    return Math.ceil(amount * 100) / 100
  }

  const floor = Math.floor(amount)
  const charm = floor + 0.99
  if (charm >= amount * 0.92 && charm <= amount * 1.08) {
    return charm
  }

  const rounded = Math.round(amount) - 0.01
  return rounded > 0 ? rounded : amount
}

export function convertEurCentsToLocal(
  centsEur: number,
  currency: string,
  ratesFromEur: Record<string, number>,
): number {
  const eurAmount = centsEur / 100
  if (currency === 'EUR') {
    return roundPremiumLocalAmount(eurAmount, currency)
  }
  const rate = ratesFromEur[currency]
  if (!rate || !Number.isFinite(rate)) {
    return roundPremiumLocalAmount(eurAmount, 'EUR')
  }
  return roundPremiumLocalAmount(eurAmount * rate, currency)
}
