"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  LineChart,
  MessageCircle,
  ArrowLeftRight,
  Sparkles,
  TrendingUp,
  CreditCard,
  Settings,
  ChevronDown,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

// Types and interfaces
interface PortfolioValueResponse {
  code: string
  data: Array<{ totalValue: string }>
  msg: string
}

interface TokenBalancesResponse {
  code: string
  data: Array<{ tokenAssets: any[] }>
  msg: string
}

interface TransactionsResponse {
  code: string
  data: Array<{ transactions: any[] }>
  msg: string
}

interface MarketPriceResponse {
  code: string
  data: Array<{
    chainIndex: string
    price: string
    time: string
    tokenContractAddress: string
  }>
  msg: string
}

interface DashboardStats {
  portfolioValue: string
  totalTransactions: number
  activeChains: number
  totalTokens: number
}

// Chain configuration
const chainOptions = [
 
  { name: "Solana", value: "501", label: "SOL" },
]

const quickActions = [
  {
    id: "ai-chat",
    label: "AI Assistant",
    icon: MessageCircle,
    href: "/dashboard/ai-chat",
    gradientFrom: "#8B5CF6",
    gradientTo: "#6366F1",
  },
  {
    id: "swap",
    label: "Swap",
    icon: ArrowLeftRight,
    href: "/dashboard/swap",
    gradientFrom: "#EC4899",
    gradientTo: "#F43F5E",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: TrendingUp,
    href: "/dashboard/portfolio",
    gradientFrom: "#F59E0B",
    gradientTo: "#EF4444",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    gradientFrom: "#10B981",
    gradientTo: "#059669",
  },
]

// Demo addresses for different purposes
const demoAddresses = {
  portfolio: "52C9T2T7JRojtxumYnYZhyUmrN7kqzvCLc4Ksvjk7TxD",
  transactions: "52C9T2T7JRojtxumYnYZhyUmrN7kqzvCLc4Ksvjk7TxD",
  market: "52C9T2T7JRojtxumYnYZhyUmrN7kqzvCLc4Ksvjk7TxD",
}

