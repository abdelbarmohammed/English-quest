// ── API response types — mirrors backend serializers exactly ─────────────────

export interface JoinResponse {
  device_token: string
  student_id:   number
  nickname:     string
  class_name:   string
  subject_id:   number
}

/** Boss config as returned by the API (BossConfigSerializer). */
export interface ApiBossConfig {
  id:                   number
  name:                 string
  template:             string   // 'shooter' | 'speed_quiz' | …
  floors:               number
  hearts:               number
  seconds_per_question: number
}

/** Single question as returned by QuestionSerializer. */
export interface ApiQuestion {
  id:            number
  prompt:        string
  sentence:      string          // blank string when unused
  audio_prompt:  string          // blank string when unused
  correct_answer: string
  choices:       string[]
  choice_emojis: string[]        // empty array when unused
  tip:           string
  difficulty:    number
  template_tag:  string          // 'shooter' | 'speed_quiz' | …
}

/** Exercise set as returned by ExerciseSetSerializer (with nested questions). */
export interface ApiExerciseSet {
  id:        number
  title:     string
  kind:      string              // 'mcq' | 'fill' | 'speak' | 'write'
  questions: ApiQuestion[]
}

export interface UnitProgressData {
  lessons_completed:       number[]
  lessons_completed_count: number
  total_lessons:           number
  boss_defeated:           boolean
  golden_boss_defeated:    boolean
  total_xp:                number
}

export interface ApiUnit {
  id:                 number
  title:              string
  order:              number
  is_free:            boolean
  unlock_requires_id: number | null
  is_locked:          boolean
  boss:               ApiBossConfig | null
  progress:           UnitProgressData
}

export interface StudentProgressResponse {
  student_id:   number
  nickname:     string
  school_class: { id: number; name: string; subject: { id: number; name: string } }
  units:        ApiUnit[]
}

export interface ApiLesson {
  id:         number
  order:      number
  title:      string
  body:       string
  audio_text: string
}

export interface LessonCompleteResponse {
  lesson_id:                number
  unit_id:                  number
  lessons_completed:        number[]
  lessons_completed_count:  number
  total_lessons:            number
  all_lessons_done:         boolean
}

/** One entry in GET /api/leaderboard/ — nickname only, never real_name. */
export interface LeaderboardEntry {
  rank:         number
  nickname:     string
  total_xp:     number
  boss_defeats: number
  is_me:        boolean
}
