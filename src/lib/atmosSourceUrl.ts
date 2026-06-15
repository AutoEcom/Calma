/** Google Drive sharing URL → raw streaming download endpoint (large-file bypass). */
const GDRIVE_FILE_PATH = /drive\.google\.com\/file\/d\/([^/?#]+)/i
const GDRIVE_OPEN_ID = /drive\.google\.com\/open\?[^#]*\bid=([^&#]+)/i
const GDRIVE_UC_ID = /(?:docs|drive)\.google\.com\/uc\?(?:[^#]*&)?id=([^&#]+)/i

export function extractGoogleDriveFileId(url: string): string | null {
  const trimmed = url.trim()
  for (const pattern of [GDRIVE_FILE_PATH, GDRIVE_OPEN_ID, GDRIVE_UC_ID]) {
    const match = trimmed.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

/** Large-file bypass: confirm=t skips Google Drive virus-scan interstitial HTML. */
export function buildGoogleDriveStreamUrl(fileId: string): string {
  return `https://drive.google.com/uc?id=${fileId}&export=download&confirm=t`
}

/** Resolve admin-configured Atmos URL to a browser-playable direct stream. */
export function resolveAtmosStreamUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return trimmed

  const fileId = extractGoogleDriveFileId(trimmed)
  if (fileId) {
    return buildGoogleDriveStreamUrl(fileId)
  }

  return trimmed
}

export function isLikelyAtmosSourceUrl(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return false
  if (extractGoogleDriveFileId(trimmed)) return true
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}
