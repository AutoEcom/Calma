import { ArrowLeft, Clock } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { INSIGHT_POSTS } from '../lib/insightsPosts'

function renderMarkdownLite(md: string) {
  return md.split('\n\n').map((block, i) => {
    if (block.startsWith('## ')) {
      return (
        <h2 key={i} className="mt-8 text-lg font-semibold text-white">
          {block.replace('## ', '')}
        </h2>
      )
    }
    if (block.startsWith('### ')) {
      return (
        <h3 key={i} className="mt-6 text-sm font-semibold uppercase tracking-wider text-teal-400/90">
          {block.replace('### ', '')}
        </h3>
      )
    }
    if (block.startsWith('- ')) {
      const items = block.split('\n').filter((l) => l.startsWith('- '))
      return (
        <ul key={i} className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-300">
          {items.map((item) => (
            <li key={item}>{item.replace('- ', '')}</li>
          ))}
        </ul>
      )
    }
    return (
      <p key={i} className="mt-4 text-sm leading-relaxed text-neutral-300">
        {block}
      </p>
    )
  })
}

export function InsightDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = INSIGHT_POSTS.find((p) => p.slug === slug)

  if (!post) {
    return (
      <div className="py-16 text-center">
        <p className="text-neutral-400">Article not found.</p>
        <Link to="/insights" className="mt-4 inline-block text-teal-400 hover:underline">
          Back to Insights
        </Link>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-3xl pb-20">
      <Link
        to="/insights"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Insights
      </Link>

      <header className="mt-8 rounded-3xl border border-white/[0.08] bg-neutral-950/90 p-8 shadow-[0_0_60px_-24px_rgba(45,212,191,0.35)] md:p-12">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-teal-400">
          {post.frequencyTag} · {post.category}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
          <Clock className="h-3.5 w-3.5" />
          {post.readTime}
        </p>
      </header>

      <div className="mt-10 px-2">{renderMarkdownLite(post.content)}</div>
    </article>
  )
}
