/** Default profile silhouette served from /public. */
export const DEFAULT_AVATAR_URL = '/default-avatar.png'

export function resolveAvatarUrl(customUrl: string | null | undefined): string {
  const trimmed = customUrl?.trim()
  return trimmed ? trimmed : DEFAULT_AVATAR_URL
}
