import { type NextRequest, NextResponse } from "next/server"

// Types for cross-chain swap parameters
interface CrossChainSwapParams {
  fromChainIndex: string
  toChainIndex: string
  fromChainId: string
  toChainId: string
  fromTokenAddress: string
  toTokenAddress: string
  amount: string
  slippage: string
  userWalletAddress: string
  sort?: string
  dexIds?: string
  allowBridge?: number[]
  denyBridge?: number[]
  receiveAddress?: string
  feePercent?: string
  referrerAddress?: string
  priceImpactProtectionPercentage?: string
  onlyBridge?: boolean
  memo?: string
}

interface CrossChainSwapResponse {
  code: string
  msg: string
  data: Array<{
    fromTokenAmount: string
    toTokenAmount: string
    minmumReceive: string
    router: {
      bridgeId: number
      bridgeName: string
      otherNativeFee: string
      crossChainFee: string
      crossChainFeeTokenAddress: string
    }
    tx: {
      data: string
      from: string
      to: string
      value: string
      gasLimit: string
      gasPrice: string
      maxPriorityFeePerGas?: string
      randomKeyAccount?: any[]
      signatureData?: any[]
    }
  }>
}

// OKX API configuration
const OKX_BASE_URL = "https://web3.okx.com"
const OKX_API_KEY = process.env.API_KEY
const OKX_SECRET_KEY = process.env.SECRET_KEY
const OKX_PASSPHRASE = process.env.PASSPHRASE

// Helper function to generate OKX API headers
function getOKXHeaders(timestamp: string, method: string, requestPath: string, queryString = "", body = "") {
  const crypto = require("crypto")

  const message = timestamp + method + requestPath + queryString + body
  const signature = crypto.createHmac("sha256", OKX_SECRET_KEY).update(message).digest("base64")

  return {
    "Content-Type": "application/json",
    "OK-ACCESS-KEY": OKX_API_KEY,
    "OK-ACCESS-SIGN": signature,
    "OK-ACCESS-TIMESTAMP": timestamp,
    "OK-ACCESS-PASSPHRASE": OKX_PASSPHRASE,
  }
}

// Validate required parameters
function validateCrossChainParams(params: any): string | null {
  const required = [
    "fromChainIndex",
    "toChainIndex",
    "fromChainId",
    "toChainId",
    "fromTokenAddress",
    "toTokenAddress",
    "amount",
    "slippage",
    "userWalletAddress",
  ]

  for (const param of required) {
    if (!params[param]) {
      return `Missing required parameter: ${param}`
    }
  }

  // Validate chain IDs format
  if (!/^\d+$/.test(params.fromChainIndex) || !/^\d+$/.test(params.toChainIndex)) {
    return "Invalid chain index format. Must be numeric strings."
  }

  // Validate amount format
  if (!/^\d+(\.\d+)?$/.test(params.amount)) {
    return "Invalid amount format. Must be a numeric string."
  }

  // Validate slippage format and range
  const slippageNum = Number.parseFloat(params.slippage)
  if (isNaN(slippageNum) || slippageNum < 0.002 || slippageNum > 0.5) {
    return "Slippage must be between 0.002 and 0.5"
  }

  // Validate Solana involvement
  const solanaChainId = "501"
  if (params.fromChainIndex !== solanaChainId && params.toChainIndex !== solanaChainId) {
    return "At least one chain must be Solana (chainIndex: 501)"
  }

  return null
}

