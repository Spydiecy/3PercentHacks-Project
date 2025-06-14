"use client"

import { useWallet } from "@/contexts/WalletContext"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { createPortal } from "react-dom"

export function ConnectWalletButton({ className }: { className?: string }) {
  const { connectWallet, disconnectWallet, connected, connecting, publicKey, userSession } = useWallet()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Handle mounting for portal
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])
  
  const truncateAddress = (address?: string | null) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
  
  const handleConnect = async () => {
    await connectWallet()
  }
  
  const handleDisconnect = async () => {
    await disconnectWallet()
    setIsDropdownOpen(false)
  }
  
  // Get the best address to display (prioritize EOA, then Futurepass, then publicKey)
  const displayAddress = userSession?.eoa || userSession?.futurepass || publicKey
  
  // Calculate dropdown position
  const getDropdownPosition = () => {
    if (!buttonRef.current) return { top: 0, right: 0 }
    
    const rect = buttonRef.current.getBoundingClientRect()
    return {
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right
    }
  }
  
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
  
  useEffect(() => {
    if (isDropdownOpen && buttonRef.current) {
      setDropdownPosition(getDropdownPosition())
    }
  }, [isDropdownOpen])
  
  if (connected && displayAddress) {
    return (
      <>
        <Button 
          ref={buttonRef}
          variant="outline"
          size="sm"
          className={cn(
            "border-gray-800 bg-black/20 hover:bg-white/5 text-white",
            "flex items-center gap-2", 
            className
          )}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Wallet className="h-4 w-4" />
          <span>{truncateAddress(displayAddress)}</span>
        </Button>
        
        {isDropdownOpen && mounted && createPortal(
          <div 
            ref={dropdownRef}
            className="fixed w-64 rounded-md border border-gray-800 bg-black/95 backdrop-blur-lg shadow-xl overflow-hidden"
            style={{
              top: dropdownPosition.top,
              right: dropdownPosition.right,
              zIndex: 99999
            }}
          >
            <div className="px-4 py-3 border-b border-gray-800">
              <p className="text-xs text-gray-400">Connected Address</p>
              <p className="text-sm text-white font-mono break-all">{displayAddress}</p>
              {userSession?.futurepass && userSession.eoa && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400">Futurepass</p>
                  <p className="text-sm text-white font-mono break-all">{userSession.futurepass}</p>
                </div>
              )}
            </div>
            <button
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 transition-colors"
              onClick={handleDisconnect}
            >
              Disconnect Wallet
            </button>
          </div>,
          document.body
        )}
      </>
    )
  }
  
  return (
    <Button 
      variant="outline"
      size="sm"
      className={cn(
        "border-gray-800 bg-black/20 hover:bg-white/5 text-white",
        "flex items-center gap-2", 
        className
      )}
      onClick={handleConnect}
      disabled={connecting}
    >
      <Wallet className="h-4 w-4" />
      <span>{connecting ? "Connecting..." : "Connect Wallet"}</span>
    </Button>
  )
}
