// app/layout.tsx
import "./globals.css"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"

// Body-Font (UI / Text)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
})

// Headline-Font
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
})

export const metadata: Metadata = {
  title: "Flow App",
  description: "JobFlow / Flow UI Prototype",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="de"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body className="bg-background text-white font-body">
        {children}
      </body>
    </html>
  )
}
