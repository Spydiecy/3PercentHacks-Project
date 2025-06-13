"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  RadialBarChart,
  RadialBar,
} from "recharts"
import {
  Download,
  DollarSign,
  Coins,
  Activity,
  RefreshCw,
  X,
  BarChart3,
  TrendingUp,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Database,
} from "lucide-react"

// Dummy address for RootScan API
const DUMMY_ADDRESS = "0xc6342AD85a4d5CF9EEf0fcC9299C793200EA821F"

// Enhanced chain configuration
const AVAILABLE_CHAINS = [
  { id: "7668", name: "TRN (The Root Network)", label: "ROOT", color: "from-green-500 to-blue-500" },
]

const TIME_PERIODS = [
  { label: "24H", value: "24h" },
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "1Y", value: "1y" },
]

// Color palette for neon effects
const NEON_COLORS = ["#00FFFF", "#FF00FF", "#FFFF00", "#00FF00", "#FF0080", "#8000FF", "#FF8000", "#0080FF"]
const GRADIENT_COLORS = [
  "from-cyan-500 to-blue-500",
  "from-purple-500 to-pink-500",
  "from-green-500 to-teal-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-purple-500",
  "from-pink-500 to-rose-500",
  "from-yellow-500 to-orange-500",
  "from-teal-500 to-cyan-500",
]

interface TokenBalance {
  contractAddress: string
  address: string
  balance: number
  balanceFormatted: string
  token: {
    contractAddress: string
    priceData: {
      price: number
      volume_24h: number
      percent_change_24h: number
      percent_change_7d: number
      market_cap: number
    }
    decimals: number
    name: string
    symbol: string
    totalSupply: number
    type: string
  }
}

interface NativeTransfer {
  eventId: string
  args: {
    from: string
    to: string
    amount: number
  }
  blockNumber: number
  timestamp: number
  hash: string
  method: string
}

interface Extrinsic {
  extrinsicId: string
  args: any
  block: number
  hash: string
  method: string
  section: string
  timestamp: number
  isSuccess: boolean
  fee?: {
    actualFee: number
    actualFeeFormatted: number
  }
}

// Rate limiting manager
class RateLimitManager {
  private queue: Array<() => Promise<any>> = []
  private isProcessing = false
  private minDelay = 1000 // 1 second between requests
  private maxRetries = 3

  async addRequest<T>(requestFn: () => Promise<T>, retries = 0): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn()
          resolve(result)
        } catch (error: any) {
          if (error.status === 429 && retries < this.maxRetries) {
            const delay = this.minDelay * Math.pow(2, retries)
            setTimeout(() => {
              this.addRequest(requestFn, retries + 1)
                .then(resolve)
                .catch(reject)
            }, delay)
          } else {
            reject(error)
          }
        }
      })

      if (!this.isProcessing) {
        this.processQueue()
      }
    })
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return

    this.isProcessing = true

    while (this.queue.length > 0) {
      const request = this.queue.shift()
      if (request) {
        try {
          await request()
        } catch (error) {
          console.error("Request failed:", error)
        }

        if (this.queue.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, this.minDelay))
        }
      }
    }

    this.isProcessing = false
  }
}

const rateLimitManager = new RateLimitManager()

