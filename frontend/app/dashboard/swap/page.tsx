"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDown, Settings, Clock, Zap, Info, ChevronDown, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Enhanced token list with more details
const tokenList = [
  { symbol: "ETH", name: "Ethereum", address: "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72" },
  { symbol: "USDC", name: "USD Coin", address: "0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4" },
  { symbol: "USDT", name: "Tether USD", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
  { symbol: "OP", name: "Optimism", address: "0x4200000000000000000000000000000000000042" },
  { symbol: "ARB", name: "Arbitrum", address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" },
  { symbol: "MATIC", name: "Polygon", address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" },
  { symbol: "AVAX", name: "Avalanche", address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" },
  { symbol: "SOL", name: "Solana", address: "11111111111111111111111111111111" },
  { symbol: "BNB", name: "BNB Chain", address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" },
  { symbol: "FTM", name: "Fantom", address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" },
]

const chainList = [
  { name: "Solana", index: "501", id: "501" },
  { name: "Ethereum", index: "1", id: "1" },
  { name: "BNB Chain", index: "56", id: "56" },
  { name: "Polygon", index: "137", id: "137" },
  { name: "Arbitrum", index: "42161", id: "42161" },
  { name: "Optimism", index: "10", id: "10" },
  { name: "Avalanche C", index: "43114", id: "43114" },
  { name: "Fantom", index: "250", id: "250" },
  { name: "zkSync Era", index: "324", id: "324" },
  { name: "Base", index: "8453", id: "8453" },
]

interface SwapResult {
  code: string
  data: Array<{
    fromTokenAmount: string
    minimumReceived: string
    toTokenAmount: string
    orderId: number
    router?: {
      bridgeId: number
      bridgeName: string
      crossChainFee: string
      crossChainFeeTokenAddress: string
      crossChainFeeUsd: string
      otherNativeFee: string
      otherNativeFeeUsd: string
    }
    tx: {
      data: string
      from: string
      to: string
      value: string
      gasLimit: string
      gasPrice: string
      maxPriorityFeePerGas?: string
    }
  }>
  msg: string
}

export default function SwapPage() {
  const [fromToken, setFromToken] = useState(tokenList[0])
  const [toToken, setToToken] = useState(tokenList[1])
  const [fromChain, setFromChain] = useState(chainList[3]) // Arbitrum
  const [toChain, setToChain] = useState(chainList[0]) // Ethereum
  const [fromAmount, setFromAmount] = useState("1.0")
  const [toAmount, setToAmount] = useState("")
  const [slippage, setSlippage] = useState("0.5")
  const [swapResult, setSwapResult] = useState<SwapResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFromTokens, setShowFromTokens] = useState(false)
  const [showToTokens, setShowToTokens] = useState(false)
  const [showFromChains, setShowFromChains] = useState(false)
  const [showToChains, setShowToChains] = useState(false)

  // Dummy wallet address
  const userWalletAddress = "0x22497668Fb12BA21E6A132de7168D0Ecc69cDF7d"

  const handleSwapTokens = () => {
    const tempToken = fromToken
    const tempChain = fromChain
    setFromToken(toToken)
    setToToken(tempToken)
    setFromChain(toChain)
    setToChain(tempChain)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const formatAmount = (amount: string, decimals = 18): string => {
    // Convert to wei/smallest unit
    const num = Number.parseFloat(amount || "0")
    return (num * Math.pow(10, decimals)).toString()
  }

  const formatDisplayAmount = (amount: string, decimals = 18): string => {
    // Convert from wei to display amount
    const num = Number.parseFloat(amount || "0")
    return (num / Math.pow(10, decimals)).toFixed(6)
  }

  const handleSwap = async () => {
    if (!fromAmount || Number.parseFloat(fromAmount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setLoading(true)
    setError(null)
    setSwapResult(null)

    try {
      // Format amount to smallest unit (assuming 18 decimals for most tokens)
      const formattedAmount = formatAmount(fromAmount, 18)

      const params = {
        amount: formattedAmount,
        fromChainIndex: fromChain.index,
        toChainIndex: toChain.index,
        fromChainId: fromChain.id,
        toChainId: toChain.id,
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        slippage: (Number.parseFloat(slippage) / 100).toString(), // Convert percentage to decimal
        userWalletAddress: userWalletAddress,
      }

      console.log("Swap params:", params)

      const res = await fetch("/api/okx-crosschain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })

      const data = await res.json()
      console.log("My data coming from my api is:::",data);
      
      if (data.error) {
        setError(data.error)
      } else if (data.code === "0" && data.data && data.data.length > 0) {
        setSwapResult(data)
        // Update estimated receive amount
        const estimatedAmount = formatDisplayAmount(data.data[0].toTokenAmount, 18)
        setToAmount(estimatedAmount)
      } else {
        setError(data.msg || "Swap failed")
      }
    } catch (e: any) {
      setError(e.message || "Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const TokenSelector = ({
    tokens,
    selectedToken,
    onSelect,
    show,
    onToggle,
  }: {
    tokens: typeof tokenList
    selectedToken: (typeof tokenList)[0]
    onSelect: (token: (typeof tokenList)[0]) => void
    show: boolean
    onToggle: () => void
  }) => (
    <div className="relative">
      <Button
        className="bg-white/10 hover:bg-white/20 text-white gap-2 font-medium border-none h-9"
        variant="outline"
        onClick={onToggle}
      >
        <TokenIcon token={selectedToken.symbol} />
        {selectedToken.symbol}
        <ChevronDown className="h-4 w-4" />
      </Button>

      {show && (
        <div className="absolute top-full mt-2 right-0 bg-black/90 border border-white/20 rounded-lg p-2 min-w-[200px] z-50 backdrop-blur-sm">
          <div className="max-h-60 overflow-y-auto">
            {tokens.map((token) => (
              <button
                key={token.symbol}
                className="w-full flex items-center gap-3 p-2 hover:bg-white/10 rounded text-left text-white"
                onClick={() => {
                  onSelect(token)
                  onToggle()
                }}
              >
                <TokenIcon token={token.symbol} />
                <div>
                  <div className="font-medium">{token.symbol}</div>
                  <div className="text-xs text-white/60">{token.name}</div>
                </div>
                {selectedToken.symbol === token.symbol && <Check className="h-4 w-4 ml-auto text-green-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const ChainSelector = ({
    chains,
    selectedChain,
    onSelect,
    show,
    onToggle,
  }: {
    chains: typeof chainList
    selectedChain: (typeof chainList)[0]
    onSelect: (chain: (typeof chainList)[0]) => void
    show: boolean
    onToggle: () => void
  }) => (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="border-white/20 hover:bg-white/10 text-white text-xs h-7"
        onClick={onToggle}
      >
        {selectedChain.name}
        <ChevronDown className="h-3 w-3 ml-1" />
      </Button>

      {show && (
        <div className="absolute top-full mt-2 right-0 bg-black/90 border border-white/20 rounded-lg p-2 min-w-[150px] z-50 backdrop-blur-sm">
          <div className="max-h-48 overflow-y-auto">
            {chains.map((chain) => (
              <button
                key={chain.index}
                className="w-full flex items-center justify-between p-2 hover:bg-white/10 rounded text-left text-white text-sm"
                onClick={() => {
                  onSelect(chain)
                  onToggle()
                }}
              >
                {chain.name}
                {selectedChain.index === chain.index && <Check className="h-3 w-3 text-green-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text mb-1">
            Cross-Chain Swap
          </h1>
          <p className="text-white/60">Trade tokens across different blockchains</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-full border-white/20 hover:bg-white/10 text-white">
            <Clock className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full border-white/20 hover:bg-white/10 text-white">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all hover:shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/60">From</span>
            <ChainSelector
              chains={chainList}
              selectedChain={fromChain}
              onSelect={setFromChain}
              show={showFromChains}
              onToggle={() => setShowFromChains(!showFromChains)}
            />
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
                onClick={() => setFromAmount("1.0")}
              >
                MAX
              </Button>
              <TokenSelector
                tokens={tokenList}
                selectedToken={fromToken}
                onSelect={setFromToken}
                show={showFromTokens}
                onToggle={() => setShowFromTokens(!showFromTokens)}
              />
            </div>
          </div>
          <div className="text-sm text-white/60 mt-1">Balance: 12.45 {fromToken.symbol}</div>
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
            <ChainSelector
              chains={chainList}
              selectedChain={toChain}
              onSelect={setToChain}
              show={showToChains}
              onToggle={() => setShowToChains(!showToChains)}
            />
          </div>
          <div className="flex justify-between items-center mb-2">
            <input
              type="text"
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
              className="text-2xl font-medium bg-transparent outline-none w-[60%] text-white"
              placeholder="0.0"
              readOnly
            />
            <TokenSelector
              tokens={tokenList}
              selectedToken={toToken}
              onSelect={setToToken}
              show={showToTokens}
              onToggle={() => setShowToTokens(!showToTokens)}
            />
          </div>
          <div className="text-sm text-white/60 mt-1">Balance: 350.21 {toToken.symbol}</div>
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
                {["0.1", "0.5", "1.0", "3.0"].map((value) => (
                  <Button
                    key={value}
                    variant="outline"
                    size="sm"
                    className={`h-7 px-2.5 py-1 border-white/20 text-white text-xs ${
                      slippage === value ? "bg-white/20" : "hover:bg-white/10"
                    }`}
                    onClick={() => setSlippage(value)}
                  >
                    {value}%
                  </Button>
                ))}
              </div>
            </div>

            {fromChain.index !== toChain.index && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Cross-Chain Bridge</span>
                <span className="text-sm text-white/80 font-medium">
                  {swapResult?.data?.[0]?.router?.bridgeName || "Auto"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Button
        className="w-full mt-6 py-6 text-lg gap-2 bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 text-white shadow-lg backdrop-blur-sm"
        size="lg"
        onClick={handleSwap}
        disabled={loading || !fromAmount || Number.parseFloat(fromAmount) <= 0}
      >
        <Zap className="h-5 w-5" />
        {loading ? "Getting Quote..." : "Get Quote & Swap"}
      </Button>

      {error && (
        <Card className="mt-4 bg-red-900/20 border-red-500/30">
          <CardContent className="p-4">
            <div className="text-red-400 text-sm">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {swapResult && !error && (
        <Card className="mt-4 bg-black/40 border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-lg">Swap Quote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {swapResult.data.map((quote, index) => (
              <div key={index} className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">You Pay:</span>
                    <div className="text-white font-medium">
                      {formatDisplayAmount(quote.fromTokenAmount)} {fromToken.symbol}
                    </div>
                  </div>
                  <div>
                    <span className="text-white/60">You Receive:</span>
                    <div className="text-white font-medium">
                      {formatDisplayAmount(quote.toTokenAmount)} {toToken.symbol}
                    </div>
                  </div>
                  <div>
                    <span className="text-white/60">Minimum Received:</span>
                    <div className="text-white font-medium">
                      {formatDisplayAmount(quote.minimumReceived)} {toToken.symbol}
                    </div>
                  </div>
                  {quote.router && (
                    <div>
                      <span className="text-white/60">Bridge Fee:</span>
                      <div className="text-white font-medium">${quote.router.crossChainFeeUsd}</div>
                    </div>
                  )}
                </div>

                {quote.router && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-white/80 font-medium mb-2">Bridge Information</div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-white/60">Bridge:</span>
                        <span className="text-white">{quote.router.bridgeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Bridge ID:</span>
                        <span className="text-white">{quote.router.bridgeId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Cross-chain Fee:</span>
                        <span className="text-white">{quote.router.crossChainFee}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white/80 font-medium mb-2">Transaction Details</div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-white/60">To:</span>
                      <span className="text-white font-mono text-xs">{quote.tx.to}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Gas Limit:</span>
                      <span className="text-white">{quote.tx.gasLimit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Gas Price:</span>
                      <span className="text-white">{quote.tx.gasPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="mt-5 text-center">
        <p className="text-xs text-white/40">
          Powered by OKX DEX API. Cross-chain swaps enabled via multiple bridge protocols.
        </p>
      </div>
    </div>
  )
}

function TokenIcon({ token }: { token: string }) {
  const colors: Record<string, string> = {
    SOL: "bg-gradient-to-r from-purple-500 to-blue-500",
    USDC: "bg-blue-500",
    USDT: "bg-green-500",
    ETH: "bg-purple-700",
    OP: "bg-red-500",
    ARB: "bg-blue-600",
    MATIC: "bg-purple-600",
    AVAX: "bg-red-600",
    BNB: "bg-yellow-500",
    FTM: "bg-blue-400",
  }
  return <div className={`w-5 h-5 rounded-full ${colors[token] || "bg-gray-500"}`}></div>
}
