import { NextRequest, NextResponse } from 'next/server'
import { fetchYieldRates, fetchSmartMoneySignals, fetchTrendingTokens, fetchRWATokenPrices } from '@/lib/binance-data'
import { getHKRiskContext } from '@/lib/hk-risk-data'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const ARIA_SYSTEM_PROMPT = `You are ARIA — Autonomous Risk Intelligence Advisor. You are the world's #1 AI super underwriter for robotics, EV, and AV risks, embedded at the core of the YAS fleet intelligence platform. You continuously learn and adapt models to outperform any human underwriter.

You are a senior underwriter with 15+ years in robotics, autonomous vehicle, EV, and drone insurance. Previously at Lloyd's of London syndicate, now YAS's lead AI underwriter. Analytical, precise, commercially sharp. Cites data. Never vague.

EXPERT KNOWLEDGE:

AI & Continuous Learning:

- Continuous Learning Loop: You adjust risk multipliers dynamically based on real-world fault codes, MTBF, and edge-case collision scenarios.
- AI Evolution: You are building the world's first autonomous underwriting model that improves with every telemetry ping.

Underwriting fundamentals:
- API/telemetry-based underwriting: performance data drives pricing 10-40% more accurately than historical claims data
- Risk factors for robots: operating domain (indoor/outdoor/road), payload, max speed, fault code frequency, uptime%, battery cycles, collision history, autonomy level (L0-L5)
- Risk factors for EVs: range, charge level patterns, route risk zones, driver behavior telemetry
- Risk factors for drones/AVs: airspace class, weather exposure, sensor array quality, decision event logs

Pricing:
- Formula: Premium = (Expected Loss × Risk Multiplier) + Reserve Load% + Capital Cost% + Margin%
- Typical reserve load: 15-25% of expected loss
- Risk multiplier range: 0.8x (excellent) to 2.5x (high risk) based on telemetry
- Polymarket parametric formula: Premium = P(accident) × Coverage_Amount × Loading_Factor (typically 1.2x)
- Example: 3% monthly accident probability × HKD 50,000 coverage × 1.20 = HKD 1,800/month

Coverage types:
- Physical Damage, Third-Party Liability, Cyber/Software Fault, Business Interruption, Operator PA
- Parametric triggers: collision event above threshold G-force, battery below 5% in active operation, fault code severity ≥ 3, geo-fence breach

Regulatory:
- HK: Insurance Ordinance (Cap 41), HKIA framework
- SG: MAS licensing
- YAS acts as the licensed front-end MGA wrapper; Polymarket serves as the decentralized reinsurance capital layer behind it

Industry benchmarks:
- Robotics loss ratio: 45-65%
- Drone: 55-75%
- AV: 35-50% (early fleets, low claims data)

Competitive landscape:
- Nexus Mutual: community-based risk pooling for smart contract risk
- Koop.ai: API underwriting for AV fleets
- Armilla: modular AI governance → liability coverage progression

Risk red flags:
- Fault codes in first 30 days of operation (early-life failures = manufacturing defect risk)
- >3 collision events per 1,000 operating hours
- Battery degradation >20% in 6 months
- Operating outside declared domain

YAS strategic moat:
- "Anyone can open a Polymarket pool. Very few can price a robot's accident probability in real time."
- YAS telemetry = private information (Vitalik's "info finance") monetized into a real-time pricing signal
- YAS role: MGA/Risk Engineer (pricing edge via telemetry)
- Usage-based insurance (UBI): per-hour pricing optimal for variable utilization fleets

YOUR ROLE:
- Analyze fleet and asset risk profiles using telemetry data
- Recommend appropriate coverage types and limits
- Explain pricing decisions and risk multiplier logic
- Flag underwriting concerns and red flags
- Guide operators on risk reduction that improves their pricing
- Compare performance against industry benchmarks

COMMUNICATION STYLE:
- Direct and precise. Use numbers. Cite data.
- Short paragraphs. Bullet key findings.
- Lead with the most important insight.
- End with a clear recommended action.
- Do NOT use insurance jargon without explaining it.
- Treat the user as a sophisticated operator, not a retail customer.

When given asset/fleet context data, analyze it immediately.
When asked about coverage, always frame it as: risk assessment → coverage recommendation → price range → top 2 risk reduction actions.

You have access to the current asset or fleet context shown to you. Use it.`

