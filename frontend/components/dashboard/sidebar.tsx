"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  ChevronLeft, 
  BarChart2, 
  MessageSquare, 
  ArrowLeftRight, 
  Wallet, 
  Settings, 
  Home,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface DashboardSidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function DashboardSidebar({ open, setOpen }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [hovered, setHovered] = useState<string | null>(null)
  
  const routes = [
    {
      label: "Home",
      icon: Home,
      href: "/dashboard",
      color: "from-blue-500 to-purple-500"
    },
    {
      label: "AI Chat",
      icon: MessageSquare,
      href: "/dashboard/ai-chat",
      color: "from-violet-500 to-indigo-600"
    },
    {
      label: "Swap",
      icon: ArrowLeftRight,
      href: "/dashboard/swap",
      color: "from-pink-500 to-rose-600"
    },
    {
      label: "Portfolio",
      icon: BarChart2,
      href: "/dashboard/portfolio",
      color: "from-amber-400 to-orange-600"
    },
    {
      label: "Wallet",
      icon: Wallet,
      href: "/dashboard/wallet",
      color: "from-emerald-400 to-green-600"
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      color: "from-slate-400 to-slate-600"
    }
  ]

  return (
    <div className={cn(
      "fixed h-full backdrop-blur-md bg-background/30 border-r border-white/10 transition-all duration-300 z-20",
      open ? "w-64" : "w-16"
    )}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className={cn("flex items-center", !open && "hidden")}>
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">Astra</span>
            </div>
          </div>
          <button 
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", !open && "rotate-180")} />
          </button>
        </div>
        
        <div className="flex-1 py-6 overflow-y-auto scrollbar-hide">
          <nav className="px-2 space-y-1.5">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onMouseEnter={() => setHovered(route.href)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "relative flex items-center px-3 py-3 text-sm rounded-lg transition-all duration-200",
                  pathname === route.href
                    ? "bg-white/10 text-white font-medium" 
                    : "hover:bg-white/5 text-white/80 hover:text-white",
                  !open && "justify-center"
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 rounded-lg opacity-0 transition-opacity",
                    (pathname === route.href || hovered === route.href) && "opacity-10 bg-gradient-to-r", 
                    route.color
                  )}
                />
                <route.icon className={cn(
                  "h-5 w-5 z-10",
                  pathname === route.href && "text-white"
                )} />
                {open && (
                  <span className={cn(
                    "ml-3 z-10 transition-colors",
                    pathname === route.href ? "bg-gradient-to-r text-transparent bg-clip-text" : "",
                    route.color
                  )}>
                    {route.label}
                  </span>
                )}
                {pathname === route.href && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-gradient-to-b from-purple-500 to-blue-500 rounded-r-full" />
                )}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-white/10">
          <div className={cn(
            "flex items-center px-3 py-3 text-sm text-white/70 rounded-lg transition-all duration-200 hover:bg-white/5", 
            !open && "justify-center"
          )}>
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
              <span className="text-xs font-medium text-white">AS</span>
            </div>
            {open && <span className="ml-3">Astra User</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
