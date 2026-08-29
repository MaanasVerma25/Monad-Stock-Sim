"use client"

import { useState, useEffect } from "react"
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract, useWatchContractEvent } from "wagmi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowUpRight, ArrowDownRight, Anchor, Fuel, ExternalLink, Zap, Wallet } from "lucide-react"
import { toast } from "sonner"
import { STOCK_AMM_ADDRESS, stockAmmAbi } from "@/lib/contracts/contracts"

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

  // Fetch native MON balance from wallet
  const { data: monBalance, refetch: refetchMonBalance } = useBalance({
    address,
    query: { enabled: !!address, refetchInterval: 2000 },
  })

  const { data: stockData, refetch: refetchStockData } = useReadContract({
    address: STOCK_AMM_ADDRESS,
    abi: stockAmmAbi,
    functionName: "getStock",
    args: [BigInt(stockId)],
    query: { refetchInterval: 1500 },
  })

  const { data: spotPrice, refetch: refetchSpotPrice } = useReadContract({
    address: STOCK_AMM_ADDRESS,
    abi: stockAmmAbi,
    functionName: "getPrice",
    args: [BigInt(stockId)],
    query: { refetchInterval: 1500 },
  })

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, isError, error } = useWaitForTransactionReceipt({ hash })

  // Listen to live on-chain Trade events
  useWatchContractEvent({
    address: STOCK_AMM_ADDRESS,
    abi: stockAmmAbi,
    eventName: "Trade",
    onLogs: (logs) => {
      logs.forEach((log) => {
        if (Number(log.args.stockId) === stockId) {
          refetchStockData()
          refetchSpotPrice()
          refetchMonBalance()
        }
      })
    },
  })

  useEffect(() => {
    if (isSuccess) {
      refetchStockData()
      refetchSpotPrice()
      refetchMonBalance()
      setCashAmount("")
      setShareAmount("")
    }
  }, [isSuccess, refetchStockData, refetchSpotPrice, refetchMonBalance])

  const cashReserve = stockData?.[2] ? Number(stockData[2]) / 1e18 : (defaultBasePrice || 100) * 200
  const shareReserve = stockData?.[3] ? Number(stockData[3]) / 1e18 : 200
  const basePrice = stockData?.[4] ? Number(stockData[4]) / 1e18 : (defaultBasePrice || 100)
  const currentPrice = spotPrice ? Number(spotPrice) / 1e18 : (stockData?.[6] ? Number(stockData[6]) / 1e18 : (defaultBasePrice || 100))
  const displayName = stockData?.[1] || name || ""

  // Exact AMM Bonding Curve Equations
  let estimatedOut = 0
  let nextSpotPrice = currentPrice
  let priceImpactPct = 0

  if (isBuy) {
    const cashIn = Number(cashAmount) || 0
    if (cashIn > 0 && cashReserve > 0 && shareReserve > 0) {
      estimatedOut = (shareReserve * cashIn) / (cashReserve + cashIn)
      const newCash = cashReserve + cashIn
      const newShares = shareReserve - estimatedOut
      nextSpotPrice = newShares > 0 ? newCash / newShares : currentPrice
      priceImpactPct = currentPrice > 0 ? ((nextSpotPrice - currentPrice) / currentPrice) * 100 : 0
    }
  } else {
    const sharesIn = Number(shareAmount) || 0
    if (sharesIn > 0 && cashReserve > 0 && shareReserve > 0) {
      estimatedOut = (cashReserve * sharesIn) / (shareReserve + sharesIn)
      const newCash = cashReserve - estimatedOut
      const newShares = shareReserve + sharesIn
      nextSpotPrice = newShares > 0 ? newCash / newShares : currentPrice
      priceImpactPct = currentPrice > 0 ? ((nextSpotPrice - currentPrice) / currentPrice) * 100 : 0
    }
  }

  const handlePercentageSelect = (pct: number) => {
    if (!monBalance || !isBuy) return
    const maxBalance = Number(monBalance.formatted)
    const selected = (maxBalance * pct).toFixed(4)
    setCashAmount(selected)
  }

  const handleTrade = async () => {
    if (!address) return

    try {
      if (isBuy) {
        const amountInWei = BigInt(Math.floor(Number(cashAmount) * 1e18))
        if (amountInWei <= BigInt(0)) return

        writeContract({
          address: STOCK_AMM_ADDRESS,
          abi: stockAmmAbi,
          functionName: "buy",
          args: [BigInt(stockId)],
          value: amountInWei,
          gas: 150000n, // Monad charges gas on gas_limit
        })
      } else {
        const amountInWei = BigInt(Math.floor(Number(shareAmount) * 1e18))
        if (amountInWei <= BigInt(0)) return

        writeContract({
          address: STOCK_AMM_ADDRESS,
          abi: stockAmmAbi,
          functionName: "sell",
          args: [BigInt(stockId), amountInWei],
          gas: 150000n, // Monad charges gas on gas_limit
        })
      }
    } catch (e) {
      toast.error("Trade failed", { description: (e as Error).message })
    }
  }

  const isTradePending = isPending || isConfirming

  if (isSuccess) {
    toast.success("Order Executed!", {
      description: `Trade finalized on Monad in ~800ms. Spot price updated to $${currentPrice.toFixed(4)}.`,
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
              Spot: ${currentPrice.toFixed(4)}
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
              {isBuy ? "Native MON Order Value" : "Shares Quantity"}
            </label>
            <span className="font-mono text-xs text-[#9a9a9a] flex items-center gap-1">
              <Wallet className="h-3 w-3 text-emerald-400" />
              MetaMask MON: {monBalance ? `${Number(monBalance.formatted).toFixed(4)} MON` : "0.0000 MON"}
            </span>
          </div>
          <Input
            type="number"
            step="0.0001"
            value={isBuy ? cashAmount : shareAmount}
            onChange={(e) => isBuy ? setCashAmount(e.target.value) : setShareAmount(e.target.value)}
            placeholder={isBuy ? "0.00 Native MON" : "0.0000 Shares"}
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
            <span>Current Spot Price</span>
            <span className="font-mono font-semibold text-white">${currentPrice.toFixed(4)}</span>
          </div>

          <div className="flex justify-between">
            <span>Estimated Received</span>
            <span className="font-mono font-semibold text-white">
              {isBuy ? `${estimatedOut.toFixed(4)} shares` : `${estimatedOut.toFixed(4)} MON`}
            </span>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-white/10">
            <span className="font-semibold text-white flex items-center gap-1">
              <Zap className="h-3 w-3 text-emerald-400" /> New Spot Price after Trade:
            </span>
            <span className={`font-mono font-bold text-xs ${isBuy ? "text-emerald-400" : "text-rose-400"}`}>
              ${nextSpotPrice.toFixed(4)} ({priceImpactPct >= 0 ? "+" : ""}{priceImpactPct.toFixed(2)}%)
            </span>
          </div>

          <div className="pt-2 border-t border-white/10 text-[11px] text-[#9a9a9a] leading-relaxed">
            <p className="flex items-start gap-1">
              <Fuel className="h-3.5 w-3.5 text-white shrink-0 mt-0.5" />
              <span>
                Native MON balance for gas fees. Monad charges gas on <strong className="text-white font-mono">gas_limit (150,000)</strong>, not gas used.
              </span>
            </p>
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

        {!isConnected && (
          <p className="text-xs text-center text-[#9a9a9a]">
            Connect wallet to initiate order execution
          </p>
        )}
      </CardContent>
    </Card>
  )
}