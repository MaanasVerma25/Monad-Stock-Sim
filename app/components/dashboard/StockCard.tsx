"use client"

import { useEffect, useState } from "react"
import { useReadContract, useWatchContractEvent } from "wagmi"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import { formatPrice, formatUnits } from "@/lib/utils"
import { STOCK_AMM_ADDRESS, stockAmmAbi } from "@/lib/contracts/contracts"

interface StockCardProps {
  stockId: number
  ticker: string
}

export function StockCard({ stockId, ticker }: StockCardProps) {
  const [priceHistory, setPriceHistory] = useState<number[]>([])
  const [maxPoints] = useState(100)

  const { data: price } = useReadContract({
    address: STOCK_AMM_ADDRESS,
    abi: stockAmmAbi,
    functionName: "getPrice",
    args: [stockId],
    query: { refetchInterval: 2000 },
  })

  const { data: tickerName } = useReadContract({
    address: STOCK_AMM_ADDRESS,
    abi: stockAmmAbi,
    functionName: "getTicker",
    args: [stockId],
    query: { enabled: false },
  })

  useWatchContractEvent({
    address: STOCK_AMM_ADDRESS,
    abi: stockAmmAbi,
    eventName: "Trade",
    onLogs: (logs) => {
      logs.forEach((log) => {
        if (Number(log.args.stockId) === stockId) {
          const newPrice = Number(log.args.newPrice) / 1e18
          setPriceHistory((prev) => [...prev.slice(-maxPoints + 1), newPrice])
        }
      })
    },
  })

  useEffect(() => {
    if (price && priceHistory.length === 0) {
      const initialPrice = Number(price) / 1e18
      setPriceHistory(Array(maxPoints).fill(initialPrice))
    }
  }, [price, priceHistory.length, maxPoints])

  const displayTicker = tickerName || ticker
  const currentPrice = price ? Number(price) / 1e18 : 0
  const priceChange = priceHistory.length >= 2
    ? priceHistory[priceHistory.length - 1] - priceHistory[priceHistory.length - 2]
    : 0
  const isPositive = priceChange >= 0

  const chartData = priceHistory.map((price, index) => ({
    time: index,
    price,
  }))

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{displayTicker}</CardTitle>
          <Badge variant={isPositive ? "default" : "destructive"} className="gap-1">
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(4)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-3xl font-bold mb-4">
          {currentPrice > 0 ? `${currentPrice.toFixed(4)} SUSD` : "Loading..."}
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ display: false }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                formatter={(value) => [`${value.toFixed(4)} SUSD`, "Price"]}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}