export default function RootScanPortfolio() {
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState("")
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  // RootScan API Data
  const [addressData, setAddressData] = useState<any>(null)
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([])
  const [nftBalances, setNftBalances] = useState<any[]>([])
  const [nativeTransfers, setNativeTransfers] = useState<NativeTransfer[]>([])
  const [evmTransfers, setEvmTransfers] = useState<any[]>([])
  const [extrinsics, setExtrinsics] = useState<Extrinsic[]>([])
  const [selectedExtrinsic, setSelectedExtrinsic] = useState<any>(null)

  // UI State
  const [selectedTable, setSelectedTable] = useState<"overview" | "tokens" | "transfers" | "extrinsics">("overview")
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)
  const [activeModal, setActiveModal] = useState<null | string>(null)
  const [apiResponses, setApiResponses] = useState<any>({})

  const apiKey = process.env.NEXT_PUBLIC_API_KEY 

  // Enhanced fetch function with rate limiting and response storage
  const fetchWithRateLimit = async (url: string, options: RequestInit, responseKey: string) => {
    return rateLimitManager.addRequest(async () => {
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()

      // Store API response for viewing
      setApiResponses((prev) => ({
        ...prev,
        [responseKey]: {
          url,
          method: options.method,
          body: options.body,
          response: data,
          timestamp: new Date().toISOString(),
        },
      }))

      return data
    })
  }

  const fetchRootScanData = async () => {
    setLoading(true)
    setLoadingProgress(0)

    try {
      // 1. Fetch address data
      setLoadingStep("Fetching address data...")
      setLoadingProgress(16)

      const addressResponse = await fetchWithRateLimit(
        "https://api.rootscan.io/v1/address",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({ address: DUMMY_ADDRESS }),
        },
        "address",
      )

      setAddressData(addressResponse.data)
      setTokenBalances(addressResponse.data?.balances || [])

      // 2. Fetch token balances
      setLoadingStep("Fetching token balances...")
      setLoadingProgress(32)

      const tokenResponse = await fetchWithRateLimit(
        "https://api.rootscan.io/v1/address-token-balances",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({ address: DUMMY_ADDRESS }),
        },
        "tokenBalances",
      )

      // 3. Fetch NFT balances
      setLoadingStep("Fetching NFT balances...")
      setLoadingProgress(48)

      const nftResponse = await fetchWithRateLimit(
        "https://api.rootscan.io/v1/address-nft-balances",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({ address: DUMMY_ADDRESS, page: 0 }),
        },
        "nftBalances",
      )

      setNftBalances(nftResponse.data || [])

      // 4. Fetch native transfers
      setLoadingStep("Fetching native transfers...")
      setLoadingProgress(64)

      const transfersResponse = await fetchWithRateLimit(
        "https://api.rootscan.io/v1/native-transfers",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({ address: DUMMY_ADDRESS }),
        },
        "nativeTransfers",
      )

      setNativeTransfers(transfersResponse.data || [])

      // 5. Fetch EVM transfers
      setLoadingStep("Fetching EVM transfers...")
      setLoadingProgress(80)

      const evmResponse = await fetchWithRateLimit(
        "https://api.rootscan.io/v1/evm-transfers",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({ address: DUMMY_ADDRESS }),
        },
        "evmTransfers",
      )

      setEvmTransfers(evmResponse.data || [])

      // 6. Fetch extrinsics
      setLoadingStep("Fetching extrinsics...")
      setLoadingProgress(96)

      const extrinsicsResponse = await fetchWithRateLimit(
        "https://api.rootscan.io/v1/extrinsics",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({ address: DUMMY_ADDRESS }),
        },
        "extrinsics",
      )

      setExtrinsics(extrinsicsResponse.data || [])

      setLoadingStep("Data loaded successfully!")
      setLoadingProgress(100)
    } catch (error) {
      console.error("Error fetching data:", error)
      setLoadingStep("Error loading data. Please try again.")
    } finally {
      setTimeout(() => {
        setLoading(false)
        setLoadingStep("")
        setLoadingProgress(0)
      }, 500)
    }
  }

  const fetchExtrinsicDetails = async (hash: string) => {
    try {
      const response = await fetchWithRateLimit(
        "https://api.rootscan.io/v1/extrinsic",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({ hash }),
        },
        `extrinsicDetail_${hash}`,
      )

      setSelectedExtrinsic(response.data)
    } catch (error) {
      console.error("Error fetching extrinsic details:", error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchRootScanData()
    setRefreshing(false)
  }

  const handleExport = () => {
    const data = {
      addressData,
      tokenBalances,
      nftBalances,
      nativeTransfers,
      evmTransfers,
      extrinsics,
      apiResponses,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `rootscan-portfolio-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    fetchRootScanData()
  }, [])

  // Calculate portfolio stats
  const portfolioStats = {
    totalValue: tokenBalances.reduce((sum, token) => {
      const value = Number.parseFloat(token.balanceFormatted) * token.token.priceData.price
      return sum + value
    }, 0),
    totalTokens: tokenBalances.length,
    totalTransfers: nativeTransfers.length + evmTransfers.length,
    totalExtrinsics: extrinsics.length,
    freeBalance: addressData?.balance?.freeFormatted || "0",
    nftCount: nftBalances.length,
  }

  // Prepare chart data
  const tokenChartData = tokenBalances.map((token, index) => ({
    name: token.token.symbol,
    value: Number.parseFloat(token.balanceFormatted) * token.token.priceData.price,
    balance: Number.parseFloat(token.balanceFormatted),
    price: token.token.priceData.price,
    change24h: token.token.priceData.percent_change_24h,
    color: NEON_COLORS[index % NEON_COLORS.length],
  }))

  const transfersChartData = nativeTransfers.slice(0, 10).map((transfer, index) => ({
    name: `Block ${transfer.blockNumber}`,
    amount: transfer.args.amount / 1e12,
    timestamp: new Date(transfer.timestamp * 1000).toLocaleDateString(),
    block: transfer.blockNumber,
    type: transfer.args.from.toLowerCase() === DUMMY_ADDRESS.toLowerCase() ? "Sent" : "Received",
  }))

  const priceChangeData = tokenBalances.map((token, index) => ({
    symbol: token.token.symbol,
    change24h: token.token.priceData.percent_change_24h,
    change7d: token.token.priceData.percent_change_7d || 0,
    volume: token.token.priceData.volume_24h,
    color: NEON_COLORS[index % NEON_COLORS.length],
  }))

  const extrinsicsData = extrinsics.slice(0, 8).map((ext, index) => ({
    method: `${ext.section}.${ext.method}`,
    success: ext.isSuccess ? 1 : 0,
    fee: ext.fee?.actualFeeFormatted || 0,
    block: ext.block,
    color: ext.isSuccess ? "#00FF00" : "#FF0040",
  }))

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/20 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text animate-pulse">
            RootScan Portfolio
          </h1>
          <p className="text-gray-300 text-lg">Advanced blockchain analytics for The Root Network</p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => setActiveModal("api-responses")}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/30"
            >
              <Database className="h-4 w-4 mr-2" />
              View API Responses
            </Button>
            <Button
              onClick={handleExport}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg shadow-green-500/25 border border-green-400/30"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Loading Progress */}
        {loading && (
          <Card className="bg-black/40 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300 font-medium">{loadingStep}</span>
                  <span className="text-cyan-400 font-bold">{loadingProgress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-lg shadow-cyan-500/50"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <div className="flex items-center gap-2 text-cyan-400 text-sm">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Processing RootScan API requests...
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <NeonStatsCard
            title="Portfolio Value"
            value={`$${portfolioStats.totalValue.toFixed(2)}`}
            icon={DollarSign}
            gradient={GRADIENT_COLORS[0]}
            change="+2.5%"
            glowColor="cyan"
          />
          <NeonStatsCard
            title="Free Balance"
            value={`${portfolioStats.freeBalance} ROOT`}
            icon={Wallet}
            gradient={GRADIENT_COLORS[1]}
            change="+1.2%"
            glowColor="purple"
          />
          <NeonStatsCard
            title="Active Tokens"
            value={portfolioStats.totalTokens.toString()}
            icon={Coins}
            gradient={GRADIENT_COLORS[2]}
            change="Live"
            glowColor="green"
          />
          <NeonStatsCard
            title="Transactions"
            value={portfolioStats.totalTransfers.toString()}
            icon={Activity}
            gradient={GRADIENT_COLORS[3]}
            change={`${portfolioStats.totalExtrinsics} extrinsics`}
            glowColor="orange"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-black/60 p-2 rounded-xl border border-gray-700/50 backdrop-blur-sm">
          {[
            { key: "overview", label: "Overview", icon: BarChart3 },
            { key: "tokens", label: "Tokens", icon: Coins },
            { key: "transfers", label: "Transfers", icon: Activity },
            { key: "extrinsics", label: "Extrinsics", icon: Zap },
          ].map((tab, index) => (
            <Button
              key={tab.key}
              variant={selectedTable === tab.key ? "default" : "ghost"}
              onClick={() => setSelectedTable(tab.key as any)}
              className={`flex-1 gap-2 transition-all duration-300 ${
                selectedTable === tab.key
                  ? `bg-gradient-to-r ${GRADIENT_COLORS[index]} text-white shadow-lg border border-white/20`
                  : "text-gray-300 hover:text-white hover:bg-white/10 border border-transparent"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Content based on active tab */}
        {selectedTable === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Token Distribution */}
            <NeonCard title="Token Distribution" icon={Coins} glowColor="cyan">
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
                    {tokenChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`$${value.toFixed(2)}`, "Value"]}
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "1px solid rgba(0, 255, 255, 0.3)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </NeonCard>

            {/* Price Changes */}
            <NeonCard title="Price Changes (24h)" icon={TrendingUp} glowColor="purple">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priceChangeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="symbol" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "1px solid rgba(147, 51, 234, 0.3)",
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
            </NeonCard>

            {/* Transfer Activity */}
            <NeonCard title="Transfer Activity" icon={Activity} glowColor="green" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={transfersChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#10B981" fill="url(#colorAmount)" strokeWidth={2} />
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </NeonCard>

            {/* Extrinsics Success Rate */}
            <NeonCard title="Extrinsics Overview" icon={Zap} glowColor="orange" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={300}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={extrinsicsData}>
                  <RadialBar dataKey="success" cornerRadius={10} fill="#00FF00" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "1px solid rgba(249, 115, 22, 0.3)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </NeonCard>
          </div>
        )}

        {selectedTable === "tokens" && (
          <NeonCard title="Token Balances" icon={Coins} glowColor="cyan">
            <div className="space-y-4">
              {tokenBalances.map((token, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${NEON_COLORS[index % NEON_COLORS.length]}, ${NEON_COLORS[(index + 1) % NEON_COLORS.length]})`,
                        boxShadow: `0 0 20px ${NEON_COLORS[index % NEON_COLORS.length]}40`,
                      }}
                    >
                      {token.token.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{token.token.name}</h3>
                      <p className="text-gray-400">{token.token.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">{token.balanceFormatted}</p>
                    <p className="text-gray-400">
                      ${(Number.parseFloat(token.balanceFormatted) * token.token.priceData.price).toFixed(2)}
                    </p>
                    <Badge
                      variant={token.token.priceData.percent_change_24h >= 0 ? "default" : "destructive"}
                      className={`mt-1 ${
                        token.token.priceData.percent_change_24h >= 0
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      }`}
                    >
                      {token.token.priceData.percent_change_24h >= 0 ? "+" : ""}
                      {token.token.priceData.percent_change_24h.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </NeonCard>
        )}

        {selectedTable === "transfers" && (
          <NeonCard title="Native Transfers" icon={Activity} glowColor="purple">
            <div className="space-y-4">
              {nativeTransfers.slice(0, 10).map((transfer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-full ${
                        transfer.args.from.toLowerCase() === DUMMY_ADDRESS.toLowerCase()
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-green-500/20 text-green-400 border border-green-500/30"
                      }`}
                    >
                      {transfer.args.from.toLowerCase() === DUMMY_ADDRESS.toLowerCase() ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {transfer.args.from.toLowerCase() === DUMMY_ADDRESS.toLowerCase() ? "Sent" : "Received"}
                      </p>
                      <p className="text-gray-400 text-sm">Block #{transfer.blockNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{(transfer.args.amount / 1e12).toFixed(6)} ROOT</p>
                    <p className="text-gray-400 text-sm">{new Date(transfer.timestamp * 1000).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </NeonCard>
        )}

        {selectedTable === "extrinsics" && (
          <NeonCard title="Extrinsics" icon={Zap} glowColor="orange">
            <div className="space-y-4">
              {extrinsics.map((extrinsic, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 backdrop-blur-sm cursor-pointer"
                  onClick={() => fetchExtrinsicDetails(extrinsic.hash)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-full ${
                        extrinsic.isSuccess
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {extrinsic.section}.{extrinsic.method}
                      </p>
                      <p className="text-gray-400 text-sm font-mono">{extrinsic.hash.slice(0, 20)}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={extrinsic.isSuccess ? "default" : "destructive"}
                      className={
                        extrinsic.isSuccess
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      }
                    >
                      {extrinsic.isSuccess ? "Success" : "Failed"}
                    </Badge>
                    <p className="text-gray-400 text-sm mt-1">
                      {new Date(extrinsic.timestamp * 1000).toLocaleString()}
                    </p>
                    {extrinsic.fee && (
                      <p className="text-gray-400 text-sm">Fee: {extrinsic.fee.actualFeeFormatted} ROOT</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </NeonCard>
        )}

        {/* API Responses Modal */}
        {activeModal === "api-responses" && (
          <Modal onClose={() => setActiveModal(null)}>
            <div className="p-6 text-white max-w-6xl max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">
                API Response Models
              </h2>
              <div className="space-y-4">
                {Object.entries(apiResponses).map(([key, response]: [string, any]) => (
                  <div key={key} className="bg-black/60 p-4 rounded-lg border border-cyan-500/30">
                    <h3 className="font-semibold mb-2 text-cyan-400 flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      {key.charAt(0).toUpperCase() + key.slice(1)} API
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-400">Endpoint:</p>
                        <p className="text-xs font-mono text-cyan-300">{response.url}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Timestamp:</p>
                        <p className="text-xs text-gray-300">{new Date(response.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="bg-black/80 p-3 rounded border border-gray-700/50 max-h-60 overflow-y-auto">
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                        {JSON.stringify(response.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        )}

        {/* Extrinsic Details Modal */}
        {selectedExtrinsic && (
          <Modal onClose={() => setSelectedExtrinsic(null)}>
            <div className="p-6 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-400 text-transparent bg-clip-text">
                Extrinsic Details
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/60 p-4 rounded-lg border border-orange-500/30">
                    <h4 className="font-semibold text-orange-400 mb-2">Hash</h4>
                    <p className="font-mono text-sm break-all text-gray-300">{selectedExtrinsic.hash}</p>
                  </div>
                  <div className="bg-black/60 p-4 rounded-lg border border-orange-500/30">
                    <h4 className="font-semibold text-orange-400 mb-2">Method</h4>
                    <p className="text-gray-300">
                      {selectedExtrinsic.section}.{selectedExtrinsic.method}
                    </p>
                  </div>
                  <div className="bg-black/60 p-4 rounded-lg border border-orange-500/30">
                    <h4 className="font-semibold text-orange-400 mb-2">Block</h4>
                    <p className="text-gray-300">{selectedExtrinsic.block}</p>
                  </div>
                  <div className="bg-black/60 p-4 rounded-lg border border-orange-500/30">
                    <h4 className="font-semibold text-orange-400 mb-2">Status</h4>
                    <Badge
                      variant={selectedExtrinsic.isSuccess ? "default" : "destructive"}
                      className={
                        selectedExtrinsic.isSuccess
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      }
                    >
                      {selectedExtrinsic.isSuccess ? "Success" : "Failed"}
                    </Badge>
                  </div>
                </div>

                {selectedExtrinsic.events && (
                  <div className="bg-black/60 p-4 rounded-lg border border-orange-500/30">
                    <h4 className="font-semibold text-orange-400 mb-2">Events</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedExtrinsic.events.map((event: any, index: number) => (
                        <div key={index} className="p-3 bg-black/40 rounded border border-gray-700/50">
                          <p className="font-semibold text-cyan-400">
                            {event.section}.{event.method}
                          </p>
                          <p className="text-sm text-gray-400 mb-2">{event.doc}</p>
                          <pre className="text-xs text-gray-300 overflow-x-auto bg-black/60 p-2 rounded">
                            {JSON.stringify(event.args, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}

function NeonStatsCard({
  title,
  value,
  icon: Icon,
  gradient,
  change,
  glowColor,
}: {
  title: string
  value: string
  icon: any
  gradient: string
  change: string
  glowColor: string
}) {
  const glowColors = {
    cyan: "shadow-cyan-500/25",
    purple: "shadow-purple-500/25",
    green: "shadow-green-500/25",
    orange: "shadow-orange-500/25",
  }

  return (
    <Card
      className={`bg-black/40 border border-gray-700/50 hover:border-white/30 transition-all duration-300 backdrop-blur-sm ${glowColors[glowColor as keyof typeof glowColors]} hover:shadow-lg group`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            <p className="text-gray-400 text-sm mt-1">{change}</p>
          </div>
          <div
            className={`p-3 rounded-full bg-gradient-to-r ${gradient} group-hover:scale-110 transition-transform duration-300 shadow-lg`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function NeonCard({
  title,
  icon: Icon,
  glowColor,
  children,
  className = "",
}: {
  title: string
  icon: any
  glowColor: string
  children: React.ReactNode
  className?: string
}) {
  const glowColors = {
    cyan: "border-cyan-500/30 shadow-cyan-500/10",
    purple: "border-purple-500/30 shadow-purple-500/10",
    green: "border-green-500/30 shadow-green-500/10",
    orange: "border-orange-500/30 shadow-orange-500/10",
  }

  return (
    <Card
      className={`bg-black/40 border ${glowColors[glowColor as keyof typeof glowColors]} hover:border-white/30 transition-all duration-300 backdrop-blur-sm shadow-lg ${className}`}
    >
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-black/90 rounded-xl shadow-2xl border border-cyan-500/30 relative max-w-6xl w-full mx-4 shadow-cyan-500/20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl z-10 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  )
}
