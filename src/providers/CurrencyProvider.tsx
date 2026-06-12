import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { currencyForCountry } from '../lib/currencyConfig'
import { formatLocalizedCents } from '../lib/formatPrice'

const RATES_URL = 'https://open.er-api.com/v6/latest/EUR'
const GEO_URL = 'https://ipapi.co/json/'
const CACHE_KEY = 'calma_currency_v1'
const CACHE_TTL_MS = 60 * 60 * 1000

type CachedPayload = {
  countryCode: string | null
  currency: string
  rates: Record<string, number>
  ts: number
}

type CurrencyContextValue = {
  countryCode: string | null
  currency: string
  loading: boolean
  formatFromCents: (centsEur: number) => string
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

function readCache(): CachedPayload | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedPayload
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(payload: CachedPayload) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    /* private mode */
  }
}

async function fetchGeoCountry(): Promise<string | null> {
  try {
    const res = await fetch(GEO_URL, { signal: AbortSignal.timeout(4000) })
    if (!res.ok) return null
    const data = (await res.json()) as { country_code?: string }
    return data.country_code ?? null
  } catch {
    return null
  }
}

async function fetchRates(): Promise<Record<string, number>> {
  const res = await fetch(RATES_URL, { signal: AbortSignal.timeout(6000) })
  if (!res.ok) throw new Error('rates unavailable')
  const data = (await res.json()) as { rates?: Record<string, number> }
  return data.rates ?? { EUR: 1 }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const cached = readCache()
  const [countryCode, setCountryCode] = useState<string | null>(cached?.countryCode ?? null)
  const [currency, setCurrency] = useState(cached?.currency ?? 'EUR')
  const [rates, setRates] = useState<Record<string, number>>(cached?.rates ?? { EUR: 1 })
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (cached) {
        setLoading(false)
        return
      }

      try {
        const [geo, rateMap] = await Promise.all([fetchGeoCountry(), fetchRates()])
        if (cancelled) return
        const cur = currencyForCountry(geo)
        setCountryCode(geo)
        setCurrency(cur)
        setRates(rateMap)
        writeCache({ countryCode: geo, currency: cur, rates: rateMap, ts: Date.now() })
      } catch {
        if (!cancelled) {
          setCurrency('EUR')
          setRates({ EUR: 1 })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap once
  }, [])

  const formatFromCents = useCallback(
    (centsEur: number) => formatLocalizedCents(centsEur, currency, rates),
    [currency, rates],
  )

  const value = useMemo<CurrencyContextValue>(
    () => ({ countryCode, currency, loading, formatFromCents }),
    [countryCode, currency, loading, formatFromCents],
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return ctx
}
