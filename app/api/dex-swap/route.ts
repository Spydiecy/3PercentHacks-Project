import { type NextRequest, NextResponse } from "next/server"
import base58 from "bs58"

// Types for swap parameters
interface SwapQuoteParams {
  chainId: string
  fromTokenAddress: string
  toTokenAddress: string
  amount: string
  slippage: string
  userWalletAddress?: string
}

interface SwapExecuteParams extends SwapQuoteParams {
  userWalletAddress: string
  feePercent?: string
  priceTolerance?: string
  autoSlippage?: string
  pathNum?: string
}

// OKX API configuration
const OKX_BASE_URL = "https://web3.okx.com"
const OKX_API_KEY = process.env.API_KEY
const OKX_SECRET_KEY = process.env.SECRET_KEY
const OKX_PASSPHRASE = process.env.PASSPHRASE

// TRN configuration (to be implemented)
// const TRN_RPC_URL = process.env.TRN_RPC_URL || "https://api.mainnet.rootnet.live"
// const TRN_PRIVATE_KEY = process.env.TRN_PRIVATE_KEY

// Helper function to generate OKX API headers
function getOKXHeaders(timestamp: string, method: string, requestPath: string, queryString = "", body = "") {
  const crypto = require("crypto")

  const message = timestamp + method + requestPath + queryString + body
  const signature = crypto.createHmac("sha256", OKX_SECRET_KEY).update(message).digest("base64")

  return {
    "Content-Type": "application/json",
    "OK-ACCESS-KEY": OKX_API_KEY!,
    "OK-ACCESS-SIGN": signature,
    "OK-ACCESS-TIMESTAMP": timestamp,
    "OK-ACCESS-PASSPHRASE": OKX_PASSPHRASE!,
  }
}

// Validate required parameters
function validateSwapParams(params: any, requireWallet = false): string | null {
  const required = ["chainId", "fromTokenAddress", "toTokenAddress", "amount", "slippage"]
  if (requireWallet) required.push("userWalletAddress")

  for (const param of required) {
    if (!params[param]) {
      return `Missing required parameter: ${param}`
    }
  }

  if (!/^\d+$/.test(params.chainId)) {
    return "Invalid chainId format. Must be a numeric string."
  }

  if (!/^\d+(\.\d+)?$/.test(params.amount)) {
    return "Invalid amount format. Must be a numeric string."
  }

  if (!/^\d+(\.\d+)?$/.test(params.slippage)) {
    return "Invalid slippage format. Must be a numeric string."
  }

  const slippageNum = Number.parseFloat(params.slippage)
  if (slippageNum < 0 || slippageNum > 100) {
    return "Slippage must be between 0 and 100"
  }

  return null
}

// Get swap quote
async function getSwapQuote(params: SwapQuoteParams) {
  const timestamp = new Date().toISOString()
  const requestPath = "/api/v5/dex/aggregator/quote"
  const queryParams = new URLSearchParams({
    chainId: params.chainId,
    fromTokenAddress: params.fromTokenAddress,
    toTokenAddress: params.toTokenAddress,
    amount: params.amount,
    slippage: params.slippage,
    ...(params.userWalletAddress && { userWalletAddress: params.userWalletAddress }),
  })

  const queryString = `?${queryParams.toString()}`
  const headers = getOKXHeaders(timestamp, "GET", requestPath, queryString)

  const response = await fetch(`${OKX_BASE_URL}${requestPath}${queryString}`, {
    method: "GET",
    headers,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Execute TRN swap (placeholder implementation)
async function executeTRNSwap(params: SwapExecuteParams) {
  // TODO: Implement TRN-specific swap execution
  console.log("TRN swap execution - to be implemented")
  console.log("Swap parameters:", params)
  
  // For now, return a placeholder response
  return {
    success: false,
    message: "TRN swap execution not yet implemented. Please wait for TRN SDK integration.",
    transactionHash: null
  }
}

// API Routes
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const docs = searchParams.get("docs")

  if (docs === "true") {
    return NextResponse.json({
      title: "DEX Swap API",
      description: "API for executing decentralized exchange swaps using OKX aggregator on TRN (The Root Network)",
      version: "3.0.0",
      endpoints: {
        "POST /api/dex-swap": {
          description: "Execute swap operations",
          actions: {
            quote: {
              description: "Get swap quote without execution",
              required: ["action", "chainId", "fromTokenAddress", "toTokenAddress", "amount", "slippage"],
              optional: ["userWalletAddress"],
            },
            execute: {
              description: "Execute swap on TRN (requires TRN_PRIVATE_KEY)",
              required: [
                "action",
                "chainId",
                "fromTokenAddress",
                "toTokenAddress",
                "amount",
                "slippage",
                "userWalletAddress",
              ],
              optional: ["feePercent", "priceTolerance", "autoSlippage", "pathNum"],
            },
          },
        },
      },
      supportedChains: {
        "7668": "TRN (The Root Network) - quote, execute (coming soon)",
      },
      requiredEnvironmentVariables: {
        OKX_API_KEY: "OKX API Key",
        OKX_SECRET_KEY: "OKX Secret Key",
        OKX_PASSPHRASE: "OKX Passphrase",
        TRN_PRIVATE_KEY: "TRN private key (for execute action)",
        TRN_RPC_URL: "TRN RPC URL (optional, defaults to mainnet)",
      },
    })
  }

  return NextResponse.json({
    status: "healthy",
    service: "DEX Swap API v3.0 - TRN Edition",
    timestamp: new Date().toISOString(),
    documentation: "/api/dex-swap?docs=true",
    features: ["quote", "execute (coming soon)"],
    supportedChains: ["TRN (The Root Network)"],
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const params: SwapExecuteParams = {
      chainId: body.chainId,
      fromTokenAddress: body.fromTokenAddress,
      toTokenAddress: body.toTokenAddress,
      amount: body.amount,
      slippage: body.slippage,
      userWalletAddress: body.userWalletAddress,
      feePercent: body.feePercent,
      priceTolerance: body.priceTolerance,
      autoSlippage: body.autoSlippage,
      pathNum: body.pathNum,
    }

    const action = body.action

    if (action === "quote") {
      const validationError = validateSwapParams(params)
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 })
      }

      const quote = await getSwapQuote(params)
      return NextResponse.json(quote)
    }

    if (action === "execute") {
      const validationError = validateSwapParams(params, true)
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 })
      }

      // Execute TRN swap (placeholder for now)
      const result = await executeTRNSwap(params)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: "Invalid action. Use 'quote' or 'execute'" }, { status: 400 })
    
  } catch (error) {
    console.error("Error executing swap:", error)
    return NextResponse.json(
      { error: "Failed to execute swap" },
      { status: 500 }
    )
  }
}
