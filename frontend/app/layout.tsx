import type { Metadata } from 'next'
import { Libre_Caslon_Text, Manrope, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const libreCaslon = Libre_Caslon_Text({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--nf-caslon',
})

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--nf-manrope',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--nf-mono-hud',
})

export const metadata: Metadata = {
  title: 'English Quest',
  description: 'Gamified English learning — Template A prototype',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${libreCaslon.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="h-full">{children}</body>
    </html>
  )
}
