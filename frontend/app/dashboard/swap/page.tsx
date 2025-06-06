"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDown, Settings, RefreshCw, Clock, Zap } from "lucide-react"

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
        <h1 className="text-3xl font-bold">Swap</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Clock className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">From</span>
            <span className="text-sm text-muted-foreground">
              Balance: 12.45 {fromToken}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="text-2xl font-medium bg-transparent outline-none w-[60%]"
              placeholder="0.0"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm">MAX</Button>
              <Button 
                className="gap-2 font-medium" 
                variant="outline"
              >
                <TokenIcon token={fromToken} />
                {fromToken}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center -mt-3 -mb-3 z-10 relative">
          <Button 
            onClick={handleSwapTokens}
            size="icon" 
            variant="secondary" 
            className="rounded-full h-10 w-10 shadow-md"
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">To</span>
            <span className="text-sm text-muted-foreground">
              Balance: 350.21 {toToken}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
              className="text-2xl font-medium bg-transparent outline-none w-[60%]"
              placeholder="0.0"
            />
            <Button 
              className="gap-2 font-medium" 
              variant="outline"
            >
              <TokenIcon token={toToken} />
              {toToken}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between bg-card border border-border p-3 rounded-lg">
          <span className="text-sm">Rate</span>
          <div className="flex items-center gap-1">
            <span className="text-sm">1 {fromToken} = 97.35 {toToken}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between bg-card border border-border p-3 rounded-lg">
          <span className="text-sm">Slippage Tolerance</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 px-2 py-1">0.1%</Button>
            <Button variant="outline" size="sm" className="h-7 px-2 py-1">0.5%</Button>
            <Button variant="outline" size="sm" className="h-7 px-2 py-1">1%</Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between bg-card border border-border p-3 rounded-lg">
          <span className="text-sm">Transaction Fee</span>
          <span className="text-sm">~0.001 SOL</span>
        </div>
        
        <div className="flex items-center justify-between bg-card border border-border p-3 rounded-lg">
          <span className="text-sm">Route</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">Jupiter</span>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
      
      <Button className="w-full mt-6 py-6 text-lg gap-2" size="lg">
        <Zap className="h-5 w-5" />
        Swap
      </Button>
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
