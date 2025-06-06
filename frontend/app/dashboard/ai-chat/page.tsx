"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Send, Bot, User, Zap, ArrowDown, RefreshCw, Sparkles } from "lucide-react"

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "Hello! I'm Astra AI, your DeFi assistant. How can I help you today?" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSendMessage = () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = { role: "user", content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiMessage: Message = { 
        role: "system", 
        content: "I'm a simulated AI response. In the actual implementation, this would connect to your AI backend to provide helpful DeFi insights and recommendations."
      }
      setMessages(prev => [...prev, aiMessage])
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text mb-1">AI Assistant</h1>
          <p className="text-white/60">Powered by advanced language models</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1 border-white/20 hover:bg-white/10 text-white"
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
              <div className={`rounded-full h-9 w-9 flex items-center justify-center ${
                message.role === "user" 
                  ? "bg-white/10 ml-2 border border-white/10" 
                  : "bg-white/10 mr-2 border border-white/10"
              }`}>
                {message.role === "user" ? (
                  <User className="h-4 w-4 text-white/80" />
                ) : (
                  <Bot className="h-4 w-4 text-white/80" />
                )}
              </div>
              <div className={`py-3 px-4 rounded-2xl ${
                message.role === "user" 
                  ? "bg-white/5 border border-white/10" 
                  : "bg-black/30 border border-white/10"
              }`}>
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
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask Astra AI about DeFi strategies, market analysis, or trading tips..."
            className="w-full py-4 px-4 bg-transparent border-none pr-24 focus:outline-none text-white placeholder:text-white/40"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0 rounded-full text-white/60 hover:bg-white/10 hover:text-white/80"
            >
              <Zap className="h-4 w-4" />
            </Button>
            <Button 
              size="sm"
              className="h-8 px-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white hover:border-white/20"
              onClick={handleSendMessage}
              disabled={!input.trim()}
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
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

interface Message {
  role: "user" | "system"
  content: string
}

const suggestions = [
  "How does Astra's AI trading work?",
  "Explain the current SOL market conditions",
  "What's the best DeFi strategy for beginners?",
  "How to minimize transaction fees?"
]
