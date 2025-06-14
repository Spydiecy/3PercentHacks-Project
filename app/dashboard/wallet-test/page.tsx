"use client"

import { useWallet } from "@/contexts/WalletContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, CheckCircle, XCircle } from "lucide-react"

export default function WalletTestPage() {
  const { connectWallet, disconnectWallet, connected, connecting, publicKey, userSession } = useWallet()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Wallet Connection Test</h1>
        <p className="text-gray-400">Test Futureverse Auth integration</p>
      </div>

      <Card className="bg-black/20 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            {connected ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="text-white">
              Status: {connected ? "Connected" : "Disconnected"}
            </span>
          </div>

          {connecting && (
            <div className="text-yellow-500">Connecting...</div>
          )}

          {publicKey && (
            <div className="space-y-2">
              <p className="text-gray-400">Public Key:</p>
              <p className="text-white font-mono text-sm break-all bg-black/40 p-2 rounded">
                {publicKey}
              </p>
            </div>
          )}

          {userSession && (
            <div className="space-y-2">
              <p className="text-gray-400">User Session:</p>
              <pre className="text-white font-mono text-xs bg-black/40 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(userSession, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex gap-2">
            {!connected ? (
              <Button 
                onClick={connectWallet} 
                disabled={connecting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {connecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            ) : (
              <Button 
                onClick={disconnectWallet}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                Disconnect Wallet
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/20 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Integration Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-2">
          <p>• This test page verifies Futureverse Auth integration</p>
          <p>• Make sure you have a valid client ID in your environment variables</p>
          <p>• The auth client is configured for development environment</p>
          <p>• EOA (Externally Owned Account) connection is used for wallet interaction</p>
        </CardContent>
      </Card>
    </div>
  )
}
