"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Send, Bot, User, Zap, RefreshCw } from "lucide-react"
import { geminiAgent } from "./GeminiAgent"
import { extractImportantInfoFromData } from "./Gemini2Agent"
import { useWallet } from "@/contexts/WalletContext"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react"

interface Message {
  role: "user" | "system"
  content: string
  chartData?: any
  chartType?: string
  chartTitle?: string
  tokenName?: string
}

interface GeminiResponse {
  text?: string
  type?: string
  token_name?: string
  txHash?: string
  similar_tokens?: string[]
  [key: string]: any
}

// Map token names to contract addresses
const tokenAddressMap: Record<string, string> = {
  ETH: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native ETH
  OP: "0x4200000000000000000000000000000000000042", // OP token
  BSC: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native BNB
  OKT: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native OKT
  SONIC: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Placeholder
  XLAYER: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Placeholder
  POLYGON: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native MATIC
  ARB: "0x912CE59144191C1204E64559FE8253a0e49E6548", // Native ETH on Arbitrum
  AVAX: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native AVAX
  ZKSYNC: "0x5A7d6b2F92C77FAD6CCaBd7EE0624E64907Eaf3E", // Native ETH on zkSync
  POLYZKEVM: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native MATIC
  BASE: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native ETH
  LINEA: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native ETH
  FTM: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native FTM
  MANTLE: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native MNT
  CFX: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native CFX
  METIS: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native METIS
  MERLIN: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Placeholder
  BLAST: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Placeholder
  MANTA: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Placeholder
  SCROLL: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native ETH
  CRO: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native CRO
  ZETA: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native ZETA
  TRON: "TRX", // Tron native token symbol
  SOL: "So11111111111111111111111111111111111111112", // Solana native token symbol
  SUI: "0x2::sui::SUI", // SUI native token ID
  TON: "0x582d872a1b094fc48f5de31d3b73f2d9be47def1", // TON native token symbol
  MYS: "3",
}

const chainIndexMap: Record<string, string> = {
  ETH: "1",
  OP: "10",
  BSC: "56",
  OKT: "66",
  SONIC: "146",
  XLAYER: "196",
  POLYGON: "137",
  ARB: "42161",
  AVAX: "43114",
  ZKSYNC: "324",
  POLYZKEVM: "1101",
  BASE: "8453",
  LINEA: "59144",
  FTM: "250",
  MANTLE: "5000",
  CFX: "1030",
  METIS: "1088",
  MERLIN: "4200",
  BLAST: "81457",
  MANTA: "169",
  SCROLL: "534352",
  CRO: "25",
  ZETA: "7000",
  TRON: "195",
  SOL: "501",
  SUI: "784",
  TON: "607",
  MYS: "3",
}

function getTokenContractAddress(tokenName: string): string | null {
  return tokenAddressMap[tokenName] || null
}

