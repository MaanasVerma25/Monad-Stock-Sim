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
  defaultBasePrice: number
}

export function StockCard({ stockId, ticker, name, defaultBasePrice }: StockCardProps) {
  const [priceHistory, setPriceHistory] = useState<number[]>([])
  const [maxPoints] = useState(100)
  const [isTradeOpen, setIsTradeOpen] = useState(false)

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
  const basePrice = stockData?.[4] ? Number(stockData[4]) / 1e18 : defaultBasePrice
  const currentPrice = spotPrice ? Number(spotPrice) / 1e18 : (stockData?.[6] ? Number(stockData[6]) / 1e18 : defaultBasePrice)

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
        className="h-full flex flex-col justify-between hover:border-primary/60 hover:shadow-lg transition-all cursor-pointer group"
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors flex items-center gap-1.5">
                {displayTicker}
                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
              </CardTitle>
              <p className="text-xs text-muted-foreground truncate max-w-[140px]">{displayName}</p>
            </div>
            <Badge variant={isPositive ? "default" : "destructive"} className="gap-1 font-mono text-xs">
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive ? "+" : ""}{percentChange.toFixed(2)}%
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pb-3 flex-1 flex flex-col justify-between">
          <div className="mb-2">
            <div className="text-2xl font-extrabold tracking-tight">
              ${currentPrice > 0 ? currentPrice.toFixed(2) : "..."} <span className="text-xs font-normal text-muted-foreground">SUSD</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <Anchor className="h-3 w-3 text-primary/70" />
              <span>24h Anchor: <strong>${basePrice.toFixed(2)}</strong></span>
            </div>
          </div>

          <div className="h-28 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)} SUSD`, "Bonding Spot Price"]}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? "#10b981" : "#ef4444"}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <Button
            size="sm"
            className="w-full mt-3 font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
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