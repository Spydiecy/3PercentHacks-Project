import { type NextRequest, NextResponse } from "next/server"
import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  type AddressLookupTableAccount,
} from "@solana/web3.js"
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

interface SwapInstructionParams extends SwapExecuteParams {
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

// Solana configuration
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com"
const SOLANA_PRIVATE_KEY = "3BfoMePqa47ueiumgeVaVtS7X1URkTZz31vibUcy415Acz6ydu19PwYN2hUFnnx4GZ1t1G6wnBXYyii9735QThYP"

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

// Execute Solana swap
async function executeSolanaSwap(params: SwapExecuteParams) {
  if (!SOLANA_PRIVATE_KEY) {
    throw new Error("SOLANA_PRIVATE_KEY not configured")
  }

  // Initialize Solana connection and wallet
  const connection = new Connection(SOLANA_RPC_URL)
  const wallet = Keypair.fromSecretKey(Uint8Array.from(base58.decode(SOLANA_PRIVATE_KEY)))

  console.log("Getting token information...")

  // First get quote to fetch token information
  const quote = await getSwapQuote(params)

  if (!quote.data || quote.data.length === 0) {
    throw new Error("No quote data received")
  }

  const tokenInfo = {
    fromToken: {
      symbol: quote.data[0].fromToken.tokenSymbol,
      decimals: Number.parseInt(quote.data[0].fromToken.decimal),
      price: quote.data[0].fromToken.tokenUnitPrice,
    },
    toToken: {
      symbol: quote.data[0].toToken.tokenSymbol,
      decimals: Number.parseInt(quote.data[0].toToken.decimal),
      price: quote.data[0].toToken.tokenUnitPrice,
    },
  }

  console.log("Swap Details:")
  console.log("--------------------")
  console.log(`From: ${tokenInfo.fromToken.symbol}`)
  console.log(`To: ${tokenInfo.toToken.symbol}`)
  console.log(`Amount: ${params.amount}`)
  console.log(`Slippage: ${params.slippage}%`)

  // Get swap instructions
  console.log("Getting swap instructions...")
  const instructionsResponse = await getSwapInstructions(params)

  if (!instructionsResponse.data) {
    throw new Error("No instruction data received")
  }

  const { instructionLists, addressLookupTableAccount } = instructionsResponse.data

  // Helper function to convert DEX API instructions to Solana format
  function createTransactionInstruction(instruction: any) {
    return new TransactionInstruction({
      programId: new PublicKey(instruction.programId),
      keys: instruction.accounts.map((key: any) => ({
        pubkey: new PublicKey(key.pubkey),
        isSigner: key.isSigner,
        isWritable: key.isWritable,
      })),
      data: Buffer.from(instruction.data, "base64"),
    })
  }

  // Process DEX instructions into Solana-compatible format
  const instructions: TransactionInstruction[] = []
  const uniqueLookupTables = Array.from(new Set(addressLookupTableAccount))

  console.log("Lookup tables to load:", uniqueLookupTables)

  // Convert each DEX instruction to Solana format
  if (instructionLists?.length) {
    instructions.push(...instructionLists.map(createTransactionInstruction))
  }

  // Process lookup tables for transaction optimization
  const addressLookupTableAccounts: AddressLookupTableAccount[] = []
  if (uniqueLookupTables?.length > 0) {
    console.log("Loading address lookup tables...")
    const lookupTableAccounts = await Promise.all(
      uniqueLookupTables.map(async (address:any) => {
        const pubkey = new PublicKey(address)
        const account = await connection.getAddressLookupTable(pubkey).then((res) => res.value)
        if (!account) {
          throw new Error(`Could not fetch lookup table account ${address}`)
        }
        return account
      }),
    )
    addressLookupTableAccounts.push(...lookupTableAccounts)
  }

  // Get recent blockhash for transaction timing and uniqueness
  const latestBlockhash = await connection.getLatestBlockhash("finalized")

  // Create versioned transaction message (V0 format required for lookup table support)
  const messageV0 = new TransactionMessage({
    payerKey: wallet.publicKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions,
  }).compileToV0Message(addressLookupTableAccounts)

  // Create new versioned transaction with optimizations
  const transaction = new VersionedTransaction(messageV0)

  // Simulate transaction to check for errors
  console.log("Simulating transaction...")
  const simulationResult = await connection.simulateTransaction(transaction)

  if (simulationResult.value.err) {
    throw new Error(`Transaction simulation failed: ${JSON.stringify(simulationResult.value.err)}`)
  }

  // Sign transaction with fee payer wallet
  transaction.sign([wallet])

  // Send transaction to Solana
  console.log("Executing swap...")
  const txId = await connection.sendRawTransaction(transaction.serialize(), {
    skipPreflight: false,
    maxRetries: 5,
  })

  console.log("Transaction ID:", txId)
  console.log("Explorer URL:", `https://solscan.io/tx/${txId}`)

  // Wait for confirmation
  await connection.confirmTransaction({
    signature: txId,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  })

  console.log("Transaction confirmed!")

  return {
    success: true,
    transactionId: txId,
    explorerUrl: `https://solscan.io/tx/${txId}`,
    tokenInfo,
    swapDetails: {
      fromAmount: params.amount,
      fromToken: tokenInfo.fromToken.symbol,
      toToken: tokenInfo.toToken.symbol,
      slippage: params.slippage,
    },
    instructionsUsed: instructions.length,
    lookupTablesUsed: addressLookupTableAccounts.length,
  }
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
    if (!action || !["quote", "execute", "instructions"].includes(action)) {
      return NextResponse.json(
        {
          error: "Invalid action",
          details: "Action must be one of: quote, execute, instructions",
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

      case "execute":
        // Validate parameters for swap execution
        const executeValidation = validateSwapParams(params, true)
        if (executeValidation) {
          return NextResponse.json({ error: executeValidation }, { status: 400 })
        }

        // Only support Solana execution for now
        if (params.chainId !== "501") {
          return NextResponse.json(
            {
              error: "Only Solana execution supported",
              details: "Currently only chainId 501 (Solana) is supported for swap execution",
            },
            { status: 400 },
          )
        }

        result = await executeSolanaSwap(params as SwapExecuteParams)
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

    if (error.message.includes("Transaction simulation failed")) {
      return NextResponse.json(
        {
          error: "Transaction Simulation Failed",
          details: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
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
      version: "2.0.0",
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
              description: "Execute swap on Solana (requires SOLANA_PRIVATE_KEY)",
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
              chainId: "501",
              fromTokenAddress: "11111111111111111111111111111111",
              toTokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
              amount: "100000000",
              slippage: "0.5",
            },
            execute: {
              action: "execute",
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
        "501": "Solana (quote, execute, instructions)",
      },
      requiredEnvironmentVariables: {
        OKX_API_KEY: "OKX API Key",
        OKX_SECRET_KEY: "OKX Secret Key",
        OKX_PASSPHRASE: "OKX Passphrase",
        SOLANA_PRIVATE_KEY: "Base58 encoded Solana private key (for execute action)",
        SOLANA_RPC_URL: "Solana RPC URL (optional, defaults to mainnet)",
      },
    })
  }

  return NextResponse.json({
    status: "healthy",
    service: "DEX Swap API v2.0",
    timestamp: new Date().toISOString(),
    documentation: "/api/dex-swap?docs=true",
    features: ["quote", "execute", "instructions"],
    supportedChains: ["Solana (501)"],
  })
}
