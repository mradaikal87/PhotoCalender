import Link from "next/link";

export default function NotFound() {
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
        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>
          404 - Page <span>Not Found</span>
        </h1>
        <p style={{ color: "var(--mute)", fontSize: "14px", marginBottom: "20px" }}>
          The page you are looking for does not exist.
        </p>
        <Link href="/" className="dl">
          Return to Calendar
        </Link>
      </div>
    </div>
  );
}
