import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  CreditCard,
  Shield,
  Zap,
  Users,
  FolderKanban,
  BarChart3,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { authApi } from "@/api/auth.js";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
`;

const CSS = `
* { box-sizing: border-box; }
body { margin: 0; }

.ob-root {
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
  background: #080612;
  color: #e2d9f3;
  display: flex;
  justify-content: center;
  align-items: stretch;
  position: relative;
  overflow: hidden;
}
.ob-container {
  width: 80vw;
  max-width: 80vw;
  display: flex;
  flex: 0 0 80vw;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* ── Ambient blobs ── */
.ob-blob {
  position: fixed;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
  z-index: 0;
}
.ob-blob-1 {
  width: 520px; height: 520px;
  background: radial-gradient(circle, rgba(168,85,247,.22) 0%, transparent 70%);
  top: -120px; left: -100px;
  animation: blobDrift1 14s ease-in-out infinite alternate;
}
.ob-blob-2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(99,102,241,.18) 0%, transparent 70%);
  bottom: -80px; right: -60px;
  animation: blobDrift2 18s ease-in-out infinite alternate;
}
.ob-blob-3 {
  width: 260px; height: 260px;
  background: radial-gradient(circle, rgba(236,72,153,.12) 0%, transparent 70%);
  top: 50%; left: 50%;
  animation: blobDrift3 22s ease-in-out infinite alternate;
}
@keyframes blobDrift1 { from { transform: translate(0,0) scale(1); } to { transform: translate(60px,40px) scale(1.1); } }
@keyframes blobDrift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-50px,-30px) scale(1.08); } }
@keyframes blobDrift3 { from { transform: translate(-50%,-50%) scale(1); } to { transform: translate(-42%,-58%) scale(0.9); } }

/* ── Grid noise overlay ── */
.ob-noise {
  position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: .03;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
}

/* ── Left / Right panels ── */
.ob-left {
  position: relative; z-index: 1;
  width: 50%; flex-shrink: 0;
  display: flex; flex-direction: column; justify-content: center;
  padding: 48px 52px;
  border-right: 1px solid rgba(168,85,247,.12);
  background: rgba(255,255,255,.022);
  backdrop-filter: blur(2px);
  overflow-y: auto;
}
.ob-right {
  position: relative; z-index: 1;
  width: 50%; flex-shrink: 0;
  display: flex; flex-direction: column; justify-content: center;
  padding: 48px 52px;
  overflow: hidden;
}

