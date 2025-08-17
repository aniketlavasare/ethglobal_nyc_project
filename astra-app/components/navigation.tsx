"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    ethereum?: any
  }
}

export default function Navigation() {
  const pathname = usePathname()
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0]
        setWalletAddress(account)
        setIsWalletConnected(true)
      } else {
        alert('Please install MetaMask to use this feature')
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      alert('Failed to connect wallet')
    }
  }

  return (
                <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
              <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
                            <Link
                    href="/"
                    className="text-2xl font-bold tracking-wide"
                  >
                    <img src="/logo.svg" alt="ASTRA" className="h-16" />
                  </Link>

          <div className="flex items-center gap-8">
            <Link
              href="/"
              className={`font-medium transition-colors ${
                pathname === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              href="/sell-data"
              className={`font-medium transition-colors ${
                pathname === "/sell-data" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sell Data
            </Link>
            <Link
              href="/buy-data"
              className={`font-medium transition-colors ${
                pathname === "/buy-data" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Buy Data
            </Link>
            
            {/* Wallet Connection */}
            {!isWalletConnected ? (
              <Button
                onClick={connectWallet}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-500 hover:via-purple-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/30 border border-blue-400/20 text-sm"
              >
                Connect Wallet
              </Button>
            ) : (
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/20 rounded-lg p-3">
                <div className="text-center">
                  <div className="text-sm font-bold text-green-400">Connected</div>
                  <div className="text-xs text-slate-300">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
