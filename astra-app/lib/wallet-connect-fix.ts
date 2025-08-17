// Utility to handle WalletConnect warnings in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Suppress WalletConnect warnings in development
  const originalWarn = console.warn
  console.warn = (...args) => {
    const message = args[0]
    if (typeof message === 'string' && message.includes('WalletConnect Core is already initialized')) {
      // Suppress this specific warning
      return
    }
    originalWarn.apply(console, args)
  }

  // Also suppress WalletConnect info logs in development
  const originalInfo = console.info
  console.info = (...args) => {
    const message = args[0]
    if (typeof message === 'string' && message.includes('WalletConnect')) {
      // Suppress WalletConnect info logs
      return
    }
    originalInfo.apply(console, args)
  }
}

// Function to check if WalletConnect is properly initialized
export function isWalletConnectInitialized(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check if WalletConnect is available in the global scope
  return !!(window as any).WalletConnect || !!(window as any).WalletConnectV2
}

// Function to safely initialize WalletConnect
export function safeWalletConnectInit() {
  if (typeof window === 'undefined') return false
  
  try {
    // Check if already initialized
    if (isWalletConnectInitialized()) {
      return true
    }
    
    return true
  } catch (error) {
    console.error('Error checking WalletConnect initialization:', error)
    return false
  }
}
