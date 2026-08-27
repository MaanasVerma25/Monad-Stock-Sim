import { NextResponse } from 'next/server'

const MARKETSTACK_API_KEY = process.env.MARKETSTACK_API_KEY || '6e489690b975928eea1036ba3b444d71'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'AAPL'

  try {
    const url = `http://api.marketstack.com/v1/eod?access_key=${MARKETSTACK_API_KEY}&symbols=${symbol}&limit=15`
    const res = await fetch(url, { cache: 'no-store' })

    if (res.ok) {
      const json = await res.json()
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        // Reverse so chronological order (oldest to newest)
        const history = json.data
          .reverse()
          .map((item: any) => ({
            date: item.date ? new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '',
            open: item.open || item.close,
            high: item.high || item.close,
            low: item.low || item.close,
            close: item.close,
          }))

        return NextResponse.json({ success: true, symbol, history })
      }
    }
  } catch (error) {
    console.error('Marketstack fetch error:', error)
  }

  // Fallback if API rate limit or error
  const fallbackPrices: Record<string, number> = {
    AAPL: 225.50,
    TSLA: 212.30,
    NVDA: 126.80,
    GOOGL: 167.20,
    MSFT: 414.90,
    AMZN: 176.40,
    META: 512.10,
    COIN: 204.60,
  }

  const base = fallbackPrices[symbol] || 150.00
  const history = Array.from({ length: 15 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (14 - i))
    const randomDrift = (Math.sin(i / 2) * 4) + (Math.cos(i) * 2)
    const val = base + randomDrift
    return {
      date: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      open: val - 1,
      high: val + 2,
      low: val - 2,
      close: Number(val.toFixed(2)),
    }
  })

  return NextResponse.json({ success: true, symbol, history, fallback: true })
}