// Call your local market data API with POST request
async function callMarketDataApi(type: string, tokenName: string, address: string, txHash: string) {
  const tokenContractAddress = getTokenContractAddress(tokenName)
  if (!tokenContractAddress) {
    throw new Error(`Token contract address not found for token: ${tokenName}`)
  }

  let path = ""
  let method = "POST"
  let notReq = false
  if (type == "total_value") {
    const body = {
      address: "52C9T2T7JRojtxumYnYZhyUmrN7kqzvCLc4Ksvjk7TxD", //dummy address
      chains: "501",
      excludeRiskToken: "0",
    }
    const response = await fetch("/api/portfolio/total_token_balances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const m = await response.json()
    return m
  }
  if (type == "total_token_balance") {
    //dummy address
    const body = {
      address: "52C9T2T7JRojtxumYnYZhyUmrN7kqzvCLc4Ksvjk7TxD",
      chains: "501",
      excludeRiskToken: "0",
    }
    const response = await fetch("/api/portfolio/total_token_balances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const m = await response.json()
    console.log("my m value is:::",m);
    
    return m
  }
  if (type == "specific_token_balance") {
    const body = {
      address: "52C9T2T7JRojtxumYnYZhyUmrN7kqzvCLc4Ksvjk7TxD", //dummy address
      tokenContractAddresses: getTokenContractAddress(tokenName),
      excludeRiskToken: "0",
    }
    const response = await fetch("/api/portfolio/specific_token_balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const m = await response.json()
    console.log("my m value is:::",m);
    return m
  }
  if (type == "transaction_history") {
    const body = {
      address: "52C9T2T7JRojtxumYnYZhyUmrN7kqzvCLc4Ksvjk7TxD",
      chains: chainIndexMap[tokenName],
      limit: "20",
    }
    const response = await fetch("/api/portfolio/history_by_add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const m = await response.json()
    console.log("my m value is:::",m);
    return m
  }
  
  if (type == "tx_by_hash") {
    const body = {
      chainIndex: chainIndexMap["token_name"],
      txHash: txHash,
    }
    const response = await fetch("/api/portfolio/transaction_by_hash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const m = await response.json()
    console.log("my m value is:::",m);
    return m
  }

  switch (type) {
    case "price":
      path = "/api/v5/dex/market/price"
      break
    case "trades":
      method = "GET"
      path = "/api/v5/dex/market/trades"
      break
    case "candlestick":
      method = "GET"
      notReq = true
      path = "/api/v5/dex/market/candles"
      break
    case "hist_data":
      method = "GET"
      path = "/api/v5/dex/index/historical-price"
      break
    case "batch_price":
      path = "/api/v5/dex/market/price-info"
      break
    case "candlestick_history":
      method = "GET"
      notReq = true
      path = "/api/v5/dex/market/historical-candles"
      break
    case "historical_index_price":
      notReq = true
      method = "GET"
      path = "/api/v5/dex/index/historical-price"
      break
    case "token_index_price":
      notReq = true
      path = "/api/dex/index/current-price"
      break

    case "transaction_history":
      method = "GET"
      path = "/api/v5/dex/post-transaction/transactions-by-address"
      break
    case "spe_transaction":
      method = "GET"
      path = "/api/v5/dex/post-transaction/transaction-detail-by-txhash"
      break
    case "total_value":
      path = "/api/v5/dex/balance/total-value"
      break
    // Add more cases as needed
    default:
      path = "/api/v5/dex/default"
  }

  try {
    let body
    if (notReq == true) {
      body = {
        method: method,
        path,
        data: [
          {
            chainIndex: chainIndexMap[tokenName],
            tokenContractAddress,
          },
        ],
      }
    } else {
      body = {
        method: method,
        path,
        data: [
          {
            chainIndex: chainIndexMap[tokenName],
            address: address,
            tokenContractAddress,
          },
        ],
      }
    }

    console.log("my body is::", body)

    const response = await fetch("/api/market_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const m = await response.json()
    console.log("my m fetch is:::", m)

    if (!response.ok) {
      throw new Error(`Market data API error: ${response.statusText}`)
    }
    return m
  } catch (error) {
    console.error("Market data API error:", error)
    throw error
  }
}

// Helper function to format timestamp to readable date
function formatTimestamp(timestamp: string | number): string {
  const date = new Date(Number(timestamp))
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// Helper function to format price
function formatPrice(price: string | number): string {
  return Number(price).toFixed(2)
}

// Helper function to format price for Y-axis (shorter format)
function formatPriceForAxis(price: string | number): string {
  const num = Number(price)
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}K`
  } else if (num >= 1) {
    return `$${num.toFixed(2)}`
  } else {
    return `$${num.toFixed(4)}`
  }
}

// Component for rendering historical price chart
function HistoricalPriceChart({ data, title }: { data: any; title: string }) {
  if (!data?.data?.[0]?.prices) return null

  const chartData = data.data[0].prices
    .map((item: any) => ({
      time: formatTimestamp(item.time),
      price: Number(item.price),
      timestamp: Number(item.time),
    }))
    .reverse() // Reverse to show chronological order

  const currentPrice = chartData[chartData.length - 1]?.price || 0
  const previousPrice = chartData[chartData.length - 2]?.price || 0
  const priceChange = currentPrice - previousPrice
  const isPositive = priceChange >= 0

  return (
    <Card className="w-full bg-black/40 border-white/20 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">${formatPrice(currentPrice)}</span>
          <span className={`flex items-center gap-1 text-sm ${isPositive ? "text-green-400" : "text-red-400"}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {isPositive ? "+" : ""}
            {formatPrice(priceChange)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            price: {
              label: "Price",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="time"
                tick={{ fill: "white", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                tickLine={{ stroke: "rgba(255,255,255,0.2)" }}
              />
              <YAxis
                tick={{ fill: "white", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                tickLine={{ stroke: "rgba(255,255,255,0.2)" }}
                domain={["dataMin - 0.01", "dataMax + 0.01"]}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#3b82f6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Custom Candlestick component for D3-style rendering
const CandlestickBar = ({ x, y, width, height, payload }: any) => {
  if (!payload) return null
  
  const { open, high, low, close } = payload
  const isPositive = close >= open
  const bodyColor = isPositive ? "#22c55e" : "#ef4444"
  const wickColor = isPositive ? "#16a34a" : "#dc2626"
  
  // Chart dimensions
  const chartHeight = 300
  const margin = 40
  const plotHeight = chartHeight - margin * 2
  
  // Calculate price range
  const allPrices = [open, high, low, close]
  const minPrice = Math.min(...allPrices)
  const maxPrice = Math.max(...allPrices)
  const priceRange = maxPrice - minPrice || 1
  const padding = priceRange * 0.1
  const yMin = minPrice - padding
  const yMax = maxPrice + padding
  const totalRange = yMax - yMin
  
  // Convert price to pixel position
  const priceToY = (price: number) => {
    return margin + ((yMax - price) / totalRange) * plotHeight
  }
  
  // Calculate positions
  const highY = priceToY(high)
  const lowY = priceToY(low)
  const openY = priceToY(open)
  const closeY = priceToY(close)
  
  const bodyTop = Math.min(openY, closeY)
  const bodyHeight = Math.abs(closeY - openY) || 2
  const bodyWidth = Math.max(width * 0.6, 2)
  const bodyX = x + (width - bodyWidth) / 2
  const wickX = x + width / 2
  
  return (
    <g>
      {/* Upper wick */}
      <line
        x1={wickX}
        y1={highY}
        x2={wickX}
        y2={bodyTop}
        stroke={wickColor}
        strokeWidth={1}
      />
      {/* Lower wick */}
      <line
        x1={wickX}
        y1={bodyTop + bodyHeight}
        x2={wickX}
        y2={lowY}
        stroke={wickColor}
        strokeWidth={1}
      />
      {/* Candle body */}
      <rect
        x={bodyX}
        y={bodyTop}
        width={bodyWidth}
        height={bodyHeight}
        fill={isPositive ? bodyColor : "transparent"}
        stroke={bodyColor}
        strokeWidth={isPositive ? 0 : 2}
      />
    </g>
  )
}

// Component for rendering candlestick chart
function CandlestickChart({ data, title }: { data: any; title: string }) {
  if (!data?.data) return null

  let chartData: any[] = []
  
  // Handle different data formats
  if (Array.isArray(data.data)) {
    // Format: [[timestamp, open, high, low, close, volume], ...]
    chartData = data.data
      .map((item: any) => ({
        time: formatTimestamp(item[0]),
        open: Number(item[1]),
        high: Number(item[2]),
        low: Number(item[3]),
        close: Number(item[4]),
        volume: Number(item[5]) || 0,
        timestamp: Number(item[0]),
      }))
      .reverse()
  } else if (data.data[0] && typeof data.data[0] === 'object') {
    // Format: [{timestamp, open, high, low, close, volume}, ...]
    chartData = data.data
      .map((item: any) => ({
        time: formatTimestamp(item.timestamp || item.time),
        open: Number(item.open),
        high: Number(item.high),
        low: Number(item.low),
        close: Number(item.close),
        volume: Number(item.volume) || 0,
        timestamp: Number(item.timestamp || item.time),
      }))
      .reverse()
  } else {
    return <div className="text-white p-4">No candlestick data available</div>
  }

  if (chartData.length === 0) {
    return <div className="text-white p-4">No candlestick data available</div>
  }

  const currentPrice = chartData[chartData.length - 1]?.close || 0
  const previousPrice = chartData[chartData.length - 2]?.close || 0
  const priceChange = currentPrice - previousPrice
  const isPositive = priceChange >= 0
  
  // Calculate price range for the entire dataset
  const allPrices = chartData.flatMap((item: any) => [item.open, item.high, item.low, item.close])
  const minPrice = Math.min(...allPrices)
  const maxPrice = Math.max(...allPrices)
  const priceRange = maxPrice - minPrice || 1
  const padding = priceRange * 0.1
  const yMin = minPrice - padding
  const yMax = maxPrice + padding

  return (
    <Card className="w-full bg-black/40 border-white/20 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">${formatPrice(currentPrice)}</span>
          <span className={`flex items-center gap-1 text-sm ${isPositive ? "text-green-400" : "text-red-400"}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {isPositive ? "+" : ""}
            {formatPrice(priceChange)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            high: { label: "High", color: "#22c55e" },
            low: { label: "Low", color: "#ef4444" },
            open: { label: "Open", color: "#3b82f6" },
            close: { label: "Close", color: "#8b5cf6" },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <svg width="100%" height="100%" className="candlestick-chart">
                <defs>
                  <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
                  </linearGradient>
                </defs>
                
                {/* Background */}
                <rect width="100%" height="100%" fill="url(#bgGradient)" />
                
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((percent: number) => (
                  <line
                    key={percent}
                    x1="40"
                    y1={40 + (percent / 100) * 220}
                    x2="100%"
                    y2={40 + (percent / 100) * 220}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={0.5}
                  />
                ))}
                
                {/* Y-axis labels */}
                {[0, 25, 50, 75, 100].map((percent: number) => {
                  const price = yMax - (percent / 100) * (yMax - yMin)
                  return (
                    <text
                      key={percent}
                      x="35"
                      y={45 + (percent / 100) * 220}
                      fill="white"
                      fontSize="10"
                      textAnchor="end"
                    >
                      ${price.toFixed(4)}
                    </text>
                  )
                })}
                
                {/* Candlesticks */}
                {chartData.map((item: any, index: number) => {
                  const chartWidth = 600 // Approximate chart width
                  const x = 50 + (index / Math.max(chartData.length - 1, 1)) * (chartWidth - 100)
                  const candleWidth = Math.max((chartWidth - 100) / chartData.length * 0.8, 2)
                  
                  // Calculate positions
                  const priceToY = (price: number) => 40 + ((yMax - price) / (yMax - yMin)) * 220
                  
                  const highY = priceToY(item.high)
                  const lowY = priceToY(item.low)
                  const openY = priceToY(item.open)
                  const closeY = priceToY(item.close)
                  
                  const isPositive = item.close >= item.open
                  const bodyColor = isPositive ? "#22c55e" : "#ef4444"
                  const wickColor = isPositive ? "#16a34a" : "#dc2626"
                  
                  const bodyTop = Math.min(openY, closeY)
                  const bodyHeight = Math.abs(closeY - openY) || 1
                  const bodyX = x - candleWidth / 2
                  
                  return (
                    <g key={index}>
                      {/* Wick */}
                      <line
                        x1={x}
                        y1={highY}
                        x2={x}
                        y2={lowY}
                        stroke={wickColor}
                        strokeWidth={1}
                      />
                      {/* Body */}
                      <rect
                        x={bodyX}
                        y={bodyTop}
                        width={candleWidth}
                        height={bodyHeight}
                        fill={isPositive ? bodyColor : "transparent"}
                        stroke={bodyColor}
                        strokeWidth={isPositive ? 0 : 1}
                      />
                      
                      {/* Tooltip trigger area */}
                      <rect
                        x={bodyX - 5}
                        y={Math.min(highY, lowY) - 5}
                        width={candleWidth + 10}
                        height={Math.abs(highY - lowY) + 10}
                        fill="transparent"
                        className="cursor-pointer"
                      >
                        <title>
                          {`Time: ${item.time}
Open: $${item.open.toFixed(4)}
High: $${item.high.toFixed(4)}
Low: $${item.low.toFixed(4)}
Close: $${item.close.toFixed(4)}
Volume: ${item.volume.toLocaleString()}`}
                        </title>
                      </rect>
                    </g>
                  )
                })}
                
                {/* X-axis labels */}
                {chartData.filter((_: any, index: number) => index % Math.ceil(chartData.length / 6) === 0).map((item: any, filteredIndex: number) => {
                  const originalIndex = filteredIndex * Math.ceil(chartData.length / 6)
                  const chartWidth = 600
                  const x = 50 + (originalIndex / Math.max(chartData.length - 1, 1)) * (chartWidth - 100)
                  return (
                    <text
                      key={filteredIndex}
                      x={x}
                      y="285"
                      fill="white"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {item.time.split(' ')[0]}
                    </text>
                  )
                })}
              </svg>
            </div>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

const suggestions = [
  "How does Astra's AI trading work?",
  "Explain the current SOL market conditions",
  "What's the best DeFi strategy for beginners?",
  "How to minimize transaction fees?",
]

export default function AiChatPage() {
  const { publicKey }: any = useWallet()
  console.log("Public Key is::::", publicKey)

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "Hello! I'm Astra AI, your DeFi assistant. How can I help you today?",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

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

      // Process the response
      if (geminiResponse.type && geminiResponse.token_name) {
        try {
          const marketData: any = await callMarketDataApi(
            geminiResponse.type,
            geminiResponse.token_name,
            publicKey,
            geminiResponse.transaction_hash,
          )

          // Check if this is chart data and render accordingly
          const shouldShowChart = ["hist_data", "candlestick_history", "historical_index_price", "candlestick"].includes(
            geminiResponse.type,
          )

          if (shouldShowChart) {
            // Create a chart message
            const chartTitle =
              geminiResponse.type === "hist_data"
                ? "Historical Price Data"
                : geminiResponse.type === "candlestick"
                  ? "Current Candlestick Chart"
                : geminiResponse.type === "candlestick_history"
                  ? "Historical Candlestick Chart"
                : geminiResponse.type === "historical_index_price"
                  ? "Historical Index Price"
                : "Price Chart"

            // Add the AI response first
            const formattedResponse =
              geminiResponse.text || `Here's the ${chartTitle.toLowerCase()} for ${geminiResponse.token_name}:`

            const aiMessage: string = "Here is Your Data.."

            setMessages((prev) => [
              ...prev,
              { role: "system", content: aiMessage },
              {
                role: "system",
                content: "CHART_DATA",
                chartData: marketData,
                chartType: geminiResponse.type,
                chartTitle: `${chartTitle} - ${geminiResponse.token_name}`,
                tokenName: geminiResponse.token_name,
              } as any,
            ])
          } else {
            // Regular processing for non-chart data
            const formattedResponse =
              geminiResponse.text ||
              `Here's the information about ${geminiResponse.token_name}: ${JSON.stringify(marketData)}`

            const aiMessage: string = await extractImportantInfoFromData(formattedResponse)

            setMessages((prev) => [...prev, { role: "system", content: aiMessage }])
          }
        } catch (apiError: any) {
          console.log("my Api Error is:::", apiError)

          setMessages((prev) => [
            ...prev,
            {
              role: "system",
              content: `I couldn't fetch the market data for ${geminiResponse.token_name}: ${apiError.message}`,
            },
          ])
        }
      } else {
        // Show Gemini response if no actionable data
        const responseText = geminiResponse.text || JSON.stringify(geminiResponse)
        const aiMessage: string = await extractImportantInfoFromData(responseText)
        console.log("my ai messages are::::" + aiMessage)
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
        content: "Hello! I'm Astra AI, your DeFi assistant. How can I help you today?",
      },
    ])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-black p-6 rounded-xl text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text mb-1">
            AI Assistant
          </h1>
          <p className="text-white/60">Powered by advanced language models</p>
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

      <div className="flex-1 overflow-y-auto backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl mb-4 p-6 hover:border-white/20 transition-all hover:shadow-xl">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`}>
            {message.content === "CHART_DATA" ? (
              <div className="w-full max-w-4xl">
                {(message.chartType === "candlestick" || message.chartType === "candlestick_history") ? (
                  <CandlestickChart data={message.chartData} title={message.chartTitle || "Chart"} />
                ) : (
                  <HistoricalPriceChart data={message.chartData} title={message.chartTitle || "Chart"} />
                )}
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
                    message.role === "user" ? "bg-white/5 border border-white/10" : "bg-black/30 border border-white/10"
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

      <div className="relative">
        <div className="backdrop-blur-md bg-black/30 border border-white/10 rounded-xl overflow-hidden">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
            placeholder="Ask Astra AI about DeFi strategies, market analysis, or trading tips..."
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

      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => setInput(suggestion)}
            className="backdrop-blur-sm bg-white/5 text-sm py-2 px-4 rounded-full hover:bg-white/10 transition-colors border border-white/10 text-white/80 hover:text-white hover:border-white/20"
            disabled={loading}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
