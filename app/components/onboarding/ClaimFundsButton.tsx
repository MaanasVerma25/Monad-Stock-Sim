"use client"

import { useEffect, useState } from "react"
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { PLAY_MONEY_ADDRESS, playMoneyAbi } from "@/lib/contracts/contracts"

export function ClaimFundsButton() {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: hasClaimed } = useReadContract({
    address: PLAY_MONEY_ADDRESS,
    abi: [
      {
        inputs: [{ name: "", type: "address" }],
        name: "hasClaimed",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "view",
        type: "function"
      }
    ] as const,
    functionName: "hasClaimed",
    args: address ? [address] : undefined,
    query: { enabled: !!address && mounted },
  })

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const handleClaim = () => {
    if (!address) return
    writeContract({
      address: PLAY_MONEY_ADDRESS,
      abi: playMoneyAbi,
      functionName: "claimStarterFunds",
      gas: 100000n,
    })
  }

  if (!mounted || !isConnected) {
    return (
      <Button disabled variant="secondary" className="gap-2 bg-black/60 text-[#9a9a9a] border border-white/10 opacity-50">
        Connect Wallet First
      </Button>
    )
  }

  if (hasClaimed) {
    return (
      <Button variant="secondary" disabled className="gap-2 bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-mono">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        100,000 MON Claimed
      </Button>
    )
  }

  if (isPending || isConfirming) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button disabled className="gap-2 bg-white/10 text-white border border-white/20">
          <Loader2 className="h-4 w-4 animate-spin text-white" />
          {isPending ? "Submitting to Monad..." : "Confirming (~800ms finality)..."}
        </Button>
        <span className="text-xs text-[#9a9a9a] font-mono">
          Monad confirms in ~800ms — balance usable after ~1.2s (3-block async execution)
        </span>
      </div>
    )
  }

  if (isSuccess) {
    toast.success("Starter funds claimed!", { description: "100,000 MON minted to your wallet. Finalized on Monad in ~800ms." })
    return (
      <Button variant="secondary" disabled className="gap-2 bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-mono">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        100,000 MON Claimed
      </Button>
    )
  }

  return (
    <Button onClick={handleClaim} className="gap-2 bg-gradient-to-b from-white via-zinc-200 to-zinc-400 text-black font-medium border border-white shadow-lg shadow-white/10 hover:opacity-90 transition-opacity px-6 py-3">
      Claim 100,000 MON
    </Button>
  )
}