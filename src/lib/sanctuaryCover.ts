import type { Tables } from './database.types'

type CoverSource = Pick<Tables<'classes'>, 'audio_cover_art_url' | 'image_url'>

const MESH_GRADIENTS = [
  'from-[#0d1f1c] via-[#0a1628] to-[#12081a]',
  'from-[#1a0f24] via-[#0f1a22] to-[#051410]',
  'from-[#0c1814] via-[#1a1420] to-[#080c14]',
  'from-[#141028] via-[#0c1c1a] to-[#0a0a0a]',
  'from-[#101820] via-[#18101c] to-[#0a1210]',
  'from-[#0a1418] via-[#1c1020] to-[#080808]',
] as const

export function sanctuaryCoverUrl(row: CoverSource): string | null {
  return row.audio_cover_art_url ?? row.image_url ?? null
}

export function sanctuaryMeshGradient(index: number): string {
  return MESH_GRADIENTS[index % MESH_GRADIENTS.length]
}
