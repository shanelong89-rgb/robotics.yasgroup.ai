"use client";

import { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { SelectedPlan } from "./QuoteFlow";

interface Props {
  plan: SelectedPlan;
  onClose: () => void;
}

function formatHKD(amount: number): string {
  if (amount >= 1_000_000) return `HKD ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `HKD ${(amount / 1_000).toFixed(0)}K`;
  return `HKD ${amount.toLocaleString()}`;
}

function generateConfirmationNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return (
    "YAS-" +
    Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  );
}

export default function LeadCaptureModal({ plan, onClose }: Props) {
  const [form, setForm] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [confirmationNo] = useState(generateConfirmationNumber);

  const isValid = form.company && form.name && form.email;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end md:items-center justify-center p-4"
      style={{ background: "rgba(2,2,3,0.85)", backdropFilter: "blur(12px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "#131929",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div>
            <p className="text-sm font-bold text-yas-text">
              {submitted ? "Request Received" : `Get Started — ${plan.name}`}
            </p>
            {!submitted && (
              <p className="text-xs text-yas-muted mt-0.5">
                {formatHKD(plan.monthlyPremium)}/month
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.06)", color: "#64748B" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {submitted ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "rgba(20,184,166,0.15)", border: "1px solid rgba(20,184,166,0.3)" }}
              >
                <CheckCircle2 className="w-8 h-8" style={{ color: "#14B8A6" }} />
              </div>
              <div>
                <p className="text-base font-bold text-yas-text">You're all set!</p>
                <p className="text-sm text-yas-subtext mt-1">
                  Our team will contact you within 24 hours to finalise your coverage.
                </p>
              </div>
              <div
                className="w-full rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="text-[10px] text-yas-muted uppercase tracking-widest mb-1">
                  Confirmation Number
                </p>
                <p className="text-sm font-mono font-bold" style={{ color: "#14B8A6" }}>
                  {confirmationNo}
                </p>
              </div>
              <p className="text-xs text-yas-muted">
                Save this number for reference. A copy has been noted in your session.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-yas-muted">
                Complete the form below and our fleet insurance specialists will reach out within 24 hours.
              </p>

              <div className="space-y-3">
                {[
                  { key: "company", label: "Company Name", placeholder: "e.g. Acme Robotics Ltd", required: true },
                  { key: "name", label: "Contact Name", placeholder: "Your full name", required: true },
                  { key: "email", label: "Email Address", placeholder: "you@company.com", required: true, type: "email" },
                  { key: "phone", label: "Phone Number", placeholder: "+852 9000 0000", type: "tel" },
                ].map(({ key, label, placeholder, required, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-yas-subtext mb-1">
                      {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
                    </label>
                    <input
                      type={type ?? "text"}
                      placeholder={placeholder}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      required={required}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#F1F5F9",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "rgba(20,184,166,0.4)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      }}
                    />
                  </div>
                ))}
              </div>

              <div
                className="flex items-start gap-2.5 p-3 rounded-xl text-xs"
                style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.15)", color: "#94A3B8" }}
              >
                <span className="mt-0.5" style={{ color: "#14B8A6" }}>🛡️</span>
                <span>
                  Our team will contact you within 24 hours to customise your {plan.name} plan and complete the onboarding.
                </span>
              </div>

              <button
                type="submit"
                disabled={!isValid}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                style={{
                  background: isValid
                    ? "linear-gradient(135deg, #3B82F6, #14B8A6)"
                    : "rgba(255,255,255,0.06)",
                  color: isValid ? "#fff" : "#64748B",
                  cursor: isValid ? "pointer" : "not-allowed",
                  boxShadow: isValid ? "0 4px 20px rgba(59,130,246,0.2)" : "none",
                }}
              >
                Submit Request
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
