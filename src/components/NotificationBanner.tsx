"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X, Bell } from "lucide-react";

export default function NotificationBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only show if not already prompted and browser supports notifications
    const prompted = localStorage.getItem("notif_prompted");
    if (!prompted && "Notification" in window && Notification.permission === "default") {
      setVisible(true);
    }
  }, []);

  function handleEnable() {
    if (typeof window === "undefined") return;
    Notification.requestPermission().then(() => {
      localStorage.setItem("notif_prompted", "1");
      setVisible(false);
    });
  }

  function handleDismiss() {
    if (typeof window === "undefined") return;
    localStorage.setItem("notif_prompted", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 text-xs"
      style={{
        background: "rgba(245,158,11,0.12)",
        borderBottom: "1px solid rgba(245,158,11,0.2)",
      }}
    >
      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#F59E0B" }} />
      <span className="flex-1" style={{ color: "#D97706" }}>
        Enable push notifications for critical fleet alerts?
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={handleEnable}
          className="flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all hover:opacity-90"
          style={{
            background: "rgba(245,158,11,0.2)",
            border: "1px solid rgba(245,158,11,0.3)",
            color: "#F59E0B",
          }}
        >
          <Bell className="w-3 h-3" />
          Enable
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 rounded transition-opacity hover:opacity-70"
          style={{ color: "#64748B" }}
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
