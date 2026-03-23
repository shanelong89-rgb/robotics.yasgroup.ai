import Link from "next/link";
import { Shield, Zap, TrendingUp, Clock, BarChart2, Layers } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YAS — Insurance for the Autonomous Age",
  description: "YAS delivers parametric fleet coverage for robotics, EVs, and autonomous vehicles — powered by real-time telemetry and oracle-settled claims.",
};

export default function DemoPage() {
  return (
    <div
      className="min-h-screen text-white"
      style={{ background: "#020203", fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* Animated blob background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="demo-blob demo-blob-1" />
        <div className="demo-blob demo-blob-2" />
        <div className="demo-blob demo-blob-3" />
      </div>

      {/* Top Nav */}
      <header
        className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm"
            style={{ background: "linear-gradient(135deg, #3B82F6, #14B8A6)" }}
          >
            Y
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white">YAS</div>
            <div className="text-[9px] uppercase tracking-widest" style={{ color: "#475569" }}>Fleet Intelligence</div>
          </div>
        </div>
        <Link
          href="/login"
          className="text-xs font-semibold px-4 py-2 rounded-xl transition-all hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #14B8A6, #0D9488)",
            color: "#fff",
            boxShadow: "0 2px 12px rgba(20,184,166,0.25)",
          }}
        >
          Request Demo
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 md:px-12 pt-20 pb-16 text-center max-w-4xl mx-auto">
        <div
          className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-8"
          style={{
            background: "rgba(20,184,166,0.1)",
            border: "1px solid rgba(20,184,166,0.25)",
            color: "#14B8A6",
          }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-400"></span>
          </span>
          Live Platform — 90 Assets Monitored
        </div>

        <h1
          className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6"
          style={{ color: "#F1F5F9" }}
        >
          Insurance for the{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #3B82F6, #14B8A6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Autonomous Age
          </span>
        </h1>

        <p className="text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: "#94A3B8" }}>
          YAS delivers parametric fleet coverage for robotics, EVs, and autonomous vehicles — powered by real-time telemetry and oracle-settled claims.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/login"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #14B8A6, #0D9488)",
              color: "#fff",
              boxShadow: "0 4px 24px rgba(20,184,166,0.3)",
            }}
          >
            View Live Platform →
          </Link>
          <Link
            href="/signup"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all hover:bg-white/[0.08]"
            style={{
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#F1F5F9",
            }}
          >
            Talk to Us
          </Link>
        </div>

        {/* Stat strip */}
        <div
          className="grid grid-cols-3 gap-4 p-6 rounded-2xl max-w-xl mx-auto"
          style={{
            background: "rgba(15,22,40,0.8)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          {[
            { value: "2m 13s", label: "avg payout" },
            { value: "23.4%", label: "loss ratio" },
            { value: "3.42×", label: "reserve coverage" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl md:text-2xl font-black" style={{ color: "#14B8A6" }}>{stat.value}</div>
              <div className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "#64748B" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="relative z-10 px-6 md:px-12 py-20 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Problem */}
          <div
            className="p-8 rounded-2xl"
            style={{
              background: "rgba(15,22,40,0.6)",
              border: "1px solid rgba(239,68,68,0.15)",
              borderTop: "2px solid rgba(239,68,68,0.4)",
            }}
          >
            <div
              className="inline-block text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-md mb-5"
              style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}
            >
              The Problem
            </div>
            <ul className="space-y-4">
              {[
                "Legacy insurers price on historical data",
                "Manual claims take weeks",
                "No telematics integration for autonomy",
                "Capital locked in opaque reserves",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "#94A3B8" }}>
                  <span className="mt-0.5 text-red-500 flex-shrink-0">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Solution */}
          <div
            className="p-8 rounded-2xl"
            style={{
              background: "rgba(15,22,40,0.6)",
              border: "1px solid rgba(20,184,166,0.15)",
              borderTop: "2px solid #14B8A6",
            }}
          >
            <div
              className="inline-block text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-md mb-5"
              style={{ background: "rgba(20,184,166,0.1)", color: "#14B8A6" }}
            >
              The YAS Difference
            </div>
            <ul className="space-y-4">
              {[
                "Real-time telemetry → dynamic pricing",
                "Parametric triggers → 2-min payouts",
                "Built for robots, EVs, and AVs natively",
                "Transparent on-chain reserve layer",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "#E2E8F0" }}>
                  <span className="mt-0.5 text-teal-400 flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Product cards */}
      <section className="relative z-10 px-6 md:px-12 py-16 max-w-5xl mx-auto">
        <h2
          className="text-2xl font-bold text-center mb-12 tracking-tight"
          style={{ color: "#F1F5F9" }}
        >
          Built for Modern Fleets
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: BarChart2,
              color: "#3B82F6",
              title: "Fleet Intelligence",
              body: "Command Center map, continuous risk scoring, and real-time asset monitoring across all your autonomous vehicles.",
            },
            {
              icon: Zap,
              color: "#14B8A6",
              title: "Parametric Claims",
              body: "Oracle-triggered payouts require no adjusters. Collision detected → validated → paid in under 3 minutes.",
            },
            {
              icon: Layers,
              color: "#A855F7",
              title: "Capital Stack",
              body: "4-layer reserve architecture with LP tranches. Transparent yield from Polymarket-style fleet risk underwriting.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="p-6 rounded-2xl transition-all hover:-translate-y-1"
              style={{
                background: "rgba(15,22,40,0.7)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderTop: `2px solid ${card.color}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                style={{ background: `${card.color}18` }}
              >
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: "#F1F5F9" }}>{card.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Numbers */}
      <section className="relative z-10 px-6 md:px-12 py-16 max-w-3xl mx-auto">
        <div
          className="p-10 rounded-2xl text-center"
          style={{
            background: "rgba(15,22,40,0.9)",
            border: "1px solid rgba(20,184,166,0.15)",
          }}
        >
          <div className="text-xs font-bold uppercase tracking-widest mb-8" style={{ color: "#14B8A6" }}>
            By the Numbers
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "HKD 11.1M", label: "capital deployed" },
              { value: "90", label: "assets monitored" },
              { value: "HKD 84.2K", label: "saved vs flat-rate" },
              { value: "3", label: "claims <3min this month" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-black mb-1" style={{ color: "#14B8A6" }}>{stat.value}</div>
                <div className="text-[10px] uppercase tracking-widest leading-snug" style={{ color: "#475569" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative z-10 px-6 md:px-12 py-20 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-black tracking-tight mb-4" style={{ color: "#F1F5F9" }}>
          Ready to protect your fleet?
        </h2>
        <p className="text-sm mb-10" style={{ color: "#64748B" }}>
          Join forward-thinking operators who trust YAS for autonomous fleet insurance.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/quote"
            className="px-6 py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #14B8A6, #0D9488)",
              color: "#fff",
              boxShadow: "0 4px 24px rgba(20,184,166,0.3)",
            }}
          >
            Get a Quote
          </Link>
          <Link
            href="/onboard"
            className="px-6 py-3 rounded-2xl text-sm font-semibold transition-all hover:bg-white/[0.08]"
            style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#F1F5F9" }}
          >
            Onboard Your Fleet
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-10 text-center py-8 px-6"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "#334155", fontSize: "11px" }}
      >
        © 2026 YAS Group · robotics.yasgroup.ai · Parametric Fleet Intelligence & Assurance
      </footer>

      <style>{`
        .demo-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.12;
          pointer-events: none;
        }
        .demo-blob-1 {
          width: 600px; height: 600px;
          background: #3B82F6;
          top: -200px; left: -150px;
          animation: blobFloat1 18s ease-in-out infinite;
        }
        .demo-blob-2 {
          width: 500px; height: 500px;
          background: #14B8A6;
          top: 200px; right: -150px;
          animation: blobFloat2 22s ease-in-out infinite;
        }
        .demo-blob-3 {
          width: 400px; height: 400px;
          background: #A855F7;
          bottom: 100px; left: 30%;
          animation: blobFloat3 16s ease-in-out infinite;
        }
        @keyframes blobFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.05); }
        }
        @keyframes blobFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 40px) scale(0.95); }
        }
        @keyframes blobFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -30px) scale(1.08); }
        }
      `}</style>
    </div>
  );
}
