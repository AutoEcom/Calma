import { cn } from '../../lib/utils'

const iconClass =
  'text-neutral-500 transition-all duration-300 hover:scale-110 hover:text-teal-400'

const SOCIAL = [
  {
    label: 'X (Twitter)',
    href: 'https://x.com/calmaliving',
    icon: <XIcon />,
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@calmainyou',
    icon: <YoutubeIcon />,
  },
  {
    label: 'Spotify',
    href: 'https://open.spotify.com/user/31ex3ljh3o6hfbm3zzbc7ciebbwi',
    icon: <SpotifyIcon />,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/calmainyou/',
    icon: <InstagramIcon />,
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@calmainyou',
    icon: <TikTokIcon />,
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/calmaflow',
    icon: <FacebookIcon />,
  },
] as const

export function FooterSocialLinks() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {SOCIAL.map(({ label, href, icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            'border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm',
            iconClass,
          )}
        >
          {icon}
        </a>
      ))}
    </div>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .6 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
    </svg>
  )
}

function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.49 17.28c-.213.348-.665.456-1.013.243-2.784-1.7-6.284-2.086-10.404-1.147-.398.091-.796-.155-.887-.553-.091-.398.155-.796.553-.887 4.47-1.018 8.32-.587 11.38 1.27.348.213.456.665.243 1.013zm1.44-3.2c-.27.437-.84.574-1.277.304-3.186-1.956-8.03-2.523-11.79-1.38-.524.159-1.077-.138-1.236-.662-.159-.524.138-1.077.662-1.236 4.35-1.32 9.77-.68 13.44 1.55.437.27.574.84.304 1.277zm.12-3.36C15.4 8.114 8.7 7.88 5.16 9.12c-.633.192-1.307-.166-1.499-.8-.192-.633.166-1.307.8-1.499 4.148-1.26 11.45-1.02 15.72 1.7.58.355.762 1.113.407 1.693z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.41H7.08v-3.52h3.05V9.41c0-3 1.79-4.66 4.52-4.66 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87v2.25h3.32l-.53 3.52h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  )
}
