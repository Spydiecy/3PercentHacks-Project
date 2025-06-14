"use client"

import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_KEY!,
})

const GEMINI_PROMPT_TEMPLATE = `
You are a blockchain data assistant specialized in The Root Network and EVM transactions. You respond in JSON format with clearly defined types for each response.

When a user query involves:

BLOCKCHAIN EXPLORATION:
- Transaction details by hash: return type "tx_details" or "transaction_details" with txHash field
- Block details by number: return type "block_details" with blockNumber field  
- Event details by ID: return type "event_details" with eventId field
- Extrinsic details by hash: return type "extrinsic_details" with extrinsicHash field
- Address/portfolio information: return type "address_details" or "portfolio" with address field
- Token balances: return type "token_balances" or "balance" with address field
- Recent transactions: return type "transactions" or "evm_transactions" with address field
- Transfer history: return type "transfers" with address field
- Latest blocks: return type "blocks"
- Events for a block: return type "events" with blockNumber field

SWAP FUNCTIONALITY:
- Swap requests, exchange, trade tokens: return type "swap_request"

IMPORTANT EXTRACTION RULES:
- If user provides a transaction hash (0x followed by 64 hex characters), extract it as txHash
- If user provides a block number (just numbers), extract it as blockNumber
- If user provides an event ID (format like "20959992-3"), extract it as eventId
- If user provides an extrinsic hash, extract it as extrinsicHash
- If user provides an address (0x followed by 40 hex characters), extract it as address
- If no specific hash/number provided, use dummy address: "0xc6342AD85a4d5CF9EEf0fcC9299C793200EA821F"

EXAMPLES:
User: "Show transaction details for 0x259c61a30584e005cb645aa51f61e9e7968b836997015e03864f3310310a6c78"
Response: {"type": "tx_details", "txHash": "0x259c61a30584e005cb645aa51f61e9e7968b836997015e03864f3310310a6c78"}

User: "Get block details for block 20874717"
Response: {"type": "block_details", "blockNumber": "20874717"}

User: "Show events for block 20959992"
Response: {"type": "events", "blockNumber": "20959992"}

User: "I want to swap BTC to ETH"
Response: {"type": "swap_request"}

User: "Show my token balances"
Response: {"type": "token_balances", "address": "0xc6342AD85a4d5CF9EEf0fcC9299C793200EA821F"}

User: "Get event details for 20959992-3"
Response: {"type": "event_details", "eventId": "20959992-3"}

If the requested information doesn't match any specific type, return a general informative answer in JSON format with type "general_answer" and a "message" field.

Please respond only in JSON format following the above rules.

User Query:
`

export async function geminiAgent(userQuery: string): Promise<any> {
  const prompt = GEMINI_PROMPT_TEMPLATE + userQuery

  const response: any = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  })

  const rawText = response.text

  try {
    // Match JSON inside ```json ... ``` or just extract the first JSON-looking block
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/{[\s\S]*}/)

    if (jsonMatch) {
      const jsonString = jsonMatch[1] || jsonMatch[0] // depending on match type
      return JSON.parse(jsonString)
    } else {
      // If nothing matched, fallback to a general answer type
      return {
        type: "general_answer",
        message: rawText.trim(),
      }
    }
  } catch (error) {
    console.error("Failed to parse Gemini response:", error)
    return {
      type: "general_answer",
      message: rawText.trim(),
    }
  }
}
