import { type NextRequest, NextResponse } from "next/server";

// OKX API configuration
const OKX_BASE_URL = "https://web3.okx.com";
const OKX_API_KEY = process.env.API_KEY3;
const OKX_SECRET_KEY = process.env.SECRET_KEY3;
const OKX_PASSPHRASE = process.env.PASSPHRASE3;

// Helper function to generate OKX API headers
function getOKXHeaders(timestamp: string, method: string, requestPath: string, queryString = "", body = "") {
  const crypto = require("crypto");

  const message = timestamp + method + requestPath + queryString + body;
  const signature = crypto.createHmac("sha256", OKX_SECRET_KEY).update(message).digest("base64");

  return {
    "Content-Type": "application/json",
    "OK-ACCESS-KEY": OKX_API_KEY,
    "OK-ACCESS-SIGN": signature,
    "OK-ACCESS-TIMESTAMP": timestamp,
    "OK-ACCESS-PASSPHRASE": OKX_PASSPHRASE,
  };
}

// Fetch supported bridge token pairs
async function getBridgeTokenPairs(fromChainIndex?: string) {
  const timestamp = new Date().toISOString();
  const requestPath = "/api/v5/dex/cross-chain/supported/bridge-tokens-pairs";

  let queryString = "";
  if (fromChainIndex) {
    const queryParams = new URLSearchParams({
      fromChainIndex: fromChainIndex,
    });
    queryString = "?" + queryParams.toString();
  }

  const headers:any = getOKXHeaders(timestamp, "GET", requestPath, queryString);
  // console.log("Request URL:", `${OKX_BASE_URL}${requestPath}${queryString}`);
  // console.log("Headers:", headers);

  const response = await fetch(`${OKX_BASE_URL}${requestPath}${queryString}`, {
    method: "GET",
    headers,
  });

  console.log("Status:", response.status);
  const text = await response.text();
  console.log("Raw response:", text);

  if (!response.ok) {
    throw new Error(`OKX API Error: ${response.status} ${response.statusText}`);
  }

  return JSON.parse(text);
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
      );
    }

    const { searchParams } = new URL(request.url);
    console.log("My search params:", searchParams);

    const fromChainIndex = "501"

    // Validate fromChainIndex if provided
    if (fromChainIndex && !/^\d+$/.test(fromChainIndex)) {
      return NextResponse.json(
        {
          error: "Invalid fromChainIndex",
          details: "fromChainIndex must be a numeric string",
        },
        { status: 400 },
      );
    }

    // Fetch bridge token pairs
    const result = await getBridgeTokenPairs(fromChainIndex || undefined);

    // Transform the response to include additional metadata
    const transformedPairs = result.data?.map((pair: any) => ({
      fromChainIndex: pair.fromChainIndex,
      toChainIndex: pair.toChainIndex,
      fromChainId: pair.fromChainId,
      toChainId: pair.toChainId,
      fromTokenAddress: pair.fromTokenAddress,
      toTokenAddress: pair.toTokenAddress,
      fromTokenSymbol: pair.fromTokenSymbol,
      toTokenSymbol: pair.toTokenSymbol,
      pairId: `${pair.fromChainIndex}-${pair.toChainIndex}-${pair.fromTokenSymbol}-${pair.toTokenSymbol}`,
    })) || [];

    // Group pairs by chains for easier lookup
    const pairsByChain = transformedPairs.reduce((acc: any, pair: any) => {
      const key = `${pair.fromChainIndex}-${pair.toChainIndex}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(pair);
      return acc;
    }, {});

    // Add metadata to response
    const response = {
      success: true,
      fromChainIndex: fromChainIndex || "all",
      timestamp: new Date().toISOString(),
      totalPairs: transformedPairs.length,
      pairs: transformedPairs,
      pairsByChain: pairsByChain,
      ...result,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Cross-Chain Pairs API Error:", error);

    // Handle different types of errors
    if (error.message.includes("OKX API Error:")) {
      return NextResponse.json(
        {
          error: "External API Error",
          details: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 502 },
      );
    }

    if (error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error: "Network Error",
          details: "Failed to connect to OKX API",
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// POST handler for documentation
export async function POST(request: NextRequest) {
  return NextResponse.json({
    title: "Cross-Chain Token Pairs API",
    description: "API for fetching supported token pairs for cross-chain bridges",
    version: "1.0.0",
    endpoints: {
      "GET /api/cross-chain-pairs": {
        description: "Get supported token pairs for cross-chain bridges",
        parameters: {
          fromChainIndex: {
            type: "string",
            required: false,
            description: "Source chain identifier to filter pairs",
          },
        },
        examples: {
          "All supported pairs": "/api/cross-chain-pairs",
          "Pairs from Solana": "/api/cross-chain-pairs?fromChainIndex=501",
          "Pairs from Ethereum": "/api/cross-chain-pairs?fromChainIndex=1",
        },
        response: {
          pairs: "Array of token pairs",
          pairsByChain: "Pairs grouped by chain combinations",
          totalPairs: "Total number of supported pairs",
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
  });
}
