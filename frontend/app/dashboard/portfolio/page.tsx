"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Calendar } from "lucide-react"

const AVAILABLE_CHAINS = [
  { id: "1", name: "Ethereum" },
  { id: "56", name: "Binance Smart Chain" },
  { id: "137", name: "Polygon" },
  { id: "43114", name: "Avalanche" },
]

export default function PortfolioPage() {
  const [activeModal, setActiveModal] = useState<null | string>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [tokenBalances, setTokenBalances] = useState<any[]>([])
  const [totalValue, setTotalValue] = useState<string>("0")
  const [specificToken, setSpecificToken] = useState<any[]>([])
  const [selectedTable, setSelectedTable] = useState<
    "balances" | "history" | "specific" | "total_value"
  >("balances")
  const [selectedChains, setSelectedChains] = useState<string[]>(["1", "56"])

  // Toggle chain selection for multi-select
  const toggleChain = (chainId: string) => {
    setSelectedChains((prev) =>
      prev.includes(chainId) ? prev.filter((c) => c !== chainId) : [...prev, chainId]
    )
  }

  // Fetch all portfolio data
  const fetchPortfolioData = async () => {
    setLoading(true)
    try {
      const chainsStr = selectedChains.join(",")

      const [
        historyRes,
        balancesRes,
        valueRes,
        specificRes,
      ] = await Promise.all([
        fetch("/api/portfolio/history_by_add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: "0x50c476a139aab23fdaf9bca12614cdd54a4244e4",
            chains: chainsStr,
            limit: "20",
          }),
        }),
        fetch("/api/portfolio/total_token_balances", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: "0xEd0C6079229E2d407672a117c22b62064f4a4312",
            chains: chainsStr,
            excludeRiskToken: "0",
          }),
        }),
        fetch("/api/portfolio/token_value", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: "0xEd0C6079229E2d407672a117c22b62064f4a4312",
            chains: chainsStr,
            excludeRiskToken: "0",
          }),
        }),
        fetch("/api/portfolio/specific_token_balance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: "0x50c476a139aab23fdaf9bca12614cdd54a4244e3",
            tokenContractAddresses: [
              {
                chainIndex: "1",
                tokenContractAddress: "",
              },
            ],
          }),
        }),
      ])

      const historyJson = await historyRes.json()
      const balancesJson = await balancesRes.json()
      const valueJson = await valueRes.json()
      const specificJson = await specificRes.json()

      // Fix: Extract transaction list safely from nested data
      const transactions =
        historyJson?.data?.[0]?.transactionList ||
        historyJson?.data?.[0]?.transactions || // fallback key if any
        []

      setHistory(transactions)
      setTokenBalances(balancesJson?.data?.[0]?.tokenAssets || [])
      setTotalValue(valueJson?.data?.[0]?.totalValue || "0")
      setSpecificToken(specificJson?.data?.[0]?.tokenAssets || [])
    } catch (error) {
      console.error("Error fetching portfolio data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPortfolioData()
  }, [selectedChains])

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text mb-1">Portfolio</h1>
          <p className="text-white/60">Track and manage your assets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 border-white/20 hover:bg-white/10 text-white">
            <Calendar className="h-4 w-4" />
            Last 30 Days
          </Button>
          <Button variant="outline" size="sm" className="gap-2 border-white/20 hover:bg-white/10 text-white">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Chain selection buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        {AVAILABLE_CHAINS.map((chain) => (
          <button
            key={chain.id}
            onClick={() => toggleChain(chain.id)}
            className={`px-4 py-2 rounded-full border ${
              selectedChains.includes(chain.id)
                ? "bg-blue-600 border-blue-600"
                : "border-white/20 hover:bg-white/10"
            } text-white`}
          >
            {chain.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PortfolioCard 
          title="Total Value" 
          value={`$${Number(totalValue).toLocaleString(undefined, {maximumFractionDigits: 2})}`}
          change="+15.3%" 
          trend="up"
        />
        <PortfolioCard 
          title="24h Change" 
          value="$243.78" 
          change="+1.92%" 
          trend="up"
        />
        <PortfolioCard 
          title="AI Generated Profit" 
          value="$578.45" 
          change="+4.68%" 
          trend="up"
        />
        <PortfolioCard 
          title="Staking Rewards" 
          value="$89.31" 
          change="+0.73%" 
          trend="up"
        />
      </div>

      <div className="flex gap-4">
        <select
          className="bg-black/50 border border-white/10 rounded px-3 py-2 text-white"
          value={selectedTable}
          onChange={e => setSelectedTable(e.target.value as any)}
        >
          <option value="balances">All Token Balances</option>
          <option value="history">Transaction History</option>
          <option value="specific">Specific Token Balance</option>
          <option value="total_value">Total Portfolio Value</option>
        </select>
        <Button onClick={() => setActiveModal("details")} variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white">
          Show Details
        </Button>
      </div>

      <div className="backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all hover:shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">
            {selectedTable === "balances" && "Portfolio Breakdown"}
            {selectedTable === "history" && "Transaction History"}
            {selectedTable === "specific" && "Specific Token Balance"}
            {selectedTable === "total_value" && "Total Portfolio Value"}
          </h2>
          <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white">Filter</Button>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center text-white/60 py-8">Loading...</div>
          ) : selectedTable === "balances" ? (
            <TokenBalancesTable assets={tokenBalances} />
          ) : selectedTable === "history" ? (
            <HistoryTable transactions={history} />
          ) : selectedTable === "specific" ? (
            <TokenBalancesTable assets={specificToken} />
          ) : (
            <div className="text-white text-lg font-semibold">
              Total Portfolio Value: ${Number(totalValue).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
      </div>

      {/* Modal for details */}
      {activeModal === "details" && (
        <Modal onClose={() => setActiveModal(null)}>
          <div className="p-4 text-white">
            <h2 className="text-lg font-bold mb-2">Portfolio API Data (Demo)</h2>
            <pre className="bg-black/50 p-2 rounded text-xs overflow-x-auto max-h-96">
              {JSON.stringify({ history, tokenBalances, totalValue, specificToken }, null, 2)}
            </pre>
            <Button onClick={() => setActiveModal(null)} className="mt-4">Close</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function PortfolioCard({ title, value, change, trend }: { title: string, value: string, change: string, trend: "up" | "down" }) {
  return (
    <div className="backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all hover:shadow-xl">
      <p className="text-sm text-white/60">{title}</p>
      <p className="text-2xl font-bold mt-1 text-white">{value}</p>
      <div className="flex items-center mt-1">
        <span className={`text-xs ${trend === "up" ? "text-emerald-400" : "text-rose-400"}`}>
          {change}
        </span>
      </div>
    </div>
  )
}

function TokenBalancesTable({ assets }: { assets: any[] }) {
  if (!assets.length) return <p className="text-white/60 p-4">No token balances found.</p>
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-white/10">
          <th className="text-left pb-3 text-white/60">Asset</th>
          <th className="text-right pb-3 text-white/60">Price</th>
          <th className="text-right pb-3 text-white/60">Holdings</th>
          <th className="text-right pb-3 text-white/60">Value</th>
        </tr>
      </thead>
      <tbody>
        {assets.map((asset, idx) => (
          <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td className="py-4">
              <div>
                <p className="font-medium">{asset.symbol || asset.tokenContractAddress}</p>
                <p className="text-xs text-muted-foreground">{asset.chainIndex}</p>
              </div>
            </td>
            <td className="text-right py-4">${Number(asset.tokenPrice || 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
            <td className="text-right py-4">{asset.balance}</td>
            <td className="text-right py-4">${(Number(asset.balance || 0) * Number(asset.tokenPrice || 0)).toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function HistoryTable({ transactions }: { transactions: any[] }) {
  if (!transactions.length) return <p className="text-white/60 p-4">No transaction history found.</p>
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-white/10">
          <th className="text-left pb-3 text-white/60">Tx Hash</th>
          <th className="text-right pb-3 text-white/60">Amount</th>
          <th className="text-right pb-3 text-white/60">Symbol</th>
          <th className="text-right pb-3 text-white/60">Status</th>
          <th className="text-right pb-3 text-white/60">Time</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx, idx) => (
          <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td className="py-4 break-all">{tx.txHash}</td>
            <td className="text-right py-4">{tx.amount}</td>
            <td className="text-right py-4">{tx.symbol}</td>
            <td className={`text-right py-4 ${tx.txStatus === "success" ? "text-green-500" : "text-red-500"}`}>
              {tx.txStatus}
            </td>
            <td className="text-right py-4">{new Date(Number(tx.txTime)).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-black rounded-lg shadow-lg p-6 min-w-[300px] max-w-2xl relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-white/70 hover:text-white text-xl">&times;</button>
        {children}
      </div>
    </div>
  )
}
