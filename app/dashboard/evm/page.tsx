"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useWallet } from "@/contexts/WalletContext"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell,
} from "recharts"
import {
  Activity,
  Blocks,
  Zap,
  Search,
  RefreshCw,
  X,
  Database,
  Download,
  Fuel,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react"

// Neon color palette
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

interface EVMTransaction {
  hash: string
  blockNumber: number
  from: string
  to: string
  value: number
  gasUsed: number
  gasPrice: string
  status: string
  timestamp: number
  functionName: string
  transactionFee: string
  events: any[]
  logs: any[]
}

interface Block {
  number: number
  hash: string
  timestamp: number
  transactionsCount: number
  eventsCount: number
  extrinsicsCount: number
  isFinalized: boolean
  evmBlock: {
    hash: string
    miner: string
  }
}

interface Event {
  eventId: string
  blockNumber: number
  method: string
  section: string
  timestamp: number
  args: any
  doc: string
  hash: string
}

// Rate limiting manager
class RateLimitManager {
  private queue: Array<() => Promise<any>> = []
  private isProcessing = false
  private minDelay = 1000

  async addRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn()
          resolve(result)
        } catch (error) {
          reject(error)
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

export default function EVMExplorer() {
  const { getDisplayAddress, connected, publicKey, userSession } = useWallet()
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState("")
  const [activeTab, setActiveTab] = useState<"transactions" | "blocks" | "events">("transactions")
  const [activeModal, setActiveModal] = useState<null | string>(null)

  // Data states
  const [evmTransactions, setEvmTransactions] = useState<EVMTransaction[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [selectedBlock, setSelectedBlock] = useState<any>(null)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [blockEvents, setBlockEvents] = useState<Event[]>([])
  const [apiResponses, setApiResponses] = useState<any>({})

  // Search states
  const [searchHash, setSearchHash] = useState("")
  const [searchBlockNumber, setSearchBlockNumber] = useState("")
  const [eventBlockNumber, setEventBlockNumber] = useState("")

  // Loading states for individual operations
  const [loadingTransaction, setLoadingTransaction] = useState(false)
  const [loadingBlock, setLoadingBlock] = useState(false)
  const [loadingEvent, setLoadingEvent] = useState(false)
  const [loadingBlockEvents, setLoadingBlockEvents] = useState(false)

  const apiKey = process.env.NEXT_PUBLIC_API_KEY || "81d0f73d-93d0-4cb0-b7ae-bce20587e79b"

  const fetchWithRateLimit = async (url: string, options: RequestInit, responseKey: string) => {
    return rateLimitManager.addRequest(async () => {
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()

      setApiResponses((prev:any) => ({
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

  const fetchEVMTransactions = async () => {
    setLoadingStep("Fetching EVM transactions...")
    const response = await fetchWithRateLimit(
      "https://api.rootscan.io/v1/evm-transactions",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ address: getDisplayAddress(), perPage: 100 }),
      },
      "evmTransactions",
    )

    if (response.data && Array.isArray(response.data)) {
      setEvmTransactions(response.data)
      console.log("Fetched transactions:", response.data.length)
    } else {
      console.error("Invalid transaction data format:", response)
      setEvmTransactions([])
    }
  }

  const fetchBlocks = async () => {
    setLoadingStep("Fetching latest blocks...")
    const response = await fetchWithRateLimit(
      "https://api.rootscan.io/v1/blocks",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "x-api-key": apiKey,
        },
      },
      "blocks",
    )

    if (response.data && Array.isArray(response.data)) {
      setBlocks(response.data)
      console.log("Fetched blocks:", response.data.length)
    } else {
      console.error("Invalid blocks data format:", response)
      setBlocks([])
    }
  }

  const fetchTransactionDetails = async (hash: string) => {
    setLoadingTransaction(true)
    try {
      console.log("Fetching transaction details for hash:", hash)
      const response = await fetchWithRateLimit(
        "https://api.rootscan.io/v1/evm-transaction",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({ hash }),
        },
        `transactionDetail_${hash}`,
      )

      console.log("Transaction details response:", response)
      setSelectedTransaction(response.data)
      setActiveModal("transaction-details")
    } catch (error) {
      console.error("Error fetching transaction details:", error)
    } finally {
      setLoadingTransaction(false)
    }
  }

  const fetchBlockDetails = async (blockNumber: number) => {
    setLoadingBlock(true)
    try {
      console.log("Fetching block details for block:", blockNumber)
      const response = await fetchWithRateLimit(
        "https://api.rootscan.io/v1/block",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({ blockNumber }),
        },
        `blockDetail_${blockNumber}`,
      )

      console.log("Block details response:", response)
      setSelectedBlock(response.data)

      // Also fetch events for this block
      if (response.data?.eventsCount > 0) {
        await fetchEventsForBlock(blockNumber)
      } else {
        setBlockEvents([])
      }

      setActiveModal("block-details")
    } catch (error) {
      console.error("Error fetching block details:", error)
    } finally {
      setLoadingBlock(false)
    }
  }

  const fetchEventsForBlock = async (blockNumber: number) => {
    setLoadingBlockEvents(true)
    try {
      console.log("Fetching events for block:", blockNumber)
      const response = await fetchWithRateLimit(
        "https://api.rootscan.io/v1/events",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({ blockNumber }),
        },
        `blockEvents_${blockNumber}`,
      )

      console.log("Block events response:", response)
      setBlockEvents(response.data || [])
    } catch (error) {
      console.error("Error fetching block events:", error)
      setBlockEvents([])
    } finally {
      setLoadingBlockEvents(false)
    }
  }

  const fetchEventDetails = async (eventId: string) => {
    setLoadingEvent(true)
    try {
      console.log("Fetching event details for eventId:", eventId)
      const response = await fetchWithRateLimit(
        "https://api.rootscan.io/v1/event",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({ eventId }),
        },
        `eventDetail_${eventId}`,
      )

      console.log("Event details response:", response)
      setSelectedEvent(response.data)
      setActiveModal("event-details")
    } catch (error) {
      console.error("Error fetching event details:", error)
    } finally {
      setLoadingEvent(false)
    }
  }

  const loadAllData = async () => {
    setLoading(true)
    try {
      await fetchEVMTransactions()
      await fetchBlocks()
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
      setLoadingStep("")
    }
  }

  const handleSearch = async () => {
    if (searchHash) {
      await fetchTransactionDetails(searchHash)
    }
    if (searchBlockNumber) {
      await fetchBlockDetails(Number.parseInt(searchBlockNumber))
    }
  }

  const handleFetchEventsByBlock = async () => {
    if (eventBlockNumber) {
      await fetchEventsForBlock(Number.parseInt(eventBlockNumber))
      setEvents(blockEvents)
    }
  }

  const handleExport = () => {
    const data = {
      evmTransactions,
      blocks,
      events,
      blockEvents,
      apiResponses,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `rootscan-explorer-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    // Only fetch data if we have a display address (connected wallet or demo mode)
    const address = getDisplayAddress()
    if (address) {
      loadAllData()
    }
  }, [connected, publicKey, userSession]) // Fetch data when wallet connection state changes

  // Prepare chart data with proper validation
  const prepareTransactionVolumeData = () => {
    if (!evmTransactions || evmTransactions.length === 0) {
      return [{ name: "No Data", gasUsed: 0 }]
    }

    return evmTransactions.slice(0, 10).map((tx, index) => ({
      name: tx.functionName || `Tx ${index + 1}`,
      gasUsed: tx.gasUsed || 0,
      fee: Number.parseFloat(tx.transactionFee || "0"),
      timestamp: new Date(tx.timestamp).toLocaleDateString(),
    }))
  }

  const prepareBlockActivityData = () => {
    if (!blocks || blocks.length === 0) {
      return [{ name: "No Data", transactions: 0, events: 0 }]
    }

    return blocks.slice(0, 15).map((block) => ({
      name: `Block ${block.number}`,
      transactions: block.transactionsCount || 0,
      events: block.eventsCount || 0,
      timestamp: new Date(block.timestamp).toLocaleDateString(),
    }))
  }

  const prepareStatusData = () => {
    if (!evmTransactions || evmTransactions.length === 0) {
      return [
        { name: "Success", value: 0 },
        { name: "Failed", value: 0 },
      ]
    }

    const successCount = evmTransactions.filter((tx) => tx.status === "success").length
    const failedCount = evmTransactions.filter((tx) => tx.status !== "success").length

    return [
      { name: "Success", value: successCount, color: "#00FF00" },
      { name: "Failed", value: failedCount, color: "#FF0040" },
    ]
  }

  // Prepare data for charts
  const transactionVolumeData = prepareTransactionVolumeData()
  const blockActivityData = prepareBlockActivityData()
  const statusData = prepareStatusData()

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
            RootScan Explorer
          </h1>
          <p className="text-gray-300 text-lg">EVM Transactions, Blocks & Events Analytics</p>

          {/* Search Controls */}
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="flex gap-2">
              <Input
                placeholder="Transaction Hash..."
                value={searchHash}
                onChange={(e) => setSearchHash(e.target.value)}
                className="bg-black/60 border-cyan-500/30 text-white w-80"
              />
              <Input
                placeholder="Block Number..."
                value={searchBlockNumber}
                onChange={(e) => setSearchBlockNumber(e.target.value)}
                className="bg-black/60 border-purple-500/30 text-white w-40"
              />
              <Button
                onClick={handleSearch}
                disabled={loadingTransaction || loadingBlock}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              >
                {loadingTransaction || loadingBlock ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>
          </div>

          {/* Event Search by Block Number */}
          <div className="flex justify-center gap-2">
            <Input
              placeholder="Block Number for Events..."
              value={eventBlockNumber}
              onChange={(e) => setEventBlockNumber(e.target.value)}
              className="bg-black/60 border-orange-500/30 text-white w-60"
            />
            <Button
              onClick={handleFetchEventsByBlock}
              disabled={loadingBlockEvents}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {loadingBlockEvents ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Fetch Events
            </Button>
          </div>

          {/* Action Buttons */}
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
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button
              onClick={loadAllData}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg shadow-green-500/25 border border-green-400/30"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <Card className="bg-black/40 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 animate-spin text-cyan-400" />
                <span className="text-cyan-300">{loadingStep}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <NeonStatsCard
            title="Total Transactions"
            value={evmTransactions.length.toString()}
            icon={Activity}
            gradient={GRADIENT_COLORS[0]}
            change="EVM Transactions"
            glowColor="cyan"
          />
          <NeonStatsCard
            title="Latest Blocks"
            value={blocks.length.toString()}
            icon={Blocks}
            gradient={GRADIENT_COLORS[1]}
            change="Recent Blocks"
            glowColor="purple"
          />
          <NeonStatsCard
            title="Success Rate"
            value={`${((statusData[0].value / (statusData[0].value + statusData[1].value || 1)) * 100).toFixed(1)}%`}
            icon={CheckCircle}
            gradient={GRADIENT_COLORS[2]}
            change="Transaction Success"
            glowColor="green"
          />
          <NeonStatsCard
            title="Block Events"
            value={blockEvents.length.toString()}
            icon={Zap}
            gradient={GRADIENT_COLORS[3]}
            change="Current Block Events"
            glowColor="orange"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-black/60 p-2 rounded-xl border border-gray-700/50 backdrop-blur-sm">
          {[
            { key: "transactions", label: "Transactions", icon: Activity },
            { key: "blocks", label: "Blocks", icon: Blocks },
            { key: "events", label: "Events", icon: Zap },
          ].map((tab, index) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 gap-2 transition-all duration-300 ${
                activeTab === tab.key
                  ? `bg-gradient-to-r ${GRADIENT_COLORS[index]} text-white shadow-lg border border-white/20`
                  : "text-gray-300 hover:text-white hover:bg-white/10 border border-transparent"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction Gas Usage Chart */}
          <NeonCard title="Transaction Gas Usage" icon={Fuel} glowColor="cyan">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transactionVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    border: "1px solid rgba(0, 255, 255, 0.3)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: any) => [`${value.toLocaleString()}`, "Gas Used"]}
                />
                <Legend />
                <Bar dataKey="gasUsed" name="Gas Used" fill="url(#gasGradient)" />
                <defs>
                  <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0080FF" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </NeonCard>

          {/* Transaction Status Chart */}
          <NeonCard title="Transaction Status" icon={CheckCircle} glowColor="green">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: any) => [`${value} transactions`, ""]}
                />
                <Legend />
                <Bar dataKey="value" name="Transactions">
                  {statusData.map((entry:any, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </NeonCard>

          {/* Block Activity Chart */}
          <NeonCard title="Block Activity" icon={Blocks} glowColor="purple" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={blockActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    border: "1px solid rgba(147, 51, 234, 0.3)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="transactions"
                  name="Transactions"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="events"
                  name="Events"
                  stroke="#EC4899"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </NeonCard>
        </div>

        {/* Content based on active tab */}
        {activeTab === "transactions" && (
          <NeonCard title="EVM Transactions" icon={Activity} glowColor="cyan">
            <div className="space-y-4">
              {evmTransactions.length > 0 ? (
                evmTransactions.slice(0, 10).map((tx, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 backdrop-blur-sm cursor-pointer group"
                    onClick={() => fetchTransactionDetails(tx.hash)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-full ${
                          tx.status === "success"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {tx.status === "success" ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold font-mono">{tx.hash.slice(0, 20)}...</p>
                        <p className="text-gray-400 text-sm">{tx.functionName || "Unknown Function"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-white font-bold">Block #{tx.blockNumber}</p>
                        <p className="text-gray-400 text-sm">Gas: {tx.gasUsed.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">Fee: {tx.transactionFee} ROOT</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-400">No transactions found. Please refresh or try a different address.</p>
                </div>
              )}
            </div>
          </NeonCard>
        )}

        {activeTab === "blocks" && (
          <NeonCard title="Latest Blocks" icon={Blocks} glowColor="purple">
            <div className="space-y-4">
              {blocks.length > 0 ? (
                blocks.slice(0, 10).map((block, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm cursor-pointer group"
                    onClick={() => fetchBlockDetails(block.number)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-full ${
                          block.isFinalized
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        }`}
                      >
                        <Blocks className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">Block #{block.number}</p>
                        <p className="text-gray-400 text-sm font-mono">{block.hash.slice(0, 20)}...</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge
                          variant={block.isFinalized ? "default" : "secondary"}
                          className={
                            block.isFinalized
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }
                        >
                          {block.isFinalized ? "Finalized" : "Pending"}
                        </Badge>
                        <p className="text-gray-400 text-sm mt-1">Txs: {block.transactionsCount}</p>
                        <p className="text-gray-400 text-sm">Events: {block.eventsCount}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Blocks className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-400">No blocks found. Please refresh to load the latest blocks.</p>
                </div>
              )}
            </div>
          </NeonCard>
        )}

        {activeTab === "events" && (
          <NeonCard title="Blockchain Events" icon={Zap} glowColor="orange">
            <div className="space-y-4">
              {blockEvents.length > 0 ? (
                blockEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 backdrop-blur-sm cursor-pointer group"
                    onClick={() => fetchEventDetails(event.eventId)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          {event.section}.{event.method}
                        </p>
                        <p className="text-gray-400 text-sm">{event.doc}</p>
                        <p className="text-gray-500 text-xs">Event ID: {event.eventId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-white font-bold">Block #{event.blockNumber}</p>
                        <p className="text-gray-400 text-sm">{new Date(event.timestamp * 1000).toLocaleString()}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-400">No events found. Enter a block number above to fetch events.</p>
                </div>
              )}
            </div>
          </NeonCard>
        )}

        {/* API Responses Modal */}
        {activeModal === "api-responses" && (
          <Modal onClose={() => setActiveModal(null)} title="API Response Models">
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {Object.entries(apiResponses).length > 0 ? (
                Object.entries(apiResponses).map(([key, response]: [string, any]) => (
                  <div key={key} className="bg-black/60 p-4 rounded-lg border border-cyan-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-cyan-400 flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")}
                      </h3>
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">{response.method}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-400">Endpoint:</p>
                        <p className="text-xs font-mono text-cyan-300 break-all">{response.url}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Timestamp:</p>
                        <p className="text-xs text-gray-300">{new Date(response.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    {response.body && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-2">Request Body:</p>
                        <div className="bg-black/80 p-3 rounded border border-gray-700/50 max-h-32 overflow-y-auto">
                          <pre className="text-xs text-green-300 whitespace-pre-wrap">
                            {typeof response.body === "string"
                              ? JSON.stringify(JSON.parse(response.body), null, 2)
                              : JSON.stringify(response.body, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Response:</p>
                      <div className="bg-black/80 p-3 rounded border border-gray-700/50 max-h-60 overflow-y-auto">
                        <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                          {JSON.stringify(response.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-400">No API responses recorded yet. Perform some actions to see API data.</p>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Transaction Details Modal */}
        {activeModal === "transaction-details" && selectedTransaction && (
          <Modal onClose={() => setActiveModal(null)} title="Transaction Details">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard title="Hash" value={selectedTransaction.hash} />
                <InfoCard title="Block Number" value={selectedTransaction.blockNumber} />
                <InfoCard title="Status" value={selectedTransaction.status} />
                <InfoCard title="Gas Used" value={selectedTransaction.gasUsed?.toLocaleString()} />
                <InfoCard title="Gas Price" value={`${selectedTransaction.gasPrice} Gwei`} />
                <InfoCard title="Transaction Fee" value={`${selectedTransaction.transactionFee} ROOT`} />
                <InfoCard title="Function Name" value={selectedTransaction.functionName || "Unknown"} />
                <InfoCard title="Timestamp" value={new Date(selectedTransaction.timestamp).toLocaleString()} />
              </div>

              {selectedTransaction.fromAddress && (
                <div className="bg-black/60 p-4 rounded-lg border border-purple-500/30">
                  <h4 className="font-semibold text-purple-400 mb-2">From Address</h4>
                  <p className="text-gray-300 font-mono text-sm">{selectedTransaction.fromAddress.address}</p>
                  <p className="text-gray-400 text-sm">
                    Balance: {selectedTransaction.fromAddress.balance?.freeFormatted} ROOT
                  </p>
                </div>
              )}

              {selectedTransaction.toAddress && (
                <div className="bg-black/60 p-4 rounded-lg border border-green-500/30">
                  <h4 className="font-semibold text-green-400 mb-2">To Address</h4>
                  <p className="text-gray-300 font-mono text-sm">{selectedTransaction.toAddress.address}</p>
                  <p className="text-gray-400 text-sm">
                    Balance: {selectedTransaction.toAddress.balance?.freeFormatted} ROOT
                  </p>
                  {selectedTransaction.toAddress.isContract && (
                    <Badge className="mt-2 bg-blue-500/20 text-blue-400 border-blue-500/30">Contract</Badge>
                  )}
                </div>
              )}

              {selectedTransaction.events && selectedTransaction.events.length > 0 && (
                <div className="bg-black/60 p-4 rounded-lg border border-orange-500/30">
                  <h4 className="font-semibold text-orange-400 mb-2">Events</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedTransaction.events.map((event: any, index: number) => (
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

              {selectedTransaction.logs && selectedTransaction.logs.length > 0 && (
                <div className="bg-black/60 p-4 rounded-lg border border-cyan-500/30">
                  <h4 className="font-semibold text-cyan-400 mb-2">Transaction Logs</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedTransaction.logs.map((log: any, index: number) => (
                      <div key={index} className="p-3 bg-black/40 rounded border border-gray-700/50">
                        <p className="font-semibold text-cyan-400">{log.eventName}</p>
                        <p className="text-xs text-gray-400 font-mono">Address: {log.address}</p>
                        <p className="text-xs text-gray-400">Log Index: {log.logIndex}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Block Details Modal */}
        {activeModal === "block-details" && selectedBlock && (
          <Modal onClose={() => setActiveModal(null)} title="Block Details">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard title="Block Number" value={selectedBlock.number} />
                <InfoCard title="Hash" value={selectedBlock.hash} />
                <InfoCard title="Transactions" value={selectedBlock.transactionsCount} />
                <InfoCard title="Events" value={selectedBlock.eventsCount} />
                <InfoCard title="Extrinsics" value={selectedBlock.extrinsicsCount} />
                <InfoCard
                  title="Status"
                  value={selectedBlock.isFinalized ? "Finalized" : "Pending"}
                  className={selectedBlock.isFinalized ? "text-green-400" : "text-yellow-400"}
                />
                <InfoCard title="Timestamp" value={new Date(selectedBlock.timestamp).toLocaleString()} />
                <InfoCard title="Spec" value={selectedBlock.spec} />
              </div>

              {selectedBlock.evmBlock && (
                <div className="bg-black/60 p-4 rounded-lg border border-blue-500/30">
                  <h4 className="font-semibold text-blue-400 mb-2">EVM Block Info</h4>
                  <p className="text-gray-300 font-mono text-sm mb-2">Hash: {selectedBlock.evmBlock.hash}</p>
                  <p className="text-gray-400 text-sm">Miner: {selectedBlock.evmBlock.miner}</p>
                  <p className="text-gray-400 text-sm">State Root: {selectedBlock.evmBlock.stateRoot}</p>
                </div>
              )}

              {blockEvents.length > 0 && (
                <div className="bg-black/60 p-4 rounded-lg border border-orange-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-orange-400">Block Events ({blockEvents.length})</h4>
                    {loadingBlockEvents && <RefreshCw className="h-4 w-4 animate-spin text-orange-400" />}
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {blockEvents.map((event, index) => (
                      <div
                        key={index}
                        className="p-3 bg-black/40 rounded border border-gray-700/50 cursor-pointer hover:border-orange-500/50 transition-colors"
                        onClick={() => fetchEventDetails(event.eventId)}
                      >
                        <p className="font-semibold text-cyan-400">
                          {event.section}.{event.method}
                        </p>
                        <p className="text-sm text-gray-400">{event.doc}</p>
                        <p className="text-xs text-gray-500">Event ID: {event.eventId}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Event Details Modal */}
        {activeModal === "event-details" && selectedEvent && (
          <Modal onClose={() => setActiveModal(null)} title="Event Details">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard title="Event ID" value={selectedEvent.eventId} />
                <InfoCard title="Method" value={`${selectedEvent.section}.${selectedEvent.method}`} />
                <InfoCard title="Block Number" value={selectedEvent.blockNumber} />
                <InfoCard title="Hash" value={selectedEvent.hash} />
                <InfoCard title="Timestamp" value={new Date(selectedEvent.timestamp * 1000).toLocaleString()} />
                <InfoCard title="Extrinsic ID" value={selectedEvent.extrinsicId} />
              </div>

              <div className="bg-black/60 p-4 rounded-lg border border-green-500/30">
                <h4 className="font-semibold text-green-400 mb-2">Description</h4>
                <p className="text-gray-300">{selectedEvent.doc}</p>
              </div>

              <div className="bg-black/60 p-4 rounded-lg border border-purple-500/30">
                <h4 className="font-semibold text-purple-400 mb-2">Arguments</h4>
                <pre className="text-xs text-gray-300 overflow-x-auto bg-black/60 p-2 rounded">
                  {JSON.stringify(selectedEvent.args, null, 2)}
                </pre>
              </div>

              {selectedEvent.extrinsic && (
                <div className="bg-black/60 p-4 rounded-lg border border-blue-500/30">
                  <h4 className="font-semibold text-blue-400 mb-2">Related Extrinsic</h4>
                  <p className="text-gray-300 font-mono text-sm mb-2">ID: {selectedEvent.extrinsic.extrinsicId}</p>
                  <p className="text-gray-400 text-sm">
                    Method: {selectedEvent.extrinsic.section}.{selectedEvent.extrinsic.method}
                  </p>
                  <p className="text-gray-400 text-sm">Hash: {selectedEvent.extrinsic.hash}</p>
                  <Badge
                    className={`mt-2 ${
                      selectedEvent.extrinsic.isSuccess
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }`}
                  >
                    {selectedEvent.extrinsic.isSuccess ? "Success" : "Failed"}
                  </Badge>
                </div>
              )}

              {selectedEvent.block && (
                <div className="bg-black/60 p-4 rounded-lg border border-cyan-500/30">
                  <h4 className="font-semibold text-cyan-400 mb-2">Block Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Block Number:</p>
                      <p className="text-gray-300">{selectedEvent.block.number}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Transactions:</p>
                      <p className="text-gray-300">{selectedEvent.block.transactionsCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Events:</p>
                      <p className="text-gray-300">{selectedEvent.block.eventsCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Timestamp:</p>
                      <p className="text-gray-300">{new Date(selectedEvent.block.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">Hash: {selectedEvent.block.hash}</p>
                </div>
              )}
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

function InfoCard({ title, value, className = "" }: { title: string; value: any; className?: string }) {
  return (
    <div className="bg-black/60 p-4 rounded-lg border border-gray-700/50">
      <h4 className="font-semibold text-gray-400 text-sm mb-1">{title}</h4>
      <p className={`text-white font-mono text-sm break-all ${className}`}>{value}</p>
    </div>
  )
}

function Modal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode
  onClose: () => void
  title: string
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-black/90 rounded-xl shadow-2xl border border-cyan-500/30 relative max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-cyan-500/20">
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">{children}</div>
      </div>
    </div>
  )
}