export default function DashboardPage() {
  const [isHovering, setIsHovering] = useState<string | null>(null)
  const [selectedChain, setSelectedChain] = useState(chainOptions[0])
  const [showChainDropdown, setShowChainDropdown] = useState(false)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    portfolioValue: "0",
    totalTransactions: 0,
    activeChains: 0,
    totalTokens: 0,
  })
  const [tokenAssets, setTokenAssets] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [marketPrices, setMarketPrices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Fetch portfolio value
  const fetchPortfolioValue = async (chains: string) => {
    try {
      const response = await fetch("/api/portfolio/token_value", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: demoAddresses.portfolio,
          chains: chains,
          excludeRiskToken: "0",
        }),
      })
      const data = await response.json()
      return data?.data?.[0]?.totalValue || "0"
    } catch (error) {
      console.error("Error fetching portfolio value:", error)
      return "0"
    }
  }

  // Fetch token balances
  const fetchTokenBalances = async (chains: string) => {
    try {
      const response = await fetch("/api/portfolio/total_token_balances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: demoAddresses.portfolio,
          chains: chains,
          excludeRiskToken: "0",
        }),
      })
      const data = await response.json()
      return data?.data?.[0]?.tokenAssets || []
    } catch (error) {
      console.error("Error fetching token balances:", error)
      return []
    }
  }

  // Fetch transaction history
  const fetchTransactions = async (chainIndex: string) => {
    try {
      const response = await fetch("/api/portfolio/history_by_add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: demoAddresses.transactions,
          chains: chainIndex === "1,56,137,42161,10,43114,250,324,8453" ? "1" : chainIndex.split(",")[0],
          limit: "20",
        }),
      })
      const data = await response.json()
      return data?.data?.[0]?.transactions || []
    } catch (error) {
      console.error("Error fetching transactions:", error)
      return []
    }
  }

  // Fetch market prices for multiple tokens
  const fetchMarketPrices = async () => {
    try {
      const tokenAddresses = [
        { chain: "1", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" }, // USDC
        { chain: "1", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" }, // USDT
        { chain: "56", address: "0x55d398326f99059fF775485246999027B3197955" }, // USDT BSC
        { chain: "137", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" }, // USDC Polygon
      ]

      const promises = tokenAddresses.map(async ({ chain, address }) => {
        try {
          const response = await fetch("/api/market_data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              method: "POST",
              path: "/api/v5/dex/market/price",
              data: [
                {
                  chainIndex: chain,
                  tokenContractAddress: address,
                },
              ],
            }),
          })
          const data = await response.json()
          return data?.data?.[0] || null
        } catch (error) {
          console.error(`Error fetching price for ${address}:`, error)
          return null
        }
      })

      const results = await Promise.all(promises)
      return results.filter(Boolean)
    } catch (error) {
      console.error("Error fetching market prices:", error)
      return []
    }
  }

  // Main data fetching function
  const fetchAllData = async () => {
    setLoading(true)
    setError(null)

    try {
      const chains = selectedChain.value

      // Fetch all data concurrently
      const [portfolioValue, tokenBalances, transactionHistory, marketData] = await Promise.all([
        fetchPortfolioValue(chains),
        fetchTokenBalances(chains),
        fetchTransactions(chains),
        fetchMarketPrices(),
      ])

      // Update state with fetched data
      setDashboardStats({
        portfolioValue: portfolioValue,
        totalTransactions: transactionHistory.length,
        activeChains: chains.split(",").length,
        totalTokens: tokenBalances.length,
      })

      setTokenAssets(tokenBalances)
      setTransactions(transactionHistory)
      setMarketPrices(marketData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on component mount and when chain changes
  useEffect(() => {
    fetchAllData()
  }, [selectedChain])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllData()
    }, 1230000)

    return () => clearInterval(interval)
  }, [selectedChain])

  const handleRefresh = () => {
    fetchAllData()
  }

  const formatCurrency = (value: string | number) => {
    const num = Number(value)
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`
    }
    return `$${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  }

  const getChainName = (chainIndex: string) => {
    const chain = chainOptions.find((c) => c.value === chainIndex)
    return chain?.label || `Chain ${chainIndex}`
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="relative">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text mb-2">
              Welcome back
            </h1>
            <p className="text-white/60">Your DeFi portfolio across multiple chains</p>
          </div>

          {/* Chain Selector and Refresh */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Button
                variant="outline"
                className="border-white/20 hover:bg-white/10 text-white gap-2"
                onClick={() => setShowChainDropdown(!showChainDropdown)}
              >
                {selectedChain.label}
                <ChevronDown className="h-4 w-4" />
              </Button>

              {showChainDropdown && (
                <div className="absolute top-full mt-2 right-0 bg-black/90 border border-white/20 rounded-lg p-2 min-w-[200px] z-50 backdrop-blur-sm">
                  <div className="max-h-60 overflow-y-auto">
                    {chainOptions.map((chain) => (
                      <button
                        key={chain.value}
                        className="w-full flex items-center justify-between p-2 hover:bg-white/10 rounded text-left text-white"
                        onClick={() => {
                          setSelectedChain(chain)
                          setShowChainDropdown(false)
                        }}
                      >
                        <span>{chain.name}</span>
                        {selectedChain.value === chain.value && (
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="border-white/20 hover:bg-white/10 text-white"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            id="portfolio-value"
            title="Portfolio Value"
            value={formatCurrency(dashboardStats.portfolioValue)}
            change={`${dashboardStats.totalTokens} tokens`}
            trend="up"
            icon={LineChart}
            gradientFrom="#8B5CF6"
            gradientTo="#3B82F6"
          />
          <DashboardCard
            id="transactions"
            title="Total Transactions"
            value={dashboardStats.totalTransactions.toString()}
            change="Last 20 transactions"
            trend="up"
            icon={CreditCard}
            gradientFrom="#EC4899"
            gradientTo="#8B5CF6"
          />
          <DashboardCard
            id="chains"
            title="Active Chains"
            value={dashboardStats.activeChains.toString()}
            change="Multi-chain portfolio"
            trend="up"
            icon={Sparkles}
            gradientFrom="#F59E0B"
            gradientTo="#EF4444"
          />
          <DashboardCard
            id="updated"
            title="Last Updated"
            value={lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            change="Auto-refresh enabled"
            trend="up"
            icon={MessageCircle}
            gradientFrom="#10B981"
            gradientTo="#3B82F6"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-4">
            <div className="text-red-400 text-sm">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        {/* Recent Transactions */}
        <div className="col-span-2">
          <Card className="bg-black/20 border-white/10 hover:border-white/20 transition-all hover:shadow-xl h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">
                  Recent Transactions
                </CardTitle>
                <Link href="/dashboard/transactions">
                  <Button variant="ghost" size="sm" className="gap-1 text-white/80 hover:text-white hover:bg-white/10">
                    View All <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-white/60 text-center py-8">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                  <div className="text-white/60 text-center py-8">No transactions found for selected chain(s).</div>
                ) : (
                  transactions.slice(0, 5).map((tx, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-4 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2.5 rounded-full ${
                            tx.amount && Number(tx.amount) > 0
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                          }`}
                        >
                          {tx.amount && Number(tx.amount) > 0 ? "+" : "-"}
                        </div>
                        <div>
                          <p className="font-medium text-white/90">{tx.symbol || "Unknown"}</p>
                          <p className="text-sm text-white/60">
                            {tx.txTime ? new Date(Number(tx.txTime) * 1000).toLocaleString() : "Unknown time"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white/90">{tx.amount || "0"}</p>
                        <p className="text-sm text-white/60">
                          {tx.txHash ? `${tx.txHash.slice(0, 8)}...${tx.txHash.slice(-6)}` : "No hash"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="bg-black/20 border-white/10 hover:border-white/20 transition-all hover:shadow-xl h-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {quickActions.map((action) => (
                  <Link
                    href={action.href}
                    key={action.id}
                    onMouseEnter={() => setIsHovering(action.id)}
                    onMouseLeave={() => setIsHovering(null)}
                  >
                    <div className="relative group flex flex-col items-center justify-center p-5 rounded-xl overflow-hidden transition-all hover:scale-105 duration-300">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br opacity-20 ${isHovering === action.id ? "opacity-40" : "opacity-20"} transition-opacity`}
                        style={{
                          backgroundImage: `linear-gradient(to bottom right, ${action.gradientFrom}, ${action.gradientTo})`,
                        }}
                      ></div>
                      <div className="relative z-10 flex flex-col items-center">
                        <action.icon className={`h-8 w-8 mb-3 text-white group-hover:scale-110 transition-transform`} />
                        <span className="font-medium text-white text-sm">{action.label}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-violet-500/20 to-blue-500/20 border border-white/10">
                <div className="flex items-center mb-2">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
                  <h3 className="font-medium text-white">AI Suggestion</h3>
                </div>
                <p className="text-sm text-white/70 mb-3">
                  Your portfolio is well diversified across {dashboardStats.activeChains} chains. Consider rebalancing
                  based on recent market trends.
                </p>
                <Link href="/dashboard/ai-chat">
                  <Button size="sm" variant="outline" className="w-full border-white/20 hover:bg-white/10 text-white">
                    Get AI Analysis
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Portfolio Overview */}
      <Card className="bg-black/20 border-white/10 hover:border-white/20 transition-all hover:shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">
              Token Holdings
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white">
                Value
              </Button>
              <Button variant="outline" size="sm" className="border-white/20 bg-white/10 text-white">
                Balance
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-white/60 text-center py-8">Loading token balances...</div>
            ) : tokenAssets.length === 0 ? (
              <div className="text-white/60 text-center py-8">No token balances found for selected chain(s).</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left pb-3 text-white/60">Token</th>
                    <th className="text-right pb-3 text-white/60">Chain</th>
                    <th className="text-right pb-3 text-white/60">Balance</th>
                    <th className="text-right pb-3 text-white/60">Price</th>
                    <th className="text-right pb-3 text-white/60">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {tokenAssets.slice(0, 10).map((asset, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                            {asset.symbol?.slice(0, 2) || "TK"}
                          </div>
                          <span className="font-medium text-white">{asset.symbol || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="text-right py-4">
                        <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">
                          {getChainName(asset.chainIndex)}
                        </span>
                      </td>
                      <td className="text-right py-4 text-white">
                        {Number(asset.balance || 0).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                      </td>
                      <td className="text-right py-4 text-white">
                        ${Number(asset.tokenPrice || 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </td>
                      <td className="text-right py-4 text-white font-medium">
                        $
                        {(Number(asset.balance || 0) * Number(asset.tokenPrice || 0)).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Market Prices */}
      <Card className="bg-black/20 border-white/10 hover:border-white/20 transition-all hover:shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">
            Live Market Prices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-white/60 text-center py-8">Loading market prices...</div>
            ) : marketPrices.length === 0 ? (
              <div className="text-white/60 text-center py-8">No market price data available.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left pb-3 text-white/60">Chain</th>
                    <th className="text-left pb-3 text-white/60">Token</th>
                    <th className="text-right pb-3 text-white/60">Price</th>
                    <th className="text-right pb-3 text-white/60">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {marketPrices.map((item, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4">
                        <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">
                          {getChainName(item.chainIndex)}
                        </span>
                      </td>
                      <td className="py-4 text-white font-mono text-sm">
                        {item.tokenContractAddress?.slice(0, 10)}...{item.tokenContractAddress?.slice(-8)}
                      </td>
                      <td className="text-right py-4 text-white font-medium">
                        ${Number(item.price || 0).toLocaleString(undefined, { maximumFractionDigits: 8 })}
                      </td>
                      <td className="text-right py-4 text-white/60 text-sm">
                        {item.time ? new Date(Number(item.time)).toLocaleTimeString() : "Unknown"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardCard({ id, title, value, change, trend, icon: Icon, gradientFrom, gradientTo }: any) {
  return (
    <div className="relative group">
      <div
        className="absolute inset-0 bg-gradient-to-r rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity"
        style={{ backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` }}
      ></div>
      <div className="relative h-full backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl p-6 overflow-hidden group-hover:border-white/20 transition-all group-hover:shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-white/60">{title}</p>
            <p className="text-2xl font-bold mt-1 text-white">{value}</p>
            <div className="flex items-center mt-1">
              <span
                className={`text-xs ${
                  trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-400" : "text-gray-400"
                }`}
              >
                {change}
              </span>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 backdrop-blur-sm border border-white/5">
            <Icon className="h-5 w-5 text-white/80" />
          </div>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-60"
          style={{ backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` }}
        ></div>
      </div>
    </div>
  )
}
