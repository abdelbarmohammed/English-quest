// Shared sub-components used by multiple game templates

export function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={filled ? '#ffb4ab' : 'none'}
      stroke="#ffb4ab"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

export interface ResultOverlayProps {
  phase: 'won' | 'lost'
  correctCount: number
  totalQuestions: number
  heartsLeft: number
  maxHearts: number
  xp: number
  onRestart: () => void
  onBackToMap: () => void
}

export function ResultOverlay({
  phase,
  correctCount,
  totalQuestions,
  heartsLeft,
  maxHearts,
  xp,
  onRestart,
  onBackToMap,
}: ResultOverlayProps) {
  const won = phase === 'won'
  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center zellige-overlay"
      style={{
        background: won ? 'rgba(26,11,46,0.97)' : 'rgba(6,2,4,0.97)',
        boxShadow: won
          ? 'inset 0 0 80px rgba(255,211,53,0.07), inset 0 0 160px rgba(211,190,235,0.04)'
          : 'inset 0 0 80px rgba(255,90,90,0.09)',
      }}
    >
      {/* Corner frame — victory only */}
      {won && (
        <>
          <div className="absolute top-6 left-6 w-10 h-10 pointer-events-none"
            style={{ borderTop: '2px solid rgba(255,211,53,0.4)', borderLeft: '2px solid rgba(255,211,53,0.4)' }} />
          <div className="absolute top-6 right-6 w-10 h-10 pointer-events-none"
            style={{ borderTop: '2px solid rgba(255,211,53,0.4)', borderRight: '2px solid rgba(255,211,53,0.4)' }} />
          <div className="absolute bottom-6 left-6 w-10 h-10 pointer-events-none"
            style={{ borderBottom: '2px solid rgba(255,211,53,0.4)', borderLeft: '2px solid rgba(255,211,53,0.4)' }} />
          <div className="absolute bottom-6 right-6 w-10 h-10 pointer-events-none"
            style={{ borderBottom: '2px solid rgba(255,211,53,0.4)', borderRight: '2px solid rgba(255,211,53,0.4)' }} />
        </>
      )}

      <h2
        className="font-caslon font-bold text-center leading-tight mb-1 select-none max-w-xs px-4 animate-victory-drop"
        style={{
          fontSize: '2.6rem',
          lineHeight: '1.15',
          color: won ? '#ffd335' : '#ffb4ab',
          letterSpacing: '-0.01em',
          textShadow: won
            ? '0 0 40px rgba(255,211,53,0.45)'
            : '0 0 40px rgba(255,90,90,0.45)',
        }}
      >
        {won ? <>Quest<br />Complete!</> : 'Defeated!'}
      </h2>

      <div className="zellige-divider w-28 my-5 animate-stats-up" />

      {won && (
        <div
          className="font-mono-hud font-medium mb-1 select-none animate-xp-slam"
          style={{
            fontSize: '2.8rem',
            color: '#ffd335',
            letterSpacing: '0.02em',
            textShadow: '0 0 24px rgba(255,211,53,0.55)',
          }}
        >
          +{xp} XP
        </div>
      )}

      <div className="animate-stats-up">
        <p className="font-manrope text-sm mb-1 select-none text-center" style={{ color: '#cbc4ce' }}>
          {correctCount}/{totalQuestions} correct
        </p>
        <p className="font-manrope text-sm mb-8 select-none text-center" style={{ color: '#cbc4ce' }}>
          {heartsLeft}/{maxHearts} hearts remaining
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 w-full px-8 animate-buttons-up">
        <button
          onClick={onRestart}
          className="font-manrope font-bold text-base tracking-wide w-full py-3 rounded select-none"
          style={{
            background:    won ? '#ffd335' : '#ffb4ab',
            color:         won ? '#3c2f00' : '#690005',
            letterSpacing: '0.01em',
            boxShadow: won
              ? 'inset 0 0 15px rgba(255,255,255,0.4), 0 4px 16px rgba(255,211,53,0.3)'
              : 'inset 0 0 15px rgba(255,255,255,0.2), 0 4px 16px rgba(255,90,90,0.25)',
            transition: 'transform 0.12s',
          }}
        >
          {won ? 'Play Again' : 'Try Again'}
        </button>

        <button
          onClick={onBackToMap}
          className="font-manrope text-sm w-full py-3 rounded select-none border"
          style={{
            background:  'transparent',
            borderColor: won ? 'rgba(255,211,53,0.35)' : 'rgba(255,180,171,0.35)',
            color:       won ? '#ffd335' : '#ffb4ab',
            transition:  'transform 0.12s',
          }}
        >
          ← Back to Map
        </button>
      </div>
    </div>
  )
}
