/**
 * Vorks Pro Admin — Landing Page
 * Dependencies: framer-motion, gsap (npm i framer-motion gsap)
 * Fonts loaded via Google Fonts in index.html:
 *   <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet" />
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  motion,
  useInView,
  useAnimation,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  LayoutDashboard, Users, Briefcase, DollarSign, BarChart3,
  ClipboardList, Key, BookOpen, Bell, Settings, Check, Menu, X,
  UserCheck, MessageSquare, SquareCheckBig, Package, ChevronRight,
  ArrowRight, Shield, Zap, Globe, Star, Quote, CheckCircle2,
  XCircle, Minus, TrendingUp, Award, Clock, ChevronDown,
} from "lucide-react";
import logo from "@/assets/vorkspro-logo.svg";

gsap.registerPlugin(ScrollTrigger);

/* ── CONSTANTS (neon purple & indigo) ───────────────────────────── */
const THEME       = "#6366f1";  /* indigo-500 */
const THEME_LIGHT = "rgba(99,102,241,0.12)";
const THEME_MED   = "rgba(99,102,241,0.25)";
const NEON_PURPLE = "#a855f7";
const NEON_INDIGO = "#6366f1";
const GOLD        = "#c084fc";  /* purple-400 accent */
const GOLD_LIGHT  = "rgba(168,85,247,0.15)";
const CREAM       = "#0f0a1f";  /* dark purple-black base */
const DARK        = "#0c0818";

/* ── ROLE PANELS ───────────────────────────────────────────────── */
const ROLE_PANELS = [
  {
    id: "admin", label: "Admin",
    desc: "Full access to dashboards, employees, projects, finance, and settings.",
    modules: [
      { icon: LayoutDashboard, label: "Dashboard" },
      { icon: Users,           label: "Employee Management", children: ["Employees","Attendance","Performance","Payroll"] },
      { icon: Briefcase,       label: "Project Management",  children: ["Projects","Key & Credentials","Milestones","Blockages"] },
      { icon: Briefcase,       label: "Client Management" },
      { icon: MessageSquare,   label: "Follow-up Hub" },
      { icon: DollarSign,      label: "Finance" },
      { icon: UserCheck,       label: "HR Management" },
      { icon: SquareCheckBig,  label: "My To-Do Hub" },
      { icon: BarChart3,       label: "Reports & Analytics" },
      { icon: Package,         label: "Admin & Assets" },
      { icon: BookOpen,        label: "Knowledge Base" },
      { icon: Bell,            label: "Announcements" },
      { icon: ClipboardList,   label: "Categories" },
      { icon: Settings,        label: "Settings" },
    ],
  },
  {
    id: "hr", label: "HR Manager",
    desc: "Employee lifecycle, attendance, leave, payroll, and HR policies.",
    modules: [
      { icon: LayoutDashboard, label: "Dashboard" },
      { icon: Users,           label: "Employee Management", children: ["Employees","Attendance","Performance","Payroll"] },
      { icon: UserCheck,       label: "HR Management" },
      { icon: SquareCheckBig,  label: "My To-Do Hub" },
      { icon: Bell,            label: "Announcements" },
      { icon: Settings,        label: "Settings" },
    ],
  },
  {
    id: "finance", label: "Finance",
    desc: "Transactions, payroll, reports, and financial analytics.",
    modules: [
      { icon: LayoutDashboard, label: "Dashboard" },
      { icon: DollarSign,      label: "Finance" },
      { icon: BarChart3,       label: "Reports & Analytics" },
      { icon: SquareCheckBig,  label: "My To-Do Hub" },
      { icon: Settings,        label: "Settings" },
    ],
  },
  {
    id: "pm", label: "Project Manager",
    desc: "Projects, milestones, tasks, blockages, and credentials.",
    modules: [
      { icon: LayoutDashboard, label: "Dashboard" },
      { icon: Briefcase,       label: "Project Management", children: ["Projects","Key & Credentials","Milestones","Blockages"] },
      { icon: Briefcase,       label: "Client Management" },
      { icon: MessageSquare,   label: "Follow-up Hub" },
      { icon: SquareCheckBig,  label: "My To-Do Hub" },
      { icon: Settings,        label: "Settings" },
    ],
  },
  {
    id: "employee", label: "Employee",
    desc: "Personal dashboard, to-dos, follow-ups, and knowledge base.",
    modules: [
      { icon: LayoutDashboard, label: "Dashboard" },
      { icon: SquareCheckBig,  label: "My To-Do Hub" },
      { icon: MessageSquare,   label: "Follow-up Hub" },
      { icon: BookOpen,        label: "Knowledge Base" },
      { icon: Bell,            label: "Announcements" },
      { icon: Settings,        label: "Settings" },
    ],
  },
];

