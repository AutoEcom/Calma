import { motion } from 'framer-motion'
import { Info, Package } from 'lucide-react'
import { useState } from 'react'
import { formatEurFromCents } from '../../lib/formatPrice'
import type { SanctuaryBundleCatalogItem } from '../../lib/sanctuaryBundles'
import { cn } from '../../lib/utils'
import { SanctuaryBundleModal } from './SanctuaryBundleModal'

type Props = {
  bundle: SanctuaryBundleCatalogItem
  index: number
}

const shell =
  'flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border-2 border-[#2DD4BF]/25 bg-gradient-to-br from-white/80 via-white/60 to-[#2DD4BF]/5 shadow-sm backdrop-blur-md dark:border-[#2DD4BF]/30 dark:from-neutral-900/60 dark:via-black/40 dark:to-[#2DD4BF]/10'

export function SanctuaryBundleCard({ bundle, index }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-24px' }}
        transition={{ duration: 0.4, delay: (index % 6) * 0.04 }}
        className={shell}
      >
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-slate-900">
          {bundle.image_url ? (
            <img
              src={bundle.image_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#134e4a] to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-[#2DD4BF]/40 bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#2DD4BF] backdrop-blur-md">
            <Package className="h-3 w-3" />
            Bundle · {bundle.protocolCount} Protocol{bundle.protocolCount === 1 ? '' : 's'}
          </span>
          {bundle.badge && (
            <span className="absolute right-3 top-3 rounded-full bg-amber-400/95 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-950">
              {bundle.badge}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug text-slate-900 dark:text-neutral-100">
            {bundle.title}
          </h3>
          {bundle.description && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-700 dark:text-neutral-400">
              {bundle.description}
            </p>
          )}
          <p className="mt-3 text-sm font-semibold text-[var(--accent)]">
            {formatEurFromCents(bundle.price_in_cents)}
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn(
              'mt-auto inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition',
              'bg-[var(--accent)]/15 text-[var(--accent)] ring-1 ring-[var(--accent)]/30 hover:bg-[var(--accent)]/25',
            )}
          >
            <Info className="h-3.5 w-3.5 shrink-0" />
            Learn more
          </button>
        </div>
      </motion.article>

      <SanctuaryBundleModal bundle={open ? bundle : null} onClose={() => setOpen(false)} />
    </>
  )
}
