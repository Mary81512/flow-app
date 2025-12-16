// app/layout.tsx
import "./globals.css"
import type { Metadata } from "next"
import { Inter, } from "next/font/google"

// Body-Font (UI / Text)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
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
    <html lang="de">
      <body className="bg-[#262626] text-slate-50 font-sans">
        {children}
      </body>
    </html>
  )
}
