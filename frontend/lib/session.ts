export interface Session {
  device_token: string
  student_id: number
  nickname: string
  class_name: string
  subject_id: number
}

const KEY = 'eq_session'

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function saveSession(s: Session): void {
  localStorage.setItem(KEY, JSON.stringify(s))
}

export function clearSession(): void {
  localStorage.removeItem(KEY)
}
