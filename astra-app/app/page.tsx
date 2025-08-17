"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Shield, Users, DollarSign, Lock, Settings, TrendingUp } from "lucide-react"

// Deterministic star generation to prevent hydration errors
const generateStarPosition = (index: number, total: number) => {
  // Use index to create deterministic but varied positions
  const angle = (index / total) * 2 * Math.PI
  const radius = 30 + (index % 20) * 2 // Vary radius based on index
  
  // Convert polar coordinates to cartesian
  const x = 50 + radius * Math.cos(angle)
  const y = 50 + radius * Math.sin(angle)
  
  return { x, y }
}

const generateStarDelay = (index: number) => {
  // Use index to create deterministic but varied delays
  return (index % 4) * 0.5
}

export default function HomePage() {
  const [selectedColumn, setSelectedColumn] = useState<"user" | "company" | null>("user")
  const [isCardsVisible, setIsCardsVisible] = useState(false)
  const [isMainSectionVisible, setIsMainSectionVisible] = useState(false)
  const [isWhyChooseVisible, setIsWhyChooseVisible] = useState(false)

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    }

    const cardsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsCardsVisible(true)
        }
      })
    }, observerOptions)

    const mainSectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsMainSectionVisible(true)
        }
      })
    }, observerOptions)

    const whyChooseObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsWhyChooseVisible(true)
        }
      })
    }, observerOptions)

    const cardsSection = document.getElementById("feature-cards")
    const mainSection = document.getElementById("main-section")
    const whyChooseSection = document.getElementById("why-choose")

    if (cardsSection) cardsObserver.observe(cardsSection)
    if (mainSection) mainSectionObserver.observe(mainSection)
    if (whyChooseSection) whyChooseObserver.observe(whyChooseSection)

    return () => {
      if (cardsSection) cardsObserver.unobserve(cardsSection)
      if (mainSection) mainSectionObserver.unobserve(mainSection)
      if (whyChooseSection) whyChooseObserver.unobserve(whyChooseSection)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/60 to-slate-900 relative overflow-hidden scroll-smooth">
      {/* Scroll Container */}
      <div className="h-screen overflow-y-auto snap-y snap-mandatory">
        {/* Starry Background */}
        <div className="fixed inset-0 bg-gradient-to-b from-slate-900/95 via-purple-900/50 to-slate-900/95">
        {/* Stars */}
        {Array.from({ length: 100 }).map((_, i) => {
          const { x, y } = generateStarPosition(i, 100)
          const delay = generateStarDelay(i)
          return (
            <div
              key={i}
              className="star absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                animationDelay: `${delay}s`,
              }}
            />
          )
        })}

        {/* Larger glowing stars */}
        {Array.from({ length: 20 }).map((_, i) => {
          const { x, y } = generateStarPosition(i + 100, 20) // Offset index to avoid collision
          const delay = generateStarDelay(i + 100)
          return (
            <div
              key={`glow-${i}`}
              className="star absolute w-2 h-2 bg-accent rounded-full shadow-lg"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                animationDelay: `${delay}s`,
                boxShadow: `0 0 10px oklch(0.7 0.18 280), 0 0 20px oklch(0.7 0.18 280)`,
              }}
            />
          )
        })}
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center pt-20 snap-start">
        {/* Brand */}
        <div className="mb-8">
          <div className="mb-2">
            <img src="/logo.svg" alt="ASTRA" className="h-28 md:h-36 mx-auto" />
          </div>
          <div className="w-24 h-0.5 bg-gradient-to-r from-primary to-accent mx-auto"></div>
        </div>

        {/* Main Title */}
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 max-w-4xl leading-tight">
          Your Data is an Asset.{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Start Treating It Like One.
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
          Transform your digital footprint into profit. Join the Web3 revolution where data ownership meets financial
          opportunity.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button
            size="lg"
            asChild
            className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-500 hover:via-purple-500 hover:to-blue-600 text-white font-bold py-6 px-8 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 border border-blue-400/20 backdrop-blur-sm relative overflow-hidden group flex items-center justify-center"
          >
            <Link href="/sell-data" className="flex items-center justify-center w-full">
              <span className="relative z-10">Sell Data</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </Button>

          <Button
            size="lg"
            asChild
            className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-500 hover:via-pink-500 hover:to-purple-600 text-white font-bold py-6 px-8 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 border border-purple-400/20 backdrop-blur-sm relative overflow-hidden group flex items-center justify-center"
          >
            <Link href="/buy-data" className="flex items-center justify-center w-full">
              <span className="relative z-10">Buy Data</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-16 flex items-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <span>Secure & Decentralized</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span>Instant Transactions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <span>Full Data Control</span>
          </div>
        </div>
      </div>

      {/* ASTRA Logo Section */}
      <div
        id="why-choose"
        className={`text-center mb-8 transition-all duration-1000 snap-start ${
          isWhyChooseVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
        }`}
      >
        <div className="pt-20 pb-8">
          <div className="text-4xl md:text-5xl font-bold mb-4 tracking-wide">
            <img src="/logo.svg" alt="ASTRA" className="h-24 mx-auto" />
          </div>
          <div className="w-20 h-0.5 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-500 mx-auto mb-6"></div>
          <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose ASTRA?</h2>
        </div>
      </div>

      {/* Feature Cards */}
      <div
        id="feature-cards"
        className={`relative z-16 px-4 py-16 transition-all duration-1000 ${
          isCardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card
              className={`bg-white/5 backdrop-blur-2xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-300 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 ${
                isCardsVisible ? "animate-in slide-in-from-bottom-8 duration-700" : ""
              }`}
              style={{ animationDelay: isCardsVisible ? "0ms" : undefined }}
            >
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">True Ownership</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your data profile is a digital asset that lives in your crypto wallet, controlled by you and only you.
                  It is portable and can be used across the entire Web3 ecosystem.
                </p>
              </div>
            </Card>

            <Card
              className={`bg-white/5 backdrop-blur-2xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-300 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 ${
                isCardsVisible ? "animate-in slide-in-from-bottom-8 duration-700" : ""
              }`}
              style={{ animationDelay: isCardsVisible ? "200ms" : undefined }}
            >
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Granular Control</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You decide exactly what data goes into your vault. All analysis is done locally on your device, and
                  you give explicit consent before any data is made public.
                </p>
              </div>
            </Card>

            <Card
              className={`bg-white/5 backdrop-blur-2xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-300 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 ${
                isCardsVisible ? "animate-in slide-in-from-bottom-8 duration-700" : ""
              }`}
              style={{ animationDelay: isCardsVisible ? "400ms" : undefined }}
            >
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Direct Monetization</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Companies pay for access using a credit-based system, and the value flows directly to the users whose
                  data was accessed, facilitated by transparent, automated smart contracts.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div
        id="main-section"
        className={`relative z-10 px-4 py-16 transition-all duration-1000 snap-start ${
          isMainSectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Tab Selection */}
          <div className="text-center mb-12 pt-20">
            <h2 className="text-4xl font-bold text-foreground mb-4">Choose Your Path</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're looking to monetize your data or access high-quality audience insights, 
              we have the perfect solution for you.
            </p>
          </div>

          <div
            className={`grid grid-cols-2 gap-0 mb-12 transition-all duration-700 ${
              isMainSectionVisible ? "animate-in slide-in-from-bottom-4" : ""
            }`}
            style={{ animationDelay: isMainSectionVisible ? "300ms" : undefined }}
          >
            <Button
              onClick={() => setSelectedColumn(selectedColumn === "user" ? null : "user")}
              className={`w-full px-8 py-8 text-xl font-bold rounded-none rounded-l-2xl transition-all duration-300 relative overflow-hidden group ${
                selectedColumn === "user"
                  ? "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white scale-105 z-10 shadow-2xl shadow-blue-500/30"
                  : "bg-slate-800/80 backdrop-blur-2xl border border-slate-700 text-foreground hover:bg-slate-700/80 hover:border-blue-500/50"
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <span>Sell Data</span>
                <span className="text-sm opacity-80">For Users</span>
              </div>
              {selectedColumn === "user" && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </Button>

            <Button
              onClick={() => setSelectedColumn(selectedColumn === "company" ? null : "company")}
              className={`w-full px-8 py-8 text-xl font-bold rounded-none rounded-r-2xl transition-all duration-300 relative overflow-hidden group ${
                selectedColumn === "company"
                  ? "bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white scale-105 z-10 shadow-2xl shadow-purple-500/30"
                  : "bg-slate-800/80 backdrop-blur-2xl border border-slate-700 text-foreground hover:bg-slate-700/80 hover:border-purple-500/50"
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <span>Buy Data</span>
                <span className="text-sm opacity-80">For Companies</span>
              </div>
              {selectedColumn === "company" && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </Button>
          </div>

          {selectedColumn && (
            <div className="w-full bg-slate-800/80 backdrop-blur-2xl border border-slate-700 p-12 rounded-2xl animate-in fade-in duration-500 shadow-2xl shadow-purple-500/10">
              {selectedColumn === "user" && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-foreground mb-4">Own Your Digital Identity</h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                      Connect your wallets and accounts to generate a private, verified profile of your on-chain and
                      off-chain behavior. You control what gets shared.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8">
                    <p className="text-foreground font-semibold text-lg text-center">
                      Earn passive income in USDC every time a company accesses your pseudonymous data. No middlemen,
                      just direct value.
                    </p>
                  </div>
                  
                  <div className="text-center pt-6">
                    <Link href="/sell-data">
                      <Button className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-500 hover:via-purple-500 hover:to-blue-600 text-white font-bold py-6 px-10 rounded-2xl transition-all duration-300 hover:scale-105 shadow-2xl shadow-blue-500/30 text-lg">
                        Start Selling Your Data
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {selectedColumn === "company" && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-foreground mb-4">Access High-Signal Audiences</h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                      Stop wasting money on broad demographic targeting. Find your ideal customers based on their
                      verified, on-chain actions and interests.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8">
                    <p className="text-foreground font-semibold text-lg text-center">
                      Engage directly with high-intent users through airdrops and whitelists. Pay only for the data you
                      use with our transparent, credit-based system.
                    </p>
                  </div>
                  
                  <div className="text-center pt-6">
                    <Link href="/buy-data">
                      <Button className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-500 hover:via-pink-500 hover:to-purple-600 text-white font-bold py-6 px-10 rounded-2xl transition-all duration-300 hover:scale-105 shadow-2xl shadow-purple-500/30 text-lg">
                        Start Buying Data
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>

      <style jsx>{`
        .star {
          animation: twinkle 3s ease-in-out infinite;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
