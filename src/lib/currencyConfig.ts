/** ISO 3166-1 alpha-2 → ISO 4217. Default EUR for unlisted / EU. */
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  NZ: 'NZD',
  JP: 'JPY',
  CN: 'CNY',
  HK: 'HKD',
  SG: 'SGD',
  CH: 'CHF',
  NO: 'NOK',
  SE: 'SEK',
  DK: 'DKK',
  PL: 'PLN',
  CZ: 'CZK',
  HU: 'HUF',
  RO: 'RON',
  BG: 'BGN',
  IN: 'INR',
  MX: 'MXN',
  BR: 'BRL',
  KR: 'KRW',
  AE: 'AED',
  SA: 'SAR',
  IL: 'ILS',
  ZA: 'ZAR',
  TR: 'TRY',
  TH: 'THB',
  MY: 'MYR',
  ID: 'IDR',
  PH: 'PHP',
  // Eurozone
  AT: 'EUR',
  BE: 'EUR',
  CY: 'EUR',
  DE: 'EUR',
  EE: 'EUR',
  ES: 'EUR',
  FI: 'EUR',
  FR: 'EUR',
  GR: 'EUR',
  HR: 'EUR',
  IE: 'EUR',
  IT: 'EUR',
  LT: 'EUR',
  LU: 'EUR',
  LV: 'EUR',
  MT: 'EUR',
  NL: 'EUR',
  PT: 'EUR',
  SI: 'EUR',
  SK: 'EUR',
}

const EU_FALLBACK = 'EUR'

export function currencyForCountry(countryCode: string | null | undefined): string {
  if (!countryCode) return EU_FALLBACK
  const code = countryCode.trim().toUpperCase()
  return COUNTRY_TO_CURRENCY[code] ?? EU_FALLBACK
}

export function localeForCurrency(currency: string): string {
  const map: Record<string, string> = {
    USD: 'en-US',
    GBP: 'en-GB',
    EUR: 'en-IE',
    JPY: 'ja-JP',
    CNY: 'zh-CN',
    CAD: 'en-CA',
    AUD: 'en-AU',
  }
  return map[currency] ?? 'en-US'
}
