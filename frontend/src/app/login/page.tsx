"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed.");

      localStorage.setItem("sarvam_token", data.token);
      localStorage.setItem("sarvam_user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("sarvam:auth-change"));
      router.push("/profile");
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="landing-page">
      <div className="story-slide" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", minHeight: "100svh" }}>
        <div className="story-panel" style={{ justifyContent: "center" }}>
          <header className="masthead" style={{ position: "absolute", top: 28, left: 28, right: 28 }}>
            <Link className="wordmark" href="/">
              <span className="wordmark-seal">S</span>
              <span className="wordmark-type"><strong>SARVAM</strong><small>A LIVING ATLAS</small></span>
            </Link>
          </header>
          <div style={{ maxWidth: 460, margin: "0 auto", zIndex: 1 }}>
            <span className="support-kicker" style={{ color: "var(--red)", display: "block", marginBottom: 12 }}>KARNATAKA HERITAGE</span>
            <h1 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "36px", margin: "0 0 16px" }}>
              Preserving Karnataka's Heritage
            </h1>
            <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: 1.6 }}>
              AI-powered knowledge platform exploring traditions, agriculture, and arts across Karnataka.
            </p>
          </div>
        </div>
        <div style={{ background: "#fffdf9", display: "grid", placeItems: "center", padding: 40, minHeight: "100svh" }}>
          <div style={{ width: "100%", maxWidth: 400 }}>
            <h2 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "28px", margin: "0 0 6px" }}>Welcome Back</h2>
            <p style={{ color: "var(--muted)", fontSize: "13px", margin: "0 0 24px" }}>Sign in to your SARVAM account.</p>
            {error && <div style={{ padding: 12, marginBottom: 16, background: "#7d293214", border: "1px solid var(--red)", borderRadius: 8, color: "var(--red)", fontSize: "13px" }}>{error}</div>}
            <form onSubmit={handleLogin} style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600 }}>Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: "100%", height: 44, padding: "0 12px", background: "#f8f4e9", border: "1px solid var(--sand)", borderRadius: 8 }} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Password</label>
                  <Link href="/forgot-password" style={{ fontSize: "12px", color: "var(--red)", textDecoration: "none" }}>Forgot?</Link>
                </div>
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: "100%", height: 44, padding: "0 12px", background: "#f8f4e9", border: "1px solid var(--sand)", borderRadius: 8 }} />
              </div>
              <button type="submit" disabled={loading} style={{ width: "100%", height: 46, background: "var(--red)", color: "#fffdf9", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
              <div style={{ textAlign: "center", fontSize: "13px", color: "var(--muted)" }}>
                No account? <Link href="/register" style={{ color: "var(--red)", fontWeight: 600 }}>Create Account</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
