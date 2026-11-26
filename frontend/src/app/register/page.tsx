"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!fullName || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, password, confirm_password: confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed.");

      localStorage.setItem("sarvam_token", data.token);
      localStorage.setItem("sarvam_user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("sarvam:auth-change"));
      router.push("/profile");
    } catch (err: any) {
      setError(err.message || "Registration error.");
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
        <h2 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "26px", margin: "0 0 6px" }}>Create Account</h2>
        <p style={{ color: "var(--muted)", fontSize: "13px", margin: "0 0 20px" }}>Join SARVAM to explore Karnataka heritage.</p>

        {error && <div style={{ padding: 12, marginBottom: 16, background: "#7d293214", border: "1px solid var(--red)", borderRadius: 8, color: "var(--red)", fontSize: "13px" }}>{error}</div>}

        <form onSubmit={handleRegister} style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600 }}>Full Name</label>
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Karnataka Resident" style={{ width: "100%", height: 42, padding: "0 12px", background: "#f8f4e9", border: "1px solid var(--sand)", borderRadius: 8 }} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600 }}>Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: "100%", height: 42, padding: "0 12px", background: "#f8f4e9", border: "1px solid var(--sand)", borderRadius: 8 }} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600 }}>Password (min 6 chars)</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: "100%", height: 42, padding: "0 12px", background: "#f8f4e9", border: "1px solid var(--sand)", borderRadius: 8 }} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600 }}>Confirm Password</label>
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" style={{ width: "100%", height: 42, padding: "0 12px", background: "#f8f4e9", border: "1px solid var(--sand)", borderRadius: 8 }} />
          </div>
          <button type="submit" disabled={loading} style={{ width: "100%", height: 46, background: "var(--red)", color: "#fffdf9", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", marginTop: 6 }}>
            {loading ? "Creating..." : "Register"}
          </button>
          <div style={{ textAlign: "center", fontSize: "13px", color: "var(--muted)" }}>
            Already have an account? <Link href="/login" style={{ color: "var(--red)", fontWeight: 600 }}>Sign In</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
