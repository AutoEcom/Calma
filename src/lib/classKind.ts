import type { ClassDetails } from './classTypes'

export function isGuidedMeditation(cls: {
  session_type?: string | null
  is_audio_sanctuary?: boolean | null
}): boolean {
  return (
    cls.is_audio_sanctuary === true ||
    cls.session_type === 'guided_meditation'
  )
}

export function isLiveSession(
  cls: Pick<ClassDetails, 'session_type' | 'is_audio_sanctuary'>,
): boolean {
  return !isGuidedMeditation(cls)
}

export function classDetailPath(
  cls: Pick<ClassDetails, 'id'> & { slug?: string | null },
): string {
  return `/class/${cls.slug ?? cls.id}`
}

export function sanctuaryDetailPath(
  cls: Pick<ClassDetails, 'id'> & { slug?: string | null },
): string {
  return `/sanctuary/${cls.slug ?? cls.id}`
}