/* ── Sticky navbar ── */
.ob-navbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0 20px;
  margin: 0 0 20px;
  transition: background .3s, backdrop-filter .3s, box-shadow .3s, border-color .3s;
}
.ob-navbar-scrolled {
  background: rgba(8,6,18,.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(168,85,247,.12);
  box-shadow: 0 1px 0 rgba(255,255,255,.02);
  margin: 0 0 20px;
  padding: 16px 0 20px;
  margin-left: -52px;
  margin-right: -52px;
  padding-left: 52px;
  padding-right: 52px;
}
/* ── Back link ── */
.ob-back {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; color: rgba(226,217,243,.45); text-decoration: none;
  transition: color .2s;
  font-family: 'DM Sans', sans-serif;
}
.ob-back:hover { color: #a855f7; }

/* ── Title block ── */
.ob-eyebrow {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: 'Syne', sans-serif;
  font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
  color: #a855f7; margin-bottom: 12px;
}
.ob-eyebrow svg { opacity: .8; }
.ob-title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(24px, 3.5vw, 30px); font-weight: 800;
  line-height: 1.15; color: #fff; margin: 0 0 8px;
  letter-spacing: -.01em;
}
.ob-sub {
  font-size: 14px; color: rgba(226,217,243,.45); margin: 0 0 28px; line-height: 1.6;
}

/* ── Input group ── */
.ob-field { margin-bottom: 14px; }
.ob-label {
  display: block; font-size: 11px; font-weight: 500; letter-spacing: .06em;
  text-transform: uppercase; color: rgba(226,217,243,.4); margin-bottom: 5px;
  font-family: 'Syne', sans-serif;
}
.ob-input {
  width: 100%; padding: 10px 14px; border-radius: 10px;
  background: rgba(255,255,255,.055);
  border: 1px solid rgba(168,85,247,.18);
  color: #fff; font-size: 14px; font-family: 'DM Sans', sans-serif;
  outline: none; transition: border-color .2s, background .2s, box-shadow .2s;
}
.ob-input::placeholder { color: rgba(226,217,243,.25); }
.ob-input:focus {
  border-color: rgba(168,85,247,.65);
  background: rgba(168,85,247,.07);
  box-shadow: 0 0 0 3px rgba(168,85,247,.1);
}
.ob-hint { font-size: 11px; color: rgba(226,217,243,.28); margin-top: 4px; }

/* ── Grid ── */
.ob-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

/* ── Divider ── */
.ob-divider {
  display: flex; align-items: center; gap: 10px; margin: 20px 0 18px;
}
.ob-divider-line { flex: 1; height: 1px; background: rgba(168,85,247,.12); }
.ob-divider-text { font-size: 11px; color: rgba(226,217,243,.28); font-family: 'Syne', sans-serif; letter-spacing: .06em; text-transform: uppercase; }

/* ── Buttons ── */
.ob-btn-row { display: flex; gap: 10px; margin-top: 22px; }
.ob-btn-ghost {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  padding: 11px 18px; border-radius: 10px;
  border: 1px solid rgba(168,85,247,.28); background: transparent;
  color: rgba(226,217,243,.65); font-size: 14px; font-family: 'DM Sans', sans-serif;
  cursor: pointer; transition: all .2s; white-space: nowrap;
}
.ob-btn-ghost:hover { border-color: rgba(168,85,247,.55); color: #e2d9f3; background: rgba(168,85,247,.06); }
.ob-btn-ghost:disabled { opacity: .45; cursor: not-allowed; }
.ob-btn-primary {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 11px 22px; border-radius: 10px; border: none;
  background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
  color: #fff; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif;
  cursor: pointer; transition: all .2s; position: relative; overflow: hidden;
  box-shadow: 0 4px 24px rgba(168,85,247,.3);
}
.ob-btn-primary::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.1) 0%, transparent 60%);
  opacity: 0; transition: opacity .2s;
}
.ob-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(168,85,247,.45); }
.ob-btn-primary:hover::before { opacity: 1; }
.ob-btn-primary:active { transform: translateY(0); }

.ob-login-hint { font-size: 12px; color: rgba(226,217,243,.35); margin-top: 16px; }
.ob-login-hint a { color: #a855f7; text-decoration: none; }
.ob-login-hint a:hover { text-decoration: underline; }

/* ── Right panel decorative number ── */
.ob-right-header { margin-bottom: 44px; }
.ob-right-eyebrow {
  font-family: 'Syne', sans-serif;
  font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
  color: rgba(168,85,247,.5); margin-bottom: 10px;
}
.ob-right-title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(26px, 3.5vw, 36px); font-weight: 800;
  color: #fff; line-height: 1.1; margin: 0 0 6px;
}
.ob-right-sub { font-size: 14px; color: rgba(226,217,243,.4); }

/* ── Steps ── */
.ob-steps { display: flex; flex-direction: column; gap: 0; margin-bottom: 40px; }
.ob-step { display: flex; gap: 20px; position: relative; }
.ob-step:not(:last-child)::before {
  content: ''; position: absolute;
  left: 18px; top: 38px; bottom: -10px; width: 1px;
  background: linear-gradient(to bottom, rgba(168,85,247,.3), transparent);
}
.ob-step + .ob-step { margin-top: 20px; }
.ob-step-num {
  flex-shrink: 0; width: 36px; height: 36px; border-radius: 10px;
  background: rgba(168,85,247,.15); border: 1px solid rgba(168,85,247,.3);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #a855f7;
}
.ob-step-body { padding-top: 6px; }
.ob-step-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 3px; }
.ob-step-text { font-size: 13px; color: rgba(226,217,243,.45); line-height: 1.55; }

/* ── Benefits grid ── */
.ob-benefits { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; }
.ob-benefit {
  padding: 16px; border-radius: 14px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(168,85,247,.1);
  transition: border-color .2s, background .2s;
}
.ob-benefit:hover { border-color: rgba(168,85,247,.3); background: rgba(168,85,247,.06); }
.ob-benefit-icon {
  width: 34px; height: 34px; border-radius: 9px;
  background: rgba(168,85,247,.15); display: flex; align-items: center; justify-content: center;
  color: #a855f7; margin-bottom: 10px;
}
.ob-benefit-title { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 3px; }
.ob-benefit-text { font-size: 12px; color: rgba(226,217,243,.4); line-height: 1.5; }

