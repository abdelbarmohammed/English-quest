'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Question, BossConfig, GameResult } from '@/lib/game-types'

export type Phase = 'playing' | 'correct' | 'wrong' | 'won' | 'lost'

export interface UseGameEngineReturn {
  // Per-question state
  qIdx: number
  q: Question
  hearts: number
  streak: number
  correctCount: number
  phase: Phase
  tappedIdx: number | null   // which choice index was tapped this question
  // Derived display values
  showFlash: 'correct' | 'wrong' | null
  timerProgress: number       // 1 → 0 as the per-question timer depletes
  progress: number            // 0 → 1 across all questions (for progress bar)
  questionKey: number         // increments on every new question; use as React key
  xpEarned: number
  // Actions
  handleTap: (choiceIdx: number) => void
  restart: () => void
}

export function useGameEngine(
  questions: Question[],
  bossConfig: BossConfig,
  onGameEnd?: (result: GameResult) => void,
): UseGameEngineReturn {
  const [qIdx,          setQIdx]          = useState(0)
  const [hearts,        setHearts]        = useState(bossConfig.hearts)
  const [streak,        setStreak]        = useState(0)
  const [correctCount,  setCorrectCount]  = useState(0)
  const [phase,         setPhase]         = useState<Phase>('playing')
  const [tappedIdx,     setTappedIdx]     = useState<number | null>(null)
  const [showFlash,     setShowFlash]     = useState<'correct' | 'wrong' | null>(null)
  const [timerProgress, setTimerProgress] = useState(1)
  // Increments on every new question (both advance and restart), used by templates
  // as a React key to remount animation containers or reset local visual state.
  const [questionKey,   setQuestionKey]   = useState(0)

  // Stable refs — let callbacks read the latest values without stale closures
  const stateRef = useRef({ qIdx, hearts, phase })
  useEffect(() => { stateRef.current = { qIdx, hearts, phase } }, [qIdx, hearts, phase])

  // Keep onGameEnd ref stable so effects don't need it as a dependency
  const gameDoneRef  = useRef(false)
  const onGameEndRef = useRef(onGameEnd)
  useEffect(() => { onGameEndRef.current = onGameEnd }, [onGameEnd])

  const missTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const q = questions[qIdx]

  // ── Internal helpers ───────────────────────────────────────────────────────

  const clearFlashAfter = useCallback((ms: number) => {
    setTimeout(() => setShowFlash(null), ms)
  }, [])

  const goNext = useCallback(() => {
    const next = stateRef.current.qIdx + 1
    if (next >= questions.length) {
      setPhase('won')
      return
    }
    setQIdx(next)
    setTappedIdx(null)
    setTimerProgress(1)
    setPhase('playing')
    setQuestionKey(k => k + 1)
  }, [questions.length])

  const handleMiss = useCallback(() => {
    if (stateRef.current.phase !== 'playing') return
    const newH = stateRef.current.hearts - 1
    setHearts(newH)
    setStreak(0)
    setTappedIdx(null)
    setPhase('wrong')
    setShowFlash('wrong')
    clearFlashAfter(700)
    setTimeout(() => {
      if (newH <= 0) setPhase('lost')
      else goNext()
    }, 850)
  }, [goNext, clearFlashAfter])

  // ── Public actions ─────────────────────────────────────────────────────────

  const handleTap = useCallback((choiceIdx: number) => {
    if (stateRef.current.phase !== 'playing') return
    clearTimeout(missTimerRef.current)
    setTappedIdx(choiceIdx)

    const isCorrect = q.choices[choiceIdx] === q.correct_answer

    if (isCorrect) {
      setStreak(s => s + 1)
      setCorrectCount(c => c + 1)
      setPhase('correct')
      setShowFlash('correct')
      clearFlashAfter(500)
      setTimeout(goNext, 700)
    } else {
      const newH = stateRef.current.hearts - 1
      setHearts(newH)
      setStreak(0)
      setPhase('wrong')
      setShowFlash('wrong')
      clearFlashAfter(700)
      setTimeout(() => {
        if (newH <= 0) setPhase('lost')
        else goNext()
      }, 950)
    }
  }, [q, goNext, clearFlashAfter])

  const restart = useCallback(() => {
    clearTimeout(missTimerRef.current)
    gameDoneRef.current = false
    setQIdx(0)
    setHearts(bossConfig.hearts)
    setStreak(0)
    setCorrectCount(0)
    setPhase('playing')
    setTappedIdx(null)
    setShowFlash(null)
    setTimerProgress(1)
    setQuestionKey(k => k + 1)
  }, [bossConfig.hearts])

  // ── Effects ────────────────────────────────────────────────────────────────

  // Miss timer — reset on every new question
  useEffect(() => {
    if (phase !== 'playing') return
    missTimerRef.current = setTimeout(handleMiss, bossConfig.secondsPerQuestion * 1000)
    return () => clearTimeout(missTimerRef.current)
  }, [qIdx, phase, bossConfig.secondsPerQuestion, handleMiss])

  // Smooth timer progress bar (updates at ~12 fps)
  useEffect(() => {
    if (phase !== 'playing') return
    setTimerProgress(1)
    const start = Date.now()
    const duration = bossConfig.secondsPerQuestion * 1000
    const id = setInterval(() => {
      const remaining = Math.max(0, 1 - (Date.now() - start) / duration)
      setTimerProgress(remaining)
      if (remaining <= 0) clearInterval(id)
    }, 80)
    return () => clearInterval(id)
  }, [qIdx, phase, bossConfig.secondsPerQuestion])

  // ── Fire onGameEnd once when the game reaches a terminal phase ────────────
  useEffect(() => {
    if (phase !== 'won' && phase !== 'lost') return
    if (gameDoneRef.current) return
    gameDoneRef.current = true
    const xp = correctCount * 100 + hearts * 50
    onGameEndRef.current?.({ won: phase === 'won', xpEarned: xp, heartsLeft: hearts })
  }, [phase, correctCount, hearts])

  // ── Return ─────────────────────────────────────────────────────────────────

  return {
    qIdx,
    q,
    hearts,
    streak,
    correctCount,
    phase,
    tappedIdx,
    showFlash,
    timerProgress,
    progress: qIdx / questions.length,
    questionKey,
    xpEarned: correctCount * 100 + hearts * 50,
    handleTap,
    restart,
  }
}
