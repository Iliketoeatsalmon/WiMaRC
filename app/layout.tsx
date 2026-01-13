import type React from "react"
/**
 * Root layout for WiMaRC application
 * Provides authentication context and global styling
 */

import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import { AppShell } from "@/components/layout/AppShell"

import { Inter, Sarabun, Inter as V0_Font_Inter, Geist_Mono as V0_Font_Geist_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'

// Initialize fonts
const _inter = V0_Font_Inter({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _sourceSerif_4 = V0_Font_Source_Serif_4({ subsets: ['latin'], weight: ["200","300","400","500","600","700","800","900"] })

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sarabun",
})

export const metadata: Metadata = {
  title: "WiMaRC - ระบบตรวจวัดและจัดเก็บสภาวะแวดล้อม",
  description: "ระบบตรวจวัดและจัดเก็บสภาวะแวดล้อมเชิงพื้นที่ด้วยเซนเซอร์บนเครือข่ายไร้สาย",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className={`${sarabun.variable} font-sans antialiased`}>
        <AuthProvider>
          <AppShell>{children}</AppShell>
          <Toaster />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