/* ── Trust badge ── */
.ob-trust {
  display: flex; align-items: flex-start; gap: 14px; padding: 16px 18px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(168,85,247,.08) 0%, rgba(99,102,241,.06) 100%);
  border: 1px solid rgba(168,85,247,.2);
  position: relative; overflow: hidden;
}
.ob-trust::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(168,85,247,.05) 0%, transparent 60%);
  pointer-events: none;
}
.ob-trust-icon { flex-shrink: 0; color: #a855f7; margin-top: 2px; }
.ob-trust-title { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 3px; }
.ob-trust-text { font-size: 12px; color: rgba(226,217,243,.45); line-height: 1.55; }

/* ── Decorative corner grid ── */
.ob-corner-grid {
  position: absolute; top: 0; right: 0;
  width: 320px; height: 320px; opacity: .04; pointer-events: none;
  background-image:
    linear-gradient(rgba(168,85,247,.8) 1px, transparent 1px),
    linear-gradient(90deg, rgba(168,85,247,.8) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse at top right, black 0%, transparent 65%);
}

/* ── Floating pill badge ── */
.ob-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 99px;
  background: rgba(168,85,247,.12); border: 1px solid rgba(168,85,247,.25);
  font-size: 11px; color: rgba(168,85,247,.9); font-family: 'Syne', sans-serif;
  font-weight: 600; letter-spacing: .05em; margin-bottom: 20px;
}
.ob-pill-dot { width: 6px; height: 6px; border-radius: 50%; background: #a855f7; animation: pillPulse 2s ease-in-out infinite; }
@keyframes pillPulse { 0%,100% { opacity: 1; } 50% { opacity: .3; } }

/* ── Responsive ── */
@media (max-width: 900px) {
  .ob-container { flex-direction: column; width: 80vw; max-width: 80vw; }
  .ob-root { flex-direction: column; }
  .ob-left { width: 100%; border-right: none; border-bottom: 1px solid rgba(168,85,247,.12); padding: 36px 24px; }
  .ob-navbar-scrolled { margin-left: -24px; margin-right: -24px; padding-left: 24px; padding-right: 24px; }
  .ob-right { width: 100%; padding: 36px 24px; }
  .ob-benefits { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 540px) {
  .ob-btn-row { flex-direction: column; }
  .ob-btn-ghost { justify-content: center; }
  .ob-benefits { grid-template-columns: 1fr; }
  .ob-grid-2 { grid-template-columns: 1fr; }
}

/* ── Scroll custom ── */
.ob-left::-webkit-scrollbar { width: 4px; }
.ob-left::-webkit-scrollbar-track { background: transparent; }
.ob-left::-webkit-scrollbar-thumb { background: rgba(168,85,247,.3); border-radius: 2px; }

/* ── Focus ring override ── */
button:focus-visible { outline: 2px solid rgba(168,85,247,.6); outline-offset: 2px; }
`;

export default function Onboarding() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const leftRef = useRef(null);

  useEffect(() => {
    const el = leftRef.current;
    if (!el) return;
    const onScroll = () => setNavScrolled(el.scrollTop > 8);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);
  const [form, setForm] = useState({
    orgName: "",
    slug: "",
    adminEmail: "",
    adminPassword: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    website: "",
    industry: "",
  });

  useEffect(() => {
    const slug = form.orgName
      ? form.orgName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      : "";
    setForm((prev) =>
      !prev.slug || prev.slug === prev._lastAutoSlug
        ? { ...prev, slug, _lastAutoSlug: slug }
        : prev,
    );
  }, [form.orgName]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const loadDraft = async (email) => {
    if (!email?.trim()) return;
    try {
      const data = await authApi.getRegistrationDraft(email.trim());
      if (data?.isSuccess && data?.draft) {
        const d = data.draft;
        setForm((prev) => ({
          ...prev,
          orgName: d.orgName || prev.orgName,
          slug: d.slug || prev.slug,
          adminEmail: d.adminEmail || prev.adminEmail,
          firstName: d.firstName || prev.firstName,
          lastName: d.lastName || prev.lastName,
          phone: d.phone ?? prev.phone,
          address: d.address ?? prev.address,
          website: d.website ?? prev.website,
          industry: d.industry ?? prev.industry,
        }));
        toast.success("Draft loaded — continue where you left off.");
      }
    } catch (_) {}
  };

  const handleSaveProgress = async () => {
    if (!form.adminEmail?.trim()) {
      toast.error("Email is required to save progress.");
      return;
    }
    setSaving(true);
    try {
      const data = await authApi.saveRegistrationDraft({
        orgName: form.orgName.trim(),
        slug: form.slug.trim(),
        adminEmail: form.adminEmail.trim(),
        adminPassword: form.adminPassword || undefined,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone?.trim() || undefined,
        address: form.address?.trim() || undefined,
        website: form.website?.trim() || undefined,
        industry: form.industry?.trim() || undefined,
      });
      data?.isSuccess
        ? toast.success("Progress saved. Resume anytime with your email.")
        : toast.error(data?.message || "Failed to save draft.");
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleContinueToCheckout = () => {
    if (
      !form.orgName?.trim() ||
      !form.slug?.trim() ||
      !form.adminEmail?.trim() ||
      !form.adminPassword
    ) {
      toast.error("Please fill Company name, Slug, Email, and Password.");
      return;
    }
    if (form.adminPassword !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (form.adminPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    sessionStorage.setItem(
      "onboardingDraft",
      JSON.stringify({
        orgName: form.orgName.trim(),
        slug: form.slug.trim(),
        adminEmail: form.adminEmail.trim(),
        adminPassword: form.adminPassword,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone?.trim() || "",
        address: form.address?.trim() || "",
        website: form.website?.trim() || "",
        industry: form.industry?.trim() || "",
      }),
    );
    navigate("/onboarding/checkout");
  };

  const steps = [
    {
      num: 1,
      title: "Fill the form",
      text: "Add your company and admin details. Progress auto-saves so you can resume anytime.",
    },
    {
      num: 2,
      title: "Choose a plan",
      text: "Pick what fits your team. Simple checkout, no hidden fees, cancel anytime.",
    },
    {
      num: 3,
      title: "Start in minutes",
      text: "Your workspace is ready. Invite your team and hit the ground running.",
    },
  ];

  const benefits = [
    {
      icon: FolderKanban,
      title: "Projects & CRM",
      text: "Clients, milestones, and pipelines — unified.",
    },
    {
      icon: Users,
      title: "HR & team",
      text: "Payroll, attendance, performance integrated.",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      text: "Time tracking, exports, live dashboards.",
    },
    {
      icon: Shield,
      title: "Isolated & secure",
      text: "Dedicated workspace per org. RBAC included.",
    },
  ];

  return (
    <div className='min-h-screen antialiased overflow-x-hidden box-border'>
      <style>
        {FONTS}
        {CSS}
      </style>
      <div className='ob-root'>
        {/* Ambient */}
        <div className='ob-blob ob-blob-1' />
        <div className='ob-blob ob-blob-2' />
        <div className='ob-blob ob-blob-3' />
        <div className='ob-noise' />

        <div className='ob-container'>
        {/* ── LEFT: Form ── */}
        <div className='ob-left' ref={leftRef}>
          <nav className={`ob-navbar ${navScrolled ? "ob-navbar-scrolled" : ""}`}>
            <Link to='/' className='ob-back'>
              <ArrowLeft size={14} /> Back to home
            </Link>
            <span className='ob-navbar-brand' style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600, color: "rgba(226,217,243,.5)" }}>Vorks Pro</span>
          </nav>

          <p className='ob-sub'>
            Fill in your details, save progress, then pick a plan at checkout.
          </p>

          {/* Company */}
          <div className='ob-field'>
            <label className='ob-label'>Company name *</label>
            <input
              className='ob-input'
              type='text'
              value={form.orgName}
              onChange={set("orgName")}
              placeholder='Acme Inc.'
            />
          </div>
          <div className='ob-field'>
            <label className='ob-label'>Workspace slug *</label>
            <input
              className='ob-input'
              type='text'
              value={form.slug}
              onChange={set("slug")}
              placeholder='acme'
            />
            <p className='ob-hint'>Sign in at yourapp.com/{form.slug || "slug"}</p>
          </div>
          <div className='ob-field'>
            <label className='ob-label'>Admin email *</label>
            <input
              className='ob-input'
              type='email'
              value={form.adminEmail}
              onChange={set("adminEmail")}
              onBlur={(e) => loadDraft(e.target.value)}
              placeholder='admin@company.com'
            />
          </div>

          <div className='ob-divider'>
            <span className='ob-divider-line' />
            <span className='ob-divider-text'>Optional details</span>
            <span className='ob-divider-line' />
          </div>

          <div className='ob-grid-2'>
            <div className='ob-field'>
              <label className='ob-label'>First name</label>
              <input
                className='ob-input'
                type='text'
                value={form.firstName}
                onChange={set("firstName")}
                placeholder='Admin'
              />
            </div>
            <div className='ob-field'>
              <label className='ob-label'>Last name</label>
              <input
                className='ob-input'
                type='text'
                value={form.lastName}
                onChange={set("lastName")}
                placeholder='User'
              />
            </div>
          </div>
          <div className='ob-grid-2'>
            <div className='ob-field'>
              <label className='ob-label'>Phone</label>
              <input
                className='ob-input'
                type='text'
                value={form.phone}
                onChange={set("phone")}
                placeholder='+1 234 567'
              />
            </div>
            <div className='ob-field'>
              <label className='ob-label'>Website</label>
              <input
                className='ob-input'
                type='text'
                value={form.website}
                onChange={set("website")}
                placeholder='company.com'
              />
            </div>
          </div>
          <div className='ob-field'>
            <label className='ob-label'>Address</label>
            <input
              className='ob-input'
              type='text'
              value={form.address}
              onChange={set("address")}
              placeholder='123 Street, City, ZIP'
            />
          </div>
          <div className='ob-field'>
            <label className='ob-label'>Industry</label>
            <input
              className='ob-input'
              type='text'
              value={form.industry}
              onChange={set("industry")}
              placeholder='e.g. Software Development'
            />
          </div>

          <div className='ob-divider'>
            <span className='ob-divider-line' />
            <span className='ob-divider-text'>Security</span>
            <span className='ob-divider-line' />
          </div>

          <div className='ob-field'>
            <label className='ob-label'>Password *</label>
            <input
              className='ob-input'
              type='password'
              value={form.adminPassword}
              onChange={set("adminPassword")}
              placeholder='Min. 6 characters'
            />
          </div>
          <div className='ob-field'>
            <label className='ob-label'>Confirm password *</label>
            <input
              className='ob-input'
              type='password'
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              placeholder='Repeat password'
            />
          </div>

          <div className='ob-btn-row'>
            <button
              className='ob-btn-ghost'
              onClick={handleSaveProgress}
              disabled={saving}
            >
              <Save size={14} />
              {saving ? "Saving…" : "Save progress"}
            </button>
            <button className='ob-btn-primary' onClick={handleContinueToCheckout}>
              Continue to checkout <ArrowRight size={15} />
            </button>
          </div>

          <p className='ob-login-hint'>
            Already have an account? <Link to='/login'>Log in</Link>
          </p>
        </div>

        {/* ── RIGHT: Info ── */}
        <div className='ob-right'>
          <div className='ob-corner-grid' />

          <div className='ob-left-header'>
            <h1 className='ob-title'>
              Set up your
              <br />
              workspace
            </h1>
            <p className='ob-right-eyebrow'>How it works</p>
            <h2 className='ob-right-title'>
              Up and running
              <br />
              in three steps
            </h2>
            <p className='ob-right-sub'>
              No setup calls. No waiting. Just fill, pay, and go.
            </p>
          </div>

          <div className='ob-steps'>
            {steps.map((s) => (
              <div className='ob-step' key={s.num}>
                <span className='ob-step-num'>{s.num}</span>
                <div className='ob-step-body'>
                  <p className='ob-step-title'>{s.title}</p>
                  <p className='ob-step-text'>{s.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className='ob-benefits'>
            {benefits.map((b) => (
              <div className='ob-benefit' key={b.title}>
                <div className='ob-benefit-icon'>
                  <b.icon size={17} />
                </div>
                <p className='ob-benefit-title'>{b.title}</p>
                <p className='ob-benefit-text'>{b.text}</p>
              </div>
            ))}
          </div>

          <div className='ob-trust'>
            <Zap size={20} className='ob-trust-icon' />
            <div>
              <p className='ob-trust-title'>Your data stays yours</p>
              <p className='ob-trust-text'>
                Every org gets a dedicated workspace and isolated database. No
                cross-tenant data sharing — you stay in control.
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
