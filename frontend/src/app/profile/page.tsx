"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ full_name: string; email: string; created_at?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sarvam_token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("sarvam_token");
        localStorage.removeItem("sarvam_user");
        router.push("/login");
      });
  }, [router]);

  async function handleLogout() {
    const token = localStorage.getItem("sarvam_token");
    if (token) {
      try {
        await fetch("http://127.0.0.1:8000/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    localStorage.removeItem("sarvam_token");
    localStorage.removeItem("sarvam_user");
    window.dispatchEvent(new Event("sarvam:auth-change"));
    router.push("/");
  }

  if (loading) {
    return (
      <main className="landing-page" style={{ display: "grid", placeItems: "center", minHeight: "100svh" }}>
        <div style={{ color: "var(--muted)", fontSize: "14px" }}>Loading profile...</div>
      </main>
    );
  }

  return (
    <main className="landing-page" style={{ padding: "60px 24px", minHeight: "100svh", background: "var(--ivory)" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <Link className="wordmark" href="/">
            <span className="wordmark-seal">S</span>
            <span className="wordmark-type"><strong>SARVAM</strong><small>A LIVING ATLAS</small></span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            style={{ padding: "10px 20px", background: "transparent", border: "1px solid var(--red)", color: "var(--red)", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
          >
            Sign Out
          </button>
        </header>

        <div style={{ background: "#fffdf9", padding: 40, borderRadius: 16, border: "1px solid var(--sand)", boxShadow: "0 10px 30px rgba(56,52,43,0.06)" }}>
          <span style={{ color: "var(--red)", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
            USER ACCOUNT
          </span>
          <h1 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "32px", margin: "6px 0 20px", color: "var(--ink)" }}>
            {user?.full_name}
          </h1>

          <div style={{ display: "grid", gap: 16, borderTop: "1px solid var(--sand)", paddingTop: 20 }}>
            <div>
              <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Email Address</span>
              <div style={{ fontSize: "16px", color: "var(--ink)", fontWeight: 500, marginTop: 4 }}>{user?.email}</div>
            </div>
            {user?.created_at && (
              <div>
                <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Member Since</span>
                <div style={{ fontSize: "15px", color: "var(--ink)", fontWeight: 500, marginTop: 4 }}>
                  {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 32, padding: 20, background: "#f8f4e9", borderRadius: 12, border: "1px solid var(--sand)" }}>
            <h3 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "18px", margin: "0 0 8px" }}>SARVAM Platform Access</h3>
            <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              You are authenticated to explore Karnataka's regional heritage archives, interact with the AI Knowledge Assistant, and submit community contributions.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
