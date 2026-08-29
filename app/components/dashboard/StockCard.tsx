"use client"

import { useEffect, useState } from "react"
import { useReadContract, useWatchContractEvent } from "wagmi"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Anchor, ArrowUpRight } from "lucide-react"
import { STOCK_AMM_ADDRESS, stockAmmAbi } from "@/lib/contracts/contracts"
import { TradeModal } from "@/components/trade/TradeModal"

interface StockCardProps {
  stockId: number
  ticker: string
  name: string
}

export function StockCard({ stockId, ticker, name }: StockCardProps) {
  const [priceHistory, setPriceHistory] = useState<number[]>([])
  const [maxPoints] = useState(100)
  const [isTradeOpen, setIsTradeOpen] = useState(false)
  const [liveApiPrice, setLiveApiPrice] = useState<number>(0)

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

  // If on-chain data is loading/uninitialized, fetch live stock quote dynamically from real API
  useEffect(() => {
    if (!stockData?.[4] && !spotPrice) {
      fetch(`/api/stock-history?symbol=${ticker}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.history) && data.history.length > 0) {
            const latest = data.history[data.history.length - 1].close
            setLiveApiPrice(latest)
          }
        })
        .catch(() => {})
    }
  }, [ticker, stockData, spotPrice])

  useWatchContractEvent({
    address: STOCK_AMM_ADDRESS,
    abi: stockAmmAbi,
    eventName: "Trade",
    onLogs: (logs) => {
      logs.forEach((log) => {
        if (Number(log.args.stockId) === stockId && log.args.newPrice) {
          const newPrice = Number(log.args.newPrice) / 1e18
          setPriceHistory((prev) => [...prev.slice(-maxPoints + 1), newPrice])
        }
      })
    },
  })

  const displayTicker = stockData?.[0] || ticker
  const displayName = stockData?.[1] || name
  const basePrice = stockData?.[4] ? Number(stockData[4]) / 1e18 : (liveApiPrice || 100)
  const currentPrice = spotPrice ? Number(spotPrice) / 1e18 : (stockData?.[6] ? Number(stockData[6]) / 1e18 : (liveApiPrice || 100))

  useEffect(() => {
    if (currentPrice > 0 && priceHistory.length === 0) {
      setPriceHistory(Array(maxPoints).fill(currentPrice))
    }
  }, [currentPrice, priceHistory.length, maxPoints])

  const priceDiffFromBase = currentPrice - basePrice
  const percentChange = basePrice > 0 ? (priceDiffFromBase / basePrice) * 100 : 0
  const isPositive = priceDiffFromBase >= 0

  const chartData = priceHistory.map((price, index) => ({
    time: index,
    price,
  }))

  return (
    <>
      <Card
        onClick={() => setIsTradeOpen(true)}
        className="h-full bg-zinc-950/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-md flex flex-col justify-between hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all duration-300 cursor-pointer group"
      >
        <CardHeader className="p-0 mb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-bold font-serif text-white group-hover:text-zinc-200 transition-colors flex items-center gap-1.5">
                {displayTicker}
                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-white" />
              </CardTitle>
              <p className="text-xs text-[#9a9a9a] truncate max-w-[140px]">{displayName}</p>
            </div>
            <Badge
              variant="secondary"
              className={`gap-1 px-2.5 py-0.5 font-mono text-xs ${
                isPositive
                  ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-950/40 text-rose-400 border border-rose-500/20"
              }`}
            >
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive ? "+" : ""}{percentChange.toFixed(2)}%
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 flex flex-col justify-between">
          <div className="mb-2">
            <div className="font-mono text-2xl font-bold text-white tracking-tight">
              ${currentPrice > 0 ? currentPrice.toFixed(2) : "..."}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#9a9a9a] font-mono mt-1">
              <Anchor className="h-3 w-3 text-white" />
              <span>24h Anchor: <strong className="text-white">${basePrice > 0 ? basePrice.toFixed(2) : "..."}</strong></span>
            </div>
          </div>

          <div className="h-28 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000000",
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontFamily: "monospace",
                    fontSize: "12px"
                  }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Bonding Spot Price"]}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? "#22C55E" : "#EF4444"}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: isPositive ? "#22C55E" : "#EF4444", stroke: "#000000", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <Button
            size="sm"
            className="w-full mt-3 bg-gradient-to-r from-[#050505] via-[#2a2a2a] to-[#4a4a4a] text-zinc-100 border border-white/20 hover:border-white/50 hover:shadow-[0_0_18px_rgba(200,210,230,0.18)] transition-all duration-300 rounded-md font-medium"
            onClick={(e) => {
              e.stopPropagation()
              setIsTradeOpen(true)
            }}
          >
            Trade {displayTicker}
          </Button>
        </CardContent>
      </Card>

      <TradeModal
        stockId={stockId}
        ticker={displayTicker}
        name={displayName}
        basePrice={basePrice}
        currentPrice={currentPrice}
        percentChange={percentChange}
        isOpen={isTradeOpen}
        onClose={() => setIsTradeOpen(false)}
      />
    </>
  )
}