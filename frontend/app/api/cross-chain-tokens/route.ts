import { type NextRequest, NextResponse } from "next/server"

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

// Fetch tokens for a specific chain (for cross-chain swaps)
async function getChainTokens(chainIndex: string) {
  const timestamp = new Date().toISOString()
  const requestPath = "/api/v5/dex/aggregator/all-tokens"
  const queryParams = new URLSearchParams({
    chainIndex: chainIndex,
    chainId: chainIndex,
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

// Fetch cross-chain supported tokens
async function getCrossChainSupportedTokens(chainIndex?: string) {
  const timestamp = new Date().toISOString()
  const requestPath = "/api/v5/dex/cross-chain/supported/tokens"

  let queryString = ""
  if (chainIndex) {
    const queryParams = new URLSearchParams({
      chainIndex: chainIndex,
      chainId: chainIndex,
    })
    queryString = "?" + queryParams.toString()
  }

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
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const chainIndex = searchParams.get("chainIndex")
    const type = searchParams.get("type") || "chain-tokens" // "chain-tokens" or "cross-chain-supported"

    // Validate chainIndex if provided
    if (chainIndex && !/^\d+$/.test(chainIndex)) {
      return NextResponse.json(
        {
          error: "Invalid chainIndex",
          details: "chainIndex must be a numeric string",
        },
        { status: 400 },
      )
    }

    let result
    let apiType = ""

    if (type === "cross-chain-supported") {
      // Get cross-chain supported tokens
      result = await getCrossChainSupportedTokens(chainIndex || undefined)
      apiType = "Cross-Chain Supported Tokens"
    } else {
      // Get chain-specific tokens (default)
      if (!chainIndex) {
        return NextResponse.json(
          {
            error: "Missing chainIndex",
            details: "chainIndex is required for chain-tokens type",
          },
          { status: 400 },
        )
      }
      result = await getChainTokens(chainIndex)
      apiType = "Chain Tokens"
    }

    // Transform the response to include additional metadata
    const transformedTokens =
      result.data?.map((token: any) => ({
        symbol: token.tokenSymbol,
        name: token.tokenName,
        address: token.tokenContractAddress,
        decimals: Number.parseInt(token.decimals),
        logoUrl: token.tokenLogoUrl,
        chainIndex: token.chainIndex || chainIndex,
        chainId: token.chainId || chainIndex,
        hasLogo: !!token.tokenLogoUrl,
      })) || []

    // Add metadata to response
    const response = {
      success: true,
      type: apiType,
      chainIndex: chainIndex || "all",
      timestamp: new Date().toISOString(),
      totalTokens: transformedTokens.length,
      tokens: transformedTokens,
      ...result,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("Cross-Chain Tokens API Error:", error)

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

// POST handler for documentation
export async function POST(request: NextRequest) {
  return NextResponse.json({
    title: "Cross-Chain Tokens API",
    description: "API for fetching tokens available for cross-chain swaps",
    version: "1.0.0",
    endpoints: {
      "GET /api/cross-chain-tokens": {
        description: "Get tokens for cross-chain operations",
        parameters: {
          chainIndex: {
            type: "string",
            required: false,
            description: "Chain identifier (required for chain-tokens type)",
          },
          type: {
            type: "string",
            required: false,
            default: "chain-tokens",
            options: ["chain-tokens", "cross-chain-supported"],
            description: "Type of tokens to fetch",
          },
        },
        examples: {
          "Chain tokens for Solana": "/api/cross-chain-tokens?chainIndex=501&type=chain-tokens",
          "Cross-chain supported tokens": "/api/cross-chain-tokens?type=cross-chain-supported",
          "Cross-chain supported tokens for Solana":
            "/api/cross-chain-tokens?chainIndex=501&type=cross-chain-supported",
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
  })
}
