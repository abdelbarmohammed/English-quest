import type { ApiBossConfig, ApiQuestion } from './types'
import type { BossConfig, Question } from './game-types'

/**
 * Converts a backend ApiQuestion (snake_case, blank strings, empty arrays)
 * into the game engine's Question shape (camelCase, undefined for absent optionals).
 */
export function adaptQuestion(q: ApiQuestion): Question {
  return {
    id:            String(q.id),
    prompt:        q.prompt,
    sentence:      q.sentence      || undefined,
    choices:       q.choices,
    correct_answer: q.correct_answer,
    choice_emojis: q.choice_emojis?.length ? q.choice_emojis : undefined,
    audio_prompt:  q.audio_prompt  || undefined,
    template_tag:  q.template_tag  || undefined,
  }
}

/**
 * Converts a backend ApiBossConfig (snake_case field names, extra id/template)
 * into the game engine's BossConfig shape.
 */
export function adaptBossConfig(boss: ApiBossConfig): BossConfig {
  return {
    hearts:             boss.hearts,
    secondsPerQuestion: boss.seconds_per_question,
    floors:             boss.floors,
    bossName:           boss.name,
  }
}
