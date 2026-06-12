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

/** Bulgaria always displays EUR in storefront UI (never BGN). */
const EUR_OVERRIDE_COUNTRIES = new Set(['BG'])

export function currencyForCountry(countryCode: string | null | undefined): string {
  if (!countryCode) return EU_FALLBACK
  const code = countryCode.trim().toUpperCase()
  if (EUR_OVERRIDE_COUNTRIES.has(code)) return 'EUR'
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
