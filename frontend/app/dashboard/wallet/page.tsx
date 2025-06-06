"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, QrCode, Send, Download, Plus, History, Wallet } from "lucide-react"

export default function WalletPage() {
  const [walletAddress, setWalletAddress] = useState("yYu74v9PbemzH7xTF1AyvYmQBgLQTNpp9mQQmJY5UW7")
  const [connected, setConnected] = useState(true)

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    // In a real implementation, you would show a toast notification here
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Wallet</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <History className="h-4 w-4" />
            History
          </Button>
          <Button variant="secondary" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Receive
          </Button>
          <Button size="sm" className="gap-2">
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
      </div>

      {connected ? (
        <>
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-xl font-bold mb-2">Solana Wallet</h2>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">{formatAddress(walletAddress)}</p>
                  <button 
                    onClick={handleCopyAddress}
                    className="p-1 hover:bg-accent rounded-md"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <a 
                    href={`https://explorer.solana.com/address/${walletAddress}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-accent rounded-md"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white p-3 rounded-lg mb-2">
                  <QrCode className="h-20 w-20 text-black" />
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <QrCode className="h-4 w-4" />
                  Show QR
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold mb-4">Native Balance</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                <div>
                  <p className="text-xl font-bold">42.5 SOL</p>
                  <p className="text-sm text-muted-foreground">≈ $4,137.38</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">Stake</Button>
                <Button variant="outline" size="sm" className="flex-1">Swap</Button>
                <Button size="sm" className="flex-1">Send</Button>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold mb-4">Tokens</h2>
              <div className="space-y-4">
                <TokenRow 
                  name="USDC" 
                  amount="3,245.67" 
                  value="$3,245.67" 
                  color="bg-blue-500" 
                />
                <TokenRow 
                  name="BONK" 
                  amount="24.56M" 
                  value="$524.08" 
                  color="bg-yellow-500" 
                />
                <TokenRow 
                  name="JUP" 
                  amount="1,245.67" 
                  value="$1,083.73" 
                  color="bg-orange-500" 
                />
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Add Custom Token
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-accent/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${tx.type === "receive" ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"}`}>
                      {tx.type === "receive" ? <Download className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{tx.title}</p>
                      <p className="text-sm text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{tx.amount}</p>
                    <p className="text-sm text-muted-foreground">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              View All Transactions
            </Button>
          </div>
        </>
      ) : (
        <div className="bg-card rounded-xl border border-border p-10 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">Connect your Solana wallet to view your assets and interact with the Astra DeFi platform</p>
          </div>
          <div className="flex flex-col gap-2 max-w-xs mx-auto">
            <Button size="lg" className="w-full">Connect Wallet</Button>
            <Button variant="outline" size="lg" className="w-full">Create New Wallet</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

interface TokenRowProps {
  name: string
  amount: string
  value: string
  color: string
}

function TokenRow({ name, amount, value, color }: TokenRowProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full ${color}`}></div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{amount}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium">{value}</p>
        <div className="flex justify-end gap-1 mt-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Send className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}

const transactions = [
  {
    id: "1",
    title: "Received SOL",
    date: "Today, 12:30 PM",
    amount: "+2.45 SOL",
    status: "Confirmed",
    type: "receive"
  },
  {
    id: "2",
    title: "Swapped BONK to SOL",
    date: "Yesterday, 3:15 PM",
    amount: "1200 BONK → 0.063 SOL",
    status: "Confirmed",
    type: "swap"
  },
  {
    id: "3",
    title: "Sent JUP",
    date: "May 18, 8:52 AM",
    amount: "-15.7 JUP",
    status: "Confirmed",
    type: "send"
  },
  {
    id: "4",
    title: "NFT Purchase",
    date: "May 17, 11:23 AM",
    amount: "-0.12 SOL",
    status: "Confirmed",
    type: "send"
  }
]
