"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Download,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Coins,
  Activity,
  Award,
  ChevronDown,
  Search,
  RefreshCw,
  Eye,
  X,
} from "lucide-react"

// Enhanced chain configuration
const AVAILABLE_CHAINS = [
  { id: "501", name: "Solana", label: "SOL", color: "from-purple-500 to-blue-500" },
]

const TIME_PERIODS = [
  { label: "24H", value: "24h" },
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "1Y", value: "1y" },
]

export default function PortfolioPage() {
  const [activeModal, setActiveModal] = useState<null | string>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [tokenBalances, setTokenBalances] = useState<any[]>([])
  const [totalValue, setTotalValue] = useState<string>("0")
  const [specificToken, setSpecificToken] = useState<any[]>([])
  const [selectedTable, setSelectedTable] = useState<"balances" | "history" | "specific" | "total_value">("balances")
  const [selectedChains, setSelectedChains] = useState<string[]>(["501"])
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [searchTerm, setSearchTerm] = useState("")
  const [showChainDropdown, setShowChainDropdown] = useState(false)
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: "0",
    dayChange: "0",
    aiProfit: "0",
    stakingRewards: "0",
    dayChangePercent: "0",
    aiProfitPercent: "0",
    stakingPercent: "0",
  })

  // Toggle chain selection for multi-select
  const toggleChain = (chainId: string) => {
    setSelectedChains((prev) => (prev.includes(chainId) ? prev.filter((c) => c !== chainId) : [...prev, chainId]))
  }

  // Calculate portfolio statistics
  const calculateStats = (balances: any[], totalVal: string) => {
    const total = Number(totalVal)
    const dayChange = total * 0.0192 // Mock 1.92% change
    const aiProfit = total * 0.0468 // Mock 4.68% AI profit
    const staking = total * 0.0073 // Mock 0.73% staking

    setPortfolioStats({
      totalValue: totalVal,
      dayChange: dayChange.toFixed(2),
      aiProfit: aiProfit.toFixed(2),
      stakingRewards: staking.toFixed(2),
      dayChangePercent: "1.92",
      aiProfitPercent: "4.68",
      stakingPercent: "0.73",
    })
  }

  // Fetch all portfolio data
  const fetchPortfolioData = async () => {
    setLoading(true)
    try {
      const chainsStr = selectedChains.join(",")

      const [historyRes, balancesRes, valueRes, specificRes] = await Promise.all([
        fetch("/api/portfolio/history_by_add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: "52C9T2T7JRojtxumYnYZhyUmrN7kqzvCLc4Ksvjk7TxD",
            chains: "501", // Use first selected chain for history
            limit: "50",
          }),
        }),
        fetch("/api/portfolio/total_token_balances", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: "52C9T2T7JRojtxumYnYZhyUmrN7kqzvCLc4Ksvjk7TxD",
            chains: "501",
            excludeRiskToken: "0",
          }),
        }),
        fetch("/api/portfolio/token_value", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: "52C9T2T7JRojtxumYnYZhyUmrN7kqzvCLc4Ksvjk7TxD",
            chains: "501",
            excludeRiskToken: "0",
          }),
        }),
        fetch("/api/portfolio/specific_token_balance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: "52C9T2T7JRojtxumYnYZhyUmrN7kqzvCLc4Ksvjk7TxD",
            tokenContractAddresses: "So11111111111111111111111111111111111111112", // USDCx
            excludeRiskToken: "0",
          }),
        }),
      ])

      const historyJson = await historyRes.json()
      const balancesJson = await balancesRes.json()
      const valueJson = await valueRes.json()
      const specificJson = await specificRes.json()

      const transactions = historyJson?.data?.[0]?.transactionList || historyJson?.data?.[0]?.transactions || []
      const balances = balancesJson?.data?.[0]?.tokenAssets || []
      const value = valueJson?.data?.[0]?.totalValue || "0"
      const specific = specificJson?.data?.[0]?.tokenAssets || []

      setHistory(transactions)
      setTokenBalances(balances)
      setTotalValue(value)
      setSpecificToken(specific)
      calculateStats(balances, value)
    } catch (error) {
      console.error("Error fetching portfolio data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPortfolioData()
    setRefreshing(false)
  }

  // Export functionality
  const handleExport = () => {
    const data = {
      portfolioStats,
      tokenBalances,
      transactions: history,
      exportDate: new Date().toISOString(),
      selectedChains,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `portfolio-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Filter data based on search term
  const filteredData = () => {
    if (selectedTable === "balances") {
      return tokenBalances.filter(
        (asset) =>
          asset.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.tokenContractAddress?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    } else if (selectedTable === "history") {
      return history.filter(
        (tx) =>
          tx.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.txHash?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    return []
  }

  useEffect(() => {
    fetchPortfolioData()
  }, [selectedChains])

  const getChainInfo = (chainId: string) => {
    return AVAILABLE_CHAINS.find((chain) => chain.id === chainId) || AVAILABLE_CHAINS[0]
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text mb-2">
            Portfolio
          </h1>
          <p className="text-white/60">Track and manage your multi-chain assets</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-white/20 hover:bg-white/10 text-white"
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            >
              <Calendar className="h-4 w-4" />
              {TIME_PERIODS.find((p) => p.value === selectedPeriod)?.label}
              <ChevronDown className="h-4 w-4" />
            </Button>
            {showPeriodDropdown && (
              <div className="absolute top-full mt-2 right-0 bg-black/90 border border-white/20 rounded-lg p-2 min-w-[120px] z-50 backdrop-blur-sm">
                {TIME_PERIODS.map((period) => (
                  <button
                    key={period.value}
                    className="w-full text-left p-2 hover:bg-white/10 rounded text-white text-sm"
                    onClick={() => {
                      setSelectedPeriod(period.value)
                      setShowPeriodDropdown(false)
                    }}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-white/20 hover:bg-white/10 text-white"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-white/20 hover:bg-white/10 text-white"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Chain Selection */}
      <Card className="bg-black/20 border-white/10 hover:border-white/20 transition-all">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Active Chains ({selectedChains.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {AVAILABLE_CHAINS.map((chain) => {
              const isSelected = selectedChains.includes(chain.id)
              return (
                <button
                  key={chain.id}
                  onClick={() => toggleChain(chain.id)}
                  className={`relative px-4 py-2 rounded-full border transition-all duration-300 ${
                    isSelected
                      ? "border-white/40 bg-white/10 text-white shadow-lg"
                      : "border-white/20 hover:bg-white/5 text-white/80 hover:text-white"
                  }`}
                >
                  <div
                    className={`absolute inset-0 rounded-full bg-gradient-to-r opacity-20 ${
                      isSelected ? "opacity-30" : "opacity-0"
                    } transition-opacity ${chain.color}`}
                  ></div>
                  <span className="relative z-10 font-medium">{chain.label}</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PortfolioCard
          title="Total Value"
          value={`$${Number(portfolioStats.totalValue).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          change={`+${portfolioStats.dayChangePercent}%`}
          trend="up"
          icon={DollarSign}
          gradientFrom="#8B5CF6"
          gradientTo="#3B82F6"
        />
        <PortfolioCard
          title="24h Change"
          value={`$${Number(portfolioStats.dayChange).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          change={`+${portfolioStats.dayChangePercent}%`}
          trend="up"
          icon={TrendingUp}
          gradientFrom="#EC4899"
          gradientTo="#8B5CF6"
        />
        <PortfolioCard
          title="AI Generated Profit"
          value={`$${Number(portfolioStats.aiProfit).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          change={`+${portfolioStats.aiProfitPercent}%`}
          trend="up"
          icon={Activity}
          gradientFrom="#F59E0B"
          gradientTo="#EF4444"
        />
        <PortfolioCard
          title="Staking Rewards"
          value={`$${Number(portfolioStats.stakingRewards).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          change={`+${portfolioStats.stakingPercent}%`}
          trend="up"
          icon={Award}
          gradientFrom="#10B981"
          gradientTo="#3B82F6"
        />
      </div>

      {/* Controls */}
      <Card className="bg-black/20 border-white/10 hover:border-white/20 transition-all">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <select
                className="bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-sm hover:border-white/30 transition-colors"
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value as any)}
              >
                <option value="balances">All Token Balances</option>
                <option value="history">Transaction History</option>
                <option value="specific">Specific Token Balance</option>
                <option value="total_value">Total Portfolio Value</option>
              </select>
              <Button
                onClick={() => setActiveModal("details")}
                variant="outline"
                size="sm"
                className="border-white/20 hover:bg-white/10 text-white gap-2"
              >
                <Eye className="h-4 w-4" />
                Show Details
              </Button>
            </div>
            <div className="flex gap-3 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search tokens or transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-black/50 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-white/40 backdrop-blur-sm hover:border-white/30 transition-colors"
                />
              </div>
              <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Data Table */}
      <Card className="bg-black/20 border-white/10 hover:border-white/20 transition-all hover:shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">
            {selectedTable === "balances" && "Portfolio Breakdown"}
            {selectedTable === "history" && "Transaction History"}
            {selectedTable === "specific" && "Specific Token Balance"}
            {selectedTable === "total_value" && "Total Portfolio Value"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center text-white/60 py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                Loading portfolio data...
              </div>
            ) : selectedTable === "balances" ? (
              <TokenBalancesTable assets={filteredData()} />
            ) : selectedTable === "history" ? (
              <HistoryTable transactions={filteredData()} />
            ) : selectedTable === "specific" ? (
              <TokenBalancesTable assets={specificToken} />
            ) : (
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-8 border border-white/10">
                  <DollarSign className="h-16 w-16 mx-auto mb-4 text-white/80" />
                  <div className="text-3xl font-bold text-white mb-2">
                    ${Number(totalValue).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-white/60">Total Portfolio Value</div>
                  <div className="text-emerald-400 text-sm mt-2">+{portfolioStats.dayChangePercent}% (24h)</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal for details */}
      {activeModal === "details" && (
        <Modal onClose={() => setActiveModal(null)}>
          <div className="p-6 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">
              Portfolio API Data
            </h2>
            <div className="space-y-4">
              <div className="bg-black/50 p-4 rounded-lg border border-white/10">
                <h3 className="font-semibold mb-2 text-purple-400">Portfolio Statistics</h3>
                <pre className="text-xs overflow-x-auto text-white/80">{JSON.stringify(portfolioStats, null, 2)}</pre>
              </div>
              <div className="bg-black/50 p-4 rounded-lg border border-white/10">
                <h3 className="font-semibold mb-2 text-blue-400">Token Balances ({tokenBalances.length})</h3>
                <pre className="text-xs overflow-x-auto text-white/80 max-h-40">
                  {JSON.stringify(tokenBalances.slice(0, 5), null, 2)}
                </pre>
              </div>
              <div className="bg-black/50 p-4 rounded-lg border border-white/10">
                <h3 className="font-semibold mb-2 text-green-400">Recent Transactions ({history.length})</h3>
                <pre className="text-xs overflow-x-auto text-white/80 max-h-40">
                  {JSON.stringify(history.slice(0, 3), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function PortfolioCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  gradientFrom,
  gradientTo,
}: {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: any
  gradientFrom: string
  gradientTo: string
}) {
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
                className={`text-xs flex items-center gap-1 ${trend === "up" ? "text-emerald-400" : "text-rose-400"}`}
              >
                {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
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

function TokenBalancesTable({ assets }: { assets: any[] }) {
  if (!assets.length)
    return (
      <div className="text-center py-12">
        <Coins className="h-12 w-12 mx-auto mb-4 text-white/40" />
        <p className="text-white/60">No token balances found.</p>
      </div>
    )

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-white/10">
          <th className="text-left pb-4 text-white/60 font-medium">Asset</th>
          <th className="text-right pb-4 text-white/60 font-medium">Chain</th>
          <th className="text-right pb-4 text-white/60 font-medium">Price</th>
          <th className="text-right pb-4 text-white/60 font-medium">Holdings</th>
          <th className="text-right pb-4 text-white/60 font-medium">Value</th>
        </tr>
      </thead>
      <tbody>
        {assets.map((asset, idx) => {
          const chainInfo = AVAILABLE_CHAINS.find((c) => c.id === asset.chainIndex) || AVAILABLE_CHAINS[0]
          return (
            <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-r ${chainInfo.color} flex items-center justify-center`}
                  >
                    <span className="text-white text-xs font-bold">{asset.symbol?.slice(0, 2) || "TK"}</span>
                  </div>
                  <div>
                    <p className="font-medium text-white group-hover:text-white/90">{asset.symbol || "Unknown"}</p>
                    <p className="text-xs text-white/60">{asset.tokenContractAddress?.slice(0, 10)}...</p>
                  </div>
                </div>
              </td>
              <td className="text-right py-4">
                <span
                  className={`px-2 py-1 bg-gradient-to-r ${chainInfo.color} bg-opacity-20 rounded text-xs text-white`}
                >
                  {chainInfo.label}
                </span>
              </td>
              <td className="text-right py-4 text-white font-medium">
                ${Number(asset.tokenPrice || 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </td>
              <td className="text-right py-4 text-white">
                {Number(asset.balance || 0).toLocaleString(undefined, { maximumFractionDigits: 6 })}
              </td>
              <td className="text-right py-4 text-white font-bold">
                $
                {(Number(asset.balance || 0) * Number(asset.tokenPrice || 0)).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function HistoryTable({ transactions }: { transactions: any[] }) {
  if (!transactions.length)
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 mx-auto mb-4 text-white/40" />
        <p className="text-white/60">No transaction history found.</p>
      </div>
    )

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-white/10">
          <th className="text-left pb-4 text-white/60 font-medium">Transaction</th>
          <th className="text-right pb-4 text-white/60 font-medium">Amount</th>
          <th className="text-right pb-4 text-white/60 font-medium">Token</th>
          <th className="text-right pb-4 text-white/60 font-medium">Status</th>
          <th className="text-right pb-4 text-white/60 font-medium">Time</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx, idx) => (
          <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
            <td className="py-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${
                    Number(tx.amount) > 0
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                  }`}
                >
                  {Number(tx.amount) > 0 ? "+" : "-"}
                </div>
                <div>
                  <p className="font-medium text-white font-mono text-sm">
                    {tx.txHash?.slice(0, 10)}...{tx.txHash?.slice(-8)}
                  </p>
                  <p className="text-xs text-white/60">Transaction Hash</p>
                </div>
              </div>
            </td>
            <td className="text-right py-4 text-white font-medium">{tx.amount || "0"}</td>
            <td className="text-right py-4">
              <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">{tx.symbol || "Unknown"}</span>
            </td>
            <td className="text-right py-4">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  tx.txStatus === "success"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}
              >
                {tx.txStatus || "Unknown"}
              </span>
            </td>
            <td className="text-right py-4 text-white/80 text-sm">
              {tx.txTime ? new Date(Number(tx.txTime) * 1000).toLocaleString() : "Unknown"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-black/90 rounded-xl shadow-2xl border border-white/20 relative max-w-6xl w-full mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white text-xl z-10 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  )
}
