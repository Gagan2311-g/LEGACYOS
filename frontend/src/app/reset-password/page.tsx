"use client";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = searchParams.get("token");
    if (t) setToken(t);
  }, [searchParams]);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token.trim()) {
      setError("Reset token is missing.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), new_password: newPassword, confirm_password: confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Reset failed.");

      setMessage("Password updated successfully! Redirecting...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Could not reset password.");
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
        <h2 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "26px", margin: "0 0 6px" }}>Reset Password</h2>
        <p style={{ color: "var(--muted)", fontSize: "13px", margin: "0 0 20px" }}>Enter your new password.</p>

        {error && <div style={{ padding: 12, marginBottom: 16, background: "#7d293214", border: "1px solid var(--red)", borderRadius: 8, color: "var(--red)", fontSize: "13px" }}>{error}</div>}
        {message && <div style={{ padding: 12, marginBottom: 16, background: "#2e6f4014", border: "1px solid #2e6f40", borderRadius: 8, color: "#2e6f40", fontSize: "13px" }}>{message}</div>}

        <form onSubmit={handleReset} style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600 }}>Reset Token</label>
            <input type="text" required value={token} onChange={(e) => setToken(e.target.value)} placeholder="Enter token" style={{ width: "100%", height: 42, padding: "0 12px", background: "#f8f4e9", border: "1px solid var(--sand)", borderRadius: 8 }} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600 }}>New Password (min 6 chars)</label>
            <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" style={{ width: "100%", height: 42, padding: "0 12px", background: "#f8f4e9", border: "1px solid var(--sand)", borderRadius: 8 }} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600 }}>Confirm New Password</label>
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" style={{ width: "100%", height: 42, padding: "0 12px", background: "#f8f4e9", border: "1px solid var(--sand)", borderRadius: 8 }} />
          </div>
          <button type="submit" disabled={loading} style={{ width: "100%", height: 46, background: "var(--red)", color: "#fffdf9", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", marginTop: 6 }}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
