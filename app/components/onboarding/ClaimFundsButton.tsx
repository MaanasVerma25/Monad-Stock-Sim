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
    })
  }

  if (!mounted || !isConnected) {
    return (
      <Button disabled className="gap-2">
        Connect wallet first
      </Button>
    )
  }

  if (hasClaimed) {
    return (
      <Button variant="secondary" disabled className="gap-2">
        <CheckCircle2 className="h-4 w-4" />
        Funds Claimed
      </Button>
    )
  }

  if (isPending || isConfirming) {
    return (
      <Button disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Claiming...
      </Button>
    )
  }

  if (isSuccess) {
    toast.success("Starter funds claimed!", { description: "100,000 SUSD minted to your wallet" })
    return (
      <Button variant="secondary" disabled className="gap-2">
        <CheckCircle2 className="h-4 w-4" />
        Funds Claimed
      </Button>
    )
  }

  return (
    <Button onClick={handleClaim} className="gap-2 bg-green-600 hover:bg-green-700 font-bold">
      Claim Starter Funds
    </Button>
  )
}