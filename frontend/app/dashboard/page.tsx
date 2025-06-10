"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, LineChart, MessageCircle, ArrowLeftRight, Sparkles, TrendingUp, CreditCard, Settings } from "lucide-react"
import Link from "next/link"

// Types and data
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

const quickActions = [
  {
    id: "ai-chat",
    label: "AI Assistant",
    icon: MessageCircle,
    href: "/dashboard/ai-chat",
    gradientFrom: "#8B5CF6",
    gradientTo: "#6366F1"
  },
  {
    id: "swap",
    label: "Swap",
    icon: ArrowLeftRight,
    href: "/dashboard/swap",
    gradientFrom: "#EC4899",
    gradientTo: "#F43F5E"
  },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: TrendingUp,
    href: "/dashboard/portfolio",
    gradientFrom: "#F59E0B",
    gradientTo: "#EF4444"
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    gradientFrom: "#10B981",
    gradientTo: "#059669"
  }
]

export default function DashboardPage() {
  const [isHovering, setIsHovering] = useState<string | null>(null)
  const [portfolioValue, setPortfolioValue] = useState<string>("0")
  const [tokenAssets, setTokenAssets] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [marketPrice, setMarketPrice] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch all data
  useEffect(() => {
    setLoading(true)
    Promise.all([
      // Portfolio value
      fetch("/api/portfolio/token_value", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: "0xEd0C6079229E2d407672a117c22b62064f4a4312",
          chains: "1,56",
          excludeRiskToken: "0"
        })
      }).then(res => res.json()),
      // Token balances
      fetch("/api/portfolio/total_token_balances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: "0xEd0C6079229E2d407672a117c22b62064f4a4312",
          chains: "1,56",
          excludeRiskToken: "0"
        })
      }).then(res => res.json()),
      // Transaction history
      fetch("/api/portfolio/history_by_add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: "0x50c476a139aab23fdaf9bca12614cdd54a4244e4",
          chains: "1",
          limit: "20"
        })
      }).then(res => res.json()),
      // Market price (POST)
      fetch("/api/market_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "method": "POST",
          "path": "/api/v5/dex/market/price",
          "data": [
            {
              "chainIndex": "66",
              "tokenContractaAddress": "0x382bb369d343125bfb2117af9c149795c6c65c50"
            }
          ]
        }
)
      }).then(res => res.json())
    ]).then(([tokenValueRes, totalTokenRes, historyRes, marketRes]) => {
      setPortfolioValue(tokenValueRes?.data?.[0]?.totalValue || "0")
      setTokenAssets(totalTokenRes?.data?.[0]?.tokenAssets || [])
      setTransactions(historyRes?.data?.[0]?.transactions || [])
      setMarketPrice(marketRes?.data || [])
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-10">
      <div className="relative">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text mb-2">Welcome back</h1>
          <p className="text-white/60">Your DeFi portfolio is performing well today</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            id="portfolio-value"
            title="Portfolio Value"
            value={`$${Number(portfolioValue).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            change="+15.3% this week"
            trend="up"
            icon={LineChart}
            gradientFrom="#8B5CF6"
            gradientTo="#3B82F6"
          />
          <DashboardCard
            id="volume"
            title="24h Volume"
            value="$3,456.78"
            change="+5.4% today"
            trend="up"
            icon={CreditCard}
            gradientFrom="#EC4899"
            gradientTo="#8B5CF6"
          />
          <DashboardCard
            id="ai-trades"
            title="AI Trades"
            value="24"
            change="+3 this week"
            trend="up"
            icon={Sparkles}
            gradientFrom="#F59E0B"
            gradientTo="#EF4444"
          />
          <DashboardCard
            id="messages"
            title="Messages"
            value="12"
            change="+2 new"
            trend="up"
            icon={MessageCircle}
            gradientFrom="#10B981"
            gradientTo="#3B82F6"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        <div className="col-span-2">
          <div className="backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl p-6 h-full relative overflow-hidden group hover:border-white/20 transition-all hover:shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">Recent Transactions</h2>
              <Link href="/dashboard/transactions">
                <Button variant="ghost" size="sm" className="gap-1 text-white/80 hover:text-white hover:bg-white/10">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-5">
              {loading ? (
                <div className="text-white/60">Loading...</div>
              ) : transactions.length === 0 ? (
                <div className="text-white/60">No transactions found.</div>
              ) : transactions.map((tx, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-4 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-full ${
                      tx.amount && Number(tx.amount) > 0
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                    }`}>
                      {tx.amount && Number(tx.amount) > 0 ? "+" : "-"}
                    </div>
                    <div>
                      <p className="font-medium text-white/90">{tx.symbol}</p>
                      <p className="text-sm text-white/60">{new Date(Number(tx.txTime)).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white/90">{tx.amount}</p>
                    <p className="text-sm text-white/60">{tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl p-6 h-full hover:border-white/20 transition-all hover:shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link
                  href={action.href}
                  key={action.id}
                  onMouseEnter={() => setIsHovering(action.id)}
                  onMouseLeave={() => setIsHovering(null)}
                >
                  <div className="relative group flex flex-col items-center justify-center p-5 rounded-xl overflow-hidden transition-all hover:scale-105 duration-300">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br opacity-20 ${isHovering === action.id ? 'opacity-40' : 'opacity-20'} transition-opacity`}
                      style={{ backgroundImage: `linear-gradient(to bottom right, ${action.gradientFrom}, ${action.gradientTo})` }}
                    ></div>
                    <div className="relative z-10 flex flex-col items-center">
                      <action.icon className={`h-8 w-8 mb-3 text-white group-hover:scale-110 transition-transform`} />
                      <span className="font-medium text-white">{action.label}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-violet-500/20 to-blue-500/20 border border-white/10">
              <div className="flex items-center mb-2">
                <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
                <h3 className="font-medium text-white">AI Suggestion</h3>
              </div>
              <p className="text-sm text-white/70 mb-3">SOL price is showing bullish patterns. Consider allocating more assets now.</p>
              <Button size="sm" variant="outline" className="w-full border-white/20 hover:bg-white/10 text-white">View Analysis</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all hover:shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">Portfolio Overview</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white">1D</Button>
            <Button variant="outline" size="sm" className="border-white/20 bg-white/10 text-white">1W</Button>
            <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white">1M</Button>
            <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white">1Y</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-white/60">Loading...</div>
          ) : tokenAssets.length === 0 ? (
            <div className="text-white/60">No token balances found.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left pb-3 text-white/60">Symbol</th>
                  <th className="text-right pb-3 text-white/60">Chain</th>
                  <th className="text-right pb-3 text-white/60">Balance</th>
                  <th className="text-right pb-3 text-white/60">Price</th>
                  <th className="text-right pb-3 text-white/60">Value</th>
                </tr>
              </thead>
              <tbody>
                {tokenAssets.map((asset, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4">{asset.symbol}</td>
                    <td className="text-right py-4">{asset.chainIndex}</td>
                    <td className="text-right py-4">{asset.balance}</td>
                    <td className="text-right py-4">${Number(asset.tokenPrice).toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                    <td className="text-right py-4">${(Number(asset.balance) * Number(asset.tokenPrice)).toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Market Price Table */}
      <div className="backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all hover:shadow-xl">
        <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text mb-6">
          Market Price
        </h2>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-white/60">Loading...</div>
          ) : marketPrice.length === 0 ? (
            <div className="text-white/60">No market price data found.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left pb-3 text-white/60">Chain</th>
                  <th className="text-right pb-3 text-white/60">Token</th>
                  <th className="text-right pb-3 text-white/60">Price</th>
                  <th className="text-right pb-3 text-white/60">Time</th>
                </tr>
              </thead>
              <tbody>
                {marketPrice.map((item, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4">{item.chainIndex}</td>
                    <td className="text-right py-4">{item.tokenContractAddress}</td>
                    <td className="text-right py-4">${Number(item.price).toLocaleString(undefined, { maximumFractionDigits: 8 })}</td>
                    <td className="text-right py-4">{new Date(Number(item.time)).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function DashboardCard({ id, title, value, change, trend, icon: Icon, gradientFrom, gradientTo }: any) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity"
        style={{ backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` }}
      ></div>
      <div className="relative h-full backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl p-6 overflow-hidden group-hover:border-white/20 transition-all group-hover:shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-white/60">{title}</p>
            <p className="text-2xl font-bold mt-1 text-white">{value}</p>
            <div className="flex items-center mt-1">
              <span className={`text-xs ${
                trend === "up" ? "text-emerald-400" : 
                trend === "down" ? "text-rose-400" : 
                "text-gray-400"
              }`}>
                {change}
              </span>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 backdrop-blur-sm border border-white/5">
            <Icon className="h-5 w-5 text-white/80" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-60"
          style={{ backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` }}
        ></div>
      </div>
    </div>
  )
}
