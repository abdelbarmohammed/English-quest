'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import type { GameTemplateProps, Question } from '@/lib/game-types'
import { useGameEngine, type Phase } from './useGameEngine'
import { HeartIcon, ResultOverlay } from './GameShared'

// ── Types ─────────────────────────────────────────────────────────────────────

type CardState = 'idle' | 'correct' | 'wrong' | 'reveal' | 'hidden'

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Target card ───────────────────────────────────────────────────────────────

// Compute centred offsets for n cards, each 128px wide with a 27px gap
function laneOffsets(n: number): string[] {
  const cardW = 128
  const gap   = 27
  const step  = cardW + gap
  const total = n * cardW + (n - 1) * gap
  const start = -total / 2 + cardW / 2
  return Array.from({ length: n }, (_, i) => `${start + i * step}px`)
}

interface TargetCardProps {
  text: string
  emoji?: string
  offset: string
  cardState: CardState
  onTap: () => void
  animDuration: number
  shaking: boolean
}

function TargetCard({ text, emoji, offset, cardState, onTap, animDuration, shaking }: TargetCardProps) {
  const idle    = cardState === 'idle'
  const correct = cardState === 'correct'
  const wrong   = cardState === 'wrong'
  const reveal  = cardState === 'reveal'
  const hidden  = cardState === 'hidden'

  return (
    <button
      onClick={idle ? onTap : undefined}
      disabled={!idle}
      aria-label={text}
      className={clsx(
        'absolute flex flex-col items-center justify-center w-32 h-32 rounded-lg border',
        'transition-colors duration-200',
        idle  && 'cursor-pointer',
        wrong && shaking && 'animate-shake',
      )}
      style={{
        marginLeft: offset,
        backgroundColor:
          correct ? 'rgba(62,222,177,0.12)' :
          wrong   ? 'rgba(255,180,171,0.10)' :
          reveal  ? 'rgba(255,211,53,0.06)'  :
          '#1a0b2e',
        borderColor:
          correct ? '#3edeb1' :
          wrong   ? '#ffb4ab' :
          reveal  ? '#ffd335' :
          'rgba(255,211,53,0.4)',
        boxShadow:
          correct ? '0 0 22px rgba(62,222,177,0.45)' :
          wrong   ? '0 0 22px rgba(255,180,171,0.40)' :
          reveal  ? '0 0 16px rgba(255,211,53,0.30)'  :
          '0 0 14px rgba(255,211,53,0.14)',
        transform: correct ? 'scale(1.07)' : undefined,
        animationName: 'approach',
        animationDuration: `${animDuration}s`,
        animationTimingFunction: 'linear',
        animationFillMode: 'forwards',
        animationPlayState: idle ? 'running' : 'paused',
        opacity: hidden ? 0 : undefined,
        pointerEvents: hidden ? 'none' : undefined,
      }}
    >
      {/* Glow ring burst on correct answer */}
      {correct && (
        <div
          className="absolute inset-0 rounded-lg pointer-events-none animate-glow-ring-burst"
        />
      )}
      {emoji && (
        <span
          className="material-symbols-outlined mb-2 select-none"
          style={{ fontSize: '2rem', fontVariationSettings: "'FILL' 1", lineHeight: 1 }}
          aria-hidden="true"
        >
          {emoji}
        </span>
      )}
      <span
        className="font-manrope font-bold text-sm leading-tight text-center select-none px-2"
        style={{
          color:
            correct ? '#3edeb1' :
            wrong   ? '#ffb4ab' :
            reveal  ? '#ffd335' :
            '#e6e2d9',
        }}
      >
        {text}
      </span>
    </button>
  )
}

// ── Question wave — remounts on every new question via key={questionKey} ──────

interface QuestionWaveProps {
  q: Question
  correctChoiceIdx: number
  phase: Phase
  tappedIdx: number | null
  handleTap: (i: number) => void
  animDuration: number
}

