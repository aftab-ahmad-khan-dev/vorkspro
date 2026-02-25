import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import logo from "../../assets/vorkspro-logo.svg";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import heroImage from "../../assets/nls.png";

function Login() {
  const [loading, setLoading] = useState(false);
  const [baseUrl] = useState(import.meta.env.VITE_APP_BASE_URL);
  const navigate = useNavigate();

  // View state
  const [view, setView] = useState("login"); // 'login' | 'forgot' | 'verify' | 'reset'

  // Login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Forgot Password
  const [email, setEmail] = useState("");

  // Verify Code
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");

  // Reset Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Helper: Reset all fields
  const resetFields = () => {
    setUsername("");
    setPassword("");
    setEmail("");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setResetToken("");
  };

  const goTo = (newView) => {
    resetFields();
    setView(newView);
  };

  const [showPassword, setShowPassword] = useState(false);


  // === LOGIN ===
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!username || !password)
      return toast.error("Please enter both username and password.");

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
        localStorage.setItem("token", data?.token);
        localStorage.setItem("refreshToken", data?.refreshToken);
        navigate("/app/dashboard");
      } else {
        toast.error(data?.message || "Login failed.");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // === SEND RESET CODE ===
  const handleSendResetCode = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email.");

    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}user/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data?.isSuccess) {
        toast.success("Reset code sent to your email!");
        setView("verify");
      } else {
        toast.error(data?.message || "Failed to send reset code.");
      }
    } catch (err) {
      toast.error("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // === VERIFY CODE ===
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6)
      return toast.error("Enter a valid 6-digit code.");

    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}user/verify-reset-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (data?.isSuccess) {
        toast.success("Code verified!");
        setResetToken(data?.data?.token || data?.token);
        setView("reset");
      } else {
        toast.error(data?.message || "Invalid or expired code.");
      }
    } catch (err) {
      toast.error("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // === RESET PASSWORD ===
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match.");
    if (newPassword.length < 6)
      return toast.error("Password must be at least 6 characters.");

    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}user/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resetToken}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();

      if (data?.isSuccess) {
        toast.success("Password reset successfully! Please log in.");
        goTo("login");
      } else {
        toast.error(data?.message || "Failed to reset password.");
      }
    } catch (err) {
      toast.error("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };
  const primaryButtonClasses =
    "w-full h-11 rounded-xl bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#4F46E5] " +
    "text-sm font-semibold text-white shadow-[0_18px_35px_rgba(15,23,42,0.7)] " +
    "transition-all duration-200 hover:shadow-[0_22px_45px_rgba(15,23,42,0.9)] " +
    "hover:translate-y-[-1px] active:translate-y-[0px] active:scale-[0.99] " +
    "disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <>
      <div
        className="min-h-screen relative flex items-center justify-center px-4 py-6 overflow-hidden
                  bg-slate-950
                  bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.2),transparent_55%)]"
      >
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-cyan-500/25 blur-[140px] animate-float" />
          <div className="absolute top-1/4 right-[-40px] h-96 w-96 rounded-full bg-indigo-500/25 blur-[160px] animate-float-delay1" />
          <div className="absolute bottom-[-40px] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-purple-500/18 blur-[150px] animate-float-delay2" />
        </div>

        {/* Subtle gradient line background */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.25]
                    bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.26),transparent_50%)]"
        />

        {/* Card wrapper with gradient border */}
        <div className="w-full max-w-md relative z-10">
          <div className="rounded-[26px] p-[1px] shadow-[0_26px_60px_rgba(15,23,42,0.95)]">
            <div className="relative rounded-[24px] backdrop-blur-2xl px-8 py-7 border border-white/5">
              {/* Top meta row */}
              <div className="mb-4 flex items-center justify-center gap-3">
                <div className="flex items-center gap-3">

                  <div className="text-center">
                    <img
                      src={logo}
                      alt="Vorks Pro"
                      className="w-60 mb-1 "
                    />

                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="mb-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* ================== LOGIN VIEW ================== */}
              {view === "login" && (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                      Welcome back
                    </h2>
                    <p className="mt-1 text-xs text-slate-300/85">
                      Sign in with your workspace credentials
                    </p>
                  </div>

                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-200 mb-1.5">
                        Username / Email
                      </label>
                      <Input
                        type="text"
                        placeholder="you@vorkspro.com"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full h-11 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 text-sm 
                               text-white placeholder:text-slate-400/80
                               focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:outline-none"
                      />
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="block text-xs font-medium text-slate-200">
                          Password
                        </label>
                      </div>

                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full h-11 rounded-xl border border-white/10 bg-white/[0.06] 
                 px-3.5 pr-11 text-sm text-white placeholder:text-slate-400/80
                 focus-visible:ring-2 focus-visible:ring-blue-500 
                 focus-visible:ring-offset-0 focus-visible:outline-none"
                        />

                        {/* Eye Icon */}
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 
                 text-slate-400 hover:text-white transition"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>


                    <div className="flex justify-between items-center text-[11px]">
                      <button
                        type="button"
                        onClick={() => setView("forgot")}
                        className="text-xs font-medium cursor-pointer text-blue-300 hover:text-blue-200 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className={primaryButtonClasses}
                    >
                      {loading ? "Signing in…" : "Sign in"}
                    </Button>
                  </form>

                  <div className="mt-6 pt-4 border-t border-white/5">
                    <p className="text-[11px] text-slate-400/80 text-center">
                      By continuing you agree to internal{" "}
                      <span className="underline underline-offset-2 decoration-slate-500/60">
                        security & usage policies
                      </span>
                      .
                    </p>
                  </div>
                </>
              )}

              {/* ================== FORGOT PASSWORD VIEW ================== */}
              {view === "forgot" && (
                <>
                  <button
                    onClick={() => goTo("login")}
                    className="mb-4 inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-slate-300 hover:text-slate-100 transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to login</span>
                  </button>

                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-white mb-1">
                      Reset your password
                    </h2>
                    <p className="text-xs text-slate-300/85">
                      Enter your work email and we’ll send a 6-digit
                      verification code.
                    </p>
                  </div>

                  <form onSubmit={handleSendResetCode} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-200 mb-1.5">
                        Email address
                      </label>
                      <Input
                        type="email"
                        placeholder="you@vorkspro.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 text-sm 
                               text-white placeholder:text-slate-400/80
                               focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:outline-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className={primaryButtonClasses}
                    >
                      {loading ? "Sending…" : "Send reset code"}
                    </Button>
                  </form>

                  <div className="mt-6 pt-4 border-t border-white/5">
                    <p className="text-[11px] text-slate-400/85 text-center">
                      Need help? Contact{" "}
                      <a
                        href="mailto:support@techvision.com"
                        className="font-medium text-blue-300 hover:text-blue-200"
                      >
                        support@techvision.com
                      </a>
                    </p>
                  </div>
                </>
              )}

              {/* ================== VERIFY CODE VIEW ================== */}
              {view === "verify" && (
                <>
                  <button
                    onClick={() => setView("forgot")}
                    className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-300 hover:text-slate-100 transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>

                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-white mb-1">
                      Enter verification code
                    </h2>
                    <p className="text-xs text-slate-300/85">
                      We sent a 6-digit code to{" "}
                      <span className="font-semibold text-slate-100">
                        {email}
                      </span>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-200 mb-1.5">
                        6-digit code
                      </label>
                      <Input
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        value={code}
                        onChange={(e) =>
                          setCode(e.target.value.replace(/\D/g, ""))
                        }
                        className="w-full h-11 text-center text-2xl tracking-[0.35em] font-mono rounded-xl 
                               border border-white/10 bg-white/[0.06] text-white placeholder:text-slate-500
                               focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:outline-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || code.length !== 6}
                      className={primaryButtonClasses}
                    >
                      {loading ? "Verifying…" : "Verify code"}
                    </Button>
                  </form>

                  <div className="mt-4 text-center">
                    <button
                      onClick={handleSendResetCode}
                      disabled={loading}
                      className="text-[11px] font-medium text-blue-300 hover:text-blue-200 disabled:opacity-60"
                    >
                      {loading ? "Sending…" : "Resend code"}
                    </button>
                  </div>
                </>
              )}

              {/* ================== RESET PASSWORD VIEW ================== */}
              {view === "reset" && (
                <>
                  <button
                    onClick={() => setView("verify")}
                    className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-300 hover:text-slate-100 transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>

                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-white mb-1">
                      Set a new password
                    </h2>
                    <p className="text-xs text-slate-300/85">
                      Choose a strong, unique password to keep your account
                      secure.
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-200 mb-1.5">
                        New password
                      </label>
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-11 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 text-sm 
                               text-white placeholder:text-slate-400/80
                               focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-200 mb-1.5">
                        Confirm password
                      </label>
                      <Input
                        type="password"
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full h-11 rounded-xl px-3.5 text-sm bg-white/[0.06] border 
                      ${confirmPassword && newPassword !== confirmPassword
                            ? "border-red-500/80 focus-visible:ring-red-500"
                            : "border-white/10 focus-visible:ring-blue-500"
                          } 
                      text-white placeholder:text-slate-400/80
                      focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:outline-none`}
                      />
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="mt-1 text-[11px] text-red-400">
                          Passwords do not match.
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={
                        loading ||
                        newPassword.length < 6 ||
                        !confirmPassword ||
                        newPassword !== confirmPassword
                      }
                      className={primaryButtonClasses}
                    >
                      {loading ? "Saving…" : "Reset password"}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="absolute -right-10 -bottom-60">
          <img
            src={heroImage}
            alt="Vorks Pro"
            className="  h-[45rem] w-[45rem]  opacity-1.5"
          />
        </div>
        {/* Keyframes for glow float */}
        <style>{`
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-14px); }
      }
      .animate-float {
        animation: float 10s ease-in-out infinite;
      }
      .animate-float-delay1 {
        animation: float 12s ease-in-out infinite 1.5s;
      }
      .animate-float-delay2 {
        animation: float 14s ease-in-out infinite 3s;
      }
    `}</style>
      </div>
    </>
  );
}

export default Login;
