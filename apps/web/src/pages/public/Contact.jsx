/**
 * VorksPro Contact — redesigned with dark luxury editorial aesthetic
 */

import React, { useState, useEffect, useId } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  MessageCircle,
  Menu,
  X,
  Send,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import logo from "@/assets/vorkspro-logo.svg";

// ── Muted hexagon grid (borders only, tessellating); same as Landing ──
function HexagonBg({ variant = "light" }) {
  const id = useId();
  const strokeLight = "#a855f7";
  const strokeDark = "rgba(255,255,255,0.08)";
  const strokeColor = variant === "dark" ? strokeDark : strokeLight;
  const hex = "50,0 100,25 100,75 50,100 0,75 0,25";
  const w = 100;
  const h = 75;
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: variant === "dark" ? 0.9 : 0.06 }}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <pattern id={`hex-ct-${id}`} x="0" y="0" width={w} height={h * 2} patternUnits="userSpaceOnUse">
          <polygon points={hex} fill="none" stroke={strokeColor} strokeWidth="0.8" transform="translate(0,0)" />
          <polygon points={hex} fill="none" stroke={strokeColor} strokeWidth="0.8" transform={`translate(${w / 2},${h})`} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#hex-ct-${id})`} />
    </svg>
  );
}

// ── Same theme as Landing (navy, purple, indigo) ──
const colors = {
  navy: "#251A3C",
  navyLight: "#3D2E5C",
  navyDeep: "#0f0a1f",
  purple: "#a855f7",
  purpleLight: "#c084fc",
  indigo: "#6366f1",
  emerald: "#0D9F6E",
  emeraldLight: "#10B981",
  emeraldBg: "#F0FDF9",
  bg: "#F8FAFF",
  surface: "#FFFFFF",
  surface2: "#F5F3FF",
  border: "#E5E0F5",
  text: "#1E293B",
  text2: "#4B5E7A",
  text3: "#8094B4",
  ink: "#0F172A",
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Nunito:wght@700;800;900&display=swap');`;

const CSS = `
* { box-sizing: border-box; }

.ct-page {
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
  background: ${colors.bg};
  color: ${colors.text};
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Topbar ── */
.ct-topbar {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
  gap: 8px; padding: 10px 16px; text-align: center;
  font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 600;
  background: ${colors.navy}; color: #fff;
}
.ct-topbar-badge {
  border-radius: 99px; padding: 2px 10px; font-size: 11px;
  font-weight: 800; letter-spacing: .04em;
  background: ${colors.purple}; color: #fff;
}
.ct-topbar-amber { color: ${colors.purpleLight}; font-weight: 800; }

/* ── Navbar ── */
.ct-nav {
  position: sticky; top: 0; z-index: 50; width: 100%;
  border-bottom: 1px solid rgba(221,228,240,.35);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  background: rgba(248,250,255,.72);
  transition: all .3s;
}
.ct-nav.scrolled {
  background: rgba(255,255,255,.82);
  border-color: rgba(221,228,240,.8);
  box-shadow: 0 4px 30px rgba(27,43,94,.06);
}
.ct-nav-inner {
  max-width: 1100px; margin: 0 auto;
  padding: 0 20px; height: 60px;
  display: flex; align-items: center; justify-content: space-between;
}
.ct-logo {
  display: flex; align-items: center; gap: 8px;
  font-family: 'Nunito', sans-serif; font-size: 19px; font-weight: 900;
  color: ${colors.navy}; text-decoration: none;
}
.ct-logo img { height: 28px; width: auto; }
.ct-logo em { font-style: normal; color: ${colors.purple}; }
.ct-nav-links { display: flex; align-items: center; gap: 24px; }
.ct-nav-link {
  font-size: 14px; font-weight: 600; color: ${colors.text2};
  text-decoration: none; transition: color .2s;
}
.ct-nav-link:hover { color: ${colors.navy}; }
.ct-nav-cta {
  display: inline-flex; align-items: center; padding: 9px 20px;
  border-radius: 99px; font-family: 'Nunito', sans-serif;
  font-size: 13px; font-weight: 800;
  background: ${colors.navy}; color: #fff;
  text-decoration: none; transition: opacity .2s;
}
.ct-nav-cta:hover { opacity: .88; }
.ct-menu-btn {
  display: none; background: none; border: none;
  padding: 6px; border-radius: 8px; cursor: pointer;
  color: ${colors.navy};
}
@media (max-width: 768px) {
  .ct-nav-links { display: none; }
  .ct-menu-btn { display: flex; align-items: center; justify-content: center; }
}

/* ── Mobile menu ── */
.ct-mobile-menu {
  border-bottom: 1px solid ${colors.border};
  background: rgba(255,255,255,.98);
  backdrop-filter: blur(12px);
  padding: 12px 20px 16px;
  display: flex; flex-direction: column; gap: 2px;
}
.ct-mobile-link {
  padding: 10px 0; font-size: 14px; font-weight: 600;
  color: ${colors.text2}; text-decoration: none; border-bottom: 1px solid ${colors.border};
}
.ct-mobile-cta {
  margin-top: 10px; padding: 12px; border-radius: 12px;
  text-align: center; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 800;
  background: ${colors.navy}; color: #fff; text-decoration: none; display: block;
}

/* ── Main layout ── */
.ct-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: calc(100vh - 60px - 42px);
  max-width: 80vw;
  margin: 0 auto;
  width: 100%;
}

/* ── Left panel ── */
.ct-left {
  display: flex; flex-direction: column; justify-content: center;
  padding: 64px 56px;
  background: linear-gradient(160deg, ${colors.navyDeep} 0%, ${colors.navy} 60%, ${colors.navyLight} 100%);
  position: relative; overflow: hidden;
}
.ct-left-blob {
  position: absolute; border-radius: 50%; pointer-events: none;
  filter: blur(70px);
}
.ct-left-blob-1 {
  width: 340px; height: 340px;
  background: radial-gradient(circle, rgba(168,85,247,.2) 0%, transparent 70%);
  top: -80px; right: -60px;
}
.ct-left-blob-2 {
  width: 280px; height: 280px;
  background: radial-gradient(circle, rgba(99,102,241,.15) 0%, transparent 70%);
  bottom: -60px; left: -40px;
}
.ct-left-inner { position: relative; z-index: 1; }

.ct-eyebrow {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase;
  color: ${colors.purpleLight}; margin-bottom: 14px;
}
.ct-eyebrow-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: ${colors.purpleLight};
  animation: ctPulse 2s ease-in-out infinite;
}
@keyframes ctPulse { 0%,100%{opacity:1} 50%{opacity:.3} }

.ct-left-title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(28px, 3.5vw, 40px); font-weight: 800;
  color: #fff; line-height: 1.1; margin: 0 0 16px;
  letter-spacing: -.02em;
}
.ct-left-title span { color: ${colors.purpleLight}; }
.ct-left-sub {
  font-size: 15px; line-height: 1.65; color: rgba(255,255,255,.55);
  margin: 0 0 36px; max-width: 380px;
}

/* ── Contact cards on left ── */
.ct-cards { display: flex; flex-direction: column; gap: 14px; margin-bottom: 36px; }
.ct-card {
  display: flex; align-items: center; gap: 16px;
  padding: 18px 20px; border-radius: 14px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  text-decoration: none; transition: all .2s; cursor: pointer;
}
.ct-card:hover {
  background: rgba(255,255,255,.1);
  border-color: rgba(255,255,255,.2);
  transform: translateX(4px);
}
.ct-card-icon {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.ct-card-icon.emerald { background: rgba(168,85,247,.2); color: ${colors.purpleLight}; }
.ct-card-icon.navy { background: rgba(99,102,241,.2); color: #818cf8; }
.ct-card-label {
  font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
  color: #fff; margin-bottom: 2px;
}
.ct-card-value { font-size: 13px; color: rgba(255,255,255,.5); }
.ct-card-arrow { margin-left: auto; color: rgba(255,255,255,.3); flex-shrink: 0; }

.ct-trust {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-radius: 10px;
  background: rgba(168,85,247,.1); border: 1px solid rgba(168,85,247,.2);
}
.ct-trust-text { font-size: 12px; color: rgba(255,255,255,.5); line-height: 1.5; }
.ct-trust-text strong { color: ${colors.purpleLight}; font-weight: 600; }

/* ── Right panel (form) ── */
.ct-right {
  display: flex; flex-direction: column; justify-content: center;
  padding: 64px 56px;
  background: ${colors.surface};
  overflow-y: auto;
}

.ct-form-eyebrow {
  font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase;
  color: ${colors.purple}; opacity: .7; margin-bottom: 10px;
}
.ct-form-title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(22px, 2.8vw, 30px); font-weight: 800;
  color: ${colors.ink}; margin: 0 0 6px; letter-spacing: -.01em;
}
.ct-form-sub {
  font-size: 14px; color: ${colors.text2}; margin: 0 0 28px; line-height: 1.6;
}

/* ── Form fields ── */
.ct-field { margin-bottom: 16px; }
.ct-label {
  display: block; font-family: 'Syne', sans-serif;
  font-size: 11px; font-weight: 700; letter-spacing: .07em;
  text-transform: uppercase; color: ${colors.text2}; margin-bottom: 6px;
}
.ct-label-req { color: ${colors.coral}; }
.ct-input, .ct-select, .ct-textarea {
  width: 100%; padding: 11px 14px; border-radius: 10px;
  border: 1.5px solid ${colors.border};
  background: ${colors.bg}; color: ${colors.ink};
  font-size: 14px; font-family: 'DM Sans', sans-serif;
  outline: none; transition: border-color .2s, box-shadow .2s;
}
.ct-input:focus, .ct-select:focus, .ct-textarea:focus {
  border-color: ${colors.navy};
  box-shadow: 0 0 0 3px rgba(27,43,94,.08);
}
.ct-input::placeholder, .ct-textarea::placeholder { color: ${colors.text3}; }
.ct-textarea { resize: vertical; min-height: 120px; line-height: 1.6; }
.ct-select { appearance: none; cursor: pointer; }

.ct-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

/* ── Subject pills ── */
.ct-subjects { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.ct-subject-pill {
  padding: 6px 14px; border-radius: 99px; font-size: 12px; font-weight: 600;
  border: 1.5px solid ${colors.border}; background: transparent;
  color: ${colors.text2}; cursor: pointer; transition: all .18s;
  font-family: 'DM Sans', sans-serif;
}
.ct-subject-pill:hover { border-color: ${colors.purple}; color: ${colors.purple}; }
.ct-subject-pill.active {
  background: ${colors.purple}; border-color: ${colors.purple}; color: #fff;
}

/* ── Submit ── */
.ct-submit {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 13px 24px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, ${colors.purple} 0%, ${colors.indigo} 100%);
  color: #fff;
  font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all .2s; margin-top: 4px;
  box-shadow: 0 4px 18px rgba(168,85,247,.25);
}
.ct-submit:hover { filter: brightness(1.08); transform: translateY(-1px); box-shadow: 0 8px 28px rgba(168,85,247,.35); }
.ct-submit:active { transform: translateY(0); }
.ct-submit:disabled { opacity: .55; cursor: not-allowed; transform: none; }

.ct-success {
  padding: 14px 16px; border-radius: 10px; margin-bottom: 16px;
  background: ${colors.emeraldBg}; border: 1px solid rgba(13,159,110,.25);
  font-size: 14px; font-weight: 600; color: ${colors.emerald};
}
.ct-error {
  padding: 14px 16px; border-radius: 10px; margin-bottom: 16px;
  background: #fff5f3; border: 1px solid rgba(255,107,71,.25);
  font-size: 14px; font-weight: 600; color: ${colors.coral};
}

.ct-form-footer { font-size: 12px; color: ${colors.text3}; margin-top: 16px; text-align: center; }
.ct-form-footer a { color: ${colors.purple}; font-weight: 600; text-decoration: none; }
.ct-form-footer a:hover { text-decoration: underline; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .ct-main { grid-template-columns: 1fr; }
  .ct-left { padding: 48px 28px 40px; }
  .ct-right { padding: 40px 28px 48px; }
  .ct-left-title { font-size: 28px; }
}
@media (max-width: 540px) {
  .ct-grid-2 { grid-template-columns: 1fr; }
  .ct-left { padding: 36px 20px; }
  .ct-right { padding: 32px 20px; }
}
`;

const SUBJECTS = [
  "General inquiry",
  "Demo request",
  "Sales",
  "Support",
  "Partnership",
];

export default function Contact() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [subject, setSubject] = useState("General inquiry");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [formStatus, setFormStatus] = useState("idle");

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus("submitting");
    await new Promise((r) => setTimeout(r, 900));
    setFormStatus("success");
    setForm({ name: "", email: "", message: "" });
    setSubject("General inquiry");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Live Demo", to: "/demo" },
    { label: "FAQ", href: "/#faq" },
  ];

  return (
    <>
      <style>
        {FONTS}
        {CSS}
      </style>
      <div className='ct-page'>
        {/* Topbar */}
        <div className='ct-topbar'>
          <span className='ct-topbar-badge'>One platform</span>
          <span>
            Projects · CRM · HR · Finance · Invoicing —{" "}
            <strong className='ct-topbar-amber'>start free</strong>.
          </span>
        </div>

        {/* Navbar */}
        <nav className={`ct-nav${scrolled ? " scrolled" : ""}`}>
          <div className='ct-nav-inner'>
            <Link to='/' className='ct-logo'>
              <img src={logo} alt='VorksPro' />
              Vorks<em>Pro</em>
            </Link>
            <div className='ct-nav-links'>
              {navLinks.map((l) =>
                l.to ? (
                  <Link key={l.label} to={l.to} className='ct-nav-link'>
                    {l.label}
                  </Link>
                ) : (
                  <a key={l.label} href={l.href} className='ct-nav-link'>
                    {l.label}
                  </a>
                ),
              )}
              <Link to='/login' className='ct-nav-cta'>
                Sign In
              </Link>
            </div>
            <button
              className='ct-menu-btn'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label='Toggle menu'
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className='ct-mobile-menu'>
            {navLinks.map((l) =>
              l.to ? (
                <Link
                  key={l.label}
                  to={l.to}
                  className='ct-mobile-link'
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.label}
                  href={l.href}
                  className='ct-mobile-link'
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {l.label}
                </a>
              ),
            )}
            <Link
              to='/login'
              className='ct-mobile-cta'
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Main 50/50 */}
        <main className='ct-main'>
          {/* ── LEFT ── */}
          <div className='ct-left rounded-lg'>
            <HexagonBg variant='dark' />
            <div className='ct-left-blob ct-left-blob-1' />
            <div className='ct-left-blob ct-left-blob-2' />
            <div className='ct-left-inner'>
              <p className='ct-eyebrow'>
                <span className='ct-eyebrow-dot' /> Get in touch
              </p>
              <h1 className='ct-left-title'>
                We'd love to
                <br />
                <span>hear from you</span>
              </h1>
              <p className='ct-left-sub'>
                Questions about plans, onboarding, or integrations? Our team
                typically responds within 24 hours.
              </p>

              <div className='ct-cards'>
                <a href='mailto:hello@vorkspro.com' className='ct-card'>
                  <div className='ct-card-icon emerald'>
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className='ct-card-label'>Email us</p>
                    <p className='ct-card-value'>hello@vorkspro.com</p>
                  </div>
                  <ArrowRight size={16} className='ct-card-arrow' />
                </a>
                <Link to='/demo' className='ct-card'>
                  <div className='ct-card-icon navy'>
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <p className='ct-card-label'>Live Demo</p>
                    <p className='ct-card-value'>Try VorksPro free — no signup</p>
                  </div>
                  <ArrowRight size={16} className='ct-card-arrow' />
                </Link>
              </div>

              <div className='ct-trust'>
                <Sparkles
                  size={15}
                  style={{ color: colors.purpleLight, flexShrink: 0 }}
                />
                <p className='ct-trust-text'>
                  <strong>Response time:</strong> We reply to every message within 24
                  hours, Monday–Friday.
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className='ct-right'>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className='ct-form-eyebrow'>Send a message</p>
              <h2 className='ct-form-title'>How can we help?</h2>
              <p className='ct-form-sub'>
                Fill out the form below and we'll get back to you as soon as
                possible.
              </p>

              {/* Subject pills */}
              <div className='ct-subjects'>
                {SUBJECTS.map((s) => (
                  <button
                    key={s}
                    type='button'
                    className={`ct-subject-pill${subject === s ? " active" : ""}`}
                    onClick={() => setSubject(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                <div className='ct-grid-2'>
                  <div className='ct-field'>
                    <label className='ct-label'>
                      Name <span className='ct-label-req'>*</span>
                    </label>
                    <input
                      className='ct-input'
                      name='name'
                      type='text'
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder='Your name'
                    />
                  </div>
                  <div className='ct-field'>
                    <label className='ct-label'>
                      Email <span className='ct-label-req'>*</span>
                    </label>
                    <input
                      className='ct-input'
                      name='email'
                      type='email'
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder='you@company.com'
                    />
                  </div>
                </div>
                <div className='ct-field'>
                  <label className='ct-label'>
                    Message <span className='ct-label-req'>*</span>
                  </label>
                  <textarea
                    className='ct-textarea'
                    name='message'
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us what's on your mind…"
                  />
                </div>

                {formStatus === "success" && (
                  <div className='ct-success'>
                    ✓ Thanks! We'll get back to you within 24 hours.
                  </div>
                )}
                {formStatus === "error" && (
                  <div className='ct-error'>
                    Something went wrong. Please try again or email us directly.
                  </div>
                )}

                <button
                  type='submit'
                  className='ct-submit'
                  disabled={formStatus === "submitting"}
                >
                  {formStatus === "submitting" ? (
                    "Sending…"
                  ) : (
                    <>
                      <Send size={15} /> Send message
                    </>
                  )}
                </button>
              </form>

              <p className='ct-form-footer'>
                Already have an account? <Link to='/login'>Sign in</Link> or{" "}
                <Link to='/onboarding' style={{ color: colors.navy }}>
                  create an account
                </Link>
                .
              </p>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
}
