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
  Home
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardSidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function DashboardSidebar({ open, setOpen }: DashboardSidebarProps) {
  const pathname = usePathname()
  
  const routes = [
    {
      label: "Home",
      icon: Home,
      href: "/dashboard",
      color: "text-sky-500"
    },
    {
      label: "AI Chat",
      icon: MessageSquare,
      href: "/dashboard/ai-chat",
      color: "text-violet-500"
    },
    {
      label: "Swap",
      icon: ArrowLeftRight,
      href: "/dashboard/swap",
      color: "text-pink-500"
    },
    {
      label: "Portfolio",
      icon: BarChart2,
      href: "/dashboard/portfolio",
      color: "text-orange-500"
    },
    {
      label: "Wallet",
      icon: Wallet,
      href: "/dashboard/wallet",
      color: "text-green-500"
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      color: "text-gray-500"
    }
  ]

  return (
    <div className={cn(
      "fixed h-full bg-card border-r border-border transition-all duration-300 z-10",
      open ? "w-64" : "w-16"
    )}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className={cn("flex items-center", !open && "hidden")}>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">Astra DeFi</span>
          </div>
          <button 
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-accent"
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", !open && "rotate-180")} />
          </button>
        </div>
        
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="px-2 space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center px-3 py-3 text-sm rounded-lg transition-colors",
                  pathname === route.href
                    ? "bg-accent text-accent-foreground font-medium"
                    : "hover:bg-accent hover:text-accent-foreground",
                  !open && "justify-center"
                )}
              >
                <route.icon className={cn("h-5 w-5", route.color)} />
                {open && <span className="ml-3">{route.label}</span>}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-border">
          <div className={cn(
            "flex items-center px-3 py-3 text-sm text-muted-foreground rounded-lg", 
            !open && "justify-center"
          )}>
            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
              <span className="text-xs font-medium">AS</span>
            </div>
            {open && <span className="ml-3">Astra User</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
