"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDown, Settings, RefreshCw, Clock, Zap, Info, ChevronDown } from "lucide-react"

export default function SwapPage() {
  const [fromToken, setFromToken] = useState("SOL")
  const [toToken, setToToken] = useState("USDC")
  const [fromAmount, setFromAmount] = useState("1.0")
  const [toAmount, setToAmount] = useState("97.35")
  const [slippage, setSlippage] = useState("0.5")
  
  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text mb-1">Swap</h1>
          <p className="text-white/60">Trade tokens instantly</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full border-white/20 hover:bg-white/10 text-white"
          >
            <Clock className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full border-white/20 hover:bg-white/10 text-white"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all hover:shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/60">From</span>
            <span className="text-sm text-white/60">
              Balance: 12.45 {fromToken}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <input
              type="text"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="text-2xl font-medium bg-transparent outline-none w-[60%] text-white"
              placeholder="0.0"
            />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/20 hover:bg-white/10 text-white text-xs h-7"
              >
                MAX
              </Button>
              <Button 
                className="bg-white/10 hover:bg-white/20 text-white gap-2 font-medium border-none h-9" 
                variant="outline"
              >
                <TokenIcon token={fromToken} />
                {fromToken}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-white/60 mt-1">
            ≈ $97.35
          </div>
        </div>
        
        <div className="flex justify-center -mt-2 -mb-2 z-10 relative">
          <Button 
            onClick={handleSwapTokens}
            size="icon" 
            className="rounded-full h-10 w-10 shadow-md bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30"
          >
            <ArrowDown className="h-5 w-5 text-white" />
          </Button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/60">To</span>
            <span className="text-sm text-white/60">
              Balance: 350.21 {toToken}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <input
              type="text"
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
              className="text-2xl font-medium bg-transparent outline-none w-[60%] text-white"
              placeholder="0.0"
            />
            <Button 
              className="bg-white/10 hover:bg-white/20 text-white gap-2 font-medium border-none h-9" 
              variant="outline"
            >
              <TokenIcon token={toToken} />
              {toToken}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-sm text-white/60 mt-1">
            ≈ $97.35
          </div>
        </div>
      </div>
      
      <div className="mt-6 space-y-4">
        <div className="backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all hover:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-white/80 font-medium">Transaction Settings</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-sm text-white/60">Slippage Tolerance</span>
                <button className="text-white/40 hover:text-white/60">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2.5 py-1 border-white/20 bg-white/10 text-white text-xs"
                >
                  Auto
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2.5 py-1 border-white/20 hover:bg-white/10 text-white text-xs"
                >
                  0.1%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2.5 py-1 border-white/20 hover:bg-white/10 text-white text-xs"
                >
                  0.5%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2.5 py-1 border-white/20 hover:bg-white/10 text-white text-xs"
                >
                  1%
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Transaction Fee</span>
              <span className="text-sm text-white/80 font-medium">~0.001 SOL</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Route</span>
              <div className="flex items-center gap-1">
                <span className="text-sm text-white/80 font-medium">Jupiter</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 hover:bg-white/10 text-white/60"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Rate</span>
              <span className="text-sm text-white/80 font-medium">1 SOL = 97.35 USDC</span>
            </div>
          </div>
        </div>
      </div>
      
      <Button 
        className="w-full mt-6 py-6 text-lg gap-2 bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 text-white shadow-lg backdrop-blur-sm" 
        size="lg"
      >
        <Zap className="h-5 w-5" />
        Swap
      </Button>
      
      <div className="mt-5 text-center">
        <p className="text-xs text-white/40">
          Powered by Jupiter Protocol. Swap at the best rates across all Solana DEXs.
        </p>
      </div>
    </div>
  )
}

function TokenIcon({ token }: { token: string }) {
  const colors: Record<string, string> = {
    SOL: "bg-gradient-to-r from-purple-500 to-blue-500",
    USDC: "bg-blue-500",
    BONK: "bg-yellow-500",
    ETH: "bg-purple-700",
    JUP: "bg-orange-500",
    USDT: "bg-green-500",
  }
  
  return (
    <div className={`w-5 h-5 rounded-full ${colors[token] || "bg-gray-500"}`}></div>
  )
}
