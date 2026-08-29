"use client"

import { Button } from "@/components/ui/button"
import { Fuel, ExternalLink } from "lucide-react"

export function ClaimFundsButton() {
  return (
    <a
      href="https://faucet.monad.xyz"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:opacity-90 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md font-mono text-sm"
    >
      <Fuel className="h-4 w-4 text-white" />
      Get Native MON at Monad Faucet <ExternalLink className="h-4 w-4" />
    </a>
  )
}