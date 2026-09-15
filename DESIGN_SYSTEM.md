# Design System

Source of truth for visual decisions: the Stitch export at
`design-reference/stitch_english_quest_gamified_pwa/` (one subfolder per screen —
see the folder→screen mapping in `CLAUDE.md`). This file documents the tokens and
screen inventory so Claude Code can build to spec without re-deriving design
decisions, but always check the matching subfolder for the actual colors/spacing/
component structure before building a screen.

## Tokens

Real values below, sourced from the Stitch-generated brand system at
`design-reference/stitch_english_quest_gamified_pwa/maghreb_quest/STITCH_BRAND_SYSTEM.md`
(renamed from its exported `CLAUDE.md` to avoid colliding with the project's root
`CLAUDE.md`). That file is the full source of truth for elevation, shape, and
component-level rules; this section summarizes what's needed day-to-day.

**Color**
- `--surface: #14140f`              near-black — base canvas/background
- `--primary-container: #1a0b2e`    deep indigo — card/panel surfaces
- `--primary: #d3beeb`              light lavender — primary text/icon on indigo
- `--secondary: #ffd335`            warm gold — XP, rewards, primary CTAs
- `--tertiary: #3edeb1`             teal-green — correct answers, level-up states
- `--error: #ffb4ab` / container `#93000a` — wrong answers, hearts, danger states
- `--on-surface: #e6e2d9`           warm off-white — body text

**Type**
- Display/headline: **Libre Caslon Text** (serif, weight 600–700) — quest titles,
  section headers. `display-hero` 40px for hero moments, `headline-lg` 32px
  (24px mobile) for section headers.
- Body: **Manrope** 16–18px, weight 400 — lesson text, question prompts.
- HUD/labels: **JetBrains Mono** 14px, weight 500, letter-spacing 0.05em — XP,
  timer, hearts count. Never used for body text.
- Buttons: Manrope, weight 700.

**Shape & elevation**
- Border radius: 4px default (soft/tiled, not rounded-pill except `full` for chips).
- Progress bars: flat ends (0px radius) — emphasizes linear quest progression.
- Depth via tonal layering + 1px gold-at-15%-opacity borders, not drop shadows;
  buttons get an inner-glow "illuminated from within" treatment instead.
- Zellige motif: thin 1px gold linework, low opacity, used as card borders and
  section dividers (small diamond motif at divider centers) — restrained, never
  a busy background.

**Spacing**
- 4px baseline grid. Card padding: 24px (`lg`). Mobile margin: 20px.
- Touch targets: minimum 44×44px.

## Screen inventory

1. **Home / Journey Map** — vertical zellige-bordered path of unit nodes. Current
   unit glowing gold; locked units greyed with a lock icon; completed units carry a
   checkmark badge. Nickname/avatar chip top-left, total XP top-right.
2. **Join Class** — class code, nickname, 4-digit PIN, single primary action.
3. **Lesson (Learn)** — calm reading mode: title, body text, read-aloud speaker icon,
   single "Mark complete" button. Minimal color, no HUD elements — deliberately
   distinct in feel from the game screens.
4. **Practice (exercise library)** — list/grid of exercise sets for the unit, best
   score shown per set, tap into an MCQ-style practice flow.

### Game templates (dungeon floors) — content-agnostic engines
Each is ONE reusable component. A floor is defined as `{template, question_set, skin}` —
never a bespoke build per floor.

- **Template A — Correct-choice shooter** (Vocabulary). Player advances through
  gates/targets, fires at the correct option to grow force; wrong answers shrink it.
  Boss defeated by a streak of correct answers. Flagship mechanic — build this first.
- **Template B — Two-lane runner** (Grammar). Endless-runner; player picks the
  grammatically correct lane to keep running; wrong lane costs a life.
- **Template C — Catch the sound** (Listening). Audio plays; player selects the
  option matching what they heard.
- **Template D — Defend the line** (Mixed/boss review). Waves approach; player fires
  the correct answer to stop them. Used for cross-unit review bosses.
- **Template E — Speed quiz with health bar** (Summative). Kahoot-style timed MCQ
  against a boss health bar. Used for the unit's final/summative test.

5. **Victory screen** — XP earned, hearts remaining, zellige-framed "quest complete"
   banner, single "Back to Map" action.

## Writing/copy rules
- Write from the student's side of the screen: name things by what they do
  ("Mark complete," not "Submit lesson state").
- Errors/empty states explain what happened and what to do next, in-voice, never
  a raw system message.
- Keep the register plain and conversational — no filler, no exclamation-mark spam
  outside genuine celebration moments (victory screen, streaks).
