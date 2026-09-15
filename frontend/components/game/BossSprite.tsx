'use client'

interface BossSpriteProps {
  hit:      boolean
  lowHp:    boolean
  floating: boolean
}

export default function BossSprite({ hit, lowHp, floating }: BossSpriteProps) {
  return (
    <svg
      viewBox="0 0 160 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Boss"
      className={floating ? 'animate-float' : undefined}
      style={{
        width:      'auto',
        height:     '100%',
        maxHeight:  '190px',
        display:    'block',
        /* Instant white flash on hit; slow purple-red glow return */
        filter: hit
          ? 'brightness(8) saturate(0)'
          : lowHp
            ? 'drop-shadow(0 0 22px rgba(255,40,40,0.9))  drop-shadow(0 0 44px rgba(200,0,0,0.5))'
            : 'drop-shadow(0 0 16px rgba(120,0,220,0.75)) drop-shadow(0 0 36px rgba(255,40,40,0.25))',
        transition: hit ? 'none' : 'filter 0.45s ease-out',
      }}
    >
      <defs>
        {/* Body gradient — dark purple top, near-black bottom */}
        <linearGradient id="bs-body" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"   stopColor="#2d0a52" />
          <stop offset="100%" stopColor="#0d0520" />
        </linearGradient>
        {/* Inner robe shadow */}
        <linearGradient id="bs-inner" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"   stopColor="#1a0630" />
          <stop offset="100%" stopColor="#050010" />
        </linearGradient>
        {/* Left eye radial */}
        <radialGradient id="bs-eyeL" cx="45%" cy="40%" r="60%">
          <stop offset="0%"   stopColor="#ff7070" />
          <stop offset="40%"  stopColor="#cc1010" />
          <stop offset="100%" stopColor="#660000" stopOpacity="0" />
        </radialGradient>
        {/* Right eye radial */}
        <radialGradient id="bs-eyeR" cx="45%" cy="40%" r="60%">
          <stop offset="0%"   stopColor="#ff7070" />
          <stop offset="40%"  stopColor="#cc1010" />
          <stop offset="100%" stopColor="#660000" stopOpacity="0" />
        </radialGradient>
        {/* Orb gradient */}
        <radialGradient id="bs-orb" cx="40%" cy="35%" r="65%">
          <stop offset="0%"   stopColor="#ff5050" />
          <stop offset="50%"  stopColor="#8800cc" />
          <stop offset="100%" stopColor="#1a0630" stopOpacity="0.4" />
        </radialGradient>
        {/* Ground shadow */}
        <radialGradient id="bs-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(100,0,180,0.25)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)"        />
        </radialGradient>
      </defs>

      {/* ── Ground shadow ──────────────────────────────────────────────────── */}
      <ellipse cx="80" cy="196" rx="58" ry="8" fill="url(#bs-shadow)" />

      {/* ── CLOAK ─────────────────────────────────────────────────────────── */}
      {/* Outer silhouette */}
      <path
        d="M80 88 C44 102 10 152 8 198 L152 198 C150 152 116 102 80 88 Z"
        fill="url(#bs-body)"
      />
      {/* Edge highlights */}
      <path d="M80 88 C44 102 10 152 8 198"
            fill="none" stroke="rgba(147,0,211,0.65)" strokeWidth="1.5" />
      <path d="M80 88 C116 102 150 152 152 198"
            fill="none" stroke="rgba(147,0,211,0.65)" strokeWidth="1.5" />
      {/* Inner shading */}
      <path
        d="M80 96 C54 108 30 155 28 198 L132 198 C130 155 106 108 80 96 Z"
        fill="url(#bs-inner)" opacity="0.55"
      />
      {/* Collar */}
      <path d="M58 88 Q80 80 102 88 Q80 96 58 88 Z"
            fill="#1a0630" stroke="rgba(120,0,200,0.5)" strokeWidth="1" />

      {/* ── ZELLIGE CHEST PATTERN ─────────────────────────────────────────── */}
      {/* Diamond 1 */}
      <path d="M80 118 L93 131 L80 144 L67 131 Z"
            fill="none" stroke="rgba(255,211,53,0.5)" strokeWidth="1.5" />
      <circle cx="80" cy="131" r="2" fill="rgba(255,211,53,0.4)" />
      {/* Diamond 2 */}
      <path d="M80 146 L91 157 L80 168 L69 157 Z"
            fill="none" stroke="rgba(255,211,53,0.33)" strokeWidth="1.2" />
      {/* Diamond 3 */}
      <path d="M80 170 L88 178 L80 186 L72 178 Z"
            fill="none" stroke="rgba(255,211,53,0.2)" strokeWidth="1" />
      {/* Spine */}
      <line x1="80" y1="114" x2="80" y2="188"
            stroke="rgba(255,211,53,0.1)" strokeWidth="1" />

      {/* ── HEAD ──────────────────────────────────────────────────────────── */}
      <ellipse cx="80" cy="57" rx="34" ry="37" fill="#16052a" />
      <ellipse cx="80" cy="57" rx="34" ry="37"
               fill="none" stroke="rgba(110,0,190,0.55)" strokeWidth="1.5" />

      {/* ── CROWN ─────────────────────────────────────────────────────────── */}
      {/* Crown band */}
      <rect x="48" y="25" width="64" height="8" rx="2"
            fill="#2d0a52" stroke="rgba(147,0,211,0.55)" strokeWidth="1" />
      {/* 5 spikes */}
      <path d="M53 25 L48  5 L59 23" fill="#4a0d8a" />
      <path d="M68 25 L64  3 L75 23" fill="#5810a0" />
      <path d="M80 25 L80  0 L87 23" fill="#6812bc" />
      <path d="M92 25 L96  3 L85 23" fill="#5810a0" />
      <path d="M107 25 L112 5 L101 23" fill="#4a0d8a" />
      {/* Spike edge glow */}
      <path d="M80 0 L87 23 M64 3 L75 23 M96 3 L85 23"
            fill="none" stroke="rgba(180,0,255,0.4)" strokeWidth="0.8" />
      {/* Crown base accent line */}
      <line x1="48" y1="29" x2="112" y2="29"
            stroke="rgba(255,211,53,0.5)" strokeWidth="1" />
      {/* Crown gems */}
      <circle cx="80" cy="7"  r="5"   fill="#ff2020" />
      <circle cx="80" cy="7"  r="2.5" fill="#ff9090" opacity="0.85" />
      <circle cx="65" cy="10" r="3.5" fill="#ffd335" opacity="0.85" />
      <circle cx="65" cy="10" r="1.5" fill="#fff8c0" opacity="0.7"  />
      <circle cx="95" cy="10" r="3.5" fill="#ffd335" opacity="0.85" />
      <circle cx="95" cy="10" r="1.5" fill="#fff8c0" opacity="0.7"  />

      {/* ── FACE ──────────────────────────────────────────────────────────── */}
      {/* Brow ridge */}
      <path d="M50 45 Q80 36 110 45"
            fill="none" stroke="rgba(100,0,180,0.6)" strokeWidth="2" />
      {/* Cheekbone shadows */}
      <ellipse cx="55" cy="68" rx="10" ry="6" fill="rgba(0,0,0,0.25)" />
      <ellipse cx="105" cy="68" rx="10" ry="6" fill="rgba(0,0,0,0.25)" />

      {/* Eye sockets */}
      <ellipse cx="65" cy="55" rx="14" ry="11" fill="#080012" />
      <ellipse cx="95" cy="55" rx="14" ry="11" fill="#080012" />
      {/* Eye glow — large radial */}
      <ellipse cx="65" cy="55" rx="11" ry="9"  fill="url(#bs-eyeL)" />
      <ellipse cx="95" cy="55" rx="11" ry="9"  fill="url(#bs-eyeR)" />
      {/* Bright iris */}
      <ellipse cx="65" cy="55" rx="5.5" ry="4.5" fill="#ff3838" />
      <ellipse cx="95" cy="55" rx="5.5" ry="4.5" fill="#ff3838" />
      {/* Pupil slit */}
      <ellipse cx="65" cy="55" rx="1.5" ry="4"   fill="#1a0000" />
      <ellipse cx="95" cy="55" rx="1.5" ry="4"   fill="#1a0000" />
      {/* Specular */}
      <ellipse cx="62" cy="52" rx="2"   ry="1.5" fill="#ffcccc" opacity="0.75" />
      <ellipse cx="92" cy="52" rx="2"   ry="1.5" fill="#ffcccc" opacity="0.75" />

      {/* Nose */}
      <path d="M77 63 L80 72 L83 63"
            fill="none" stroke="rgba(80,0,150,0.5)" strokeWidth="1.2" />

      {/* Menacing mouth */}
      <path d="M58 79 Q80 92 102 79"
            fill="none" stroke="rgba(110,0,180,0.6)" strokeWidth="1.5" />
      {/* Jagged teeth */}
      <path d="M62 80 L63 88 L66 80" fill="rgba(255,211,53,0.6)" />
      <path d="M70 83 L72 92 L74 83" fill="rgba(255,211,53,0.5)" />
      <path d="M80 84 L82 94 L84 84" fill="rgba(255,211,53,0.5)" />
      <path d="M90 83 L92 92 L94 83" fill="rgba(255,211,53,0.5)" />
      <path d="M98 80 L99 88 L102 80" fill="rgba(255,211,53,0.6)" />

      {/* ── FLOATING ORBS (hands) ─────────────────────────────────────────── */}
      {/* Left orb */}
      <circle cx="18" cy="134" r="18"  fill="#120028" stroke="rgba(130,0,200,0.5)" strokeWidth="1.5" />
      <circle cx="18" cy="134" r="13"  fill="url(#bs-orb)" opacity="0.95" />
      <circle cx="18" cy="134" r="6"   fill="#ff3030"  opacity="0.85" />
      <circle cx="15" cy="131" r="2.5" fill="#ffbbbb"  opacity="0.65" />
      {/* Right orb */}
      <circle cx="142" cy="134" r="18"  fill="#120028" stroke="rgba(130,0,200,0.5)" strokeWidth="1.5" />
      <circle cx="142" cy="134" r="13"  fill="url(#bs-orb)" opacity="0.95" />
      <circle cx="142" cy="134" r="6"   fill="#ff3030"  opacity="0.85" />
      <circle cx="139" cy="131" r="2.5" fill="#ffbbbb"  opacity="0.65" />

      {/* Energy wisps: orbs → body */}
      <path d="M28 130 Q38 116 54 110"
            fill="none" stroke="rgba(140,0,220,0.5)" strokeWidth="2"   strokeLinecap="round" />
      <path d="M30 142 Q40 150 52 144"
            fill="none" stroke="rgba(255,50,50,0.35)"  strokeWidth="1.5" strokeLinecap="round" />
      <path d="M132 130 Q122 116 106 110"
            fill="none" stroke="rgba(140,0,220,0.5)" strokeWidth="2"   strokeLinecap="round" />
      <path d="M130 142 Q120 150 108 144"
            fill="none" stroke="rgba(255,50,50,0.35)"  strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
