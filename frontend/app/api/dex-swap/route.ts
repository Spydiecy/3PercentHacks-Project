import { type NextRequest, NextResponse } from "next/server"

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

interface SwapInstructionParams extends SwapExecuteParams {
  // Additional Solana-specific parameters
  programId?: string
  accounts?: Array<{
    pubkey: string
    isSigner: boolean
    isWritable: boolean
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
function validateSwapParams(params: any, requireWallet = false): string | null {
  const required = ["chainId", "fromTokenAddress", "toTokenAddress", "amount", "slippage"]
  if (requireWallet) required.push("userWalletAddress")

  for (const param of required) {
    if (!params[param]) {
      return `Missing required parameter: ${param}`
    }
  }

  // Validate chainId format
  if (!/^\d+$/.test(params.chainId)) {
    return "Invalid chainId format. Must be a numeric string."
  }

  // Validate amount format
  if (!/^\d+(\.\d+)?$/.test(params.amount)) {
    return "Invalid amount format. Must be a numeric string."
  }

  // Validate slippage format
  if (!/^\d+(\.\d+)?$/.test(params.slippage)) {
    return "Invalid slippage format. Must be a numeric string."
  }

  // Validate slippage range (0-100%)
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
  })

  if (params.userWalletAddress) {
    queryParams.append("userWalletAddress", params.userWalletAddress)
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

// Execute swap (for EVM chains)
async function executeSwap(params: SwapExecuteParams) {
  const timestamp = new Date().toISOString()
  const requestPath = "/api/v5/dex/aggregator/swap"

  const body = JSON.stringify({
    chainId: params.chainId,
    fromTokenAddress: params.fromTokenAddress,
    toTokenAddress: params.toTokenAddress,
    amount: params.amount,
    slippage: params.slippage,
    userWalletAddress: params.userWalletAddress,
    feePercent: params.feePercent || "0",
    priceTolerance: params.priceTolerance || "0",
    autoSlippage: params.autoSlippage || "false",
    pathNum: params.pathNum || "3",
  })

  const headers:any = getOKXHeaders(timestamp, "POST", requestPath, "", body)

  const response = await fetch(`${OKX_BASE_URL}${requestPath}`, {
    method: "POST",
    headers,
    body,
  })

  if (!response.ok) {
    throw new Error(`OKX API Error: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

// Get swap instructions (for Solana)
async function getSwapInstructions(params: SwapInstructionParams) {
  const timestamp = new Date().toISOString()
  const requestPath = "/api/v5/dex/aggregator/swap-instruction"

  const queryParams = new URLSearchParams({
    chainId: params.chainId,
    fromTokenAddress: params.fromTokenAddress,
    toTokenAddress: params.toTokenAddress,
    amount: params.amount,
    slippage: params.slippage,
    userWalletAddress: params.userWalletAddress,
    feePercent: params.feePercent || "1",
    priceTolerance: params.priceTolerance || "0",
    autoSlippage: params.autoSlippage || "false",
    pathNum: params.pathNum || "3",
  })

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
    if (!action || !["quote", "swap", "instructions"].includes(action)) {
      return NextResponse.json(
        {
          error: "Invalid action",
          details: "Action must be one of: quote, swap, instructions",
        },
        { status: 400 },
      )
    }

    let result

    switch (action) {
      case "quote":
        // Validate parameters for quote
        const quoteValidation = validateSwapParams(params, false)
        if (quoteValidation) {
          return NextResponse.json({ error: quoteValidation }, { status: 400 })
        }

        result = await getSwapQuote(params as SwapQuoteParams)
        break

      case "swap":
        // Validate parameters for swap execution
        const swapValidation = validateSwapParams(params, true)
        if (swapValidation) {
          return NextResponse.json({ error: swapValidation }, { status: 400 })
        }

        // Check if this is Solana (chainId 501) - use instructions instead
        if (params.chainId === "501") {
          return NextResponse.json(
            {
              error: "Use instructions action for Solana swaps",
              details: "Solana swaps require swap-instruction endpoint, not direct swap execution",
            },
            { status: 400 },
          )
        }

        result = await executeSwap(params as SwapExecuteParams)
        break

      case "instructions":
        // Validate parameters for swap instructions
        const instructionsValidation = validateSwapParams(params, true)
        if (instructionsValidation) {
          return NextResponse.json({ error: instructionsValidation }, { status: 400 })
        }

        result = await getSwapInstructions(params as SwapInstructionParams)
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Add metadata to response
    const response = {
      success: true,
      action,
      timestamp: new Date().toISOString(),
      chainId: params.chainId,
      ...result,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("DEX Swap API Error:", error)

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
      title: "DEX Swap API",
      description: "API for executing decentralized exchange swaps using OKX aggregator",
      version: "1.0.0",
      endpoints: {
        "POST /api/dex-swap": {
          description: "Execute swap operations",
          actions: {
            quote: {
              description: "Get swap quote without execution",
              required: ["action", "chainId", "fromTokenAddress", "toTokenAddress", "amount", "slippage"],
              optional: ["userWalletAddress"],
            },
            swap: {
              description: "Execute swap on EVM chains",
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
            instructions: {
              description: "Get swap instructions for Solana",
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
          examples: {
            quote: {
              action: "quote",
              chainId: "1",
              fromTokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
              toTokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
              amount: "1000000",
              slippage: "0.5",
            },
            solana_instructions: {
              action: "instructions",
              chainId: "501",
              fromTokenAddress: "11111111111111111111111111111111",
              toTokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
              amount: "100000000",
              slippage: "0.5",
              userWalletAddress: "YourSolanaWalletAddress",
            },
          },
        },
      },
      supportedChains: {
        "1": "Ethereum",
        "56": "BNB Chain",
        "137": "Polygon",
        "42161": "Arbitrum",
        "10": "Optimism",
        "43114": "Avalanche",
        "501": "Solana",
      },
    })
  }

  return NextResponse.json({
    status: "healthy",
    service: "DEX Swap API",
    timestamp: new Date().toISOString(),
    documentation: "/api/dex-swap?docs=true",
  })
}
