'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import { getSession, clearSession } from '@/lib/session'
import type { LeaderboardEntry } from '@/lib/types'

const RANK_COLORS = ['#ffd335', '#cbc4ce', '#c87941'] // gold, silver, bronze

export default function LeaderboardPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = getSession()
    if (!session) { router.replace('/join'); return }

    api.get<LeaderboardEntry[]>('/leaderboard/')
      .then(data => { setEntries(data); setLoading(false) })
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) {
          clearSession(); router.replace('/join')
        } else {
          setError(err instanceof ApiError ? err.message : 'Failed to load leaderboard.')
          setLoading(false)
        }
      })
  }, [router])

  /* ── Loading ─────────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: '#14140f' }}>
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: 'rgba(255,211,53,0.2)', borderTopColor: '#ffd335' }}
        />
      </div>
    )
  }

  /* ── Error ───────────────────────────────────────────────────────────────── */
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 px-6" style={{ background: '#14140f' }}>
        <p className="font-manrope text-center" style={{ color: '#ffb4ab' }}>{error}</p>
        <button
          onClick={() => router.back()}
          className="font-manrope text-sm"
          style={{ color: '#ffd335' }}
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div
      className="max-w-sm mx-auto h-full flex flex-col"
      style={{ background: '#14140f' }}
    >
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header
        className="shrink-0 flex items-center gap-3 px-5 h-16 border-b"
        style={{
          background:     'rgba(20,20,15,0.95)',
          backdropFilter: 'blur(6px)',
          borderColor:    'rgba(255,211,53,0.15)',
          boxShadow:      'inset 0 0 20px rgba(255,211,53,0.05)',
        }}
      >
        <button
          onClick={() => router.back()}
          className="w-11 h-11 flex items-center justify-center"
          style={{ color: '#e6e2d9' }}
          aria-label="Go back"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span
          className="font-mono-hud text-xs"
          style={{ color: '#ffd335', letterSpacing: '0.05em' }}
        >
          HALL OF LEGENDS
        </span>
      </header>

      {/* ── Top 3 podium ─────────────────────────────────────────────────────── */}
      {entries.length >= 3 && (
        <div
          className="shrink-0 flex items-end justify-center gap-3 px-5 py-6 border-b"
          style={{ borderColor: 'rgba(255,211,53,0.1)' }}
        >
          {/* 2nd */}
          <PodiumSlot entry={entries[1]} rankColor={RANK_COLORS[1]} height="h-20" />
          {/* 1st */}
          <PodiumSlot entry={entries[0]} rankColor={RANK_COLORS[0]} height="h-28" crown />
          {/* 3rd */}
          <PodiumSlot entry={entries[2]} rankColor={RANK_COLORS[2]} height="h-14" />
        </div>
      )}

      {/* ── Full list ────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {entries.map(entry => (
          <div
            key={entry.rank}
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{
              background:   entry.is_me ? 'rgba(255,211,53,0.1)' : 'rgba(255,255,255,0.03)',
              border:       entry.is_me ? '1px solid rgba(255,211,53,0.35)' : '1px solid rgba(255,255,255,0.06)',
              boxShadow:    entry.is_me ? 'inset 0 0 12px rgba(255,211,53,0.06)' : undefined,
            }}
          >
            {/* Rank badge */}
            <span
              className="font-mono-hud text-sm w-7 text-center shrink-0"
              style={{ color: entry.rank <= 3 ? RANK_COLORS[entry.rank - 1] : '#cbc4ce' }}
            >
              {entry.rank <= 3
                ? ['①', '②', '③'][entry.rank - 1]
                : `#${entry.rank}`}
            </span>

            {/* Avatar circle */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{
                background:  entry.is_me ? 'rgba(255,211,53,0.15)' : '#20201a',
                border:      `1px solid ${entry.is_me ? 'rgba(255,211,53,0.4)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>

            {/* Nickname */}
            <span
              className="font-manrope font-bold flex-1 truncate"
              style={{ color: entry.is_me ? '#ffd335' : '#e6e2d9' }}
            >
              {entry.nickname}
              {entry.is_me && (
                <span className="font-manrope font-normal text-xs ml-2" style={{ color: 'rgba(255,211,53,0.6)' }}>
                  you
                </span>
              )}
            </span>

            {/* XP + boss defeats */}
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <div className="flex items-center gap-1">
                <span
                  className="material-symbols-outlined"
                  style={{ color: '#ffd335', fontSize: '0.85rem', fontVariationSettings: "'FILL' 1" }}
                >
                  bolt
                </span>
                <span className="font-mono-hud text-xs" style={{ color: '#ffd335' }}>
                  {entry.total_xp.toLocaleString()}
                </span>
              </div>
              {entry.boss_defeats > 0 && (
                <div className="flex items-center gap-1">
                  <span
                    className="material-symbols-outlined"
                    style={{ color: '#3edeb1', fontSize: '0.75rem', fontVariationSettings: "'FILL' 1" }}
                  >
                    skull
                  </span>
                  <span className="font-mono-hud" style={{ color: '#3edeb1', fontSize: '0.65rem' }}>
                    ×{entry.boss_defeats}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <p className="text-center font-manrope text-sm py-10" style={{ color: '#cbc4ce' }}>
            No scores yet. Be the first!
          </p>
        )}
      </main>

      {/* ── Bottom nav ───────────────────────────────────────────────────────── */}
      <nav
        className="shrink-0 border-t"
        style={{ background: '#20201a', borderColor: 'rgba(255,211,53,0.1)' }}
      >
        <div className="flex justify-around items-center py-2 px-4">
          {[
            { key: 'journey',   icon: 'map',      label: 'Journey',   href: '/home',           active: false },
            { key: 'quests',    icon: 'swords',   label: 'Quests',    href: '/leaderboard',    active: true  },
            { key: 'inventory', icon: 'backpack', label: 'Inventory', href: '/home/inventory', active: false },
            { key: 'profile',   icon: 'person',   label: 'Profile',   href: '/home/profile',   active: false },
          ].map(({ key, icon, label, href, active }) => (
            <button
              key={key}
              onClick={() => router.push(href)}
              className="flex flex-col items-center justify-center rounded-full px-5 py-2 gap-0.5"
              style={active ? { background: '#ffd335' } : { color: '#cbc4ce', opacity: 0.6 }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  color:                active ? '#3c2f00' : undefined,
                  fontSize:             '1.3rem',
                  fontVariationSettings: active ? "'FILL' 1" : undefined,
                }}
              >
                {icon}
              </span>
              <span
                className="font-manrope font-bold text-xs"
                style={{ color: active ? '#3c2f00' : undefined }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

function PodiumSlot({
  entry, rankColor, height, crown = false,
}: {
  entry: LeaderboardEntry
  rankColor: string
  height: string
  crown?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      {crown && (
        <span className="material-symbols-outlined" style={{ fontSize: '1.4rem', lineHeight: 1, fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
      )}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center border-2"
        style={{ background: '#20201a', borderColor: rankColor }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '1.4rem', fontVariationSettings: "'FILL' 1" }}>person</span>
      </div>
      <span
        className="font-manrope font-bold text-xs text-center truncate w-full text-center"
        style={{ color: entry.is_me ? '#ffd335' : '#e6e2d9', maxWidth: '5rem' }}
      >
        {entry.nickname}
      </span>
      <div
        className={`w-full ${height} rounded-t-lg flex flex-col items-center justify-center gap-1`}
        style={{ background: `${rankColor}22`, border: `1px solid ${rankColor}55` }}
      >
        <span className="font-mono-hud text-xs" style={{ color: rankColor }}>
          {entry.total_xp.toLocaleString()}
        </span>
        <span className="font-mono-hud" style={{ color: rankColor, fontSize: '0.6rem', opacity: 0.7 }}>
          XP
        </span>
      </div>
    </div>
  )
}
