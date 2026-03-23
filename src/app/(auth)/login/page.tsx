"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

const API_BASE = "/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoError, setLogoError] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (!res.ok) {
        setError("Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      const token = data.accessToken || data.token || data.access_token;

      if (!token) {
        setError("Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("yas_access_token", token);
      }

      // Also set a cookie for middleware
      document.cookie = `yas_token=${token}; path=/; max-age=${rememberMe ? 30 * 24 * 3600 : 3600}`;

      router.push("/");
    } catch {
      setError("Invalid credentials. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "#0A0E1A" }}
    >
      {/* Radial teal glow - bottom left */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-200px",
          left: "-150px",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)",
        }}
      />
      {/* Subtle top right glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-100px",
          right: "-100px",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl border p-8"
        style={{
          background: "rgba(19,25,41,0.9)",
          borderColor: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px) saturate(180%)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {/* Top gradient accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
          style={{ background: "linear-gradient(90deg, #3B82F6, #14B8A6)" }}
        />

        {/* Logo */}
        <div className="flex justify-center mb-6">
          {!logoError ? (
            <Image
              src="/yas-logo.png"
              alt="YAS"
              width={100}
              height={36}
              priority
              onError={() => setLogoError(true)}
              style={{ objectFit: "contain", height: "36px", width: "auto" }}
            />
          ) : (
            <span className="text-2xl font-bold text-white tracking-tight">YAS</span>
          )}
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-white mb-1.5">Fleet Intelligence Platform</h1>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Sign in to your operator account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "#64748B" }}>
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748B" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@company.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${error ? "#EF4444" : "rgba(255,255,255,0.08)"}`,
                  color: "#F1F5F9",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = error ? "#EF4444" : "rgba(20,184,166,0.5)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = error ? "#EF4444" : "rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "#64748B" }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748B" }} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${error ? "#EF4444" : "rgba(255,255,255,0.08)"}`,
                  color: "#F1F5F9",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = error ? "#EF4444" : "rgba(20,184,166,0.5)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = error ? "#EF4444" : "rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80"
                style={{ color: "#64748B" }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-teal-500 cursor-pointer"
            />
            <label htmlFor="remember" className="text-xs cursor-pointer" style={{ color: "#94A3B8" }}>
              Remember me
            </label>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="text-xs py-2.5 px-3.5 rounded-xl border"
              style={{
                background: "rgba(239,68,68,0.1)",
                borderColor: "rgba(239,68,68,0.25)",
                color: "#EF4444",
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 mt-2"
            style={{
              background: loading
                ? "rgba(20,184,166,0.5)"
                : "linear-gradient(135deg, #14B8A6, #0D9488)",
              boxShadow: loading ? "none" : "0 4px 20px rgba(20,184,166,0.3)",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Demo hint */}
        <div
          className="mt-5 py-2.5 px-3.5 rounded-xl text-center text-xs"
          style={{
            background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.15)",
            color: "#94A3B8",
          }}
        >
          Demo: <span style={{ color: "#14B8A6" }}>admin@yas.io</span> /{" "}
          <span style={{ color: "#14B8A6" }}>demo1234</span>
        </div>

        {/* Signup link */}
        <div className="mt-5 text-center">
          <Link
            href="/signup"
            className="text-xs transition-opacity hover:opacity-80"
            style={{ color: "#64748B" }}
          >
            New fleet operator?{" "}
            <span style={{ color: "#14B8A6" }}>Request access →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
