"use client"

import { useEffect, useState } from "react"
import { useAccount, useConnect, useDisconnect, useBalance, useChainId, useSwitchChain } from "wagmi"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut, AlertTriangle, Fuel, RefreshCw } from "lucide-react"
import { shortenAddress } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function ConnectButton({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const { connectAsync, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const isWrongNetwork = isConnected && chainId !== 10143

  useEffect(() => {
    setMounted(true)
  }, [])

  // Native MON balance from MetaMask wallet
  const { data: nativeBalance } = useBalance({
    address: address,
    query: { enabled: !!address && mounted && chainId === 10143, refetchInterval: 3000 },
  })

  const nativeMonBalance = nativeBalance ? Number(nativeBalance.formatted) : 0
  const isBelowReserve = nativeMonBalance > 0 && nativeMonBalance < 10

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

  // Render a static fallback during SSR / before hydration
  if (!mounted) {
    return (
      <button
        className={`inline-flex items-center gap-2 border border-white/20 bg-gradient-to-r from-[#050505] via-[#2a2a2a] to-[#4a4a4a] text-white px-4 py-2 rounded-md text-sm font-medium opacity-50 cursor-not-allowed ${className || ""}`}
        disabled
      >
        <Wallet className="h-4 w-4 text-white" />
        Connect Wallet
      </button>
    )
  }

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        className={`gap-2 border border-white/20 bg-gradient-to-r from-[#050505] via-[#2a2a2a] to-[#4a4a4a] text-white hover:border-white/40 px-4 py-2 text-sm font-medium shadow-inner ${className || ""}`}
      >
        <Wallet className="h-4 w-4 text-white" />
        Connect Wallet
      </Button>
    )
  }

  if (isWrongNetwork) {
    return (
      <div className={`flex items-center gap-2 ${className || ""}`}>
        <Button
          onClick={() => switchChain?.({ chainId: 10143 })}
          className="gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 text-xs font-mono border border-amber-400 animate-pulse"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Switch to Monad Testnet (10143)
        </Button>
        <Button variant="ghost" size="sm" onClick={() => disconnect()} className="text-[#9a9a9a] hover:text-white hover:bg-white/10">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 ${className || ""}`}>
      <div className="flex items-center gap-3 px-4 py-2 bg-black/80 border border-white/15 backdrop-blur-sm rounded-lg">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-emerald-400" />
          <span className="font-mono text-sm font-semibold text-white">{address ? shortenAddress(address) : ""}</span>
        </div>
        {nativeBalance && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border flex items-center gap-1.5 ${
                isBelowReserve
                  ? "bg-amber-950/40 text-amber-400 border-amber-500/30"
                  : "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
              }`}>
                {isBelowReserve ? <AlertTriangle className="h-3.5 w-3.5 inline" /> : <Fuel className="h-3.5 w-3.5 inline" />}
                {Number(nativeBalance.formatted).toFixed(4)} MON
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-black border border-white/20 text-white max-w-xs p-3">
              {isBelowReserve ? (
                <p className="text-xs">
                  ⚠️ Below 10 MON reserve floor. Monad enforces a 10 MON floor per EOA — low-balance accounts are throttled to 1 tx per ~1.2s.
                </p>
              ) : (
                <p className="text-xs">
                  Native MON balance for gas fees & trading. Monad charges gas on gas_limit (not gas used).
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={() => disconnect()} className="text-[#9a9a9a] hover:text-white hover:bg-white/10">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}