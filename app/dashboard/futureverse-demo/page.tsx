"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/contexts/WalletContext"
import { Copy, ExternalLink, Wallet } from "lucide-react"

export default function FutureverseWalletDemo() {
  const { connectWallet, disconnectWallet, connected, publicKey, userSession, connecting } = useWallet()
  const [showDetails, setShowDetails] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const truncateAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Futureverse Wallet Integration
          </h1>
          <p className="text-gray-400">Test wallet connection with MetaMask fallback and demo mode</p>
        </div>
      </div>

      {/* Connection Status */}
      <Card className="bg-black/20 border-gray-800 hover:border-gray-700 transition-all">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge 
                variant={connected ? "default" : "destructive"}
                className={connected ? "bg-green-600 text-white" : "bg-red-600 text-white"}
              >
                {connected ? "Connected" : "Disconnected"}
              </Badge>
              
              {connected && publicKey && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 font-mono text-sm">
                    {truncateAddress(publicKey)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-white/5"
                    onClick={() => copyToClipboard(publicKey)}
                  >
                    <Copy className="h-4 w-4 text-gray-400 hover:text-white" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!connected ? (
                <Button
                  onClick={connectWallet}
                  disabled={connecting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {connecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              ) : (
                <Button
                  onClick={disconnectWallet}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500/10"
                >
                  Disconnect
                </Button>
              )}
              
              <Button
                onClick={() => setShowDetails(!showDetails)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-600/10"
              >
                {showDetails ? "Hide" : "Show"} Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Details */}
      {showDetails && (
        <Card className="bg-black/20 border-gray-800 hover:border-gray-700 transition-all">
          <CardHeader>
            <CardTitle className="text-white">Wallet Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/40 p-4 rounded-lg border border-gray-700/50">
                  <h4 className="font-semibold text-gray-400 text-sm mb-1">Public Key</h4>
                  <div className="text-white font-mono text-sm break-all">
                    {publicKey || "Not connected"}
                  </div>
                </div>
                
                <div className="bg-black/40 p-4 rounded-lg border border-gray-700/50">
                  <h4 className="font-semibold text-gray-400 text-sm mb-1">Connection Type</h4>
                  <div className="text-white text-sm">
                    {userSession?.demo ? "Demo Mode" : 
                     userSession?.eoa ? "MetaMask" : 
                     connected ? "Futureverse" : "None"}
                  </div>
                </div>
                
                <div className="bg-black/40 p-4 rounded-lg border border-gray-700/50">
                  <h4 className="font-semibold text-gray-400 text-sm mb-1">Network</h4>
                  <div className="text-white text-sm">The Root Network (TRN)</div>
                </div>
                
                <div className="bg-black/40 p-4 rounded-lg border border-gray-700/50">
                  <h4 className="font-semibold text-gray-400 text-sm mb-1">Status</h4>
                  <div className="text-white text-sm">
                    {connecting ? "Connecting..." : connected ? "Ready" : "Disconnected"}
                  </div>
                </div>
              </div>
              
              {userSession && (
                <div className="bg-black/40 p-4 rounded-lg border border-gray-700/50">
                  <h4 className="font-semibold text-gray-400 text-sm mb-2">Session Data</h4>
                  <pre className="text-white text-xs overflow-x-auto">
                    {JSON.stringify(userSession, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-black/20 border-gray-800 hover:border-gray-700 transition-all">
        <CardHeader>
          <CardTitle className="text-white">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">1</span>
              <div>
                <h4 className="font-semibold text-white">MetaMask First</h4>
                <p className="text-sm">If MetaMask is detected, it will be used for wallet connection</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">2</span>
              <div>
                <h4 className="font-semibold text-white">Futureverse Fallback</h4>
                <p className="text-sm">If MetaMask is not available, Futureverse Auth is attempted</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">3</span>
              <div>
                <h4 className="font-semibold text-white">Demo Mode</h4>
                <p className="text-sm">If both fail, a demo wallet is used for development purposes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
