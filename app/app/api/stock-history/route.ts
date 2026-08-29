import { NextResponse } from 'next/server'

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'BGLBN0IDRDXYY3HJ'
const MARKETSTACK_API_KEY = process.env.MARKETSTACK_API_KEY || '6e489690b975928eea1036ba3b444d71'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = (searchParams.get('symbol') || 'AAPL').toUpperCase()

  // 1. Try Alpha Vantage API (Real Stock Market Data)
  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    const res = await fetch(url, { cache: 'no-store' })

    if (res.ok) {
      const json = await res.json()
      const timeSeries = json['Time Series (Daily)']
      if (timeSeries && typeof timeSeries === 'object') {
        const dates = Object.keys(timeSeries).slice(0, 15).reverse()
        const history = dates.map((dateStr) => {
          const item = timeSeries[dateStr]
          const open = parseFloat(item['1. open']) || 0
          const high = parseFloat(item['2. high']) || 0
          const low = parseFloat(item['3. low']) || 0
          const close = parseFloat(item['4. close']) || 0
          const d = new Date(dateStr)
          const formattedDate = d.toLocaleDateString([], { month: 'short', day: 'numeric' })
          return {
            date: formattedDate,
            open: Number(open.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            close: Number(close.toFixed(2)),
          }
        })

        if (history.length > 0) {
          return NextResponse.json({ success: true, symbol, source: 'alphavantage', history })
        }
      }
    }
  } catch (error) {
    console.warn('Alpha Vantage fetch error, falling back:', error)
  }

  // 2. Try Marketstack API
  try {
    const url = `http://api.marketstack.com/v1/eod?access_key=${MARKETSTACK_API_KEY}&symbols=${symbol}&limit=15`
    const res = await fetch(url, { cache: 'no-store' })

    if (res.ok) {
      const json = await res.json()
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        const history = json.data
          .slice()
          .reverse()
          .map((item: any) => ({
            date: item.date ? new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '',
            open: Number((item.open || item.close).toFixed(2)),
            high: Number((item.high || item.close).toFixed(2)),
            low: Number((item.low || item.close).toFixed(2)),
            close: Number(item.close.toFixed(2)),
          }))

        return NextResponse.json({ success: true, symbol, source: 'marketstack', history })
      }
    }
  } catch (error) {
    console.warn('Marketstack fetch error, trying Yahoo Finance real API:', error)
  }

  // 2. Secondary Real API Fallback: Yahoo Finance Chart API
  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`
    const yRes = await fetch(yahooUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store'
    })

    if (yRes.ok) {
      const yData = await yRes.json()
      const timestamps = yData?.chart?.result?.[0]?.timestamp
      const quotes = yData?.chart?.result?.[0]?.indicators?.quote?.[0]

      if (Array.isArray(timestamps) && quotes?.close) {
        const history = timestamps.slice(-15).map((ts: number, i: number) => {
          const idx = timestamps.length - 15 + i
          const dateStr = new Date(ts * 1000).toLocaleDateString([], { month: 'short', day: 'numeric' })
          const closeVal = quotes.close[idx] || quotes.close[quotes.close.length - 1] || 100
          const openVal = quotes.open?.[idx] || closeVal
          const highVal = quotes.high?.[idx] || closeVal
          const lowVal = quotes.low?.[idx] || closeVal

          return {
            date: dateStr,
            open: Number(openVal.toFixed(2)),
            high: Number(highVal.toFixed(2)),
            low: Number(lowVal.toFixed(2)),
            close: Number(closeVal.toFixed(2)),
          }
        })

        return NextResponse.json({ success: true, symbol, source: 'yahoo', history })
      }
    }
  } catch (yErr) {
    console.error('Yahoo Finance API fallback error:', yErr)
  }

  return NextResponse.json({ success: false, symbol, message: 'Could not fetch live stock data' }, { status: 500 })
}
