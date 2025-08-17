"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ChevronDown, X, Wallet, User, Shield, DollarSign, Check, ArrowRight } from "lucide-react"
import { useWalletConnection, useAstraVault, useCompanyPayout } from "@/lib/hooks"
import { VALID_TAGS, ValidTag } from "@/lib/blockchain"
import { WalletStatus, WalletConnectionPrompt } from "@/components/wallet-status"

export default function SellDataPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTags, setSelectedTags] = useState<ValidTag[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Blockchain hooks
  const { 
    address, 
    isConnected, 
    status, 
    connect, 
    connectors, 
    isPending: isConnecting,
    isConnecting: isWalletConnecting,
    isReconnecting 
  } = useWalletConnection()
  const { 
    hasVault, 
    hasVaultLoading, 
    userTags, 
    userTagsLoading, 
    createVault, 
    isCreatingVault,
    addTag,
    isAddingTag,
    refetchHasVault,
    refetchUserTags
  } = useAstraVault()
  const { 
    pendingRewards, 
    pendingRewardsLoading, 
    claimRewards, 
    isClaimingRewards 
  } = useCompanyPayout()

  const steps = [
    { id: 1, title: "Connect Wallet", description: "Add your wallet address" },
    { id: 2, title: "Select Tags", description: "Choose what describes you best" },
    { id: 3, title: "Create Vault", description: "Sign transaction to create your Data Vault" },
    { id: 4, title: "Start Earning", description: "Earn FLOW from data queries" }
  ]

  // Handle step advancement based on state changes
  useEffect(() => {
    if (isConnected && currentStep === 1) {
      setCurrentStep(2)
    }
  }, [isConnected, currentStep])

  useEffect(() => {
    if (hasVault && currentStep === 3) {
      setCurrentStep(4)
    }
  }, [hasVault, currentStep])

  // Handle wallet disconnection and account switching
  useEffect(() => {
    if (!isConnected && currentStep > 1) {
      setCurrentStep(1)
      setSelectedTags([])
    }
  }, [isConnected, currentStep])

  // Refetch data when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      refetchHasVault()
      refetchUserTags()
    }
  }, [isConnected, address, refetchHasVault, refetchUserTags])

  const handleConnectWallet = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] })
    }
  }

  const handleDisconnectWallet = () => {
    // Reset all state when disconnecting
    setCurrentStep(1)
    setSelectedTags([])
  }

  const handleTagToggle = (tag: ValidTag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleRemoveTag = (tagToRemove: ValidTag) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const handleApproveProfile = () => {
    if (selectedTags.length > 0) {
      setCurrentStep(3)
    }
  }

  const handleCreateVault = () => {
    if (selectedTags.length > 0) {
      createVault(selectedTags, {
        onSuccess: () => {
          setCurrentStep(4)
        },
        onError: (error) => {
          console.error('Failed to create vault:', error)
          alert('Failed to create vault. Please try again.')
        }
      })
    }
  }

  const handleClaimEarnings = () => {
    claimRewards(undefined, {
      onError: (error) => {
        console.error('Failed to claim rewards:', error)
        alert('Failed to claim rewards. Please try again.')
      }
    })
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatRewards = (rewards: bigint) => {
    return Number(rewards) / 1e18 // Convert from wei to FLOW
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/60 to-slate-900">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Sell Your Data
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform your digital footprint into a valuable asset. Our privacy-preserving technology ensures your data never leaves your device.
          </p>
        </div>

        {/* Wallet Status Bar */}
        <div className="mb-8">
          {isConnected ? (
            <WalletStatus onDisconnect={handleDisconnectWallet} />
          ) : (
            <WalletConnectionPrompt />
          )}
        </div>

        {/* Progress Steps */}
        <div className="mb-16">
          <div className="flex justify-center gap-8 mb-12">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  currentStep >= step.id
                    ? "border-white bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                    : "border-white text-slate-300 bg-slate-700"
                }`}>
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-bold">{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 transition-all duration-300 ${
                    currentStep > step.id ? "bg-gradient-to-r from-blue-400 to-blue-500" : "bg-white"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-12">
          {/* Step 1: Connect Wallet */}
          {currentStep === 1 && (
            <Card className="bg-slate-800 border border-white shadow-2xl shadow-purple-500/20 p-12 max-w-2xl mx-auto">
              <div className="text-center space-y-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-white">
                  <Wallet className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
                  <p className="text-lg text-slate-300">
                    Connect your MetaMask wallet to get started. This will be used to create your Data Vault and receive payments.
                  </p>
                </div>
                
                <div className="space-y-6">
                  {!isConnected ? (
                    <Button
                      onClick={handleConnectWallet}
                      disabled={isConnecting || isWalletConnecting || isReconnecting}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white text-lg font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg border border-white disabled:opacity-50"
                    >
                      {isConnecting || isWalletConnecting || isReconnecting ? "Connecting..." : "Connect MetaMask Wallet"}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-white rounded-xl p-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">Wallet Connected</div>
                          <div className="text-sm text-slate-300">{address && formatAddress(address)}</div>
                        </div>
                      </div>
                      <Button
                        onClick={() => setCurrentStep(2)}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white text-lg font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg border border-white"
                      >
                        Continue with Connected Wallet
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Select Tags */}
          {currentStep === 2 && (
            <Card className="bg-slate-800 border border-white shadow-2xl shadow-purple-500/20 p-12 max-w-3xl mx-auto">
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6 border border-white">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Select What Describes You Best</h2>
                  <p className="text-lg text-slate-300">
                    Choose tags that represent your interests and behaviors. These will be used to create your anonymous profile.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <div
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-6 py-4 border-2 border-white rounded-xl cursor-pointer hover:border-blue-400 transition-all duration-200 bg-slate-700 shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2 min-h-[24px]">
                          {selectedTags.length === 0 ? (
                            <span className="text-slate-400">Select tags...</span>
                          ) : (
                            selectedTags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-medium shadow-sm border border-white"
                              >
                                {tag}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveTag(tag)
                                  }}
                                  className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors duration-200"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`} />
                      </div>
                    </div>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-white rounded-xl shadow-2xl z-10 max-h-64 overflow-y-auto">
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-2">
                            {VALID_TAGS.map((tag) => (
                              <button
                                key={tag}
                                onClick={() => handleTagToggle(tag)}
                                className={`px-3 py-2 text-left rounded-lg transition-all duration-200 ${
                                  selectedTags.includes(tag)
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-sm border border-white"
                                    : "hover:bg-slate-100 text-slate-700 hover:shadow-sm"
                                }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={handleApproveProfile}
                      disabled={selectedTags.length === 0}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white text-lg font-bold py-4 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-white"
                    >
                      Continue with {selectedTags.length} Tag{selectedTags.length !== 1 ? 's' : ''}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Create Vault */}
          {currentStep === 3 && (
            <Card className="bg-slate-800 border border-white shadow-2xl shadow-purple-500/20 p-12 max-w-2xl mx-auto">
              <div className="text-center space-y-8">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-white">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Create Your Data Vault</h2>
                <p className="text-lg text-slate-300 max-w-xl mx-auto">
                  Sign a transaction to create your public, pseudonymous Data Vault on the blockchain. This is your Web3 identity that companies can query.
                </p>
                
                <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-white rounded-xl p-6">
                  <h3 className="font-medium text-white mb-3">Your Profile Summary:</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {selectedTags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-sm font-medium shadow-sm border border-white">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleCreateVault}
                  disabled={isCreatingVault}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white text-lg font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg border border-white disabled:opacity-50"
                >
                  {isCreatingVault ? "Creating Vault..." : "Create Data Vault"}
                </Button>
              </div>
            </Card>
          )}

          {/* Step 4: Start Earning */}
          {currentStep === 4 && (
            <Card className="bg-slate-800 border border-white shadow-2xl shadow-purple-500/20 p-12 max-w-2xl mx-auto">
              <div className="text-center space-y-8">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-white">
                  <DollarSign className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Start Earning!</h2>
                <p className="text-lg text-slate-300 max-w-xl mx-auto">
                  Congratulations! Your Data Vault is now live. You'll earn FLOW micropayments every time your data is included in a company's query.
                </p>
                
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-white rounded-xl p-6">
                  <h3 className="font-medium text-white mb-4">Your Earnings Dashboard</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400">
                        {pendingRewardsLoading ? "Loading..." : `${formatRewards(pendingRewards || 0n).toFixed(4)} FLOW`}
                      </div>
                      <div className="text-sm text-slate-300">Available to Claim</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400">
                        {userTagsLoading ? "Loading..." : userTags?.length || 0}
                      </div>
                      <div className="text-sm text-slate-300">Active Tags</div>
                    </div>
                  </div>
                  {pendingRewards && pendingRewards > 0n && (
                    <Button
                      onClick={handleClaimEarnings}
                      disabled={isClaimingRewards}
                      className="w-full mt-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg border border-white disabled:opacity-50"
                    >
                      {isClaimingRewards ? "Claiming..." : "Claim Earnings"}
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">How It Works:</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-slate-700 rounded-xl border border-white">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full mx-auto mb-3 flex items-center justify-center border border-white">
                        <span className="text-blue-400 font-bold text-lg">1</span>
                      </div>
                      <p className="text-sm text-slate-300">Companies query your data profile</p>
                    </div>
                    <div className="text-center p-6 bg-slate-700 rounded-xl border border-white">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-full mx-auto mb-3 flex items-center justify-center border border-white">
                        <span className="text-purple-400 font-bold text-lg">2</span>
                      </div>
                      <p className="text-sm text-slate-300">Smart contract processes payment</p>
                    </div>
                    <div className="text-center p-6 bg-slate-700 rounded-xl border border-white">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-full mx-auto mb-3 flex items-center justify-center border border-white">
                        <span className="text-green-400 font-bold text-lg">3</span>
                      </div>
                      <p className="text-sm text-slate-300">FLOW automatically added to your balance</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-16 text-center">
          <Link href="/">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 px-8 py-3 rounded-xl transition-all duration-200">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
