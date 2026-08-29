"use client"

import { useState } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowUpRight, ArrowDownRight, Anchor, Fuel, ExternalLink } from "lucide-react"
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
    query: { enabled: !!address, refetchInterval: 2000 },
  })

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, isError, error } = useWaitForTransactionReceipt({ hash })

  const currentPrice = spotPrice ? Number(spotPrice) / 1e18 : (defaultBasePrice || 100)
  const basePrice = stockData?.[4] ? Number(stockData[4]) / 1e18 : (defaultBasePrice || 100)
  const displayName = stockData?.[1] || name || ""

  const estimatedOut = isBuy
    ? Number(cashAmount || 0) / currentPrice
    : Number(shareAmount || 0) * currentPrice

  const requiredWei = isBuy && cashAmount ? BigInt(Math.floor(Number(cashAmount) * 1e18)) : BigInt(0)
  const currentAllowance = typeof allowance === "bigint" ? allowance : BigInt(0)
  const needsApproval = isBuy && requiredWei > BigInt(0) && currentAllowance < requiredWei

  const handlePercentageSelect = (pct: number) => {
    if (!balance || !isBuy) return
    const maxBalance = Number(balance) / 1e18
    const selected = (maxBalance * pct).toFixed(4)
    setCashAmount(selected)
  }

  const handleApprove = async () => {
    if (!address || !cashAmount) return
    try {
      const amountInWei = BigInt(Math.floor(Number(cashAmount) * 1e18))
      writeContract({
        address: PLAY_MONEY_ADDRESS,
        abi: playMoneyAbi,
        functionName: "approve",
        args: [STOCK_AMM_ADDRESS, amountInWei * BigInt(100)],
        gas: 60000n,
      })
    } catch (e) {
      toast.error("Approval failed", { description: (e as Error).message })
    }
  }

  const handleTrade = async () => {
    if (!address) return

    try {
      if (isBuy) {
        const amountInWei = BigInt(Math.floor(Number(cashAmount) * 1e18))
        if (amountInWei <= BigInt(0)) return

        if (!allowance || allowance < amountInWei) {
          toast.info("Approving MON transfer...")
          writeContract({
            address: PLAY_MONEY_ADDRESS,
            abi: playMoneyAbi,
            functionName: "approve",
            args: [STOCK_AMM_ADDRESS, BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")],
            gas: 60000n,
          })
          return
        }

        writeContract({
          address: STOCK_AMM_ADDRESS,
          abi: stockAmmAbi,
          functionName: "buy",
          args: [BigInt(stockId), amountInWei],
          gas: 150000n,
        })
      } else {
        const amountInWei = BigInt(Math.floor(Number(shareAmount) * 1e18))
        if (amountInWei <= BigInt(0)) return

        writeContract({
          address: STOCK_AMM_ADDRESS,
          abi: stockAmmAbi,
          functionName: "sell",
          args: [BigInt(stockId), amountInWei],
          gas: 150000n,
        })
      }
    } catch (e) {
      toast.error("Trade failed", { description: (e as Error).message })
    }
  }

  const isTradePending = isPending || isConfirming

  if (isSuccess) {
    toast.success("Order Executed!", {
      description: `Trade finalized on Monad in ~800ms.`,
      action: hash ? {
        label: "View Tx",
        onClick: () => window.open(`https://testnet.monadscan.com/tx/${hash}`, "_blank"),
      } : undefined,
    })
  }

  if (isError) {
    toast.error("Execution Reverted", { description: error?.message || "Contract transaction failed" })
  }

  return (
    <Card className="w-full bg-black/80 backdrop-blur-sm border border-white/10 p-6 md:p-8 rounded-xl shadow-md">
      <CardHeader className="p-0 mb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-2xl font-bold text-white flex items-center gap-2">
            <span>{ticker}</span>
            {displayName && <span className="text-xs text-[#9a9a9a] font-normal">{displayName}</span>}
          </CardTitle>
          <div className="text-right">
            <span className="text-xs font-mono text-white font-semibold px-2.5 py-1 rounded bg-black border border-white/10 block">
              Spot: ${currentPrice.toFixed(2)}
            </span>
            <span className="text-[11px] text-[#9a9a9a] font-mono flex items-center justify-end gap-1 mt-1">
              <Anchor className="h-3 w-3 text-white" /> Anchor: ${basePrice.toFixed(2)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-6">
        {/* Buy / Sell Toggle Buttons */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-black rounded-lg border border-white/10">
          <button
            type="button"
            onClick={() => setIsBuy(true)}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all ${
              isBuy
                ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md"
                : "text-[#9a9a9a] hover:text-white"
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
            Buy {ticker}
          </button>
          <button
            type="button"
            onClick={() => setIsBuy(false)}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all ${
              !isBuy
                ? "bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md"
                : "text-[#9a9a9a] hover:text-white"
            }`}
          >
            <ArrowDownRight className="h-4 w-4" />
            Sell {ticker}
          </button>
        </div>

        {/* Input Amount Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <label className="font-medium text-white">
              {isBuy ? "MON Order Value" : "Shares Quantity"}
            </label>
            <span className="font-mono text-xs text-[#9a9a9a]">
              Available: {typeof balance === "bigint" ? `${formatUnits(balance)} MON` : "0.0000 MON"}
            </span>
          </div>
          <Input
            type="number"
            step="0.0001"
            value={isBuy ? cashAmount : shareAmount}
            onChange={(e) => isBuy ? setCashAmount(e.target.value) : setShareAmount(e.target.value)}
            placeholder={isBuy ? "0.00 MON" : "0.0000 Shares"}
            disabled={isTradePending || !isConnected}
            className="bg-[#000000] border-white/20 text-white h-12 font-mono text-base focus-visible:ring-white"
          />
        </div>

        {/* Quick Preset Buttons (for Buy mode) */}
        {isBuy && (
          <div className="flex gap-2">
            {[0.25, 0.50, 0.75, 1.0].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentageSelect(pct)}
                className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-mono font-semibold rounded border border-white/10 transition-colors"
              >
                {pct * 100}%
              </button>
            ))}
          </div>
        )}

        <Separator className="bg-white/10" />

        {/* Execution Details Summary */}
        <div className="bg-black p-4 rounded-lg border border-white/10 space-y-2 text-xs text-[#9a9a9a]">
          <div className="flex justify-between">
            <span>Execution Price</span>
            <span className="font-mono font-semibold text-white">${currentPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Received</span>
            <span className="font-mono font-semibold text-white">
              {isBuy ? `${estimatedOut.toFixed(4)} shares` : `$${estimatedOut.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-1"><Fuel className="h-3 w-3" />Est. Gas Limit</span>
            <span className="font-mono text-white">~150,000 gas (Monad)</span>
          </div>
          <div className="flex justify-between">
            <span>Finality</span>
            <span className="font-mono text-white">~800ms (400ms blocks)</span>
          </div>
          {isSuccess && hash && (
            <div className="flex justify-between pt-1 border-t border-white/10">
              <span>Transaction</span>
              <a
                href={`https://testnet.monadscan.com/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                View on MonadScan <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* Action Button */}
        {needsApproval ? (
          <Button
            onClick={handleApprove}
            disabled={isTradePending || !isConnected}
            className="w-full h-12 bg-white/10 text-white hover:bg-white/20 text-base font-semibold border border-white/30"
          >
            {isTradePending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Approving MON...
              </>
            ) : (
              `Step 1: Approve MON Allowance`
            )}
          </Button>
        ) : (
          <Button
            onClick={handleTrade}
            disabled={isTradePending || !isConnected || (isBuy && (!cashAmount || Number(cashAmount) <= 0)) || (!isBuy && (!shareAmount || Number(shareAmount) <= 0))}
            className={`w-full h-12 text-base font-semibold border ${
              isBuy
                ? "bg-gradient-to-b from-white via-zinc-200 to-zinc-400 text-black border-white hover:opacity-90 transition-opacity"
                : "bg-gradient-to-r from-rose-600 to-rose-500 text-white border-rose-400 hover:opacity-90 transition-opacity"
            }`}
          >
            {isTradePending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Confirming Transaction...
              </>
            ) : (
              isBuy ? `Execute Buy Order (${ticker})` : `Execute Sell Order (${ticker})`
            )}
          </Button>
        )}

        {!isConnected && (
          <p className="text-xs text-center text-[#9a9a9a]">
            Connect wallet to initiate order execution
          </p>
        )}
      </CardContent>
    </Card>
  )
}