import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NiuBi战队无畏契约分部',
  description: '牛逼战队无畏契约分部',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="synthwave">
      <body className={inter.className}>{children}</body>
    </html>
  )
}