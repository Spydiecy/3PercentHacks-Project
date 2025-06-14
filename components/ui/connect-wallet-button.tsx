"use client"

import { useWallet } from "@/contexts/WalletContext"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function ConnectWalletButton({ className }: { className?: string }) {
  const { connectWallet, disconnectWallet, connected, connecting, publicKey } = useWallet()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  const truncateAddress = (address?: string | null) => {
    if (!address) return ""
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }
  
  const handleConnect = async () => {
    await connectWallet()
  }
  
  const handleDisconnect = async () => {
    await disconnectWallet()
    setIsDropdownOpen(false)
  }
  
  if (connected && publicKey) {
    return (
      <div className="relative">
        <Button 
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
          <span>{truncateAddress(publicKey)}</span>
        </Button>
        
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md border border-gray-800 bg-black/80 backdrop-blur-lg shadow-lg z-50 overflow-hidden">
            <button
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 transition-colors"
              onClick={handleDisconnect}
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>
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
