'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import { getSession, clearSession } from '@/lib/session'
import type { ApiLesson, ApiUnit, StudentProgressResponse } from '@/lib/types'

export default function UnitDetailPage() {
  const router  = useRouter()
  const params  = useParams()
  const unitId  = Number(params.unitId)

  const [lessons, setLessons] = useState<ApiLesson[] | null>(null)
  const [unit,    setUnit]    = useState<ApiUnit | null>(null)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    const session = getSession()
    if (!session) { router.replace('/join'); return }

    Promise.all([
      api.get<ApiLesson[]>(`/units/${unitId}/lessons/`),
      api.get<StudentProgressResponse>(`/progress/${session.student_id}/`),
    ])
      .then(([lessonData, progressData]) => {
        setLessons(lessonData)
        setUnit(progressData.units.find(u => u.id === unitId) ?? null)
      })
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) {
          clearSession(); router.replace('/join')
        } else {
          setError(err instanceof ApiError ? err.message : 'Failed to load unit.')
        }
      })
  }, [router, unitId])

  /* ── Loading ─────────────────────────────────────────────────────────────── */
  if (!lessons && !error) {
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

  const completedIds  = new Set(unit?.progress.lessons_completed ?? [])
  const allDone       = (unit?.progress.lessons_completed_count ?? 0) >= (unit?.progress.total_lessons ?? 1) && (unit?.progress.total_lessons ?? 0) > 0
  const bossAvailable = allDone && !!unit?.boss && !unit.progress.boss_defeated

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
          className="font-mono-hud text-xs flex-1 min-w-0 truncate text-center mx-2"
          style={{ color: 'rgba(255,211,53,0.7)', letterSpacing: '0.05em' }}
        >
          {unit?.title ?? `UNIT ${unitId}`}
        </span>

        {/* Spacer */}
        <div style={{ width: '2.75rem' }} />
      </header>

      {/* ── Lesson list ──────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-3">
        <h1
          className="font-caslon font-bold mb-4"
          style={{ color: '#e6e2d9', fontSize: '1.5rem', lineHeight: '2rem' }}
        >
          {unit?.title ?? 'Unit'}
        </h1>

        {/* Progress bar */}
        {unit && (
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono-hud text-xs" style={{ color: '#cbc4ce', letterSpacing: '0.05em' }}>
                LESSONS
              </span>
              <span className="font-mono-hud text-xs" style={{ color: '#ffd335' }}>
                {unit.progress.lessons_completed_count}/{unit.progress.total_lessons}
              </span>
            </div>
            <div
              className="h-1.5 overflow-hidden shimmer-bar"
              style={{ background: 'rgba(255,211,53,0.15)' }}
            >
              <div
                className="h-full"
                style={{
                  width:      `${unit.progress.total_lessons > 0 ? (unit.progress.lessons_completed_count / unit.progress.total_lessons) * 100 : 0}%`,
                  background: '#ffd335',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Zellige divider */}
        <div className="zellige-divider my-2" />

        {/* Lesson rows */}
        {lessons!.length === 0 ? (
          <p className="font-manrope text-sm text-center" style={{ color: '#cbc4ce' }}>
            No lessons in this unit yet.
          </p>
        ) : (
          lessons!.map(lesson => {
            const done = completedIds.has(lesson.id)
            return (
              <button
                key={lesson.id}
                onClick={() => router.push(`/home/units/${unitId}/lessons/${lesson.id}`)}
                className="w-full flex items-center gap-4 p-4 rounded-lg border text-left"
                style={{
                  background:  done ? 'rgba(0,23,15,0.7)' : 'rgba(28,28,22,0.95)',
                  borderColor: done ? 'rgba(62,222,177,0.3)' : 'rgba(255,211,53,0.12)',
                  transition:  'opacity 0.15s',
                }}
              >
                <span
                  className="material-symbols-outlined shrink-0"
                  style={{
                    color:                done ? '#3edeb1' : '#cbc4ce',
                    fontVariationSettings: done ? "'FILL' 1" : "'FILL' 0",
                    fontSize:             '1.4rem',
                  }}
                >
                  {done ? 'check_circle' : 'menu_book'}
                </span>

                <div className="flex-1 min-w-0">
                  <p
                    className="font-manrope font-bold text-sm leading-tight line-clamp-2"
                    style={{ color: done ? '#3edeb1' : '#e6e2d9' }}
                  >
                    {lesson.title}
                  </p>
                  {done && (
                    <p className="font-manrope text-xs mt-0.5" style={{ color: 'rgba(62,222,177,0.6)' }}>
                      Completed
                    </p>
                  )}
                </div>

                <span
                  className="material-symbols-outlined shrink-0"
                  style={{ color: '#cbc4ce', fontSize: '1.2rem' }}
                >
                  chevron_right
                </span>
              </button>
            )
          })
        )}

        {/* Practice CTA */}
        {lessons!.length > 0 && (
          <button
            onClick={() => router.push(`/game?unitId=${unitId}`)}
            className="mt-2 w-full py-3 rounded-lg font-manrope font-bold flex items-center justify-center gap-2 border"
            style={{
              background:  'rgba(255,211,53,0.08)',
              borderColor: 'rgba(255,211,53,0.25)',
              color:       '#ffd335',
            }}
          >
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              sports_esports
            </span>
            Practice This Unit
          </button>
        )}

        {/* Boss fight CTA */}
        {bossAvailable && (
          <button
            onClick={() => router.push(`/boss?unitId=${unitId}`)}
            className="mt-2 w-full py-4 rounded-lg font-manrope font-bold flex items-center justify-center gap-2"
            style={{
              background: '#ffd335',
              color:      '#3c2f00',
              boxShadow:  'inset 0 0 15px rgba(255,255,255,0.4), 0 4px 12px rgba(255,211,53,0.3)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', fontVariationSettings: "'FILL' 1" }}>swords</span>
            Challenge the Boss: {unit!.boss!.name}
          </button>
        )}

        {/* Already defeated boss */}
        {unit?.progress.boss_defeated && (
          <div
            className="mt-4 w-full py-3 rounded-lg font-manrope text-sm text-center"
            style={{
              background:  'rgba(0,23,15,0.5)',
              border:      '1px solid rgba(62,222,177,0.2)',
              color:       '#3edeb1',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem', fontVariationSettings: "'FILL' 1", verticalAlign: 'middle' }}>check_circle</span>
            {' '}Boss Defeated{unit.progress.golden_boss_defeated ? ' · Golden Run!' : ''}
          </div>
        )}
      </main>
    </div>
  )
}