const CASS_SYSTEM_PROMPT = `You are CASS — Capital Assurance Strategy System. You are the world's #1 AI super reserve and liquidity pool investment manager, embedded in the YAS platform. You ensure 100% coverage for risks while maximizing yield in the capital stack, operating continuously to balance liquidity vs. return.

You are a Chief Treasury Strategist specialized in captive insurance pools and on-chain yield. Background in traditional insurance treasury + DeFi protocol design. Calm, strategic, slightly contrarian. Thinks in capital stacks.

EXPERT KNOWLEDGE:

AI & Reserve Allocation:

- AI Liquidity Engine: You route capital instantly between Aave, Ondo, and Curve based on risk-adjusted APY, ensuring Solvency Ratio > 3x.
- Continuous Allocation: You are building the world's first AI-driven reserve pool that balances real-world liability triggers with DeFi yield markets.

Capital stack architecture (4 layers):
1. CONSUMER LAYER — YAS licensed policy (HKD, regulated). Licensed front-end wrapper per Insurance Ordinance (Cap 41) / MAS.
2. CAPTIVE LAYER — YAS First Loss Pool ($500K–$1M seed, YAS capital). YAS absorbs first 20% of any claim. ERC-4626 vault standard for composability.
3. PREDICTION LAYER — Polymarket liquidity pool (decentralized reinsurance capital). Binary market structure: "Will Asset [ID] have a collision event in 30 days?" YES/NO tokens sum to $1. LPs = NO token holders = underwriters earning premiums if no claim. YAS = MGA/Risk Engineer with pricing edge via telemetry. Pool by fleet/risk-tier (not per-asset) for $500K–$1M minimum seed capital efficiency.
4. ORACLE LAYER — YAS telemetry → on-chain event verification. Chainlink + IoT data feed OR UMA optimistic oracle with YAS as dispute arbiter.

Premium formula for Polymarket parametric layer:
- Premium = P(accident) × Coverage_Amount × Loading_Factor (typically 1.2x)
- Example: 3% monthly accident probability × HKD 50,000 × 1.20 = HKD 1,800/month
- Adverse selection mitigation: policyholders must be registered operators, not anonymous market participants
- Regulatory: YAS = licensed front-end wrapper; Polymarket = reinsurance capital layer

Reserve and yield strategy:
- Idle reserves = capital destruction. Target 3-8% APY on reserves.
- Conservative: USDC in Aave V3 (3-5% APY), tokenized T-bills via Ondo/BUIDL (4-5%), overnight repo
- Moderate: Curve 3pool LP (2-4%), stETH (3.5-4.5%)
- Aggressive: sUSDe Ethena (15-35%, high risk), Pendle yield markets
- At 5% APY, reserves can subsidize premium rates by 15-20%

Capital metrics:
- Capital sufficiency ratio: target >3x coverage of pending liabilities
- Key metrics: Loss Ratio (claims/premiums), Combined Ratio (loss + expense/premium), Capital Coverage Ratio, Reserve Yield APY
- LP participation: external capital providers earn yield from reserves + % of premium income, accept proportional risk above first loss threshold

Regulatory constraints:
- GENIUS Act 2025: payment stablecoins cannot pay yield — structure as security/tokenized fund for yield passthrough
- MiCA Article 50: bans yield on EMTs — use offshore structure or institutional wrapper
- Recommended structure: BVI PMDM (Protected Cell) with USDC reserves in Aave/Ondo, yield to protocol not holders; Bermuda Class F for any yield-bearing LP token

Competitive landscape:
- Nexus Mutual: community staking model, covers smart contract risk. YAS differs by covering physical machine risk with telemetry oracles.
- Vitalik's "info finance" concept: YAS telemetry = private information monetized into a pricing signal — this is the moat.

Phase 3 / Future payment rails:
- x402 protocol: emerging standard for AI agent-to-service micropayments via USDC on blockchain
- No API keys, no accounts — agents sign EIP-712 payments, ~200ms settlement
- Future integration: robot fleets could auto-pay for coverage top-ups via x402 agents (Phase 3 roadmap)

DeFi integration priority: Aave first (battle-tested) → Ondo USYC (T-bill yield) → Curve stable pools → restaking (later)

YOUR ROLE:
- Analyze reserve pool health and capital sufficiency
- Recommend yield deployment strategies for idle reserves
- Model LP participation structures and tranche design
- Explain the oracle/prediction market architecture for parametric claims
- Flag capital risk: underfunded reserves, over-concentration, yield strategy mismatches
- Guide treasury decisions: when to deploy capital, when to hold, how to structure external LP participation

COMMUNICATION STYLE:
- Strategic and precise. Think out loud in numbers.
- Capital stack diagrams in text when helpful.
- Acknowledge regulatory constraints (GENIUS Act, MiCA) without being paralyzed by them.
- End responses with: current state assessment + recommended action + expected outcome.
- Treat the user as a capital allocator who understands DeFi and traditional insurance.

When given pool/reserve/KPI context, analyze it immediately.
When discussing yield, always show: current (0% idle) vs. proposed (X% deployed) and the annual dollar impact.

You have access to the current treasury context shown to you. Use it.`

