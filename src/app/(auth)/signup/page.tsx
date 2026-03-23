"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Building2, User, Mail, Phone, CheckCircle } from "lucide-react";

const FLEET_SIZES = ["1-10", "11-50", "51-200", "200+"];
const ASSET_TYPES = ["Robots", "EVs", "Autonomous Vehicles"];

export default function SignupPage() {
  const [logoError, setLogoError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refCode, setRefCode] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    fleetSize: "",
    assetTypes: [] as string[],
    message: "",
  });

  function toggleAssetType(type: string) {
    setForm((prev) => ({
      ...prev,
      assetTypes: prev.assetTypes.includes(type)
        ? prev.assetTypes.filter((t) => t !== type)
        : [...prev.assetTypes, type],
    }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Generate a random 6-digit reference code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setRefCode(code);
    setSubmitted(true);
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#F1F5F9",
  };

  function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    e.currentTarget.style.borderColor = "rgba(20,184,166,0.5)";
    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden py-10"
      style={{ background: "#0A0E1A" }}
    >
      {/* Radial teal glow */}
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
        {/* Top gradient */}
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

        {submitted ? (
          /* Success state */
          <div className="text-center py-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}
            >
              <CheckCircle className="w-8 h-8" style={{ color: "#22C55E" }} />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Request Received</h2>
            <p className="text-sm mb-5" style={{ color: "#94A3B8" }}>
              Our team will review and contact you within 24 hours.
            </p>
            <div
              className="py-3 px-4 rounded-xl mb-6"
              style={{
                background: "rgba(20,184,166,0.08)",
                border: "1px solid rgba(20,184,166,0.2)",
              }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: "#64748B" }}>
                Reference Number
              </div>
              <div className="text-lg font-bold" style={{ color: "#14B8A6" }}>
                YAS-REQ-{refCode}
              </div>
            </div>
            <Link
              href="/login"
              className="text-sm transition-opacity hover:opacity-80"
              style={{ color: "#14B8A6" }}
            >
              ← Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-white mb-1.5">Request Fleet Access</h1>
              <p className="text-sm" style={{ color: "#94A3B8" }}>
                Register your operator account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Company Name */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "#64748B" }}>
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748B" }} />
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
                    placeholder="Acme Fleet Corp"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>

              {/* Contact Name */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "#64748B" }}>
                  Contact Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748B" }} />
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))}
                    placeholder="John Smith"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "#64748B" }}>
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748B" }} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="john@company.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "#64748B" }}>
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748B" }} />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+852 1234 5678"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>

              {/* Fleet Size */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "#64748B" }}>
                  Fleet Size
                </label>
                <select
                  value={form.fleetSize}
                  onChange={(e) => setForm((p) => ({ ...p, fleetSize: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all appearance-none"
                  style={{ ...inputStyle }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                >
                  <option value="" disabled style={{ background: "#131929" }}>Select fleet size</option>
                  {FLEET_SIZES.map((s) => (
                    <option key={s} value={s} style={{ background: "#131929" }}>
                      {s} assets
                    </option>
                  ))}
                </select>
              </div>

              {/* Asset Types */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#64748B" }}>
                  Asset Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {ASSET_TYPES.map((type) => {
                    const selected = form.assetTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleAssetType(type)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: selected ? "rgba(20,184,166,0.15)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${selected ? "rgba(20,184,166,0.4)" : "rgba(255,255,255,0.08)"}`,
                          color: selected ? "#14B8A6" : "#64748B",
                        }}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "#64748B" }}>
                  Message <span style={{ color: "#475569" }}>(optional)</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Tell us about your fleet operations..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all mt-2"
                style={{
                  background: "linear-gradient(135deg, #14B8A6, #0D9488)",
                  boxShadow: "0 4px 20px rgba(20,184,166,0.3)",
                }}
              >
                Submit Request
              </button>
            </form>

            <div className="mt-5 text-center">
              <Link
                href="/login"
                className="text-xs transition-opacity hover:opacity-80"
                style={{ color: "#64748B" }}
              >
                Already have access?{" "}
                <span style={{ color: "#14B8A6" }}>Sign in →</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
