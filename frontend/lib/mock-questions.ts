import type { Question, BossConfig } from './game-types'

// ── Template A — Correct-choice shooter ──────────────────────────────────────

export const MOCK_BOSS_CONFIG: BossConfig = {
  hearts: 3,
  secondsPerQuestion: 6,
  floors: 1,
}

export const MOCK_QUESTIONS: Question[] = [
  {
    prompt: 'Tap the fruit',
    choices: ['Apple', 'Chair', 'Book'],
    correct_answer: 'Apple',
    choice_emojis: ['nutrition', 'chair', 'menu_book'],
    template_tag: 'shooter',
  },
  {
    prompt: "Which word means 'big'?",
    choices: ['Small', 'Large', 'Quick'],
    correct_answer: 'Large',
    choice_emojis: ['bug_report', 'pets', 'bolt'],
    template_tag: 'shooter',
  },
  {
    prompt: 'Tap the animal',
    choices: ['Hammer', 'Lion', 'Pencil'],
    correct_answer: 'Lion',
    choice_emojis: ['hardware', 'pets', 'edit'],
    template_tag: 'shooter',
  },
  {
    prompt: "Which word means 'fast'?",
    choices: ['Slow', 'Warm', 'Rapid'],
    correct_answer: 'Rapid',
    choice_emojis: ['pets', 'wb_sunny', 'bolt'],
    template_tag: 'shooter',
  },
  {
    prompt: 'Tap the color',
    choices: ['Running', 'Blue', 'Eating'],
    correct_answer: 'Blue',
    choice_emojis: ['directions_run', 'favorite', 'restaurant'],
    template_tag: 'shooter',
  },
  {
    prompt: "Which word means 'home'?",
    choices: ['Forest', 'House', 'River'],
    correct_answer: 'House',
    choice_emojis: ['park', 'home', 'waves'],
    template_tag: 'shooter',
  },
  {
    prompt: 'Tap the vegetable',
    choices: ['Laptop', 'Door', 'Carrot'],
    correct_answer: 'Carrot',
    choice_emojis: ['laptop', 'door_back', 'eco'],
    template_tag: 'shooter',
  },
  {
    prompt: "Which word means 'friend'?",
    choices: ['Enemy', 'Companion', 'Stranger'],
    correct_answer: 'Companion',
    choice_emojis: ['sentiment_very_dissatisfied', 'handshake', 'face'],
    template_tag: 'shooter',
  },
  {
    prompt: 'Tap the school item',
    choices: ['Spoon', 'Pencil', 'Ocean'],
    correct_answer: 'Pencil',
    choice_emojis: ['restaurant', 'edit', 'waves'],
    template_tag: 'shooter',
  },
  {
    prompt: "Which word means 'beautiful'?",
    choices: ['Ugly', 'Dark', 'Lovely'],
    correct_answer: 'Lovely',
    choice_emojis: ['sentiment_dissatisfied', 'dark_mode', 'local_florist'],
    template_tag: 'shooter',
  },
]

// ── Template E — Speed quiz (boss battle) ─────────────────────────────────────

export const MOCK_SPEED_QUIZ_BOSS_CONFIG: BossConfig = {
  hearts: 3,
  secondsPerQuestion: 8,
  floors: 1,
  bossName: 'Grammar Golem',
  playerLevel: 5,
}

export const MOCK_SPEED_QUIZ_QUESTIONS: Question[] = [
  {
    prompt: 'Choose the correct preposition:',
    sentence: 'I am ___ the bus.',
    choices: ['in', 'on', 'at', 'by'],
    correct_answer: 'on',
    template_tag: 'speed_quiz',
  },
  {
    prompt: 'Choose the correct verb form:',
    sentence: 'She ___ to school every day.',
    choices: ['go', 'goes', 'going', 'gone'],
    correct_answer: 'goes',
    template_tag: 'speed_quiz',
  },
  {
    prompt: 'Choose the correct article:',
    sentence: 'He wants ___ apple.',
    choices: ['a', 'an', 'the', '—'],
    correct_answer: 'an',
    template_tag: 'speed_quiz',
  },
  {
    prompt: 'Choose the correct past tense:',
    sentence: 'We ___ the match yesterday.',
    choices: ['win', 'wins', 'won', 'winning'],
    correct_answer: 'won',
    template_tag: 'speed_quiz',
  },
  {
    prompt: 'Choose the correct modal verb:',
    sentence: 'You ___ wear a seatbelt. It\'s the law.',
    choices: ['can', 'must', 'might', 'could'],
    correct_answer: 'must',
    template_tag: 'speed_quiz',
  },
  {
    prompt: 'Choose the correct comparative:',
    sentence: 'This book is ___ than that one.',
    choices: ['good', 'gooder', 'better', 'best'],
    correct_answer: 'better',
    template_tag: 'speed_quiz',
  },
  {
    prompt: 'Choose the correct preposition:',
    sentence: 'The meeting is ___ Monday morning.',
    choices: ['in', 'on', 'at', 'during'],
    correct_answer: 'on',
    template_tag: 'speed_quiz',
  },
  {
    prompt: 'Choose the correct question word:',
    sentence: '___ does she live?',
    choices: ['What', 'Who', 'Where', 'When'],
    correct_answer: 'Where',
    template_tag: 'speed_quiz',
  },
  {
    prompt: 'Choose the correct conditional:',
    sentence: 'If it rains, we ___ stay inside.',
    choices: ['would', 'will', 'shall', 'might'],
    correct_answer: 'will',
    template_tag: 'speed_quiz',
  },
  {
    prompt: 'Choose the correct opposite:',
    sentence: 'The opposite of "hot" is ___.',
    choices: ['warm', 'cold', 'cool', 'mild'],
    correct_answer: 'cold',
    template_tag: 'speed_quiz',
  },
]
