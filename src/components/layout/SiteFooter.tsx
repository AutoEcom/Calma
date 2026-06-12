import { Link } from 'react-router-dom'
import { CalmaLogo } from './CalmaLogo'
import { FooterPaymentBadges } from './FooterPaymentBadges'
import { FooterSocialLinks } from './FooterSocialLinks'
import { cn } from '../../lib/utils'

const footerLink =
  'text-sm text-neutral-400 transition hover:text-white'

const footerHeading = 'text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-400'

/** Always dark — independent of site light/dark/system theme. */
export function SiteFooter() {
  return (
    <footer
      className={cn(
        'mt-auto border-t border-white/[0.08] bg-neutral-950 py-16 text-neutral-400',
        '[color-scheme:dark]',
      )}
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[1.45fr_2fr]">
        <div className="space-y-6">
          <CalmaLogo asLink className="!from-teal-400 !to-teal-300" />
          <p className="max-w-md text-sm leading-relaxed tracking-wide text-neutral-400">
            <span className="font-semibold tracking-[0.12em] text-white">CALMA</span>
            {' | '}
            Multi-frequency spatial audio and acoustic protocols engineered for deep neural
            regulation and cognitive optimization.
          </p>
          <FooterSocialLinks />
        </div>

        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className={footerHeading}>Studio</p>
            <ul className="mt-5 space-y-3 tracking-wide">
              <li>
                <Link to="/sessions" className={footerLink}>
                  Sessions
                </Link>
              </li>
              <li>
                <Link to="/sanctuary" className={footerLink}>
                  Sanctuary
                </Link>
              </li>
              <li>
                <Link to="/insights" className={footerLink}>
                  Insights
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className={footerHeading}>Company</p>
            <ul className="mt-5 space-y-3 tracking-wide">
              <li>
                <Link to="/about-methods" className={footerLink}>
                  About Our Methods
                </Link>
              </li>
              <li>
                <Link to="/support" className={footerLink}>
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className={footerHeading}>Legal</p>
            <ul className="mt-5 space-y-3 tracking-wide">
              <li>
                <Link to="/terms" className={footerLink}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className={footerLink}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-6xl flex-col items-center gap-6 border-t border-white/[0.08] px-4 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center text-[11px] tracking-[0.14em] text-neutral-500 sm:text-left">
          © 2026 CALMA. All rights reserved. Engineered for Premium Wellness.
        </p>
        <FooterPaymentBadges />
      </div>
    </footer>
  )
}
