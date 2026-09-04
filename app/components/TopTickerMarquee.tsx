"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MarqueeItem {
  symbol: string
  name: string
  price: number
  change: number
  sparkline: number[]
}

const INITIAL_ITEMS: MarqueeItem[] = [
  {
    symbol: "S&P 500",
    name: "S&P 500 Index",
    price: 5980.20,
    change: 0.85,
    sparkline: [5920, 5935, 5930, 5950, 5945, 5970, 5980.20],
  },
  {
    symbol: "NASDAQ",
    name: "Nasdaq Composite",
    price: 18840.50,
    change: 1.24,
    sparkline: [18600, 18650, 18710, 18680, 18790, 18840.50],
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 228.50,
    change: 1.45,
    sparkline: [224, 225, 224.5, 226, 227, 228.5],
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 319.70,
    change: 4.67,
    sparkline: [305, 308, 302, 312, 315, 319.7],
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 128.90,
    change: 2.89,
    sparkline: [124, 125.5, 125, 127, 126.8, 128.9],
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 168.30,
    change: -0.42,
    sparkline: [170, 169.5, 169, 168.8, 168.5, 168.3],
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 415.60,
    change: 0.92,
    sparkline: [411, 412, 411.5, 413, 414, 415.6],
  },
  {
    symbol: "AMZN",
    name: "Amazon.com",
    price: 186.40,
    change: 1.78,
    sparkline: [182, 183.5, 184, 183.8, 185, 186.4],
  },
  {
    symbol: "META",
    name: "Meta Platforms",
    price: 521.10,
    change: -0.85,
    sparkline: [528, 526, 525, 523, 524, 521.1],
  },
  {
    symbol: "COIN",
    name: "Coinbase Global",
    price: 214.80,
    change: 5.12,
    sparkline: [202, 204, 207, 206, 210, 214.8],
  },
]

function MiniSparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const width = 42
  const height = 16

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width
      const y = height - ((val - min) / range) * (height - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  const strokeColor = isPositive ? "#22C55E" : "#EF4444"

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible shrink-0 ml-1.5 opacity-90">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

export function TopTickerMarquee() {
  const router = useRouter()
  const [items, setItems] = useState<MarqueeItem[]>(INITIAL_ITEMS)

  // Fetch updated prices for stock tickers asynchronously if available
  useEffect(() => {
    let isMounted = true
    const fetchLivePrices = async () => {
      try {
        const updated = await Promise.all(
          INITIAL_ITEMS.map(async (item) => {
            // Only fetch for actual equities (skip index tickers with spaces)
            if (item.symbol.includes(" ")) return item
            try {
              const res = await fetch(`/api/stock-history?symbol=${item.symbol}`, { cache: "no-store" })
              if (!res.ok) return item
              const data = await res.json()
              if (data.success && Array.isArray(data.history) && data.history.length >= 2) {
                const history = data.history
                const latestClose = history[history.length - 1].close
                const prevClose = history[history.length - 2].close
                const changePct = prevClose > 0 ? ((latestClose - prevClose) / prevClose) * 100 : item.change
                const spark = history.slice(-7).map((h: { close: number }) => h.close)
                return {
                  ...item,
                  price: latestClose,
                  change: Number(changePct.toFixed(2)),
                  sparkline: spark.length >= 2 ? spark : item.sparkline,
                }
              }
            } catch {
              // fallback to initial
            }
            return item
          })
        )
        if (isMounted) setItems(updated)
      } catch {
        // preserve initial items on error
      }
    }

    fetchLivePrices()
    return () => {
      isMounted = false
    }
  }, [])

  const handleTickerClick = (symbol: string) => {
    let target = symbol
    if (symbol === "S&P 500" || symbol === "NASDAQ") {
      target = "AAPL"
    }

    router.push(`/dashboard?trade=${target}`)
  }

  // Duplicate items array 3 times for seamless 100% marquee scroll loop
  const marqueeItems = [...items, ...items, ...items]

  return (
    <div className="w-full bg-black/90 border-b border-white/10 text-xs py-2 px-4 overflow-hidden relative select-none z-50">
      <div className="animate-marquee flex items-center gap-6">
        {marqueeItems.map((item, index) => {
          const isPositive = item.change >= 0
          return (
            <div
              key={`${item.symbol}-${index}`}
              onClick={() => handleTickerClick(item.symbol)}
              className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.03] border border-white/10 hover:border-white/30 hover:bg-white/[0.08] transition-all duration-200 cursor-pointer shrink-0 group"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {item.symbol}
                  </span>
                  <span className="text-[10px] text-[#9a9a9a] max-w-[80px] truncate hidden sm:inline">
                    {item.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-zinc-200 font-medium">
                  ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span
                  className={`flex items-center text-[11px] font-semibold ${
                    isPositive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 inline mr-0.5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 inline mr-0.5" />
                  )}
                  {isPositive ? "+" : ""}
                  {item.change.toFixed(2)}%
                </span>
              </div>

              <MiniSparkline data={item.sparkline} isPositive={isPositive} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
