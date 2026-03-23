"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Map, AlertTriangle, DollarSign, TrendingUp, FileText, BarChart2, Landmark, TrendingDown, Bell, Activity, ChevronDown, LogOut, Check, Play, ExternalLink, Wallet } from "lucide-react";
import Image from "next/image";
import { useState, useMemo, useRef, useEffect } from "react";
import { useTour } from "@/context/TourContext";
import { alerts as demoAlerts } from "@/lib/demo-data";
// Privy disabled — using local auth only
// import { usePrivy } from "@privy-io/react-auth";

function useCriticalAlertCount() {
  return useMemo(() => demoAlerts.filter((a) => a.severity === "critical" && !a.acknowledged).length, []);
}

const MOCK_OPERATORS = [
  { id: "yas-demo", name: "YAS Demo Fleet", initial: "Y" },
  { id: "hk-robotics", name: "HK Robotics Corp", initial: "H" },
  { id: "sz-ev", name: "SZ EV Grid Ops", initial: "S" },
];

const navItems = [
  { href: "/", label: "Command", icon: Map, accentColor: "#3B82F6" },
  { href: "/risk", label: "Risk", icon: AlertTriangle, accentColor: "#F59E0B" },
  { href: "/claims", label: "Claims", icon: Shield, accentColor: "#EF4444", badge: 3 },
  { href: "/treasury", label: "Treasury", icon: DollarSign, accentColor: "#14B8A6" },
  { href: "/insights", label: "Insights", icon: TrendingDown, accentColor: "#22C55E" },
  { href: "/alerts", label: "Alerts", icon: Bell, accentColor: "#EF4444" },
  { href: "/telemetry", label: "Telemetry", icon: Activity, accentColor: "#3B82F6" },
  { href: "/capital", label: "Capital", icon: TrendingUp, accentColor: "#A855F7" },
  { href: "/invest", label: "Invest", icon: Landmark, accentColor: "#3B82F6" },
  { href: "/markets", label: "Markets", icon: BarChart2, accentColor: "#14B8A6" },
];

function getActiveAccent(pathname: string) {
  if (pathname.startsWith("/risk")) return "#F59E0B";
  if (pathname.startsWith("/claims")) return "#EF4444";
  if (pathname.startsWith("/treasury")) return "#14B8A6";
  if (pathname.startsWith("/capital")) return "#A855F7";
  if (pathname.startsWith("/invest")) return "#3B82F6";
  if (pathname.startsWith("/markets")) return "#14B8A6";
  if (pathname.startsWith("/insights")) return "#22C55E";
  if (pathname.startsWith("/alerts")) return "#EF4444";
  if (pathname.startsWith("/telemetry")) return "#3B82F6";
  return "#3B82F6";
}

