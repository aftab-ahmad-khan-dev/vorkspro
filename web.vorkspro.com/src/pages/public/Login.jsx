import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Lock, Globe, Eye, EyeOff, ArrowLeft } from "lucide-react";
import logo from "@/assets/vorkspro-logo.svg";

const LOGO_COLOR = "#251A3C"; // Vorks Pro brand
const NEON_PURPLE = "#a855f7";
const NEON_INDIGO = "#6366f1";
const DARK_BG = "#0f0a1f";
const DARK_BG_2 = "#0c0818";

// ─── Geometric Particle (SVG dots/lines for left panel) ───────────────────
function GeoPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.07]"
      xmlns="http://www.w3.org/2000/svg"
      style={{ pointerEvents: "none" }}
    >
      <defs>
        <pattern id="grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke={NEON_PURPLE} strokeWidth="0.5" />
        </pattern>
        <radialGradient id="fade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="vignette">
          <rect width="100%" height="100%" fill="url(#fade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" mask="url(#vignette)" />
    </svg>
  );
}

// ─── Floating orbs (neon purple & indigo) ───────────────────────────────────
const ORBS = [
  { w: 320, h: 320, top: "-10%", left: "-8%", color: "rgba(168, 85, 247, 0.22)", delay: "0s" },
  { w: 240, h: 240, top: "55%", left: "60%", color: "rgba(99, 102, 241, 0.18)", delay: "2.5s" },
  { w: 180, h: 180, top: "25%", left: "42%", color: "rgba(168, 85, 247, 0.14)", delay: "1.2s" },
];

// ─── Input ────────────────────────────────────────────────────────────────
function Field({ label, type = "text", value, onChange, placeholder, extra, autoComplete }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <label style={styles.label}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={styles.input}
          onFocus={e => (e.target.style.borderColor = NEON_PURPLE)}
          onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
        />
        {extra}
      </div>
    </div>
  );
}

// ─── Primary Button ───────────────────────────────────────────────────────
function PrimaryBtn({ children, loading, onClick, type = "submit" }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...styles.btn,
        background: `linear-gradient(135deg, ${NEON_PURPLE} 0%, ${NEON_INDIGO} 100%)`,
        transform: hov ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hov
          ? "0 20px 50px rgba(168,85,247,0.45)"
          : "0 12px 35px rgba(168,85,247,0.35)",
      }}
    >
      {loading ? (
        <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
          <span style={styles.spinner} /> Processing…
        </span>
      ) : (
        children
      )}
    </button>
  );
}

