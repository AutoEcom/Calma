import { cn } from '../../lib/utils'

/** Monochrome Stripe payment marks for sub-footer trust row. */
export function FooterPaymentBadges() {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-3 sm:justify-end',
        'opacity-75 brightness-110 transition-opacity duration-300 hover:opacity-100',
      )}
      aria-label="Accepted payment methods"
    >
      <VisaMark />
      <MastercardMark />
      <ApplePayMark />
      <GooglePayMark />
    </div>
  )
}

function VisaMark() {
  return (
    <svg viewBox="0 0 48 16" className="h-4 w-auto text-neutral-400" aria-label="Visa">
      <text
        x="0"
        y="13"
        fill="currentColor"
        fontSize="14"
        fontWeight="700"
        fontStyle="italic"
        fontFamily="system-ui, sans-serif"
      >
        VISA
      </text>
    </svg>
  )
}

function MastercardMark() {
  return (
    <svg viewBox="0 0 36 22" className="h-5 w-auto" aria-label="Mastercard">
      <circle cx="13" cy="11" r="9" fill="currentColor" className="text-neutral-500" />
      <circle cx="23" cy="11" r="9" fill="currentColor" className="text-neutral-300" opacity="0.85" />
    </svg>
  )
}

function ApplePayMark() {
  return (
    <svg viewBox="0 0 44 18" className="h-4 w-auto text-neutral-400" aria-label="Apple Pay">
      <path
        fill="currentColor"
        d="M8.2 3.8c-.6.7-1.5 1.3-2.4 1.2-.1-1 .4-2 .9-2.7.6-.8 1.6-1.4 2.4-1.4.1 1.1-.3 2.1-.9 2.9zm.9 1.5c-1.3-.1-2.4.8-3 .8-.6 0-1.5-.7-2.5-.7-1.3 0-2.4.8-3.1 2-.9 1.5-.7 3.7.9 5.8.6.9 1.3 1.9 2.2 1.9.9 0 1.2-.6 2.4-.6 1.1 0 1.4.6 2.4.6.9 0 1.5-.8 2.1-1.7 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-4.2z"
      />
      <text x="14" y="13" fill="currentColor" fontSize="9" fontWeight="600" fontFamily="system-ui">
        Pay
      </text>
    </svg>
  )
}

function GooglePayMark() {
  return (
    <svg viewBox="0 0 52 18" className="h-4 w-auto text-neutral-400" aria-label="Google Pay">
      <text x="0" y="8" fill="currentColor" fontSize="7" fontWeight="600" fontFamily="system-ui">
        Google
      </text>
      <text x="0" y="16" fill="currentColor" fontSize="8" fontWeight="700" fontFamily="system-ui">
        Pay
      </text>
    </svg>
  )
}
