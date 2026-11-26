"use client";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [devToken, setDevToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setDevToken("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Request failed.");

      setMessage(data.message || "Password reset instructions sent.");
      if (data.reset_token) setDevToken(data.reset_token);
    } catch (err: any) {
      setError(err.message || "Could not process request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="landing-page" style={{ display: "grid", placeItems: "center", minHeight: "100svh", padding: 24, background: "var(--ivory)" }}>
      <div style={{ width: "100%", maxWidth: 440, background: "#fffdf9", padding: 40, borderRadius: 16, border: "1px solid var(--sand)", boxShadow: "0 10px 30px rgba(56,52,43,0.06)" }}>
        <Link className="wordmark" href="/" style={{ marginBottom: 24, display: "inline-flex" }}>
          <span className="wordmark-seal">S</span>
          <span className="wordmark-type"><strong>SARVAM</strong><small>A LIVING ATLAS</small></span>
        </Link>
        <h2 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "26px", margin: "0 0 6px" }}>Forgot Password</h2>
        <p style={{ color: "var(--muted)", fontSize: "13px", margin: "0 0 20px" }}>Enter your email to reset password.</p>

        {error && <div style={{ padding: 12, marginBottom: 16, background: "#7d293214", border: "1px solid var(--red)", borderRadius: 8, color: "var(--red)", fontSize: "13px" }}>{error}</div>}
        {message && <div style={{ padding: 12, marginBottom: 16, background: "#2e6f4014", border: "1px solid #2e6f40", borderRadius: 8, color: "#2e6f40", fontSize: "13px" }}>{message}</div>}

        {devToken && (
          <div style={{ padding: 12, marginBottom: 16, background: "#f8f4e9", border: "1px solid var(--gold)", borderRadius: 8, fontSize: "12px", wordBreak: "break-all" }}>
            <strong>Dev Reset Link:</strong> <Link href={`/reset-password?token=${devToken}`} style={{ color: "var(--red)" }}>Reset Password Now</Link>
          </div>
        )}

        <form onSubmit={handleForgot} style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600 }}>Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: "100%", height: 42, padding: "0 12px", background: "#f8f4e9", border: "1px solid var(--sand)", borderRadius: 8 }} />
          </div>
          <button type="submit" disabled={loading} style={{ width: "100%", height: 46, background: "var(--red)", color: "#fffdf9", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
            {loading ? "Sending..." : "Send Reset Instructions"}
          </button>
          <div style={{ textAlign: "center", fontSize: "13px", color: "var(--muted)" }}>
            Remembered password? <Link href="/login" style={{ color: "var(--red)", fontWeight: 600 }}>Sign In</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
