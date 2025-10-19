import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coding Tutor',
  description: 'Demo site – AI tutor coming next',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
