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
        <DashboardSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className={cn(
          "flex-1 transition-all duration-300 min-h-screen",
          sidebarOpen ? "ml-64" : "ml-16"
        )}>
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
