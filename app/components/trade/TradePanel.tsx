"use client"

import { useState } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { toast } from "sonner"
import { STOCK_AMM_ADDRESS, STOCKS, stockAmmAbi, PLAY_MONEY_ADDRESS, playMoneyAbi } from "@/lib/contracts/contracts"
import { formatUnits, formatPrice } from "@/lib/utils"

interface TradePanelProps {
  stockId: number
  ticker: string
}

export function TradePanel({ stockId, ticker }: TradePanelProps) {
  const { address, isConnected } = useAccount()
  const [cashAmount, setCashAmount] = useState("")
  const [shareAmount, setShareAmount] = useState("")
  const [isBuy, setIsBuy] = useState(true)

  const { data: price } = useReadContract({
    address: STOCK_AMM_ADDRESS,
    abi: stockAmmAbi,
    functionName: "getPrice",
    args: [stockId],
    query: { refetchInterval: 2000 },
  })

  const { data: balance } = useReadContract({
    address: PLAY_MONEY_ADDRESS,
    abi: playMoneyAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, isError, error } = useWaitForTransactionReceipt({ hash })

  const currentPrice = price ? Number(price) / 1e18 : 1
  const estimatedOut = isBuy
    ? Number(cashAmount) / currentPrice
    : Number(shareAmount) * currentPrice

  const handleTrade = async () => {
    if (!address) return

    try {
      if (isBuy) {
        const amountInWei = BigInt(Math.floor(Number(cashAmount) * 1e18))
        if (amountInWei <= 0n) return
        writeContract({
          address: STOCK_AMM_ADDRESS,
          abi: stockAmmAbi,
          functionName: "buy",
          args: [stockId, amountInWei],
        })
      } else {
        const amountInWei = BigInt(Math.floor(Number(shareAmount) * 1e18))
        if (amountInWei <= 0n) return
        writeContract({
          address: STOCK_AMM_ADDRESS,
          abi: stockAmmAbi,
          functionName: "sell",
          args: [stockId, amountInWei],
        })
      }
    } catch (e) {
      toast.error("Trade failed", { description: (e as Error).message })
    }
  }

  const isTradePending = isPending || isConfirming

  if (isSuccess) {
    toast.success("Trade confirmed!", { description: `Trade executed on Monad testnet` })
  }

  if (isError) {
    toast.error("Trade failed", { description: error?.message || "Unknown error" })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {ticker} Trade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={isBuy ? "default" : "outline"}
            onClick={() => setIsBuy(true)}
            className="flex-1"
          >
            <ArrowUpRight className="h-4 w-4 mr-1" />
            Buy
          </Button>
          <Button
            variant={!isBuy ? "default" : "outline"}
            onClick={() => setIsBuy(false)}
            className="flex-1"
          >
            <ArrowDownRight className="h-4 w-4 mr-1" />
            Sell
          </Button>
        </div>

        <Separator />

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {isBuy ? "SUSD Amount" : "Share Amount"}
          </label>
          <Input
            type="number"
            step="0.0001"
            value={isBuy ? cashAmount : shareAmount}
            onChange={(e) => isBuy ? setCashAmount(e.target.value) : setShareAmount(e.target.value)}
            placeholder={isBuy ? "Enter SUSD amount" : "Enter share amount"}
            disabled={isTradePending || !isConnected}
          />
        </div>

        {price && (
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Current Price: <span className="font-mono">{formatPrice(price)} SUSD</span></div>
            <div>
              Estimated Out:{" "}
              <span className="font-mono font-medium text-foreground">
                {isBuy ? estimatedOut.toFixed(6) : estimatedOut.toFixed(2)}
                {isBuy ? " shares" : " SUSD"}
              </span>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          Balance: {balance ? `${formatUnits(balance)} SUSD` : "Loading..."}
        </div>

        <Button
          onClick={handleTrade}
          disabled={isTradePending || !isConnected || !price || (isBuy && (!cashAmount || Number(cashAmount) <= 0)) || (!isBuy && (!shareAmount || Number(shareAmount) <= 0))}
          className="w-full"
        >
          {isTradePending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Confirming...
            </>
          ) : (
            isBuy ? "Buy" : "Sell"
          )}
        </Button>

        {!isConnected && (
          <p className="text-sm text-center text-muted-foreground">
            Connect wallet to trade
          </p>
        )}
      </CardContent>
    </Card>
  )
}