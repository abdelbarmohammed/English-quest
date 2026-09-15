'use client'

import { FormEvent, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import { saveSession } from '@/lib/session'
import type { JoinResponse } from '@/lib/types'

export default function JoinPage() {
  const router  = useRouter()
  const [classCode, setClassCode] = useState('')
  const [nickname,  setNickname]  = useState('')
  const [pin,       setPin]       = useState(['', '', '', ''])
  const [error,     setError]     = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)

  // Refs for PIN digit inputs so we can auto-advance / back-advance focus
  const p0 = useRef<HTMLInputElement>(null)
  const p1 = useRef<HTMLInputElement>(null)
  const p2 = useRef<HTMLInputElement>(null)
  const p3 = useRef<HTMLInputElement>(null)
  const pinRefs = [p0, p1, p2, p3]

  function onPinChange(idx: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const next = [...pin]
    next[idx] = value.slice(-1)
    setPin(next)
    if (value && idx < 3) pinRefs[idx + 1].current?.focus()
  }

  function onPinKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      pinRefs[idx - 1].current?.focus()
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const fullPin = pin.join('')
    if (fullPin.length < 4) { setError('Enter all 4 PIN digits.'); return }
    if (!classCode.trim()) { setError('Enter your class code.'); return }
    if (!nickname.trim())  { setError('Enter your nickname.'); return }

    setError(null)
    setLoading(true)
    try {
      const res = await api.post<JoinResponse>('/classes/join/', {
        join_code: classCode.trim().toUpperCase(),
        nickname:  nickname.trim(),
        pin:       fullPin,
      })
      saveSession(res)
      router.push('/home')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Shared input style ────────────────────────────────────────────────────
  const inputBase: React.CSSProperties = {
    background:   'transparent',
    border:       'none',
    borderBottom: '2px solid #e6e2d9',
    color:        '#e6e2d9',
    padding:      '12px 0',
    fontFamily:   'var(--nf-mono-hud), "Courier New", monospace',
    borderRadius: 0,
    width:        '100%',
    outline:      'none',
    fontSize:     '1rem',
    transition:   'border-color .25s, box-shadow .25s',
  }

  return (
    <div
      className="max-w-sm mx-auto h-full flex flex-col overflow-hidden"
      style={{
        background: '#1a0b2e',
        backgroundImage:
          'radial-gradient(circle at 50% -20%, rgba(255,211,53,0.15) 0%, transparent 50%),' +
          'radial-gradient(circle at 100% 100%, rgba(62,222,177,0.05) 0%, transparent 50%)',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="shrink-0 flex justify-between items-center px-5 h-16 border-b"
        style={{
          background:     'rgba(20,20,15,0.8)',
          backdropFilter: 'blur(6px)',
          borderColor:    'rgba(255,211,53,0.15)',
          boxShadow:      'inset 0 0 20px rgba(255,211,53,0.05)',
        }}
      >
        <span className="material-symbols-outlined" style={{ color: '#ffd335', fontSize: '1.25rem', fontVariationSettings: "'FILL' 1" }}>bolt</span>
        <h1
          className="font-caslon font-bold tracking-tight select-none"
          style={{ color: '#ffd335', fontSize: '1.25rem' }}
        >
          English Quest
        </h1>
        <span className="material-symbols-outlined" style={{ opacity: 0, fontSize: '1.25rem' }}>favorite</span>
      </header>

      {/* ── Scrollable body ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-5 py-8 flex flex-col items-center">

        {/* Key icon */}
        <div className="relative mb-8 animate-realm-entrance" style={{ animationDelay: '0.05s' }}>
          <div
            className="absolute inset-0 rounded-full blur-xl"
            style={{ background: 'rgba(255,211,53,0.25)' }}
          />
          <div
            className="relative z-10 w-16 h-16 rounded-full border flex items-center justify-center"
            style={{
              background:  'rgba(28,28,22,0.95)',
              borderColor: 'rgba(255,211,53,0.4)',
              boxShadow:   'inset 0 0 18px rgba(255,211,53,0.15), 0 0 24px rgba(255,211,53,0.1)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.75rem', color: '#ffd335', fontVariationSettings: "'FILL' 1" }}>key</span>
          </div>
        </div>

        {/* Card */}
        <div
          className="w-full rounded-lg p-6 relative overflow-hidden animate-realm-entrance"
          style={{
            background:     'rgba(28,28,22,0.95)',
            border:         '1px solid rgba(255,211,53,0.15)',
            boxShadow:      'inset 0 0 20px rgba(255,211,53,0.05)',
            animationDelay: '0.15s',
          }}
        >
          {/* Zellige texture overlay */}
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              opacity:         0.04,
              backgroundImage:
                'linear-gradient(45deg,transparent 48%,rgba(255,211,53,1) 49%,rgba(255,211,53,1) 51%,transparent 52%),' +
                'linear-gradient(-45deg,transparent 48%,rgba(255,211,53,1) 49%,rgba(255,211,53,1) 51%,transparent 52%)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative z-10 text-center mb-8">
            <h2
              className="font-caslon font-bold mb-2 select-none"
              style={{ color: '#e6e2d9', fontSize: '1.5rem', lineHeight: '2rem' }}
            >
              Who are you, hero?
            </h2>
            <p className="font-manrope text-sm select-none" style={{ color: '#cbc4ce' }}>
              Present your credentials to enter the realm.
            </p>
          </div>

          <form className="relative z-10 flex flex-col gap-6" onSubmit={handleSubmit}>

            {/* Class Code */}
            <div className="flex flex-col gap-1">
              <label
                className="font-mono-hud text-xs tracking-widest flex items-center gap-1.5 select-none"
                style={{ color: '#ffd335' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', fontVariationSettings: "'FILL' 1" }}>key</span> Class Code
              </label>
              <input
                type="text"
                autoComplete="off"
                placeholder="QUEST-123"
                value={classCode}
                onChange={e => setClassCode(e.target.value.toUpperCase())}
                style={{ ...inputBase, letterSpacing: '0.1em', textTransform: 'uppercase' }}
                onFocus={e => { e.target.style.borderBottomColor = '#ffd335'; e.target.style.boxShadow = '0 4px 12px -8px rgba(255,211,53,0.5)' }}
                onBlur={e =>  { e.target.style.borderBottomColor = '#e6e2d9'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Nickname */}
            <div className="flex flex-col gap-1">
              <label
                className="font-mono-hud text-xs tracking-widest flex items-center gap-1.5 select-none"
                style={{ color: '#ffd335' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', fontVariationSettings: "'FILL' 1" }}>label</span> Nickname
              </label>
              <input
                type="text"
                autoComplete="off"
                placeholder="Your chosen name…"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                style={inputBase}
                onFocus={e => { e.target.style.borderBottomColor = '#ffd335'; e.target.style.boxShadow = '0 4px 12px -8px rgba(255,211,53,0.5)' }}
                onBlur={e =>  { e.target.style.borderBottomColor = '#e6e2d9'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* PIN — 4 individual digit inputs */}
            <div className="flex flex-col gap-1">
              <label
                className="font-mono-hud text-xs tracking-widest flex items-center gap-1.5 select-none"
                style={{ color: '#ffd335' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', fontVariationSettings: "'FILL' 1" }}>lock</span> 4-Digit PIN
              </label>
              <div className="flex gap-3 justify-between">
                {pinRefs.map((ref, i) => (
                  <input
                    key={i}
                    ref={ref}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    pattern="[0-9]"
                    value={pin[i]}
                    onChange={e => onPinChange(i, e.target.value)}
                    onKeyDown={e => onPinKeyDown(i, e)}
                    style={{
                      ...inputBase,
                      width:       '3rem',
                      textAlign:   'center',
                      fontSize:    '1.5rem',
                      padding:     '8px 0',
                    }}
                    onFocus={e => { e.target.style.borderBottomColor = '#ffd335'; e.target.style.boxShadow = '0 4px 12px -8px rgba(255,211,53,0.5)' }}
                    onBlur={e =>  { e.target.style.borderBottomColor = pin[i] ? '#ffd335' : '#e6e2d9'; e.target.style.boxShadow = 'none' }}
                  />
                ))}
              </div>
            </div>

            {/* Zellige divider */}
            <div className="relative my-2" style={{ height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,211,53,0.5),transparent)' }}>
              <div
                className="absolute top-1/2 left-1/2 w-2 h-2 rotate-45 border"
                style={{
                  transform:   'translate(-50%,-50%) rotate(45deg)',
                  background:  '#1c1c16',
                  borderColor: 'rgba(255,211,53,0.5)',
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="font-manrope text-sm text-center select-none" style={{ color: '#ffb4ab' }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded font-manrope font-bold flex justify-center items-center gap-2 select-none active:scale-95"
              style={{
                background:    loading ? 'rgba(255,211,53,0.6)' : '#ffd335',
                color:         '#3c2f00',
                boxShadow:     'inset 0 0 15px rgba(255,255,255,0.5), 0 4px 14px rgba(255,211,53,0.3)',
                letterSpacing: '0.01em',
                transition:    'transform .15s, box-shadow .15s',
              }}
            >
              {loading ? 'Entering…' : 'Enter the Realm'}
              {!loading && <span>→</span>}
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => router.push('/game')}
          className="mt-6 font-mono-hud text-xs tracking-widest select-none"
          style={{ color: '#cbc4ce' }}
        >
          Return to Portal
        </button>
      </main>
    </div>
  )
}
