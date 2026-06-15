import { MEDITATIONS_BUCKET } from './audioSanctuary'
import type { ClassDetails } from './classTypes'
import { supabase } from './supabase'

const CLASS_MEDIA_BUCKET = 'class-media'

function storagePathFromPublicUrl(url: string | null | undefined, bucket: string): string | null {
  if (!url) return null
  const marker = `/storage/v1/object/public/${bucket}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return decodeURIComponent(url.slice(idx + marker.length).split('?')[0] ?? '')
}

async function removeStoragePaths(bucket: string, paths: string[]) {
  const unique = [...new Set(paths.filter(Boolean))]
  if (unique.length === 0) return
  const { error } = await supabase.storage.from(bucket).remove(unique)
  if (error) {
    console.warn(`storage remove ${bucket}`, error.message)
  }
}

async function removeFolderPrefix(bucket: string, prefix: string) {
  const clean = prefix.replace(/^\/+/, '').replace(/\/+$/, '')
  if (!clean) return

  const queue = [clean]
  const allPaths: string[] = []

  while (queue.length > 0) {
    const folder = queue.pop()!
    const { data, error } = await supabase.storage.from(bucket).list(folder, { limit: 200 })
    if (error) {
      console.warn(`storage list ${bucket}/${folder}`, error.message)
      continue
    }
    for (const item of data ?? []) {
      const path = `${folder}/${item.name}`
      if (!item.id) {
        queue.push(path)
      } else {
        allPaths.push(path)
      }
    }
  }

  await removeStoragePaths(bucket, allPaths)
}

export async function deleteClassPermanently(row: ClassDetails): Promise<{ error?: string }> {
  const mediaPaths: string[] = []
  const imagePath = storagePathFromPublicUrl(row.image_url, CLASS_MEDIA_BUCKET)
  const coverPath = storagePathFromPublicUrl(row.audio_cover_art_url, CLASS_MEDIA_BUCKET)
  if (imagePath) mediaPaths.push(imagePath)
  if (coverPath) mediaPaths.push(coverPath)

  await removeStoragePaths(CLASS_MEDIA_BUCKET, mediaPaths)
  await removeFolderPrefix(CLASS_MEDIA_BUCKET, `classes/${row.id}`)

  const meditationPaths: string[] = []
  if (row.audio_hls_stereo_key) meditationPaths.push(row.audio_hls_stereo_key)

  await removeStoragePaths(MEDITATIONS_BUCKET, meditationPaths)

  const slug = row.slug ?? row.id
  await removeFolderPrefix(MEDITATIONS_BUCKET, slug)

  const { error } = await supabase.from('classes').delete().eq('id', row.id)
  if (error) return { error: error.message }
  return {}
}
