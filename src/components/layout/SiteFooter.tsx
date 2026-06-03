import { Link } from 'react-router-dom'
import { CalmaLogo } from './CalmaLogo'

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/[0.06] bg-black py-16">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[1.4fr_2fr]">
        <div className="space-y-5">
          <CalmaLogo asLink />
          <p className="max-w-sm text-sm leading-relaxed tracking-wide text-white/45">
            <span className="font-semibold tracking-[0.12em] text-white/70">CALMA</span>
            {' | '}
            Somatic movement, neural regulation, and studio-grade audio architecture.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]/75">
              Studio
            </p>
            <ul className="mt-5 space-y-3 text-sm tracking-wide text-white/50">
              <li>
                <Link to="/sessions" className="transition hover:text-[var(--accent)]">
                  Sessions
                </Link>
              </li>
              <li>
                <Link to="/sanctuary" className="transition hover:text-[var(--accent)]">
                  Sanctuary
                </Link>
              </li>
              <li>
                <Link to="/#community" className="transition hover:text-[var(--accent)]">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]/75">
              Company
            </p>
            <ul className="mt-5 space-y-3 text-sm tracking-wide text-white/50">
              <li>
                <Link to="/about" className="transition hover:text-[var(--accent)]">
                  About Our Method
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-[var(--accent)]">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]/75">
              Legal
            </p>
            <ul className="mt-5 space-y-3 text-sm tracking-wide text-white/50">
              <li>
                <Link to="/terms" className="transition hover:text-[var(--accent)]">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="transition hover:text-[var(--accent)]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <span className="text-white/25">Cookie Preferences</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-14 max-w-6xl border-t border-white/[0.06] px-4 pt-8 text-center text-[11px] tracking-[0.14em] text-white/30">
        © 2026 CALMA. All rights reserved. Engineered for Premium Wellness.
      </p>
    </footer>
  )
}
