"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { CreditCard, Users, Search, FileText, Gift, Check, ChevronDown, X, ArrowRight, Wallet } from "lucide-react"
import { useWalletConnection, useSearchUsers, useCompanyPayout } from "@/lib/hooks"
import { VALID_TAGS, ValidTag } from "@/lib/blockchain"
import { flowToWei } from "@/lib/utils"
import { WalletStatus, WalletConnectionPrompt } from "@/components/wallet-status"

interface SearchResult {
  address: string
  tags: ValidTag[]
  matchScore: number
}

export default function BuyDataPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTags, setSelectedTags] = useState<ValidTag[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchCost, setSearchCost] = useState(0)
  const [isSearching, setIsSearching] = useState(false)

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
  const { searchUsers, searchResults: apiSearchResults, isSearching: isApiSearching, error: searchError } = useSearchUsers()
  const { buyAccess, isBuyingAccess } = useCompanyPayout()

  const steps = [
    { id: 1, title: "Connect Wallet", description: "Connect your wallet to pay for data" },
    { id: 2, title: "Build Audience", description: "Select data tags to define your target" },
    { id: 3, title: "Execute Query", description: "Spend FLOW to get matching users" },
    { id: 4, title: "Receive Data", description: "Get list of matching users" },
    { id: 5, title: "Reward Users", description: "FLOW automatically distributed to users" }
  ]

  // Handle step advancement based on state changes
  useEffect(() => {
    if (isConnected && currentStep === 1) {
      setCurrentStep(2)
    }
  }, [isConnected, currentStep])

  // Handle wallet disconnection and account switching
  useEffect(() => {
    if (!isConnected && currentStep > 1) {
      setCurrentStep(1)
      setSelectedTags([])
      setSearchResults([])
      setSearchCost(0)
    }
  }, [isConnected, currentStep])

  const handleConnectWallet = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] })
    }
  }

  const handleDisconnectWallet = () => {
    // Reset all state when disconnecting
    setCurrentStep(1)
    setSelectedTags([])
    setSearchResults([])
    setSearchCost(0)
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

  const handleExecuteQuery = async () => {
    if (selectedTags.length === 0) return
    
    setIsSearching(true)
    
    try {
      // Search for users with selected tags
      searchUsers(selectedTags, {
        onSuccess: (results: SearchResult[]) => {
          setSearchResults(results)
          setSearchCost(results.length * 0.001) // 0.001 FLOW per user
          setCurrentStep(3)
        },
        onError: (error: Error) => {
          console.error('Search failed:', error)
          alert('Failed to search users. Please try again.')
        }
      })
    } catch (error) {
      console.error('Search error:', error)
      alert('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleCompleteQuery = () => {
    if (searchResults.length === 0) return

    const userAddresses = searchResults.map(result => result.address)
    const totalValue = flowToWei(searchCost)

    // Buy access to user data
    buyAccess({
      tag: selectedTags.join(','),
      users: userAddresses,
      value: totalValue
    }, {
      onSuccess: () => {
        setCurrentStep(4)
      },
      onError: (error: Error) => {
        console.error('Failed to buy access:', error)
        alert('Failed to purchase access. Please try again.')
      }
    })
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/60 to-slate-900">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Buy Data
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Access high-quality, verified audience data through our fair, pay-per-use model. Find your ideal customers based on real on-chain behavior and interests.
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
          <div className="flex justify-center gap-6 mb-12">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  currentStep >= step.id
                    ? "border-white bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                    : "border-white text-slate-300 bg-slate-700"
                }`}>
                  {currentStep > step.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 transition-all duration-300 ${
                    currentStep > step.id ? "bg-gradient-to-r from-purple-400 to-purple-500" : "bg-white"
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
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-white">
                  <Wallet className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-6">Connect Your Wallet</h2>
                <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                  Connect your MetaMask wallet to access our data marketplace. You'll be able to pay with FLOW directly from your wallet.
                </p>
                
                <div className="space-y-6">
                  {!isConnected ? (
                    <Button
                      onClick={handleConnectWallet}
                      disabled={isConnecting || isWalletConnecting || isReconnecting}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white text-lg font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg border border-white disabled:opacity-50"
                    >
                      {isConnecting || isWalletConnecting || isReconnecting ? "Connecting..." : "Connect MetaMask Wallet"}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-white rounded-xl p-4">
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

                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white rounded-xl p-6 max-w-2xl mx-auto">
                  <h3 className="font-medium text-white mb-3">Wallet Connection Benefits:</h3>
                  <div className="grid grid-cols-1 gap-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-slate-300">Secure authentication with your wallet</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      <span className="text-slate-300">Direct FLOW payments from your wallet</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-slate-300">No need to create additional accounts</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Build Audience */}
          {currentStep === 2 && (
            <Card className="bg-slate-800 border border-white shadow-2xl shadow-purple-500/20 p-12 max-w-3xl mx-auto">
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6 border border-white">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Build Your Target Audience</h2>
                  <p className="text-lg text-slate-300">
                    Select behavioral tags and interests to define your ideal customers. You'll pay 0.001 FLOW per matching user.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <div
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-6 py-4 border-2 border-white rounded-xl cursor-pointer hover:border-purple-400 transition-all duration-200 bg-slate-700 shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2 min-h-[24px]">
                          {selectedTags.length === 0 ? (
                            <span className="text-slate-400">Select tags...</span>
                          ) : (
                            selectedTags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-sm font-medium shadow-sm border border-white"
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
                                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium shadow-sm border border-white"
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

                  <div className="text-center space-y-4">
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white rounded-xl p-4 max-w-md mx-auto">
                      <div className="text-2xl font-bold text-white">{selectedTags.length} Tags Selected</div>
                      <div className="text-sm text-slate-300">
                        Cost: 0.001 FLOW per matching user
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleExecuteQuery}
                      disabled={selectedTags.length === 0 || isSearching}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white text-lg font-bold py-4 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-white"
                    >
                      {isSearching ? "Searching..." : "Execute Query"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Execute Query (Brief) */}
          {currentStep === 3 && (
            <Card className="bg-slate-800 border border-white shadow-2xl shadow-purple-500/20 p-12 max-w-2xl mx-auto">
              <div className="text-center space-y-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-white">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Executing Query...</h2>
                <p className="text-lg text-slate-300">
                  Processing your audience request and matching users based on selected tags.
                </p>
              </div>
            </Card>
          )}

          {/* Step 4: Receive Data */}
          {currentStep === 4 && (
            <Card className="bg-slate-800 border border-white shadow-2xl shadow-purple-500/20 p-12 max-w-5xl mx-auto">
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6 border border-white">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Query Results</h2>
                  <p className="text-lg text-slate-300">
                    Here are the users that match your criteria. You can now purchase access to their data.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-white rounded-xl p-6">
                  <h3 className="font-medium text-white mb-4">Query Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-400">{searchResults.length}</div>
                      <div className="text-sm text-slate-300">Users Found</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{searchCost.toFixed(4)}</div>
                      <div className="text-sm text-slate-300">FLOW Required</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">0.001</div>
                      <div className="text-sm text-slate-300">FLOW per User</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-pink-400">{selectedTags.length}</div>
                      <div className="text-sm text-slate-300">Tags Searched</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Matching Users</h3>
                  <div className="grid gap-4">
                    {searchResults.map((user, index) => (
                      <Card key={index} className="bg-slate-700 border border-white p-6 hover:border-purple-500 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border border-white">
                              {user.address.charAt(2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-white text-lg">{formatAddress(user.address)}</div>
                              <div className="text-sm text-slate-300">
                                Match Score: {(user.matchScore * 100).toFixed(0)}%
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {user.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                              <span
                                key={tagIndex}
                                className="px-3 py-1 text-xs rounded-full text-white bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg border border-white"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    onClick={handleCompleteQuery}
                    disabled={isBuyingAccess}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white text-lg font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg border border-white disabled:opacity-50"
                  >
                    {isBuyingAccess ? "Processing..." : `Purchase Access for ${searchCost.toFixed(4)} FLOW`}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Step 5: Reward Users */}
          {currentStep === 5 && (
            <Card className="bg-slate-800 border border-white shadow-2xl shadow-purple-500/20 p-12 max-w-3xl mx-auto">
              <div className="text-center space-y-8">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-green-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-white">
                  <Gift className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Users Rewarded!</h2>
                <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                  The FLOW value you spent has been automatically distributed to the users whose data was included in your query.
                </p>
                
                <div className="bg-gradient-to-r from-yellow-500/20 to-green-500/20 border border-white rounded-xl p-6">
                  <h3 className="font-medium text-white mb-4">Transaction Summary</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400">{searchCost.toFixed(4)} FLOW</div>
                      <div className="text-sm text-slate-300">Total Distributed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400">{searchResults.length}</div>
                      <div className="text-sm text-slate-300">Users Rewarded</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-sm text-slate-300">
                      Each user received: {(searchCost / searchResults.length).toFixed(6)} FLOW
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">What Happens Next:</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-slate-700 rounded-xl border border-white">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full mx-auto mb-3 flex items-center justify-center border border-white">
                        <span className="text-blue-400 font-bold text-lg">1</span>
                      </div>
                      <p className="text-sm text-slate-300">Users receive FLOW in their earnings wallet</p>
                    </div>
                    <div className="text-center p-6 bg-slate-700 rounded-xl border border-white">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-full mx-auto mb-3 flex items-center justify-center border border-white">
                        <span className="text-purple-400 font-bold text-lg">2</span>
                      </div>
                      <p className="text-sm text-slate-300">You can engage users through airdrops & whitelists</p>
                    </div>
                    <div className="text-center p-6 bg-slate-700 rounded-xl border border-white">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-full mx-auto mb-3 flex items-center justify-center border border-white">
                        <span className="text-green-400 font-bold text-lg">3</span>
                      </div>
                      <p className="text-sm text-slate-300">Build long-term relationships with your audience</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Engagement Tools Available:</h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button variant="outline" className="border-white text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 px-6 py-3 rounded-xl transition-all duration-200">
                      Send Airdrop
                    </Button>
                    <Button variant="outline" className="border-white text-pink-400 hover:bg-pink-400/10 hover:border-pink-400 px-6 py-3 rounded-xl transition-all duration-200">
                      Whitelist Access
                    </Button>
                    <Button variant="outline" className="border-white text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 px-6 py-3 rounded-xl transition-all duration-200">
                      Direct Message
                    </Button>
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
