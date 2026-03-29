import type React from "react"
import type { Metadata } from "next"
import { Audiowide } from "next/font/google"
import "./globals.css"

const aurora = Audiowide({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-aurora",
})

export const metadata: Metadata = {
  title: "CallSync AI — Voice Appointment Manager",
  description: "AI voice agent that books, reschedules and reminds. 24/7, zero missed appointments.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${aurora.className} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