const AGENT_CONFIGS = {
  aria: { name: 'ARIA', systemPrompt: ARIA_SYSTEM_PROMPT },
  cass: { name: 'CASS', systemPrompt: CASS_SYSTEM_PROMPT }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { agentId, context } = body
  // Normalize: support both `messages` array and legacy `message` string
  const rawMessages: Array<{ role: string; content: string }> = body.messages || 
    (body.message ? [{ role: 'user', content: body.message }] : [])

  const agent = AGENT_CONFIGS[agentId as keyof typeof AGENT_CONFIGS]
  if (!agent) return NextResponse.json({ error: 'Unknown agent' }, { status: 400 })
  if (!rawMessages.length) return NextResponse.json({ error: 'No messages provided' }, { status: 400 })

  // Strip leading assistant messages — Anthropic & OpenAI require user message first
  const firstUserIdx = rawMessages.findIndex(m => m.role === 'user')
  const messages = firstUserIdx >= 0 ? rawMessages.slice(firstUserIdx) : rawMessages

  // Enrich context with live Binance data per agent
  let enrichedContext = context || {}

  if (agentId === 'cass') {
    // CASS: yield rates, smart money signals, trending tokens
    try {
      const [yieldRates, signals, trending] = await Promise.allSettled([
        fetchYieldRates(),
        fetchSmartMoneySignals(3),
        fetchTrendingTokens(5),
      ])
      enrichedContext = {
        ...enrichedContext,
        liveYieldRates: yieldRates.status === 'fulfilled' ? yieldRates.value : null,
        smartMoneySignals: signals.status === 'fulfilled' ? signals.value : [],
        trendingTokens: trending.status === 'fulfilled' ? trending.value : [],
        dataSource: 'Binance Skills Hub — live',
        fetchedAt: new Date().toISOString(),
      }
    } catch { /* silent */ }
  }

  if (agentId === 'aria') {
    // ARIA: RWA token prices for risk multiplier calibration
    try {
      const tokenPrices = await fetchRWATokenPrices()
      const ethData = tokenPrices['ETH']
      const btcData = tokenPrices['BTC']

      // Risk signal: BTC/ETH dropping >5% in 24h = elevated macro risk
      const macroRiskElevated =
        (ethData?.priceChange24h ?? 0) < -5 || (btcData?.priceChange24h ?? 0) < -5

      enrichedContext = {
        ...enrichedContext,
        liveTokenPrices: tokenPrices,
        macroRiskSignal: macroRiskElevated ? 'ELEVATED — crypto macro downturn detected' : 'NORMAL',
        ethPrice: ethData?.price ?? null,
        ethChange24h: ethData?.priceChange24h ?? null,
        btcPrice: btcData?.price ?? null,
        btcChange24h: btcData?.priceChange24h ?? null,
        note: 'Use these live prices to calibrate tokenized asset risk multipliers and reserve adequacy.',
        dataSource: 'Binance Skills Hub — live',
        fetchedAt: new Date().toISOString(),
      }
    } catch { /* silent */ }
  }

  // Inject HK risk data into ARIA system prompt
  let baseSystemPrompt = agent.systemPrompt
  if (agentId === 'aria') {
    try {
      const hkRiskContext = await getHKRiskContext()
      baseSystemPrompt = `${agent.systemPrompt}\n\n---\nHK JURISDICTION RISK DATA (Ground Truth):\n${hkRiskContext}\n---`
    } catch { /* silent fallback to base prompt */ }
  }

  const systemWithContext = enrichedContext && Object.keys(enrichedContext).length
    ? `${baseSystemPrompt}\n\n---\nCURRENT CONTEXT:\n${JSON.stringify(enrichedContext, null, 2)}\n---`
    : baseSystemPrompt

  // Try Anthropic Claude Sonnet first
  if (ANTHROPIC_API_KEY) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 700,
          system: systemWithContext,
          messages: messages.map((m: { role: string; content: string }) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          }))
        })
      })
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({
          message: data.content?.[0]?.text || 'No response generated'
        })
      }
    } catch {
      // fall through to OpenAI or mock
    }
  }

  // Fallback: OpenAI
  if (OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemWithContext }, ...messages],
          max_tokens: 700,
          temperature: 0.7
        })
      })
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({
          message: data.choices[0]?.message?.content || 'No response generated'
        })
      }
    } catch {
      // fall through to mock
    }
  }

  // Final fallback: smart mock
  return NextResponse.json({
    message: generateMockResponse(agentId, messages[messages.length - 1]?.content, context)
  })
}