/* ── COMPETITOR DATA ───────────────────────────────────────────── */
const COMPETITORS = [
  { id: "vorks",   name: "Vorks Pro",  highlight: true  },
  { id: "clickup", name: "ClickUp",    highlight: false },
  { id: "notion",  name: "Notion",     highlight: false },
  { id: "monday",  name: "Monday.com", highlight: false },
  { id: "asana",   name: "Asana",      highlight: false },
];

const COMP_FEATURES = [
  { label: "Built-in HR Management",      vorks: true,  clickup: false, notion: false, monday: false, asana: false },
  { label: "Native Payroll Processing",   vorks: true,  clickup: false, notion: false, monday: false, asana: false },
  { label: "Role-based Dashboards",       vorks: true,  clickup: "partial", notion: false, monday: "partial", asana: "partial" },
  { label: "Finance & Expense Tracking",  vorks: true,  clickup: false, notion: false, monday: "partial", asana: false },
  { label: "Keys & Credentials Vault",    vorks: true,  clickup: false, notion: false, monday: false, asana: false },
  { label: "Client Management CRM",       vorks: true,  clickup: "partial", notion: false, monday: true, asana: false },
  { label: "Attendance & Leave Mgmt",     vorks: true,  clickup: false, notion: false, monday: false, asana: false },
  { label: "Follow-up Hub",              vorks: true,  clickup: "partial", notion: false, monday: "partial", asana: "partial" },
  { label: "Performance Reviews",        vorks: true,  clickup: false, notion: false, monday: false, asana: "partial" },
  { label: "Project Management",         vorks: true,  clickup: true,  notion: "partial", monday: true, asana: true },
  { label: "Knowledge Base",             vorks: true,  clickup: true,  notion: true,  monday: false, asana: false },
  { label: "Designed for Agencies",      vorks: true,  clickup: false, notion: false, monday: false, asana: false },
];

/* ── TESTIMONIALS ──────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name: "Sarah M.",
    role: "Operations Director",
    company: "NexaTech Solutions",
    body: "We replaced 5 separate tools with Vorks Pro. Our team's efficiency jumped 40% in the first month alone. The role-based dashboards are a game-changer.",
    rating: 5,
  },
  {
    name: "Khalid A.",
    role: "CEO",
    company: "Archway Digital",
    body: "Finally, a platform that understands agencies. Managing HR, projects, and clients in one place—with proper permissions—is something no competitor offers.",
    rating: 5,
  },
  {
    name: "Priya S.",
    role: "HR Manager",
    company: "Momentum Group",
    body: "The payroll and attendance modules saved us hours every week. I can't believe we used spreadsheets before this. The UI is genuinely beautiful.",
    rating: 5,
  },
];

/* ── ANIMATED COUNTER ──────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = "", duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = target / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ── CELL ICON ─────────────────────────────────────────────────── */
function CellIcon({ value }) {
  if (value === true)      return <CheckCircle2 className="h-5 w-5 mx-auto" style={{ color: NEON_PURPLE }} />;
  if (value === false)     return <XCircle      className="h-5 w-5 mx-auto text-slate-500" />;
  if (value === "partial") return <Minus        className="h-5 w-5 mx-auto text-indigo-400 opacity-60" />;
  return null;
}

