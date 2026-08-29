"use client"

import { Navbar } from "@/components/Navbar"
import { ConnectButton } from "@/components/wallet/ConnectButton"
import { Portfolio } from "@/components/portfolio/Portfolio"
import { Card, CardContent } from "@/components/ui/card"
import { useAccount } from "wagmi"

export default function PortfolioPage() {
  const { isConnected } = useAccount()

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden">
      {/* Full-Bleed Background Image */}
      <div 
        className="fixed inset-0 w-full h-full z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url('/portfolio-bg.jpg')" }}
      >
        {/* Light Scrim Overlay */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Main Portfolio Content Layer */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-slate-100 mb-3">
              Portfolio & Asset Management
            </h1>
            <p className="text-slate-300 text-base font-medium">
              Comprehensive overview of your stock positions and liquid MON cash reserves across real equities.
            </p>
          </div>

          {!isConnected && (
            <Card className="mb-8 bg-black/40 backdrop-blur-sm border border-white/10 p-8 rounded-2xl shadow-2xl">
              <CardContent className="p-0 text-center space-y-4">
                <p className="font-serif text-lg font-bold text-slate-200">Connect your wallet to view your active portfolio</p>
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              </CardContent>
            </Card>
          )}

          <Portfolio />
        </main>
      </div>
    </div>
  )
}