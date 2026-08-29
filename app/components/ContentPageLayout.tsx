"use client"

import { ReactNode } from "react"
import { Navbar } from "@/components/Navbar"

export function ContentPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-[#F8FAFC]">
      <Navbar />
      <main className="container mx-auto px-6 py-16 max-w-4xl">
        {children}
      </main>
    </div>
  )
}
