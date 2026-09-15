'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SpeedQuiz from '@/components/game/SpeedQuiz'
import CorrectChoiceShooter from '@/components/game/CorrectChoiceShooter'
import { MOCK_SPEED_QUIZ_QUESTIONS, MOCK_SPEED_QUIZ_BOSS_CONFIG } from '@/lib/mock-questions'
import { api, ApiError } from '@/lib/api'
import { getSession, clearSession } from '@/lib/session'
import { adaptQuestion, adaptBossConfig } from '@/lib/api-adapters'
import { logEvent } from '@/lib/events'
import type { Question, BossConfig, GameResult } from '@/lib/game-types'
import type { ApiBossConfig, ApiExerciseSet } from '@/lib/types'

// Minimal shape we need from GET /api/units/
type UnitBossData = {
  id:   number
  boss: ApiBossConfig | null
}

// ── Inner component (needs Suspense boundary for useSearchParams) ─────────────

function BossContent() {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const unitIdStr   = searchParams.get('unitId')
  const unitId      = unitIdStr ? Number(unitIdStr) : null

  const [questions,  setQuestions]  = useState<Question[]>([])
  const [bossConfig, setBossConfig] = useState<BossConfig>(MOCK_SPEED_QUIZ_BOSS_CONFIG)
  const [template,   setTemplate]   = useState<string>('speed_quiz')
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const gameStartRef = useRef(Date.now())

  useEffect(() => {
    if (!unitId) {
      setQuestions(MOCK_SPEED_QUIZ_QUESTIONS)
      setLoading(false)
      return
    }

    const session = getSession()
    if (!session) {
      setQuestions(MOCK_SPEED_QUIZ_QUESTIONS)
      setLoading(false)
      return
    }

    Promise.all([
      api.get<UnitBossData[]>('/units/'),
      api.get<ApiExerciseSet[]>(`/units/${unitId}/exercise-sets/`),
    ])
      .then(([units, sets]) => {
        const unit = units.find(u => u.id === unitId)
        const boss = unit?.boss ?? null

        if (boss) {
          setBossConfig(adaptBossConfig(boss))
          setTemplate(boss.template)
        }

        const bossTemplate = boss?.template ?? 'speed_quiz'
        const allQ         = sets.flatMap(s => s.questions)
        // Prefer questions matching the boss template; fall back to all
        const templateQ    = allQ.filter(q => !q.template_tag || q.template_tag === bossTemplate)
        const adapted      = (templateQ.length ? templateQ : allQ).map(adaptQuestion)
        setQuestions(adapted.length ? adapted : MOCK_SPEED_QUIZ_QUESTIONS)
        setLoading(false)
      })
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) {
          clearSession(); router.replace('/join')
        } else {
          setError(err instanceof ApiError ? err.message : 'Failed to load boss fight.')
          setLoading(false)
        }
      })
  }, [unitId, router])

  // Called once by useGameEngine when the game reaches won/lost
  const handleGameEnd = useCallback(async (result: GameResult) => {
    if (!unitId) return
    const session = getSession()
    if (!session) return

    const duration = Math.round((Date.now() - gameStartRef.current) / 1000)
    logEvent(result.won ? 'boss_win' : 'boss_loss', { durationSeconds: duration })

    try {
      await api.post('/progress/boss-result/', {
        student_id:  session.student_id,
        unit_id:     unitId,
        xp:          result.xpEarned,
        hearts_left: result.heartsLeft,
        won:         result.won,
      })
    } catch {
      // best-effort — don't block the victory overlay
    }

    if (result.won) {
      // Auto-redirect after a short delay so the player reads the overlay
      setTimeout(() => router.push(`/home/units/${unitId}`), 2800)
    }
  }, [unitId, router])

  const handleBackToMap = useCallback(() => {
    router.push(unitId ? `/home/units/${unitId}` : '/home')
  }, [unitId, router])

  /* ── Loading ──────────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: '#1a0b2e' }}>
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
      <div className="h-full flex flex-col items-center justify-center gap-4 px-6" style={{ background: '#1a0b2e' }}>
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

  // Render the correct template based on the boss's template field
  const GameTemplate = template === 'shooter' ? CorrectChoiceShooter : SpeedQuiz

  return (
    <div className="h-full flex flex-col max-w-sm mx-auto" style={{ background: '#1a0b2e' }}>
      <nav
        className="shrink-0 flex items-center gap-5 px-5 py-2 border-b"
        style={{ background: '#14140f', borderColor: 'rgba(255,211,53,0.15)' }}
      >
        <button
          onClick={() => router.back()}
          className="font-manrope text-xs"
          style={{ color: '#cbc4ce' }}
        >
          ← Back
        </button>
        <span className="font-manrope text-xs font-bold truncate flex-1 min-w-0" style={{ color: '#ffd335' }}>
          {bossConfig.bossName ?? 'Boss Fight'}
        </span>
      </nav>
      <div className="flex-1 min-h-0">
        <GameTemplate
          questions={questions}
          bossConfig={bossConfig}
          skin="default"
          onGameEnd={handleGameEnd}
          onBackToMap={handleBackToMap}
        />
      </div>
    </div>
  )
}

// ── Page (Suspense boundary required by Next.js for useSearchParams) ──────────

export default function BossPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center" style={{ background: '#1a0b2e' }}>
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: 'rgba(255,211,53,0.2)', borderTopColor: '#ffd335' }}
          />
        </div>
      }
    >
      <BossContent />
    </Suspense>
  )
}
