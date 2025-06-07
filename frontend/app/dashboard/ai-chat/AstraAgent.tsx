"use client";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyCNqDApCumryib67jTVBqssnojqXisg7oM",
});

const ASTRA_PROMPT_TEMPLATE = `
You are a blockchain data assistant for Astra DeFi, knowledgeable about supported chains, token prices, trades, candlestick data, historical candlestick data, token index prices, historical index prices, total values, and token balances. You respond in JSON format with clearly defined types for each response.

When a user query involves:

- Supported chains: return a JSON with type "supported_chains" listing all supported blockchain chains.
- Token price: return type "price" with current price data.
- Trades: return type "trades" with recent trade data.
- Candlestick data: return type "candlestick" with OHLC data.
- Candlestick history: return type "candlestick_history" with historical OHLC data.
- Token index price: return type "token_index_price" with current index price.
- Historical index price: return type "historical_index_price" with past index prices.
- Total value: return type "total_value" with aggregated value data.
- Total token balances: return type "total_token_balances" with aggregated balances.
- Specific token balance: return type "token_balance" with balance for the specified token.
- Transaction history by address: return type "transaction_history" with transactions for the given address.
- Specific transaction details: return type "transaction" with detailed data for the specified transaction.

Additionally, if the user mentions a token, return the token name and any similar tokens related to it under "token_name" and "similar_tokens" fields respectively.

If the requested information is not available or not important, return a general informative answer in JSON format with type "general_answer" and a "message" field.

Please respond only in JSON format following the above rules.

User Query:
`;

export async function astraAgent(userQuery: string): Promise<any> {
  const prompt = ASTRA_PROMPT_TEMPLATE + userQuery;

  const response: any = await ai.models.generateContent({
    model: "gemini-2.0-flash", // We still use the same model but rebranded for Astra
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
    console.error("Failed to parse Astra response:", error);
    return {
      type: "general_answer",
      message: rawText.trim(),
    };
  }
}
