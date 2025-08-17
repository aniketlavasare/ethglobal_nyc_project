import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import Navigation from "@/components/navigation"
import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  title: "Astra - Your Data is an Asset",
  description: "Transform your data into profit with Astra Web3 platform",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  )
}
