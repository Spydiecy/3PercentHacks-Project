"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, LineChart, MessageCircle, ArrowLeftRight } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline">Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard 
          title="Portfolio Value" 
          value="$12,345.67" 
          change="+15.3%" 
          changeType="positive" 
          icon={LineChart}
        />
        <DashboardCard 
          title="24h Volume" 
          value="$3,456.78" 
          change="+5.4%" 
          changeType="positive" 
          icon={ArrowLeftRight}
        />
        <DashboardCard 
          title="AI Trades" 
          value="24" 
          change="+3" 
          changeType="positive" 
          icon={Zap}
        />
        <DashboardCard 
          title="Messages" 
          value="12" 
          change="+2" 
          changeType="positive" 
          icon={MessageCircle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Transactions</h2>
            <Link href="/dashboard/transactions">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-3 hover:bg-accent/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${transaction.type === "buy" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                    {transaction.type === "buy" ? "+" : "-"}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.token}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{transaction.amount}</p>
                  <p className="text-sm text-muted-foreground">${transaction.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Quick Actions</h2>
            <Button variant="outline" size="sm">More</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/dashboard/ai-chat">
              <div className="flex flex-col items-center justify-center p-6 bg-accent/30 rounded-xl hover:bg-accent transition-colors">
                <MessageCircle className="h-8 w-8 text-violet-500 mb-3" />
                <span className="font-medium">AI Assistant</span>
              </div>
            </Link>
            <Link href="/dashboard/swap">
              <div className="flex flex-col items-center justify-center p-6 bg-accent/30 rounded-xl hover:bg-accent transition-colors">
                <ArrowLeftRight className="h-8 w-8 text-pink-500 mb-3" />
                <span className="font-medium">Swap</span>
              </div>
            </Link>
            <Link href="/dashboard/portfolio">
              <div className="flex flex-col items-center justify-center p-6 bg-accent/30 rounded-xl hover:bg-accent transition-colors">
                <LineChart className="h-8 w-8 text-orange-500 mb-3" />
                <span className="font-medium">Portfolio</span>
              </div>
            </Link>
            <Link href="/dashboard/wallet">
              <div className="flex flex-col items-center justify-center p-6 bg-accent/30 rounded-xl hover:bg-accent transition-colors">
                <Zap className="h-8 w-8 text-green-500 mb-3" />
                <span className="font-medium">Transfer</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

interface DashboardCardProps {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon: React.ElementType
}

function DashboardCard({ title, value, change, changeType, icon: Icon }: DashboardCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <div className="flex items-center mt-1">
            <span className={`text-xs ${
              changeType === "positive" ? "text-green-500" : 
              changeType === "negative" ? "text-red-500" : 
              "text-gray-500"
            }`}>
              {change}
            </span>
          </div>
        </div>
        <div className="p-2 rounded-full bg-accent/50">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

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
