import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  AUDIO_SANCTUARY_CATEGORIES,
  AUDIO_SANCTUARY_SELECT,
  CATEGORY_BLURBS,
  CATEGORY_LABELS,
  type AudioSanctuaryCategory,
} from '../../lib/audioSanctuary'
import { memberHasAudioAccess } from '../../lib/audioAccess'
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
import { SanctuaryCatalogCard } from './SanctuaryCatalogCard'

type SanctuaryRow = Tables<'classes'>

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
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<AudioSanctuaryCategory | 'all'>('all')
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
        console.error(error)
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
    let list = category === 'all' ? items : items.filter((i) => i.audio_sanctuary_category === category)
    if (featured && category === 'all') {
      list = list.filter((i) => i.id !== featured.id)
    }
    return list
  }, [items, category, featured])

  return (
    <div className={cn('relative min-h-[calc(100vh-8rem)] w-full max-w-full min-w-0 overflow-x-hidden', sanctuaryPageCanvas)}>
      <header className="mb-8 space-y-3 sm:mb-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#2DD4BF]">
          Audio Sanctuary
        </p>
        <h1 className={cn('text-2xl font-light tracking-tight sm:text-3xl md:text-4xl', sanctuaryHeading)}>
          Quantum Acoustic Protocols
        </h1>
        <p className={cn('max-w-2xl text-sm leading-relaxed tracking-wide', sanctuaryMuted)}>
          Master-grade spatial audio · secure HLS · transformation protocols engineered for deep
          nervous-system regulation.
        </p>
      </header>

      <div className="mb-10 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={cn(
            'shrink-0 rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition',
            category === 'all'
              ? 'border-[#2DD4BF] bg-[#2DD4BF] text-slate-950'
              : sanctuaryCategoryIdle,
          )}
        >
          All Paths
        </button>
        {AUDIO_SANCTUARY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition',
              category === cat
                ? 'border-[#2DD4BF] bg-[#2DD4BF] text-slate-950'
                : sanctuaryCategoryIdle,
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {category !== 'all' && (
        <p className={cn('mb-8 text-sm tracking-wide', sanctuaryMuted)}>{CATEGORY_BLURBS[category]}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-28">
          <Loader2 className="h-9 w-9 animate-spin text-[#2DD4BF]" />
        </div>
      ) : items.length === 0 ? (
        <p className={cn('py-20 text-center text-sm tracking-wide', sanctuaryMuted)}>
          No meditations published yet.
        </p>
      ) : (
        <>
          {featured && category === 'all' && (
            <FeaturedProtocolHero
              featured={featured}
              hasAccess={accessMap[featured.id]}
            />
          )}

          {filtered.length === 0 ? (
            <p className={cn('py-12 text-center text-sm', sanctuaryMuted)}>
              No protocols in this category.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((row, i) => (
                <SanctuaryCatalogCard
                  key={row.id}
                  row={row}
                  index={i}
                  hasAccess={accessMap[row.id]}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
