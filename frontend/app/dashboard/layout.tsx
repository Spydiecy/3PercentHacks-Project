"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Enhanced background with subtle elegant effects */}
      <div
        aria-hidden
        className="z-[1] fixed inset-0 pointer-events-none isolate opacity-5">
        <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,100%,.08)_0,hsla(0,0%,100%,.02)_50%,hsla(0,0%,100%,0)_80%)]" />
        <div className="h-[80rem] absolute right-0 top-0 w-56 rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,100%,.06)_0,hsla(0,0%,100%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
      </div>
      
      {/* Refined grid background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      
      {/* Main layout with improved transitions */}
      <div className="flex">
        <DashboardSidebar open={sidebarOpen} setOpen={setSidebarOpen} />          <div className={cn(
          "flex-1 transition-all duration-300 min-h-screen",
          sidebarOpen ? "ml-64" : "ml-16"
        )}>
          <div className="sticky top-0 z-10 backdrop-blur-sm bg-black/30 border-b border-white/10 py-4 px-12">
            <div className="flex justify-end">
              <button className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 transition-colors border border-white/10 hover:border-white/20">
                <svg width="20" height="20" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="128" height="128" rx="64" fill="black"/>
                  <path d="M110.584 64.9142H99.142C99.142 41.8335 80.214 23 57.0217 23C34.5998 23 15.9312 40.7293 14.9508 62.7842C13.9223 86.2976 32.8698 106 56.4192 106H61.7804C82.8822 106 101.218 91.1804 105.127 70.8962H110.584C112.368 70.8962 113.834 69.4349 113.834 67.6552V68.0119C113.834 66.2321 112.368 64.9142 110.584 64.9142Z" fill="url(#paint0_linear_632_31)"/>
                  <path d="M25.0469 63.6181C25.0469 63.0879 25.1883 62.6009 25.3296 62.1137C28.182 50.5683 38.7944 41.9428 51.4757 41.9428C66.2552 41.9428 78.2296 53.8716 78.2296 68.5922C78.2296 83.3128 66.2552 95.2416 51.4757 95.2416C38.7944 95.2416 28.182 86.6162 25.3296 75.0707C25.1883 74.5836 25.0469 74.0965 25.0469 73.5663V63.6181Z" fill="url(#paint1_linear_632_31)"/>
                  <path d="M80.5599 64.9142H99.142V70.8962H80.5599C79.4842 70.8962 78.5503 70.0973 78.5503 68.9054V66.905C78.5503 65.8565 79.4842 64.9142 80.5599 64.9142Z" fill="url(#paint2_linear_632_31)"/>
                  <defs>
                    <linearGradient id="paint0_linear_632_31" x1="64.0296" y1="23" x2="64.0296" y2="106" gradientUnits="userSpaceOnUse">
                      <stop stop-color="white"/>
                      <stop offset="1" stop-color="white" stop-opacity="0.7"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear_632_31" x1="51.6382" y1="41.9428" x2="51.6382" y2="95.2416" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#534BB1"/>
                      <stop offset="1" stop-color="#551BF9"/>
                    </linearGradient>
                    <linearGradient id="paint2_linear_632_31" x1="88.8461" y1="64.9142" x2="88.8461" y2="70.8962" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#534BB1"/>
                      <stop offset="1" stop-color="#551BF9"/>
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-white font-medium">Connect Wallet</span>
              </button>
            </div>
          </div>
          <main className="py-10 px-12 max-w-[1400px] mx-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Enhanced bottom gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
    </div>
  )
}
