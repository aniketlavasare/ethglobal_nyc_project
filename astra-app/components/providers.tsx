'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { getWagmiConfig } from '@/lib/blockchain'
import { useState, useEffect } from 'react'
import '@/lib/wallet-connect-fix' // Import the fix to suppress warnings

// Create a singleton QueryClient
let queryClient: QueryClient | null = null

function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
          gcTime: 10 * 60 * 1000, // 10 minutes
        },
      },
    })
  }
  return queryClient
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ReturnType<typeof getWagmiConfig> | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Only create config on client side
    try {
      const wagmiConfig = getWagmiConfig()
      setConfig(wagmiConfig)
    } catch (error) {
      console.error('Error creating Wagmi config:', error)
    }
    setMounted(true)
  }, [])

  // Show loading state while mounting
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  // If config failed to load, show error
  if (!config) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-xl font-bold mb-2">Failed to initialize wallet connection</h2>
          <p className="text-slate-300">Please refresh the page and try again.</p>
        </div>
      </div>
    )
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={getQueryClient()}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