function QuestionWave({ q, correctChoiceIdx, phase, tappedIdx, handleTap, animDuration }: QuestionWaveProps) {
  const n = q.choices.length
  const [shuffledOrder] = useState<number[]>(() => shuffle(Array.from({ length: n }, (_, i) => i)))
  const offsets = laneOffsets(n)

  function getCardState(choiceIdx: number): CardState {
    if (phase === 'won' || phase === 'lost') return 'hidden'
    if (phase === 'playing' && tappedIdx === null) return 'idle'
    if (phase === 'wrong' && tappedIdx === null) return 'hidden'
    if (tappedIdx === choiceIdx) return phase === 'correct' ? 'correct' : 'wrong'
    if (phase === 'wrong' && tappedIdx !== null && choiceIdx === correctChoiceIdx) return 'reveal'
    return 'hidden'
  }

  const shaking = phase === 'wrong' && tappedIdx !== null

  return (
    <div className="absolute inset-0 z-10 flex justify-center items-center">
      {shuffledOrder.map((choiceIdx, lane) => (
        <TargetCard
          key={choiceIdx}
          text={q.choices[choiceIdx]}
          emoji={q.choice_emojis?.[choiceIdx]}
          offset={offsets[lane]}
          cardState={getCardState(choiceIdx)}
          onTap={() => handleTap(choiceIdx)}
          animDuration={animDuration}
          shaking={shaking && tappedIdx === choiceIdx}
        />
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CorrectChoiceShooter({ questions, bossConfig, onGameEnd, onBackToMap }: GameTemplateProps) {
  const {
    q,
    hearts,
    streak,
    correctCount,
    phase,
    tappedIdx,
    showFlash,
    progress,
    questionKey,
    xpEarned,
    handleTap,
    restart,
  } = useGameEngine(questions, bossConfig, onGameEnd)

  const correctChoiceIdx = q.choices.indexOf(q.correct_answer)
  const animDuration = bossConfig.secondsPerQuestion + 1.2

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden zellige-overlay"
      style={{ background: '#14140f' }}
    >
      {/* Result flash tint */}
      {showFlash && (
        <div
          className="absolute inset-0 z-40 flash-overlay"
          style={{
            background: showFlash === 'correct'
              ? 'rgba(62,222,177,0.08)'
              : 'rgba(255,90,90,0.12)',
          }}
        />
      )}

      {/* ── HUD ─────────────────────────────────────────────────────────── */}
      <header
        className="z-30 grid grid-cols-3 items-center px-5 py-3 border-b shrink-0"
        style={{
          background: 'rgba(20,20,15,0.88)',
          backdropFilter: 'blur(6px)',
          borderColor: 'rgba(255,211,53,0.15)',
        }}
      >
        {/* Streak */}
        <div
          className="font-mono-hud font-medium text-sm tracking-widest flex items-center gap-1.5 select-none shrink-0"
          style={{ color: '#ffd335' }}
        >
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '1rem', fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          <span>x{streak}</span>
        </div>

        {/* Prompt — bounded center column, wraps instead of overflowing */}
        <div className="flex flex-col items-center min-w-0 px-2">
          <span
            className="font-manrope font-bold text-[15px] tracking-[0.01em] text-center w-full select-none leading-tight"
            style={{ color: '#e6e2d9' }}
          >
            {q.prompt}
          </span>
          <div className="zellige-divider w-12 mt-1" />
        </div>

        {/* Hearts */}
        <div className="flex items-center justify-end gap-1" aria-label={`${hearts} hearts remaining`}>
          {Array.from({ length: bossConfig.hearts }, (_, i) => (
            <HeartIcon key={i} filled={i < hearts} />
          ))}
        </div>
      </header>

      {/* ── Game canvas ─────────────────────────────────────────────────── */}
      <main
        className="relative flex-grow overflow-hidden"
        style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
      >
        <div className="lane-floor absolute inset-x-0 bottom-0 h-2/3 z-0" />


        <QuestionWave
          key={questionKey}
          q={q}
          correctChoiceIdx={correctChoiceIdx}
          phase={phase}
          tappedIdx={tappedIdx}
          handleTap={handleTap}
          animDuration={animDuration}
        />
      </main>

      {/* ── Progress footer ──────────────────────────────────────────────── */}
      <footer
        className="relative z-30 px-5 py-3 shrink-0 border-t"
        style={{ background: '#36352f', borderColor: 'rgba(255,211,53,0.10)' }}
      >
        <div
          className="font-mono-hud text-xs flex justify-between mb-2 select-none"
          style={{ color: '#cbc4ce' }}
        >
          <span>Quest Progress</span>
          <span style={{ color: '#ffd335' }}>{Math.round(progress * 100)}%</span>
        </div>

        <div className="h-2 w-full overflow-hidden" style={{ background: '#4a454d', borderRadius: '1px' }}>
          <div
            className="h-full shimmer-bar transition-all duration-500 ease-out"
            style={{
              width:     `${progress * 100}%`,
              background: '#ffd335',
              boxShadow: '0 0 6px rgba(255,211,53,0.4)',
            }}
          />
        </div>
      </footer>

      {/* ── Win / lose overlay ───────────────────────────────────────────── */}
      {(phase === 'won' || phase === 'lost') && (
        <ResultOverlay
          phase={phase}
          correctCount={correctCount}
          totalQuestions={questions.length}
          heartsLeft={hearts}
          maxHearts={bossConfig.hearts}
          xp={xpEarned}
          onRestart={restart}
          onBackToMap={onBackToMap ?? (() => window.history.back())}
        />
      )}
    </div>
  )
}
