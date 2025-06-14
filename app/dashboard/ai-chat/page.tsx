"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/contexts/WalletContext"
import {
  Send,
  Bot,
  User,
  Zap,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Minus,
  Plus,
  Activity,
  BarChart3,
  ArrowUpDown,
  Wallet,
  X,
  Copy,
  Coins,
  TrendingUp,
  TrendingDown,
  Info,
  MousePointer,
} from "lucide-react"
import { geminiAgent } from "./GeminiAgent"
import { extractImportantInfoFromData } from "./Gemini2Agent"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"

interface Message {
  role: "user" | "system"
  content: string
  chartData?: any
  chartType?: string
  chartTitle?: string
  tokenName?: string
  transactionData?: any[]
  balanceData?: any[]
  swapData?: any
  blockData?: any
  eventData?: any
  extrinsicData?: any
}

interface GeminiResponse {
  text?: string
  type?: string
  token_name?: string
  txHash?: string
  blockNumber?: string
  eventId?: string
  extrinsicHash?: string
  address?: string
  similar_tokens?: string[]
  [key: string]: any
}

// Real-world token data for swap functionality
const SWAP_TOKENS = [
  {
    symbol: "btc",
    name: "Bitcoin",
    image: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
    color: "from-orange-500 to-yellow-500",
    network: "Bitcoin",
    decimals: 8,
  },
  {
    symbol: "eth",
    name: "Ethereum",
    image: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    color: "from-blue-500 to-purple-500",
    network: "Ethereum",
    decimals: 18,
  },
  {
    symbol: "xrp",
    name: "XRP",
    image: "https://cryptologos.cc/logos/xrp-xrp-logo.png",
    color: "from-blue-600 to-cyan-500",
    network: "XRP Ledger",
    decimals: 6,
  },
  {
    symbol: "root",
    name: "Root Network",
    image: "https://pbs.twimg.com/profile_images/1658639949246386176/6T1Tapl__400x400.jpg",
    color: "from-green-500 to-teal-500",
    network: "Root Network",
    decimals: 6,
  },
]

// Color palette for charts
const NEON_COLORS = ["#00FFFF", "#FF00FF", "#FFFF00", "#00FF00", "#FF0080", "#8000FF", "#FF8000", "#0080FF"]

