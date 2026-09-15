'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import CorrectChoiceShooter from '@/components/game/CorrectChoiceShooter'
import { MOCK_QUESTIONS, MOCK_BOSS_CONFIG } from '@/lib/mock-questions'
import { api, ApiError } from '@/lib/api'
import { getSession, clearSession } from '@/lib/session'
import { adaptQuestion } from '@/lib/api-adapters'
import type { Question, BossConfig } from '@/lib/game-types'
import type { ApiExerciseSet } from '@/lib/types'

const PRACTICE_BOSS_CONFIG: BossConfig = {
  hearts:             MOCK_BOSS_CONFIG.hearts,
  secondsPerQuestion: MOCK_BOSS_CONFIG.secondsPerQuestion,
  floors:             MOCK_BOSS_CONFIG.floors,
}

// ── Inner component (needs Suspense boundary for useSearchParams) ─────────────

function GameContent() {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const unitIdStr   = searchParams.get('unitId')
  const unitId      = unitIdStr ? Number(unitIdStr) : null

  const [questions, setQuestions] = useState<Question[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!unitId) {
      setQuestions(MOCK_QUESTIONS)
      setLoading(false)
      return
    }

    const session = getSession()
    if (!session) {
      setQuestions(MOCK_QUESTIONS)
      setLoading(false)
      return
    }

    api.get<ApiExerciseSet[]>(`/units/${unitId}/exercise-sets/`)
      .then(sets => {
        const allQ = sets.flatMap(s => s.questions)
        // Prefer shooter-tagged questions; fall back to all if none tagged
        const shooterQ = allQ.filter(q => !q.template_tag || q.template_tag === 'shooter')
        const adapted  = (shooterQ.length ? shooterQ : allQ).map(adaptQuestion)
        setQuestions(adapted.length ? adapted : MOCK_QUESTIONS)
        setLoading(false)
      })
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) {
          clearSession(); router.replace('/join')
        } else {
          setError(err instanceof ApiError ? err.message : 'Failed to load questions.')
          setLoading(false)
        }
      })
  }, [unitId, router])

  const handleBackToMap = useCallback(() => {
    router.push(unitId ? `/home/units/${unitId}` : '/home')
  }, [unitId, router])

  /* ── Loading ──────────────────────────────────────────────────────────────── */
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

  /* ── Error ────────────────────────────────────────────────────────────────── */
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
    <div className="h-full flex flex-col max-w-sm mx-auto" style={{ background: '#14140f' }}>
      <nav
        className="shrink-0 flex gap-5 px-5 py-2 border-b"
        style={{ background: '#14140f', borderColor: 'rgba(255,211,53,0.15)' }}
      >
        <button
          onClick={() => router.back()}
          className="font-manrope text-xs"
          style={{ color: '#cbc4ce' }}
        >
          ← Back
        </button>
        <span className="font-manrope text-xs font-bold" style={{ color: '#ffd335' }}>
          Practice
        </span>
        <Link
          href={unitId ? `/boss?unitId=${unitId}` : '/boss'}
          className="font-manrope text-xs ml-auto"
          style={{ color: '#cbc4ce' }}
        >
          Boss Fight →
        </Link>
      </nav>
      <div className="flex-1 min-h-0">
        <CorrectChoiceShooter
          questions={questions}
          bossConfig={PRACTICE_BOSS_CONFIG}
          skin="default"
          onBackToMap={handleBackToMap}
        />
      </div>
    </div>
  )
}

// ── Page (Suspense boundary required by Next.js for useSearchParams) ──────────

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center" style={{ background: '#14140f' }}>
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: 'rgba(255,211,53,0.2)', borderTopColor: '#ffd335' }}
          />
        </div>
      }
    >
      <GameContent />
    </Suspense>
  )
}
