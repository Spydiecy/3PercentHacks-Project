import { type NextRequest, NextResponse } from "next/server"

// OKX API configuration
const OKX_BASE_URL = "https://web3.okx.com"
const OKX_API_KEY = process.env.API_KEY2
const OKX_SECRET_KEY = process.env.SECRET_KEY2
const OKX_PASSPHRASE = process.env.PASSPHRASE2

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

// Fetch supported tokens for a specific chain
async function getSupportedTokens(chainIndex: string) {
  const timestamp = new Date().toISOString()
  const requestPath = "/api/v5/dex/aggregator/all-tokens"
  const queryParams = new URLSearchParams({
    chainIndex: chainIndex,
    chainId: chainIndex, // Using same value as chainIndex for compatibility
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
    const chainIndex = searchParams.get("chainIndex") || "501" // Default to Solana

    // Validate chainIndex
    if (!/^\d+$/.test(chainIndex)) {
      return NextResponse.json(
        {
          error: "Invalid chainIndex",
          details: "chainIndex must be a numeric string",
        },
        { status: 400 },
      )
    }

    // Fetch tokens from OKX API
    const result = await getSupportedTokens(chainIndex)

    // Transform the response to include additional metadata
    const transformedTokens = result.data?.map((token: any) => ({
      symbol: token.tokenSymbol,
      name: token.tokenName,
      address: token.tokenContractAddress,
      decimals: parseInt(token.decimals),
      logoUrl: token.tokenLogoUrl,
      // Add fallback for tokens without logos
      hasLogo: !!token.tokenLogoUrl,
    })) || []

    // Add metadata to response
    const response = {
      success: true,
      chainIndex: chainIndex,
      chainName: chainIndex === "501" ? "Solana" : `Chain ${chainIndex}`,
      timestamp: new Date().toISOString(),
      totalTokens: transformedTokens.length,
      tokens: transformedTokens,
      ...result,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("DEX Tokens API Error:", error)

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

// POST handler for documentation and health check
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const docs = searchParams.get("docs")

  if (docs === "true") {
    return NextResponse.json({
      title: "DEX Tokens API",
      description: "API for fetching supported tokens from OKX DEX aggregator",
      version: "1.0.0",
      endpoints: {
        "GET /api/dex-tokens": {
          description: "Get list of supported tokens for a specific chain",
          parameters: {
            chainIndex: {
              type: "string",
              required: false,
              default: "501",
              description: "Chain identifier (e.g., 501 for Solana)",
            },
          },
          example: "/api/dex-tokens?chainIndex=501",
          response: {
            success: "boolean",
            chainIndex: "string",
            chainName: "string",
            timestamp: "string",
            totalTokens: "number",
            tokens: [
              {
                symbol: "string",
                name: "string", 
                address: "string",
                decimals: "number",
                logoUrl: "string",
                hasLogo: "boolean",
              },
            ],
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

  return NextResponse.json({
    status: "healthy",
    service: "DEX Tokens API",
    timestamp: new Date().toISOString(),
    documentation: "/api/dex-tokens?docs=true",
    defaultChain: "Solana (501)",
    features: ["token-list", "logos", "metadata"],
  })
}
