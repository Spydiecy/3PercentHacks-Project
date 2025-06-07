
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Zap, RefreshCw } from 'lucide-react';
import { geminiAgent } from "./GeminiAgent";
import { extractImportantInfoFromData } from "./Gemini2Agent";

interface Message {
  role: "user" | "system";
  content: string;
}

interface GeminiResponse {
  text?: string;
  type?: string;
  token_name?: string;
  similar_tokens?: string[];
  [key: string]: any;
}

// Map token names to contract addresses
const tokenAddressMap: Record<string, string> = {
  ETH: "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72", // Native ETH
  OP: "0x4200000000000000000000000000000000000042", // OP token
  BSC: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native BNB
  OKT: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native OKT
  SONIC: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Placeholder
  XLAYER: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Placeholder
  POLYGON: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native MATIC
  ARB: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native ETH on Arbitrum
  AVAX: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native AVAX
  ZKSYNC: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native ETH on zkSync
  POLYZKEVM: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native MATIC
  BASE: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native ETH
  LINEA: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native ETH
  FTM: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native FTM
  MANTLE: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native MNT
  CFX: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native CFX
  METIS: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native METIS
  MERLIN: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Placeholder
  BLAST: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Placeholder
  MANTA: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Placeholder
  SCROLL: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native ETH
  CRO: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native CRO
  ZETA: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native ZETA
  TRON: "TRX", // Tron native token symbol
  SOL: "SOL", // Solana native token symbol
  SUI: "0x2::sui::SUI", // SUI native token ID
  TON: "TON" // TON native token symbol
};

const chainIndexMap:Record<string,String> = {
  ETH: "1",
  OP: "10",
  BSC: "56",
  OKT: "66",
  SONIC: "146",
  XLAYER: "196",
  POLYGON: "137",
  ARB: "42161",
  AVAX: "43114",
  ZKSYNC: "324",
  POLYZKEVM: "1101",
  BASE: "8453",
  LINEA: "59144",
  FTM: "250",
  MANTLE: "5000",
  CFX: "1030",
  METIS: "1088",
  MERLIN: "4200",
  BLAST: "81457",
  MANTA: "169",
  SCROLL: "534352",
  CRO: "25",
  ZETA: "7000",
  TRON: "195",
  SOL: "501",
  SUI: "784",
  TON: "607"
};


function getTokenContractAddress(tokenName: string): string | null {
  return tokenAddressMap[tokenName] || null;
}

