'use client'

export default function BlockedPage() {
  return (
    <div
      style={{
        minHeight:      '100dvh',
        background:     '#14140f',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '2rem',
        gap:            '1.5rem',
        fontFamily:     'Manrope, sans-serif',
        textAlign:      'center',
      }}
    >
      {/* Zellige-style diamond accent */}
      <div
        style={{
          width:        '5rem',
          height:       '5rem',
          borderRadius: '0.75rem',
          transform:    'rotate(45deg)',
          background:   '#1a0b2e',
          border:       '2px solid rgba(255,211,53,0.4)',
          boxShadow:    'inset 0 0 20px rgba(255,211,53,0.1)',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            transform:             'rotate(-45deg)',
            fontSize:              '2rem',
            lineHeight:            1,
            fontVariationSettings: "'FILL' 1",
          }}
        >
          public
        </span>
      </div>

      <h1
        style={{
          fontFamily:  'Libre Caslon Text, Georgia, serif',
          fontWeight:  700,
          fontSize:    '1.5rem',
          color:       '#ffd335',
          margin:      0,
          lineHeight:  1.3,
        }}
      >
        Not available in your region
      </h1>

      <p
        style={{
          color:     '#cbc4ce',
          fontSize:  '1rem',
          maxWidth:  '22rem',
          margin:    0,
          lineHeight: 1.6,
        }}
      >
        English Quest is currently available in Morocco only.
        If you're a teacher or admin accessing from abroad, contact your school administrator.
      </p>
    </div>
  )
}
