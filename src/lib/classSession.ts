export function getSessionEndTime(scheduledAt: string, durationMinutes: number): number {
  return new Date(scheduledAt).getTime() + durationMinutes * 60_000
}

/** Scheduled start has passed and session window has not ended. */
export function isSessionLive(
  scheduledAt: string,
  durationMinutes: number,
  now = Date.now(),
): boolean {
  const start = new Date(scheduledAt).getTime()
  const end = getSessionEndTime(scheduledAt, durationMinutes)
  return now >= start && now < end
}

export function isSessionPast(
  scheduledAt: string,
  durationMinutes: number,
  now = Date.now(),
): boolean {
  return now >= getSessionEndTime(scheduledAt, durationMinutes)
}

export function isSessionUpcoming(scheduledAt: string, now = Date.now()): boolean {
  return now < new Date(scheduledAt).getTime()
}
