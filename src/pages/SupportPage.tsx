import { ChevronDown, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { GlassPageShell } from '../components/static/GlassPageShell'
import { cn } from '../lib/utils'

const INQUIRY_TYPES = [
  'Account & billing',
  'Corporate licensing',
  'Spatial audio / equipment',
  'Live sessions (Mux)',
  'Technical issue',
  'Other',
] as const

type InquiryType = (typeof INQUIRY_TYPES)[number]

const FAQ_ITEMS = [
  {
    q: 'How do I update billing or payment methods?',
    a: 'Open your Dashboard and use the Stripe customer portal link to manage cards, invoices, and subscriptions. Changes apply immediately to future charges.',
  },
  {
    q: 'What headphones or speakers work best for spatial protocols?',
    a: 'For Dolby Atmos and binaural entrainment, use spatial-audio-capable earbuds (Apple, Sony, Bose) or a quality over-ear headset. For live Mux sessions, stable broadband and wired headphones reduce latency.',
  },
  {
    q: 'Can I access purchased protocols on multiple devices?',
    a: 'Yes. Sign in with the same account on any supported browser. Secure HLS playback uses short-lived signed URLs tied to your member profile.',
  },
  {
    q: 'How do live somatic sessions differ from Audio Sanctuary?',
    a: 'Sanctuary protocols are on-demand spatial audio matrices. Live transmissions are real-time Mux broadcasts with instructor-led movement — book via Sessions.',
  },
] as const

const inputClass =
  'mt-1.5 w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/30'

export function SupportPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [inquiryType, setInquiryType] = useState<InquiryType>(INQUIRY_TYPES[0])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || !message.trim()) return

    setSubmitting(true)
    const subject = encodeURIComponent(`Calma Concierge: ${inquiryType}`)
    const body = encodeURIComponent(
      `Name: ${fullName.trim()}\nEmail: ${email.trim()}\nInquiry: ${inquiryType}\n\n${message.trim()}`,
    )
    window.location.href = `mailto:hello@calma.bg?subject=${subject}&body=${body}`
    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <GlassPageShell
      eyebrow="Concierge"
      title="Member Concierge Support"
      subtitle="Our team reviews and assists with accounts, corporate licensing, and technical acoustic inquiries within 12 hours."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block text-sm">
          <span className="text-neutral-400">Full name</span>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            autoComplete="name"
          />
        </label>

        <label className="block text-sm">
          <span className="text-neutral-400">Account email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            autoComplete="email"
          />
        </label>

        <label className="block text-sm">
          <span className="text-neutral-400">Inquiry type</span>
          <select
            value={inquiryType}
            onChange={(e) => setInquiryType(e.target.value as InquiryType)}
            className={cn(inputClass, 'cursor-pointer')}
          >
            {INQUIRY_TYPES.map((t) => (
              <option key={t} value={t} className="bg-neutral-900">
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="text-neutral-400">Message</span>
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={cn(inputClass, 'resize-y')}
            placeholder="Describe your inquiry — billing, licensing, spatial audio setup, or live session access."
          />
        </label>

        {submitted && (
          <p className="rounded-xl border border-teal-400/30 bg-teal-400/10 px-4 py-3 text-sm text-teal-300">
            Your mail client should open with a pre-filled message. If it did not, email{' '}
            <a href="mailto:hello@calma.bg" className="font-medium underline">
              hello@calma.bg
            </a>{' '}
            directly.
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-400 py-3.5 text-sm font-semibold text-neutral-950 transition hover:brightness-110 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening mail…
            </>
          ) : (
            'Submit Inquiry'
          )}
        </button>
      </form>

      <div className="mt-12 border-t border-white/[0.06] pt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Self-service FAQ
        </h2>
        <ul className="mt-5 space-y-2">
          {FAQ_ITEMS.map((item, i) => {
            const open = openFaq === i
            return (
              <li
                key={item.q}
                className="overflow-hidden rounded-xl border border-white/[0.06] bg-black/30"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium text-white transition hover:bg-white/[0.03]"
                >
                  {item.q}
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-neutral-500 transition-transform',
                      open && 'rotate-180',
                    )}
                  />
                </button>
                {open && (
                  <p className="border-t border-white/[0.06] px-4 py-3 text-sm leading-relaxed text-neutral-400">
                    {item.a}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </GlassPageShell>
  )
}
