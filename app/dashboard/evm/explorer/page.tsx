"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
} from "recharts"
import {
  Activity,
  Blocks,
  Zap,
  Search,
  RefreshCw,
  Database,
  Download,
  Fuel,
  CheckCircle,
  XCircle,
  ArrowRight,
  Copy,
  ExternalLink,
  TrendingUp,
  Clock,
  Users,
  DollarSign,
  X
} from "lucide-react"

// Dummy address for API calls
const DUMMY_ADDRESS = "0xc6342AD85a4d5CF9EEf0fcC9299C793200EA821F"

// Updated interfaces for Rootscan API
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
    stateRoot: string
  }
  spec: string
}

interface Transaction {
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
  fromAddress: {
    address: string
    balance: {
      freeFormatted: string
    }
  }
  toAddress: {
    address: string
    balance: {
      freeFormatted: string
    }
    isContract: boolean
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
  extrinsicId?: string
  extrinsic?: any
  block?: any
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

export default function ExplorerPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"block" | "transaction" | "address">("block")
  const [latestBlocks, setLatestBlocks] = useState<Block[]>([])
  const [latestTransactions, setLatestTransactions] = useState<Transaction[]>([])
  const [networkStats, setNetworkStats] = useState<any>(null)
  const [searchResult, setSearchResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState("")
  const [apiResponses, setApiResponses] = useState<any>({})
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"blocks" | "transactions" | "activity">("blocks")

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

  const fetchLatestBlocks = async () => {
    setLoading(true)
    setLoadingStep("Fetching latest blocks...")
    try {
      const response = await fetchWithRateLimit(
        "https://api.rootscan.io/v1/blocks",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({ perPage: 10 }),
        },
        "latestBlocks"
      )

      if (response.data) {
        setLatestBlocks(response.data)
        updateChartData(response.data)
      }
    } catch (error) {
      console.error("Error fetching latest blocks:", error)
    } finally {
      setLoading(false)
      setLoadingStep("")
    }
  }

  const fetchLatestTransactions = async () => {
    setLoadingStep("Fetching latest transactions...")
    try {
      const response = await fetchWithRateLimit(
        "https://api.rootscan.io/v1/evm-transactions",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({ perPage: 10 }),
        },
        "latestTransactions"
      )

      if (response.data) {
        setLatestTransactions(response.data)
      }
    } catch (error) {
      console.error("Error fetching latest transactions:", error)
    } finally {
      setLoadingStep("")
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setLoadingStep("Searching...")
    try {
      let endpoint = ""
      let requestBody = {}

      if (searchQuery.startsWith("0x") && searchQuery.length === 66) {
        // Transaction hash
        endpoint = "https://api.rootscan.io/v1/evm-transaction"
        requestBody = { hash: searchQuery }
      } else if (searchQuery.startsWith("0x") && searchQuery.length === 42) {
        // Address
        endpoint = "https://api.rootscan.io/v1/address"
        requestBody = { address: searchQuery }
      } else if (!isNaN(Number(searchQuery))) {
        // Block number
        endpoint = "https://api.rootscan.io/v1/block"
        requestBody = { blockNumber: Number(searchQuery) }
      }

      const response = await fetchWithRateLimit(
        endpoint,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify(requestBody),
        },
        "search"
      )

      setSearchResult(response.data)
    } catch (error) {
      console.error("Error searching:", error)
      setSearchResult(null)
    } finally {
      setLoading(false)
      setLoadingStep("")
    }
  }

