export type SacredCircle = {
  cx: number
  cy: number
  r: number
  ring: number
}

/** Hex axial distance for Flower of Life grid placement. */
function hexDistance(q: number, s: number): number {
  const r = -q - s
  return (Math.abs(q) + Math.abs(s) + Math.abs(r)) / 2
}

function hexToPixel(q: number, s: number, radius: number): { x: number; y: number } {
  const x = radius * (q + s / 2)
  const y = radius * ((Math.sqrt(3) / 2) * s)
  return { x, y }
}

/** Authentic Flower of Life — intersecting equal circles on a hex lattice. */
export function buildFlowerOfLife(
  circleRadius: number,
  originX = 0,
  originY = 0,
  maxRing = 3,
): SacredCircle[] {
  const circles: SacredCircle[] = []

  for (let q = -maxRing; q <= maxRing; q++) {
    for (let s = -maxRing; s <= maxRing; s++) {
      const ring = hexDistance(q, s)
      if (ring > maxRing) continue
      const { x, y } = hexToPixel(q, s, circleRadius)
      circles.push({
        cx: originX + x,
        cy: originY + y,
        r: circleRadius,
        ring,
      })
    }
  }

  return circles
}

/** Perfect circular outer boundary enclosing the full lattice. */
export function flowerOuterRadius(circleRadius: number, maxRing = 3): number {
  return (maxRing + 1) * circleRadius
}

export function flowerOfLifeBounds(circles: SacredCircle[], padding = 4) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const circle of circles) {
    minX = Math.min(minX, circle.cx - circle.r)
    minY = Math.min(minY, circle.cy - circle.r)
    maxX = Math.max(maxX, circle.cx + circle.r)
    maxY = Math.max(maxY, circle.cy + circle.r)
  }

  return {
    minX: minX - padding,
    minY: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  }
}

export type QuantumParticle = {
  id: number
  angle: number
  radiusRatio: number
  size: number
  delay: number
  duration: number
}

/** Micro accent nodes orbiting the Flower of Life boundary. */
export function buildQuantumParticles(count = 14): QuantumParticle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    angle: (360 / count) * id + (id % 3) * 7,
    radiusRatio: 0.92 + (id % 5) * 0.09,
    size: 1.4 + (id % 4) * 0.45,
    delay: (id % 7) * 0.35,
    duration: 3.2 + (id % 5) * 0.6,
  }))
}
