"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className={cn(
        "flex-1 overflow-auto transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-16"
      )}>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
