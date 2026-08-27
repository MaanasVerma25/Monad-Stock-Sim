"use client"

import { useAccount } from "wagmi"
import { ConnectButton } from "@/components/wallet/ConnectButton"
import { ClaimFundsButton } from "@/components/onboarding/ClaimFundsButton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Wallet, Zap, CheckCircle2, ArrowRight } from "lucide-react"

export default function OnboardingPage() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Monad Market Sim</span>
          </Link>
          <ConnectButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-12">
          <Zap className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Get Started</h1>
          <p className="text-xl text-muted-foreground">
            Claim your starter funds and start trading synthetic stocks on Monad testnet
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Step 1: Connect Wallet
            </CardTitle>
            <CardDescription>
              Connect your MetaMask wallet to Monad testnet (Chain ID: 10143)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConnectButton />
            {isConnected && (
              <div className="mt-4 flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span>Wallet connected to Monad testnet</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Step 2: Claim Starter Funds
            </CardTitle>
            <CardDescription>
              Receive 100,000 SUSD (SimUSD) to start trading. One-time claim per address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClaimFundsButton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Step 3: Start Trading
            </CardTitle>
            <CardDescription>
              Head to the dashboard to view live charts and trade 5 synthetic stocks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button className="w-full" size="lg">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p className="font-medium mb-2">Network Details:</p>
          <ul className="space-y-1 text-left">
            <li>Network: Monad Testnet</li>
            <li>Chain ID: 10143</li>
            <li>RPC: https://10143.rpc.thirdweb.com/...</li>
            <li>Currency: SUSD (SimUSD)</li>
          </ul>
        </div>
      </main>
    </div>
  )
}