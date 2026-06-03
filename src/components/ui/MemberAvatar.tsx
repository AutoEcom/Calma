import { useState } from 'react'
import { DEFAULT_AVATAR_URL, resolveAvatarUrl } from '../../lib/avatar'
import { cn } from '../../lib/utils'

const sizeClasses = {
  sm: 'h-9 w-9',
  md: 'h-10 w-10',
  lg: 'h-24 w-24',
  xl: 'h-28 w-28',
} as const

type Props = {
  src?: string | null
  size?: keyof typeof sizeClasses
  className?: string
  ringClassName?: string
}

export function MemberAvatar({
  src,
  size = 'md',
  className,
  ringClassName = 'ring-2 ring-[var(--accent)]/20',
}: Props) {
  const [useDefault, setUseDefault] = useState(false)
  const resolved = resolveAvatarUrl(src)
  const displaySrc = useDefault ? DEFAULT_AVATAR_URL : resolved

  return (
    <img
      src={displaySrc}
      alt=""
      onError={() => setUseDefault(true)}
      className={cn(
        'rounded-full object-cover',
        sizeClasses[size],
        ringClassName,
        className,
      )}
    />
  )
}
