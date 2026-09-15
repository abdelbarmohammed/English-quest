'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import { getSession, clearSession } from '@/lib/session'
import { logEvent } from '@/lib/events'
import type { ApiLesson, LessonCompleteResponse } from '@/lib/types'

export default function LessonPage() {
  const router   = useRouter()
  const params   = useParams()
  const unitId   = Number(params.unitId)
  const lessonId = Number(params.lessonId)

  const [lesson,     setLesson]     = useState<ApiLesson | null>(null)
  const [error,      setError]      = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)
  const [done,       setDone]       = useState(false)
  const [speaking,   setSpeaking]   = useState(false)
  const uttRef       = useRef<SpeechSynthesisUtterance | null>(null)
  const lessonStart  = useRef(Date.now())

  useEffect(() => {
    const session = getSession()
    if (!session) { router.replace('/join'); return }

    api.get<ApiLesson[]>(`/units/${unitId}/lessons/`)
      .then(lessons => {
        const found = lessons.find(l => l.id === lessonId)
        if (!found) { setError('Lesson not found.'); return }
        setLesson(found)
      })
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) {
          clearSession(); router.replace('/join')
        } else {
          setError(err instanceof ApiError ? err.message : 'Failed to load lesson.')
        }
      })

    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    }
  }, [router, unitId, lessonId])

  function toggleSpeech() {
    if (!lesson) return
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const text = lesson.audio_text || lesson.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const utt  = new SpeechSynthesisUtterance(text)
    utt.lang  = 'en-US'
    utt.rate  = 0.9
    utt.onend = () => setSpeaking(false)
    uttRef.current = utt
    window.speechSynthesis.speak(utt)
    setSpeaking(true)
  }

  async function markComplete() {
    if (completing || done) return
    const session = getSession()
    if (!session) { router.replace('/join'); return }
    setCompleting(true)
    try {
      const res = await api.post<LessonCompleteResponse>('/progress/lesson-complete/', {
        student_id: session.student_id,
        lesson_id:  lessonId,
      })
      const duration = Math.round((Date.now() - lessonStart.current) / 1000)
      logEvent('lesson_complete', { durationSeconds: duration })
      setDone(true)
      setTimeout(() => {
        if (res.all_lessons_done) {
          router.push(`/home/units/${unitId}`)
        } else {
          router.back()
        }
      }, 700)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save progress.')
      setCompleting(false)
    }
  }

  /* ── Loading ─────────────────────────────────────────────────────────────── */
  if (!lesson && !error) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: '#1a0b2e' }}>
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

  return (
    <div
      className="max-w-sm mx-auto h-full flex flex-col"
      style={{ background: '#1a0b2e' }}
    >
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header
        className="shrink-0 flex justify-between items-center px-5 h-16 border-b"
        style={{
          background:     'rgba(26,11,46,0.9)',
          backdropFilter: 'blur(6px)',
          borderColor:    'rgba(255,211,53,0.15)',
        }}
      >
        <button
          onClick={() => {
            window.speechSynthesis?.cancel()
            router.back()
          }}
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
          UNIT {unitId}
        </span>

        {/* Spacer */}
        <div style={{ width: '2.75rem' }} />
      </header>

      {/* ── Scrollable body ──────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto min-h-0 px-5 pb-28 flex flex-col gap-6">
        {/* Title */}
        <section className="mt-5">
          <h1
            className="font-caslon font-bold mb-1"
            style={{ color: '#ffd335', fontSize: '1.5rem', lineHeight: '2rem' }}
          >
            {lesson!.title}
          </h1>
          <p className="font-manrope text-sm" style={{ color: '#cbc4ce' }}>
            Read carefully before the quest.
          </p>
        </section>

        {/* Reading card */}
        <article
          className="rounded-lg p-5 relative overflow-hidden flex flex-col gap-4"
          style={{
            background: 'rgba(26,11,46,0.95)',
            border:     '1px solid rgba(255,211,53,0.18)',
            boxShadow:  'inset 0 0 30px rgba(255,211,53,0.06), 0 4px 24px rgba(0,0,0,0.4)',
          }}
        >
          {/* Zellige texture overlay */}
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              opacity:         0.03,
              backgroundImage:
                'linear-gradient(45deg,transparent 48%,rgba(255,211,53,1) 49%,rgba(255,211,53,1) 51%,transparent 52%),' +
                'linear-gradient(-45deg,transparent 48%,rgba(255,211,53,1) 49%,rgba(255,211,53,1) 51%,transparent 52%)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative z-10 flex flex-col gap-4">
            {/* Listen Along row */}
            <div
              className="flex justify-between items-center pb-3"
              style={{ borderBottom: '1px solid rgba(255,211,53,0.15)' }}
            >
              <span
                className="font-mono-hud text-xs"
                style={{ color: '#cbc4ce', letterSpacing: '0.05em' }}
              >
                LISTEN ALONG
              </span>
              <button
                onClick={toggleSpeech}
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{
                  background: speaking ? 'rgba(255,211,53,0.2)' : 'rgba(255,211,53,0.1)',
                  boxShadow:  'inset 0 0 12px rgba(255,211,53,0.2)',
                  color:      '#ffd335',
                  transition: 'background 0.2s',
                }}
                aria-label={speaking ? 'Stop narration' : 'Play narration'}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {speaking ? 'stop' : 'volume_up'}
                </span>
              </button>
            </div>

            {/* Lesson body — teacher-authored HTML */}
            <div
              className="font-manrope text-base leading-relaxed lesson-body overflow-x-auto"
              style={{ color: '#e6e2d9' }}
              dangerouslySetInnerHTML={{ __html: lesson!.body }}
            />
          </div>
        </article>
      </main>

      {/* ── Fixed bottom CTA ─────────────────────────────────────────────────── */}
      <div
        className="shrink-0 px-5 pt-3 pb-5"
        style={{
          background: 'linear-gradient(to top, #1a0b2e 80%, transparent)',
        }}
      >
        <button
          onClick={markComplete}
          disabled={completing || done}
          className="w-full h-14 rounded-lg font-manrope font-bold flex items-center justify-center gap-2"
          style={{
            background:  done       ? '#3edeb1'                  :
                         completing ? 'rgba(255,211,53,0.6)'     :
                         '#ffd335',
            color:       done ? '#003829' : '#3c2f00',
            boxShadow:   'inset 0 0 15px rgba(255,255,255,0.3), 0 4px 12px rgba(255,211,53,0.2)',
            transition:  'background 0.3s, color 0.3s',
            letterSpacing: '0.01em',
          }}
        >
          {done ? (
            <>
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: '1.3rem' }}
              >
                task_alt
              </span>
              Lesson Complete!
            </>
          ) : completing ? (
            'Saving…'
          ) : (
            <>
              Mark Complete
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: '1.3rem' }}
              >
                task_alt
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
