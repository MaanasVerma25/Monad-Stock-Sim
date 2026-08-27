"use client"

import { useState } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowUpRight, ArrowDownRight, Anchor } from "lucide-react"
import { toast } from "sonner"
import { STOCK_AMM_ADDRESS, stockAmmAbi, PLAY_MONEY_ADDRESS, playMoneyAbi } from "@/lib/contracts/contracts"
import { formatUnits } from "@/lib/utils"

interface TradePanelProps {
  stockId: number
  ticker: string
  name?: string
  defaultBasePrice?: number
}

export function TradePanel({ stockId, ticker, name, defaultBasePrice }: TradePanelProps) {
  const { address, isConnected } = useAccount()
  const [cashAmount, setCashAmount] = useState("")
  const [shareAmount, setShareAmount] = useState("")
  const [isBuy, setIsBuy] = useState(true)

  const { data: stockData } = useReadContract({
    address: STOCK_AMM_ADDRESS,
    abi: stockAmmAbi,
    functionName: "getStock",
    args: [BigInt(stockId)],
    query: { refetchInterval: 2000 },
  })

  const { data: spotPrice } = useReadContract({
    address: STOCK_AMM_ADDRESS,
    abi: stockAmmAbi,
    functionName: "getPrice",
    args: [BigInt(stockId)],
    query: { refetchInterval: 2000 },
  })

  const { data: balance } = useReadContract({
    address: PLAY_MONEY_ADDRESS,
    abi: playMoneyAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: allowance } = useReadContract({
    address: PLAY_MONEY_ADDRESS,
    abi: playMoneyAbi,
    functionName: "allowance",
    args: address ? [address, STOCK_AMM_ADDRESS] : undefined,
    query: { enabled: !!address },
  })

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, isError, error } = useWaitForTransactionReceipt({ hash })

  const currentPrice = spotPrice ? Number(spotPrice) / 1e18 : (defaultBasePrice || 100)
  const basePrice = stockData?.[4] ? Number(stockData[4]) / 1e18 : (defaultBasePrice || 100)
  const displayName = stockData?.[1] || name || ""

  const estimatedOut = isBuy
    ? Number(cashAmount) / currentPrice
    : Number(shareAmount) * currentPrice

  const handleTrade = async () => {
    if (!address) return

    try {
      if (isBuy) {
        const amountInWei = BigInt(Math.floor(Number(cashAmount) * 1e18))
        if (amountInWei <= 0n) return

        // Check allowance
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
    toast.success("Transaction confirmed!", { description: `Executed on Monad testnet` })
  }

  if (isError) {
    toast.error("Transaction failed", { description: error?.message || "Unknown error" })
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">{ticker}</CardTitle>
            {displayName && <p className="text-xs text-muted-foreground">{displayName}</p>}
          </div>
          <div className="text-right">
            <div className="font-extrabold text-lg">${currentPrice.toFixed(2)} SUSD</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Anchor className="h-3 w-3 text-primary" />
              24h Anchor: ${basePrice.toFixed(2)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={isBuy ? "default" : "outline"}
            onClick={() => setIsBuy(true)}
            className="flex-1"
          >
            <ArrowUpRight className="h-4 w-4 mr-1" />
            Buy {ticker}
          </Button>
          <Button
            variant={!isBuy ? "default" : "outline"}
            onClick={() => setIsBuy(false)}
            className="flex-1"
          >
            <ArrowDownRight className="h-4 w-4 mr-1" />
            Sell {ticker}
          </Button>
        </div>

        <Separator />

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {isBuy ? "SUSD Amount to Spend" : "Shares to Sell"}
          </label>
          <Input
            type="number"
            step="0.0001"
            value={isBuy ? cashAmount : shareAmount}
            onChange={(e) => isBuy ? setCashAmount(e.target.value) : setShareAmount(e.target.value)}
            placeholder={isBuy ? "e.g. 500 SUSD" : "e.g. 2.5 shares"}
            disabled={isTradePending || !isConnected}
          />
        </div>

        <div className="text-sm text-muted-foreground space-y-1 bg-muted/40 p-3 rounded-md">
          <div className="flex justify-between">
            <span>Estimated Output:</span>
            <span className="font-mono font-bold text-foreground">
              {isBuy ? `${estimatedOut.toFixed(4)} shares` : `$${estimatedOut.toFixed(2)} SUSD`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>SUSD Cash Balance:</span>
            <span className="font-mono text-foreground">
              {balance ? `${formatUnits(balance)} SUSD` : "Loading..."}
            </span>
          </div>
        </div>

        <Button
          onClick={handleTrade}
          disabled={isTradePending || !isConnected || (isBuy && (!cashAmount || Number(cashAmount) <= 0)) || (!isBuy && (!shareAmount || Number(shareAmount) <= 0))}
          className="w-full font-bold"
        >
          {isTradePending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Confirming on Monad...
            </>
          ) : (
            isBuy ? `Buy ${ticker}` : `Sell ${ticker}`
          )}
        </Button>

        {!isConnected && (
          <p className="text-xs text-center text-muted-foreground">
            Connect wallet to trade
          </p>
        )}
      </CardContent>
    </Card>
  )
}