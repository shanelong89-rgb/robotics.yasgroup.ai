"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Props {
  refNumber: string;
}

export default function SuccessScreen({ refNumber }: Props) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 400);
    return () => clearTimeout(t);
  }, []);

  function handleDownload() {
    const content = `YAS Fleet Onboarding Summary\nReference: ${refNumber}\nDate: ${new Date().toLocaleDateString()}\n\nThank you for onboarding with YAS Assurance.\nOur team will contact you within 24 hours.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `YAS-Onboarding-${refNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="min-h-screen pt-14 pb-24 flex items-center justify-center px-4"
      style={{ background: "linear-gradient(180deg, #020203 0%, #0A0E1A 100%)" }}
    >
      <div
        className="max-w-lg w-full rounded-2xl p-8 text-center space-y-6"
        style={{
          background: "rgba(15,22,40,0.9)",
          border: "1px solid rgba(255,255,255,0.08)",
          opacity: showContent ? 1 : 0,
          transform: showContent ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        {/* Animated checkmark */}
        <div className="flex justify-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "rgba(34,197,94,0.12)", border: "2px solid rgba(34,197,94,0.3)" }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              className="checkmark-svg"
            >
              <circle cx="20" cy="20" r="18" stroke="#22C55E" strokeWidth="2" opacity="0.3" />
              <path
                d="M12 20L18 26L28 14"
                stroke="#22C55E"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 28,
                  strokeDashoffset: showContent ? 0 : 28,
                  transition: "stroke-dashoffset 0.6s ease 0.4s",
                }}
              />
            </svg>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-yas-text mb-2">Fleet onboarded successfully!</h1>
          <p className="text-sm text-yas-subtext">
            Our team will contact you within 24 hours to finalise your coverage documents.
          </p>
        </div>

        {/* Reference Number */}
        <div
          className="rounded-xl px-6 py-4"
          style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.2)" }}
        >
          <p className="text-xs text-yas-muted mb-1">Onboarding Reference</p>
          <p className="text-2xl font-bold tracking-widest" style={{ color: "#14B8A6" }}>
            {refNumber}
          </p>
        </div>

        <p className="text-xs text-yas-muted">
          Save this reference number for your records. A confirmation will be sent to your registered email address.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-center transition-all"
            style={{
              background: "linear-gradient(135deg, #3B82F6, #14B8A6)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(59,130,246,0.2)",
            }}
          >
            View Fleet Dashboard
          </Link>
          <button
            onClick={handleDownload}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#94A3B8",
            }}
          >
            Download Summary
          </button>
        </div>
      </div>
    </div>
  );
}
