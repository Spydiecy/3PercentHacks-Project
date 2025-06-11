"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Settings, Clock, Info, ChevronDown, Check, Copy, ArrowRightLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Solana tokens
const solanaTokens = [
  { symbol: "SOL", name: "Solana", address: "11111111111111111111111111111111", decimals: 9 },
  { symbol: "USDC", name: "USD Coin", address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6 },
  { symbol: "USDT", name: "Tether USD", address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6 },
  { symbol: "RAY", name: "Raydium", address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", decimals: 6 },
  { symbol: "ORCA", name: "Orca", address: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE", decimals: 6 },
]

// Other chain tokens
const evmTokens = [
  { symbol: "ETH", name: "Ethereum", address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", decimals: 18 },
  { symbol: "USDC", name: "USD Coin", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
  { symbol: "USDT", name: "Tether USD", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
  { symbol: "WBTC", name: "Wrapped Bitcoin", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8 },
  { symbol: "DAI", name: "Dai Stablecoin", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 },
]

const chainList = [
  { name: "Solana", index: "501", id: "501", color: "from-purple-500 to-blue-500" },
  { name: "Ethereum", index: "1", id: "1", color: "from-blue-600 to-purple-600" },
  { name: "BNB Chain", index: "56", id: "56", color: "from-yellow-500 to-orange-500" },
  { name: "Polygon", index: "137", id: "137", color: "from-purple-600 to-pink-500" },
  { name: "Arbitrum", index: "42161", id: "42161", color: "from-blue-600 to-cyan-500" },
  { name: "Optimism", index: "10", id: "10", color: "from-red-500 to-pink-500" },
  { name: "Avalanche", index: "43114", id: "43114", color: "from-red-600 to-orange-500" },
  { name: "Fantom", index: "250", id: "250", color: "from-blue-400 to-cyan-400" },
]

const routeOptions = [
  { value: "1", label: "Optimal Route", description: "Best balance of cost and speed" },
  { value: "0", label: "Most Tokens", description: "Maximum tokens received" },
  { value: "2", label: "Fastest Route", description: "Quickest execution time" },
]

interface CrossChainSwapResult {
  success: boolean
  action: string
  timestamp: string
  fromChain: string
  toChain: string
  code: string
  data: Array<{
    fromTokenAmount: string
    toTokenAmount: string
    minmumReceive: string
    router: {
      bridgeId: number
      bridgeName: string
      otherNativeFee: string
      crossChainFee: string
      crossChainFeeTokenAddress: string
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

export default function CrossChainSwapPage() {
  const [fromChain, setFromChain] = useState(chainList[0]) // Solana
  const [toChain, setToChain] = useState(chainList[1]) // Ethereum
  const [fromToken, setFromToken] = useState(solanaTokens[0]) // SOL
  const [toToken, setToToken] = useState(evmTokens[1]) // USDC
  const [fromAmount, setFromAmount] = useState("0.1")
  const [toAmount, setToAmount] = useState("")
  const [slippage, setSlippage] = useState("0.01")
  const [routeSort, setRouteSort] = useState("1")
  const [feePercent, setFeePercent] = useState("0.1")
  const [swapResult, setSwapResult] = useState<CrossChainSwapResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFromChains, setShowFromChains] = useState(false)
  const [showToChains, setShowToChains] = useState(false)
  const [showFromTokens, setShowFromTokens] = useState(false)
  const [showToTokens, setShowToTokens] = useState(false)
  const [showRouteOptions, setShowRouteOptions] = useState(false)

  // Demo wallet addresses
  const solanaWallet = "DemHwXRcTyc76MuRwXwyhDdVpYLwoDz1T2rVpzaajMsR"
  const evmWallet = "0x22497668Fb12BA21E6A132de7168D0Ecc69cDF7d"

  const getCurrentTokens = (chain: (typeof chainList)[0]) => {
    return chain.index === "501" ? solanaTokens : evmTokens
  }

  const getCurrentWallet = (chain: (typeof chainList)[0]) => {
    return chain.index === "501" ? solanaWallet : evmWallet
  }

  const handleSwapChains = () => {
    const tempChain = fromChain
    const tempToken = fromToken
    setFromChain(toChain)
    setToChain(tempChain)
    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
    setSwapResult(null)
  }

  const formatAmount = (amount: string, decimals: number): string => {
    const num = Number.parseFloat(amount || "0")
    return Math.floor(num * Math.pow(10, decimals)).toString()
  }

  const formatDisplayAmount = (amount: string, decimals: number): string => {
    const num = Number.parseFloat(amount || "0")
    return (num / Math.pow(10, decimals)).toFixed(6)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleBuildTransaction = async () => {
    if (!fromAmount || Number.parseFloat(fromAmount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    // Validate that at least one chain is Solana
    if (fromChain.index !== "501" && toChain.index !== "501") {
      setError("At least one chain must be Solana for cross-chain swaps")
      return
    }

    setLoading(true)
    setError(null)
    setSwapResult(null)

    try {
      const formattedAmount = formatAmount(fromAmount, fromToken.decimals)

      const params = {
        action: "build-tx",
        fromChainIndex: fromChain.index,
        toChainIndex: toChain.index,
        fromChainId: fromChain.id,
        toChainId: toChain.id,
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount: formattedAmount,
        slippage: slippage,
        userWalletAddress: getCurrentWallet(fromChain),
        receiveAddress: getCurrentWallet(toChain),
        sort: routeSort,
        feePercent: feePercent,
        priceImpactProtectionPercentage: "0.25", // 25% max price impact
      }

      console.log("Cross-chain swap params:", params)

      const res = await fetch("/api/cross-chain-swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })

      const data = await res.json()
      console.log("Cross-chain swap response:", data)

      if (data.error) {
        setError(data.error)
      } else if (data.success && data.data && data.data.length > 0) {
        setSwapResult(data)
        // Update estimated receive amount
        const estimatedAmount = formatDisplayAmount(data.data[0].toTokenAmount, toToken.decimals)
        setToAmount(estimatedAmount)
      } else {
        setError(data.msg || "Failed to build cross-chain transaction")
      }
    } catch (e: any) {
      setError(e.message || "Network error occurred")
    } finally {
      setLoading(false)
    }
  }

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
        className="border-white/20 hover:bg-white/10 text-white text-xs h-8 gap-2"
        onClick={onToggle}
      >
        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${selectedChain.color}`}></div>
        {selectedChain.name}
        <ChevronDown className="h-3 w-3" />
      </Button>

      {show && (
        <div className="absolute top-full mt-2 right-0 bg-black/90 border border-white/20 rounded-lg p-2 min-w-[180px] z-50 backdrop-blur-sm">
          <div className="max-h-48 overflow-y-auto">
            {chains.map((chain) => (
              <button
                key={chain.index}
                className="w-full flex items-center gap-3 p-2 hover:bg-white/10 rounded text-left text-white text-sm"
                onClick={() => {
                  onSelect(chain)
                  onToggle()
                  setSwapResult(null)
                  setToAmount("")
                }}
              >
                <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${chain.color}`}></div>
                <span>{chain.name}</span>
                {selectedChain.index === chain.index && <Check className="h-3 w-3 ml-auto text-green-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const TokenSelector = ({
    tokens,
    selectedToken,
    onSelect,
    show,
    onToggle,
  }: {
    tokens: any[]
    selectedToken: any
    onSelect: (token: any) => void
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
                  setSwapResult(null)
                  setToAmount("")
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

  return (
    <div className="max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text mb-1">
            Cross-Chain Swap
          </h1>
          <p className="text-white/60">Bridge tokens across different blockchains</p>
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
              onSelect={(chain) => {
                setFromChain(chain)
                const tokens = getCurrentTokens(chain)
                setFromToken(tokens[0])
              }}
              show={showFromChains}
              onToggle={() => setShowFromChains(!showFromChains)}
            />
          </div>
          <div className="flex justify-between items-center mb-2">
            <input
              type="text"
              value={fromAmount}
              onChange={(e) => {
                setFromAmount(e.target.value)
                setSwapResult(null)
                setToAmount("")
              }}
              className="text-2xl font-medium bg-transparent outline-none w-[60%] text-white"
              placeholder="0.0"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 hover:bg-white/10 text-white text-xs h-7"
                onClick={() => {
                  setFromAmount("1.0")
                  setSwapResult(null)
                  setToAmount("")
                }}
              >
                MAX
              </Button>
              <TokenSelector
                tokens={getCurrentTokens(fromChain)}
                selectedToken={fromToken}
                onSelect={setFromToken}
                show={showFromTokens}
                onToggle={() => setShowFromTokens(!showFromTokens)}
              />
            </div>
          </div>
          <div className="text-sm text-white/60 mt-1">
            Balance: 12.45 {fromToken.symbol} • Wallet: {getCurrentWallet(fromChain).slice(0, 8)}...
          </div>
        </div>

        <div className="flex justify-center -mt-2 -mb-2 z-10 relative">
          <Button
            onClick={handleSwapChains}
            size="icon"
            className="rounded-full h-10 w-10 shadow-md bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-white/20 hover:border-white/30"
          >
            <ArrowRightLeft className="h-5 w-5 text-white" />
          </Button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/60">To</span>
            <ChainSelector
              chains={chainList}
              selectedChain={toChain}
              onSelect={(chain) => {
                setToChain(chain)
                const tokens = getCurrentTokens(chain)
                setToToken(tokens[0])
              }}
              show={showToChains}
              onToggle={() => setShowToChains(!showToChains)}
            />
          </div>
          <div className="flex justify-between items-center mb-2">
            <input
              type="text"
              value={toAmount}
              className="text-2xl font-medium bg-transparent outline-none w-[60%] text-white"
              placeholder="0.0"
              readOnly
            />
            <TokenSelector
              tokens={getCurrentTokens(toChain)}
              selectedToken={toToken}
              onSelect={setToToken}
              show={showToTokens}
              onToggle={() => setShowToTokens(!showToTokens)}
            />
          </div>
          <div className="text-sm text-white/60 mt-1">
            Balance: 350.21 {toToken.symbol} • Wallet: {getCurrentWallet(toChain).slice(0, 8)}...
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all hover:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-white/80 font-medium">Bridge Settings</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-sm text-white/60">Slippage Tolerance</span>
                <button className="text-white/40 hover:text-white/60">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                {["0.002", "0.01", "0.025", "0.05"].map((value) => (
                  <Button
                    key={value}
                    variant="outline"
                    size="sm"
                    className={`h-7 px-2.5 py-1 border-white/20 text-white text-xs ${
                      slippage === value ? "bg-purple-500/20 border-purple-500/40" : "hover:bg-white/10"
                    }`}
                    onClick={() => setSlippage(value)}
                  >
                    {Number.parseFloat(value) * 100}%
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Route Optimization</span>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 hover:bg-white/10 text-white text-xs h-7 gap-2"
                  onClick={() => setShowRouteOptions(!showRouteOptions)}
                >
                  {routeOptions.find((r) => r.value === routeSort)?.label}
                  <ChevronDown className="h-3 w-3" />
                </Button>
                {showRouteOptions && (
                  <div className="absolute top-full mt-2 right-0 bg-black/90 border border-white/20 rounded-lg p-2 min-w-[200px] z-50 backdrop-blur-sm">
                    {routeOptions.map((option) => (
                      <button
                        key={option.value}
                        className="w-full text-left p-2 hover:bg-white/10 rounded text-white text-sm"
                        onClick={() => {
                          setRouteSort(option.value)
                          setShowRouteOptions(false)
                        }}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-white/60">{option.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Bridge Fee</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={feePercent}
                  onChange={(e) => setFeePercent(e.target.value)}
                  className="w-16 px-2 py-1 bg-black/50 border border-white/20 rounded text-white text-xs text-right"
                  placeholder="0.1"
                />
                <span className="text-xs text-white/60">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button
        className="w-full mt-6 py-6 text-lg gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 hover:border-purple-500/50 text-white shadow-lg backdrop-blur-sm"
        size="lg"
        onClick={handleBuildTransaction}
        disabled={loading || !fromAmount || Number.parseFloat(fromAmount) <= 0}
      >
        <ArrowRightLeft className="h-5 w-5" />
        {loading ? "Building Transaction..." : "Build Cross-Chain Transaction"}
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
        <Card className="mt-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Cross-Chain Transaction Ready
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {swapResult.data.map((quote, index) => (
              <div key={index} className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">You Send:</span>
                    <div className="text-white font-medium">
                      {formatDisplayAmount(quote.fromTokenAmount, fromToken.decimals)} {fromToken.symbol}
                    </div>
                    <div className="text-xs text-white/60">on {fromChain.name}</div>
                  </div>
                  <div>
                    <span className="text-white/60">You Receive:</span>
                    <div className="text-white font-medium">
                      {formatDisplayAmount(quote.toTokenAmount, toToken.decimals)} {toToken.symbol}
                    </div>
                    <div className="text-xs text-white/60">on {toChain.name}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Minimum Received:</span>
                    <div className="text-white font-medium">
                      {formatDisplayAmount(quote.minmumReceive, toToken.decimals)} {toToken.symbol}
                    </div>
                  </div>
                  <div>
                    <span className="text-white/60">Bridge:</span>
                    <div className="text-white font-medium">{quote.router.bridgeName}</div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white/80 font-medium mb-2">Bridge Information</div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-white/60">Bridge ID:</span>
                      <span className="text-white">{quote.router.bridgeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Bridge Name:</span>
                      <span className="text-white">{quote.router.bridgeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Cross-chain Fee:</span>
                      <span className="text-white">{quote.router.crossChainFee}</span>
                    </div>
                    {quote.router.otherNativeFee !== "0" && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Native Fee:</span>
                        <span className="text-white">{quote.router.otherNativeFee}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white/80 font-medium mb-2">Transaction Details</div>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">To Contract:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono text-xs">
                          {quote.tx.to.slice(0, 8)}...{quote.tx.to.slice(-8)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 hover:bg-white/10"
                          onClick={() => copyToClipboard(quote.tx.to)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Gas Limit:</span>
                      <span className="text-white">{quote.tx.gasLimit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Gas Price:</span>
                      <span className="text-white">{quote.tx.gasPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Value:</span>
                      <span className="text-white">{quote.tx.value}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  <div className="text-amber-400 font-medium mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Ready for Execution
                  </div>
                  <div className="text-sm text-amber-200">
                    Transaction data is ready. Use your wallet to sign and execute this cross-chain swap. The bridge
                    will handle the token transfer between {fromChain.name} and {toChain.name}.
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="mt-5 text-center">
        <p className="text-xs text-white/40">
          Powered by OKX Cross-Chain Bridge Aggregator. Secure multi-chain token transfers.
        </p>
      </div>
    </div>
  )
}

function TokenIcon({ token }: { token: string }) {
  const colors: Record<string, string> = {
    SOL: "bg-gradient-to-r from-purple-500 to-blue-500",
    ETH: "bg-gradient-to-r from-blue-600 to-purple-600",
    USDC: "bg-blue-500",
    USDT: "bg-green-500",
    RAY: "bg-gradient-to-r from-blue-400 to-purple-500",
    ORCA: "bg-gradient-to-r from-pink-400 to-purple-500",
    WBTC: "bg-orange-500",
    DAI: "bg-yellow-500",
  }
  return <div className={`w-5 h-5 rounded-full ${colors[token] || "bg-gray-500"}`}></div>
}