// Call your local market data API with POST request
async function callMarketDataApi(type: string, tokenName: string) {
  const tokenContractAddress = getTokenContractAddress(tokenName);
  if (!tokenContractAddress) {
    throw new Error(`Token contract address not found for token: ${tokenName}`);
  }

  let path = "";
  let method="POST"
  switch (type) {
    case "price":
      path = "/api/v5/dex/market/price";
      break;
    case "candlestick": 
      path = "/api/v5/dex/candlestick";
      break;
    case "hist_data": 
    method="GET"
      path = "/api/v5/dex/index/historical-price";
      break;
    case "total_value": 
    method="GET"
      path = "/api/v5/dex/balance/total-value";
      break;
    case "total_token_balance": 
      method="GET"
      path = "/api/v5/dex/balance/all-token-balances-by-address";
      break;
    case "specific_token_balance":
      path = "/api/v5/dex/balance/token-balances-by-address";
      break;
    case "candlestick_history":
      path = "/api/v5/dex/candlestick";
      break;
    case "historical_index_price":
      path = "/api/v5/dex/candlestick";
      break;
    case "total_value":
      path = "/api/v5/dex/candlestick";
      break;
    case "token_balance":
      path = "/api/v5/dex/candlestick";
      break;
    case "transaction_history":
      method="GET"
      path = "/api/v5/dex/post-transaction/transactions-by-address";
      break;
    case "spe_transaction":
      method="GET"
      path = "/api/v5/dex/post-transaction/transaction-detail-by-txhash";
      break;
    case "total_value":
      path = "/api/v5/dex/candlestick";
      break;    
    // Add more cases as needed
    default:
      path = "/api/v5/dex/default";
  }

  try {
    const body = {
      method: method,
      path,
      data: [
        {
          chainIndex: chainIndexMap[tokenName],
          tokenContractAddress,
        },
      ],
    };  
    console.log("my body is::",body);
    
    const response = await fetch("http://127.0.0.1:3000/api/market_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    let m=await response.json();
    console.log("my m fetch is:::",m);
    

    if (!response.ok) {
      throw new Error(`Market data API error: ${response.statusText}`);
    }
    return m;
  } catch (error) {
    console.error("Market data API error:", error);
    throw error;
  }
}

const suggestions = [
  "How does Astra's AI trading work?",
  "Explain the current SOL market conditions",
  "What's the best DeFi strategy for beginners?",
  "How to minimize transaction fees?",
];

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "Hello! I'm Astra AI, your DeFi assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Call Gemini API
      const geminiResponse: GeminiResponse = await geminiAgent(input);
      console.log("Gemini Response:", geminiResponse);

      // Process the response
      if (geminiResponse.type && geminiResponse.token_name) {
        try {
          const marketData = await callMarketDataApi(
            geminiResponse.type,
            geminiResponse.token_name
          );

          // Combine Gemini and market data for important info extraction
          const formattedResponse = geminiResponse.text ||
            `Here's the information about ${geminiResponse.token_name}: ${JSON.stringify(marketData)}`;

          const aiMessage: string = await extractImportantInfoFromData(formattedResponse);
          console.log("my ai messages are::::"+aiMessage);
          
          setMessages((prev) => [
            ...prev,
            { role: "system", content: aiMessage },
          ]);
        } catch (apiError: any) {
          console.log("my Api Error is:::",apiError);
          
          setMessages((prev) => [
            ...prev,
            {
              role: "system",
              content: `I couldn't fetch the market data for ${geminiResponse.token_name}: ${apiError.message}`,
            },
          ]);
        }
      } else {
        // Show Gemini response if no actionable data
        const responseText = geminiResponse.text || JSON.stringify(geminiResponse);
           const aiMessage: string = await extractImportantInfoFromData(responseText);
          console.log("my ai messages are::::"+aiMessage);
        setMessages((prev) => [...prev, { role: "system", content: aiMessage}]);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: "system", content: `Sorry, I encountered an error: ${error.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: "system",
        content: "Hello! I'm Astra AI, your DeFi assistant. How can I help you today?",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-black p-6 rounded-xl text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text mb-1">
            AI Assistant
          </h1>
          <p className="text-white/60">Powered by advanced language models</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 border-white/20 hover:bg-white/10 text-white"
          onClick={handleReset}
        >
          <RefreshCw className="h-4 w-4" /> New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl mb-4 p-6 hover:border-white/20 transition-all hover:shadow-xl">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`}
          >
            <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div
                className={`rounded-full h-9 w-9 flex items-center justify-center ${message.role === "user"
                  ? "bg-white/10 ml-2 border border-white/10"
                  : "bg-white/10 mr-2 border border-white/10"
                  }`}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4 text-white/80" />
                ) : (
                  <Bot className="h-4 w-4 text-white/80" />
                )}
              </div>
              <div
                className={`py-3 px-4 rounded-2xl ${message.role === "user"
                  ? "bg-white/5 border border-white/10"
                  : "bg-black/30 border border-white/10"
                  } whitespace-pre-wrap`}
              >
                <p className="text-white/90">{message.content}</p>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="flex flex-row">
              <div className="rounded-full h-9 w-9 flex items-center justify-center bg-white/10 mr-2 border border-white/10">
                <Bot className="h-4 w-4 text-white/80" />
              </div>
              <div className="py-3 px-4 rounded-2xl bg-black/30 border border-white/10">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 bg-white/40 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="backdrop-blur-md bg-black/30 border border-white/10 rounded-xl overflow-hidden">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
            placeholder="Ask Astra AI about DeFi strategies, market analysis, or trading tips..."
            className="w-full py-4 px-4 bg-transparent border-none pr-24 focus:outline-none text-white placeholder:text-white/40"
            disabled={loading}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 rounded-full text-white/60 hover:bg-white/10 hover:text-white/80"
              onClick={() => setInput("")}
              aria-label="Clear input"
              disabled={loading || !input.trim()}
            >
              <Zap className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="h-8 px-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white hover:border-white/20"
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => setInput(suggestion)}
            className="backdrop-blur-sm bg-white/5 text-sm py-2 px-4 rounded-full hover:bg-white/10 transition-colors border border-white/10 text-white/80 hover:text-white hover:border-white/20"
            disabled={loading}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
