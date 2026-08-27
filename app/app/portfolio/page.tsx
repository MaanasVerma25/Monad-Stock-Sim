"use client"

import { Navbar } from "@/components/Navbar"
import { ConnectButton } from "@/components/wallet/ConnectButton"
import { Portfolio } from "@/components/portfolio/Portfolio"
import { Card, CardContent } from "@/components/ui/card"
import { useAccount } from "wagmi"

export default function PortfolioPage() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
          <p className="text-muted-foreground">
            View your holdings, cash balance, and live market valuations across real equities.
          </p>
        </div>

        {!isConnected && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="py-6 text-center">
              <p className="font-medium">Connect your wallet to view your portfolio</p>
              <ConnectButton className="mt-4 mx-auto" />
            </CardContent>
          </Card>
        )}

        <Portfolio />
      </main>
    </div>
  )
}