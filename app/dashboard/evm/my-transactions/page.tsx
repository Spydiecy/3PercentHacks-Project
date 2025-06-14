"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useWallet } from "@/contexts/WalletContext"
import {
  History,
  Wallet,
  RefreshCw,
  Database,
  Download,
  Eye,
  Copy,
  ExternalLink,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  X
} from "lucide-react"

// Dummy address for API calls
const DUMMY_ADDRESS = "0x718E2030e82B945b9E39546278a7a30221fC2650"

// Updated interfaces for Rootscan API
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

interface WalletBalance {
  freeFormatted: string
  address: string
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

function InfoCard({ title, value, className = "" }: { title: string; value: any; className?: string }) {
  return (
    <div className="bg-black/60 p-4 rounded-lg border border-gray-700/50">
      <h4 className="font-semibold text-gray-400 text-sm mb-1">{title}</h4>
      <div className={`text-white font-mono text-sm break-all ${className}`}>{value}</div>
    </div>
  )
}

export default function MyTransactionsPage() {
  const { connectWallet: walletConnect, connected, publicKey, userSession } = useWallet()
  const [walletAddress, setWalletAddress] = useState(DUMMY_ADDRESS)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState("")
  const [apiResponses, setApiResponses] = useState<any>({})
  const [activeModal, setActiveModal] = useState<"transaction-details" | "api-responses" | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_API_KEY || "81d0f73d-93d0-4cb0-b7ae-bce20587e79b"

  // Update wallet address when user connects
  useEffect(() => {
    if (connected && publicKey) {
      setWalletAddress(publicKey)
      loadWalletData(publicKey)
    } else if (connected && userSession?.eoa) {
      setWalletAddress(userSession.eoa)
      loadWalletData(userSession.eoa)
    }
  }, [connected, publicKey, userSession])

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

  const connectWallet = async () => {
    try {
      await walletConnect()
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }

  const loadWalletData = async (address: string) => {
    setLoading(true)
    try {
      await fetchWalletBalance(address)
      await fetchTransactionHistory(address)
    } catch (error) {
      console.error("Error loading wallet data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWalletBalance = async (address: string) => {
    setLoadingStep("Fetching wallet balance...")
    try {
      const response = await fetchWithRateLimit(
        "https://api.rootscan.io/v1/address",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({ address }),
        },
        "walletBalance"
      )

      if (response.data) {
        setWalletBalance({
          freeFormatted: response.data.balance.freeFormatted,
          address: address
        })
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error)
    }
  }

  const fetchTransactionHistory = async (address: string) => {
    setLoadingStep("Fetching transaction history...")
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
          body: JSON.stringify({ address, perPage: 20 }),
        },
        "transactionHistory"
      )

      if (response.data) {
        setTransactions(response.data)
      }
    } catch (error) {
      console.error("Error fetching transaction history:", error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatAddress = (address: string | undefined) => {
    if (!address) return "Unknown"
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const shortenHash = (hash: string) => {
    if (!hash) return ""
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`
  }

  const formatValue = (value: string) => {
    if (!value) return "0"
    return (parseInt(value) / Math.pow(10, 18)).toFixed(6)
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getTransactionDirection = (tx: Transaction) => {
    if (!tx || !tx.fromAddress || !tx.fromAddress.address || !walletAddress) {
      return { type: "unknown", icon: ArrowRight, color: "text-gray-400" }
    }

    if (tx.fromAddress.address.toLowerCase() === walletAddress.toLowerCase()) {
      return { type: "sent", icon: ArrowUpRight, color: "text-red-400" }
    } else {
      return { type: "received", icon: ArrowDownLeft, color: "text-green-400" }
    }
  }

  const handleExport = () => {
    const data = {
      walletAddress,
      walletBalance,
      transactions,
      apiResponses,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `my-transactions-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const viewTransactionDetails = async (tx: Transaction) => {
    try {
      setLoading(true)
      setLoadingStep("Fetching transaction details...")
      const response = await fetchWithRateLimit(
        "https://api.rootscan.io/v1/evm-transaction",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({ hash: tx.hash }),
        },
        `transaction_${tx.hash}`
      )

      if (response.data) {
        setSelectedTransaction(response.data)
        setActiveModal("transaction-details")
      }
    } catch (error) {
      console.error("Error fetching transaction details:", error)
    } finally {
      setLoading(false)
      setLoadingStep("")
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        await loadWalletData(walletAddress)
      } catch (error) {
        console.error("Error initializing:", error)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            My Transactions
          </h1>
          <p className="text-gray-400">View and manage your EVM transactions</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-black/20 border-gray-800 hover:border-gray-700 text-white"
            onClick={connectWallet}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </Button>
          <Button
            variant="outline"
            className="bg-black/20 border-gray-800 hover:border-gray-700 text-white"
            onClick={() => loadWalletData(walletAddress)}
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

      {/* Wallet Info */}
      {walletBalance && (
        <Card className="bg-black/20 border-gray-800 hover:border-gray-700 transition-all">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-gray-400">Address</p>
                <div className="flex items-center gap-2">
                  <p className="text-white font-mono">{formatAddress(walletAddress)}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-white/5"
                    onClick={() => copyToClipboard(walletAddress)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-gray-400">Balance</p>
                <p className="text-white font-bold">{walletBalance.freeFormatted} ROOT</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      <Card className="bg-black/20 border-gray-800 hover:border-gray-700 transition-all">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions && transactions.length > 0 ? (
              transactions.map((tx, index) => {
                const direction = getTransactionDirection(tx)
                const fromAddress = tx.from || tx.fromAddress?.address
                const toAddress = tx.to || tx.toAddress?.address
                
                return (
                  <div
                    key={index}
                    className="group relative flex items-center justify-between p-4 bg-black/40 rounded-lg border border-gray-800 hover:border-gray-700 transition-all duration-300 backdrop-blur-sm cursor-pointer"
                    onClick={() => viewTransactionDetails(tx)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-full ${
                          direction.type === "sent"
                            ? "bg-black/40 text-white border border-gray-800"
                            : "bg-black/40 text-white border border-gray-800"
                        }`}
                      >
                        {React.createElement(direction.icon, { className: "h-5 w-5" })}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-semibold">
                            {direction.type === "sent" ? "Sent" : "Received"}
                          </p>
                          <Badge
                            variant={tx.status === "success" ? "default" : "destructive"}
                            className={
                              tx.status === "success"
                                ? "bg-black/40 text-white border-gray-800"
                                : "bg-black/40 text-white border-gray-800"
                            }
                          >
                            {tx.status === "success" ? "Success" : "Failed"}
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-sm">From:</span>
                            <span className="text-gray-300 text-sm font-mono">
                              {formatAddress(fromAddress)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5"
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(fromAddress || "")
                              }}
                            >
                              <Copy className="h-3 w-3 text-gray-400 hover:text-white" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-sm">To:</span>
                            <span className="text-gray-300 text-sm font-mono">
                              {formatAddress(toAddress)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5"
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(toAddress || "")
                              }}
                            >
                              <Copy className="h-3 w-3 text-gray-400 hover:text-white" />
                            </Button>
                            {tx.toAddress?.isContract && (
                              <Badge className="bg-black/40 text-white border-gray-800">
                                Contract
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm">
                          {tx.functionName || "Transfer"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-white font-bold">{tx.transactionFee} ROOT</p>
                      <p className="text-gray-400 text-sm">Gas: {tx.gasUsed?.toLocaleString()}</p>
                      <p className="text-gray-400 text-sm">{formatTimestamp(tx.timestamp)}</p>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12">
                <History className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">No transactions found. Please connect your wallet or try refreshing.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      {activeModal === "transaction-details" && selectedTransaction && (
        <Modal onClose={() => setActiveModal(null)} title="Transaction Details">
          <div className="space-y-6">
            {/* Transaction Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard 
                title="Hash" 
                value={
                  <div className="flex items-center gap-2">
                    <span>{selectedTransaction.hash}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-white/5"
                      onClick={() => copyToClipboard(selectedTransaction.hash)}
                    >
                      <Copy className="h-4 w-4 text-gray-400 hover:text-white" />
                    </Button>
                  </div>
                }
              />
              <InfoCard title="Block Number" value={selectedTransaction.blockNumber} />
              <InfoCard 
                title="Status" 
                value={
                  <Badge
                    variant={selectedTransaction.status === "success" ? "default" : "destructive"}
                    className={
                      selectedTransaction.status === "success"
                        ? "bg-black/40 text-white border-gray-800"
                        : "bg-black/40 text-white border-gray-800"
                    }
                  >
                    {selectedTransaction.status === "success" ? "Success" : "Failed"}
                  </Badge>
                }
              />
              <InfoCard title="Gas Used" value={selectedTransaction.gasUsed?.toLocaleString()} />
              <InfoCard title="Gas Price" value={`${selectedTransaction.gasPrice} Gwei`} />
              <InfoCard title="Transaction Fee" value={`${selectedTransaction.transactionFee} ROOT`} />
              <InfoCard title="Function Name" value={selectedTransaction.functionName || "Unknown"} />
              <InfoCard title="Timestamp" value={formatTimestamp(selectedTransaction.timestamp)} />
            </div>

            {/* From Address */}
            {selectedTransaction.fromAddress && (
              <div className="bg-black/40 p-6 rounded-lg border border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">From Address</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-white/5"
                      onClick={() => copyToClipboard(selectedTransaction.fromAddress.address)}
                    >
                      <Copy className="h-4 w-4 text-gray-400 hover:text-white" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-white/5"
                      onClick={() => window.open(`https://rootscan.io/address/${selectedTransaction.fromAddress.address}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 text-gray-400 hover:text-white" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-300 font-mono text-sm break-all">{selectedTransaction.fromAddress.address}</p>
                <p className="text-gray-400 text-sm">
                  Balance: {selectedTransaction.fromAddress.balance?.freeFormatted} ROOT
                </p>
              </div>
            )}

            {/* To Address */}
            {selectedTransaction.toAddress && (
              <div className="bg-black/40 p-6 rounded-lg border border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">To Address</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-white/5"
                      onClick={() => copyToClipboard(selectedTransaction.toAddress.address)}
                    >
                      <Copy className="h-4 w-4 text-gray-400 hover:text-white" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-white/5"
                      onClick={() => window.open(`https://rootscan.io/address/${selectedTransaction.toAddress.address}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 text-gray-400 hover:text-white" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-300 font-mono text-sm break-all">{selectedTransaction.toAddress.address}</p>
                <p className="text-gray-400 text-sm">
                  Balance: {selectedTransaction.toAddress.balance?.freeFormatted} ROOT
                </p>
                {selectedTransaction.toAddress.isContract && (
                  <Badge className="bg-black/40 text-white border-gray-800">Contract</Badge>
                )}
              </div>
            )}

            {/* Events */}
            {selectedTransaction.events && selectedTransaction.events.length > 0 && (
              <div className="bg-black/40 p-6 rounded-lg border border-gray-800 space-y-3">
                <h4 className="font-semibold text-white">Events</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedTransaction.events.map((event: any, index: number) => (
                    <div key={index} className="p-4 bg-black/40 rounded-lg border border-gray-800 hover:border-gray-700 transition-all">
                      <p className="font-semibold text-white">{event.eventName}</p>
                      <p className="text-sm text-gray-400">
                        {event.name} ({event.symbol}) - {event.formattedAmount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Logs */}
            {selectedTransaction.logs && selectedTransaction.logs.length > 0 && (
              <div className="bg-black/40 p-6 rounded-lg border border-gray-800 space-y-3">
                <h4 className="font-semibold text-white">Transaction Logs</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedTransaction.logs.map((log: any, index: number) => (
                    <div key={index} className="p-4 bg-black/40 rounded-lg border border-gray-800 hover:border-gray-700 transition-all">
                      <p className="font-semibold text-white">{log.eventName}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-400 font-mono">Address: {log.address}</p>
                        <p className="text-xs text-gray-400">Log Index: {log.logIndex}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
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
