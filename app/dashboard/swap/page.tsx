"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Wallet, RefreshCw, X, Database, Download, AlertCircle, Search, Clock, Copy } from "lucide-react"

// Real-world token data with proper images and details
const TOKENS = [
  {
    symbol: "btc",
    name: "Bitcoin",
    image: "https://media.istockphoto.com/id/1033874896/vector/blockchain-bitcoin-icon.jpg?s=612x612&w=0&k=20&c=yzGKzb1A0moFQFxSoMw1hXHaWKqOzdcJ1ShFWRyNaGQ=",
    color: "from-orange-500 to-yellow-500",
    network: "Bitcoin",
    decimals: 8,
  },
  {
    symbol: "eth",
    name: "Ethereum",
    image: "https://logowik.com/content/uploads/images/t_ethereum-eth7803.logowik.com.webp",
    color: "from-blue-500 to-purple-500",
    network: "Ethereum",
    decimals: 18,
  },
  {
    symbol: "xrp",
    name: "XRP",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStEx8l1lrrq1h7ap3moMYOl-dmeNzfi3HTOw&s",
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
  {
    symbol: "usdt",
    name: "Tether USD",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2cQbJSNv4fI-SWqstYLsPgh8LrkNycKw6xA&s",
    color: "from-green-600 to-green-400",
    network: "Multiple",
    decimals: 6,
  },
  {
    symbol: "bnb",
    name: "BNB",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQP9cUvoCvmCXO4pNHvnREHBCKW30U-BVxKfg&s",
    color: "from-yellow-500 to-orange-500",
    network: "BSC",
    decimals: 18,
  },
  {
    symbol: "ada",
    name: "Cardano",
    image: "https://cdn.freelogovectors.net/wp-content/uploads/2023/03/ada-logo-freelogovectors.net_.png",
    color: "from-blue-600 to-indigo-500",
    network: "Cardano",
    decimals: 6,
  },
  {
    symbol: "sol",
    name: "Solana",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsIsJL3zRgUrkD3yE3lD7LK0wZWSiRyY1GVg&s",
    color: "from-purple-600 to-pink-500",
    network: "Solana",
    decimals: 9,
  },
]

interface SwapTransaction {
  payinAddress: string
  payoutAddress: string
  payinExtraId?: string
  fromCurrency: string
  toCurrency: string
  id: string
  amount: number
  directedAmount: number
  payinExtraIdName?: string
}

interface TransactionStatus {
  status: string
  payinAddress: string
  payoutAddress: string
  fromCurrency: string
  toCurrency: string
  id: string
  updatedAt: string
  expectedSendAmount: number
  expectedReceiveAmount: number
  createdAt: string
  isPartner: boolean
}

interface MinAmountResponse {
  minAmount: number
}

export default function SwapPage() {
  const [fromToken, setFromToken] = useState(TOKENS[0])
  const [toToken, setToToken] = useState(TOKENS[1])
  const [amount, setAmount] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [minAmount, setMinAmount] = useState<number | null>(null)
  const [swapTransaction, setSwapTransaction] = useState<SwapTransaction | null>(null)
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null)
  const [apiResponses, setApiResponses] = useState<any>({})
  const [transactionHistory, setTransactionHistory] = useState<TransactionStatus[]>([])

  // UI States
  const [showFromTokens, setShowFromTokens] = useState(false)
  const [showToTokens, setShowToTokens] = useState(false)
  const [activeModal, setActiveModal] = useState<null | string>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMinAmount, setLoadingMinAmount] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [swapStep, setSwapStep] = useState<"input" | "confirm" | "payment" | "tracking">("input")

  // Search states
  const [fromSearch, setFromSearch] = useState("")
  const [toSearch, setToSearch] = useState("")

  const apiKey =
    process.env.NEXT_PUBLIC_CHANGENOW_API_KEY 

  const fetchMinAmount = async (from: string, to: string) => {
    setLoadingMinAmount(true)
    try {
      const response = await fetch(`https://api.changenow.io/v1/min-amount/${from}_${to}?api_key=${apiKey}`, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: MinAmountResponse = await response.json()
      console.log("my min Amount reponse is::::",data);
      
      setApiResponses((prev:any) => ({
        ...prev,
        [`minAmount_${from}_${to}`]: {
          url: `https://api.changenow.io/v1/min-amount/${from}_${to}?api_key=${apiKey}`,
          method: "GET",
          response: data,
          timestamp: new Date().toISOString(),
        },
      }))

      setMinAmount(data.minAmount)
    } catch (error) {
      console.error("Error fetching min amount:", error)
      setMinAmount(null)
    } finally {
      setLoadingMinAmount(false)
    }
  }

  const createSwapTransaction = async () => {
    if (!amount || !recipientAddress) return

    setLoading(true)
    try {
      const response = await fetch(`https://api.changenow.io/v1/transactions/${apiKey}`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          from: fromToken.symbol,
          to: toToken.symbol,
          amount: amount,
          address: recipientAddress,
          flow: "standard",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: SwapTransaction = await response.json()
      console.log("my data is:::::: from list all transactions",data);
      
      setApiResponses((prev:any) => ({
        ...prev,
        swapTransaction: {
          url: "https://api.changenow.io/v1/transactions",
          method: "POST",
          body: {
            from: fromToken.symbol,
            to: toToken.symbol,
            amount: amount,
            address: recipientAddress,
            flow: "standard",
          },
          response: data,
          timestamp: new Date().toISOString(),
        },
      }))

      setSwapTransaction(data)
    window.open(`https://changenow.io/pro/exchange/txs/${data.id}`, "_blank");
;

      setSwapStep("confirm")
    } catch (error) {
      console.error("Error creating swap transaction:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactionStatus = async (transactionId: string) => {
    setLoadingStatus(true)
    try {
      const response = await fetch(`https://api.changenow.io/v1/transactions/${transactionId}/${apiKey}`, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: TransactionStatus = await response.json()
      console.log("my trnasaction status data is:::",data);
      
      setApiResponses((prev:any) => ({
        ...prev,
        [`transactionStatus_${transactionId}`]: {
          url: `https://api.changenow.io/v1/transactions/${transactionId}/${apiKey}`,
          method: "GET",
          response: data,
          timestamp: new Date().toISOString(),
        },
      }))

      setTransactionStatus(data)

      // Add to transaction history if not already present
      setTransactionHistory((prev) => {
        const exists = prev.find((tx) => tx.id === data.id)
        if (!exists) {
          return [data, ...prev]
        }
        return prev.map((tx) => (tx.id === data.id ? data : tx))
      })
    } catch (error) {
      console.error("Error fetching transaction status:", error)
    } finally {
      setLoadingStatus(false)
    }
  }

  const connectMetaMask = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })
        setRecipientAddress(accounts[0])
      } else {
        alert("MetaMask is not installed. Please install MetaMask to continue.")
      }
    } catch (error) {
      console.error("Error connecting MetaMask:", error)
    }
  }

  const sendPayment = async () => {
    if (!swapTransaction) return

    try {
      if (typeof window.ethereum !== "undefined") {
        // Convert amount to wei for Ethereum transactions
        const valueInWei = "0x" + (Number.parseFloat(amount) * Math.pow(10, fromToken.decimals)).toString(16)

        const transactionParameters = {
          to: swapTransaction.payinAddress,
          value: valueInWei,
          gas: "0x5208", // 21000 gas limit
        }

        const txHash = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [transactionParameters],
        })

        console.log("Payment sent:", txHash)
        setSwapStep("tracking")

        // Start tracking the transaction
        if (swapTransaction.id) {
          fetchTransactionStatus(swapTransaction.id)
        }
      }
    } catch (error) {
      console.error("Error sending payment:", error)
    }
  }

  const swapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setAmount("")
    setMinAmount(null)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleExport = () => {
    const data = {
      swapTransaction,
      transactionStatus,
      transactionHistory,
      fromToken,
      toToken,
      amount,
      recipientAddress,
      minAmount,
      apiResponses,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `swap-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (fromToken && toToken && fromToken.symbol !== toToken.symbol) {
      fetchMinAmount(fromToken.symbol, toToken.symbol)
    }
  }, [fromToken, toToken])

  // Auto-refresh transaction status
  useEffect(() => {
    if (swapStep === "tracking" && swapTransaction?.id) {

        fetchTransactionStatus(swapTransaction.id)


    
    }
  }, [swapStep, swapTransaction?.id])

  const filteredFromTokens = TOKENS.filter(
    (token) =>
      token.name.toLowerCase().includes(fromSearch.toLowerCase()) ||
      token.symbol.toLowerCase().includes(fromSearch.toLowerCase()),
  )

  const filteredToTokens = TOKENS.filter(
    (token) =>
      token.name.toLowerCase().includes(toSearch.toLowerCase()) ||
      token.symbol.toLowerCase().includes(toSearch.toLowerCase()),
  )

  const isAmountValid = minAmount && Number.parseFloat(amount) >= minAmount

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "confirming":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "exchanging":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "sending":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "finished":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="space-y-10 p-6">
      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text mb-2">
              Swap
            </h1>
            <p className="text-white/60">Exchange cryptocurrencies instantly</p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => setActiveModal("api-responses")}
              variant="outline"
              className="border-white/20 hover:bg-white/10 text-white gap-2"
            >
              <Database className="h-4 w-4" />
              API Responses
            </Button>
            <Button
              onClick={() => setActiveModal("transaction-history")}
              variant="outline"
              className="border-white/20 hover:bg-white/10 text-white gap-2"
            >
              <Clock className="h-4 w-4" />
              History
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              className="border-white/20 hover:bg-white/10 text-white gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Swap Interface */}
          <div className="lg:col-span-2">
            <Card className="bg-black/20 border-white/10 hover:border-white/20 transition-all hover:shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5" />
                  Swap Tokens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* From Token */}
                <div className="space-y-2">
                  <label className="text-white/80 text-sm font-medium">From</label>
                  <div className="relative">
                    <div
                      className="flex items-center gap-3 p-4 bg-black/40 rounded-lg border border-white/10 cursor-pointer hover:border-white/20 transition-colors"
                      onClick={() => setShowFromTokens(true)}
                    >
                      <img
                        src={fromToken.image || "/placeholder.svg"}
                        alt={fromToken.name}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=32&width=32"
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-white font-semibold">{fromToken.name}</p>
                        <p className="text-white/60 text-sm">{fromToken.symbol.toUpperCase()}</p>
                      </div>
                    </div>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="mt-2 bg-gray-800/50 border-gray-600 text-white text-lg"
                    />
                    {minAmount && (
                      <p className="text-xs text-gray-400 mt-1">
                        Minimum: {minAmount} {fromToken.symbol.toUpperCase()}
                      </p>
                    )}
                    {amount && minAmount && !isAmountValid && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Amount below minimum
                      </p>
                    )}
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={swapTokens}
                    variant="outline"
                    size="sm"
                    className="rounded-full border-gray-600 hover:bg-gray-700"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>

                {/* To Token */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm font-medium">To</label>
                  <div className="relative">
                    <div
                      className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-600 cursor-pointer hover:border-gray-500 transition-colors"
                      onClick={() => setShowToTokens(true)}
                    >
                      <img
                        src={toToken.image || "/placeholder.svg"}
                        alt={toToken.name}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=32&width=32"
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-white font-semibold">{toToken.name}</p>
                        <p className="text-gray-400 text-sm">{toToken.symbol.toUpperCase()}</p>
                      </div>
                    </div>
                    <Input
                      type="text"
                      placeholder="0.0"
                      value={swapTransaction?.amount || ""}
                      readOnly
                      className="mt-2 bg-gray-800/50 border-gray-600 text-white text-lg"
                    />
                  </div>
                </div>

                {/* Recipient Address */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm font-medium">Recipient Address</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter recipient address"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      className="bg-gray-800/50 border-gray-600 text-white"
                    />
                    <Button onClick={connectMetaMask} variant="outline" className="border-gray-600 hover:bg-gray-700">
                      <Wallet className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                {swapStep === "input" && (
                  <Button
                    onClick={createSwapTransaction}
                    disabled={!amount || !recipientAddress || !isAmountValid || loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creating Swap...
                      </>
                    ) : (
                      "Create Swap"
                    )}
                  </Button>
                )}

                {swapStep === "confirm" && swapTransaction && (
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                      <h3 className="text-white font-semibold mb-2">Swap Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Transaction ID:</span>
                          <span className="text-white font-mono">{swapTransaction.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Pay-in Address:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-mono">{swapTransaction.payinAddress.slice(0, 10)}...</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(swapTransaction.payinAddress)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Amount to Send:</span>
                          <span className="text-white">
                            {amount} {fromToken.symbol.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Amount to Receive:</span>
                          <span className="text-white">
                            {swapTransaction.amount} {toToken.symbol.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={sendPayment}
                      className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Send Payment via MetaMask
                    </Button>
                    <Button
                      onClick={() => setSwapStep("input")}
                      variant="outline"
                      className="w-full border-gray-600 hover:bg-gray-700"
                    >
                      Back to Edit
                    </Button>
                  </div>
                )}

                {swapStep === "tracking" && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-lg">Payment Sent!</h3>
                      <p className="text-gray-400 text-sm">Your swap is being processed. Track the status below.</p>
                    </div>

                    {transactionStatus && (
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-semibold">Transaction Status</h4>
                          <Badge className={getStatusColor(transactionStatus.status)}>
                            {transactionStatus.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Expected Send:</span>
                            <span className="text-white">
                              {transactionStatus.expectedSendAmount} {transactionStatus.fromCurrency.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Expected Receive:</span>
                            <span className="text-white">
                              {transactionStatus.expectedReceiveAmount} {transactionStatus.toCurrency.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Last Updated:</span>
                            <span className="text-white">{new Date(transactionStatus.updatedAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => swapTransaction && fetchTransactionStatus(swapTransaction.id)}
                        disabled={loadingStatus}
                        variant="outline"
                        className="flex-1 border-gray-600 hover:bg-gray-700"
                      >
                        {loadingStatus ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Refresh Status"}
                      </Button>
                      <Button
                        onClick={() => {
                          setSwapStep("input")
                          setSwapTransaction(null)
                          setTransactionStatus(null)
                          setAmount("")
                          setRecipientAddress("")
                        }}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      >
                        New Swap
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Panel */}
          <div className="space-y-6">
            <Card className="bg-gray-900/50 border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Swap Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Min Amount:</span>
                    <span className="text-white text-sm">
                      {loadingMinAmount ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : minAmount ? (
                        `${minAmount} ${fromToken.symbol.toUpperCase()}`
                      ) : (
                        "Loading..."
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Exchange Rate:</span>
                    <span className="text-white text-sm">
                      {swapTransaction && amount
                        ? `1 ${fromToken.symbol.toUpperCase()} = ${(swapTransaction.amount / Number.parseFloat(amount)).toFixed(6)} ${toToken.symbol.toUpperCase()}`
                        : "Enter amount"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Network Fee:</span>
                    <span className="text-white text-sm">Included</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Processing Time:</span>
                    <span className="text-white text-sm">5-30 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Transaction Status */}
            {transactionStatus && (
              <Card className="bg-gray-900/50 border border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Current Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Status:</span>
                      <Badge className={getStatusColor(transactionStatus.status)}>
                        {transactionStatus.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">ID:</span>
                      <span className="text-white text-sm font-mono">{transactionStatus.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Progress:</span>
                      <span className="text-white text-sm">
                        {transactionStatus.status === "waiting" && "0%"}
                        {transactionStatus.status === "confirming" && "25%"}
                        {transactionStatus.status === "exchanging" && "50%"}
                        {transactionStatus.status === "sending" && "75%"}
                        {transactionStatus.status === "finished" && "100%"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Token Selection Modals */}
        {showFromTokens && (
          <TokenSelectionModal
            title="Select From Token"
            tokens={filteredFromTokens}
            searchValue={fromSearch}
            onSearchChange={setFromSearch}
            onSelect={(token) => {
              setFromToken(token)
              setShowFromTokens(false)
              setFromSearch("")
            }}
            onClose={() => {
              setShowFromTokens(false)
              setFromSearch("")
            }}
          />
        )}

        {showToTokens && (
          <TokenSelectionModal
            title="Select To Token"
            tokens={filteredToTokens}
            searchValue={toSearch}
            onSearchChange={setToSearch}
            onSelect={(token) => {
              setToToken(token)
              setShowToTokens(false)
              setToSearch("")
            }}
            onClose={() => {
              setShowToTokens(false)
              setToSearch("")
            }}
          />
        )}

        {/* Transaction History Modal */}
        {activeModal === "transaction-history" && (
          <Modal onClose={() => setActiveModal(null)} title="Transaction History">
            <div className="space-y-4">
              {transactionHistory.length > 0 ? (
                transactionHistory.map((tx) => (
                  <div key={tx.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-mono text-sm">{tx.id}</span>
                        <Badge className={getStatusColor(tx.status)}>{tx.status.toUpperCase()}</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fetchTransactionStatus(tx.id)}
                        className="border-gray-600 hover:bg-gray-700"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">From:</p>
                        <p className="text-white">
                          {tx.expectedSendAmount} {tx.fromCurrency.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">To:</p>
                        <p className="text-white">
                          {tx.expectedReceiveAmount} {tx.toCurrency.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Created:</p>
                        <p className="text-white">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Updated:</p>
                        <p className="text-white">{new Date(tx.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-400">No transaction history yet. Create your first swap!</p>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* API Responses Modal */}
        {activeModal === "api-responses" && (
          <Modal onClose={() => setActiveModal(null)} title="API Response Models">
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {Object.entries(apiResponses).length > 0 ? (
                Object.entries(apiResponses).map(([key, response]: [string, any]) => (
                  <div key={key} className="bg-gray-800/50 p-4 rounded-lg border border-cyan-500/30">
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
                            {JSON.stringify(response.body, null, 2)}
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
                  <p className="text-gray-400">No API responses recorded yet. Perform a swap to see API data.</p>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}

function TokenSelectionModal({
  title,
  tokens,
  searchValue,
  onSearchChange,
  onSelect,
  onClose,
}: {
  title: string
  tokens: any[]
  searchValue: string
  onSearchChange: (value: string) => void
  onSelect: (token: any) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 relative max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tokens..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tokens.map((token, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors"
                onClick={() => onSelect(token)}
              >
                <img
                  src={token.image || "/placeholder.svg"}
                  alt={token.name}
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                  }}
                />
                <div className="flex-1">
                  <p className="text-white font-semibold">{token.name}</p>
                  <p className="text-gray-400 text-sm">
                    {token.symbol.toUpperCase()} • {token.network}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 relative max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
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
