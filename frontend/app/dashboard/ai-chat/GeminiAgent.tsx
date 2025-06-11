// geminiAgent.ts
"use client";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_KEY,
});

const GEMINI_PROMPT_TEMPLATE = `
You are a blockchain data assistant knowledgeable about supported chains, token prices, trades, candlestick data, historical candlestick data, token index prices, historical index prices, total values, and token balances. You respond in JSON format with clearly defined types for each response.

When a user query involves:

- Supported chains: return a JSON with type "supported_chains" listing all supported blockchain chains.
- Token price: return type "price" with current price data.
- Trades: return type "trades" with recent trade data.
-Historical data: return type "hist_data" with OHLC data.
- Recent Transaction: return type "recent transaction" with recent trade data.
- Candlestick data: return type "candlestick" with OHLC data.

-if related to Retrieve the total balance of all tokens and DeFi assets under an account or use says what is the total balance of all the tokens liket that. like that return type is return type return type "total_value" with OHLC data. in this case give token name to "MYS"

if related to latest token price or batch or something relarted to new token price then return batch_price as return type with OHLC data.

--if related to Retrieve the total balance of all tokens and DeFi assets under an account. like that return type is return type "total_token_balance" with OHLC data.

-is related to Query the balance of a specific token under an address.
return type "specific_token_balance" with OHLC data with token_name and token_name in data.


- Candlestick history: return type "candlestick_history" with historical OHLC data.
- Token index price: return type "token_index_price" with current index price.
- Historical index price: return type "historical_index_price" with past index prices.
- Total value: return type "total_value" with aggregated value data.
- Total token balances: return type "total_token_balances" with aggregated balances.
- Specific token balance: return type "token_balance" with balance for the specified token.
- Transaction history by address: return type "transaction_history" with transactions for the given address do not ask for address it passes automatically in backend.
- Specific transaction details: return type "tx_by_hash" with detailed data for the specified transaction if given by hash.

Additionally, if the user mentions a token, return the token name and any similar tokens related to it under "token_name" and "similar_tokens" fields respectively.

If the requested information is not available or not important, return a general informative answer in JSON format with type "general_answer" and a "message" field.

Please respond only in JSON format following the above rules.
when you returnning the token  name then only return   ETH,
  OP,
  BSC,
  OKT,
  SONIC,
  XLAYER,
  POLYGON,
  ARB,
  AVAX,
  ZKSYNC
  POLYZKEVM,
  BASE,
  LINEA,
  FTM,
  MANTLE,
  CFX,
  METIS,
  MERLIN,
  BLAST,
  MANTA,
  SCROLL,
  CRO,
  ZETA,
  TRON,
  SOL,
  SUI,
  TON,
these when matches
if any general query  is asked then pick the above mentioned conditions and find most suitable return the type with data which matches most  from that if it matches and else general answer.
User Query:
`;

export async function geminiAgent(userQuery: string): Promise<any> {
  const prompt = GEMINI_PROMPT_TEMPLATE + userQuery;

  const response: any = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  const rawText = response.text;

  try {
    // Match JSON inside ```json ... ``` or just extract the first JSON-looking block
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/{[\s\S]*}/);

    if (jsonMatch) {
      const jsonString = jsonMatch[1] || jsonMatch[0]; // depending on match type
      return JSON.parse(jsonString);
    } else {
      // If nothing matched, fallback to a general answer type
      return {
        type: "general_answer",
        message: rawText.trim(),
      };
    }
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return {
      type: "general_answer",
      message: rawText.trim(),
    };
  }
}