export default function AiChatPage() {
  const { getDisplayAddress } = useWallet()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "Hello! I'm your blockchain AI assistant. I can help you with portfolio analysis, transaction details, block exploration, and even cryptocurrency swaps. What would you like to explore today?",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [contentZoom, setContentZoom] = useState(100)

  // Swap modal states
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [swapFromToken, setSwapFromToken] = useState(SWAP_TOKENS[0])
  const [swapToToken, setSwapToToken] = useState(SWAP_TOKENS[1])
  const [swapAmount, setSwapAmount] = useState("")
  const [swapAddress, setSwapAddress] = useState("")
  const [swapLoading, setSwapLoading] = useState(false)

  const apiKey = process.env.NEXT_PUBLIC_API_KEY || "81d0f73d-93d0-4cb0-b7ae-bce20587e79b"
  const changeNowApiKey = process.env.NEXT_PUBLIC_CHANGENOW_API_KEY || ""

  // RootScan API Functions
  const fetchRootScanAPI = async (type: string, params: any) => {
    const baseUrl = "https://api.rootscan.io/v1"
    let url = ""
    let body: any = {}

    switch (type) {
      case "address_details":
        url = `${baseUrl}/address`
        body = { address: params.address || getDisplayAddress() }
        break
      case "token_balances":
        url = `${baseUrl}/address-token-balances`
        body = { address: params.address || getDisplayAddress() }
        break
      case "nft_balances":
        url = `${baseUrl}/address-nft-balances`
        body = { address: params.address || getDisplayAddress(), page: 0 }
        break
      case "native_transfers":
        url = `${baseUrl}/native-transfers`
        body = { address: params.address || getDisplayAddress() }
        break
      case "evm_transfers":
        url = `${baseUrl}/evm-transfers`
        body = { address: params.address || getDisplayAddress() }
        break
      case "evm_transactions":
        url = `${baseUrl}/evm-transactions`
        body = { address: params.address || getDisplayAddress(), perPage: 100 }
        break
      case "evm_transaction_details":
        url = `${baseUrl}/evm-transaction`
        body = { hash: params.txHash }
        break
      case "extrinsics":
        url = `${baseUrl}/extrinsics`
        body = { address: params.address || getDisplayAddress() }
        break
      case "extrinsic_details":
        url = `${baseUrl}/extrinsic`
        body = { hash: params.extrinsicHash }
        break
      case "blocks":
        url = `${baseUrl}/blocks`
        body = {}
        break
      case "block_details":
        url = `${baseUrl}/block`
        body = { blockNumber: Number.parseInt(params.blockNumber) }
        break
      case "events":
        url = `${baseUrl}/events`
        body = { blockNumber: Number.parseInt(params.blockNumber) }
        break
      case "event_details":
        url = `${baseUrl}/event`
        body = { eventId: params.eventId }
        break
      default:
        throw new Error(`Unknown API type: ${type}`)
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  // Swap API Functions
  const createSwap = async (fromToken: string, toToken: string, amount: string, address: string) => {
    const response = await fetch(`https://api.changenow.io/v1/transactions/${changeNowApiKey}`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: fromToken,
        to: toToken,
        amount: amount,
        address: address,
        flow: "standard",
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  const getMinAmount = async (fromToken: string, toToken: string) => {
    const response = await fetch(
      `https://api.changenow.io/v1/min-amount/${fromToken}_${toToken}?api_key=${changeNowApiKey}`,
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  const handleSwapSubmit = async () => {
    if (!swapAmount || !swapAddress) return

    setSwapLoading(true)
    try {
      const swapResult = await createSwap(swapFromToken.symbol, swapToToken.symbol, swapAmount, swapAddress)

      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: "SWAP_CREATED",
          swapData: swapResult,
        } as any,
      ])
 window.open(`https://changenow.io/pro/exchange/txs/${swapResult.id}`, "_blank");
      setShowSwapModal(false)
      setSwapAmount("")
      setSwapAddress("")
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `Swap creation failed: ${error.message}`,
        },
      ])
    } finally {
      setSwapLoading(false)
    }
  }

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })
        setSwapAddress(accounts[0])
      } else {
        alert("MetaMask is not installed. Please install MetaMask to continue.")
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      // Call Gemini API
      const geminiResponse: GeminiResponse = await geminiAgent(input)
      console.log("Gemini Response:", geminiResponse)

      // Check if this is a swap request
      if (geminiResponse.type === "swap_request") {
        setShowSwapModal(true)
        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            content: "I'll help you create a swap. Please fill in the details in the swap dialog that just opened.",
          },
        ])
        setLoading(false)
        return
      }

      // Process the response based on type
      if (geminiResponse.type) {
        try {
          let apiData: any = null
          let responseMessage = ""

          // Handle different API types
          switch (geminiResponse.type) {
            case "tx_details":
            case "transaction_details":
              if (geminiResponse.txHash) {
                apiData = await fetchRootScanAPI("evm_transaction_details", { txHash: geminiResponse.txHash })
                responseMessage = "Here are the transaction details:"
              }
              break

            case "block_details":
              if (geminiResponse.blockNumber) {
                apiData = await fetchRootScanAPI("block_details", { blockNumber: geminiResponse.blockNumber })
                responseMessage = "Here are the block details:"
              }
              break

            case "event_details":
              if (geminiResponse.eventId) {
                apiData = await fetchRootScanAPI("event_details", { eventId: geminiResponse.eventId })
                responseMessage = "Here are the event details:"
              }
              break

            case "extrinsic_details":
              if (geminiResponse.extrinsicHash) {
                apiData = await fetchRootScanAPI("extrinsic_details", { extrinsicHash: geminiResponse.extrinsicHash })
                responseMessage = "Here are the extrinsic details:"
              }
              break

            case "address_details":
            case "portfolio":
              apiData = await fetchRootScanAPI("address_details", { address: geminiResponse.address })
              responseMessage = "Here's the address information:"
              break

            case "token_balances":
            case "balance":
              apiData = await fetchRootScanAPI("token_balances", { address: geminiResponse.address })
              responseMessage = "Here are the token balances:"
              break

            case "transactions":
            case "evm_transactions":
              apiData = await fetchRootScanAPI("evm_transactions", { address: geminiResponse.address })
              responseMessage = "Here are the recent transactions:"
              break

            case "transfers":
              apiData = await fetchRootScanAPI("native_transfers", { address: geminiResponse.address })
              responseMessage = "Here are the recent transfers:"
              break

            case "blocks":
              apiData = await fetchRootScanAPI("blocks", {})
              responseMessage = "Here are the latest blocks:"
              break

            case "events":
              if (geminiResponse.blockNumber) {
                apiData = await fetchRootScanAPI("events", { blockNumber: geminiResponse.blockNumber })
                responseMessage = "Here are the events for this block:"
              }
              break

            default:
              // Fallback to general response
              const aiMessage = await extractImportantInfoFromData(
                geminiResponse.text || JSON.stringify(geminiResponse),
              )
              setMessages((prev) => [...prev, { role: "system", content: aiMessage }])
              setLoading(false)
              return
          }

          if (apiData) {
            setMessages((prev) => [
              ...prev,
              { role: "system", content: responseMessage },
              {
                role: "system",
                content: "API_DATA",
                chartData: apiData,
                chartType: geminiResponse.type,
                chartTitle: responseMessage,
              } as any,
            ])
          } else {
            setMessages((prev) => [
              ...prev,
              {
                role: "system",
                content: "I couldn't fetch the requested data. Please check your input and try again.",
              },
            ])
          }
        } catch (apiError: any) {
          console.error("API Error:", apiError)
          setMessages((prev) => [
            ...prev,
            {
              role: "system",
              content: `I couldn't fetch the data: ${apiError.message}`,
            },
          ])
        }
      } else {
        // Show Gemini response if no actionable data
        const responseText = geminiResponse.text || JSON.stringify(geminiResponse)
        const aiMessage = await extractImportantInfoFromData(responseText)
        setMessages((prev) => [...prev, { role: "system", content: aiMessage }])
      }
    } catch (error: any) {
      setMessages((prev) => [...prev, { role: "system", content: `Sorry, I encountered an error: ${error.message}` }])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setMessages([
      {
        role: "system",
        content:
          "Hello! I'm your blockchain AI assistant. I can help you with portfolio analysis, transaction details, block exploration, and even cryptocurrency swaps. What would you like to explore today?",
      },
    ])
  }

  const getZoomStyles = () => ({
    transform: `scale(${contentZoom / 100})`,
    transformOrigin: "top left",
    width: `${10000 / contentZoom}%`,
    fontSize: `${contentZoom}%`,
  })

  // Enhanced suggestions with more examples
  const suggestions = [
    // Transaction Examples
    "Show transaction details for hash 0x259c61a30584e005cb645aa51f61e9e7968b836997015e03864f3310310a6c78",
    "Get transaction info for 0x47db11dd86cd6661c022940b046fabe0b3dd250d6ea2edf9618cc47588c16ac6",

    // Block Examples
    "Get block details for block 20874717",
    "Show block information for 20958686",
    "Display latest blocks",

    // Event Examples
    "Show events for block 20959992",
    "Get event details for 20959992-3",
    "Display block events for 20874717",

    // Portfolio & Balance Examples
    "Show my token balances",
    "Display my portfolio overview",
    "Get address details",
    "Show my wallet information",

    // Transaction History
    "Show recent transactions",
    "Display transaction history",
    "Get my transfer history",
    "Show native transfers",

    // Swap Examples
    "I want to swap BTC to ETH",
    "Create a token swap",
    "Exchange XRP for ROOT",
    "Swap cryptocurrencies",

    // Extrinsic Examples
    "Show extrinsic details for hash 0x47db11dd86cd6661c022940b046fabe0b3dd250d6ea2edf9618cc47588c16ac6",
    "Get extrinsic information",
    "Display recent extrinsics",

    // Analysis Examples
    "Analyze my portfolio performance",
    "Show token price changes",
    "Display portfolio charts",
    "Get blockchain analytics",
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-black p-4 rounded-xl text-white">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">
            Blockchain AI Assistant
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse content" : "Expand content"}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
                onClick={() => setContentZoom(Math.max(80, contentZoom - 10))}
                disabled={contentZoom <= 80}
                title="Zoom out"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-xs text-white/60 px-2 min-w-[3rem] text-center">{contentZoom}%</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
                onClick={() => setContentZoom(Math.min(120, contentZoom + 10))}
                disabled={contentZoom >= 120}
                title="Zoom in"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 border-white/20 hover:bg-white/10 text-white"
          onClick={handleReset}
        >
          <RefreshCw className="h-4 w-4" /> New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl mb-4 hover:border-white/20 transition-all hover:shadow-xl">
        <div className={`p-6 transition-all duration-300 ${isExpanded ? "block" : "hidden"}`} style={getZoomStyles()}>
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`}>
              {message.content === "API_DATA" ? (
                <div className="w-full max-w-4xl">
                  <APIDataDisplay data={message.chartData} type={message.chartType} title={message.chartTitle} getDisplayAddress={getDisplayAddress} />
                </div>
              ) : message.content === "SWAP_CREATED" ? (
                <div className="w-full max-w-4xl">
                  <SwapResultDisplay swapData={message.swapData} />
                </div>
              ) : (
                <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div
                    className={`rounded-full h-9 w-9 flex items-center justify-center ${
                      message.role === "user"
                        ? "bg-white/10 ml-2 border border-white/10"
                        : "bg-white/10 mr-2 border border-white/10"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-white/80" />
                    ) : (
                      <Bot className="h-4 w-4 text-white/80" />
                    )}
                  </div>
                  <div
                    className={`py-3 px-4 rounded-2xl ${
                      message.role === "user"
                        ? "bg-white/5 border border-white/10"
                        : "bg-black/30 border border-white/10"
                    } whitespace-pre-wrap`}
                  >
                    <p className="text-white/90">{message.content}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="flex flex-row">
                <div className="rounded-full h-9 w-9 flex items-center justify-center bg-white/10 mr-2 border border-white/10">
                  <Bot className="h-4 w-4 text-white/80" />
                </div>
                <div className="py-3 px-4 rounded-2xl bg-black/30 border border-white/10">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 bg-white/40 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {!isExpanded && (
          <div className="p-6 text-center text-white/40">
            <Bot className="h-8 w-8 mx-auto mb-2 text-white/20" />
            <p className="text-sm">Chat content collapsed. Click the expand button to show messages.</p>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="backdrop-blur-md bg-black/30 border border-white/10 rounded-xl overflow-hidden">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
            placeholder="Ask about transactions, blocks, events, portfolio, or say 'I want to swap tokens'..."
            className="w-full py-4 px-4 bg-transparent border-none pr-24 focus:outline-none text-white placeholder:text-white/40"
            disabled={loading}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 rounded-full text-white/60 hover:bg-white/10 hover:text-white/80"
              onClick={() => setInput("")}
              aria-label="Clear input"
              disabled={loading || !input.trim()}
            >
              <Zap className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="h-8 px-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white hover:border-white/20"
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-3 flex items-center gap-2">
          <Info className="h-4 w-4 text-cyan-400" />
          <span className="text-sm text-cyan-400 font-medium">Try these example queries:</span>
        </div>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInput(suggestion)}
              className="backdrop-blur-sm bg-white/5 text-sm py-2 px-4 rounded-full hover:bg-white/10 transition-colors border border-white/10 text-white/80 hover:text-white hover:border-white/20 flex-shrink-0"
              disabled={loading}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Swap Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-black/90 rounded-xl shadow-2xl border border-white/10 relative max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Create Swap</h2>
              <button
                onClick={() => setShowSwapModal(false)}
                className="text-white/60 hover:text-white text-xl p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* From Token */}
              <div>
                <label className="text-white/80 text-sm font-medium mb-2 block">From</label>
                <select
                  value={swapFromToken.symbol}
                  onChange={(e) =>
                    setSwapFromToken(SWAP_TOKENS.find((t) => t.symbol === e.target.value) || SWAP_TOKENS[0])
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                >
                  {SWAP_TOKENS.map((token) => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.name} ({token.symbol.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* To Token */}
              <div>
                <label className="text-white/80 text-sm font-medium mb-2 block">To</label>
                <select
                  value={swapToToken.symbol}
                  onChange={(e) =>
                    setSwapToToken(SWAP_TOKENS.find((t) => t.symbol === e.target.value) || SWAP_TOKENS[1])
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                >
                  {SWAP_TOKENS.map((token) => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.name} ({token.symbol.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="text-white/80 text-sm font-medium mb-2 block">Amount</label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  className="bg-black/40 border-white/10 text-white"
                />
              </div>

              {/* Recipient Address */}
              <div>
                <label className="text-white/80 text-sm font-medium mb-2 block">Recipient Address</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter address"
                    value={swapAddress}
                    onChange={(e) => setSwapAddress(e.target.value)}
                    className="bg-black/40 border-white/10 text-white"
                  />
                  <Button
                    onClick={connectWallet}
                    variant="outline"
                    className="border-white/20 hover:bg-white/10 text-white"
                  >
                    <Wallet className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSwapSubmit}
                disabled={!swapAmount || !swapAddress || swapLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                {swapLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating Swap...
                  </>
                ) : (
                  "Create Swap"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Component to display API data based on type
function APIDataDisplay({ data, type, title, getDisplayAddress }: { data: any; type?: string; title?: string; getDisplayAddress: () => string }) {
  if (!data) return null

  switch (type) {
    case "tx_details":
    case "transaction_details":
      return <TransactionDetailsDisplay data={data} title={title} />
    case "block_details":
      return <BlockDetailsDisplay data={data} title={title} />
    case "event_details":
      return <EventDetailsDisplay data={data} title={title} />
    case "token_balances":
    case "balance":
    case "address_details":
    case "portfolio":
      return <PortfolioDisplay data={data} title={title} />
    case "transactions":
    case "evm_transactions":
      return <TransactionsDisplay data={data} title={title} />
    case "blocks":
      return <BlocksDisplay data={data} title={title} />
    case "events":
      return <EventsDisplay data={data} title={title} />
    case "transfers":
      return <TransfersDisplay data={data} title={title} getDisplayAddress={getDisplayAddress} />
    default:
      return <GenericDataDisplay data={data} title={title} />
  }
}

// Enhanced Portfolio Display with Charts
function PortfolioDisplay({ data, title }: { data: any; title?: string }) {
  const portfolioData = data.data || data
  const balances = portfolioData?.balances || []
  const addressInfo = portfolioData?.address ? portfolioData : null

  // Prepare chart data
  const tokenChartData = balances
    .filter((token: any) => token.token?.priceData?.price > 0)
    .map((token: any, index: number) => ({
      name: token.token?.symbol || "Unknown",
      value: Number.parseFloat(token.balanceFormatted || "0") * (token.token?.priceData?.price || 0),
      balance: Number.parseFloat(token.balanceFormatted || "0"),
      price: token.token?.priceData?.price || 0,
      change24h: token.token?.priceData?.percent_change_24h || 0,
      color: NEON_COLORS[index % NEON_COLORS.length],
    }))
    .filter((item: any) => item.value > 0)

  const priceChangeData = balances
    .filter((token: any) => token.token?.priceData?.price > 0)
    .map((token: any, index: number) => ({
      symbol: token.token?.symbol || "Unknown",
      change24h: token.token?.priceData?.percent_change_24h || 0,
      change7d: token.token?.priceData?.percent_change_7d || 0,
      volume: token.token?.priceData?.volume_24h || 0,
      color: NEON_COLORS[index % NEON_COLORS.length],
    }))

  const totalValue = tokenChartData.reduce((sum: number, token: any) => sum + token.value, 0)

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card className="w-full bg-black/40 border-white/20 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {title || "Portfolio Overview"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-4 rounded-lg border border-purple-500/30">
              <h3 className="text-purple-400 text-sm font-medium">Total Portfolio Value</h3>
              <p className="text-2xl font-bold text-white">${totalValue.toFixed(2)}</p>
              <p className="text-purple-300 text-sm">{addressInfo?.balance?.freeFormatted || "0"} ROOT Free Balance</p>
            </div>
            <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 p-4 rounded-lg border border-green-500/30">
              <h3 className="text-green-400 text-sm font-medium">Active Tokens</h3>
              <p className="text-2xl font-bold text-white">{tokenChartData.length}</p>
              <p className="text-green-300 text-sm">With positive value</p>
            </div>
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-4 rounded-lg border border-orange-500/30">
              <h3 className="text-orange-400 text-sm font-medium">Best Performer</h3>
              <p className="text-xl font-bold text-white">
                {priceChangeData.length > 0
                  ? priceChangeData.reduce((best: any, current: any) =>
                      current.change24h > best.change24h ? current : best,
                    ).symbol
                  : "N/A"}
              </p>
              <p className="text-orange-300 text-sm">
                {priceChangeData.length > 0
                  ? `+${priceChangeData
                      .reduce((best: any, current: any) => (current.change24h > best.change24h ? current : best))
                      .change24h.toFixed(2)}%`
                  : "No data"}
              </p>
            </div>
          </div>

          {/* Charts */}
          {tokenChartData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Token Distribution Pie Chart */}
              <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                <h4 className="font-semibold text-cyan-400 mb-4">Token Distribution</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tokenChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {tokenChartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`$${value.toFixed(2)}`, "Value"]}
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Price Changes Bar Chart */}
              <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                <h4 className="font-semibold text-orange-400 mb-4">24h Price Changes</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priceChangeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="symbol" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      formatter={(value: any) => [`${value.toFixed(2)}%`, "Change"]}
                    />
                    <Bar dataKey="change24h" fill="url(#colorGradient)" />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#EC4899" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Token Balances Table */}
      <Card className="w-full bg-black/40 border-white/20 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Token Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {balances.map((balance: any, index: number) => {
              const tokenValue =
                Number.parseFloat(balance.balanceFormatted || "0") * (balance.token?.priceData?.price || 0)
              const change24h = balance.token?.priceData?.percent_change_24h || 0

              return (
                <div
                  key={index}
                  className="p-4 bg-black/40 rounded border border-gray-700/50 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${NEON_COLORS[index % NEON_COLORS.length]}, ${
                            NEON_COLORS[(index + 1) % NEON_COLORS.length]
                          })`,
                        }}
                      >
                        {(balance.token?.symbol || "?").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-cyan-400">{balance.token?.symbol || "Unknown"}</p>
                        <p className="text-sm text-gray-400">{balance.token?.name || "Unknown Token"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{balance.balanceFormatted}</p>
                      <p className="text-gray-400 text-sm">${tokenValue.toFixed(2)}</p>
                      <Badge
                        className={`mt-1 ${
                          change24h >= 0
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }`}
                      >
                        {change24h >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {change24h >= 0 ? "+" : ""}
                        {change24h.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TransactionDetailsDisplay({ data, title }: { data: any; title?: string }) {
  const tx = data.data || data

  return (
    <Card className="w-full bg-black/40 border-white/20 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {title || "Transaction Details"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/60 p-4 rounded-lg border border-white/10">
              <h4 className="font-semibold text-cyan-400 mb-2">Hash</h4>
              <p className="font-mono text-sm break-all text-gray-300">{tx.hash}</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigator.clipboard.writeText(tx.hash)}
                className="mt-2 text-cyan-400 hover:text-cyan-300"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            <div className="bg-black/60 p-4 rounded-lg border border-white/10">
              <h4 className="font-semibold text-cyan-400 mb-2">Status</h4>
              <Badge
                className={tx.status === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}
              >
                {tx.status}
              </Badge>
            </div>
            <div className="bg-black/60 p-4 rounded-lg border border-white/10">
              <h4 className="font-semibold text-cyan-400 mb-2">Block Number</h4>
              <p className="text-gray-300">{tx.blockNumber}</p>
            </div>
            <div className="bg-black/60 p-4 rounded-lg border border-white/10">
              <h4 className="font-semibold text-cyan-400 mb-2">Gas Used</h4>
              <p className="text-gray-300">{tx.gasUsed?.toLocaleString()}</p>
            </div>
          </div>

          {tx.events && tx.events.length > 0 && (
            <div className="bg-black/60 p-4 rounded-lg border border-white/10">
              <h4 className="font-semibold text-orange-400 mb-2">Events</h4>
              <div className="space-y-2">
                {tx.events.map((event: any, index: number) => (
                  <div key={index} className="p-3 bg-black/40 rounded border border-gray-700/50">
                    <p className="font-semibold text-cyan-400">{event.eventName}</p>
                    <p className="text-sm text-gray-400">
                      {event.name} ({event.symbol}) - {event.formattedAmount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Tips */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer className="h-4 w-4 text-blue-400" />
              <span className="text-blue-400 font-medium">Quick Tips</span>
            </div>
            <p className="text-blue-300 text-sm">
              💡 Want to explore more? Try asking:
              <br />• "Get block details for block {tx.blockNumber}"
              <br />• "Show events for block {tx.blockNumber}"
              <br />• "Show recent transactions for this address"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BlockDetailsDisplay({ data, title }: { data: any; title?: string }) {
  const block = data.data || data

  return (
    <Card className="w-full bg-black/40 border-white/20 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title || "Block Details"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/60 p-4 rounded-lg border border-white/10">
              <h4 className="font-semibold text-purple-400 mb-2">Block Number</h4>
              <p className="text-gray-300">{block.number}</p>
            </div>
            <div className="bg-black/60 p-4 rounded-lg border border-white/10">
              <h4 className="font-semibold text-purple-400 mb-2">Hash</h4>
              <p className="font-mono text-sm break-all text-gray-300">{block.hash}</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigator.clipboard.writeText(block.hash)}
                className="mt-2 text-purple-400 hover:text-purple-300"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            <div className="bg-black/60 p-4 rounded-lg border border-white/10">
              <h4 className="font-semibold text-purple-400 mb-2">Transactions</h4>
              <p className="text-gray-300">{block.transactionsCount}</p>
            </div>
            <div className="bg-black/60 p-4 rounded-lg border border-white/10">
              <h4 className="font-semibold text-purple-400 mb-2">Events</h4>
              <p className="text-gray-300">{block.eventsCount}</p>
            </div>
          </div>

          {/* Interactive Tips */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer className="h-4 w-4 text-purple-400" />
              <span className="text-purple-400 font-medium">Explore This Block</span>
            </div>
            <p className="text-purple-300 text-sm">
              🔍 Dive deeper into block {block.number}:
              <br />• "Show events for block {block.number}"
              <br />• "Get transactions for block {block.number}"
              <br />• "Show block {block.number - 1}" (previous block)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EventDetailsDisplay({ data, title }: { data: any; title?: string }) {
  const event = data.data || data

  return (
    <Card className="w-full bg-black/40 border-white/20 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="h-5 w-5" />
          {title || "Event Details"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/60 p-4 rounded-lg border border-white/10">
              <h4 className="font-semibold text-orange-400 mb-2">Event ID</h4>
              <p className="text-gray-300">{event.eventId}</p>
            </div>
            <div className="bg-black/60 p-4 rounded-lg border border-white/10">
              <h4 className="font-semibold text-orange-400 mb-2">Method</h4>
              <p className="text-gray-300">
                {event.section}.{event.method}
              </p>
            </div>
          </div>

          <div className="bg-black/60 p-4 rounded-lg border border-white/10">
            <h4 className="font-semibold text-green-400 mb-2">Description</h4>
            <p className="text-gray-300">{event.doc}</p>
          </div>

          <div className="bg-black/60 p-4 rounded-lg border border-white/10">
            <h4 className="font-semibold text-purple-400 mb-2">Arguments</h4>
            <pre className="text-xs text-gray-300 overflow-x-auto bg-black/60 p-2 rounded">
              {JSON.stringify(event.args, null, 2)}
            </pre>
          </div>

          {/* Interactive Tips */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer className="h-4 w-4 text-orange-400" />
              <span className="text-orange-400 font-medium">Related Queries</span>
            </div>
            <p className="text-orange-300 text-sm">
              🔗 Explore related data:
              <br />• "Get block details for block {event.blockNumber}"
              <br />• "Show all events for block {event.blockNumber}"
              <br />• "Get extrinsic details for {event.extrinsicId}"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TransactionsDisplay({ data, title }: { data: any; title?: string }) {
  const transactions = data.data || []

  return (
    <Card className="w-full bg-black/40 border-white/20 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {title || "Recent Transactions"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.slice(0, 10).map((tx: any, index: number) => (
            <div
              key={index}
              className="p-4 bg-black/40 rounded border border-gray-700/50 hover:border-cyan-500/50 transition-colors cursor-pointer group"
              onClick={() => {
                const message = `Get transaction details for ${tx.hash}`
                // This would trigger a new query
                console.log("Suggested query:", message)
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm text-cyan-400 group-hover:text-cyan-300">
                    {tx.hash?.slice(0, 20)}...
                  </p>
                  <p className="text-sm text-gray-400">{tx.functionName || "Unknown Function"}</p>
                </div>
                <div className="text-right">
                  <Badge
                    className={
                      tx.status === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }
                  >
                    {tx.status}
                  </Badge>
                  <p className="text-gray-400 text-sm mt-1">Block #{tx.blockNumber}</p>
                </div>
              </div>
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-cyan-400 flex items-center gap-1">
                  <MousePointer className="h-3 w-3" />
                  Click to ask: "Get transaction details for {tx.hash?.slice(0, 10)}..."
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Tips */}
        <div className="mt-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-cyan-400" />
            <span className="text-cyan-400 font-medium">Pro Tip</span>
          </div>
          <p className="text-cyan-300 text-sm">
            💡 Click on any transaction above or ask: "Get transaction details for [hash]" to see full details including
            events, gas usage, and more!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function BlocksDisplay({ data, title }: { data: any; title?: string }) {
  const blocks = data.data || []

  return (
    <Card className="w-full bg-black/40 border-white/20 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title || "Latest Blocks"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {blocks.slice(0, 10).map((block: any, index: number) => (
            <div
              key={index}
              className="p-4 bg-black/40 rounded border border-gray-700/50 hover:border-purple-500/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-purple-400 group-hover:text-purple-300">Block #{block.number}</p>
                  <p className="font-mono text-sm text-gray-400">{block.hash?.slice(0, 20)}...</p>
                </div>
                <div className="text-right">
                  <Badge
                    className={
                      block.isFinalized ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                    }
                  >
                    {block.isFinalized ? "Finalized" : "Pending"}
                  </Badge>
                  <p className="text-gray-400 text-sm mt-1">Txs: {block.transactionsCount}</p>
                </div>
              </div>
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-purple-400 flex items-center gap-1">
                  <MousePointer className="h-3 w-3" />
                  Try: "Get block details for block {block.number}" or "Show events for block {block.number}"
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Tips */}
        <div className="mt-4 bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-purple-400" />
            <span className="text-purple-400 font-medium">Block Explorer Tips</span>
          </div>
          <p className="text-purple-300 text-sm">
            🔍 Explore any block by asking:
            <br />• "Get block details for block [number]"
            <br />• "Show events for block [number]"
            <br />• "Show transactions in block [number]"
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function EventsDisplay({ data, title }: { data: any; title?: string }) {
  const events = data.data || []

  return (
    <Card className="w-full bg-black/40 border-white/20 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="h-5 w-5" />
          {title || "Block Events"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event: any, index: number) => (
            <div
              key={index}
              className="p-4 bg-black/40 rounded border border-gray-700/50 hover:border-orange-500/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-orange-400 group-hover:text-orange-300">
                    {event.section}.{event.method}
                  </p>
                  <p className="text-sm text-gray-400">{event.doc}</p>
                  <p className="text-xs text-gray-500">Event ID: {event.eventId}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">Block #{event.blockNumber}</p>
                  <p className="text-gray-400 text-sm">{new Date(event.timestamp * 1000).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-orange-400 flex items-center gap-1">
                  <MousePointer className="h-3 w-3" />
                  Ask: "Get event details for {event.eventId}" for complete information
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Tips */}
        <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-orange-400" />
            <span className="text-orange-400 font-medium">Event Analysis</span>
          </div>
          <p className="text-orange-300 text-sm">
            ⚡ Get detailed event information:
            <br />• "Get event details for [eventId]"
            <br />• "Show extrinsic details for [extrinsicId]"
            <br />• "Analyze events in block [blockNumber]"
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function TransfersDisplay({ data, title, getDisplayAddress }: { data: any; title?: string; getDisplayAddress: () => string }) {
  const transfers = data.data || []

  // Prepare chart data for transfer activity
  const transferChartData = transfers.slice(0, 10).map((transfer: any, index: number) => ({
    name: `Block ${transfer.blockNumber}`,
    amount: transfer.args.amount / 1e12,
    timestamp: new Date(transfer.timestamp * 1000).toLocaleDateString(),
    block: transfer.blockNumber,
    type: transfer.args.from.toLowerCase() === getDisplayAddress().toLowerCase() ? "Sent" : "Received",
  }))

  return (
    <Card className="w-full bg-black/40 border-white/20 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {title || "Transfer History"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Transfer Activity Chart */}
          {transferChartData.length > 0 && (
            <div className="bg-black/60 p-4 rounded-lg border border-white/10">
              <h4 className="font-semibold text-green-400 mb-4">Transfer Activity</h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={transferChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#10B981"
                    fill="url(#transferGradient)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="transferGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Transfer List */}
          <div className="space-y-3">
            {transfers.slice(0, 10).map((transfer: any, index: number) => {
              const isOutgoing = transfer.args.from.toLowerCase() === getDisplayAddress().toLowerCase()
              return (
                <div
                  key={index}
                  className="p-4 bg-black/40 rounded border border-gray-700/50 hover:border-green-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-full ${
                          isOutgoing
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-green-500/20 text-green-400 border border-green-500/30"
                        }`}
                      >
                        {isOutgoing ? (
                          <TrendingUp className="h-5 w-5 rotate-45" />
                        ) : (
                          <TrendingDown className="h-5 w-5 -rotate-45" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{isOutgoing ? "Sent" : "Received"}</p>
                        <p className="text-white/60 text-sm">Block #{transfer.blockNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{(transfer.args.amount / 1e12).toFixed(6)} ROOT</p>
                      <p className="text-white/60 text-sm">{new Date(transfer.timestamp * 1000).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Interactive Tips */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-green-400" />
              <span className="text-green-400 font-medium">Transfer Analysis</span>
            </div>
            <p className="text-green-300 text-sm">
              💰 Explore transfer patterns:
              <br />• "Show my portfolio overview" for complete balance analysis
              <br />• "Get block details for block [number]" to see block context
              <br />• "Show recent transactions" for EVM transaction history
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SwapResultDisplay({ swapData }: { swapData: any }) {
  return (
    <Card className="w-full bg-black/40 border-white/20 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5" />
          Swap Created Successfully
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/60 p-4 rounded-lg border border-white/10">
              <h4 className="font-semibold text-green-400 mb-2">Transaction ID</h4>
              <p className="font-mono text-sm text-gray-300">{swapData.id}</p>
            </div>
            <div className="bg-black/60 p-4 rounded-lg border border-white/10">
              <h4 className="font-semibold text-green-400 mb-2">Pay-in Address</h4>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm text-gray-300">{swapData.payinAddress}</p>
                <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(swapData.payinAddress)}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="bg-black/60 p-4 rounded-lg border border-white/10">
              <h4 className="font-semibold text-green-400 mb-2">Amount to Send</h4>
              <p className="text-gray-300">
                {swapData.directedAmount} {swapData.fromCurrency.toUpperCase()}
              </p>
            </div>
            <div className="bg-black/60 p-4 rounded-lg border border-white/10">
              <h4 className="font-semibold text-green-400 mb-2">Amount to Receive</h4>
              <p className="text-gray-300">
                {swapData.amount} {swapData.toCurrency.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-400 text-sm">
              ✅ Swap created successfully! Send {swapData.directedAmount} {swapData.fromCurrency.toUpperCase()} to the
              pay-in address above to complete the exchange.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function GenericDataDisplay({ data, title }: { data: any; title?: string }) {
  return (
    <Card className="w-full bg-black/40 border-white/20 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title || "Data Response"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-black/60 p-4 rounded-lg border border-white/10">
          <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
