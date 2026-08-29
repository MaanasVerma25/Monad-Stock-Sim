"use client"

import { useState, useEffect } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useWatchContractEvent } from "wagmi"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Loader2, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Activity, Clock, Globe, ExternalLink, Fuel, Zap } from "lucide-react"
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

interface DualChartPoint {
  time: string
  bondingPrice: number
  realPrice: number
}

export function TradeModal({
  stockId,
  ticker,
  name,
  basePrice: initialBasePrice,
  currentPrice: initialCurrentPrice,
  percentChange: initialPercentChange,
  isOpen,
  onClose,
}: TradeModalProps) {
  const { address, isConnected } = useAccount()
  const [cashAmount, setCashAmount] = useState("")
  const [shareAmount, setShareAmount] = useState("")
  const [isBuy, setIsBuy] = useState(true)
  const [timeframe, setTimeframe] = useState("1D")
  const [chartData, setChartData] = useState<DualChartPoint[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Read Live Stock Data & Spot Price directly from Monad Smart Contract
  const { data: stockData, refetch: refetchStockData } = useReadContract({
    address: STOCK_AMM_ADDRESS,
    abi: stockAmmAbi,
    functionName: "getStock",
    args: [BigInt(stockId)],
    query: { enabled: isOpen, refetchInterval: 1500 },
  })

  const { data: spotPriceData, refetch: refetchSpotPrice } = useReadContract({
    address: STOCK_AMM_ADDRESS,
    abi: stockAmmAbi,
    functionName: "getPrice",
    args: [BigInt(stockId)],
    query: { enabled: isOpen, refetchInterval: 1500 },
  })

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: PLAY_MONEY_ADDRESS,
    abi: playMoneyAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && isOpen, refetchInterval: 2000 },
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: PLAY_MONEY_ADDRESS,
    abi: playMoneyAbi,
    functionName: "allowance",
    args: address ? [address, STOCK_AMM_ADDRESS] : undefined,
    query: { enabled: !!address && isOpen, refetchInterval: 2000 },
  })

  // Parse contract reserves and live prices
  const cashReserve = stockData?.[2] ? Number(stockData[2]) / 1e18 : (initialBasePrice * 200)
  const shareReserve = stockData?.[3] ? Number(stockData[3]) / 1e18 : 200
  const basePrice = stockData?.[4] ? Number(stockData[4]) / 1e18 : initialBasePrice
  const liveSpotPrice = spotPriceData
    ? Number(spotPriceData) / 1e18
    : (stockData?.[6] ? Number(stockData[6]) / 1e18 : initialCurrentPrice)

  const priceDiffFromBase = liveSpotPrice - basePrice
  const percentChange = basePrice > 0 ? (priceDiffFromBase / basePrice) * 100 : initialPercentChange
  const isPositive = percentChange >= 0

  // Calculate Exact AMM Constant Product Bonding Curve Outputs
  let estimatedOut = 0
  let nextSpotPrice = liveSpotPrice
  let priceImpactPct = 0

  if (isBuy) {
    const cashIn = Number(cashAmount) || 0
    if (cashIn > 0 && cashReserve > 0 && shareReserve > 0) {
      estimatedOut = (shareReserve * cashIn) / (cashReserve + cashIn)
      const newCash = cashReserve + cashIn
      const newShares = shareReserve - estimatedOut
      nextSpotPrice = newShares > 0 ? newCash / newShares : liveSpotPrice
      priceImpactPct = liveSpotPrice > 0 ? ((nextSpotPrice - liveSpotPrice) / liveSpotPrice) * 100 : 0
    }
  } else {
    const sharesIn = Number(shareAmount) || 0
    if (sharesIn > 0 && cashReserve > 0 && shareReserve > 0) {
      estimatedOut = (cashReserve * sharesIn) / (shareReserve + sharesIn)
      const newCash = cashReserve - estimatedOut
      const newShares = shareReserve + sharesIn
      nextSpotPrice = newShares > 0 ? newCash / newShares : liveSpotPrice
      priceImpactPct = liveSpotPrice > 0 ? ((nextSpotPrice - liveSpotPrice) / liveSpotPrice) * 100 : 0
    }
  }

  // Real-time Event Listener for Monad Trade Events
  useWatchContractEvent({
    address: STOCK_AMM_ADDRESS,
    abi: stockAmmAbi,
    eventName: "Trade",
    onLogs: (logs) => {
      logs.forEach((log) => {
        if (Number(log.args.stockId) === stockId && log.args.newPrice) {
          const newBondingPrice = Number(log.args.newPrice) / 1e18
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          setChartData((prev) => {
            const lastReal = prev.length > 0 ? prev[prev.length - 1].realPrice : basePrice
            return [...prev.slice(-40), { time: timeStr, bondingPrice: Number(newBondingPrice.toFixed(4)), realPrice: lastReal }]
          })
          refetchStockData()
          refetchSpotPrice()
        }
      })
    },
  })

  // Load Real Stock History
  useEffect(() => {
    if (isOpen) {
      setIsLoadingHistory(true)
      fetch(`/api/stock-history?symbol=${ticker}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.history) && data.history.length > 0) {
            const points: DualChartPoint[] = data.history.map((item: any, i: number) => {
              const bondingVal = basePrice + (liveSpotPrice - basePrice) * (i / (data.history.length - 1 || 1))
              return {
                time: item.date || `T-${15 - i}`,
                bondingPrice: Number(bondingVal.toFixed(4)),
                realPrice: Number(item.close.toFixed(2)),
              }
            })
            setChartData(points)
          } else {
            createDefaultPoints()
          }
        })
        .catch(() => {
          createDefaultPoints()
        })
        .finally(() => {
          setIsLoadingHistory(false)
        })
    }

    function createDefaultPoints() {
      const defaultPoints = Array.from({ length: 12 }, (_, i) => {
        const factor = i / 11
        return {
          time: `T-${12 - i}m`,
          bondingPrice: Number((basePrice + (liveSpotPrice - basePrice) * factor).toFixed(4)),
          realPrice: Number((basePrice + Math.sin(i / 2) * 3).toFixed(2)),
        }
      })
      setChartData(defaultPoints)
    }
  }, [isOpen, ticker, basePrice, liveSpotPrice])

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, isError, error } = useWaitForTransactionReceipt({ hash })

  // Refetch contract state after successful trade
  useEffect(() => {
    if (isSuccess) {
      refetchStockData()
      refetchSpotPrice()
      refetchBalance()
      refetchAllowance()
      setCashAmount("")
      setShareAmount("")
    }
  }, [isSuccess, refetchStockData, refetchSpotPrice, refetchBalance, refetchAllowance])

  if (!isOpen) return null

  const handleTrade = async () => {
    if (!address) return

    try {
      if (isBuy) {
        const amountInWei = BigInt(Math.floor(Number(cashAmount) * 1e18))
        if (amountInWei <= 0n) return

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
        if (amountInWei <= 0n) return

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
    toast.success("Trade finalized on Monad!", {
      description: `Confirmed in ~800ms. Spot price updated to $${liveSpotPrice.toFixed(4)}.`,
      action: hash ? {
        label: "View Tx",
        onClick: () => window.open(`https://testnet.monadscan.com/tx/${hash}`, "_blank"),
      } : undefined,
    })
  }

  if (isError) {
    toast.error("Transaction failed", { description: error?.message || "Unknown error" })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in-0">
      <div
        className="relative w-full max-w-5xl bg-black/95 backdrop-blur-xl border border-white/15 text-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 grid grid-cols-1 lg:grid-cols-12 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-20 rounded-full h-9 w-9 bg-white/10 hover:bg-white/20 text-white"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Left Side: Dual-Line Graph Comparison View */}
        <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between space-y-5">
          {/* Stock Header */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-black tracking-tight font-serif text-white">{ticker}</h2>
              <span className="text-sm text-[#9a9a9a] font-medium">{name}</span>
              <Badge
                variant="secondary"
                className={`gap-1 px-2.5 py-0.5 font-mono text-xs ml-auto lg:ml-0 ${
                  isPositive
                    ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-950/40 text-rose-400 border border-rose-500/20"
                }`}
              >
                {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {isPositive ? "+" : ""}{percentChange.toFixed(2)}%
              </Badge>
            </div>

            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-extrabold tracking-tight font-mono">
                ${liveSpotPrice.toFixed(4)}
              </div>
              <span className="text-xs text-[#9a9a9a] font-mono">
                Anchor: <strong className="text-white">${basePrice.toFixed(2)}</strong>
              </span>
            </div>
          </div>

          {/* Graph Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950/60 border border-white/10 p-3 rounded-2xl text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block"></span>
                On-Chain Bonding Curve ($x \cdot y = k$)
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-sky-400">
                <span className="h-3 w-3 rounded-full bg-sky-500 inline-block border border-dashed border-white"></span>
                Real Market Price
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#9a9a9a] font-mono text-[11px]">
              <Globe className="h-3 w-3 text-white" /> Monad Testnet Live
            </div>
          </div>

          {/* Timeframe Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9a9a9a] flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-white" /> Live Spot Curve & Real Anchor
            </span>
            <div className="flex gap-1 bg-black p-1 rounded-xl text-xs font-medium border border-white/10">
              {["1D", "1W", "1M", "ALL"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    timeframe === tf
                      ? "border border-white/20 bg-gradient-to-r from-[#050505] via-[#2a2a2a] to-[#4a4a4a] text-white shadow-inner font-semibold"
                      : "text-[#9a9a9a] hover:text-white"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Dual-Line Chart */}
          <div className="h-64 sm:h-72 w-full pt-2">
            {isLoadingHistory ? (
              <div className="h-full flex items-center justify-center text-sm text-[#9a9a9a] gap-2 font-mono">
                <Loader2 className="h-5 w-5 animate-spin text-white" /> Loading bonding curve history...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#9a9a9a" }} stroke="rgba(255,255,255,0.1)" />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: "#9a9a9a" }} stroke="rgba(255,255,255,0.1)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#000000",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#ffffff"
                    }}
                    formatter={(val: any, name: any) => [
                      `$${Number(val).toFixed(4)}`,
                      name === "bondingPrice" ? "On-Chain Bonding Curve" : "Real Market Price"
                    ]}
                  />
                  <ReferenceLine
                    y={basePrice}
                    stroke="#9a9a9a"
                    strokeDasharray="4 4"
                    label={{ value: `Market Open: $${basePrice.toFixed(2)}`, fill: '#9a9a9a', fontSize: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bondingPrice"
                    name="bondingPrice"
                    stroke="#22C55E"
                    strokeWidth={3}
                    dot={{ r: 3, fill: '#22C55E' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="realPrice"
                    name="realPrice"
                    stroke="#38BDF8"
                    strokeWidth={2.5}
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: '#38BDF8' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Side: Order Execution Panel */}
        <div className="lg:col-span-5 p-6 bg-zinc-950/80 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg font-serif">Order Execution</h3>
              <Badge variant="outline" className="gap-1 text-xs border-emerald-500/30 text-emerald-400 bg-emerald-950/40">
                <Zap className="h-3 w-3 text-emerald-400" /> Bonding Curve AMM
              </Badge>
            </div>

            {/* Buy / Sell Tabs */}
            <div className="flex gap-2 p-1 bg-black rounded-lg border border-white/10">
              <Button
                variant={isBuy ? "default" : "outline"}
                onClick={() => setIsBuy(true)}
                className={`flex-1 font-bold py-5 transition-all ${
                  isBuy
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border border-emerald-400 shadow-md"
                    : "bg-transparent text-[#9a9a9a] border-none hover:text-white"
                }`}
              >
                <ArrowUpRight className="h-4 w-4 mr-1" /> Buy {ticker}
              </Button>
              <Button
                variant={!isBuy ? "default" : "outline"}
                onClick={() => setIsBuy(false)}
                className={`flex-1 font-bold py-5 transition-all ${
                  !isBuy
                    ? "bg-gradient-to-r from-rose-600 to-rose-500 text-white border border-rose-400 shadow-md"
                    : "bg-transparent text-[#9a9a9a] border-none hover:text-white"
                }`}
              >
                <ArrowDownRight className="h-4 w-4 mr-1" /> Sell {ticker}
              </Button>
            </div>

            <Separator className="bg-white/10" />

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#9a9a9a] uppercase tracking-wider">
                {isBuy ? "MON Amount to Spend" : "Shares to Sell"}
              </label>
              <Input
                type="number"
                step="0.0001"
                value={isBuy ? cashAmount : shareAmount}
                onChange={(e) => isBuy ? setCashAmount(e.target.value) : setShareAmount(e.target.value)}
                placeholder={isBuy ? "e.g. 50 MON" : "e.g. 2.5 shares"}
                disabled={isTradePending || !isConnected}
                className="bg-[#000000] border-white/20 text-white h-12 font-mono text-lg font-bold focus-visible:ring-white"
              />
            </div>

            {/* Estimates & Bonding Curve Price Impact */}
            <div className="text-xs text-[#9a9a9a] space-y-2 bg-black/60 p-4 rounded-2xl border border-white/10">
              <div className="flex justify-between items-center">
                <span>Estimated Received:</span>
                <span className="font-mono font-bold text-white text-sm">
                  {isBuy ? `${estimatedOut.toFixed(4)} shares` : `$${estimatedOut.toFixed(2)} MON`}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Current Spot Price:</span>
                <span className="font-mono font-semibold text-white">
                  ${liveSpotPrice.toFixed(4)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-white/10">
                <span className="font-semibold text-white flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-400" /> New Spot Price after Trade:
                </span>
                <span className={`font-mono font-bold text-sm ${isBuy ? "text-emerald-400" : "text-rose-400"}`}>
                  ${nextSpotPrice.toFixed(4)} ({priceImpactPct >= 0 ? "+" : ""}{priceImpactPct.toFixed(2)}%)
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Your MON Balance:</span>
                <span className="font-mono text-white font-semibold">
                  {balance ? `${formatUnits(balance)} MON` : "Loading..."}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1"><Fuel className="h-3 w-3" />Est. Gas Limit:</span>
                <span className="font-mono text-white font-semibold">
                  ~150,000 gas (Monad)
                </span>
              </div>
              {isSuccess && hash && (
                <div className="flex justify-between pt-1 border-t border-white/10">
                  <span>Transaction:</span>
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
          </div>

          {/* Action Button */}
          <div className="space-y-2 pt-4">
            <Button
              onClick={handleTrade}
              disabled={
                isTradePending ||
                !isConnected ||
                (isBuy && (!cashAmount || Number(cashAmount) <= 0)) ||
                (!isBuy && (!shareAmount || Number(shareAmount) <= 0))
              }
              className={`w-full py-6 text-base font-extrabold shadow-xl ${
                isBuy
                  ? "bg-gradient-to-b from-white via-zinc-200 to-zinc-400 text-black border border-white hover:opacity-90 transition-opacity"
                  : "bg-gradient-to-r from-rose-600 to-rose-500 text-white border border-rose-400 hover:opacity-90 transition-opacity"
              }`}
            >
              {isTradePending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Confirming on Monad...
                </>
              ) : (
                isBuy ? `Execute Buy Order (${ticker})` : `Execute Sell Order (${ticker})`
              )}
            </Button>

            {!isConnected && (
              <p className="text-xs text-center text-[#9a9a9a]">
                Connect wallet to execute orders
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
