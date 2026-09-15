'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import { getSession, clearSession } from '@/lib/session'
import type { StudentProgressResponse } from '@/lib/types'

export default function ProfilePage() {
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
          setError(err instanceof ApiError ? err.message : 'Failed to load profile.')
        }
      })
  }, [router])

  function signOut() {
    clearSession()
    router.replace('/join')
  }

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
        <button onClick={() => router.back()} className="font-manrope text-sm" style={{ color: '#ffd335' }}>
          Go Back
        </button>
      </div>
    )
  }

  const totalXp       = data!.units.reduce((s, u) => s + u.progress.total_xp, 0)
  const unitsComplete = data!.units.filter(u => u.progress.boss_defeated).length
  const totalUnits    = data!.units.length
  const lessonsTotal  = data!.units.reduce((s, u) => s + u.progress.total_lessons, 0)
  const lessonsDone   = data!.units.reduce((s, u) => s + u.progress.lessons_completed_count, 0)

  const stats = [
    { icon: 'bolt',        label: 'Total XP',         value: totalXp.toLocaleString() },
    { icon: 'swords',      label: 'Bosses Defeated',   value: `${unitsComplete}/${totalUnits}` },
    { icon: 'menu_book',   label: 'Lessons Complete',  value: `${lessonsDone}/${lessonsTotal}` },
    { icon: 'school',      label: 'Class',             value: data!.school_class.name },
    { icon: 'auto_stories', label: 'Subject',          value: data!.school_class.subject.name },
  ]

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
          style={{ color: 'rgba(255,211,53,0.7)', letterSpacing: '0.05em' }}
        >
          PROFILE
        </span>

        <div style={{ width: '2.75rem' }} />
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-5 py-8 flex flex-col items-center gap-6">

        {/* Avatar */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
            style={{ background: 'rgba(255,211,53,0.2)' }}
          />
          <div
            className="relative z-10 w-24 h-24 rounded-full border-2 flex items-center justify-center"
            style={{
              background:  '#1a0b2e',
              borderColor: '#ffd335',
              boxShadow:   'inset 0 0 20px rgba(255,211,53,0.15), 0 0 30px rgba(255,211,53,0.12)',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '3rem', color: '#ffd335', fontVariationSettings: "'FILL' 1" }}
            >
              person
            </span>
          </div>
        </div>

        {/* Nickname */}
        <div className="text-center">
          <h1
            className="font-caslon font-bold"
            style={{ color: '#ffd335', fontSize: '2rem', lineHeight: '2.5rem' }}
          >
            {data!.nickname}
          </h1>
          <p className="font-manrope text-sm mt-1" style={{ color: '#cbc4ce' }}>
            English Quest Hero
          </p>
        </div>

        {/* Divider */}
        <div className="zellige-divider w-full" />

        {/* Stats grid */}
        <div className="w-full flex flex-col gap-3">
          {stats.map(({ icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-4 px-4 py-3 rounded-lg border"
              style={{
                background:  'rgba(28,28,22,0.9)',
                borderColor: 'rgba(255,211,53,0.12)',
                boxShadow:   'inset 0 0 12px rgba(255,211,53,0.04)',
              }}
            >
              <span
                className="material-symbols-outlined shrink-0"
                style={{ color: '#ffd335', fontSize: '1.25rem', fontVariationSettings: "'FILL' 1" }}
              >
                {icon}
              </span>
              <span className="font-manrope text-sm flex-1" style={{ color: '#cbc4ce' }}>
                {label}
              </span>
              <span className="font-mono-hud text-sm font-medium" style={{ color: '#e6e2d9' }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="zellige-divider w-full" />

        {/* Sign out */}
        <button
          onClick={signOut}
          className="w-full py-3 rounded-lg font-manrope font-bold border flex items-center justify-center gap-2"
          style={{
            background:  'transparent',
            borderColor: 'rgba(255,180,171,0.35)',
            color:       '#ffb4ab',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>logout</span>
          Sign Out
        </button>

      </main>

      {/* ── Bottom nav ───────────────────────────────────────────────────────── */}
      <BottomNav active="profile" />
    </div>
  )
}

function BottomNav({ active }: { active: string }) {
  const router = useRouter()
  const tabs = [
    { key: 'journey',   icon: 'map',      label: 'Journey',   href: '/home' },
    { key: 'quests',    icon: 'swords',   label: 'Quests',    href: '/leaderboard' },
    { key: 'inventory', icon: 'backpack', label: 'Inventory', href: '/home/inventory' },
    { key: 'profile',   icon: 'person',   label: 'Profile',   href: '/home/profile' },
  ]
  return (
    <nav className="shrink-0 border-t" style={{ background: '#20201a', borderColor: 'rgba(255,211,53,0.1)' }}>
      <div className="flex justify-around items-center py-2 px-4">
        {tabs.map(({ key, icon, label, href }) => {
          const isActive = key === active
          return (
            <button
              key={key}
              onClick={() => router.push(href)}
              className="flex flex-col items-center justify-center rounded-full px-5 py-2 gap-0.5"
              style={isActive ? { background: '#ffd335' } : { color: '#cbc4ce', opacity: 0.6 }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  color:                isActive ? '#3c2f00' : undefined,
                  fontSize:             '1.3rem',
                  fontVariationSettings: isActive ? "'FILL' 1" : undefined,
                }}
              >
                {icon}
              </span>
              <span
                className="font-manrope font-bold text-xs"
                style={{ color: isActive ? '#3c2f00' : undefined }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
