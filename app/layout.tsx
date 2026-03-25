import type { Metadata } from 'next'
import { Playfair_Display, Manrope } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CookieBanner } from "@/components/helena/cookie-banner"
import { siteConfig } from "@/lib/site-config"
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

// ── PUXAR VARIÁVEIS DO .ENV PARA O SEO ──
const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "Loja"
const storeSlogan = process.env.NEXT_PUBLIC_STORE_SLOGAN || "Catálogo de Vestidos"
const storeDescription = process.env.NEXT_PUBLIC_STORE_DESCRIPTION || "Catálogo exclusivo. Escolha online e agende a sua prova presencial."

export const metadata: Metadata = {
  title: siteConfig.nomeLoja,
  description: siteConfig.description,
  icons: {
    icon: process.env.NEXT_PUBLIC_FAVICON_URL || "/images/icon.svg",
    apple: process.env.NEXT_PUBLIC_FAVICON_URL || "/images/apple-icon.png",
  }
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