// Get cross-chain swap quote
async function getCrossChainSwap(params: CrossChainSwapParams) {
  const timestamp = new Date().toISOString()
  const requestPath = "/api/v5/dex/cross-chain/build-tx"

  const queryParams = new URLSearchParams({
    fromChainIndex: params.fromChainIndex,
    toChainIndex: params.toChainIndex,
    fromChainId: params.fromChainId,
    toChainId: params.toChainId,
    fromTokenAddress: params.fromTokenAddress,
    toTokenAddress: params.toTokenAddress,
    amount: params.amount,
    slippage: params.slippage,
    userWalletAddress: params.userWalletAddress,
  })

  // Add optional parameters
  if (params.sort) queryParams.append("sort", params.sort)
  if (params.dexIds) queryParams.append("dexIds", params.dexIds)
  if (params.receiveAddress) queryParams.append("receiveAddress", params.receiveAddress)
  if (params.feePercent) queryParams.append("feePercent", params.feePercent)
  if (params.referrerAddress) queryParams.append("referrerAddress", params.referrerAddress)
  if (params.priceImpactProtectionPercentage) {
    queryParams.append("priceImpactProtectionPercentage", params.priceImpactProtectionPercentage)
  }
  if (params.onlyBridge !== undefined) queryParams.append("onlyBridge", params.onlyBridge.toString())
  if (params.memo) queryParams.append("memo", params.memo)

  // Handle array parameters
  if (params.allowBridge && params.allowBridge.length > 0) {
    queryParams.append("allowBridge", JSON.stringify(params.allowBridge))
  }
  if (params.denyBridge && params.denyBridge.length > 0) {
    queryParams.append("denyBridge", JSON.stringify(params.denyBridge))
  }

  const queryString = "?" + queryParams.toString()
  const headers:any = getOKXHeaders(timestamp, "GET", requestPath, queryString)

  const response = await fetch(`${OKX_BASE_URL}${requestPath}${queryString}`, {
    method: "GET",
    headers,
  })

  if (!response.ok) {
    throw new Error(`OKX API Error: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

// Main API handler
export async function POST(request: NextRequest) {
  try {
    // Check if OKX API credentials are configured
    if (!OKX_API_KEY || !OKX_SECRET_KEY || !OKX_PASSPHRASE) {
      return NextResponse.json(
        {
          error: "OKX API credentials not configured",
          details: "Please set OKX_API_KEY, OKX_SECRET_KEY, and OKX_PASSPHRASE environment variables",
        },
        { status: 500 },
      )
    }

    const body = await request.json()
    const { action, ...params } = body

    // Validate action parameter
    if (!action || action !== "build-tx") {
      return NextResponse.json(
        {
          error: "Invalid action",
          details: "Action must be 'build-tx' for cross-chain swaps",
        },
        { status: 400 },
      )
    }

    // Validate parameters
    const validation = validateCrossChainParams(params)
    if (validation) {
      return NextResponse.json({ error: validation }, { status: 400 })
    }

    // Get cross-chain swap data
    const result = await getCrossChainSwap(params as CrossChainSwapParams)

    // Add metadata to response
    const response = {
      success: true,
      action,
      timestamp: new Date().toISOString(),
      fromChain: params.fromChainIndex,
      toChain: params.toChainIndex,
      ...result,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("Cross-Chain Swap API Error:", error)

    // Handle different types of errors
    if (error.message.includes("OKX API Error:")) {
      return NextResponse.json(
        {
          error: "External API Error",
          details: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 502 },
      )
    }

    if (error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error: "Network Error",
          details: "Failed to connect to OKX API",
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      )
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// GET handler for health check and documentation
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const docs = searchParams.get("docs")

  if (docs === "true") {
    return NextResponse.json({
      title: "Cross-Chain Swap API",
      description: "API for executing cross-chain swaps using OKX bridge aggregator",
      version: "1.0.0",
      endpoints: {
        "POST /api/cross-chain-swap": {
          description: "Build cross-chain swap transaction",
          action: "build-tx",
          required: [
            "action",
            "fromChainIndex",
            "toChainIndex",
            "fromChainId",
            "toChainId",
            "fromTokenAddress",
            "toTokenAddress",
            "amount",
            "slippage",
            "userWalletAddress",
          ],
          optional: [
            "sort",
            "dexIds",
            "allowBridge",
            "denyBridge",
            "receiveAddress",
            "feePercent",
            "referrerAddress",
            "priceImpactProtectionPercentage",
            "onlyBridge",
            "memo",
          ],
          example: {
            action: "build-tx",
            fromChainIndex: "501",
            toChainIndex: "1",
            fromChainId: "501",
            toChainId: "1",
            fromTokenAddress: "11111111111111111111111111111111",
            toTokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            amount: "100000000",
            slippage: "0.01",
            userWalletAddress: "YourSolanaWalletAddress",
            sort: "1",
            feePercent: "0.1",
          },
        },
      },
      supportedChains: {
        "501": "Solana",
        "1": "Ethereum",
        "56": "BNB Chain",
        "137": "Polygon",
        "42161": "Arbitrum",
        "10": "Optimism",
        "43114": "Avalanche",
        "250": "Fantom",
      },
      bridgeOptions: {
        sort: {
          "0": "Most tokens received",
          "1": "Optimal route (recommended)",
          "2": "Fastest route",
        },
        slippageRange: {
          min: "0.002",
          max: "0.5",
          recommended: {
            sameToken: "0.002",
            differentToken: "0.01-0.025",
          },
        },
      },
    })
  }

  return NextResponse.json({
    status: "healthy",
    service: "Cross-Chain Swap API",
    timestamp: new Date().toISOString(),
    documentation: "/api/cross-chain-swap?docs=true",
    features: ["build-tx"],
    supportedChains: ["Solana", "Ethereum", "BNB Chain", "Polygon", "Arbitrum", "Optimism", "Avalanche", "Fantom"],
  })
}
