const eur = new Intl.NumberFormat('bg-BG', {
  style: 'currency',
  currency: 'EUR',
})

export function formatEurFromCents(cents: number): string {
  return eur.format(cents / 100)
}
