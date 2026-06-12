import { motion } from 'framer-motion'
import { Clock, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  INSIGHT_FREQUENCY_FILTERS,
  INSIGHT_POSTS,
  type FrequencyTag,
  type InsightPost,
} from '../lib/insightsPosts'
import { cn } from '../lib/utils'

function PostCard({ post, index }: { post: InsightPost; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-24px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.06 }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-neutral-950/80 shadow-[0_0_48px_-24px_rgba(45,212,191,0.3)] backdrop-blur-xl transition hover:shadow-[0_0_64px_-20px_rgba(45,212,191,0.45)]"
    >
      <div className="border-b border-white/[0.06] bg-gradient-to-r from-teal-500/10 to-transparent px-6 py-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400">
          {post.frequencyTag}
        </span>
        <p className="mt-1 text-[10px] uppercase tracking-wider text-neutral-500">{post.category}</p>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h2 className="text-lg font-semibold leading-snug tracking-tight text-white group-hover:text-teal-300">
          <Link to={`/insights/${post.slug}`}>{post.title}</Link>
        </h2>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-400">{post.excerpt}</p>
        <div className="mt-6 flex items-center justify-between text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime}
          </span>
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
        </div>
      </div>
    </motion.article>
  )
}

export function InsightsPage() {
  const [filter, setFilter] = useState<FrequencyTag>('all')

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? INSIGHT_POSTS
        : INSIGHT_POSTS.filter((p) => p.frequencyTag === filter),
    [filter],
  )

  return (
    <div className="pb-20">
      <header className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-neutral-950 px-6 py-14 shadow-[0_0_80px_-30px_rgba(45,212,191,0.35)] md:px-12 md:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(45,212,191,0.12),transparent_55%)]" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-teal-400">
            <Sparkles className="h-3.5 w-3.5" />
            CALMA Insights
          </p>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Frequency intelligence for the modern nervous system
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-400 md:text-base">
            Editorial perspectives on Solfeggio science, spatial acoustics, and somatic integration —
            curated for members and seekers.
          </p>
        </div>
      </header>

      <div className="mt-10 flex flex-wrap gap-2">
        {INSIGHT_FREQUENCY_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              'rounded-full border px-4 py-2 text-xs font-medium transition',
              filter === f.id
                ? 'border-teal-400/50 bg-teal-400/15 text-teal-300'
                : 'border-white/10 text-neutral-400 hover:border-white/20 hover:text-white',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post, i) => (
          <PostCard key={post.id} post={post} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-sm text-neutral-500">
          New insights for this frequency band are publishing soon.
        </p>
      )}
    </div>
  )
}
