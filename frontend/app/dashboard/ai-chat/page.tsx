"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Send, Bot, User, Zap, ArrowDown, RefreshCw } from "lucide-react"

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
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">AI Assistant</h1>
        <Button variant="outline" size="sm" className="gap-1">
          <RefreshCw className="h-4 w-4" /> New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto bg-card rounded-xl border border-border mb-4 p-4">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`}
          >
            <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                message.role === "user" ? "bg-primary ml-2" : "bg-violet-500/80 mr-2"
              }`}>
                {message.role === "user" ? (
                  <User className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
              <div className={`p-3 rounded-lg ${
                message.role === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-accent"
              }`}>
                <p>{message.content}</p>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="flex flex-row">
              <div className="rounded-full h-8 w-8 flex items-center justify-center bg-violet-500/80 mr-2">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="p-3 rounded-lg bg-accent">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Ask Astra AI about DeFi strategies, market analysis, or trading tips..."
          className="w-full py-3 px-4 bg-card border border-border rounded-lg pr-24 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0 rounded-full"
          >
            <Zap className="h-4 w-4 text-yellow-500" />
          </Button>
          <Button 
            size="sm" 
            className="h-8 px-3"
            onClick={handleSendMessage}
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <SuggestionButton text="How does Astra's AI trading work?" />
        <SuggestionButton text="Explain the current SOL market conditions" />
        <SuggestionButton text="What's the best DeFi strategy for beginners?" />
        <SuggestionButton text="How to minimize transaction fees?" />
      </div>
    </div>
  )
}

interface Message {
  role: "user" | "system"
  content: string
}

function SuggestionButton({ text }: { text: string }) {
  return (
    <button className="bg-accent text-sm py-1 px-3 rounded-full hover:bg-accent/80 transition-colors">
      {text}
    </button>
  )
}
