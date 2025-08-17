'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LogOut, Wallet, RefreshCw } from "lucide-react"
import { useWalletConnection } from "@/lib/hooks"

interface WalletStatusProps {
  onDisconnect?: () => void
}

export function WalletStatus({ onDisconnect }: WalletStatusProps) {
  const { 
    address, 
    isConnected, 
    status, 
    disconnect, 
    isConnecting, 
    isDisconnected, 
    isReconnecting 
  } = useWalletConnection()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getStatusColor = () => {
    if (isConnecting || isReconnecting) return 'bg-yellow-400'
    if (isConnected) return 'bg-green-400'
    return 'bg-red-400'
  }

  const getStatusText = () => {
    if (isConnecting) return 'Connecting...'
    if (isReconnecting) return 'Reconnecting...'
    if (isConnected) return 'Connected'
    if (isDisconnected) return 'Disconnected'
    return 'Unknown'
  }

  const handleDisconnect = () => {
    disconnect()
    if (onDisconnect) {
      onDisconnect()
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <Card className="bg-slate-800/50 border border-white/20 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${getStatusColor()}`}></div>
          <div className="flex flex-col">
            <span className="text-white font-medium text-sm">{getStatusText()}</span>
            <span className="text-slate-300 text-xs font-mono">
              {address && formatAddress(address)}
            </span>
          </div>
          {(isConnecting || isReconnecting) && (
            <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleDisconnect}
            variant="outline"
            size="sm"
            className="border-red-400 text-red-400 hover:bg-red-400/10 hover:border-red-300 transition-all duration-200"
            disabled={isConnecting || isReconnecting}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        </div>
      </div>
    </Card>
  )
}

export function WalletConnectionPrompt() {
  const { connect, connectors, isConnecting } = useWalletConnection()

  const handleConnect = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] })
    }
  }

  return (
    <Card className="bg-slate-800/50 border border-white/20 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
          <div className="flex flex-col">
            <span className="text-white font-medium text-sm">Wallet Not Connected</span>
            <span className="text-slate-300 text-xs">Connect your wallet to continue</span>
          </div>
        </div>
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {isConnecting ? "Connecting..." : "Connect"}
        </Button>
      </div>
    </Card>
  )
}
