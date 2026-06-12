export type FrequencyTag = '174Hz' | '285Hz' | '396Hz' | '417Hz' | '528Hz' | '639Hz' | '741Hz' | '852Hz' | '963Hz' | 'all'

export type InsightPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  frequencyTag: FrequencyTag
  readTime: string
  category: string
  publishedAt: string
}

export const INSIGHT_FREQUENCY_FILTERS: { id: FrequencyTag; label: string }[] = [
  { id: 'all', label: 'All frequencies' },
  { id: '174Hz', label: '174Hz · Foundation' },
  { id: '528Hz', label: '528Hz · Repair' },
  { id: '963Hz', label: '963Hz · Unity' },
]

export const INSIGHT_POSTS: InsightPost[] = [
  {
    id: '1',
    title: 'Why 174Hz Anchors Parasympathetic Recovery',
    slug: '174hz-foundation-recovery',
    excerpt:
      'The foundation band signals safety to the nervous system before deeper entrainment begins — a clinical primer on grounding frequencies.',
    content:
      '## Foundation before transformation\n\n174Hz is often described as the frequency of pain relief and energetic grounding. In Calma protocols, it opens the session arc — lowering sympathetic tone so subsequent Solfeggio layers can integrate without resistance.\n\n### What members report\n\n- Faster downshift from work-mode alertness\n- Deeper breath within the first three minutes\n- Improved sleep onset when used in evening rituals',
    frequencyTag: '174Hz',
    readTime: '6 min',
    category: 'Vibration Science',
    publishedAt: '2026-05-12',
  },
  {
    id: '2',
    title: '528Hz and the DNA Repair Narrative: What the Science Actually Says',
    slug: '528hz-cellular-harmony',
    excerpt:
      'Separating myth from measurable outcomes — how repair-band entrainment supports HRV and subjective calm in multi-frequency stacks.',
    content:
      '## Repair-band entrainment\n\n528Hz sits at the center of many Solfeggio maps as a “transformation” tone. Calma positions it inside curated matrices — never as a single-tone shortcut.\n\n### Integration practice\n\nPair 528Hz-forward protocols with spatial Dolby Atmos rendering for full auditory-cortex engagement. Members using daily 21-day arcs report more stable morning HRV baselines.',
    frequencyTag: '528Hz',
    readTime: '8 min',
    category: 'Acoustic Medicine',
    publishedAt: '2026-05-20',
  },
  {
    id: '3',
    title: '963Hz Unity States and Cosmic Consciousness Protocols',
    slug: '963hz-unity-consciousness',
    excerpt:
      'Exploring the crown-band frequency in evening rituals — when to use unity tones and how to avoid overstimulation.',
    content:
      '## Crown-band consciousness\n\n963Hz is associated with pineal activation and unity consciousness in Solfeggio tradition. Calma deploys it at the apex of select evening matrices.\n\n### Best practices\n\n- Use after somatic live sessions for integration\n- Lower volume; allow silence afterward\n- Combine with Atmosphere Studio credits tuned for theta entrainment',
    frequencyTag: '963Hz',
    readTime: '7 min',
    category: 'Neural Regulation',
    publishedAt: '2026-05-28',
  },
  {
    id: '4',
    title: 'Spatial Audio and the Vagus: A Member Field Guide',
    slug: 'spatial-audio-vagus-guide',
    excerpt:
      'How 360° soundscapes bypass analytical defense and signal biological safety within minutes.',
    content:
      '## Beyond flat audio\n\nSpatial rendering wraps the auditory field — engaging proprioceptive maps linked to vagal tone.\n\n### Equipment\n\nSpatial-capable earbuds or premium over-ear headphones maximize the effect. For live somatic transmissions, stable connectivity and full-screen presence amplify instructor cueing.',
    frequencyTag: '528Hz',
    readTime: '5 min',
    category: 'Spatial Audio',
    publishedAt: '2026-06-01',
  },
]
