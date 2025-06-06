"use client"

import { Button } from "@/components/ui/button"
import { Download, ArrowUp, ArrowDown, TrendingUp, Calendar } from "lucide-react"

export default function PortfolioPage() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PortfolioCard 
          title="Total Value" 
          value="$12,345.67" 
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

      <div className="backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all hover:shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">Portfolio Breakdown</h2>
          <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white">Filter</Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left pb-3 text-white/60">Asset</th>
                <th className="text-right pb-3 text-white/60">Price</th>
                <th className="text-right pb-3 text-white/60">Holdings</th>
                <th className="text-right pb-3 text-white/60">Value</th>
                <th className="text-right pb-3 text-white/60">24h</th>
                <th className="text-right pb-3 text-white/60">7d</th>
                <th className="text-right pb-3 text-white/60"></th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${asset.bgColor}`}></div>
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">{asset.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-4">${asset.price}</td>
                  <td className="text-right py-4">
                    <div>
                      <p>{asset.amount} {asset.symbol}</p>
                      <p className="text-xs text-muted-foreground">${asset.value}</p>
                    </div>
                  </td>
                  <td className="text-right py-4">${asset.value}</td>
                  <td className="text-right py-4">
                    <span className={asset.change24h.startsWith("+") ? "text-green-500" : "text-red-500"}>
                      {asset.change24h}
                    </span>
                  </td>
                  <td className="text-right py-4">
                    <span className={asset.change7d.startsWith("+") ? "text-green-500" : "text-red-500"}>
                      {asset.change7d}
                    </span>
                  </td>
                  <td className="text-right py-4">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/5">
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/5">
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all hover:shadow-xl">
          <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text mb-6">Portfolio Distribution</h2>
          <div className="flex items-center justify-center h-64">
            <div className="w-full h-full flex items-center justify-center">
              <div className="relative w-48 h-48">
                {assets.map((asset, index) => (
                  <div 
                    key={asset.id}
                    className={`absolute w-48 h-48 ${asset.bgColor}`}
                    style={{ 
                      clipPath: `conic-polygon(50% 50%, 50% 0%, ${50 - 50 * Math.cos((index + 1) * 0.5 * Math.PI)}% ${50 - 50 * Math.sin((index + 1) * 0.5 * Math.PI)}%)`,
                      opacity: 0.8 
                    }}
                  ></div>
                ))}                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/40 w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                    <p className="text-xl font-bold text-white">{assets.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {assets.map((asset) => (
              <div key={asset.id} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${asset.bgColor}`}></div>
                <span className="text-sm text-white/80">{asset.symbol} ({asset.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all hover:shadow-xl">
          <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text mb-6">Performance</h2>
          <div className="h-64 flex items-center justify-center">
            <div className="w-full h-full flex flex-col items-center justify-center">
              <TrendingUp className="h-12 w-12 text-white/80 mb-4" />
              <p className="text-center text-white/90">Portfolio performance chart will be displayed here</p>
              <p className="text-sm text-white/60 text-center mt-2">Showing historical data and AI-powered predictions</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white">1D</Button>
            <Button variant="outline" size="sm" className="border-white/20 bg-white/10 text-white">1W</Button>
            <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white">1M</Button>
            <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white">3M</Button>
            <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white">1Y</Button>
            <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white">All</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface PortfolioCardProps {
  title: string
  value: string
  change: string
  trend: "up" | "down"
}

function PortfolioCard({ title, value, change, trend }: PortfolioCardProps) {
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

const assets = [
  {
    id: "1",
    name: "Solana",
    symbol: "SOL",
    price: "97.35",
    amount: "42.5",
    value: "4,137.38",
    change24h: "+3.2%",
    change7d: "+15.7%",
    percentage: 33.5,
    bgColor: "bg-white/30"
  },
  {
    id: "2",
    name: "USD Coin",
    symbol: "USDC",
    price: "1.00",
    amount: "3,245.67",
    value: "3,245.67",
    change24h: "+0.01%",
    change7d: "+0.02%",
    percentage: 26.3,
    bgColor: "bg-white/25"
  },
  {
    id: "3",
    name: "Bonk",
    symbol: "BONK",
    price: "0.00002134",
    amount: "24,567,890",
    value: "524.08",
    change24h: "+12.4%",
    change7d: "-8.3%",
    percentage: 4.2,
    bgColor: "bg-white/20"
  },
  {
    id: "4",
    name: "Ethereum",
    symbol: "ETH",
    price: "3,456.78",
    amount: "0.85",
    value: "2,938.26",
    change24h: "+1.2%",
    change7d: "+4.5%",
    percentage: 23.8,
    bgColor: "bg-white/15"
  },
  {
    id: "5",
    name: "Jupiter",
    symbol: "JUP",
    price: "0.87",
    amount: "1,245.67",
    value: "1,083.73",
    change24h: "-2.3%",
    change7d: "+21.6%",
    percentage: 8.8,
    bgColor: "bg-white/10"
  },
  {
    id: "6",
    name: "Tether",
    symbol: "USDT",
    price: "1.00",
    amount: "415.89",
    value: "415.89",
    change24h: "+0.01%",
    change7d: "-0.01%",
    percentage: 3.4,
    bgColor: "bg-white/5"
  }
]
