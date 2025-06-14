"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { FutureverseAuthClient } from '@futureverse/auth-react/auth'
import { FutureverseAuthProvider, useAuth } from '@futureverse/auth-react'

interface WalletContextType {
  wallet: any | null
  connecting: boolean
  connected: boolean
  publicKey: string | null
  userSession: any | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
}

const WalletContext = createContext<WalletContextType>({
  wallet: null,
  connecting: false,
  connected: false,
  publicKey: null,
  userSession: null,
  connectWallet: async () => {},
  disconnectWallet: async () => {}
})

export const useWallet = () => useContext(WalletContext)

// Create auth client
const authClient = new FutureverseAuthClient({
  clientId: process.env.NEXT_PUBLIC_FUTUREVERSE_CLIENT_ID || '2qC_LOMj3oHhri4XpJL2X',
  environment: 'production',
  redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/dashboard/` : 'https://astra-trn.vercel.app/dashboard/',
  responseType: 'code'
})

// Inner provider that uses the useAuth hook
const WalletProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<any | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  
  // Get auth hooks from Futureverse
  const { signIn, signOut, userSession } = useAuth()

  useEffect(() => {
    // Check if user is already authenticated
    if (userSession) {
      setConnected(true)
      // Try to get EOA address if available
      setPublicKey(userSession.eoa || userSession.futurepass || null)
      console.log("User session found:", userSession)
    } else {
      setConnected(false)
      setPublicKey(null)
    }
  }, [userSession])

  const connectWallet = async () => {
    try {
      setConnecting(true)
      
      // Use Futureverse Auth sign in with default options
      await signIn({})
      
      console.log("Futureverse Auth sign in initiated")
    } catch (error) {
      console.error("Error connecting wallet:", error)
      // For development, you might want to show a more user-friendly error
      alert("Failed to connect wallet. Please try again.")
    } finally {
      setConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      if (signOut) {
        await signOut()
      }
      setConnected(false)
      setPublicKey(null)
      setWallet(null)
      console.log("Wallet disconnected")
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
    }
  }

  return (
    <WalletContext.Provider 
      value={{
        wallet,
        connecting,
        connected,
        publicKey,
        userSession,
        connectWallet,
        disconnectWallet
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

// Main provider that wraps with FutureverseAuthProvider
export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FutureverseAuthProvider authClient={authClient}>
      <WalletProviderInner>
        {children}
      </WalletProviderInner>
    </FutureverseAuthProvider>
  )
}