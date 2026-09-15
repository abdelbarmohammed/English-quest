'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/session'

export default function Root() {
  const router = useRouter()

  useEffect(() => {
    router.replace(getSession() ? '/home' : '/join')
  }, [router])

  return (
    <div className="h-full flex items-center justify-center" style={{ background: '#14140f' }}>
      <div
        className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(255,211,53,0.2)', borderTopColor: '#ffd335' }}
      />
    </div>
  )
}
