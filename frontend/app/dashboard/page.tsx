"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, LineChart, MessageCircle, ArrowLeftRight, Sparkles, TrendingUp, CreditCard } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function DashboardPage() {
  const [isHovering, setIsHovering] = useState<string | null>(null)

  return (
    <div className="space-y-10">
      <div className="relative">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text mb-2">Welcome back</h1>
          <p className="text-white/60">Your DeFi portfolio is performing well today</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {dashboardCards.map((card) => (
            <div 
              key={card.id}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r rounded-xl blur-sm opacity-30 group-hover:opacity-40 transition-opacity"
                style={{ backgroundImage: `linear-gradient(to right, ${card.gradientFrom}, ${card.gradientTo})` }}
              ></div>
              <div className="relative h-full backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl p-6 overflow-hidden group-hover:border-white/20 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-white/60">{card.title}</p>
                    <p className="text-2xl font-bold mt-1 text-white">{card.value}</p>
                    <div className="flex items-center mt-1">
                      <span className={`text-xs ${
                        card.trend === "up" ? "text-emerald-400" : 
                        card.trend === "down" ? "text-rose-400" : 
                        "text-gray-400"
                      }`}>
                        {card.change}
                      </span>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 backdrop-blur-sm">
                    <card.icon className="h-5 w-5 text-white/80" />
                  </div>
                </div>
                
                {/* Gradient line at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r"
                  style={{ backgroundImage: `linear-gradient(to right, ${card.gradientFrom}, ${card.gradientTo})` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl p-6 h-full relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
              <Link href="/dashboard/transactions">
                <Button variant="ghost" size="sm" className="gap-1 text-white/80 hover:text-white hover:bg-white/10">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === "buy" 
                        ? "bg-emerald-500/10 text-emerald-500" 
                        : "bg-rose-500/10 text-rose-500"
                    }`}>
                      {transaction.type === "buy" ? "+" : "-"}
                    </div>
                    <div>
                      <p className="font-medium text-white/90">{transaction.token}</p>
                      <p className="text-sm text-white/60">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white/90">{transaction.amount}</p>
                    <p className="text-sm text-white/60">${transaction.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl p-6 h-full hover:border-white/20 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Quick Actions</h2>
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
                    {/* Background gradient */}
                    <div 
                      className={`absolute inset-0 bg-gradient-to-br opacity-20 ${isHovering === action.id ? 'opacity-40' : 'opacity-20'} transition-opacity`}
                      style={{ backgroundImage: `linear-gradient(to bottom right, ${action.gradientFrom}, ${action.gradientTo})` }}
                    ></div>
                    
                    {/* Content */}
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

      <div className="backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Portfolio Overview</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white">1D</Button>
            <Button variant="outline" size="sm" className="border-white/20 bg-white/10 text-white">1W</Button>
            <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white">1M</Button>
            <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white">1Y</Button>
          </div>
        </div>
        
        <div className="h-64 w-full flex items-center justify-center">
          <div className="w-full px-10">
            {/* Mock chart - would be replaced with an actual chart component */}
            <div className="relative h-40 w-full">
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/20"></div>
              <div className="absolute bottom-1/3 left-0 right-0 h-[1px] bg-white/10"></div>
              <div className="absolute bottom-2/3 left-0 right-0 h-[1px] bg-white/10"></div>
              
              {/* Chart line */}
              <div className="absolute bottom-0 left-0 right-0 h-40 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path 
                    d="M0,20 L5,18 L10,22 L15,19 L20,24 L25,22 L30,25 L35,24 L40,26 L45,23 L50,28 L55,26 L60,30 L65,28 L70,32 L75,30 L80,34 L85,32 L90,35 L95,33 L100,38" 
                    fill="none" 
                    stroke="url(#gradient)" 
                    strokeWidth="0.4"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              {/* Accent point at the end */}
              <div className="absolute bottom-[38%] right-0 h-2 w-2 rounded-full bg-blue-500"></div>
            </div>
            
            <div className="flex justify-between mt-2 text-xs text-white/40">
              <span>May 12</span>
              <span>May 14</span>
              <span>May 16</span>
              <span>May 18</span>
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Data 

const dashboardCards = [
  {
    id: "portfolio-value",
    title: "Portfolio Value",
    value: "$12,345.67",
    change: "+15.3% this week",
    trend: "up",
    icon: LineChart,
    gradientFrom: "#8B5CF6",
    gradientTo: "#3B82F6"
  },
  {
    id: "volume",
    title: "24h Volume",
    value: "$3,456.78",
    change: "+5.4% today",
    trend: "up",
    icon: CreditCard,
    gradientFrom: "#EC4899",
    gradientTo: "#8B5CF6"
  },
  {
    id: "ai-trades",
    title: "AI Trades",
    value: "24",
    change: "+3 this week",
    trend: "up",
    icon: Sparkles,
    gradientFrom: "#F59E0B",
    gradientTo: "#EF4444"
  },
  {
    id: "messages",
    title: "Messages",
    value: "12",
    change: "+2 new",
    trend: "up",
    icon: MessageCircle,
    gradientFrom: "#10B981",
    gradientTo: "#3B82F6"
  }
]

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
    id: "transfer",
    label: "Transfer",
    icon: Zap,
    href: "/dashboard/wallet",
    gradientFrom: "#10B981",
    gradientTo: "#059669"
  }
]

const recentTransactions = [
  {
    id: "1",
    token: "SOL",
    type: "buy",
    amount: "+2.45 SOL",
    value: "238.50",
    date: "Today, 12:30 PM"
  },
  {
    id: "2",
    token: "BONK",
    type: "sell",
    amount: "-1200 BONK",
    value: "63.24",
    date: "Yesterday, 3:15 PM"
  },
  {
    id: "3",
    token: "JUP",
    type: "buy",
    amount: "+15.7 JUP",
    value: "42.39",
    date: "May 18, 8:52 AM"
  },
  {
    id: "4",
    token: "ETH",
    type: "sell",
    amount: "-0.12 ETH",
    value: "367.84",
    date: "May 17, 11:23 AM"
  }
]