// ─── Back link ────────────────────────────────────────────────────────────
function BackLink({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.backLink}
      onMouseEnter={e => (e.target.style.color = NEON_PURPLE)}
      onMouseLeave={e => (e.target.style.color = "#64748B")}
    >
      <ArrowLeft size={14} style={{ flexShrink: 0 }} /> {children}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [baseUrl] = useState(
    typeof import.meta !== "undefined" ? import.meta.env?.VITE_APP_BASE_URL || "" : ""
  );
  const [view, setView] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const toast = { success: (m) => console.log("✓", m), error: (m) => console.error("✗", m) };

  const resetFields = () => {
    setUsername(""); setPassword(""); setEmail(""); setCode("");
    setNewPassword(""); setConfirmPassword(""); setResetToken("");
  };
  const goTo = (v) => { resetFields(); setView(v); };

  // ── Handlers (same logic as original) ──────────────────────────────────
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!username || !password) return toast.error("Please enter both username and password.");
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: username, password }),
      });
      const data = await res.json();
      if (data?.isSuccess) {
        toast.success("Login successful!");
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        navigate("/app/dashboard", { replace: true });
      } else toast.error(data?.message || "Login failed.");
    } catch { toast.error("Network error."); }
    finally { setLoading(false); }
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email.");
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}user/forgot-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data?.isSuccess) { toast.success("Reset code sent!"); setView("verify"); }
      else toast.error(data?.message || "Failed to send reset code.");
    } catch { toast.error("Network error."); }
    finally { setLoading(false); }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) return toast.error("Enter a valid 6-digit code.");
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}user/verify-reset-code`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (data?.isSuccess) { toast.success("Code verified!"); setResetToken(data?.data?.token || data?.token); setView("reset"); }
      else toast.error(data?.message || "Invalid or expired code.");
    } catch { toast.error("Network error."); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match.");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters.");
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}user/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${resetToken}` },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (data?.isSuccess) { toast.success("Password reset successfully!"); goTo("login"); }
      else toast.error(data?.message || "Failed to reset password.");
    } catch { toast.error("Network error."); }
    finally { setLoading(false); }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f0a1f; }
        ::placeholder { color: rgba(148,163,184,0.5) !important; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #1e1b4b inset !important; -webkit-text-fill-color: #E2E8F0 !important; }
        @keyframes floatA { 0%,100% { transform:translate(0,0) scale(1); } 50% { transform:translate(12px,-18px) scale(1.04); } }
        @keyframes floatB { 0%,100% { transform:translate(0,0) scale(1); } 50% { transform:translate(-10px,14px) scale(0.97); } }
        @keyframes floatC { 0%,100% { transform:translate(0,0); } 50% { transform:translate(8px,-10px); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideRight { from { opacity:0; transform:translateX(-24px); } to { opacity:1; transform:translateX(0); } }
        @keyframes pulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes borderGlow {
          0%,100% { box-shadow: 0 0 0 1px rgba(168,85,247,0.3), 0 32px 80px rgba(0,0,0,0.5); }
          50% { box-shadow: 0 0 0 1px rgba(168,85,247,0.5), 0 32px 80px rgba(0,0,0,0.6); }
        }
        @keyframes logoFloat { 0%,100% { transform:translateY(0px) rotate(0deg); } 50% { transform:translateY(-8px) rotate(1deg); } }
        .form-enter { animation: fadeUp 0.45s cubic-bezier(.22,.68,0,1.2) both; }
        .slide-right { animation: slideRight 0.6s cubic-bezier(.22,.68,0,1.2) both; }
      `}</style>

      {/* ── Root layout ─────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
        background: DARK_BG,
        overflow: "hidden",
      }}>

        {/* ════════════════ LEFT PANEL ════════════════ */}
        <div style={{
          flex: "0 0 48%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(155deg, ${DARK_BG} 0%, #1e1b4b 45%, #312e81 70%, ${DARK_BG_2} 100%)`,
          overflow: "hidden",
          padding: "60px 48px",
        }}>
          {/* Grid pattern */}
          <GeoPattern />

          {/* Floating orbs */}
          {ORBS.map((o, i) => (
            <div key={i} style={{
              position: "absolute",
              width: o.w, height: o.h,
              top: o.top, left: o.left,
              borderRadius: "50%",
              background: o.color,
              filter: "blur(60px)",
              animation: `${["floatA","floatB","floatC"][i]} ${6 + i * 1.5}s ease-in-out infinite`,
              animationDelay: o.delay,
            }} />
          ))}

          {/* Diagonal accent line (logo color) */}
          <div style={{
            position: "absolute",
            top: 0, right: 0,
            width: 2, height: "100%",
            background: `linear-gradient(to bottom, transparent 0%, ${NEON_PURPLE}40 40%, ${NEON_INDIGO}60 60%, transparent 100%)`,
          }} />

          {/* Content */}
          <div style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.8s ease",
          }}>
            {/* Logo box */}
            <div style={{
              width: 140,
              height: 140,
              margin: "0 auto 32px",
              borderRadius: 28,
              background: "linear-gradient(145deg, rgba(30,27,75,0.9), rgba(15,10,31,0.95))",
              border: `1px solid rgba(168,85,247,0.4)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "logoFloat 5s ease-in-out infinite, borderGlow 4s ease-in-out infinite",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
              backdropFilter: "blur(10px)",
            }}>
              <img
                src={logo}
                alt="Vorks Pro"
                style={{
                  width: 80,
                  height: "auto",
                  objectFit: "contain",
                  filter: "brightness(0) invert(1)",
                  opacity: 0.95,
                }}
              />
            </div>

            {/* Brand name */}
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#F8FAFC",
              marginBottom: 8,
              background: `linear-gradient(135deg, #e2e8f0 0%, ${NEON_PURPLE} 40%, ${NEON_INDIGO} 100%)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 4s linear infinite",
            }}>
              Vorks Pro Admin
            </h1>

            <p style={{
              fontSize: 14,
              color: "rgba(148,163,184,0.7)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 500,
              marginBottom: 52,
            }}>
              HR, projects & finance in one workspace
            </p>

            {/* Feature pills — Lucide icons */}
            {[
              { Icon: Zap, text: "Real-time analytics" },
              { Icon: Lock, text: "Enterprise-grade security" },
              { Icon: Globe, text: "Multi-market coverage" },
            ].map((f, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
                padding: "12px 20px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(8px)",
                animation: `fadeUp 0.6s ${0.4 + i * 0.12}s both`,
              }}>
                <f.Icon size={18} style={{ color: NEON_PURPLE, flexShrink: 0, opacity: 0.9 }} />
                <span style={{ fontSize: 13, color: "rgba(203,213,225,0.8)", fontWeight: 400 }}>
                  {f.text}
                </span>
              </div>
            ))}

            {/* Decorative dots */}
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 40 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  width: i === 2 ? 22 : 6,
                  height: 6,
                  borderRadius: 99,
                  background: i === 2 ? NEON_PURPLE : "rgba(168,85,247,0.5)",
                  animation: `pulse ${1.2 + i * 0.3}s ease-in-out infinite`,
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════ RIGHT PANEL ════════════════ */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(155deg, ${DARK_BG_2} 0%, #1e1b4b 100%)`,
          position: "relative",
          padding: "40px 32px",
          overflow: "hidden",
        }}>
          {/* Subtle top-right glow */}
          <div style={{
            position: "absolute",
            top: -80, right: -80,
            width: 300, height: 300,
            borderRadius: "50%",
            background: "rgba(168,85,247,0.12)",
            filter: "blur(80px)",
            pointerEvents: "none",
          }} />

          {/* Card */}
          <div style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 24,
            background: "linear-gradient(145deg, rgba(30,27,75,0.95), rgba(15,10,31,0.98))",
            border: "1px solid rgba(168,85,247,0.2)",
            padding: "44px 40px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            position: "relative",
            animation: "fadeUp 0.7s 0.15s both",
          }}>
            {/* Blue top accent bar */}
            <div style={{
              position: "absolute",
              top: 0, left: "10%",
              width: "80%", height: 2,
              borderRadius: "0 0 4px 4px",
              background: `linear-gradient(90deg, transparent, ${NEON_PURPLE} 40%, ${NEON_INDIGO} 60%, transparent)`,
            }} />

            {/* ── LOGIN VIEW ── */}
            {view === "login" && (
              <form onSubmit={handleSignIn} className="form-enter">
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <img src={logo} alt="" style={{ width: 28, height: "auto", objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.9 }} />
                    <span style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                      Vorks Pro Admin
                    </span>
                  </div>
                  <h2 style={styles.heading}>Welcome back</h2>
                  <p style={styles.subheading}>Sign in with your workspace credentials to access HR, projects, and finance.</p>
                </div>

                <Field
                  label="Username / Email"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="username"
                />

                <Field
                  label="Password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  extra={
                    <button
                      type="button"
                      onClick={() => setShowPwd(p => !p)}
                      aria-label={showPwd ? "Hide password" : "Show password"}
                      style={{
                        position: "absolute", right: 14, top: "50%",
                        transform: "translateY(-50%)",
                        background: "none", border: "none",
                        color: "rgba(148,163,184,0.6)",
                        cursor: "pointer", lineHeight: 1,
                        padding: 4,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />

                <div style={{ textAlign: "right", marginTop: -10, marginBottom: 24 }}>
                  <button
                    type="button"
                    onClick={() => goTo("forgot")}
                    style={{ ...styles.textLink }}
                    onMouseEnter={e => (e.target.style.color = "#c084fc")}
                    onMouseLeave={e => (e.target.style.color = "#a78bfa")}
                  >
                    Forgot password?
                  </button>
                </div>

                <PrimaryBtn loading={loading}>Sign in</PrimaryBtn>

                <p style={{ fontSize: 11, color: "rgba(100,116,139,0.7)", textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
                  By continuing you agree to Vorks Pro{" "}
                  <span style={{ color: "#c084fc", cursor: "pointer" }}>security & usage policies</span>.
                </p>
              </form>
            )}

            {/* ── FORGOT VIEW ── */}
            {view === "forgot" && (
              <form onSubmit={handleSendResetCode} className="form-enter">
                <BackLink onClick={() => goTo("login")}>Back to login</BackLink>
                <div style={{ marginBottom: 32 }}>
                  <h2 style={styles.heading}>Reset password</h2>
                  <p style={styles.subheading}>Enter your work email and we'll send a 6-digit verification code.</p>
                </div>
                <Field
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
                <PrimaryBtn loading={loading}>Send reset code</PrimaryBtn>
                <p style={{ fontSize: 11, color: "rgba(100,116,139,0.7)", textAlign: "center", marginTop: 20 }}>
                  Need help?{" "}
                  <span style={{ color: "#c084fc" }}>support@vorkspro.com</span>
                </p>
              </form>
            )}

            {/* ── VERIFY VIEW ── */}
            {view === "verify" && (
              <form onSubmit={handleVerifyCode} className="form-enter">
                <BackLink onClick={() => goTo("forgot")}>Back</BackLink>
                <div style={{ marginBottom: 32 }}>
                  <h2 style={styles.heading}>Enter code</h2>
                  <p style={styles.subheading}>
                    We sent a 6-digit code to{" "}
                    <span style={{ color: "#c084fc" }}>{email}</span>
                  </p>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={styles.label}>Verification code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    style={{
                      ...styles.input,
                      textAlign: "center",
                      fontSize: 28,
                      letterSpacing: "0.4em",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 500,
                    }}
                    onFocus={e => (e.target.style.borderColor = NEON_PURPLE)}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                </div>

                <PrimaryBtn loading={loading}>Verify code</PrimaryBtn>
                <button
                  type="button"
                  onClick={handleSendResetCode}
                  disabled={loading}
                  style={{ ...styles.ghostBtn, marginTop: 12 }}
                  onMouseEnter={e => (e.target.style.borderColor = "rgba(168,85,247,0.4)")}
                  onMouseLeave={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                >
                  {loading ? "Sending…" : "Resend code"}
                </button>
              </form>
            )}

            {/* ── RESET VIEW ── */}
            {view === "reset" && (
              <form onSubmit={handleResetPassword} className="form-enter">
                <BackLink onClick={() => goTo("verify")}>Back</BackLink>
                <div style={{ marginBottom: 32 }}>
                  <h2 style={styles.heading}>New password</h2>
                  <p style={styles.subheading}>Choose a strong, unique password for your account.</p>
                </div>

                <Field
                  label="New password"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                />

                <div style={{ marginBottom: confirmPassword && newPassword !== confirmPassword ? 8 : 24 }}>
                  <label style={styles.label}>Confirm password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    style={{
                      ...styles.input,
                      borderColor: confirmPassword && newPassword !== confirmPassword
                        ? "rgba(239,68,68,0.6)"
                        : "rgba(255,255,255,0.1)",
                    }}
                    onFocus={e => (e.target.style.borderColor = NEON_PURPLE)}
                    onBlur={e => (e.target.style.borderColor =
                      confirmPassword && newPassword !== confirmPassword
                        ? "rgba(239,68,68,0.6)"
                        : "rgba(255,255,255,0.1)"
                    )}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p style={{ color: "#F87171", fontSize: 12, marginTop: 6, marginBottom: 16 }}>
                      Passwords do not match.
                    </p>
                  )}
                </div>

                <PrimaryBtn loading={loading}>Reset password</PrimaryBtn>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────
const styles = {
  heading: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 26,
    fontWeight: 700,
    color: "#F1F5F9",
    letterSpacing: "-0.02em",
    marginBottom: 6,
  },
  subheading: {
    fontSize: 13.5,
    color: "rgba(148,163,184,0.7)",
    lineHeight: 1.55,
    fontWeight: 400,
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 500,
    color: "rgba(148,163,184,0.75)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 7,
  },
  input: {
    width: "100%",
    height: 46,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    padding: "0 14px",
    fontSize: 14,
    color: "#E2E8F0",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s, background 0.2s",
  },
  btn: {
    width: "100%",
    height: 46,
    borderRadius: 12,
    border: "none",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'Syne', sans-serif",
    letterSpacing: "0.03em",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  ghostBtn: {
    width: "100%",
    height: 44,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "transparent",
    color: "rgba(148,163,184,0.8)",
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  textLink: {
    background: "none",
    border: "none",
    color: "#a78bfa",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    transition: "color 0.2s",
    fontFamily: "'DM Sans', sans-serif",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: "none",
    border: "none",
    color: "#64748B",
    fontSize: 12,
    cursor: "pointer",
    marginBottom: 20,
    fontFamily: "'DM Sans', sans-serif",
    transition: "color 0.2s",
  },
  spinner: {
    display: "inline-block",
    width: 14,
    height: 14,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
};