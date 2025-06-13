"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface WalletContextType {
  wallet: any | null
  connecting: boolean
  connected: boolean
  publicKey: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
}

const WalletContext = createContext<WalletContextType>({
  wallet: null,
  connecting: false,
  connected: false,
  publicKey: null,
  connectWallet: async () => {},
  disconnectWallet: async () => {}
})

export const useWallet = () => useContext(WalletContext)

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<any | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)

  useEffect(() => {
    const checkForRootWallet = async () => {
      try {
        // Check if window is defined (browser environment)
        if (typeof window !== 'undefined') {
          // Check if Root Wallet is installed
          const rootWallet = window.trn
          
          if (rootWallet) {
            setWallet(rootWallet)
            
            // Check if already connected
            if (rootWallet.isConnected) {
              const key = rootWallet.publicKey?.toString()
              setConnected(true)
              setPublicKey(key || null)
            }
            
            // Handle connection change events
            rootWallet.on('connect', () => {
              const key = rootWallet.publicKey?.toString()
              setConnected(true)
              setPublicKey(key || null)
              setConnecting(false)
            })
            
            rootWallet.on('disconnect', () => {
              setConnected(false)
              setPublicKey(null)
            })
          }
        }
      } catch (error) {
        console.error("Error checking for Root wallet:", error)
      }
    }
    
    // Only run in browser
    if (typeof window !== 'undefined') {
      checkForRootWallet()
    }
    
    return () => {
      // Clean up listeners if needed
      if (wallet) {
        wallet.off('connect')
        wallet.off('disconnect')
      }
    }
  }, [])

  const connectWallet = async () => {
    try {
      if (!wallet) {
        window.open('https://wallet.rootnet.live/', '_blank')
        return
      }
      
      setConnecting(true)
      
      // Root wallet connection
      await wallet.connect()
      
    } catch (error) {
      console.error("Error connecting to wallet:", error)
      setConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      if (wallet) {
        await wallet.disconnect()
        setConnected(false)
        setPublicKey(null)
      }
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
        connectWallet,
        disconnectWallet
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