  const updateChartData = (blocks: Block[]) => {
    const chartData = blocks.map(block => ({
      name: `Block ${block.number}`,
      transactions: block.transactionsCount,
      events: block.eventsCount,
      extrinsics: block.extrinsicsCount,
      timestamp: new Date(block.timestamp).toLocaleString(),
    }))
    setChartData(chartData.reverse())
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const shortenHash = (hash: string) => {
    if (!hash) return ""
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const handleExport = () => {
    const data = {
      latestBlocks,
      latestTransactions,
      networkStats,
      searchResult,
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

  const fetchBlockDetails = async (blockNumber: number) => {
    try {
      setLoadingStep("Fetching block details...")
      setLoading(true)

      const response = await fetch(`https://api.rootscan.io/v1/block/${blockNumber}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.NEXT_PUBLIC_ROOTSCAN_API_KEY || "",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch block details")
      }

      const data = await response.json()
      // Update block details in state or show in modal
      console.log("Block details:", data)
    } catch (error) {
      console.error("Error fetching block details:", error)
    } finally {
      setLoading(false)
      setLoadingStep("")
    }
  }

  const fetchTransactionDetails = async (txHash: string) => {
    try {
      setLoadingStep("Fetching transaction details...")
      setLoading(true)

      const response = await fetch(`https://api.rootscan.io/v1/transaction/${txHash}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.NEXT_PUBLIC_ROOTSCAN_API_KEY || "",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch transaction details")
      }

      const data = await response.json()
      // Update transaction details in state or show in modal
      console.log("Transaction details:", data)
    } catch (error) {
      console.error("Error fetching transaction details:", error)
    } finally {
      setLoading(false)
      setLoadingStep("")
    }
  }

  const refreshData = async () => {
    setLoading(true)
    try {
      await fetchLatestBlocks()
      await fetchLatestTransactions()
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await fetchLatestBlocks()
        await fetchLatestTransactions()
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Block Explorer
          </h1>
          <p className="text-gray-400">Search and explore blocks, transactions, and events</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-black/20 border-gray-800 hover:border-gray-700 text-white"
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            className="bg-black/20 border-gray-800 hover:border-gray-700 text-white"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search Controls */}
      <div className="w-full">
        <div className="flex gap-2">
          <Input
            placeholder="Search by block number, transaction hash, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black/20 border-gray-800"
          />
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="bg-black/20 border-gray-800 hover:border-gray-700 text-white"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Search
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="bg-black/40 border-gray-800 shadow-lg backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin text-white" />
              <span className="text-gray-300">{loadingStep || "Loading..."}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 rounded-lg bg-black/20 p-1 border border-gray-800">
        <Button
          variant={activeTab === "blocks" ? "default" : "ghost"}
          className={activeTab === "blocks" ? "bg-white/10" : "hover:bg-white/5"}
          onClick={() => setActiveTab("blocks")}
        >
          <Blocks className="h-4 w-4 mr-2" />
          Latest Blocks
        </Button>
        <Button
          variant={activeTab === "transactions" ? "default" : "ghost"}
          className={activeTab === "transactions" ? "bg-white/10" : "hover:bg-white/5"}
          onClick={() => setActiveTab("transactions")}
        >
          <Activity className="h-4 w-4 mr-2" />
          Latest Transactions
        </Button>
        <Button
          variant={activeTab === "activity" ? "default" : "ghost"}
          className={activeTab === "activity" ? "bg-white/10" : "hover:bg-white/5"}
          onClick={() => setActiveTab("activity")}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Block Activity
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "blocks" && (
        <Card className="bg-black/20 border-gray-800 hover:border-gray-700 transition-all">
          <CardContent className="p-6">
            <div className="space-y-4">
              {latestBlocks.map((block, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-gray-800 hover:border-gray-700 transition-all cursor-pointer"
                  onClick={() => fetchBlockDetails(block.number)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-black/40 text-white border border-gray-800">
                      <Blocks className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Block #{block.number}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>Hash: {shortenHash(block.hash)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-white/5"
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(block.hash)
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={block.isFinalized ? "default" : "secondary"}
                      className="bg-black/40 text-white border-gray-800"
                    >
                      {block.isFinalized ? "Finalized" : "Pending"}
                    </Badge>
                    <div className="mt-1 text-sm text-gray-400">
                      <p>Txs: {block.transactionsCount} | Events: {block.eventsCount}</p>
                      <p>{formatTimestamp(block.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "transactions" && (
        <Card className="bg-black/20 border-gray-800 hover:border-gray-700 transition-all">
          <CardContent className="p-6">
            <div className="space-y-4">
              {latestTransactions.map((tx, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-gray-800 hover:border-gray-700 transition-all cursor-pointer"
                  onClick={() => fetchTransactionDetails(tx.hash)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-black/40 text-white border border-gray-800">
                      {tx.status === "success" ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold">{tx.functionName || "Transfer"}</p>
                        <Badge
                          variant={tx.status === "success" ? "default" : "destructive"}
                          className="bg-black/40 text-white border-gray-800"
                        >
                          {tx.status === "success" ? "Success" : "Failed"}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <span>From: {shortenHash(tx.fromAddress?.address)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-white/5"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(tx.fromAddress?.address || "")
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>To: {shortenHash(tx.toAddress?.address)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-white/5"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(tx.toAddress?.address || "")
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{tx.transactionFee} ROOT</p>
                    <p className="text-sm text-gray-400">Gas: {tx.gasUsed?.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">{formatTimestamp(tx.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "activity" && (
        <Card className="bg-black/20 border-gray-800 hover:border-gray-700 transition-all">
          <CardContent className="p-6">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "1px solid rgba(31, 41, 55, 0.5)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="transactions"
                    name="Transactions"
                    stroke="#ffffff"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="events"
                    name="Events"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="extrinsics"
                    name="Extrinsics"
                    stroke="#4b5563"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Responses Modal */}
      {activeModal === "api-responses" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/90 p-6 rounded-lg border border-gray-800 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">API Responses</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-white hover:bg-white/5"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="space-y-4">
              {Object.entries(apiResponses).map(([key, response]: [string, any]) => (
                <div key={key} className="bg-black/40 p-4 rounded-lg border border-gray-800">
                  <h3 className="text-white font-semibold mb-2">{key}</h3>
                  <pre className="text-gray-400 text-sm overflow-x-auto">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
