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

const authClient = new FutureverseAuthClient({
  clientId: process.env.NEXT_PUBLIC_FUTUREVERSE_CLIENT_ID || '2qC_LOMj3oHhri4XpJL2X',
  environment: (process.env.NEXT_PUBLIC_FUTUREVERSE_ENVIRONMENT as any) || 'production',
  redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/dashboard/` : 'http://astra-trn.vercel.app/dashboard/'
})

const WalletProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<any | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const { signIn, signOut, userSession } = useAuth()

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (userSession) {
          setConnected(true)
          setPublicKey(userSession.eoa || null)
        } else {
          setConnected(false)
          setPublicKey(null)
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
        setConnected(false)
        setPublicKey(null)
      }
    }
    
    checkAuthStatus()
  }, [userSession])

  const connectWallet = async () => {
    try {
      setConnecting(true)
      await signIn({ type: 'eoa' })
    } catch (error) {
      console.error("Error connecting wallet:", error)
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

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FutureverseAuthProvider authClient={authClient}>
      <WalletProviderInner>
        {children}
      </WalletProviderInner>
    </FutureverseAuthProvider>
  )
}
