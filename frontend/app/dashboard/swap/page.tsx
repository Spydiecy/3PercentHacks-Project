"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDown, Settings, RefreshCw, Clock, Zap, Info, ChevronDown } from "lucide-react"

// --- Your token and chain maps ---
const tokenAddressMap: Record<string, string> = {
  ETH: "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72",
  OP: "0x4200000000000000000000000000000000000042",
  BSC: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  OKT: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  SONIC: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  XLAYER: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  POLYGON: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  ARB: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  AVAX: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  ZKSYNC: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  POLYZKEVM: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  BASE: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  LINEA: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  FTM: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  MANTLE: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  CFX: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  METIS: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  MERLIN: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  BLAST: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  MANTA: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  SCROLL: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  CRO: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  ZETA: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  TRON: "TRX",
  SOL: "SOL",
  SUI: "0x2::sui::SUI",
  TON: "TON",
  MYS: "3",
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
};

// Example chain index map (fill with your actual values)
const chainIndexMap: Record<string, string> = {
  Ethereum: "1",
  "BNB Chain": "56",
  OKTC: "66",
  Polygon: "137",
  Fantom: "250",
  Arbitrum: "42161",
  Optimism: "10",
  Cronos: "25",
  "Avalanche C": "43114",
  TRON: "728126428",
  Solana: "101",
  "zkSync Era": "324",
  "Polygon zkEvm": "1101",
  Linea: "59144",
  Mantle: "5000",
  Base: "8453",
  Manta: "169",
  Metis: "1088",
  SUI: "sui",
  Scroll: "534352",
  Starknet: "23448594291968334",
  Blast: "238",
  Merlin: "4200",
  "X Layer": "196",
};

export default function SwapPage() {
  const [fromToken, setFromToken] = useState("SOL")
  const [toToken, setToToken] = useState("USDC")
  const [fromAmount, setFromAmount] = useState("1.0")
  const [toAmount, setToAmount] = useState("97.35")
  const [slippage, setSlippage] = useState("0.5")
  const [swapResult, setSwapResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // For demo, hardcode these, or get from wallet/user input
  const fromChain = "Solana"
  const toChain = "Ethereum"
  const userWalletAddress = "DemHwXRcTyc76MuRwXwyhDdVpYLwoDz1T2rVpzaajMsR"

  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const handleSwap = async () => {
    setLoading(true)
    setError(null)
    setSwapResult(null)
    try {
      // Convert amount to minimal units if needed (for demo, just use as string)
      // For real implementation, multiply by 10**decimals based on token
      const params = {
        "amount": "22222223",  // 1 ETH in wei
  "fromChainIndex": "324",
  "toChainIndex": "1",
  "fromChainId": "324",
  "toChainId": "1",
  "fromTokenAddress": "0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4",  // WETH
  "toTokenAddress": "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",    // USDC on Arbitrum
  "slippage": "0.07",
  "userWalletAddress": "0x22497668Fb12BA21E6A132de7168D0Ecc69cDF7d"
}

      const res = await fetch("/api/okx-crosschain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })

      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setSwapResult(data)
      }
    } catch (e: any) {
      setError(e.message || "Unknown error")
    } finally {
      setLoading(false)
    }
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
        onClick={handleSwap}
        disabled={loading}
      >
        <Zap className="h-5 w-5" />
        {loading ? "Swapping..." : "Swap"}
      </Button>
      
      {error && (
        <div className="mt-4 p-4 bg-black/30 rounded text-red-400 text-sm border border-white/10">
          Error: {error}
        </div>
      )}
      {swapResult && !error && (
        <div className="mt-4 p-4 bg-black/30 rounded text-white text-sm border border-white/10">
          <pre>{JSON.stringify(swapResult, null, 2)}</pre>
        </div>
      )}

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
