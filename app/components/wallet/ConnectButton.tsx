"use client"

import { useEffect, useState } from "react"
import { useAccount, useConnect, useDisconnect, useReadContract } from "wagmi"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut } from "lucide-react"
import { formatUnits, shortenAddress } from "@/lib/utils"
import { PLAY_MONEY_ADDRESS, playMoneyAbi } from "@/lib/contracts/contracts"

export function ConnectButton({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const { connectAsync, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: balance } = useReadContract({
    address: PLAY_MONEY_ADDRESS,
    abi: playMoneyAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && mounted },
  })

  const handleConnect = async () => {
    try {
      const connector = connectors.find((c) => c.id === "metaMask" || c.id === "injected") || connectors[0]
      if (connector) {
        await connectAsync({ connector })
      }
    } catch (e) {
      console.error("Connect error:", e)
    }
  }

  if (!mounted) {
    return (
      <Button className={`gap-2 ${className || ""}`} variant="outline">
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    )
  }

  if (!isConnected) {
    return (
      <Button onClick={handleConnect} className={`gap-2 ${className || ""}`}>
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <div className={`flex items-center gap-3 ${className || ""}`}>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-md">
        <Wallet className="h-4 w-4 text-primary" />
        <span className="font-mono text-sm">{shortenAddress(address)}</span>
      </div>
      {balance && (
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {formatUnits(balance)} SUSD
        </span>
      )}
      <Button variant="ghost" size="sm" onClick={() => disconnect()}>
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}