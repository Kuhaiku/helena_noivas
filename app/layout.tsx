import type { Metadata } from 'next'
import { Playfair_Display, Manrope } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CookieBanner } from "@/components/helena/cookie-banner"
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Helena Noivas — Encontre o Vestido dos Seus Sonhos',
  description:
    'Catálogo exclusivo de vestidos de noiva. Escolha online e agende sua prova presencial com nossas consultoras.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
        <CookieBanner />
      </body>
    </html>
  )
}