/* ── MAIN COMPONENT ────────────────────────────────────────────── */
export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen]   = useState(false);
  const [selectedRoleId, setSelectedRoleId]   = useState("admin");
  const [scrolled, setScrolled]               = useState(false);
  const [activeWord, setActiveWord]           = useState(0);

  const heroRef      = useRef(null);
  const statsRef     = useRef(null);
  const counterRef   = useRef(null);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY       = useTransform(scrollY, [0, 400], [0, -80]);

  const rotatingWords = ["HR", "Projects", "Finance", "Clients", "Operations"];

  /* scroll listener */
  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setScrolled(v > 20));
    return unsub;
  }, [scrollY]);

  /* rotating words */
  useEffect(() => {
    const timer = setInterval(() => setActiveWord(w => (w + 1) % rotatingWords.length), 2200);
    return () => clearInterval(timer);
  }, []);

  /* GSAP hero particles */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".hero-particle", {
        y: "random(-30,30)",
        x: "random(-20,20)",
        opacity: "random(0.2,0.7)",
        duration: "random(3,6)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.3,
      });

      /* GSAP scroll reveals */
      gsap.utils.toArray(".gsap-reveal").forEach((el) => {
        gsap.fromTo(el,
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
          }
        );
      });

      /* competitor table rows */
      gsap.utils.toArray(".comp-row").forEach((row, i) => {
        gsap.fromTo(row,
          { x: -30, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: i * 0.04,
            scrollTrigger: { trigger: row, start: "top 92%", toggleActions: "play none none none" },
          }
        );
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const selectedRole = ROLE_PANELS.find(r => r.id === selectedRoleId) ?? ROLE_PANELS[0];

  const navLinks = [
    { label: "Features",       href: "#features" },
    { label: "By Role",        href: "#by-department" },
    { label: "vs. Competitors",href: "#compare" },
    { label: "Pricing",        href: "#pricing" },
  ];

  const featureCards = [
    { icon: Users,          title: "Employee Management",    desc: "Profiles, attendance, performance reviews — onboard to offboard in one flow.",                        span: "col-span-1" },
    { icon: DollarSign,     title: "Finance & Payroll",      desc: "Transactions, salary history, inflows/outflows, and payroll processing built-in — no integrations.",   span: "col-span-1" },
    { icon: Briefcase,      title: "Project & Client Hub",   desc: "Milestones, tasks, blockages, client CRM, and secure credentials — all linked together.",             span: "col-span-2" },
    { icon: Shield,         title: "Keys & Credentials Vault", desc: "Store and share project keys securely with role-based access.",                                      span: "col-span-1" },
    { icon: BarChart3,      title: "Reports & Analytics",    desc: "Custom charts, exportable data, finance reports — real-time insights without Excel.",                  span: "col-span-1" },
    { icon: SquareCheckBig, title: "To-Do & Follow-up Hub", desc: "Personal and team tasks, follow-ups, reminders — your whole workflow in one tab.",                     span: "col-span-1" },
    { icon: UserCheck,      title: "HR Management",          desc: "Leave policies, org charts, job roles, departments, and HR workflows all configured in-platform.",     span: "col-span-1" },
    { icon: Zap,            title: "Role-based Access",      desc: "Admin, HR, Finance, PM, and Employee panels — everyone sees exactly what they need. Nothing more.",   span: "col-span-2" },
  ];

  return (
    <div
      ref={heroRef}
      className="min-h-screen antialiased overflow-x-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: CREAM, color: "#e2e8f0" }}
    >
      {/* ── CUSTOM STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        .syne { font-family: 'Syne', sans-serif; }

        /* Animated mesh gradient */
        @keyframes meshMove {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hero-mesh {
          background: linear-gradient(135deg,
            #0c0818 0%, #1e1b4b 20%, #312e81 40%, #4c1d95 60%, #2e1065 80%, #0c0818 100%
          );
          background-size: 400% 400%;
          animation: meshMove 12s ease infinite;
        }

        /* Grain overlay */
        .grain::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.35;
          z-index: 1;
        }

        /* Marquee */
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track { animation: marquee 24s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }

        /* Gold shimmer */
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .gold-shimmer {
          background: linear-gradient(90deg, #a855f7 0%, #c084fc 40%, #818cf8 60%, #a855f7 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }

        /* Particle glow */
        .hero-particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        /* Scroll fade */
        .gsap-reveal { opacity: 0; }

        /* Table hover */
        .comp-row:hover td { background: rgba(99,102,241,0.08); }
        .comp-row td { transition: background 0.2s; }

        /* Feature card hover */
        .feat-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .feat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(168,85,247,0.2);
        }
      `}</style>

      {/* ── NAVIGATION ── */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(12,8,24,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(168,85,247,0.15)" : "none",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
          <Link to="/" className="flex items-center gap-3 z-10">
            <img src={logo} alt="Vorks Pro" className="h-8 w-auto brightness-0 invert opacity-95" />
            <span className="syne text-lg font-bold text-white tracking-tight">Vorks Pro</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-200">
                {l.label}
              </a>
            ))}
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="syne text-sm font-semibold px-5 py-2.5 rounded-xl text-white"
                style={{ background: `linear-gradient(135deg, ${NEON_PURPLE} 0%, ${NEON_INDIGO} 100%)`, boxShadow: "0 0 24px rgba(168,85,247,0.4)" }}
              >
                Get Started
              </motion.button>
            </Link>
          </nav>

          <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden px-5 pb-5 pt-2"
              style={{ backgroundColor: "rgba(12,8,24,0.97)", backdropFilter: "blur(16px)" }}
            >
              {navLinks.map(l => (
                <a key={l.href} href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-sm font-medium text-white/80 hover:text-white border-b border-white/5">
                  {l.label}
                </a>
              ))}
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <button className="syne mt-4 w-full py-3 rounded-xl text-sm font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, ${NEON_PURPLE}, ${NEON_INDIGO})`, boxShadow: "0 0 20px rgba(168,85,247,0.3)" }}>
                  Get Started
                </button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden hero-mesh grain"
        style={{ paddingTop: 80 }}
      >
        {/* Particles */}
        {[...Array(12)].map((_, i) => (
          <div key={i} className="hero-particle"
            style={{
              width:  `${8 + (i % 4) * 10}px`,
              height: `${8 + (i % 4) * 10}px`,
              top:    `${10 + (i * 7) % 80}%`,
              left:   `${5 + (i * 9) % 90}%`,
              background: i % 3 === 0
                ? `radial-gradient(circle, rgba(168,85,247,0.5), transparent)`
                : `radial-gradient(circle, rgba(99,102,241,0.25), transparent)`,
              filter: "blur(2px)",
              opacity: 0.5,
            }}
          />
        ))}

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)`, filter: "blur(60px)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)`, filter: "blur(50px)" }} />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 mx-auto max-w-5xl px-5 text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 mb-8"
            style={{ borderColor: "rgba(168,85,247,0.4)", backgroundColor: "rgba(168,85,247,0.12)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: NEON_PURPLE }} />
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "#c084fc" }}>
              The complete ops platform for agencies
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="syne text-5xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            One platform.
            <br />
            Master your{" "}
            <span className="relative inline-block" style={{ minWidth: "3ch" }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeWord}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0,  opacity: 1 }}
                  exit={{   y: -24, opacity: 0 }}
                  transition={{ duration: 0.38, ease: "easeInOut" }}
                  className="gold-shimmer inline-block"
                >
                  {rotatingWords[activeWord]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-6 text-lg leading-relaxed text-white/65 max-w-2xl mx-auto"
          >
            Vorks Pro Admin replaces ClickUp, Notion, and 4 HR tools with one intelligent,
            role-based workspace. HR, payroll, projects, clients, finance — unified.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(168,85,247,0.5)" }}
                whileTap={{ scale: 0.97 }}
                className="syne font-semibold px-8 py-4 rounded-xl text-base flex items-center gap-2 text-white"
                style={{ background: `linear-gradient(135deg, ${NEON_PURPLE} 0%, ${NEON_INDIGO} 100%)`, boxShadow: "0 0 30px rgba(168,85,247,0.4)" }}
              >
                Start for free <ArrowRight size={16} />
              </motion.button>
            </Link>
            <a href="#compare">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="syne font-semibold px-8 py-4 rounded-xl text-base text-white border border-white/20 hover:border-white/40 transition-colors"
              >
                See how we compare
              </motion.button>
            </a>
          </motion.div>

          {/* Trust line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/40 text-xs"
          >
            {["No credit card required", "5-minute setup", "Cancel anytime"].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <CheckCircle2 size={12} style={{ color: NEON_PURPLE }} /> {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown size={16} />
        </motion.div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ backgroundColor: DARK, borderTop: "1px solid rgba(168,85,247,0.1)" }}>
        <div className="mx-auto max-w-5xl px-5 py-14 lg:px-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: 2400, suffix: "+", label: "Active Users",       note: "across 40+ countries"     },
              { value: 98,   suffix: "%", label: "Uptime SLA",         note: "enterprise grade"          },
              { value: 5,    suffix: "×", label: "Faster than Multi-tool", note: "avg. time savings"     },
              { value: 40,   suffix: "%", label: "Productivity Boost", note: "reported by customers"     },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="syne text-4xl font-extrabold" style={{ color: GOLD }}>
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-1 text-sm font-semibold text-white">{s.label}</div>
                <div className="mt-0.5 text-xs text-white/35">{s.note}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES BENTO GRID ── */}
      <section id="features" className="py-24 sm:py-32" style={{ backgroundColor: CREAM }}>
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="text-center mb-16 gsap-reveal">
            <span className="syne text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
              style={{ backgroundColor: "rgba(168,85,247,0.2)", color: "#c084fc" }}>
              Everything included
            </span>
            <h2 className="syne mt-5 text-4xl font-extrabold sm:text-5xl text-white">
              Built for how your team<br />actually works
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Every module is connected. Data flows between HR, projects, and finance — so you always have the full picture.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className={`feat-card rounded-2xl p-7 border ${f.span === "col-span-2" ? "sm:col-span-2 lg:col-span-2" : ""}`}
                style={{ backgroundColor: "rgba(30,27,75,0.5)", borderColor: "rgba(168,85,247,0.25)" }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl mb-5"
                  style={{ background: "rgba(168,85,247,0.2)" }}>
                  <f.icon className="h-5 w-5" style={{ color: "#c084fc" }} />
                </div>
                <h3 className="syne text-lg font-bold mb-2 text-white">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 overflow-hidden" style={{ backgroundColor: DARK }}>
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="text-center mb-16 gsap-reveal">
            <span className="syne text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
              style={{ backgroundColor: "rgba(168,85,247,0.2)", color: "#c084fc" }}>
              Real customers. Real results.
            </span>
            <h2 className="syne mt-5 text-4xl font-extrabold text-white sm:text-5xl">
              Teams that made the switch
              <br />
              <span className="gold-shimmer">never looked back</span>
            </h2>
          </div>

          {/* Testimonial cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="rounded-2xl p-7 border relative"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(168,85,247,0.15)" }}
              >
                <Quote className="absolute top-6 right-6 h-6 w-6 opacity-10 text-white" />
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-current" style={{ color: NEON_PURPLE }} />
                  ))}
                </div>
                <p className="text-white/75 text-sm leading-relaxed mb-6">"{t.body}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center syne text-sm font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${NEON_PURPLE}, ${NEON_INDIGO})` }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-white/40">{t.role} · {t.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Logo marquee */}
          <div className="mt-16 overflow-hidden">
            <p className="text-center text-xs tracking-widest uppercase text-white/25 mb-6">Trusted by forward-thinking teams</p>
            <div className="flex">
              <div className="marquee-track flex gap-16 items-center whitespace-nowrap">
                {[...Array(2)].map((_, i) => (
                  <React.Fragment key={i}>
                    {["NexaTech", "Archway Digital", "Momentum Group", "Vertex Labs", "Stratos Agency", "Orbit Works", "Pulse Studio", "Kinetic HQ"].map((name) => (
                      <span key={name} className="syne text-lg font-extrabold text-white/15 tracking-tight">{name}</span>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BY DEPARTMENT ── */}
      <section id="by-department" className="py-24 sm:py-32" style={{ backgroundColor: CREAM }}>
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="text-center mb-14 gsap-reveal">
            <span className="syne text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
              style={{ backgroundColor: "rgba(168,85,247,0.2)", color: "#c084fc" }}>
              Role-based experience
            </span>
            <h2 className="syne mt-5 text-4xl font-extrabold sm:text-5xl text-white">
              Your role. Your view.<br />Your workspace.
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Everyone gets a tailored sidebar. No clutter, no confusion — just the modules your role actually needs.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Role buttons */}
            <div className="lg:w-52 flex-shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
              {ROLE_PANELS.map((role) => (
                <motion.button
                  key={role.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRoleId(role.id)}
                  className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-left text-sm font-semibold whitespace-nowrap transition-all"
                  style={selectedRoleId === role.id
                    ? { backgroundColor: NEON_INDIGO, color: "white", boxShadow: "0 8px 30px rgba(99,102,241,0.4)" }
                    : { backgroundColor: "rgba(30,27,75,0.6)", color: "#c4b5fd", border: "1px solid rgba(168,85,247,0.3)" }}
                >
                  <span>{role.label}</span>
                  {selectedRoleId === role.id && <ChevronRight className="h-3 w-3 opacity-60" />}
                </motion.button>
              ))}
            </div>

            {/* Sidebar preview + desc */}
            <div className="flex-1 flex flex-col lg:flex-row gap-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedRoleId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl border overflow-hidden lg:max-w-[260px] w-full"
                  style={{ borderColor: "rgba(168,85,247,0.3)", backgroundColor: "rgba(30,27,75,0.6)", boxShadow: "0 4px 30px rgba(168,85,247,0.15)" }}
                >
                  <div className="px-4 py-3 border-b flex items-center gap-2" style={{ backgroundColor: NEON_INDIGO, borderColor: "rgba(168,85,247,0.3)" }}>
                    <img src={logo} alt="" className="h-6 w-auto brightness-0 invert opacity-95" />
                    <span className="syne text-sm font-bold text-white">Vorks Pro</span>
                    <span className="ml-auto text-xs text-white/50">({selectedRole.label})</span>
                  </div>
                  <nav className="p-2 space-y-0.5 max-h-[360px] overflow-y-auto">
                    {selectedRole.modules.map((mod, idx) => (
                      <div key={idx}>
                        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-200 hover:bg-white/10 cursor-pointer transition-colors">
                          <mod.icon className="h-4 w-4 flex-shrink-0" style={{ color: "#c084fc" }} />
                          <span className="text-sm font-medium truncate">{mod.label}</span>
                        </div>
                        {mod.children?.map((child, ci) => (
                          <div key={ci} className="flex items-center gap-2 pl-9 pr-3 py-1.5 rounded-lg text-slate-400 hover:bg-white/5 cursor-pointer transition-colors">
                            <span className="text-xs">{child}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </nav>
                </motion.div>
              </AnimatePresence>

              <div className="flex-1 rounded-2xl border p-8" style={{ backgroundColor: "rgba(30,27,75,0.5)", borderColor: "rgba(168,85,247,0.25)" }}>
                <div className="h-9 w-9 rounded-xl mb-4 flex items-center justify-center" style={{ backgroundColor: "rgba(168,85,247,0.2)" }}>
                  <Users className="h-4 w-4" style={{ color: "#c084fc" }} />
                </div>
                <h3 className="syne text-xl font-bold mb-2 text-white">{selectedRole.label}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{selectedRole.desc}</p>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="syne text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-white"
                    style={{ background: `linear-gradient(135deg, ${NEON_PURPLE}, ${NEON_INDIGO})`, boxShadow: "0 0 20px rgba(168,85,247,0.3)" }}
                  >
                    Start as {selectedRole.label} <ArrowRight size={14} />
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPETITOR TABLE ── */}
      <section id="compare" style={{ backgroundColor: DARK }} className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="text-center mb-14 gsap-reveal">
            <span className="syne text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
              style={{ backgroundColor: "rgba(168,85,247,0.2)", color: "#c084fc" }}>
              Honest comparison
            </span>
            <h2 className="syne mt-5 text-4xl font-extrabold text-white sm:text-5xl">
              Why teams leave ClickUp
              <br />
              <span className="gold-shimmer">and Notion for Vorks Pro</span>
            </h2>
            <p className="mt-4 text-white/50 max-w-xl mx-auto">
              Designed specifically for agencies and ops-heavy teams — not retrofitted from a generic task tool.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                  <th className="text-left py-4 px-6 text-white/50 font-medium text-xs tracking-wide w-64">Feature</th>
                  {COMPETITORS.map(c => (
                    <th key={c.id} className="py-4 px-4 text-center">
                      <span
                        className={`syne text-sm font-bold px-3 py-1 rounded-lg inline-block ${c.highlight ? "text-white" : "text-white/50"}`}
                        style={c.highlight ? { background: "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(168,85,247,0.15))", border: "1px solid rgba(168,85,247,0.4)", color: "#c084fc" } : {}}
                      >
                        {c.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMP_FEATURES.map((row, i) => (
                  <tr key={i} className="comp-row border-t"
                    style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <td className="py-3.5 px-6 text-white/70 font-medium">{row.label}</td>
                    <td className="py-3.5 px-4 text-center"><CellIcon value={row.vorks} /></td>
                    <td className="py-3.5 px-4 text-center"><CellIcon value={row.clickup} /></td>
                    <td className="py-3.5 px-4 text-center"><CellIcon value={row.notion} /></td>
                    <td className="py-3.5 px-4 text-center"><CellIcon value={row.monday} /></td>
                    <td className="py-3.5 px-4 text-center"><CellIcon value={row.asana} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-6 mt-5 justify-center text-xs text-white/35">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} style={{ color: NEON_PURPLE }} /> Fully supported</span>
            <span className="flex items-center gap-1.5"><Minus size={12} className="text-amber-400 opacity-60" /> Partial / via plugin</span>
            <span className="flex items-center gap-1.5"><XCircle size={12} className="text-slate-500" /> Not available</span>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 sm:py-32" style={{ backgroundColor: CREAM }}>
        <div className="mx-auto max-w-6xl px-5 lg:px-10">
          <div className="text-center mb-14 gsap-reveal">
            <span className="syne text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
              style={{ backgroundColor: "rgba(168,85,247,0.2)", color: "#c084fc" }}>
              Pricing
            </span>
            <h2 className="syne mt-5 text-4xl font-extrabold sm:text-5xl text-white">
              Simple pricing.<br />No surprises.
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              All plans include every module. Choose based on team size and support needs.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-3">
            {[
              {
                name: "Starter",     price: "Custom",
                desc: "Small teams up to 25 users",
                features: ["Up to 25 users","All core modules","Email support","Standard reports","1 workspace"],
                highlighted: false,
              },
              {
                name: "Professional", price: "Custom",
                desc: "Scaling teams with advanced needs",
                features: ["Unlimited users","Every module","Priority support","Advanced analytics","API access","Multi-workspace"],
                highlighted: true,
              },
              {
                name: "Enterprise",  price: "Custom",
                desc: "Large operations, custom everything",
                features: ["Everything in Pro","Dedicated CSM","Custom integrations","SLA guarantee","On-premise option","SAML SSO"],
                highlighted: false,
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`rounded-2xl p-8 border relative overflow-hidden`}
                style={{
                  backgroundColor: plan.highlighted ? NEON_INDIGO : "rgba(30,27,75,0.5)",
                  borderColor: plan.highlighted ? "transparent" : "rgba(168,85,247,0.3)",
                  boxShadow: plan.highlighted ? "0 20px 70px rgba(99,102,241,0.4)" : "none",
                }}
              >
                {plan.highlighted && (
                  <>
                    <div className="absolute top-0 right-0 left-0 h-1 rounded-t-2xl"
                      style={{ background: `linear-gradient(90deg, ${NEON_PURPLE}, ${NEON_INDIGO})` }} />
                    <span className="absolute top-5 right-5 text-xs font-semibold px-2.5 py-1 rounded-full syne text-white"
                      style={{ backgroundColor: "rgba(168,85,247,0.3)" }}>
                      Recommended
                    </span>
                  </>
                )}
                <h3 className={`syne text-xl font-bold ${plan.highlighted ? "text-white" : "text-white"}`}>
                  {plan.name}
                </h3>
                <p className="text-2xl font-bold mt-1" style={{ color: plan.highlighted ? "#c084fc" : "#a5b4fc" }}>{plan.price}</p>
                <p className={`text-sm mt-2 ${plan.highlighted ? "text-white/55" : "text-slate-400"}`}>{plan.desc}</p>
                <ul className="mt-7 space-y-3">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-center gap-2.5 text-sm ${plan.highlighted ? "text-white/80" : "text-slate-300"}`}>
                      <Check className="h-4 w-4 shrink-0" style={{ color: plan.highlighted ? "#c084fc" : "#818cf8" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login" className="mt-8 block">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="syne w-full py-3 rounded-xl text-sm font-semibold transition-all text-white"
                    style={plan.highlighted
                      ? { background: `linear-gradient(135deg, ${NEON_PURPLE}, ${NEON_INDIGO})`, boxShadow: "0 0 24px rgba(168,85,247,0.4)" }
                      : { backgroundColor: "transparent", border: "1.5px solid rgba(168,85,247,0.5)", color: "#c084fc" }}
                  >
                    Get Started
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative overflow-hidden py-28 grain" style={{ backgroundColor: NEON_INDIGO }}>
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 60% 50%, rgba(168,85,247,0.2) 0%, transparent 60%)" }} />
        <div className="relative z-10 mx-auto max-w-3xl px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Award className="mx-auto mb-5 h-10 w-10 text-purple-300" />
            <h2 className="syne text-4xl font-extrabold text-white sm:text-5xl leading-tight">
              Stop duct-taping tools.<br />
              <span className="gold-shimmer">Run your whole operation here.</span>
            </h2>
            <p className="mt-5 text-lg text-white/60 max-w-lg mx-auto">
              Join hundreds of teams who replaced 5+ apps with Vorks Pro Admin — and never went back.
            </p>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(168,85,247,0.5)" }}
                whileTap={{ scale: 0.97 }}
                className="syne mt-10 font-bold px-10 py-4 rounded-xl text-base flex items-center gap-2 mx-auto text-white"
                style={{ background: `linear-gradient(135deg, ${NEON_PURPLE} 0%, #818cf8 100%)`, boxShadow: "0 0 40px rgba(168,85,247,0.4)" }}
              >
                Start for free — no card needed <ArrowRight size={16} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: DARK, borderTop: "1px solid rgba(168,85,247,0.15)" }}
        className="py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Vorks Pro" className="h-8 w-auto brightness-0 invert opacity-95" />
              <span className="syne font-bold text-white">Vorks Pro Admin</span>
            </div>
            <nav className="flex flex-wrap gap-6 justify-center">
              {navLinks.map(l => (
                <a key={l.href} href={l.href} className="text-sm text-white/35 hover:text-white/70 transition-colors">{l.label}</a>
              ))}
              <Link to="/login" className="text-sm text-white/35 hover:text-white/70 transition-colors">Sign In</Link>
            </nav>
          </div>
          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/25">
            <span>© {new Date().getFullYear()} Vorks Pro. All rights reserved.</span>
            <span>Designed to replace 5 tools. Built for real teams.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}