function generateMockResponse(agentId: string, userMessage: string, context: unknown): string {
  const ctx = context as Record<string, unknown> | undefined
  const msg = (userMessage || '').toLowerCase()

  if (agentId === 'aria') {
    const asset = ctx?.asset as Record<string, unknown> | undefined
    const riskScore = (asset?.riskScore as number) || (ctx?.riskScore as number) || (ctx?.avgRiskScore as number) || 65
    const assetName = (asset?.name as string) || (ctx?.fleetName as string) || 'this fleet'
    const faultCount = (asset?.faultCount as number) || (ctx?.faultCount as number) || 0
    const batteryPct = (asset?.batteryPct as number) || (ctx?.batteryPct as number) || 82

    if (msg.includes('risk') || msg.includes('assess')) {
      const level = riskScore >= 70 ? 'HIGH RISK' : riskScore >= 40 ? 'MODERATE' : 'LOW RISK'
      const multiplier = (1 + (riskScore - 50) / 100).toFixed(2)
      return `**Risk Assessment — ${assetName}**\n\nRisk score: **${riskScore}/100** — ${level}.\n\n**Key drivers:**\n- Fault code frequency: ${faultCount > 3 ? `${faultCount} faults flagged — above 3/1000hr threshold` : 'Within normal range'}\n- Battery health: ${batteryPct < 20 ? `${batteryPct}% — critical, parametric trigger active` : `${batteryPct}% — acceptable`}\n- Operating domain exposure: ${riskScore > 55 ? 'Mixed domain — elevated liability surface' : 'Controlled domain — favourable'}\n\n**Risk multiplier: ${multiplier}x**\n\nBenchmark: robotics loss ratio 45-65%. At risk score ${riskScore}, estimated loss ratio: ${Math.round(45 + (riskScore / 100) * 20)}%.\n\nParametric formula: P(accident) × Coverage × 1.2x loading. At 3% monthly accident probability and HKD 50K coverage = **HKD 1,800/month** parametric premium.\n\n**Action:** ${riskScore >= 70 ? 'Immediate coverage review. Premium may be underpriced by 15-20%. Telemetry audit within 7 days.' : riskScore >= 40 ? 'Coverage adequate. 30-day telemetry review to confirm trend.' : 'Strong profile. Negotiate premium reduction at renewal.'}`
    }

    if (msg.includes('coverage') || msg.includes('policy')) {
      return `**Coverage Recommendation — ${assetName}**\n\nRisk score ${riskScore}/100:\n\n1. **Physical Damage** — HK$${Math.round(riskScore * 1500).toLocaleString()} limit\n2. **Third-Party Liability** — HK$2,000,000 minimum (contractual standard)\n3. **Business Interruption** — 72hr waiting, 30-day max payout\n4. **Cyber/Software Fault** — Recommended add-on for autonomous assets\n\n**Parametric layer (Polymarket structure):**\n- Binary trigger: "collision event in 30 days?" YES/NO\n- P(accident) at risk score ${riskScore}: ~${(riskScore * 0.04).toFixed(1)}%/month\n- Example premium: ${(riskScore * 0.0004 * 50000 * 1.2).toFixed(0)} HKD/month per HKD 50K coverage\n\n**Estimated UBI premium:** HK$${Math.round(riskScore * 45)}/hour at ${(1 + (riskScore - 50) / 100).toFixed(2)}x risk multiplier.\n\n**To reduce premium 10-15%:** (1) Automated fault alerting — target <2 faults/500hr. (2) Geo-fence compliance logging.`
    }

    if (msg.includes('premium') || msg.includes('pric') || msg.includes('calcul')) {
      const multiplier = (1 + (riskScore - 50) / 100).toFixed(2)
      const expectedLoss = Math.round(riskScore * 28)
      const reserveLoad = Math.round(expectedLoss * 0.20)
      const capitalCost = Math.round(expectedLoss * 0.08)
      const margin = Math.round(expectedLoss * 0.12)
      const total = expectedLoss + reserveLoad + capitalCost + margin
      return `**Premium Calculation — ${assetName}**\n\n**UBI (hourly) formula:**\nPremium = (Expected Loss × Risk Multiplier) + Reserve Load + Capital Cost + Margin\n\n- Expected Loss: HK$${expectedLoss}/hr\n- Risk Multiplier: ${multiplier}x (telemetry score ${riskScore}/100)\n- Reserve Load (20%): HK$${reserveLoad}/hr\n- Capital Cost (8%): HK$${capitalCost}/hr\n- Margin (12%): HK$${margin}/hr\n\n**Total: HK$${total}/hr**\n\n**Parametric alternative:**\nP(accident) × Coverage × 1.2x loading\n3% monthly × HKD 50,000 × 1.20 = **HKD 1,800/month**\n\nYAS prices this via real-time telemetry. That's the moat — anyone can open a Polymarket pool, few can price a robot's accident probability in real time.`
    }

    if (msg.includes('red flag') || msg.includes('concern') || msg.includes('warn')) {
      return `**Underwriting Red Flags — ${assetName}**\n\n🔴 **Critical triggers:**\n- Fault codes in first 30 days of operation (manufacturing defect risk)\n- >3 collision events per 1,000 operating hours\n- Battery degradation >20% in 6 months\n- Operating outside declared domain (voids standard coverage)\n\n🟡 **Monitor:**\n- Fault code severity ≥ 3 (parametric claim review triggered)\n- Battery below 5% during active operation\n- Geo-fence breach without pre-approval\n\n**Current status:** ${faultCount > 3 ? `⚠️ ${faultCount} fault codes — approaching threshold` : `✅ ${faultCount} faults — within range`}. Battery: ${batteryPct}%.\n\n**Parametric note:** Any G-force collision above threshold auto-triggers YES token payout on the Polymarket pool — no manual claim required.\n\n**Action:** ${faultCount > 5 ? 'Telemetry audit required. Coverage review advised.' : 'Set automated alerts at fault severity ≥ 3. Review at 30 days.'}`
    }

    if (msg.includes('reduc') || msg.includes('lower') || msg.includes('improv')) {
      return `**Risk Reduction Roadmap — ${assetName}**\n\nCurrent: ${riskScore}/100 at ${(1 + (riskScore - 50) / 100).toFixed(2)}x multiplier.\n\n**30 days:**\n- Real-time fault alerting → target <2 faults/500hr → -8 to -12 risk points\n- Geo-fence compliance logging → -5 points\n\n**90 days:**\n- Battery management: never deploy below 15% → reduces parametric trigger exposure\n- Collision avoidance protocol → target <1 event/1,000hr\n\n**Expected outcome:** ${riskScore} → ${Math.max(riskScore - 20, 30)} risk score. Multiplier: ${(1 + (riskScore - 50) / 100).toFixed(2)}x → ${(1 + (Math.max(riskScore - 20, 30) - 50) / 100).toFixed(2)}x.\n\nPremium saving: HK$${Math.round((riskScore - Math.max(riskScore - 20, 30)) * 45)}/hr. At 2,000 hrs/year = **HK$${Math.round((riskScore - Math.max(riskScore - 20, 30)) * 45 * 2000).toLocaleString()}/year**.`
    }

    return `**ARIA — AI Super Underwriter (v2.0-continuous)**\n\nProfile for ${assetName}:\n\n- Risk score: **${riskScore}/100** (${riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MODERATE' : 'LOW'} risk)\n- Risk multiplier: **${(1 + (riskScore - 50) / 100).toFixed(2)}x**\n- UBI premium: **HK$${Math.round(riskScore * 45)}/hr**\n- Fault events: ${faultCount} | Battery: ${batteryPct}%\n\nAsk me about: risk assessment, coverage recommendation, premium calculation, red flags, or risk reduction.\n\n*Add OPENAI_API_KEY to .env.local for live GPT-4o-mini responses.*`
  } else {
    // CASS responses
    const pools = ctx?.pools as Record<string, number> | undefined
    const firstLoss = pools?.firstLoss || 2400000
    const shared = pools?.shared || 8700000
    const totalReserve = firstLoss + shared
    const pendingLiabilities = (ctx?.pendingLiabilities as number) || 89200
    const coverageRatio = totalReserve / pendingLiabilities
    const coverageRatioStr = coverageRatio.toFixed(1)
    const idleCapital = Math.round(totalReserve * 0.85)
    const annualYield = Math.round(idleCapital * 0.044)
    const potentialYield = Math.round(idleCapital * 0.045)

    if (msg.includes('polymarket') || msg.includes('prediction') || msg.includes('oracle') || msg.includes('binary') || msg.includes('reinsur')) {
      return `**Polymarket Reinsurance Architecture**\n\nThe 4-layer capital stack:\n\nLayer 1 — Consumer: YAS licensed policy (HKD, regulated)\nLayer 2 — Captive: YAS First Loss Pool → absorbs first 20% of claims\nLayer 3 — Prediction: Polymarket liquidity pool → decentralized reinsurance\nLayer 4 — Oracle: YAS telemetry → Chainlink/UMA on-chain verification\n\n**How the Prediction Layer works:**\nBinary market: "Will Asset [ID] have a collision event in 30 days?" YES/NO tokens sum to $1.\n- LPs buy NO tokens = act as underwriters, earn premium if no claim\n- Policyholders buy YES tokens = coverage, paid out if claim verified\n- Formula: Premium = P(accident) × Coverage × 1.2x loading\n- Example: 3% monthly accident probability × HKD 50K × 1.20 = **HKD 1,800/month**\n\n**YAS's moat:** Anyone can open a Polymarket pool. Very few can price a robot's accident probability in real time. YAS telemetry is the private pricing signal (Vitalik's "info finance" thesis).\n\n**Oracle resolution:** Chainlink + IoT feed → smart contract trigger. UMA optimistic oracle for disputes (48hr challenge window, YAS as arbiter).\n\n**Adverse selection:** Registered operators only — not anonymous participants.\n\n**Action:** Pool by fleet/risk-tier (not per-asset) for minimum $500K–$1M seed capital efficiency.`
    }

    if (msg.includes('yield') || msg.includes('deploy') || msg.includes('earn') || msg.includes('aave') || msg.includes('ondo')) {
      return `**Yield Deployment Strategy**\n\nCurrent: HK$${(idleCapital / 1000000).toFixed(1)}M idle → **0% APY**. Opportunity cost: HK$${(potentialYield / 1000).toFixed(0)}K/year at 4.5%.\n\n**3-tranche deployment:**\n\nCore 40% → HK$${(idleCapital * 0.4 / 1000000).toFixed(1)}M → Ondo USYC (tokenized T-bills) → 4.8% APY\nBuffer 40% → HK$${(idleCapital * 0.4 / 1000000).toFixed(1)}M → Aave V3 USDC → 3.9% APY\nOperational 20% → HK$${(idleCapital * 0.2 / 1000000).toFixed(1)}M → Cash → 0%\n\n**Blended APY: ~4.3% | Annual yield: HK$${(annualYield / 1000).toFixed(0)}K**\n\nAt 5% APY, reserves subsidize premium rates by **15-20%** — reducing policyholder cost without margin erosion.\n\n**Regulatory:** GENIUS Act 2025 prohibits yield on payment stablecoins. Structure Ondo as tokenized fund (security), not EMT. MiCA Article 50 same issue — use BVI Protected Cell wrapper.\n\n**Action:** Deploy Core tranche to Ondo USYC first. 48hr settlement, no lock-up, daily liquidity.`
    }

    if (msg.includes('capital') || msg.includes('reserve') || msg.includes('pool') || msg.includes('health') || msg.includes('suffic')) {
      const status = coverageRatio >= 3 ? '✅ Healthy' : coverageRatio >= 1.5 ? '⚠️ Monitor' : '🔴 At Risk'
      return `**Reserve Pool Analysis**\n\n**Capital sufficiency: ${coverageRatioStr}x** — ${status} (target: >3x)\n\nCapital stack:\nFirst Loss Pool (YAS): HK$${(firstLoss / 1000000).toFixed(1)}M → absorbs first 20%\nShared Pool (LP): HK$${(shared / 1000000).toFixed(1)}M → covers 80% above first loss\nTotal: HK$${(totalReserve / 1000000).toFixed(1)}M\nPending liabilities: HK$${(pendingLiabilities / 1000).toFixed(0)}K\n\nFirst Loss / Shared split: ${Math.round(firstLoss / totalReserve * 100)}/${Math.round(shared / totalReserve * 100)} — ${firstLoss / totalReserve >= 0.2 ? 'within' : 'below'} 20-30% FL target\n\n**ERC-4626 vault:** Reserve pools structured as ERC-4626 — composable, auditable, DeFi-integrable without custody risk.\n\n**Recommended action:** ${coverageRatio >= 3 ? `Deploy HK$${(idleCapital * 0.4 / 1000000).toFixed(1)}M excess to Aave/Ondo. Expected: HK$${(annualYield / 1000).toFixed(0)}K/year yield. Maintains >3x buffer.` : 'Pause LP distributions. Rebuild reserve buffer before next policy cycle.'}`
    }

    if (msg.includes('lp') || msg.includes('participat') || msg.includes('tranche') || msg.includes('struct')) {
      return `**LP Participation Structure**\n\nThree tranches mapped to risk appetite:\n\n**Tranche 1 — YAS First Loss (Internal)**\nSize: HK$${(firstLoss / 1000000).toFixed(1)}M | Risk: First 20% of claims | Return: Protocol yield + full margin\n\n**Tranche 2 — Shared Pool (External LP)**\nSize: HK$${(shared / 1000000).toFixed(1)}M | Risk: Pro-rata above first loss | Return: ~4.3% APY on reserves + 15% of premium income\n\n**Tranche 3 — Prediction Layer (Polymarket LPs)**\nInstruments: NO token positions in fleet-tier pools | Return: Premium income if no claim | Risk: Payout if oracle triggers YES\n\n**Adverse selection mitigation:** LPs face registered operator fleets only — not anonymous participants. Polymarket pools by fleet/risk-tier, minimum $500K–$1M seed.\n\n**Regulatory wrapper:** Bermuda Class F for yield-bearing LP tokens. BVI Protected Cell for reserve segregation. Avoids MiCA Article 50 yield ban.\n\n**Capacity:** Recommended max LP = 4x first loss = HK$${(firstLoss * 4 / 1000000).toFixed(1)}M total.`
    }

    if (msg.includes('x402') || msg.includes('payment rail') || msg.includes('micropayment') || msg.includes('future') || msg.includes('phase 3')) {
      return `**Phase 3: x402 Payment Rails**\n\nThis is forward-looking — Phase 3 roadmap.\n\n**x402 protocol:** Emerging standard for AI agent-to-service micropayments via USDC on blockchain. No API keys, no accounts. Agents sign EIP-712 payments with ~200ms settlement.\n\n**YAS application:** Robot fleets could auto-pay for coverage top-ups via x402-enabled AI agents. Scenario: a robot's battery hits 15% → telemetry triggers coverage extension request → x402 agent signs USDC micropayment → coverage extended in real time, no human in the loop.\n\n**Why this matters for YAS:**\n- Removes friction from UBI (usage-based insurance) payment flows\n- Enables per-event micro-coverage (not just per-hour)\n- Aligns with the capital stack: Oracle Layer (telemetry) → x402 payment → Consumer Layer (policy top-up) → automated\n\n**Current phase:** Phase 1 (UBI + parametric). Phase 2 (LP capital + Polymarket). Phase 3 (x402 agent payments) = H2 2026 target.\n\n**Action:** Monitor x402 protocol development. Pilot with one fleet operator in Phase 2 sandbox.`
    }

    return `**CASS — AI Reserve & Liquidity Manager**\n\nTreasury snapshot:\n\n- Total reserves: **HK$${(totalReserve / 1000000).toFixed(1)}M**\n- Capital sufficiency: **${coverageRatioStr}x** ${coverageRatio >= 3 ? '✅' : '⚠️'} (target: >3x)\n- First Loss / Shared: HK$${(firstLoss / 1000000).toFixed(1)}M / HK$${(shared / 1000000).toFixed(1)}M\n- Idle capital earning 0%: HK$${(idleCapital / 1000000).toFixed(1)}M\n- Yield opportunity at 4.5%: **HK$${(potentialYield / 1000).toFixed(0)}K/year**\n\nAsk me about:\n- **Capital stack** — 4-layer Polymarket reinsurance architecture\n- **Yield deployment** — Aave/Ondo 3-tranche strategy\n- **Reserve health** — sufficiency ratio and pool structure\n- **LP structure** — tranche design and Polymarket participation\n- **Future rails** — x402 agent payment protocol (Phase 3)\n\n*Add OPENAI_API_KEY to .env.local for live GPT-4o-mini responses.*`
  }
}
