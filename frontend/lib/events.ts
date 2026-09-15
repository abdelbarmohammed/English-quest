/**
 * Lightweight first-party usage-event logger.
 * All calls are fire-and-forget — they never block or throw into the caller.
 */
import { api } from './api'
import { getSession } from './session'

export type EventType =
  | 'session_start'
  | 'session_end'
  | 'lesson_complete'
  | 'boss_win'
  | 'boss_loss'

function deviceInfo(): string {
  if (typeof navigator === 'undefined') return ''
  return /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
}

export async function logEvent(
  eventType: EventType,
  opts: { durationSeconds?: number } = {},
): Promise<void> {
  if (!getSession()) return
  try {
    await api.post('/events/', {
      event_type:       eventType,
      device_info:      deviceInfo(),
      duration_seconds: opts.durationSeconds ?? null,
    })
  } catch {
    // Non-blocking — analytics failures must never degrade the learning UX
  }
}
