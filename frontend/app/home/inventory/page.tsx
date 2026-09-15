'use client'

import { useRouter } from 'next/navigation'

const ACHIEVEMENTS = [
  { icon: 'emoji_events',  label: 'First Victory',    desc: 'Win your first boss battle',          unlocked: true  },
  { icon: 'local_fire_department', label: 'On Fire',  desc: 'Get a 5-question streak',             unlocked: true  },
  { icon: 'swords',        label: 'Unit Slayer',       desc: 'Defeat a boss without losing a heart', unlocked: false },
  { icon: 'workspace_premium', label: 'Golden Run',   desc: 'Complete a golden boss run',           unlocked: false },
  { icon: 'auto_awesome',  label: 'Scholar',           desc: 'Complete all lessons in a unit',      unlocked: false },
  { icon: 'speed',         label: 'Speed Demon',       desc: 'Answer 10 questions without the timer running out', unlocked: false },
]

export default function InventoryPage() {
  const router = useRouter()

  return (
    <div
      className="max-w-sm mx-auto h-full flex flex-col"
      style={{ background: '#14140f' }}
    >
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header
        className="shrink-0 flex justify-between items-center px-5 h-16 border-b"
        style={{
          background:     'rgba(20,20,15,0.95)',
          backdropFilter: 'blur(6px)',
          borderColor:    'rgba(255,211,53,0.15)',
          boxShadow:      'inset 0 0 20px rgba(255,211,53,0.05)',
        }}
      >
        <button
          onClick={() => router.back()}
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
          INVENTORY
        </span>

        <div style={{ width: '2.75rem' }} />
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4">

        <div className="mb-2">
          <h1
            className="font-caslon font-bold"
            style={{ color: '#e6e2d9', fontSize: '1.5rem', lineHeight: '2rem' }}
          >
            Achievements
          </h1>
          <p className="font-manrope text-sm mt-1" style={{ color: '#cbc4ce' }}>
            Trophies earned on your quest.
          </p>
        </div>

        <div className="zellige-divider" />

        {ACHIEVEMENTS.map(({ icon, label, desc, unlocked }) => (
          <div
            key={label}
            className="flex items-center gap-4 p-4 rounded-lg border"
            style={{
              background:  unlocked ? 'rgba(0,23,15,0.6)' : 'rgba(28,28,22,0.7)',
              borderColor: unlocked ? 'rgba(62,222,177,0.25)' : 'rgba(74,69,77,0.5)',
              opacity:     unlocked ? 1 : 0.55,
            }}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background:  unlocked ? 'rgba(62,222,177,0.12)' : 'rgba(74,69,77,0.3)',
                border:      `1px solid ${unlocked ? 'rgba(62,222,177,0.3)' : 'rgba(74,69,77,0.5)'}`,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize:             '1.5rem',
                  color:                unlocked ? '#3edeb1' : '#cbc4ce',
                  fontVariationSettings: unlocked ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="font-manrope font-bold text-sm leading-tight"
                style={{ color: unlocked ? '#3edeb1' : '#e6e2d9' }}
              >
                {label}
              </p>
              <p className="font-manrope text-xs mt-0.5" style={{ color: '#cbc4ce' }}>
                {desc}
              </p>
            </div>
            {unlocked && (
              <span
                className="material-symbols-outlined shrink-0"
                style={{ color: '#3edeb1', fontSize: '1.1rem', fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            )}
          </div>
        ))}

        <p
          className="font-mono-hud text-xs text-center mt-4"
          style={{ color: 'rgba(255,211,53,0.35)', letterSpacing: '0.05em' }}
        >
          MORE ACHIEVEMENTS COMING SOON
        </p>
      </main>

      {/* ── Bottom nav ───────────────────────────────────────────────────────── */}
      <BottomNav active="inventory" />
    </div>
  )
}

function BottomNav({ active }: { active: string }) {
  const router = useRouter()
  const tabs = [
    { key: 'journey',   icon: 'map',      label: 'Journey',   href: '/home' },
    { key: 'quests',    icon: 'swords',   label: 'Quests',    href: '/leaderboard' },
    { key: 'inventory', icon: 'backpack', label: 'Inventory', href: '/home/inventory' },
    { key: 'profile',   icon: 'person',   label: 'Profile',   href: '/home/profile' },
  ]
  return (
    <nav className="shrink-0 border-t" style={{ background: '#20201a', borderColor: 'rgba(255,211,53,0.1)' }}>
      <div className="flex justify-around items-center py-2 px-4">
        {tabs.map(({ key, icon, label, href }) => {
          const isActive = key === active
          return (
            <button
              key={key}
              onClick={() => router.push(href)}
              className="flex flex-col items-center justify-center rounded-full px-5 py-2 gap-0.5"
              style={isActive ? { background: '#ffd335' } : { color: '#cbc4ce', opacity: 0.6 }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  color:                isActive ? '#3c2f00' : undefined,
                  fontSize:             '1.3rem',
                  fontVariationSettings: isActive ? "'FILL' 1" : undefined,
                }}
              >
                {icon}
              </span>
              <span
                className="font-manrope font-bold text-xs"
                style={{ color: isActive ? '#3c2f00' : undefined }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
