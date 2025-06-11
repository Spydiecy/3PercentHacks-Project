"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDown, Settings, Clock, Zap, Info, ChevronDown, Check, ExternalLink, Copy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Solana-specific token list
const solanaTokenList = [
  { symbol: "SOL", name: "Solana", address: "11111111111111111111111111111111", decimals: 9 },
  { symbol: "USDC", name: "USD Coin", address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6 },
  { symbol: "USDT", name: "Tether USD", address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6 },
  { symbol: "RAY", name: "Raydium", address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", decimals: 6 },
  { symbol: "SRM", name: "Serum", address: "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt", decimals: 6 },
  { symbol: "ORCA", name: "Orca", address: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE", decimals: 6 },
  { symbol: "MNGO", name: "Mango", address: "MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac", decimals: 6 },
  { symbol: "STEP", name: "Step Finance", address: "StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT", decimals: 9 },
  { symbol: "COPE", name: "Cope", address: "8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh", decimals: 6 },
  { symbol: "FIDA", name: "Bonfida", address: "EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp", decimals: 6 },
]

interface SolanaSwapResult {
  success: boolean
  action: string
  timestamp: string
  chainId: string
  code: string
  data: any
  msg: string
}

interface ExecuteResult {
  success: boolean
  transactionId: string
  explorerUrl: string
  tokenInfo: {
    fromToken: { symbol: string; decimals: number; price: string }
    toToken: { symbol: string; decimals: number; price: string }
  }
  swapDetails: {
    fromAmount: string
    fromToken: string
    toToken: string
    slippage: string
  }
  instructionsUsed: number
  lookupTablesUsed: number
}

export default function SolanaSwapPage() {
  const [fromToken, setFromToken] = useState(solanaTokenList[0]) // SOL
  const [toToken, setToToken] = useState(solanaTokenList[1]) // USDC
  const [fromAmount, setFromAmount] = useState("0.1")
  const [toAmount, setToAmount] = useState("")
  const [slippage, setSlippage] = useState("0.5")
  const [swapResult, setSwapResult] = useState<SolanaSwapResult | null>(null)
  const [quoteResult, setQuoteResult] = useState<any>(null)
  const [executeResult, setExecuteResult] = useState<ExecuteResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [quoting, setQuoting] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFromTokens, setShowFromTokens] = useState(false)
  const [showToTokens, setShowToTokens] = useState(false)

  // Demo Solana wallet address
  const userWalletAddress = "DemHwXRcTyc76MuRwXwyhDdVpYLwoDz1T2rVpzaajMsR"

  const handleSwapTokens = () => {
    const tempToken = fromToken
    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
    // Clear previous results
    setSwapResult(null)
    setQuoteResult(null)
    setExecuteResult(null)
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

  // Get quote first
  const handleGetQuote = async () => {
    if (!fromAmount || Number.parseFloat(fromAmount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setQuoting(true)
    setError(null)
    setQuoteResult(null)

    try {
      const formattedAmount = formatAmount(fromAmount, fromToken.decimals)

      const params = {
        action: "quote",
        chainId: "501", // Solana
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount: formattedAmount,
        slippage: slippage,
        userWalletAddress: userWalletAddress,
      }

      console.log("Quote params:", params)

      const res = await fetch("/api/dex-swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })

      const data = await res.json()
      console.log("Quote response:", data)

      if (data.error) {
        setError(data.error)
      } else if (data.success && data.data && data.data.length > 0) {
        setQuoteResult(data)
        // Update estimated receive amount
        const estimatedAmount = formatDisplayAmount(data.data[0].toTokenAmount, toToken.decimals)
        setToAmount(estimatedAmount)
      } else {
        setError(data.msg || "Failed to get quote")
      }
    } catch (e: any) {
      setError(e.message || "Network error occurred")
    } finally {
      setQuoting(false)
    }
  }

  // Get swap instructions
  const handleGetSwapInstructions = async () => {
    if (!fromAmount || Number.parseFloat(fromAmount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setLoading(true)
    setError(null)
    setSwapResult(null)

    try {
      const formattedAmount = formatAmount(fromAmount, fromToken.decimals)

      const params = {
        action: "instructions",
        chainId: "501", // Solana
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount: formattedAmount,
        slippage: slippage,
        userWalletAddress: userWalletAddress,
        feePercent: "1",
        priceTolerance: "0",
        autoSlippage: "false",
        pathNum: "3",
      }

      console.log("Swap instruction params:", params)

      const res = await fetch("/api/dex-swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })

      const data = await res.json()
      console.log("Swap instructions response:", data)

      if (data.error) {
        setError(data.error)
      } else if (data.success && data.data) {
        setSwapResult(data)
        // Update estimated receive amount if available
        if (data.data.toTokenAmount) {
          const estimatedAmount = formatDisplayAmount(data.data.toTokenAmount, toToken.decimals)
          setToAmount(estimatedAmount)
        }
      } else {
        setError(data.msg || "Failed to get swap instructions")
      }
    } catch (e: any) {
      setError(e.message || "Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Execute swap
  const handleExecuteSwap = async () => {
    if (!fromAmount || Number.parseFloat(fromAmount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setExecuting(true)
    setError(null)
    setExecuteResult(null)

    try {
      const formattedAmount = formatAmount(fromAmount, fromToken.decimals)

      const params = {
        action: "execute",
        chainId: "501", // Solana
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount: formattedAmount,
        slippage: slippage,
        userWalletAddress: userWalletAddress,
        feePercent: "1",
        priceTolerance: "0",
        autoSlippage: "false",
        pathNum: "3",
      }

      console.log("Execute swap params:", params)

      const res = await fetch("/api/dex-swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })

      const data = await res.json()
      console.log("Execute swap response:", data)

      if (data.error) {
        setError(data.error)
      } else if (data.success) {
        setExecuteResult(data)
      } else {
        setError(data.msg || "Failed to execute swap")
      }
    } catch (e: any) {
      setError(e.message || "Network error occurred")
    } finally {
      setExecuting(false)
    }
  }

  const TokenSelector = ({
    tokens,
    selectedToken,
    onSelect,
    show,
    onToggle,
  }: {
    tokens: typeof solanaTokenList
    selectedToken: (typeof solanaTokenList)[0]
    onSelect: (token: (typeof solanaTokenList)[0]) => void
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
                  // Clear results when token changes
                  setSwapResult(null)
                  setQuoteResult(null)
                  setExecuteResult(null)
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-600 text-transparent bg-clip-text mb-1">
            Solana Swap
          </h1>
          <p className="text-white/60">Trade tokens on Solana with best rates</p>
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
            <div className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30">
              <span className="text-xs text-purple-300 font-medium">Solana</span>
            </div>
          </div>
          <div className="flex justify-between items-center mb-2">
            <input
              type="text"
              value={fromAmount}
              onChange={(e) => {
                setFromAmount(e.target.value)
                setSwapResult(null)
                setQuoteResult(null)
                setExecuteResult(null)
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
                  setQuoteResult(null)
                  setExecuteResult(null)
                  setToAmount("")
                }}
              >
                MAX
              </Button>
              <TokenSelector
                tokens={solanaTokenList}
                selectedToken={fromToken}
                onSelect={setFromToken}
                show={showFromTokens}
                onToggle={() => setShowFromTokens(!showFromTokens)}
              />
            </div>
          </div>
          <div className="text-sm text-white/60 mt-1">
            Balance: 12.45 {fromToken.symbol} • ${fromToken.symbol === "SOL" ? "97.35" : "1.00"}
          </div>
        </div>

        <div className="flex justify-center -mt-2 -mb-2 z-10 relative">
          <Button
            onClick={handleSwapTokens}
            size="icon"
            className="rounded-full h-10 w-10 shadow-md bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-white/20 hover:border-white/30"
          >
            <ArrowDown className="h-5 w-5 text-white" />
          </Button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/60">To</span>
            <div className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30">
              <span className="text-xs text-purple-300 font-medium">Solana</span>
            </div>
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
              tokens={solanaTokenList}
              selectedToken={toToken}
              onSelect={setToToken}
              show={showToTokens}
              onToggle={() => setShowToTokens(!showToTokens)}
            />
          </div>
          <div className="text-sm text-white/60 mt-1">
            Balance: 350.21 {toToken.symbol} • ${toToken.symbol === "USDC" ? "350.21" : "1.00"}
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
                {["0.1", "0.5", "1.0", "3.0"].map((value) => (
                  <Button
                    key={value}
                    variant="outline"
                    size="sm"
                    className={`h-7 px-2.5 py-1 border-white/20 text-white text-xs ${
                      slippage === value ? "bg-purple-500/20 border-purple-500/40" : "hover:bg-white/10"
                    }`}
                    onClick={() => setSlippage(value)}
                  >
                    {value}%
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Network</span>
              <span className="text-sm text-white/80 font-medium">Solana Mainnet</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">DEX Aggregator</span>
              <span className="text-sm text-white/80 font-medium">OKX</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-6">
        <Button
          className="py-6 text-sm gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 hover:border-purple-500/50 text-white shadow-lg backdrop-blur-sm"
          size="lg"
          onClick={handleGetQuote}
          disabled={quoting || !fromAmount || Number.parseFloat(fromAmount) <= 0}
        >
          <Info className="h-4 w-4" />
          {quoting ? "Getting..." : "Quote"}
        </Button>

        <Button
          className="py-6 text-sm gap-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/30 hover:border-blue-500/50 text-white shadow-lg backdrop-blur-sm"
          size="lg"
          onClick={handleGetSwapInstructions}
          disabled={loading || !fromAmount || Number.parseFloat(fromAmount) <= 0}
        >
          <Zap className="h-4 w-4" />
          {loading ? "Getting..." : "Instructions"}
        </Button>

        <Button
          className="py-6 text-sm gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 hover:border-green-500/50 text-white shadow-lg backdrop-blur-sm"
          size="lg"
          onClick={handleExecuteSwap}
          disabled={executing || !fromAmount || Number.parseFloat(fromAmount) <= 0}
        >
          <Zap className="h-4 w-4" />
          {executing ? "Executing..." : "Execute"}
        </Button>
      </div>

      {error && (
        <Card className="mt-4 bg-red-900/20 border-red-500/30">
          <CardContent className="p-4">
            <div className="text-red-400 text-sm">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {quoteResult && !error && (
        <Card className="mt-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Info className="h-5 w-5" />
              Swap Quote
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quoteResult.data.map((quote: any, index: number) => (
              <div key={index} className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">You Pay:</span>
                    <div className="text-white font-medium">
                      {formatDisplayAmount(quote.fromTokenAmount, fromToken.decimals)} {fromToken.symbol}
                    </div>
                  </div>
                  <div>
                    <span className="text-white/60">You Receive:</span>
                    <div className="text-white font-medium">
                      {formatDisplayAmount(quote.toTokenAmount, toToken.decimals)} {toToken.symbol}
                    </div>
                  </div>
                  <div>
                    <span className="text-white/60">Rate:</span>
                    <div className="text-white font-medium">
                      1 {fromToken.symbol} = {(Number(quote.toTokenAmount) / Number(quote.fromTokenAmount)).toFixed(4)}{" "}
                      {toToken.symbol}
                    </div>
                  </div>
                  <div>
                    <span className="text-white/60">Price Impact:</span>
                    <div className="text-green-400 font-medium">{"< 0.1%"}</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {swapResult && !error && (
        <Card className="mt-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Swap Instructions Ready
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/60">You Pay:</span>
                  <div className="text-white font-medium">
                    {formatDisplayAmount(swapResult.data.fromTokenAmount, fromToken.decimals)} {fromToken.symbol}
                  </div>
                </div>
                <div>
                  <span className="text-white/60">You Receive:</span>
                  <div className="text-white font-medium">
                    {formatDisplayAmount(swapResult.data.toTokenAmount, toToken.decimals)} {toToken.symbol}
                  </div>
                </div>
                <div>
                  <span className="text-white/60">Minimum Received:</span>
                  <div className="text-white font-medium">
                    {formatDisplayAmount(swapResult.data.minimumReceived, toToken.decimals)} {toToken.symbol}
                  </div>
                </div>
                <div>
                  <span className="text-white/60">Instructions:</span>
                  <div className="text-white font-medium">{swapResult.data.instructionLists.length} steps</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/80 font-medium mb-2">Solana Transaction Details</div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-white/60">Instructions:</span>
                    <span className="text-white">{swapResult.data.instructionLists.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Lookup Tables:</span>
                    <span className="text-white">{swapResult.data.addressLookupTableAccount.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">From Token Price:</span>
                    <span className="text-white">${swapResult.data.fromToken.tokenUnitPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">To Token Price:</span>
                    <span className="text-white">${swapResult.data.toToken.tokenUnitPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {executeResult && !error && (
        <Card className="mt-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-400" />
              Swap Executed Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Swapped:</span>
                  <div className="text-white font-medium">
                    {formatDisplayAmount(
                      executeResult.swapDetails.fromAmount,
                      executeResult.tokenInfo.fromToken.decimals,
                    )}{" "}
                    {executeResult.swapDetails.fromToken}
                  </div>
                </div>
                <div>
                  <span className="text-white/60">For:</span>
                  <div className="text-white font-medium">{executeResult.swapDetails.toToken}</div>
                </div>
                <div>
                  <span className="text-white/60">Instructions Used:</span>
                  <div className="text-white font-medium">{executeResult.instructionsUsed}</div>
                </div>
                <div>
                  <span className="text-white/60">Lookup Tables:</span>
                  <div className="text-white font-medium">{executeResult.lookupTablesUsed}</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/80 font-medium mb-2">Transaction Details</div>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Transaction ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono text-xs">
                        {executeResult.transactionId.slice(0, 8)}...{executeResult.transactionId.slice(-8)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-white/10"
                        onClick={() => copyToClipboard(executeResult.transactionId)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500/30 hover:bg-green-500/10 text-green-400 gap-2"
                      onClick={() => window.open(executeResult.explorerUrl, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on Solscan
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <div className="text-green-400 font-medium mb-2 flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Transaction Confirmed
                </div>
                <div className="text-sm text-green-200">
                  Your swap has been successfully executed on Solana. The transaction has been confirmed and is now
                  visible on the blockchain.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-5 text-center">
        <p className="text-xs text-white/40">
          Powered by OKX DEX Aggregator on Solana. Best rates across all Solana DEXs.
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
    RAY: "bg-gradient-to-r from-blue-400 to-purple-500",
    SRM: "bg-gradient-to-r from-cyan-400 to-blue-500",
    ORCA: "bg-gradient-to-r from-pink-400 to-purple-500",
    MNGO: "bg-gradient-to-r from-yellow-400 to-orange-500",
    STEP: "bg-gradient-to-r from-green-400 to-blue-500",
    COPE: "bg-gradient-to-r from-red-400 to-pink-500",
    FIDA: "bg-gradient-to-r from-indigo-400 to-purple-500",
  }
  return <div className={`w-5 h-5 rounded-full ${colors[token] || "bg-gray-500"}`}></div>
}
