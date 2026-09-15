'use client'

import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import type { GameTemplateProps } from '@/lib/game-types'
import { useGameEngine } from './useGameEngine'
import { HeartIcon, ResultOverlay } from './GameShared'
import BossSprite from './BossSprite'

// ── Answer state ──────────────────────────────────────────────────────────────

type AnswerState = 'idle' | 'correct' | 'wrong' | 'reveal'

// ── Main component ────────────────────────────────────────────────────────────

export default function SpeedQuiz({ questions, bossConfig, onGameEnd, onBackToMap }: GameTemplateProps) {
  const {
    q,
    hearts,
    correctCount,
    phase,
    tappedIdx,
    showFlash,
    timerProgress,
    progress,
    questionKey,
    xpEarned,
    handleTap,
    restart,
  } = useGameEngine(questions, bossConfig, onGameEnd)

  const [showHit,     setShowHit]     = useState(false)
  const [bossDamaged, setBossDamaged] = useState(false)

  useEffect(() => {
    if (phase !== 'correct') return
    setShowHit(true)
    setBossDamaged(true)
    const t1 = setTimeout(() => setShowHit(false), 600)
    const t2 = setTimeout(() => setBossDamaged(false), 350)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      setShowHit(false)
      setBossDamaged(false)
    }
  }, [phase])

  const bossCurrentHp = Math.max(0, Math.round(1000 * (1 - progress)))
  const bossHpPct     = bossCurrentHp / 10  // → percentage string (0–100)
  const bossLowHp     = bossHpPct < 25
  const timerColor    = timerProgress > 0.5 ? '#3edeb1' : timerProgress > 0.25 ? '#ffd335' : '#ffb4ab'
  const timerDanger   = timerProgress <= 0.25 && phase === 'playing'

  function getAnswerState(choiceIdx: number): AnswerState {
    if (phase === 'playing') return 'idle'
    const isThisCorrect = q.choices[choiceIdx] === q.correct_answer
    const wasTapped     = tappedIdx === choiceIdx
    if (wasTapped && isThisCorrect)  return 'correct'
    if (wasTapped && !isThisCorrect) return 'wrong'
    if (!wasTapped && isThisCorrect) return 'reveal'
    return 'idle'
  }

  function renderSentence(sentence: string) {
    const parts = sentence.split('___')
    return (
      <>
        {parts[0]}
        <span
          className="inline-block mx-1 border-b-2"
          style={{ width: '2rem', borderColor: '#ffd335' }}
        />
        {parts[1]}
      </>
    )
  }

  const bossName   = bossConfig.bossName   ?? 'Boss'
  const playerLevel = bossConfig.playerLevel ?? 1

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden zellige-overlay"
      style={{ background: '#1a0b2e' }}
    >
      {/* Result flash tint */}
      {showFlash && (
        <div
          className="absolute inset-0 z-40 flash-overlay pointer-events-none"
          style={{
            background: showFlash === 'correct'
              ? 'rgba(62,222,177,0.08)'
              : 'rgba(255,90,90,0.12)',
          }}
        />
      )}

      {/* ── HUD ─────────────────────────────────────────────────────────── */}
      <header
        className="relative z-30 flex items-center justify-between px-5 h-16 border-b shrink-0"
        style={{
          background: '#14140f',
          borderColor: 'rgba(255,211,53,0.15)',
        }}
      >
        {/* Level */}
        <div
          className="font-mono-hud font-medium text-sm tracking-widest flex items-center gap-1.5 select-none shrink-0"
          style={{ color: '#ffd335' }}
        >
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '1rem', fontVariationSettings: "'FILL' 1" }}>star</span>
          <span>Lvl {playerLevel}</span>
        </div>

        {/* Timer bar */}
        <div className="flex-1 px-4 min-w-0">
          <div
            className="h-2 w-full overflow-hidden"
            style={{
              background:  '#36352f',
              boxShadow:   timerDanger ? '0 0 8px rgba(255,90,90,0.3)' : 'none',
              transition:  'box-shadow 0.3s',
            }}
          >
            <div
              className={timerDanger ? 'timer-danger h-full' : 'h-full'}
              style={{
                background: timerColor,
                width: `${timerProgress * 100}%`,
                transition: 'width 80ms linear, background 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Hearts */}
        <div
          className="flex items-center gap-1 shrink-0"
          aria-label={`${hearts} hearts remaining`}
        >
          {Array.from({ length: bossConfig.hearts }, (_, i) => (
            <HeartIcon key={i} filled={i < hearts} />
          ))}
        </div>
      </header>

      {/* ── Boss section ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center px-5 pt-4 min-h-0">
        {/* Boss HP bar */}
        <div className="w-full mb-4">
          <div className="flex justify-between items-end mb-1">
            <span
              className="font-mono-hud text-xs uppercase tracking-widest select-none"
              style={{ color: '#ffb4ab' }}
            >
              {bossName}
            </span>
            <span
              className="font-mono-hud text-xs select-none"
              style={{ color: '#ffb4ab' }}
            >
              HP: {bossCurrentHp}/1000
            </span>
          </div>
          <div
            className={`h-4 w-full overflow-hidden border relative ${bossLowHp ? 'shimmer-bar' : ''}`}
            style={{
              background:  '#36352f',
              borderColor: bossLowHp ? 'rgba(255,90,90,0.55)' : 'rgba(255,180,171,0.3)',
              boxShadow:   bossLowHp ? '0 0 18px rgba(255,90,90,0.35)' : '0 0 10px rgba(255,180,171,0.2)',
              transition:  'border-color 0.4s, box-shadow 0.4s',
            }}
          >
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                background: bossLowHp
                  ? 'linear-gradient(90deg, #93000a 0%, #ffb4ab 50%, #93000a 100%)'
                  : '#ffb4ab',
                backgroundSize: bossLowHp ? '200% 100%' : undefined,
                width: `${bossHpPct}%`,
                boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)',
              }}
            />
          </div>
        </div>

        {/* Boss character */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden w-full">
          <div
            className={clsx(bossDamaged && 'animate-boss-shake')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
          >
            <BossSprite
              hit={bossDamaged}
              lowHp={bossLowHp}
              floating={!bossDamaged}
            />
          </div>

          {/* Big centred hit number */}
          {showHit && (
            <div
              key={String(showHit)}
              className="absolute left-1/2 top-1/4 font-caslon font-bold select-none pointer-events-none animate-hit-number"
              style={{
                fontSize:   '3.5rem',
                lineHeight: 1,
                color:      '#ff4444',
                textShadow: '0 0 24px rgba(255,40,40,0.9), 0 0 48px rgba(255,0,0,0.5)',
                transform:  'translateX(-50%)',
              }}
            >
              -100
            </div>
          )}
        </div>
      </div>

      {/* ── Question panel ───────────────────────────────────────────────── */}
      <div
        className="shrink-0 rounded-t-lg border-t px-5 pt-5 pb-6"
        style={{
          background: 'rgba(26,11,46,0.85)',
          backdropFilter: 'blur(8px)',
          borderColor: 'rgba(255,211,53,0.15)',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
        }}
      >
        {/* Prompt */}
        <div className="mb-4 text-center">
          <h2
            className="font-caslon font-bold text-center mb-2 select-none"
            style={{ color: '#e6e2d9', fontSize: '1.05rem', lineHeight: '1.4' }}
          >
            {q.prompt}
          </h2>

          {q.sentence && (
            <p
              className="font-manrope text-lg inline-block max-w-full px-4 py-2 rounded-lg border select-none"
              style={{
                color: '#ffd335',
                background: 'rgba(54,53,47,0.5)',
                borderColor: 'rgba(255,211,53,0.1)',
                boxShadow: 'inset 0 0 10px rgba(255,211,53,0.2)',
              }}
            >
              {renderSentence(q.sentence)}
            </p>
          )}
        </div>

        {/* 2×2 answer grid — keyed so animate-shake restarts each question */}
        <div className="grid grid-cols-2 gap-3" key={questionKey}>
          {q.choices.map((choice, i) => {
            const state   = getAnswerState(i)
            const shaking = state === 'wrong'
            return (
              <button
                key={i}
                onClick={phase === 'playing' ? () => handleTap(i) : undefined}
                disabled={phase !== 'playing'}
                className={clsx(
                  'relative py-4 px-3 rounded-lg border font-manrope font-bold text-center break-words',
                  'select-none overflow-hidden',
                  shaking && 'animate-shake',
                )}
                style={{
                  background:
                    state === 'correct' ? 'rgba(62,222,177,0.25)'  :
                    state === 'wrong'   ? 'rgba(255,60,60,0.28)'   :
                    state === 'reveal'  ? 'rgba(255,211,53,0.18)'  :
                    '#1a0b2e',
                  borderColor:
                    state === 'correct' ? '#3edeb1'               :
                    state === 'wrong'   ? '#ff6060'               :
                    state === 'reveal'  ? '#ffd335'               :
                    'rgba(255,211,53,0.3)',
                  borderWidth: state !== 'idle' ? '2px' : '1px',
                  color:
                    state === 'correct' ? '#3edeb1' :
                    state === 'wrong'   ? '#ff9090' :
                    state === 'reveal'  ? '#ffd335' :
                    '#e6e2d9',
                  boxShadow:
                    state === 'correct' ? '0 0 28px rgba(62,222,177,0.55), inset 0 0 18px rgba(62,222,177,0.15)'  :
                    state === 'wrong'   ? '0 0 28px rgba(255,60,60,0.45),  inset 0 0 18px rgba(255,60,60,0.12)'   :
                    state === 'reveal'  ? '0 0 20px rgba(255,211,53,0.4),  inset 0 0 12px rgba(255,211,53,0.1)'   :
                    'inset 0 0 10px rgba(255,211,53,0.2)',
                  transform:   state === 'correct' ? 'scale(1.05)' : undefined,
                  transition:  'background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.15s',
                }}
              >
                {/* State badge — top-right corner */}
                {state === 'correct' && (
                  <span
                    className="absolute top-1.5 right-1.5 material-symbols-outlined"
                    style={{ fontSize: '1.1rem', color: '#3edeb1', fontVariationSettings: "'FILL' 1", lineHeight: 1 }}
                    aria-hidden="true"
                  >check_circle</span>
                )}
                {state === 'wrong' && (
                  <span
                    className="absolute top-1.5 right-1.5 material-symbols-outlined"
                    style={{ fontSize: '1.1rem', color: '#ff6060', fontVariationSettings: "'FILL' 1", lineHeight: 1 }}
                    aria-hidden="true"
                  >cancel</span>
                )}
                {state === 'reveal' && (
                  <span
                    className="absolute top-1.5 right-1.5 material-symbols-outlined"
                    style={{ fontSize: '1.1rem', color: '#ffd335', fontVariationSettings: "'FILL' 1", lineHeight: 1 }}
                    aria-hidden="true"
                  >lightbulb</span>
                )}
                {choice}
              </button>
            )
          })}
        </div>

        {/* Zellige divider */}
        <div className="flex items-center justify-center mt-5 opacity-50">
          <div className="h-px w-16" style={{ background: 'rgba(255,211,53,0.3)' }} />
          <div
            className="w-2 h-2 mx-2 rotate-45 border"
            style={{ borderColor: 'rgba(255,211,53,0.5)' }}
          />
          <div className="h-px w-16" style={{ background: 'rgba(255,211,53,0.3)' }} />
        </div>
      </div>

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
