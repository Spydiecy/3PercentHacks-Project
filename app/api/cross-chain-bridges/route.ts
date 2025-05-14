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

// Fetch supported bridges
async function getSupportedBridges(chainIndex?: string) {
  const timestamp = new Date().toISOString()
  const requestPath = "/api/v5/dex/cross-chain/supported/bridges"
  
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

    // Fetch supported bridges
    const result = await getSupportedBridges(chainIndex || undefined)

    // Transform the response to include additional metadata
    const transformedBridges = result.data?.map((bridge: any) => ({
      bridgeId: bridge.bridgeId,
      bridgeName: bridge.bridgeName,
      requireOtherNativeFee: bridge.requireOtherNativeFee || bridge.requiredOtherNativeFee || false,
      logoUrl: bridge.logoUrl || bridge.logo,
      supportedChains: bridge.supportedChains || [],
      supportsSolana: bridge.supportedChains?.includes("501") || false,
    })) || []

    // Filter bridges that support Solana if requested
    const solanaBridges = transformedBridges.filter((bridge: any) => bridge.supportsSolana)

    // Add metadata to response
    const response = {
      success: true,
      chainIndex: chainIndex || "all",
      timestamp: new Date().toISOString(),
      totalBridges: transformedBridges.length,
      solanaBridges: solanaBridges.length,
      bridges: transformedBridges,
      solanaSupportedBridges: solanaBridges,
      ...result,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("Cross-Chain Bridges API Error:", error)

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
    title: "Cross-Chain Bridges API",
    description: "API for fetching information about supported cross-chain bridges",
    version: "1.0.0",
    endpoints: {
      "GET /api/cross-chain-bridges": {
        description: "Get information about supported cross-chain bridges",
        parameters: {
          chainIndex: {
            type: "string",
            required: false,
            description: "Chain identifier to filter bridges",
          },
        },
        examples: {
          "All supported bridges": "/api/cross-chain-bridges",
          "Bridges supporting Solana": "/api/cross-chain-bridges?chainIndex=501",
        },
        response: {
          bridges: "Array of bridge information",
          solanaSupportedBridges: "Bridges that support Solana",
          totalBridges: "Total number of bridges",
          solanaBridges: "Number of bridges supporting Solana",
        },
      },
    },
    bridgeFeatures: {
      bridgeId: "Unique identifier for the bridge",
      bridgeName: "Human-readable bridge name",
      requireOtherNativeFee: "Whether bridge requires native token fees",
      logoUrl: "Bridge logo image URL",
      supportedChains: "Array of supported chain IDs",
      supportsSolana: "Whether bridge supports Solana (501)",
    },
  })
}
