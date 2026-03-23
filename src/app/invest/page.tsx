"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Shield, TrendingUp, Database, CheckCircle, X, ChevronRight, Wallet } from "lucide-react";


const AgentFAB = dynamic(() => import("@/components/AgentFAB"), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────
interface Tranche {
  id: string;
  name: string;
  risk: string;
  apy: string;
  desc: string;
  waterfall: string;
  capital: number;
  capitalLabel: string;
  filledPct: number;
  minInvest: string;
  features: string[];
  color: string;
  recommended?: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const TRANCHES: Tranche[] = [
  {
    id: "senior",
    name: "Senior Tranche",
    risk: "Low",
    apy: "12–14%",
    desc: "First priority in payout waterfall",
    waterfall: "Priority payout",
    capital: 6000000,
    capitalLabel: "HKD 6,000,000",
    filledPct: 82,
    minInvest: "HKD 500,000",
    features: ["Quarterly liquidity", "Priority payout", "Audited reserve backing"],
    color: "#3B82F6",
  },
  {
    id: "mezzanine",
    name: "Mezzanine Tranche",
    risk: "Medium",
    apy: "18–22%",
    desc: "Second in waterfall, enhanced yield",
    waterfall: "Enhanced yield",
    capital: 3000000,
    capitalLabel: "HKD 3,000,000",
    filledPct: 56,
    minInvest: "HKD 250,000",
    features: ["Semi-annual liquidity", "Enhanced yield", "Telemetry-linked pricing"],
    color: "#14B8A6",
    recommended: true,
  },
  {
    id: "junior",
    name: "Junior Tranche",
    risk: "High",
    apy: "28–35%",
    desc: "First loss position, highest yield",
    waterfall: "Maximum yield",
    capital: 2000000,
    capitalLabel: "HKD 2,000,000",
    filledPct: 31,
    minInvest: "HKD 100,000",
    features: ["Annual liquidity", "Maximum yield", "Polymarket YES token exposure"],
    color: "#A855F7",
  },
];

const MECHANICS = [
  {
    title: "How It Works",
    desc: "Premium flow → Pool allocation → Risk-adjusted yield. Each policy premium is split across tranches by seniority. Parametric triggers automate payouts — no manual claims processing.",
    icon: TrendingUp,
    color: "#3B82F6",
  },
  {
    title: "Oracle Settlement",
    desc: "Chainlink + UMA oracle stack. Parametric triggers fire automatically on verified telemetry events. Average settlement time: 2h 14m. No adjuster required.",
    icon: Shield,
    color: "#14B8A6",
  },
  {
    title: "Capital Protection",
    desc: "ERC-4626 vault standard ensures composable, auditable reserve management. 3.42× reserve ratio maintained. Senior tranche has first priority in any drawdown.",
    icon: Database,
    color: "#A855F7",
  },
  {
    title: "Regulatory Structure",
    desc: "BVI PMDM structure with HK MGA oversight. Quarterly independent audit. All pool activity verifiable on-chain. Accredited investors only.",
    icon: CheckCircle,
    color: "#F59E0B",
  },
];

const INVESTOR_TYPES = ["Family Office", "Hedge Fund", "Corporate Treasury", "Individual Accredited Investor"];

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  tranche: Tranche | null;
  onClose: () => void;
}

function InvestModal({ tranche, onClose }: ModalProps) {
  const login = () => {}; const authenticated = false; const user = null;
  const [selectedTranche, setSelectedTranche] = useState<string>(tranche?.id ?? "mezzanine");
  const [amount, setAmount] = useState("");
  const [investorType, setInvestorType] = useState(INVESTOR_TYPES[0]);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [declared, setDeclared] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [refCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());

  if (!tranche && selectedTranche === undefined) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticated) {
      login();
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSubmitted(true);
    }, 1500);
  };

  const selected = TRANCHES.find(t => t.id === selectedTranche) ?? TRANCHES[1];
  const walletAddress: string | undefined = undefined;
  const shortWallet = walletAddress ? `${(walletAddress as string).slice(0, 6)}...${ (walletAddress as string).slice(-4)}` : "";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(2,2,3,0.85)", backdropFilter: "blur(8px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg bg-yas-panel border border-white/[0.10] rounded-2xl overflow-hidden"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <h3 className="text-sm font-bold text-yas-text">Provide Vault Liquidity</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4 text-yas-muted" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-400" />
            </div>
            <div>
              <h4 className="text-base font-bold text-yas-text mb-2">Transaction Confirmed</h4>
              <p className="text-sm text-yas-subtext leading-relaxed">
                Smart contract successfully executed. Your liquidity position is now active in the {selected.name}.
              </p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-yas-blue/10 border border-yas-blue/20">
              <p className="text-xs text-yas-muted">Transaction Hash</p>
              <p className="text-sm font-bold text-yas-blue font-mono">0x{refCode}a3...9b2</p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2 rounded-xl bg-yas-blue text-white text-sm font-semibold hover:bg-yas-blue/90 transition-colors"
            >
              Back to Pool
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            {/* Tranche */}
            <div>
              <label className="text-xs text-yas-muted mb-2 block">Tranche</label>
              <div className="grid grid-cols-3 gap-2">
                {TRANCHES.map(t => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setSelectedTranche(t.id)}
                    className="p-2.5 rounded-xl border text-xs font-semibold transition-all"
                    style={{
                      borderColor: selectedTranche === t.id ? t.color : "rgba(255,255,255,0.08)",
                      background: selectedTranche === t.id ? `${t.color}14` : "rgba(255,255,255,0.02)",
                      color: selectedTranche === t.id ? t.color : "#64748B",
                    }}
                  >
                    {t.name.replace(" Tranche", "")}
                    <div className="text-[10px] mt-0.5 font-normal" style={{ color: selectedTranche === t.id ? t.color : "#64748B" }}>{t.apy}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs text-yas-muted mb-2 block">Deposit Amount (USDC)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-yas-muted">USDC</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-14 pr-4 py-2.5 text-sm text-yas-text placeholder:text-yas-muted focus:outline-none focus:border-yas-blue/40"
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-yas-muted">
                <span>Balance: 124,500.00 USDC</span>
                <button type="button" onClick={() => setAmount("124500")} className="text-yas-blue hover:underline">MAX</button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-yas-panel border border-white/[0.08] flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-yas-muted">Estimated APY</span>
                <span className="font-bold text-yas-text" style={{ color: selected.color }}>{selected.apy}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-yas-muted">Network Fee</span>
                <span className="text-yas-text">0.002 ETH</span>
              </div>
            </div>

            {/* Declaration */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={declared}
                onChange={e => setDeclared(e.target.checked)}
                required
                className="mt-0.5 flex-shrink-0"
              />
              <span className="text-xs text-yas-subtext leading-relaxed">
                I confirm I am an accredited investor and understand the risks associated with participating in parametric insurance capital pools, including potential total loss of invested capital.
              </span>
            </label>

            {authenticated ? (
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-yas-blue/10 border border-yas-blue/20">
                  <Wallet className="w-4 h-4 text-yas-blue" />
                  <span className="text-sm font-semibold text-yas-blue">Connected: {shortWallet || 'Verified'}</span>
                </div>
                <button
                  type="submit"
                  disabled={!declared || isProcessing}
                  className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: (!declared || isProcessing) ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #3B82F6, #2563EB)",
                    color: (!declared || isProcessing) ? "#64748B" : "#fff",
                    cursor: (!declared || isProcessing) ? "not-allowed" : "pointer",
                  }}
                >
                  {isProcessing ? "Processing via Smart Contract..." : "Deposit via Wallet & Smart Contract"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); login(); }}
                className="w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                style={{ background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet to Invest
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function InvestPage() {
  const [modalTranche, setModalTranche] = useState<Tranche | null>(null);
  const [showModal, setShowModal] = useState(false);

  const openModal = (t: Tranche) => {
    setModalTranche(t);
    setShowModal(true);
  };

  const cassContext = {
    page: "LP Investor Portal",
    poolBalances: { senior: 6000000, mezzanine: 3000000, junior: 2000000 },
    currentAPY: "18.4%",
    poolUtilisation: "34%",
    lossRatio: "23.4%",
    reserveCoverage: "3.42×",
  };

  return (
    <div className="pt-4 md:pt-6 pb-24 md:pb-8 px-4 md:px-6 max-w-7xl mx-auto">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <h1 className="text-3xl font-bold text-yas-text tracking-tight">AI Super Underwriter LP Pool</h1>
          <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold uppercase tracking-widest flex-shrink-0">
            OPEN FOR INVESTMENT · Vault 2.0
          </span>
        </div>
        <p className="text-yas-muted text-sm mb-4">
          Provide liquidity for dynamic parametric pricing. Machine learning adjusts yields hourly based on fleet telemetry.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yas-blue/10 border border-yas-blue/20">
            <TrendingUp className="w-3.5 h-3.5 text-yas-blue" />
            <span className="text-xs font-semibold text-yas-blue">Current ML Yield APY: 18.4%</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yas-teal/10 border border-yas-teal/20">
            <Database className="w-3.5 h-3.5 text-yas-teal" />
            <span className="text-xs font-semibold text-yas-teal">Algorithm Confidence: 99.2%</span>
          </div>
        </div>
      </div>

      {/* ─── Section 1: Performance metrics ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            title: "Loss Ratio",
            value: "23.4%",
            sub: "Industry avg: 67%",
            note: "2.9× below industry average",
            color: "#22C55E",
          },
          {
            title: "Premium Yield",
            value: "18.4%",
            sub: "Annualised",
            note: "Based on trailing 12-month data",
            color: "#3B82F6",
          },
          {
            title: "Reserve Coverage",
            value: "3.42×",
            sub: "Min requirement: 1.5×",
            note: "2.28× above minimum",
            color: "#A855F7",
          },
        ].map(({ title, value, sub, note, color }) => (
          <div key={title} className="bg-yas-panel border border-white/[0.08] rounded-2xl p-5">
            <p className="text-xs text-yas-muted mb-1">{title}</p>
            <p className="text-3xl font-bold mb-1" style={{ color }}>{value}</p>
            <p className="text-[11px] text-yas-muted mb-2">{sub}</p>
            <div
              className="text-[10px] font-semibold px-2 py-1 rounded-lg inline-block"
              style={{ background: `${color}14`, color }}
            >
              {note}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Section 2: Tranche Selection ────────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-base font-bold text-yas-text mb-4">Select Your Tranche</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRANCHES.map((t) => (
            <div
              key={t.id}
              className="bg-yas-panel border rounded-2xl p-5 flex flex-col gap-4 relative"
              style={{ borderColor: t.recommended ? t.color + "50" : "rgba(255,255,255,0.08)" }}
            >
              {t.recommended && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest"
                  style={{ background: t.color, color: "#fff" }}
                >
                  RECOMMENDED
                </div>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-yas-text">{t.name}</p>
                  <p className="text-[11px] text-yas-muted mt-0.5">{t.desc}</p>
                </div>
                <span
                  className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md flex-shrink-0"
                  style={{ background: `${t.color}18`, color: t.color, border: `1px solid ${t.color}30` }}
                >
                  {t.risk} Risk
                </span>
              </div>

              <div>
                <p className="text-[10px] text-yas-muted mb-1">Target APY</p>
                <p className="text-2xl font-bold" style={{ color: t.color }}>{t.apy}</p>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-yas-muted">{t.capitalLabel}</span>
                  <span style={{ color: t.color }}>{t.filledPct}% filled</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${t.filledPct}%`, background: t.color, transition: "width 1.2s ease-out" }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-yas-muted">Min. investment</span>
                <span className="font-semibold text-yas-text">{t.minInvest}</span>
              </div>

              <div className="flex flex-col gap-1.5">
                {t.features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 flex-shrink-0" style={{ color: t.color }} />
                    <span className="text-[11px] text-yas-subtext">{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => openModal(t)}
                className="w-full py-2.5 rounded-xl text-sm font-bold mt-auto transition-all hover:opacity-90 flex items-center justify-center gap-1.5"
                style={{ background: t.color, color: "#fff" }}
              >
                Provide Liquidity
                <ChevronRight className="w-4 h-4 inline ml-1" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Section 3: Investment Mechanics ─────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-base font-bold text-yas-text mb-4">Investment Mechanics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MECHANICS.map(({ title, desc, icon: Icon, color }) => (
            <div
              key={title}
              className="bg-yas-panel border border-white/[0.08] rounded-2xl p-5 flex gap-4"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}14`, border: `1px solid ${color}30` }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <p className="text-sm font-bold text-yas-text mb-1">{title}</p>
                <p className="text-xs text-yas-subtext leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── CTA ─────────────────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-8 border border-yas-blue/20 text-center"
        style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(20,184,166,0.05))" }}
      >
        <h3 className="text-lg font-bold text-yas-text mb-2">Ready to Participate?</h3>
        <p className="text-sm text-yas-subtext mb-5 max-w-md mx-auto">
          Connect your Web3 wallet or use Privy auth to deposit USDC into the smart contract pool.
          Dynamic yields are distributed block-by-block.
        </p>
        <button
          onClick={() => openModal(TRANCHES[1])}
          className="px-8 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 flex items-center justify-center gap-1.5 mx-auto"
          style={{ background: "linear-gradient(135deg, #3B82F6, #14B8A6)", color: "#fff" }}
        >
          <Wallet className="w-4 h-4" />
          Provide Liquidity Now
          <ChevronRight className="w-4 h-4 inline" />
        </button>
      </div>

      {showModal && (
        <InvestModal
          tranche={modalTranche}
          onClose={() => { setShowModal(false); setModalTranche(null); }}
        />
      )}

      <AgentFAB agents={["cass"]} context={cassContext} />
    </div>
  );
}
