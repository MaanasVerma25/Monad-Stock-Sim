"use client"

import { useState } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Loader2, ArrowUpRight, ArrowDownRight, Anchor, TrendingUp, TrendingDown } from "lucide-react"
import { toast } from "sonner"
import { STOCK_AMM_ADDRESS, stockAmmAbi, PLAY_MONEY_ADDRESS, playMoneyAbi } from "@/lib/contracts/contracts"
import { formatUnits } from "@/lib/utils"

interface TradeModalProps {
  stockId: number
  ticker: string
  name: string
  basePrice: number
  currentPrice: number
  percentChange: number
  isOpen: boolean
  onClose: () => void
}

export function TradeModal({
  stockId,
  ticker,
  name,
  basePrice,
  currentPrice,
  percentChange,
  isOpen,
  onClose,
}: TradeModalProps) {
  const { address, isConnected } = useAccount()
  const [cashAmount, setCashAmount] = useState("")
  const [shareAmount, setShareAmount] = useState("")
  const [isBuy, setIsBuy] = useState(true)

  const { data: balance } = useReadContract({
    address: PLAY_MONEY_ADDRESS,
    abi: playMoneyAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && isOpen },
  })

  const { data: allowance } = useReadContract({
    address: PLAY_MONEY_ADDRESS,
    abi: playMoneyAbi,
    functionName: "allowance",
    args: address ? [address, STOCK_AMM_ADDRESS] : undefined,
    query: { enabled: !!address && isOpen },
  })

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, isError, error } = useWaitForTransactionReceipt({ hash })

  if (!isOpen) return null

  const isPositive = percentChange >= 0
  const estimatedOut = isBuy
    ? (Number(cashAmount) || 0) / (currentPrice || 1)
    : (Number(shareAmount) || 0) * (currentPrice || 1)

  const handleTrade = async () => {
    if (!address) return

    try {
      if (isBuy) {
        const amountInWei = BigInt(Math.floor(Number(cashAmount) * 1e18))
        if (amountInWei <= 0n) return

        if (!allowance || allowance < amountInWei) {
          toast.info("Approving SUSD transfer...")
          writeContract({
            address: PLAY_MONEY_ADDRESS,
            abi: playMoneyAbi,
            functionName: "approve",
            args: [STOCK_AMM_ADDRESS, BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")],
          })
          return
        }

        writeContract({
          address: STOCK_AMM_ADDRESS,
          abi: stockAmmAbi,
          functionName: "buy",
          args: [BigInt(stockId), amountInWei],
        })
      } else {
        const amountInWei = BigInt(Math.floor(Number(shareAmount) * 1e18))
        if (amountInWei <= 0n) return

        writeContract({
          address: STOCK_AMM_ADDRESS,
          abi: stockAmmAbi,
          functionName: "sell",
          args: [BigInt(stockId), amountInWei],
        })
      }
    } catch (e) {
      toast.error("Trade failed", { description: (e as Error).message })
    }
  }

  const isTradePending = isPending || isConfirming

  if (isSuccess) {
    toast.success("Transaction confirmed!", { description: `Executed trade on Monad testnet` })
  }

  if (isError) {
    toast.error("Transaction failed", { description: error?.message || "Unknown error" })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div
        className="relative w-full max-w-md bg-card border rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold">{ticker}</h2>
              <Badge variant={isPositive ? "default" : "destructive"} className="gap-1 font-mono text-xs">
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isPositive ? "+" : ""}{percentChange.toFixed(2)}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{name}</p>
          </div>

          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Pricing Info */}
        <div className="bg-muted/40 p-3 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground">Bonding Spot Price</span>
            <div className="text-xl font-black">${currentPrice.toFixed(2)} SUSD</div>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Anchor className="h-3 w-3 text-primary" /> 24h Anchor
            </span>
            <div className="text-sm font-semibold">${basePrice.toFixed(2)}</div>
          </div>
        </div>

        {/* Buy / Sell Tabs */}
        <div className="flex gap-2">
          <Button
            variant={isBuy ? "default" : "outline"}
            onClick={() => setIsBuy(true)}
            className="flex-1 font-bold"
          >
            <ArrowUpRight className="h-4 w-4 mr-1" /> Buy {ticker}
          </Button>
          <Button
            variant={!isBuy ? "default" : "outline"}
            onClick={() => setIsBuy(false)}
            className="flex-1 font-bold"
          >
            <ArrowDownRight className="h-4 w-4 mr-1" /> Sell {ticker}
          </Button>
        </div>

        <Separator />

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {isBuy ? "SUSD Amount to Spend" : "Shares to Sell"}
          </label>
          <Input
            type="number"
            step="0.0001"
            value={isBuy ? cashAmount : shareAmount}
            onChange={(e) => isBuy ? setCashAmount(e.target.value) : setShareAmount(e.target.value)}
            placeholder={isBuy ? "e.g. 500 SUSD" : "e.g. 2.5 shares"}
            disabled={isTradePending || !isConnected}
            className="text-base py-5 font-mono"
          />
        </div>

        {/* Estimates & Balance */}
        <div className="text-xs text-muted-foreground space-y-1.5 bg-muted/30 p-3 rounded-xl">
          <div className="flex justify-between">
            <span>Estimated Received:</span>
            <span className="font-mono font-bold text-foreground">
              {isBuy ? `${estimatedOut.toFixed(4)} shares` : `$${estimatedOut.toFixed(2)} SUSD`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Your SUSD Balance:</span>
            <span className="font-mono text-foreground">
              {balance ? `${formatUnits(balance)} SUSD` : "Loading..."}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleTrade}
          disabled={
            isTradePending ||
            !isConnected ||
            (isBuy && (!cashAmount || Number(cashAmount) <= 0)) ||
            (!isBuy && (!shareAmount || Number(shareAmount) <= 0))
          }
          className="w-full py-6 text-base font-bold shadow-lg"
        >
          {isTradePending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Confirming on Monad...
            </>
          ) : (
            isBuy ? `Execute Buy (${ticker})` : `Execute Sell (${ticker})`
          )}
        </Button>

        {!isConnected && (
          <p className="text-xs text-center text-muted-foreground">
            Connect wallet to trade
          </p>
        )}
      </div>
    </div>
  )
}
