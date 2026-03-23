"use client";

import { useRef, useCallback } from "react";

export function useInsightsPDF() {
  const pdfRef = useRef<HTMLDivElement>(null);

  const downloadReport = useCallback(() => {
    if (!pdfRef.current) return;
    pdfRef.current.style.display = "block";
    const date = new Date().toLocaleDateString("en-HK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const dateEl = pdfRef.current.querySelector("#pdf-date");
    if (dateEl) dateEl.textContent = `Generated: ${date}`;
    window.print();
    setTimeout(() => {
      if (pdfRef.current) pdfRef.current.style.display = "none";
    }, 500);
  }, []);

  return { pdfRef, downloadReport };
}

export default function InsightsPDF({ pdfRef }: { pdfRef: React.RefObject<HTMLDivElement> }) {
  return (
    <div
      id="insights-pdf"
      ref={pdfRef}
      style={{ display: "none", fontFamily: "Georgia, serif", color: "#000", background: "#fff", padding: "48px", maxWidth: "800px" }}
    >
      {/* Header */}
      <div style={{ borderBottom: "3px solid #000", paddingBottom: "16px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "22px", fontWeight: "bold", letterSpacing: "-0.5px" }}>YAS</div>
            <div style={{ fontSize: "11px", color: "#555", letterSpacing: "2px", textTransform: "uppercase", marginTop: "2px" }}>
              Fleet Intelligence Platform
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "13px", fontWeight: "bold" }}>Operator Insights Report</div>
            <div id="pdf-date" style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>Generated: —</div>
          </div>
        </div>
      </div>

      {/* Section 1 */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "11px", fontWeight: "bold", letterSpacing: "2px", textTransform: "uppercase", color: "#333", borderBottom: "1px solid #ddd", paddingBottom: "6px", marginBottom: "12px" }}>
          Fleet Performance Summary
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: "2" }}>
          <li style={{ fontSize: "13px" }}>• Total savings this year: <strong>HKD 84,200</strong></li>
          <li style={{ fontSize: "13px" }}>• Premium advantage: <strong>18.4% below market</strong></li>
          <li style={{ fontSize: "13px" }}>• Fleet health score: <strong>74/100</strong> (↑12 pts in 90 days)</li>
        </ul>
      </div>

      {/* Section 2 */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "11px", fontWeight: "bold", letterSpacing: "2px", textTransform: "uppercase", color: "#333", borderBottom: "1px solid #ddd", paddingBottom: "6px", marginBottom: "12px" }}>
          Benchmarking vs Industry
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ textAlign: "left", padding: "8px", border: "1px solid #ddd" }}>Metric</th>
              <th style={{ textAlign: "center", padding: "8px", border: "1px solid #ddd" }}>YAS Fleet</th>
              <th style={{ textAlign: "center", padding: "8px", border: "1px solid #ddd" }}>Industry Avg</th>
              <th style={{ textAlign: "center", padding: "8px", border: "1px solid #ddd" }}>Delta</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>Loss Ratio</td>
              <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", fontWeight: "bold" }}>23.4%</td>
              <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>67.0%</td>
              <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", color: "#166534" }}>-43.6%</td>
            </tr>
            <tr style={{ background: "#fafafa" }}>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>Collision Rate</td>
              <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", fontWeight: "bold" }}>0.8/1000hr</td>
              <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>2.1/1000hr</td>
              <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", color: "#166534" }}>-62%</td>
            </tr>
            <tr>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>Fault Response Time</td>
              <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", fontWeight: "bold" }}>4.2 min</td>
              <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>18.7 min</td>
              <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", color: "#166534" }}>-78%</td>
            </tr>
            <tr style={{ background: "#fafafa" }}>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>Battery Incidents</td>
              <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", fontWeight: "bold" }}>3.1%</td>
              <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>8.4%</td>
              <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", color: "#166534" }}>-63%</td>
            </tr>
            <tr>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>Avg Claim Value</td>
              <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", fontWeight: "bold" }}>HKD 28,400</td>
              <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>HKD 52,000</td>
              <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", color: "#166534" }}>-45%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 3 */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "11px", fontWeight: "bold", letterSpacing: "2px", textTransform: "uppercase", color: "#333", borderBottom: "1px solid #ddd", paddingBottom: "6px", marginBottom: "12px" }}>
          Recommended Actions
        </div>
        <ol style={{ paddingLeft: "20px", margin: 0, lineHeight: "2", fontSize: "13px" }}>
          <li>Resolve battery faults on HK-BOT-007, HK-BOT-012 → <strong>save HKD 3,200/month</strong></li>
          <li>Restrict night ops for HK Delivery Fleet → <strong>save HKD 1,800/month</strong></li>
          <li>Schedule preventive maintenance for 4 EVs → <strong>save HKD 960/month</strong></li>
        </ol>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "2px solid #000", paddingTop: "16px", marginTop: "40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "12px", fontWeight: "bold" }}>YAS Fleet Intelligence Platform</div>
          <div style={{ fontSize: "11px", color: "#666" }}>robotics.yasgroup.ai</div>
        </div>
        <div style={{ fontSize: "10px", color: "#999", textAlign: "right" }}>
          Confidential — For authorised operators only
        </div>
      </div>
    </div>
  );
}
