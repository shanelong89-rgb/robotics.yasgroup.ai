/**
 * Binance Skills Hub — Live data helpers for CASS
 * Fetches real token prices and smart money signals to feed into agent context
 */

const BINANCE_HEADERS = {
  'Content-Type': 'application/json',
  'Accept-Encoding': 'identity',
  'User-Agent': 'binance-web3/1.1 (Skill)',
}

export interface TokenMarketData {
  symbol: string
  price: number
  priceChange24h: number
  volume24h: number
  marketCap: number
  liquidity: number
}

export interface YieldData {
  usdc_aave_apy: number
  usyc_ondo_apy: number
  blended_apy: number
  timestamp: string
}

/**
 * Fetch real-time token market data from Binance Web3 API
 */
export async function fetchTokenData(query: string, chainId = 56): Promise<TokenMarketData | null> {
  try {
    // Step 1: Search for token
    const searchRes = await fetch(
      `https://web3.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/web/search/market?keyword=${encodeURIComponent(query)}&chainId=${chainId}`,
      { headers: BINANCE_HEADERS, signal: AbortSignal.timeout(5000) }
    )
    if (!searchRes.ok) return null
    const searchData = await searchRes.json()
    const token = searchData?.data?.list?.[0]
    if (!token) return null

    // Step 2: Get dynamic market data
    const dynamicRes = await fetch(
      `https://web3.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/web/token/dynamic?address=${token.address}&chainId=${chainId}`,
      { headers: BINANCE_HEADERS, signal: AbortSignal.timeout(5000) }
    )
    if (!dynamicRes.ok) {
      return {
        symbol: token.symbol || query.toUpperCase(),
        price: parseFloat(token.price) || 0,
        priceChange24h: 0,
        volume24h: 0,
        marketCap: parseFloat(token.marketCap) || 0,
        liquidity: parseFloat(token.liquidity) || 0,
      }
    }

    const dynamicData = await dynamicRes.json()
    const d = dynamicData?.data || {}

    return {
      symbol: token.symbol || query.toUpperCase(),
      price: parseFloat(d.price || token.price) || 0,
      priceChange24h: parseFloat(d.priceChange24H) || 0,
      volume24h: parseFloat(d.volume24H) || 0,
      marketCap: parseFloat(d.marketCap || token.marketCap) || 0,
      liquidity: parseFloat(d.liquidity || token.liquidity) || 0,
    }
  } catch {
    return null
  }
}

/**
 * Fetch RWA-relevant token prices for ARIA risk scoring
 * Targets: ETH (gas/infra proxy), BTC (macro risk), USDC (reserve), and any robotics/EV tokens
 */
export async function fetchRWATokenPrices(): Promise<Record<string, {
  symbol: string
  price: number
  priceChange24h: number
  volume24h: number
}>> {
  const targets = ['ETH', 'BTC', 'USDC', 'AAVE']
  const results: Record<string, { symbol: string; price: number; priceChange24h: number; volume24h: number }> = {}

  await Promise.allSettled(
    targets.map(async (sym) => {
      try {
        const res = await fetch(
          `https://web3.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/web/search/market?keyword=${sym}&chainId=56`,
          { headers: BINANCE_HEADERS, signal: AbortSignal.timeout(5000) }
        )
        if (!res.ok) return
        const data = await res.json()
        const token = data?.data?.list?.[0]
        if (token) {
          results[sym] = {
            symbol: token.symbol || sym,
            price: parseFloat(token.price) || 0,
            priceChange24h: parseFloat(token.priceChange24H) || 0,
            volume24h: parseFloat(token.volume24H) || 0,
          }
        }
      } catch { /* skip */ }
    })
  )

  return results
}

/**
 * Fetch smart money signals from Binance
 */
export async function fetchSmartMoneySignals(limit = 5): Promise<Array<{
  tokenSymbol: string
  action: string
  triggerPrice: number
  currentPrice: number
  maxGain: number
  exitRate: number
}>> {
  try {
    const res = await fetch(
      'https://web3.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/web/signal/smart-money/ai',
      {
        method: 'POST',
        headers: BINANCE_HEADERS,
        body: JSON.stringify({ pageNo: 1, pageSize: limit }),
        signal: AbortSignal.timeout(5000),
      }
    )
    if (!res.ok) return []
    const data = await res.json()
    const signals = data?.data?.list || []
    return signals.map((s: Record<string, unknown>) => ({
      tokenSymbol: (s.tokenSymbol as string) || 'UNKNOWN',
      action: (s.action as string) || 'BUY',
      triggerPrice: parseFloat(String(s.triggerPrice)) || 0,
      currentPrice: parseFloat(String(s.currentPrice)) || 0,
      maxGain: parseFloat(String(s.maxGain)) || 0,
      exitRate: parseFloat(String(s.exitRate)) || 0,
    }))
  } catch {
    return []
  }
}

/**
 * Fetch trending tokens for market context
 */
export async function fetchTrendingTokens(limit = 5): Promise<Array<{
  symbol: string
  price: number
  priceChange: number
  volume: number
}>> {
  try {
    const res = await fetch(
      `https://web3.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/web/rank/unified?rankType=10&pageNo=1&pageSize=${limit}`,
      { headers: BINANCE_HEADERS, signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return []
    const data = await res.json()
    const list = data?.data?.list || []
    return list.map((t: Record<string, unknown>) => ({
      symbol: (t.symbol as string) || '',
      price: parseFloat(String(t.price)) || 0,
      priceChange: parseFloat(String(t.priceChange24H)) || 0,
      volume: parseFloat(String(t.volume24H)) || 0,
    }))
  } catch {
    return []
  }
}

/**
 * Fetch live DeFi yield rates for CASS context
 * Uses Aave API for USDC supply APY and Ondo USYC reference
 */
export async function fetchYieldRates(): Promise<YieldData> {
  const timestamp = new Date().toISOString()
  
  try {
    // Aave V3 Base USDC supply rate
    const aaveRes = await fetch(
      'https://aave-api-v2.aave.com/data/rates-history?reserveId=0x833589fcd6edb6e08f4c7c32d4f71b54bda02913&from=0&resolutionInHours=1',
      { signal: AbortSignal.timeout(5000) }
    )
    let aaveApy = 3.9 // fallback
    if (aaveRes.ok) {
      const aaveData = await aaveRes.json()
      const latest = aaveData?.[aaveData.length - 1]
      if (latest?.liquidityRate_avg) {
        aaveApy = parseFloat((parseFloat(latest.liquidityRate_avg) * 100).toFixed(2))
      }
    }

    // Ondo USYC is roughly tied to Fed Funds rate minus 30bps — use ~4.8% as reference
    const ondoApy = 4.8

    const blended = parseFloat(((aaveApy * 0.4 + ondoApy * 0.4) / 0.8).toFixed(2))

    return { usdc_aave_apy: aaveApy, usyc_ondo_apy: ondoApy, blended_apy: blended, timestamp }
  } catch {
    return { usdc_aave_apy: 3.9, usyc_ondo_apy: 4.8, blended_apy: 4.35, timestamp }
  }
}
