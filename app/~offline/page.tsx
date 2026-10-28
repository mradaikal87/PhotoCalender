"use client";

export default function OfflinePage() {
  return (
    <div className="wrap" style={{ textAlign: "center", padding: "60px 16px" }}>
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--line)",
          borderRadius: "16px",
          padding: "32px 24px",
          maxWidth: "480px",
          margin: "0 auto",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>📅 ⚡</div>
        <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
          You are currently <span>offline</span>
        </h1>
        <p style={{ color: "var(--mute)", fontSize: "14px", lineHeight: "1.5", marginBottom: "20px" }}>
          Calendar 2027 is cached and available, but this specific page hasn't been saved yet.
          Connect to the internet to refresh.
        </p>
        <button
          className="pri"
          onClick={() => window.location.reload()}
          style={{ cursor: "pointer", fontWeight: 600 }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