export default function GlobalNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [logoError, setLogoError] = useState(false);
  const activeAccent = getActiveAccent(pathname);
  const criticalAlertCount = useCriticalAlertCount();
  const [currentOperator, setCurrentOperator] = useState(MOCK_OPERATORS[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switchedTo, setSwitchedTo] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { startTour } = useTour();
  // Privy disabled — wallet connect removed until real App ID configured
  const login = () => {};
  const logout = () => {};
  const authenticated = false;
  const user = null;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Clear toast after 2.5s
  useEffect(() => {
    if (switchedTo) {
      const t = setTimeout(() => setSwitchedTo(null), 2500);
      return () => clearTimeout(t);
    }
  }, [switchedTo]);

  // Hide nav on auth and public pages
  if (pathname === "/login" || pathname === "/signup" || pathname.startsWith("/demo")) return null;

  function handleSwitchOperator(op: typeof MOCK_OPERATORS[0]) {
    if (op.id !== currentOperator.id) {
      setCurrentOperator(op);
      setSwitchedTo(op.name);
    }
    setDropdownOpen(false);
  }

  function handleSignOut() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("yas_access_token");
    }
    document.cookie = "yas_token=; path=/; max-age=0";
    setDropdownOpen(false);
    if (authenticated) {
      logout();
    }
    router.push("/login");
  }

  const walletAddress: string | undefined = undefined;
  const shortWallet = currentOperator.name;

  return (
    <>
      {/* Operator switch toast */}
      {switchedTo && (
        <div
          className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
          style={{
            background: "rgba(20,184,166,0.15)",
            border: "1px solid rgba(20,184,166,0.3)",
            color: "#14B8A6",
            backdropFilter: "blur(10px)",
          }}
        >
          <Check className="w-3.5 h-3.5" />
          Switched to {switchedTo}
        </div>
      )}

      <nav
        className="hidden md:flex fixed top-0 left-0 right-0 h-14 z-50 items-center px-6 gap-8"
        style={{
          background: "rgba(5,8,20,0.96)",
          backdropFilter: "saturate(180%) blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Gradient top border */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
          style={{ background: `linear-gradient(90deg, #3B82F6, #14B8A6)` }}
        />

        {/* Active section bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none transition-all duration-500"
          style={{ background: `linear-gradient(90deg, transparent, ${activeAccent}40, transparent)` }}
        />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          {!logoError ? (
            <Image
              src="/yas-logo.png"
              alt="YAS"
              width={64}
              height={24}
              priority
              onError={() => setLogoError(true)}
              style={{ objectFit: "contain", height: "24px", width: "auto" }}
            />
          ) : (
            <span className="font-bold text-yas-text text-sm tracking-tight">YAS</span>
          )}
          <span
            className="text-xs font-medium tracking-wide"
            style={{ color: "#94A3B8" }}
          >
            Assurance
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon, accentColor, badge }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            const dynamicBadge = href === "/alerts" ? criticalAlertCount : badge;
            return (
              <Link
                key={href}
                href={href}
                className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                style={{ color: isActive ? "#F1F5F9" : "#64748B" }}
              >
                <div
                  className="absolute inset-0 rounded-lg transition-all duration-200"
                  style={{ background: isActive ? "rgba(255,255,255,0.08)" : "transparent" }}
                />
                <Icon className="w-3.5 h-3.5 relative z-10" style={label === "Insights" ? { color: isActive ? "#22C55E" : undefined } : undefined} />
                <span className="relative z-10">{label}</span>
                {dynamicBadge && dynamicBadge > 0 && (
                  <span
                    className={`relative z-10 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold${href === "/alerts" ? " animate-pulse" : ""}`}
                    style={{ background: accentColor, color: "#fff" }}
                  >
                    {dynamicBadge}
                  </span>
                )}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-3 right-3 rounded-full transition-all duration-300"
                    style={{ height: "2px", background: accentColor }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Tour + Demo buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={startTour}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-90"
            style={{
              background: "rgba(20,184,166,0.12)",
              border: "1px solid rgba(20,184,166,0.3)",
              color: "#14B8A6",
            }}
          >
            <Play className="w-3 h-3" />
            Start Tour
          </button>
          <Link
            href="/demo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-90"
            style={{
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.25)",
              color: "#60A5FA",
            }}
          >
            <ExternalLink className="w-3 h-3" />
            Demo
          </Link>
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-4">
          {/* Onboard Fleet link */}
          <Link
            href="/onboard"
            className="text-xs font-medium transition-all duration-200 hover:text-yas-teal"
            style={{ color: pathname.startsWith("/onboard") ? "#14B8A6" : "#94A3B8" }}
          >
            Onboard Fleet
          </Link>

          {/* Get Quote CTA */}
          <Link
            href="/quote"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #14B8A6, #0D9488)",
              color: "#fff",
              boxShadow: "0 2px 12px rgba(20,184,166,0.25)",
            }}
          >
            <FileText className="w-3.5 h-3.5" />
            Get Quote
          </Link>

          <div className="h-4 w-px bg-white/[0.08]" />

          {/* All Systems Operational */}
          <div className="items-center gap-1.5 hidden lg:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yas-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yas-green"></span>
            </span>
            <span className="text-[10px] text-yas-green font-medium uppercase tracking-widest">All Systems Operational</span>
          </div>

          <div className="h-4 w-px bg-white/[0.08] hidden lg:block" />

          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <span
              className="relative flex h-2 w-2 rounded-full animate-glow-pulse"
              style={{ background: "#22C55E" }}
            />
            <span className="text-[10px] text-yas-green font-medium uppercase tracking-widest">Live</span>
          </div>

          <div className="h-4 w-px bg-white/[0.08]" />

          {/* Account Switcher */}
          <div className="relative" ref={dropdownRef}>
            {authenticated ? (
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:bg-white/[0.06]"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {/* Avatar */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #3B82F6, #14B8A6)" }}
                >
                  <Wallet className="w-3 h-3" />
                </div>
                <span className="text-xs font-medium hidden lg:block" style={{ color: "#F1F5F9" }}>
                  {shortWallet}
                </span>
                <ChevronDown
                  className="w-3 h-3 transition-transform duration-200"
                  style={{
                    color: "#64748B",
                    transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
            ) : (
              <button
                onClick={() => login()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:bg-white/[0.06]"
                style={{ border: "1px solid rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.1)", color: "#60A5FA" }}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Connect Wallet</span>
              </button>
            )}

            {/* Dropdown */}
            {authenticated && dropdownOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-64 rounded-2xl border py-2 z-50"
                style={{
                  background: "rgba(13,18,30,0.98)",
                  borderColor: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                }}
              >
                {/* User profile section */}
                <div
                  className="px-4 py-3 border-b"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <div className="text-xs font-semibold text-white">Admin User</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(59,130,246,0.15)",
                        border: "1px solid rgba(59,130,246,0.3)",
                        color: "#3B82F6",
                      }}
                    >
                      Operator Admin
                    </span>
                  </div>
                </div>

                {/* Operator list */}
                <div className="py-1">
                  <div className="px-4 py-1.5">
                    <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: "#475569" }}>
                      Switch Operator
                    </span>
                  </div>
                  {MOCK_OPERATORS.map((op) => {
                    const isActive = op.id === currentOperator.id;
                    return (
                      <button
                        key={op.id}
                        onClick={() => handleSwitchOperator(op)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all hover:bg-white/[0.04]"
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                          style={{
                            background: isActive
                              ? "linear-gradient(135deg, #14B8A6, #0D9488)"
                              : "rgba(255,255,255,0.08)",
                          }}
                        >
                          {op.initial}
                        </div>
                        <span className="text-xs flex-1" style={{ color: isActive ? "#F1F5F9" : "#94A3B8" }}>
                          {op.name}
                        </span>
                        {isActive && (
                          <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#14B8A6" }} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Sign out */}
                <div
                  className="border-t pt-1 mt-1"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all hover:bg-white/[0.04]"
                  >
                    <LogOut className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#EF4444" }} />
                    <span className="text-xs" style={{ color: "#EF4444" }}>
                      Sign Out
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
