"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/contexts/WalletContext"
import { Copy, Wallet } from "lucide-react"

export default function WalletPage() {
  const { connectWallet, disconnectWallet, connected, publicKey, userSession, connecting } = useWallet()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const truncateAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getConnectionType = () => {
    if (!connected) return "Not Connected"
    if (userSession?.demo) return "Demo Mode"
    if (userSession?.eoa) return "Externally Owned Account"
    if (userSession?.futurepass) return "Futurepass"
    return "Futureverse Auth"
  }

  const getWalletAddress = () => {
    if (!connected || !userSession) return null
    return userSession.eoa || userSession.futurepass || publicKey
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Wallet
          </h1>
          <p className="text-gray-400">Connect your wallet to access Astra features</p>
        </div>
      </div>

      {/* Connection Status */}
      <Card className="bg-black/20 border-gray-800 hover:border-gray-700 transition-all">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!connected ? (
              <div className="text-center py-8">
                <Wallet className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
                <p className="text-gray-400 mb-6">Connect with Futureverse to access all features</p>
                <Button
                  onClick={connectWallet}
                  disabled={connecting}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {connecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Connected</h3>
                      <p className="text-sm text-gray-400">{getConnectionType()}</p>
                    </div>
                  </div>
                  <Button
                    onClick={disconnectWallet}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    Disconnect
                  </Button>
                </div>

                {getWalletAddress() && (
                  <div className="bg-black/40 p-4 rounded-lg border border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-400 text-sm mb-1">Wallet Address</h4>
                        <div className="text-white font-mono text-sm">
                          {truncateAddress(getWalletAddress()!)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-white/5"
                        onClick={() => copyToClipboard(getWalletAddress()!)}
                      >
                        <Copy className="h-4 w-4 text-gray-400 hover:text-white" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Wallet Info - Only show when connected */}
      {connected && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-black/20 border-gray-800 hover:border-gray-700 transition-all">
            <CardHeader>
              <CardTitle className="text-white text-lg">Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-white">The Root Network</p>
                <p className="text-gray-400 text-sm">TRN Mainnet</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-gray-800 hover:border-gray-700 transition-all">
            <CardHeader>
              <CardTitle className="text-white text-lg">Connection Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-white">{getConnectionType()}</p>
                <p className="text-gray-400 text-sm">
                  {userSession?.eoa ? "External wallet connected" : 
                   userSession?.futurepass ? "Futurepass wallet" : 
                   "Futureverse authentication"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-gray-800 hover:border-gray-700 transition-all">
            <CardHeader>
              <CardTitle className="text-white text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <p className="text-2xl font-bold text-white">Active</p>
                </div>
                <p className="text-gray-400 text-sm">Ready for transactions</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
