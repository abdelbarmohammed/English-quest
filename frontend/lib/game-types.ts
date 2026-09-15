export interface Question {
  id?: string
  prompt: string
  sentence?: string        // fill-in-the-blank sentence containing ___ placeholder
  choices: string[]
  correct_answer: string
  choice_emojis?: string[]
  audio_prompt?: string
  template_tag?: string
}

export interface BossConfig {
  hearts: number
  secondsPerQuestion: number
  floors: number
  bossName?: string        // displayed in boss HP bar (Template E)
  playerLevel?: number     // player's current level shown in HUD (Template E)
}

export interface GameResult {
  won:        boolean
  xpEarned:   number
  heartsLeft: number
}

export interface GameTemplateProps {
  questions:    Question[]
  bossConfig:   BossConfig
  skin:         string
  onGameEnd?:   (result: GameResult) => void
  onBackToMap?: () => void
}
