import { Loader2, Package } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  AUDIO_SANCTUARY_CATEGORIES,
  AUDIO_SANCTUARY_SELECT,
  CATEGORY_BLURBS,
  CATEGORY_LABELS,
  type AudioSanctuaryCategory,
} from '../../lib/audioSanctuary'
import { memberHasAudioAccess } from '../../lib/audioAccess'
import {
  fetchPublishedBundlesCatalog,
  type SanctuaryBundleCatalogItem,
} from '../../lib/sanctuaryBundles'
import { supabase } from '../../lib/supabase'
import { cn } from '../../lib/utils'
import { useAuth } from '../../providers/AuthProvider'
import type { Tables } from '../../lib/database.types'
import {
  sanctuaryCategoryIdle,
  sanctuaryHeading,
  sanctuaryMuted,
  sanctuaryPageCanvas,
} from '../../lib/solidBadge'
import { FeaturedProtocolHero } from './FeaturedProtocolHero'
import { SanctuaryBundleCard } from './SanctuaryBundleCard'
import { SanctuaryCatalogCard } from './SanctuaryCatalogCard'

type SanctuaryRow = Tables<'classes'>
type SanctuaryFilter = AudioSanctuaryCategory | 'all' | 'bundles'

const BUNDLE_BLURB =
  'Curated multi-protocol packs — one unlock grants every track in the bundle.'

function pickFeatured(items: SanctuaryRow[]): SanctuaryRow | null {
  const bestSeller = items.find((i) =>
    i.badge?.toLowerCase().includes('best seller'),
  )
  if (bestSeller) return bestSeller
  const featured = items.find((i) => i.is_featured === true)
  if (featured) return featured
  return items.find((i) => i.sanctuary_status === 'active') ?? items[0] ?? null
}

export function AudioSanctuaryDashboard() {
  const { user } = useAuth()
  const [items, setItems] = useState<SanctuaryRow[]>([])
  const [bundles, setBundles] = useState<SanctuaryBundleCatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [bundlesLoading, setBundlesLoading] = useState(true)
  const [category, setCategory] = useState<SanctuaryFilter>('all')
  const [accessMap, setAccessMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('classes')
        .select(AUDIO_SANCTUARY_SELECT)
        .eq('is_audio_sanctuary', true)
        .order('sanctuary_status', { ascending: true })
        .order('title', { ascending: true })

      if (cancelled) return
      if (error) {
        setItems([])
      } else {
        setItems((data ?? []) as SanctuaryRow[])
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setBundlesLoading(true)
      const list = await fetchPublishedBundlesCatalog()
      if (!cancelled) {
        setBundles(list)
        setBundlesLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!user?.id || items.length === 0) {
      setAccessMap({})
      return
    }
    let cancelled = false
    ;(async () => {
      const next: Record<string, boolean> = {}
      await Promise.all(
        items.map(async (row) => {
          next[row.id] = await memberHasAudioAccess(user.id, row.id)
        }),
      )
      if (!cancelled) setAccessMap(next)
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id, items])

  const featured = useMemo(() => pickFeatured(items), [items])

  const filtered = useMemo(() => {
    let list =
      category === 'all' || category === 'bundles'
        ? items
        : items.filter((i) => i.audio_sanctuary_category === category)
    if (featured && category === 'all') {
      list = list.filter((i) => i.id !== featured.id)
    }
    return list
  }, [items, category, featured])

  const showFeatured = featured && category === 'all'
  const showProtocols = category !== 'bundles'
  const showBundles = category === 'bundles'

  const filterBlurb =
    category === 'bundles'
      ? BUNDLE_BLURB
      : category !== 'all'
        ? CATEGORY_BLURBS[category]
        : null

  return (
    <div className={cn('relative w-full min-w-0 pb-12', sanctuaryPageCanvas)}>
      <header className="mb-8 space-y-3 sm:mb-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#2DD4BF]">
          Audio Sanctuary
        </p>
        <h1
          className={cn(
            'text-2xl font-light tracking-tight sm:text-3xl md:text-4xl',
            sanctuaryHeading,
          )}
        >
          Quantum Acoustic Protocols
        </h1>
        <p className={cn('max-w-2xl text-sm leading-relaxed tracking-wide', sanctuaryMuted)}>
          Master-grade spatial audio · instant quantum flow · transformation protocols engineered for deep
          nervous-system regulation.
        </p>
      </header>

      <div className="mb-10 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={cn(
            'rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition',
            category === 'all'
              ? 'border-[#2DD4BF] bg-[#2DD4BF] text-slate-950'
              : sanctuaryCategoryIdle,
          )}
        >
          All Paths
        </button>
        <button
          type="button"
          onClick={() => setCategory('bundles')}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium tracking-wide backdrop-blur-md transition',
            category === 'bundles'
              ? 'border-[#2DD4BF] bg-[#2DD4BF]/20 text-slate-950 ring-1 ring-[#2DD4BF]/40'
              : 'border-[#2DD4BF]/30 bg-white/50 text-[#0f766e] ring-1 ring-[#2DD4BF]/15 hover:bg-[#2DD4BF]/10 dark:border-[#2DD4BF]/35 dark:bg-[#2DD4BF]/10 dark:text-[#2DD4BF]',
          )}
        >
          <Package className="h-3.5 w-3.5" />
          Bundles
        </button>
        {AUDIO_SANCTUARY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              'rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition',
              category === cat
                ? 'border-[#2DD4BF] bg-[#2DD4BF] text-slate-950'
                : sanctuaryCategoryIdle,
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {filterBlurb && (
        <p className={cn('mb-8 text-sm tracking-wide', sanctuaryMuted)}>{filterBlurb}</p>
      )}

      {loading && category !== 'bundles' ? (
        <div className="flex justify-center py-28">
          <Loader2 className="h-9 w-9 animate-spin text-[#2DD4BF]" />
        </div>
      ) : showBundles ? (
        bundlesLoading ? (
          <div className="flex justify-center py-28">
            <Loader2 className="h-9 w-9 animate-spin text-[#2DD4BF]" />
          </div>
        ) : bundles.length === 0 ? (
          <p className={cn('py-20 text-center text-sm tracking-wide', sanctuaryMuted)}>
            No published bundles yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bundles.map((bundle, i) => (
              <SanctuaryBundleCard key={bundle.id} bundle={bundle} index={i} />
            ))}
          </div>
        )
      ) : items.length === 0 ? (
        <p className={cn('py-20 text-center text-sm tracking-wide', sanctuaryMuted)}>
          No meditations published yet.
        </p>
      ) : (
        <>
          {showFeatured && (
            <FeaturedProtocolHero featured={featured} hasAccess={accessMap[featured.id]} />
          )}

          {showProtocols && filtered.length === 0 ? (
            <p className={cn('py-12 text-center text-sm', sanctuaryMuted)}>
              No protocols in this category.
            </p>
          ) : showProtocols ? (
            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((row, i) => (
                <SanctuaryCatalogCard key={row.id} row={row} index={i} />
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
