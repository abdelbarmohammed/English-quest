'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import { getSession, clearSession } from '@/lib/session'
import { logEvent } from '@/lib/events'
import type { StudentProgressResponse, ApiUnit } from '@/lib/types'

type UnitState = 'locked' | 'completed' | 'current' | 'available'

function unitState(unit: ApiUnit, isCurrent: boolean): UnitState {
  if (unit.is_locked) return 'locked'
  if (unit.progress.boss_defeated) return 'completed'
  if (isCurrent) return 'current'
  return 'available'
}

function UnitIcon({ state }: { state: UnitState }) {
  const iconName =
    state === 'locked'    ? 'lock'         :
    state === 'completed' ? 'check_circle' :
    state === 'current'   ? 'auto_awesome' :
    'book'

  const color =
    state === 'completed' ? '#3edeb1' :
    state === 'current'   ? '#ffd335' :
    '#cbc4ce'

  return (
    <span
      className="material-symbols-outlined -rotate-45"
      style={{
        fontSize:             state === 'current' ? '2.5rem' : '2rem',
        color,
        fontVariationSettings: "'FILL' 1",
        display:              'block',
        lineHeight:           1,
      }}
    >
      {iconName}
    </span>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [data,  setData]  = useState<StudentProgressResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const session = getSession()
    if (!session) { router.replace('/join'); return }

    api.get<StudentProgressResponse>(`/progress/${session.student_id}/`)
      .then(setData)
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) {
          clearSession(); router.replace('/join')
        } else {
          setError(err instanceof ApiError ? err.message : 'Failed to load progress.')
        }
      })
  }, [router])

  // session_start fires once when data loads; session_end fires on unmount
  useEffect(() => {
    if (!data) return
    const start = Date.now()
    logEvent('session_start')
    return () => {
      logEvent('session_end', { durationSeconds: Math.round((Date.now() - start) / 1000) })
    }
  }, [data])

  /* ── Loading ─────────────────────────────────────────────────────────────── */
  if (!data && !error) {
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
          onClick={() => { clearSession(); router.replace('/join') }}
          className="font-manrope text-sm"
          style={{ color: '#ffd335' }}
        >
          Return to Join Page
        </button>
      </div>
    )
  }

  /* ── Data ────────────────────────────────────────────────────────────────── */
  const units   = [...data!.units].sort((a, b) => b.order - a.order)
  const totalXp = data!.units.reduce((sum, u) => sum + u.progress.total_xp, 0)
  const currentUnit = units.find(u => !u.is_locked && !u.progress.boss_defeated)

  return (
    <div
      className="max-w-sm mx-auto h-full flex flex-col"
      style={{ background: '#14140f' }}
    >
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header
        className="shrink-0 flex justify-between items-center px-5 h-16 border-b"
        style={{
          background:     'rgba(20,20,15,0.95)',
          backdropFilter: 'blur(6px)',
          borderColor:    'rgba(255,211,53,0.15)',
          boxShadow:      'inset 0 0 20px rgba(255,211,53,0.05)',
        }}
      >
        {/* Avatar + nickname pill */}
        <div
          className="flex items-center gap-2 rounded-full px-3 py-1 border"
          style={{ background: '#20201a', borderColor: 'rgba(255,211,53,0.2)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="font-manrope font-bold text-sm" style={{ color: '#ffd335' }}>
            {data!.nickname}
          </span>
        </div>

        {/* XP counter */}
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full border"
          style={{ background: 'rgba(255,211,53,0.06)', borderColor: 'rgba(255,211,53,0.2)' }}
        >
          <span
            className="material-symbols-outlined"
            style={{ color: '#ffd335', fontSize: '1rem', fontVariationSettings: "'FILL' 1" }}
          >
            bolt
          </span>
          <span className="font-mono-hud text-xs" style={{ color: '#ffd335' }}>
            {totalXp.toLocaleString()} XP
          </span>
        </div>
      </header>

      {/* ── Journey map ──────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto relative px-4">
        {/* Vertical path line */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left:       '50%',
            transform:  'translateX(-50%)',
            width:      '2px',
            background: 'linear-gradient(to bottom, transparent, rgba(255,211,53,0.35) 8%, rgba(255,211,53,0.35) 92%, transparent)',
          }}
        />

        <div className="relative z-10 flex flex-col gap-14 py-10">
          {units.length === 0 ? (
            <p className="text-center font-manrope text-sm" style={{ color: '#cbc4ce' }}>
              No units available yet.
            </p>
          ) : (
            units.map((unit, idx) => {
              const state     = unitState(unit, unit.id === currentUnit?.id)
              const iconRight = idx % 2 === 0  // flex-row-reverse → icon ends up on right
              const clickable = state !== 'locked'

              return (
                <div
                  key={unit.id}
                  className={[
                    'flex items-center justify-center gap-4 w-full relative animate-fade-in',
                    iconRight ? 'flex-row-reverse' : 'flex-row',
                    state === 'current' ? 'scale-110 my-2 z-20' : '',
                    state === 'locked'  ? 'opacity-50 grayscale' : '',
                    clickable           ? 'cursor-pointer'       : 'cursor-default',
                  ].join(' ')}
                  style={{ animationDelay: `${idx * 0.07}s` }}
                  onClick={() => clickable && router.push(`/home/units/${unit.id}`)}
                >
                  {/* Ambient glow for current unit */}
                  {state === 'current' && (
                    <div
                      className="absolute inset-0 blur-2xl pointer-events-none"
                      style={{ background: 'radial-gradient(ellipse at center, rgba(255,211,53,0.18) 0%, transparent 70%)' }}
                    />
                  )}

                  {/* Diamond icon */}
                  <div
                    className={[
                      'flex items-center justify-center rotate-45 shrink-0',
                      state === 'current' ? 'pulse-gold' : '',
                    ].join(' ')}
                    style={{
                      width:       state === 'current' ? '6rem' : '5rem',
                      height:      state === 'current' ? '6rem' : '5rem',
                      borderRadius: '0.5rem',
                      background:
                        state === 'completed' ? 'rgba(0,23,15,0.9)'  :
                        state === 'current'   ? '#1a0b2e'             :
                        '#20201a',
                      border:
                        state === 'completed' ? '1px solid #3edeb1'               :
                        state === 'current'   ? '2px solid #ffd335'               :
                        '1px solid rgba(74,69,77,0.8)',
                      boxShadow:
                        state === 'current' ? 'inset 0 0 15px rgba(255,211,53,0.15)' : undefined,
                    }}
                  >
                    <UnitIcon state={state} />
                  </div>

                  {/* Text side */}
                  <div className={`flex-1 ${iconRight ? 'text-right' : 'text-left'}`}>
                    {state === 'current' && (
                      <p
                        className="font-mono-hud text-xs mb-1"
                        style={{ color: '#ffd335', letterSpacing: '0.05em' }}
                      >
                        CURRENT QUEST
                      </p>
                    )}
                    <h3
                      className="font-manrope font-bold leading-tight"
                      style={{
                        color:    state === 'locked' ? '#cbc4ce' : '#e6e2d9',
                        fontSize: state === 'current' ? '1.25rem' : '1rem',
                      }}
                    >
                      {unit.title}
                    </h3>
                    <p
                      className="font-manrope text-sm mt-0.5"
                      style={{
                        color:
                          state === 'completed' ? '#3edeb1' :
                          state === 'current'   ? '#ffd335' :
                          '#cbc4ce',
                      }}
                    >
                      {state === 'completed' ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: '0.85rem', fontVariationSettings: "'FILL' 1", lineHeight: 1 }}>check_circle</span>
                          Boss Defeated
                        </span>
                      ) : `${unit.progress.lessons_completed_count}/${unit.progress.total_lessons} lessons`}
                    </p>
                  </div>

                  {/* Empty flex-1 to keep icon centred */}
                  <div className="flex-1" />
                </div>
              )
            })
          )}
        </div>
      </main>

      {/* ── Bottom nav ───────────────────────────────────────────────────────── */}
      <nav
        className="shrink-0 border-t"
        style={{
          background:  '#20201a',
          borderColor: 'rgba(255,211,53,0.1)',
        }}
      >
        <div className="flex justify-around items-center py-2 px-4">
          {[
            { key: 'journey',   icon: 'map',      label: 'Journey',   href: '/home',            active: true  },
            { key: 'quests',    icon: 'swords',   label: 'Quests',    href: '/leaderboard',     active: false },
            { key: 'inventory', icon: 'backpack', label: 'Inventory', href: '/home/inventory',  active: false },
            { key: 'profile',   icon: 'person',   label: 'Profile',   href: '/home/profile',    active: false },
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
