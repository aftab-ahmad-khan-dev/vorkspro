/**
 * VorksPro Landing — Dashboard-aligned theme (navy, purple, indigo).
 * Framer Motion + GSAP for transitions; go-to-top; responsive.
 *
 * STICKY GLOSSY TRANSPARENT NAVBAR: this file, below the top promo bar —
 * <motion.nav className='sticky top-0 z-50 ...'> with backdrop blur and transparent bg.
 * Only rendered on route "/" (home). App shell (/app/*) uses Layout + Topbar instead.
 */

import React, { useState, useEffect, useRef, useId } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Award,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Lock,
  Menu,
  ShieldCheck,
  Star,
  Users2,
  X,
  Zap,
  Mail,
  MessageCircle,
  LayoutDashboard,
  Users,
  Briefcase,
  DollarSign,
  UserCheck,
  SquareCheckBig,
  MessageSquare,
  BarChart3,
  BookOpen,
  Bell,
  Settings,
  ClipboardList,
} from "lucide-react";
import logo from "@/assets/vorkspro-logo.svg";

gsap.registerPlugin(ScrollTrigger);

// ── Muted hexagon grid (borders only, tessellating); variant: light | dark ──
// Pointy-top hex: 50,0 100,25 100,75 50,100 0,75 0,25 (original corners)
function HexagonBg({ variant = "light" }) {
  const id = useId();
  const strokeLight = "#a855f7";
  const strokeDark = "rgba(255,255,255,0.08)";
  const strokeColor = variant === "dark" ? strokeDark : strokeLight;
  const hex = "50,0 100,25 100,75 50,100 0,75 0,25";
  const w = 100;
  const h = 75; // pointy-top row height
  return (
    <svg
      className='absolute inset-0 w-full h-full pointer-events-none'
      style={{ opacity: variant === "dark" ? 0.9 : 0.06 }}
      xmlns='http://www.w3.org/2000/svg'
      preserveAspectRatio='xMidYMid meet'
      aria-hidden
    >
      <defs>
        <pattern
          id={`hex-${id}`}
          x='0'
          y='0'
          width={w}
          height={h * 2}
          patternUnits='userSpaceOnUse'
        >
          <polygon
            points={hex}
            fill='none'
            stroke={strokeColor}
            strokeWidth='0.8'
            transform='translate(0,0)'
          />
          <polygon
            points={hex}
            fill='none'
            stroke={strokeColor}
            strokeWidth='0.8'
            transform={`translate(${w / 2},${h})`}
          />
        </pattern>
      </defs>
      <rect width='100%' height='100%' fill={`url(#hex-${id})`} />
    </svg>
  );
}

// ── Theme (Dashboard-aligned: purple, indigo, dark navy) ──
const colors = {
  navy: "#251A3C",
  navyLight: "#3D2E5C",
  navyDeep: "#0f0a1f",
  purple: "#a855f7",
  purpleLight: "#c084fc",
  indigo: "#6366f1",
  indigoLight: "#818cf8",
  emerald: "#0D9F6E",
  emeraldLight: "#10B981",
  emeraldBg: "#F0FDF9",
  accent: "#a855f7",
  accentDim: "#9333ea",
  tpGreen: "#00B67A",
  gBlue: "#6366f1",
  bg: "#F8FAFF",
  surface: "#FFFFFF",
  surface2: "#F5F3FF",
  border: "#E5E0F5",
  text: "#1E293B",
  text2: "#4B5E7A",
  text3: "#8094B4",
  ink: "#0F172A",
};

// ── Comparative table: VorksPro vs ClickUp, Notion, Monday, Asana ──
const COMPETITORS = [
  { id: "vorks", name: "VorksPro", highlight: true },
  { id: "clickup", name: "ClickUp", highlight: false },
  { id: "notion", name: "Notion", highlight: false },
  { id: "monday", name: "Monday.com", highlight: false },
  { id: "asana", name: "Asana", highlight: false },
];

const COMP_FEATURES = [
  {
    label: "Built-in HR & Payroll",
    vorks: true,
    clickup: false,
    notion: false,
    monday: false,
    asana: false,
  },
  {
    label: "Role-based Dashboards",
    vorks: true,
    clickup: "partial",
    notion: false,
    monday: "partial",
    asana: "partial",
  },
  {
    label: "Finance & Invoicing",
    vorks: true,
    clickup: false,
    notion: false,
    monday: "partial",
    asana: false,
  },
  {
    label: "Keys & Credentials Vault",
    vorks: true,
    clickup: false,
    notion: false,
    monday: false,
    asana: false,
  },
  {
    label: "Client CRM",
    vorks: true,
    clickup: "partial",
    notion: false,
    monday: true,
    asana: false,
  },
  {
    label: "Attendance & Leave",
    vorks: true,
    clickup: false,
    notion: false,
    monday: false,
    asana: false,
  },
  {
    label: "Follow-up Hub",
    vorks: true,
    clickup: "partial",
    notion: false,
    monday: "partial",
    asana: "partial",
  },
  {
    label: "Performance Reviews",
    vorks: true,
    clickup: false,
    notion: false,
    monday: false,
    asana: "partial",
  },
  {
    label: "Project Management",
    vorks: true,
    clickup: true,
    notion: "partial",
    monday: true,
    asana: true,
  },
  {
    label: "Project Canvas",
    vorks: true,
    clickup: false,
    notion: "partial",
    monday: false,
    asana: false,
  },
  {
    label: "Workflow Automation",
    vorks: true,
    clickup: "partial",
    notion: false,
    monday: "partial",
    asana: false,
  },
  {
    label: "Knowledge Base",
    vorks: true,
    clickup: true,
    notion: true,
    monday: false,
    asana: false,
  },
  {
    label: "Designed for Agencies",
    vorks: true,
    clickup: false,
    notion: false,
    monday: false,
    asana: false,
  },
];

// Pain section: brief, FOMO/fear + trust
const PAIN_STAT = "68% of teams waste 5+ hours/week switching between tools.";
const PAIN_HEAD = "Your tools are costing you more than money.";
const PAIN_SUB =
  "Every tab switch drains focus. Every duplicate subscription burns budget. The real cost? Lost deals, missed deadlines, and team burnout. One platform fixes it.";
const PAIN_CARDS = [
  {
    icon: "😩",
    title: "Tab hell",
    body: "Projects here, HR there, finance in spreadsheets.",
  },
  {
    icon: "💸",
    title: "Subscription creep",
    body: "Per-seat fees across 4+ tools add up fast.",
  },
  {
    icon: "🔁",
    title: "Data in silos",
    body: "Same client re-entered in CRM, project tool, and invoices.",
  },
  {
    icon: "📭",
    title: "Scattered follow-ups",
    body: "Email, tasks, and projects never connect.",
  },
];

const FEAT_CARDS = [
  {
    icon: "📋",
    title: "Projects & Milestones",
    body: "Full project lifecycle with milestones, blockages, and progress tracking. Canvas (Slack-like) per project.",
    tag: "Like Monday.com",
  },
  {
    icon: "👥",
    title: "Client Management",
    body: "CRM, contacts, and project linkage. See every client and their projects in one place.",
    tag: "Built-in CRM",
  },
  {
    icon: "✅",
    title: "Tasks & To-Dos",
    body: "Personal and team to-dos, follow-up hub, and reminders. Your whole workflow in one tab.",
    tag: "Like ClickUp",
  },
  {
    icon: "🏢",
    title: "HR & Payroll",
    body: "Employees, departments, attendance, leave, performance reviews, and payroll  no separate HR stack.",
    tag: "Only in VorksPro ✓",
  },
  {
    icon: "💰",
    title: "Finance & Invoicing",
    body: "Transactions, reports, and PDF invoices with client and project pricing. All in one platform.",
    tag: "Like Monday + more",
  },
  {
    icon: "🔑",
    title: "Keys & Credentials",
    body: "Store and share project keys securely with role-based access. No more scattered passwords.",
    tag: "Only in VorksPro ✓",
  },
  {
    icon: "📊",
    title: "Reports & Analytics",
    body: "Custom charts, exportable data, finance reports. Real-time insights without Excel.",
    tag: "Included ✓",
  },
  {
    icon: "⚡",
    title: "Role-based Access",
    body: "Admin, HR, Finance, PM, and Employee views. Everyone sees exactly what they need.",
    tag: "Security first",
  },
  {
    icon: "📚",
    title: "Knowledge Base",
    body: "Documentation, how-tos, and team knowledge in one searchable place. No more lost SOPs.",
    tag: "Included ✓",
  },
  {
    icon: "🔄",
    title: "Follow-up Hub",
    body: "Centralized follow-ups, reminders, and scheduled tasks. Never drop a ball again.",
    tag: "Only in VorksPro ✓",
  },
  {
    icon: "📢",
    title: "Announcements",
    body: "Company-wide or team announcements. Keep everyone in sync without email overload.",
    tag: "Included ✓",
  },
  {
    icon: "📅",
    title: "Attendance & Leave",
    body: "Clock in/out, leave requests, holidays, and timesheets. Built-in HR, no extra tool.",
    tag: "Only in VorksPro ✓",
  },
  {
    icon: "🤖",
    title: "Automation",
    body: "Workflow automation and triggers. Automate repetitive tasks and save hours every week.",
    tag: "Power user",
  },
  {
    icon: "📁",
    title: "Categories & Config",
    body: "Departments, leave types, document types, and more. Configure your org once, use everywhere.",
    tag: "Admin",
  },
  {
    icon: "💬",
    title: "Chat",
    body: "Team and client communication in context. Discuss projects and tasks without leaving the app.",
    tag: "Included ✓",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    role: "Operations Director",
    company: "NexaTech Solutions",
    body: "We replaced 5 separate tools with VorksPro. Our team's efficiency jumped 40% in the first month. The role-based dashboards are a game-changer.",
    source: "tp",
  },
  {
    name: "Khalid A.",
    role: "CEO",
    company: "Archway Digital",
    body: "Finally, a platform that understands agencies. Managing HR, projects, and clients in one placewith proper permissionsis something no competitor offers.",
    source: "goog",
  },
  {
    name: "Priya S.",
    role: "HR Manager",
    company: "Momentum Group",
    body: "The payroll and attendance modules saved us hours every week. I can't believe we used spreadsheets before this. The UI is genuinely beautiful.",
    source: "tp",
  },
  {
    name: "James L.",
    role: "Product Lead",
    company: "Stratos Agency",
    body: "As a solopreneur I always felt these platforms were overkill. VorksPro is perfectly scaled  projects, clients, and my to-dos all connected.",
    source: "goog",
  },
];

// ── Role-based experience (By Role section) ──
const ROLE_PANELS = [
  {
    id: "admin",
    label: "Admin",
    desc: "Full access to dashboards, employees, projects, finance, HR, and settings.",
    modules: [
      { icon: LayoutDashboard, label: "Dashboard" },
      {
        icon: Users,
        label: "Employee Management",
        children: ["Employees", "Attendance", "Performance", "Payroll"],
      },
      {
        icon: Briefcase,
        label: "Project Management",
        children: ["Projects", "Credentials", "Milestones", "Blockages"],
      },
      { icon: Briefcase, label: "Client Management" },
      { icon: MessageSquare, label: "Follow-up Hub" },
      { icon: DollarSign, label: "Finance" },
      { icon: UserCheck, label: "HR Management" },
      { icon: SquareCheckBig, label: "My To-Do Hub" },
      { icon: BarChart3, label: "Reports & Analytics" },
      { icon: BookOpen, label: "Knowledge Base" },
      { icon: Bell, label: "Announcements" },
      { icon: ClipboardList, label: "Categories" },
      { icon: Settings, label: "Settings" },
    ],
  },
  {
    id: "hr",
    label: "HR Manager",
    desc: "Employee lifecycle, attendance, leave, payroll, and HR policies.",
    modules: [
      { icon: LayoutDashboard, label: "Dashboard" },
      {
        icon: Users,
        label: "Employee Management",
        children: ["Employees", "Attendance", "Performance", "Payroll"],
      },
      { icon: UserCheck, label: "HR Management" },
      { icon: SquareCheckBig, label: "My To-Do Hub" },
      { icon: Bell, label: "Announcements" },
      { icon: Settings, label: "Settings" },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    desc: "Transactions, payroll, reports, and financial analytics.",
    modules: [
      { icon: LayoutDashboard, label: "Dashboard" },
      { icon: DollarSign, label: "Finance" },
      { icon: BarChart3, label: "Reports & Analytics" },
      { icon: SquareCheckBig, label: "My To-Do Hub" },
      { icon: Settings, label: "Settings" },
    ],
  },
  {
    id: "pm",
    label: "Project Manager",
    desc: "Projects, milestones, tasks, blockages, and credentials.",
    modules: [
      { icon: LayoutDashboard, label: "Dashboard" },
      {
        icon: Briefcase,
        label: "Project Management",
        children: ["Projects", "Credentials", "Milestones", "Blockages"],
      },
      { icon: Briefcase, label: "Client Management" },
      { icon: MessageSquare, label: "Follow-up Hub" },
      { icon: SquareCheckBig, label: "My To-Do Hub" },
      { icon: Settings, label: "Settings" },
    ],
  },
  {
    id: "employee",
    label: "Employee",
    desc: "Personal dashboard, to-dos, follow-ups, and knowledge base.",
    modules: [
      { icon: LayoutDashboard, label: "Dashboard" },
      { icon: SquareCheckBig, label: "My To-Do Hub" },
      { icon: MessageSquare, label: "Follow-up Hub" },
      { icon: BookOpen, label: "Knowledge Base" },
      { icon: Bell, label: "Announcements" },
      { icon: Settings, label: "Settings" },
    ],
  },
];

// No per-member, one subscription, easy, flexible period
const PRICING_BENEFITS = [
  {
    icon: "👥",
    title: "No per-member charges",
    body: "Invite your whole team. One price covers everyoneno per-seat fees.",
  },
  {
    icon: "📄",
    title: "One subscription",
    body: "Projects, HR, finance, and clients in a single plan. No stacking multiple tools.",
  },
  {
    icon: "✨",
    title: "Easy to use",
    body: "Get started in minutes. Role-based views so everyone sees only what they need.",
  },
  {
    icon: "📅",
    title: "Flexible time period",
    body: "Choose monthly or annual billing. Scale up or down as your team changes.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Is VorksPro really all-in-one?",
    a: "Yes. Projects, clients, HR, payroll, attendance, leave, finance, invoicing, follow-ups, to-dos, knowledge base, and credentials are built in. One login, one data model, role-based views.",
  },
  {
    q: "How does role-based access work?",
    a: "Admins define roles (Admin, HR Manager, Finance, Project Manager, Employee) and assign which modules each role can see and what actions they can perform. Everyone gets a tailored sidebar and dashboard.",
  },
  {
    q: "Can we migrate from ClickUp, Notion, or Monday?",
    a: "You can start fresh with VorksPro and keep using your existing tools in parallel, or move projects and clients over gradually. We focus on making onboarding and data entry simple.",
  },
  {
    q: "Is it good for agencies and small teams?",
    a: "Yes. VorksPro is built for agencies and ops-heavy teams. Client management, project delivery, and internal HR all live in one place with clear permissions.",
  },
  {
    q: "What about support?",
    a: "All plans include email support. Professional and Enterprise tiers get priority support and optional dedicated success management.",
  },
];

function CellIcon({ value }) {
  if (value === true)
    return <span className='text-[#0D9F6E] font-bold text-lg'>✓</span>;
  if (value === false)
    return (
      <span className='text-red-400 text-lg font-bold' title='Not available'>
        ✕
      </span>
    );
  if (value === "partial")
    return <span className='text-purple-500 font-semibold text-sm'>Partial</span>;
  return null;
}

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const mainRef = useRef(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "General inquiry",
    message: "",
  });
  const [contactFormStatus, setContactFormStatus] = useState("idle");

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactFormStatus("submitting");
    await new Promise((r) => setTimeout(r, 800));
    setContactFormStatus("success");
    setContactForm({ name: "", email: "", subject: "General inquiry", message: "" });
  };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowBackToTop(window.scrollY > 400);
    };
    onScroll(); // run once so state is correct on load / when coming back with scroll position
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".gsap-reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          },
        );
      });
    }, mainRef);
    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [selectedRoleId, setSelectedRoleId] = useState("admin");
  const selectedRole =
    ROLE_PANELS.find((r) => r.id === selectedRoleId) ?? ROLE_PANELS[0];

  const ROTATING_WORDS = [
    "Projects",
    "CRM",
    "HR",
    "Finance",
    "Invoicing",
    "To-dos",
    "Follow-ups",
    "Knowledge base",
    "Credentials",
  ];
  const [rotatingIndex, setRotatingIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setRotatingIndex((i) => (i + 1) % ROTATING_WORDS.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "By Role", href: "#by-role" },
    { label: "Compare", href: "#compare" },
    { label: "Pricing", href: "#pricing" },
    { label: "Live Demo", to: "/demo" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact Us", to: "/contact" },
  ];

  return (
    <div
      ref={mainRef}
      className='relative min-h-screen antialiased overflow-x-hidden w-full max-w-[100vw] box-border'
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        backgroundColor: colors.surface,
        color: colors.text,
      }}
    >
      <HexagonBg />
      {/* ── Topbar (same theme as Pain: navyDeep + purple accents) ── */}
      <div
        className='relative flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 py-2.5 sm:py-3 px-3 sm:px-5 text-center text-xs sm:text-sm font-medium overflow-hidden'
        style={{
          backgroundColor: colors.navyDeep,
          color: "#fff",
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        <HexagonBg variant='dark' />
        <span
          className='rounded-full px-2.5 py-0.5 text-xs font-extrabold tracking-wide relative z-10'
          style={{ backgroundColor: colors.purple, color: "#fff" }}
        >
          One platform
        </span>
        <span className='relative z-10'>
          Replace project tools, HR apps, and spreadsheets{" "}
          <strong style={{ color: colors.purpleLight }}>start free</strong>.
        </span>
      </div>

      {/* ── Sticky navbar: glossy transparent + blur; stronger glass when scrolled ── */}
      <motion.nav
        className='sticky top-0 z-50 w-full max-w-[100vw] border-b'
        style={{
          transition:
            "background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
          backgroundColor: scrolled
            ? "rgba(255,255,255,0.82)"
            : "rgba(255,255,255,0.32)",
          borderColor: scrolled ? "rgba(203,213,225,0.85)" : "rgba(226,232,240,0.5)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          boxShadow: scrolled
            ? "0 4px 30px rgba(15,23,42,0.1), inset 0 1px 0 rgba(255,255,255,0.95)"
            : "0 1px 0 rgba(255,255,255,0.5) inset",
          isolation: "isolate",
        }}
        initial={false}
        aria-label='Main navigation'
      >
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between min-h-12 h-12 sm:min-h-14 sm:h-14 md:min-h-16 md:h-16'>
          <Link
            to='/'
            className='flex items-center gap-2 shrink-0'
            style={{ color: colors.navy }}
          >
            <img src={logo} alt='VorksPro' className='h-7 sm:h-8 w-auto' />
            <span
              className='font-black text-lg sm:text-xl tracking-tight'
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Vorks
              <em className='not-italic' style={{ color: colors.purple }}>
                Pro
              </em>
            </span>
          </Link>

          <div className='hidden md:flex items-center gap-5 lg:gap-6'>
            {navLinks.map((l) =>
              l.to ? (
                <Link
                  key={l.label}
                  to={l.to}
                  className='text-sm font-semibold hover:opacity-90 transition-opacity'
                  style={{ color: colors.text2 }}
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  className='text-sm font-semibold hover:opacity-90 transition-opacity'
                  style={{ color: colors.text2 }}
                >
                  {l.label}
                </a>
              ),
            )}
            <div
              className='flex items-center gap-2 text-xs'
              style={{ color: colors.text3 }}
            >
              <Award
                className='h-3.5 w-3.5 shrink-0'
                strokeWidth={2.25}
                style={{ color: colors.indigo }}
              />
              <span className='font-semibold' style={{ color: colors.text2 }}>
                4.9
              </span>
              <span>Trustpilot</span>
            </div>
            <Link
              to='/login'
              className='inline-flex items-center px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:opacity-90'
              style={{
                backgroundColor: colors.navy,
                color: "#fff",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              Sign In
            </Link>
          </div>

          <button
            type='button'
            className='md:hidden p-2 rounded-lg hover:bg-white/50'
            style={{ color: colors.navy }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className='md:hidden absolute top-full left-0 right-0 z-40 border-b px-4 sm:px-6 py-4 flex flex-col gap-1 overflow-hidden'
            style={{
              backgroundColor: "rgba(255,255,255,0.98)",
              borderColor: colors.border,
              backdropFilter: "blur(12px)",
            }}
          >
            {navLinks.map((l) =>
              l.to ? (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className='py-2.5 font-semibold text-sm'
                  style={{ color: colors.text2 }}
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className='py-2.5 font-semibold text-sm'
                  style={{ color: colors.text2 }}
                >
                  {l.label}
                </a>
              ),
            )}
            <Link
              to='/login'
              onClick={() => setMobileMenuOpen(false)}
              className='inline-flex items-center justify-center py-3 rounded-full text-sm font-bold w-full mt-2'
              style={{ backgroundColor: colors.navy, color: "#fff" }}
            >
              Sign In
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trust bar (trimmed) ── */}
      <div
        className='flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-3 px-4 sm:px-6 border-b'
        style={{ backgroundColor: colors.surface2, borderColor: colors.border }}
      >
        <div
          className='flex items-center gap-1.5 text-xs sm:text-sm font-semibold'
          style={{ color: colors.text2 }}
        >
          <Award
            className='h-4 w-4 sm:h-[18px] sm:w-[18px] shrink-0'
            strokeWidth={2.25}
            style={{ color: colors.emerald }}
          />
          <span style={{ color: colors.emerald }}>4.9★</span> Trustpilot
        </div>
        <div
          className='hidden sm:block w-px h-4'
          style={{ backgroundColor: colors.border }}
        />
        <div
          className='flex items-center gap-1.5 text-xs sm:text-sm font-semibold'
          style={{ color: colors.text2 }}
        >
          <ShieldCheck
            className='h-4 w-4 sm:h-[18px] sm:w-[18px] shrink-0'
            strokeWidth={2.25}
            style={{ color: colors.emerald }}
          />
          30-Day <span style={{ color: colors.emerald }}>Money-Back</span>
        </div>
        <div
          className='hidden sm:block w-px h-4'
          style={{ backgroundColor: colors.border }}
        />
        <div
          className='flex items-center gap-1.5 text-xs sm:text-sm font-semibold'
          style={{ color: colors.text2 }}
        >
          <Users2
            className='h-4 w-4 sm:h-[18px] sm:w-[18px] shrink-0'
            strokeWidth={2.25}
            style={{ color: colors.emerald }}
          />
          <span>2,400+</span> Teams
        </div>
      </div>

      {/* ── Hero (with light gradient circles & shapes) ── */}
      <section className='relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-12 sm:pb-16 text-center overflow-hidden'>
        {/* Light gradient circles & blobs  decorative only */}
        <div className='absolute inset-0 pointer-events-none z-0' aria-hidden>
          <div
            className='absolute rounded-full opacity-[0.08]'
            style={{
              width: "min(400px, 80vw)",
              height: "min(400px, 80vw)",
              top: "-10%",
              left: "-5%",
              background: `radial-gradient(circle, ${colors.navy} 0%, transparent 70%)`,
            }}
          />
          <div
            className='absolute rounded-full opacity-[0.07]'
            style={{
              width: "min(350px, 70vw)",
              height: "min(350px, 70vw)",
              top: "20%",
              right: "-8%",
              background: `radial-gradient(circle, ${colors.emerald} 0%, transparent 70%)`,
            }}
          />
          <div
            className='absolute rounded-full opacity-[0.06]'
            style={{
              width: "min(320px, 65vw)",
              height: "min(320px, 65vw)",
              bottom: "-5%",
              left: "15%",
              background: `radial-gradient(circle, ${colors.purple} 0%, transparent 70%)`,
            }}
          />
          <div
            className='absolute opacity-[0.05]'
            style={{
              width: "min(280px, 55vw)",
              height: "min(280px, 55vw)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
              background: `linear-gradient(135deg, ${colors.gBlue} 0%, ${colors.navyLight} 100%)`,
            }}
          />
          <div
            className='absolute rounded-full opacity-[0.06]'
            style={{
              width: "min(200px, 40vw)",
              height: "min(200px, 40vw)",
              top: "5%",
              right: "20%",
              background: `radial-gradient(circle, ${colors.indigo} 0%, transparent 70%)`,
            }}
          />
        </div>
        <div className='relative z-10 flex flex-col items-center'>
          <div
            className='inline-flex items-center gap-2 rounded-full border px-4 py-2 mb-7 text-sm font-bold'
            style={{
              borderColor: "#C7D2FE",
              backgroundColor: "#EEF2FF",
              color: colors.navy,
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            Projects · CRM · HR · Finance · Invoicing · To-dos · Follow-ups ·
            Knowledge base · Credentials
          </div>
          <div className='inline-block text-left mb-5'>
            <h1
              className='text-4xl text-center sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight'
              style={{ color: colors.ink, fontFamily: "'Nunito', sans-serif" }}
            >
              <motion.span
                className='block'
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                One platform.
              </motion.span>
              <motion.span
                className='relative block'
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
              >
                <span className='relative z-10' style={{ color: colors.ink }}>
                  Master your{" "}
                </span>
                <span
                  className='relative z-10 inline-block min-w-[14ch] sm:min-w-[16ch] align-baseline'
                  style={{ color: colors.purple }}
                >
                  <AnimatePresence mode='wait' initial={false}>
                    <motion.span
                      key={rotatingIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className='inline-block'
                    >
                      {ROTATING_WORDS[rotatingIndex]}.
                    </motion.span>
                  </AnimatePresence>
                </span>
              </motion.span>
            </h1>
          </div>
          <p
            className='text-base sm:text-lg max-w-2xl w-full mb-10 font-medium leading-relaxed text-center'
            style={{ color: colors.text2 }}
          >
            VorksPro brings projects, clients, employees, payroll, invoicing,
            attendance, leave, follow-ups, to-dos, knowledge base, and credentials
            into one role-based workspace. Stop switching tabs and paying for a dozen
            separate tools.
          </p>

          {/* Mini proof */}
          <div className='flex flex-wrap items-center justify-center gap-4 mb-10'>
            {[
              { stars: "★★★★★", text: "4.9 on Trustpilot" },
              { stars: "★★★★★", text: "4.8 on Google" },
              { text: "2,400+ happy teams" },
              { text: "30-day guarantee", green: true },
            ].map((item, i) => (
              <div
                key={i}
                className='flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm'
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text2,
                }}
              >
                {item.stars && (
                  <span className='text-purple-500 text-xs tracking-wider'>
                    {item.stars}
                  </span>
                )}
                <span style={item.green ? { color: colors.emerald } : {}}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
            <Link to='/onboarding'>
              <span
                className='inline-flex items-center gap-2.5 px-10 py-4 rounded-full text-lg font-black shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl'
                style={{
                  background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.indigo} 100%)`,
                  color: "#fff",
                  fontFamily: "'Nunito', sans-serif",
                  boxShadow: "0 8px 28px rgba(255,107,71,0.18)",
                }}
              >
                Get Started Free
                <span className='text-xl'>→</span>
              </span>
            </Link>
            <Link to='/demo'>
              <span
                className='inline-flex items-center px-8 py-4 rounded-full text-base font-bold border-2 transition-all hover:bg-white/50'
                style={{
                  borderColor: colors.navy,
                  color: colors.navy,
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                Watch Live Demo
              </span>
            </Link>
          </div>
          <div
            className='mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-medium'
            style={{ color: colors.text3 }}
          >
            <Lock size={12} /> Secure signup
            <span
              className='w-1 h-1 rounded-full'
              style={{ backgroundColor: colors.text3 }}
            />
            <span style={{ color: colors.emerald }}>✓ No credit card required</span>
            <span
              className='w-1 h-1 rounded-full'
              style={{ backgroundColor: colors.text3 }}
            />
            Cancel anytime
          </div>
        </div>
      </section>

      {/* ── Trusted by forward-thinking teams (sliding marquee) ── */}
      <section
        className='relative py-12 sm:py-16 px-4 sm:px-6 overflow-hidden'
        style={{ backgroundColor: colors.navyDeep }}
      >
        <HexagonBg variant='dark' />
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10'>
          <p
            className='text-xs font-semibold tracking-widest uppercase mb-6 sm:mb-8'
            style={{ color: "#94A3B8", fontFamily: "'Nunito', sans-serif" }}
          >
            Trusted by forward-thinking teams
          </p>
          <div className='relative w-full overflow-hidden'>
            <div
              className='flex items-center gap-x-10 sm:gap-x-14 lg:gap-x-20'
              style={{
                animation: "landing-marquee 45s linear infinite",
                width: "max-content",
              }}
            >
              {[
                "Pulse Studio",
                "Kinetic HQ",
                "NexaTech",
                "Archway Digital",
                "Momentum Group",
                "Vertex Labs",
                "Horizon Agency",
                "Stride Creative",
                "Atlas Ventures",
                "Lumina Co",
                "Prism Solutions",
                "Forge & Co",
                "Apex Digital",
                "Cascade Partners",
                "Meridian Studio",
              ]
                .flatMap((list) => [list, list])
                .map((name, i) => (
                  <span
                    key={`${name}-${i}`}
                    className='flex-shrink-0 text-base sm:text-lg font-semibold whitespace-nowrap'
                    style={{ color: "#94A3B8", fontFamily: "'Nunito', sans-serif" }}
                  >
                    {name}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews (equal height, circular initials) ── */}
      <section
        className='py-10 sm:py-14 px-4 sm:px-6 border-t border-b'
        style={{ backgroundColor: colors.surface2, borderColor: colors.border }}
      >
        <div className='max-w-5xl mx-auto'>
          <p
            className='text-center text-xs font-bold tracking-widest uppercase mb-2'
            style={{ color: colors.navy, opacity: 0.6 }}
          >
            Don&apos;t take our word for it
          </p>
          <h2
            className='text-xl sm:text-2xl lg:text-3xl font-black text-center mb-8 sm:mb-10'
            style={{ color: colors.ink, fontFamily: "'Nunito', sans-serif" }}
          >
            Trusted by 2,400+ teams worldwide
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch'>
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                className='rounded-xl border p-5 sm:p-6 shadow-sm flex flex-col h-full min-h-[220px] transition-all hover:shadow-md hover:-translate-y-0.5'
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <div className='flex gap-0.5 mb-3'>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className='h-3.5 w-3.5 sm:h-4 sm:w-4 fill-purple-400 text-purple-400'
                    />
                  ))}
                </div>
                <p
                  className='text-sm italic leading-relaxed mb-4 flex-1 min-h-[3.5rem]'
                  style={{ color: colors.text2 }}
                >
                  &ldquo;{t.body}&rdquo;
                </p>
                <div className='flex items-center gap-3 flex-shrink-0'>
                  <div
                    className='w-9 h-9 min-w-[2.25rem] min-h-[2.25rem] rounded-full flex items-center justify-center text-sm font-black text-white shrink-0'
                    style={{ backgroundColor: colors.navy }}
                  >
                    {t.name[0]}
                  </div>
                  <div className='min-w-0'>
                    <div
                      className='text-sm font-bold truncate'
                      style={{ color: colors.ink }}
                    >
                      {t.name}
                    </div>
                    <div
                      className='text-xs truncate'
                      style={{ color: colors.text3 }}
                    >
                      {t.role} · {t.company}
                    </div>
                  </div>
                  {t.source === "tp" && (
                    <span
                      className='ml-auto text-xs font-bold shrink-0'
                      style={{ color: colors.tpGreen }}
                    >
                      ✓ Trustpilot
                    </span>
                  )}
                  {t.source === "goog" && (
                    <span
                      className='ml-auto text-xs font-bold shrink-0'
                      style={{ color: colors.gBlue }}
                    >
                      G Review
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pain (brief, FOMO/fear + trust) ── */}
      <section
        className='relative py-14 sm:py-16 lg:py-20 px-4 sm:px-6 overflow-hidden'
        style={{ backgroundColor: colors.navyDeep }}
      >
        <HexagonBg variant='dark' />
        <div className='max-w-4xl mx-auto text-center relative z-10'>
          <p
            className='gsap-reveal text-xs font-extrabold tracking-widest uppercase mb-2'
            style={{ color: colors.purpleLight }}
          >
            The real cost of tool sprawl
          </p>
          <h2
            className='gsap-reveal text-2xl sm:text-3xl lg:text-4xl font-black mb-3'
            style={{ fontFamily: "'Nunito', sans-serif", color: "#fff" }}
          >
            {PAIN_HEAD}
          </h2>
          <p
            className='gsap-reveal text-sm sm:text-base mb-4 font-medium'
            style={{ color: "#c4b5fd" }}
          >
            {PAIN_SUB}
          </p>
          <p
            className='gsap-reveal text-sm font-bold mb-10'
            style={{ color: colors.purpleLight }}
          >
            {PAIN_STAT}
          </p>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
            {PAIN_CARDS.map((card, i) => (
              <motion.div
                key={i}
                className='gsap-reveal rounded-xl sm:rounded-2xl border p-4 sm:p-5 text-left transition-all hover:bg-white/10 hover:-translate-y-0.5'
                style={{
                  borderColor: colors.navyLight,
                  backgroundColor: "rgba(255,255,255,0.05)",
                }}
              >
                <div className='text-xl sm:text-2xl mb-2'>{card.icon}</div>
                <h3
                  className='font-extrabold text-sm sm:text-base mb-1'
                  style={{ color: "#fff", fontFamily: "'Nunito', sans-serif" }}
                >
                  {card.title}
                </h3>
                <p
                  className='text-xs sm:text-sm leading-relaxed'
                  style={{ color: "#c4b5fd" }}
                >
                  {card.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features (white + polygon) ── */}
      <section
        id='features'
        className='relative py-14 sm:py-16 lg:py-20 px-4 sm:px-6 overflow-hidden'
        style={{ backgroundColor: colors.surface }}
      >
        <HexagonBg />
        <div className='absolute inset-0 pointer-events-none z-0' aria-hidden>
          <div
            className='absolute rounded-full opacity-[0.06]'
            style={{
              width: 320,
              height: 320,
              top: "-80px",
              right: "-60px",
              background: `radial-gradient(circle, ${colors.purple} 0%, transparent 70%)`,
            }}
          />
          <div
            className='absolute opacity-[0.05]'
            style={{
              width: 260,
              height: 260,
              bottom: "-40px",
              left: "-40px",
              borderRadius: "40% 60% 70% 30% / 50% 60% 40% 50%",
              background: `linear-gradient(145deg, ${colors.indigo} 0%, transparent 60%)`,
            }}
          />
        </div>
        <div className='max-w-5xl mx-auto relative z-10 text-center'>
          <p
            className='text-xs font-extrabold tracking-widest uppercase mb-3'
            style={{ color: colors.navy, opacity: 0.6 }}
          >
            Everything included
          </p>
          <h2
            className='text-3xl sm:text-4xl font-black mb-4'
            style={{ color: colors.ink, fontFamily: "'Nunito', sans-serif" }}
          >
            One tool. Every module. Zero duct tape.
          </h2>
          <p
            className='text-base max-w-xl mx-auto mb-12 font-medium'
            style={{ color: colors.text2 }}
          >
            Built for how agencies and ops teams actually work. Data flows between
            HR, projects, and finance.
          </p>
          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-5'>
            {FEAT_CARDS.map((f, i) => (
              <div
                key={i}
                className='rounded-xl border p-6 transition-all hover:-translate-y-1 hover:shadow-lg'
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                }}
              >
                <div className='text-2xl mb-4'>{f.icon}</div>
                <h3
                  className='font-extrabold text-base mb-2'
                  style={{ color: colors.ink, fontFamily: "'Nunito', sans-serif" }}
                >
                  {f.title}
                </h3>
                <p
                  className='text-sm leading-relaxed mb-3'
                  style={{ color: colors.text2 }}
                >
                  {f.body}
                </p>
                <span
                  className='inline-block text-xs font-extrabold tracking-wide px-2.5 py-1 rounded-full'
                  style={
                    f.tag.includes("Only") || f.tag.includes("✓")
                      ? { backgroundColor: colors.emeraldBg, color: colors.emerald }
                      : { backgroundColor: "#EEF2FF", color: colors.navy }
                  }
                >
                  {f.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── By Role (role-based experience) ── */}
      <section
        id='by-role'
        className='relative py-14 sm:py-16 lg:py-20 px-4 sm:px-6 overflow-hidden'
        style={{ backgroundColor: colors.navyDeep }}
      >
        <HexagonBg variant='dark' />
        <div className='max-w-5xl mx-auto relative z-10'>
          <p
            className='gsap-reveal text-center text-xs font-extrabold tracking-widest uppercase mb-2'
            style={{ color: colors.purpleLight, opacity: 0.9 }}
          >
            Role-based experience
          </p>
          <h2
            className='gsap-reveal text-center text-2xl sm:text-3xl lg:text-4xl font-black mb-3'
            style={{ color: "#fff", fontFamily: "'Nunito', sans-serif" }}
          >
            Your role. Your view. Your workspace.
          </h2>
          <p
            className='gsap-reveal text-center text-sm sm:text-base max-w-2xl mx-auto mb-10 font-medium'
            style={{ color: "#c4b5fd" }}
          >
            Everyone gets a tailored sidebar no clutter, just the modules your role
            needs. You can update role restrictions and alignment anytime to match
            your team&apos;s structure.
          </p>

          <div className='flex flex-col lg:flex-row gap-6 lg:gap-8 items-start'>
            {/* Role tabs */}
            <div className='w-full lg:w-48 flex-shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0'>
              {ROLE_PANELS.map((role) => (
                <motion.button
                  key={role.id}
                  type='button'
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRoleId(role.id)}
                  className='flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-left text-sm font-semibold whitespace-nowrap transition-all'
                  style={
                    selectedRoleId === role.id
                      ? {
                          backgroundColor: colors.navyLight,
                          color: "#fff",
                          boxShadow: "0 8px 24px rgba(27,43,94,0.25)",
                        }
                      : {
                          backgroundColor: "rgba(255,255,255,0.08)",
                          color: "#c4b5fd",
                          border: `1px solid ${colors.navyLight}`,
                        }
                  }
                >
                  <span>{role.label}</span>
                  {selectedRoleId === role.id && (
                    <ChevronRight className='h-3.5 w-3.5 opacity-70' />
                  )}
                </motion.button>
              ))}
            </div>

            <div className='flex-1 w-full flex flex-col lg:flex-row gap-5'>
              {/* Sidebar preview */}
              <AnimatePresence mode='wait'>
                <motion.div
                  key={selectedRoleId}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                  className='rounded-xl border overflow-hidden w-full lg:max-w-[260px] shrink-0'
                  style={{
                    borderColor: colors.navyLight,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                  }}
                >
                  <div
                    className='px-4 py-3 border-b flex items-center gap-2'
                    style={{ backgroundColor: colors.navyLight }}
                  >
                    <img
                      src={logo}
                      alt=''
                      className='h-6 w-auto brightness-0 invert opacity-90'
                    />
                    <span
                      className='font-bold text-sm text-white'
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                    >
                      VorksPro
                    </span>
                    <span className='ml-auto text-xs text-white/60'>
                      ({selectedRole.label})
                    </span>
                  </div>
                  <nav className='p-2 space-y-0.5 max-h-[320px] overflow-y-auto'>
                    {selectedRole.modules.map((mod, idx) => (
                      <div key={idx}>
                        <div
                          className='flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5'
                          style={{ color: "#c4b5fd" }}
                        >
                          <mod.icon
                            className='h-4 w-4 shrink-0'
                            style={{ color: colors.emerald }}
                          />
                          <span className='truncate'>{mod.label}</span>
                        </div>
                        {mod.children?.map((child, ci) => (
                          <div
                            key={ci}
                            className='pl-9 pr-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-white/5'
                            style={{ color: "#94a3b8" }}
                          >
                            {child}
                          </div>
                        ))}
                      </div>
                    ))}
                  </nav>
                </motion.div>
              </AnimatePresence>

              {/* Description + CTA */}
              <div
                className='flex-1 rounded-xl border p-6 sm:p-8'
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderColor: colors.navyLight,
                }}
              >
                <div
                  className='w-10 h-10 rounded-xl mb-4 flex items-center justify-center'
                  style={{ backgroundColor: "rgba(168,85,247,0.2)" }}
                >
                  <Users className='h-5 w-5' style={{ color: colors.purpleLight }} />
                </div>
                <h3
                  className='text-xl font-extrabold mb-2'
                  style={{ color: "#fff", fontFamily: "'Nunito', sans-serif" }}
                >
                  {selectedRole.label}
                </h3>
                <p
                  className='text-sm sm:text-base leading-relaxed mb-6'
                  style={{ color: "#c4b5fd" }}
                >
                  {selectedRole.desc}
                </p>
                <Link to='/login'>
                  <motion.span
                    className='inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white'
                    style={{
                      backgroundColor: colors.purple,
                      fontFamily: "'Nunito', sans-serif",
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start as {selectedRole.label} <ChevronRight size={14} />
                  </motion.span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Compare table ── */}
      <section
        id='compare'
        className='py-14 sm:py-16 lg:py-20 px-4 sm:px-6'
        style={{ backgroundColor: colors.surface2 }}
      >
        <div className='max-w-4xl mx-auto text-center'>
          <p
            className='gsap-reveal text-xs font-extrabold tracking-widest uppercase mb-2'
            style={{ color: colors.navy, opacity: 0.7 }}
          >
            Honest comparison
          </p>
          <h2
            className='gsap-reveal text-2xl sm:text-3xl lg:text-4xl font-black mb-2'
            style={{ color: colors.ink, fontFamily: "'Nunito', sans-serif" }}
          >
            Why teams switch to VorksPro
          </h2>
          <p
            className='gsap-reveal text-sm sm:text-base max-w-xl mx-auto mb-8 font-semibold'
            style={{ color: colors.text2 }}
          >
            VorksPro vs. ClickUp, Notion, Monday.com & Asana. See the difference.
          </p>
          <div
            className='gsap-reveal rounded-2xl overflow-hidden border-2 shadow-xl'
            style={{
              borderColor: colors.navy,
              backgroundColor: colors.surface,
              boxShadow: "0 20px 50px rgba(27,43,94,0.15)",
            }}
          >
            <div className='overflow-x-auto -mx-px'>
              <table className='w-full text-base sm:text-lg border-collapse min-w-[320px]'>
                <thead>
                  <tr style={{ backgroundColor: colors.navy, color: "#fff" }}>
                    <th
                      className='text-left py-4 sm:py-5 px-4 sm:px-5 font-extrabold text-sm sm:text-base'
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                    >
                      Feature
                    </th>
                    {COMPETITORS.map((c) => (
                      <th
                        key={c.id}
                        className='py-4 sm:py-5 px-3 sm:px-4 text-center font-extrabold text-sm sm:text-base'
                        style={{
                          fontFamily: "'Nunito', sans-serif",
                          backgroundColor: c.highlight ? colors.emerald : undefined,
                        }}
                      >
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMP_FEATURES.map((row, i) => (
                    <tr
                      key={i}
                      className='border-t'
                      style={{ borderColor: colors.border }}
                    >
                      <td
                        className='py-3.5 sm:py-4 px-4 sm:px-5 font-bold text-sm sm:text-base'
                        style={{ color: colors.text2 }}
                      >
                        {row.label}
                      </td>
                      <td
                        className='py-3.5 sm:py-4 px-3 sm:px-4 text-center font-bold'
                        style={
                          row.vorks
                            ? {
                                backgroundColor: colors.emeraldBg,
                                color: colors.emerald,
                              }
                            : {}
                        }
                      >
                        <CellIcon value={row.vorks} />
                      </td>
                      <td className='py-3.5 sm:py-4 px-3 sm:px-4 text-center'>
                        <CellIcon value={row.clickup} />
                      </td>
                      <td className='py-3.5 sm:py-4 px-3 sm:px-4 text-center'>
                        <CellIcon value={row.notion} />
                      </td>
                      <td className='py-3.5 sm:py-4 px-3 sm:px-4 text-center'>
                        <CellIcon value={row.monday} />
                      </td>
                      <td className='py-3.5 sm:py-4 px-3 sm:px-4 text-center'>
                        <CellIcon value={row.asana} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div
            className='flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 text-xs font-semibold'
            style={{ color: colors.text3 }}
          >
            <span className='flex items-center gap-1.5'>
              <Check size={12} style={{ color: colors.emerald }} /> Fully supported
            </span>
            <span>Partial</span>
            <span className='flex items-center gap-1.5'>
              <span className='text-red-400 font-bold'>✕</span> Not available
            </span>
          </div>
        </div>
      </section>

      {/* ── No per-member, one subscription ── */}
      <section
        className='relative py-14 sm:py-16 lg:py-20 px-4 sm:px-6 overflow-hidden'
        style={{ backgroundColor: colors.navyDeep }}
      >
        <HexagonBg variant='dark' />
        <div className='max-w-5xl mx-auto relative z-10'>
          <p
            className='gsap-reveal text-center text-xs font-extrabold tracking-widest uppercase mb-2'
            style={{ color: colors.purpleLight, opacity: 0.9 }}
          >
            Simple billing
          </p>
          <h2
            className='gsap-reveal text-center text-2xl sm:text-3xl lg:text-4xl font-black mb-3'
            style={{ color: "#fff", fontFamily: "'Nunito', sans-serif" }}
          >
            One subscription. No per-member fees. Easy to use.
          </h2>
          <p
            className='gsap-reveal text-center text-sm sm:text-base max-w-2xl mx-auto mb-10 font-medium'
            style={{ color: "#c4b5fd" }}
          >
            Pay for the platform once. Invite your team. Choose monthly or annual and
            scale when you need to.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5'>
            {PRICING_BENEFITS.map((item, i) => (
              <motion.div
                key={i}
                className='gsap-reveal rounded-xl border p-5 sm:p-6 text-center transition-all hover:shadow-md hover:-translate-y-0.5 hover:bg-white/10'
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderColor: colors.navyLight,
                }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <div className='text-2xl sm:text-3xl mb-3'>{item.icon}</div>
                <h3
                  className='font-extrabold text-sm sm:text-base mb-2'
                  style={{ color: "#fff", fontFamily: "'Nunito', sans-serif" }}
                >
                  {item.title}
                </h3>
                <p
                  className='text-xs sm:text-sm leading-relaxed'
                  style={{ color: "#c4b5fd" }}
                >
                  {item.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing / Offer ── */}
      <section
        id='pricing'
        className='py-14 sm:py-16 lg:py-20 px-4 sm:px-6'
        style={{ backgroundColor: colors.surface }}
      >
        <div className='max-w-4xl mx-auto text-center'>
          <p
            className='text-xs font-extrabold tracking-widest uppercase mb-3'
            style={{ color: colors.navy, opacity: 0.6 }}
          >
            Pricing
          </p>
          <h2
            className='text-3xl sm:text-4xl font-black mb-4'
            style={{ color: colors.ink, fontFamily: "'Nunito', sans-serif" }}
          >
            Simple pricing. No surprises.
          </h2>
          <p
            className='text-base max-w-xl mx-auto mb-10 font-medium'
            style={{ color: colors.text2 }}
          >
            All plans include every module. Choose based on team size and support
            needs.
          </p>
          <div className='grid md:grid-cols-3 gap-6'>
            {[
              {
                name: "Starter",
                price: "Custom",
                desc: "Small teams up to 25 users",
                features: [
                  "Up to 25 users",
                  "All core modules",
                  "Email support",
                  "Standard reports",
                ],
                highlight: false,
              },
              {
                name: "Professional",
                price: "Custom",
                desc: "Scaling teams with advanced needs",
                features: [
                  "Unlimited users",
                  "Every module",
                  "Priority support",
                  "Advanced analytics",
                  "API access",
                ],
                highlight: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                desc: "Large operations, custom everything",
                features: [
                  "Everything in Pro",
                  "Dedicated CSM",
                  "Custom integrations",
                  "SLA guarantee",
                  "SAML SSO",
                ],
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 text-left relative ${
                  plan.highlight ? "ring-2 shadow-xl" : ""
                }`}
                style={{
                  backgroundColor: plan.highlight
                    ? colors.emeraldBg
                    : colors.surface,
                  borderColor: plan.highlight ? colors.emerald : colors.border,
                  ringColor: plan.highlight ? colors.emerald : "transparent",
                }}
              >
                {plan.highlight && (
                  <span
                    className='absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded-full'
                    style={{ backgroundColor: colors.emerald, color: "#fff" }}
                  >
                    Recommended
                  </span>
                )}
                <h3
                  className='font-extrabold text-xl mb-1'
                  style={{ color: colors.ink, fontFamily: "'Nunito', sans-serif" }}
                >
                  {plan.name}
                </h3>
                <p
                  className='text-2xl font-black mb-1'
                  style={{ color: colors.emerald }}
                >
                  {plan.price}
                </p>
                <p className='text-sm mb-6' style={{ color: colors.text2 }}>
                  {plan.desc}
                </p>
                <ul className='space-y-2 mb-8'>
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className='flex items-center gap-2 text-sm font-medium'
                      style={{ color: colors.text2 }}
                    >
                      <Check size={16} style={{ color: colors.emerald }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to='/onboarding' className='block'>
                  <span
                    className='inline-flex items-center justify-center w-full py-3 rounded-full text-base font-bold transition-all hover:opacity-90'
                    style={{
                      backgroundColor: plan.highlight ? colors.purple : colors.navy,
                      color: "#fff",
                      fontFamily: "'Nunito', sans-serif",
                    }}
                  >
                    Get Started
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        id='faq'
        className='py-14 sm:py-16 lg:py-20 px-4 sm:px-6'
        style={{ backgroundColor: colors.bg }}
      >
        <div className='max-w-2xl mx-auto text-center'>
          <p
            className='text-xs font-extrabold tracking-widest uppercase mb-3'
            style={{ color: colors.navy, opacity: 0.6 }}
          >
            Got questions?
          </p>
          <h2
            className='text-3xl sm:text-4xl font-black mb-10'
            style={{ color: colors.ink, fontFamily: "'Nunito', sans-serif" }}
          >
            We&apos;ve got answers
          </h2>
          <div className='space-y-3'>
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className='rounded-xl border overflow-hidden transition-shadow hover:shadow-md'
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <button
                  type='button'
                  className='w-full flex items-center justify-between gap-4 py-5 px-6 text-left font-extrabold text-sm'
                  style={{ color: colors.ink, fontFamily: "'Nunito', sans-serif" }}
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                >
                  {item.q}
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ease-in-out ${faqOpen === i ? "rotate-180" : ""}`}
                    style={{ color: colors.text3 }}
                  />
                </button>
                <div
                  className='grid transition-[grid-template-rows] duration-300 ease-in-out'
                  style={{ gridTemplateRows: faqOpen === i ? "1fr" : "0fr" }}
                >
                  <div className='min-h-0 overflow-hidden'>
                    <p
                      className='px-6 pb-5 text-sm leading-relaxed'
                      style={{ color: colors.text2 }}
                    >
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA (dark) ── */}
      <section
        className='relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 text-center overflow-hidden'
        style={{
          backgroundColor: colors.navyDeep,
          color: "#fff",
        }}
      >
        <HexagonBg variant='dark' />
        <div className='absolute inset-0 pointer-events-none z-0' aria-hidden>
          <div
            className='absolute rounded-full opacity-20'
            style={{
              width: "min(400px, 80vw)",
              height: "min(400px, 80vw)",
              top: "-100px",
              right: "-80px",
              background: `radial-gradient(circle, ${colors.purple} 0%, transparent 60%)`,
            }}
          />
          <div
            className='absolute rounded-full opacity-10'
            style={{
              width: "min(300px, 60vw)",
              height: "min(300px, 60vw)",
              bottom: "-60px",
              left: "-40px",
              background: `radial-gradient(circle, ${colors.indigo} 0%, transparent 60%)`,
            }}
          />
        </div>
        <div className='relative z-10'>
          <h2
            className='text-2xl sm:text-3xl lg:text-4xl font-black mb-4'
            style={{ fontFamily: "'Nunito', sans-serif", color: "#fff" }}
          >
            Stop duct-taping tools.
            <br />
            Run your whole operation here.
          </h2>
          <p
            className='text-base sm:text-lg mb-6 sm:mb-8 max-w-lg mx-auto font-medium px-2'
            style={{ color: "#c4b5fd" }}
          >
            Join hundreds of teams who replaced 5+ apps with VorksPro and never went
            back.
          </p>
          <div className='flex flex-wrap items-center justify-center gap-4'>
            <Link to='/demo'>
              <span
                className='inline-flex items-center px-8 py-4 rounded-full text-base font-bold border-2 transition-all hover:-translate-y-0.5'
                style={{
                  borderColor: colors.purpleLight,
                  color: colors.purpleLight,
                }}
              >
                Try Live Demo
              </span>
            </Link>
            <Link to='/login'>
              <span
                className='inline-flex items-center px-10 py-4 rounded-full text-base font-black text-white transition-all hover:-translate-y-0.5 hover:shadow-lg'
                style={{
                  background: `linear-gradient(135deg, ${colors.purple}, ${colors.indigo})`,
                  fontFamily: "'Nunito', sans-serif",
                  boxShadow: "0 8px 32px rgba(168,85,247,0.35)",
                }}
              >
                Start for free no card needed →
              </span>
            </Link>
          </div>
          <div
            className='mt-6 flex flex-wrap items-center justify-center gap-3 text-sm'
            style={{ color: "#c4b5fd" }}
          >
            <ShieldCheck size={16} strokeWidth={2.25} /> 30-day guarantee
            <span
              className='w-1 h-1 rounded-full'
              style={{ backgroundColor: colors.text3 }}
            />
            <Zap size={16} strokeWidth={2.25} /> Instant access
            <span
              className='w-1 h-1 rounded-full'
              style={{ backgroundColor: colors.text3 }}
            />
            <Lock size={16} strokeWidth={2.25} /> Secure checkout
            <span
              className='w-1 h-1 rounded-full'
              style={{ backgroundColor: colors.text3 }}
            />
            <Award size={16} strokeWidth={2.25} /> 4.9 Trustpilot
          </div>
        </div>
      </section>

      {/* ── Contact Us ── */}
      <section
        id='contact'
        className='relative py-14 sm:py-16 lg:py-20 px-4 sm:px-6 overflow-hidden'
        style={{ backgroundColor: colors.surface2 }}
      >
        <HexagonBg />
        <div className='max-w-3xl mx-auto text-center relative z-10'>
          <p
            className='text-xs font-extrabold tracking-widest uppercase mb-2'
            style={{ color: colors.navy, opacity: 0.7 }}
          >
            Get in touch
          </p>
          <h2
            className='text-2xl sm:text-3xl lg:text-4xl font-black mb-3'
            style={{ color: colors.ink, fontFamily: "'Nunito', sans-serif" }}
          >
            Contact Us
          </h2>
          <p
            className='text-sm sm:text-base font-medium mb-8'
            style={{ color: colors.text2 }}
          >
            Have questions about plans, demos, or integrations? We&apos;re here to
            help.
          </p>

          {/* Contact form */}
          <form
            onSubmit={handleContactSubmit}
            className='max-w-xl mx-auto mb-12 text-left gsap-reveal'
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: "1rem",
              padding: "1.5rem clamp(1rem, 4vw, 2rem)",
              boxShadow: "0 4px 20px rgba(27,43,94,0.06)",
            }}
          >
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
              <div>
                <label
                  htmlFor='landing-contact-name'
                  className='block text-sm font-semibold mb-1.5'
                  style={{ color: colors.ink }}
                >
                  Name <span style={{ color: colors.purple }}>*</span>
                </label>
                <input
                  id='landing-contact-name'
                  name='name'
                  type='text'
                  required
                  value={contactForm.name}
                  onChange={handleContactChange}
                  placeholder='Your name'
                  className='w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2'
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.bg,
                    color: colors.ink,
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor='landing-contact-email'
                  className='block text-sm font-semibold mb-1.5'
                  style={{ color: colors.ink }}
                >
                  Email <span style={{ color: colors.purple }}>*</span>
                </label>
                <input
                  id='landing-contact-email'
                  name='email'
                  type='email'
                  required
                  value={contactForm.email}
                  onChange={handleContactChange}
                  placeholder='you@company.com'
                  className='w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2'
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.bg,
                    color: colors.ink,
                  }}
                />
              </div>
            </div>
            <div className='mb-4'>
              <label
                htmlFor='landing-contact-subject'
                className='block text-sm font-semibold mb-1.5'
                style={{ color: colors.ink }}
              >
                Subject
              </label>
              <select
                id='landing-contact-subject'
                name='subject'
                value={contactForm.subject}
                onChange={handleContactChange}
                className='w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 bg-transparent'
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.bg,
                  color: colors.ink,
                }}
              >
                <option value='General inquiry'>General inquiry</option>
                <option value='Demo request'>Demo request</option>
                <option value='Sales'>Sales</option>
                <option value='Support'>Support</option>
                <option value='Partnership'>Partnership</option>
              </select>
            </div>
            <div className='mb-5'>
              <label
                htmlFor='landing-contact-message'
                className='block text-sm font-semibold mb-1.5'
                style={{ color: colors.ink }}
              >
                Message <span style={{ color: colors.purple }}>*</span>
              </label>
              <textarea
                id='landing-contact-message'
                name='message'
                required
                rows={5}
                value={contactForm.message}
                onChange={handleContactChange}
                placeholder='How can we help you?'
                className='w-full px-4 py-3 rounded-xl border text-sm resize-y min-h-[120px] transition-colors focus:outline-none focus:ring-2'
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.bg,
                  color: colors.ink,
                }}
              />
            </div>
            {contactFormStatus === "success" && (
              <p
                className='mb-4 text-sm font-semibold'
                style={{ color: colors.emerald }}
              >
                Thanks! We&apos;ll get back to you within 24 hours.
              </p>
            )}
            {contactFormStatus === "error" && (
              <p
                className='mb-4 text-sm font-semibold'
                style={{ color: colors.purple }}
              >
                Something went wrong. Please try again or email us directly.
              </p>
            )}
            <button
              type='submit'
              disabled={contactFormStatus === "submitting"}
              className='w-full sm:w-auto min-w-[160px] px-6 py-3.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed'
              style={{
                backgroundColor: colors.navy,
                color: "#fff",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              {contactFormStatus === "submitting" ? "Sending…" : "Send message"}
            </button>
          </form>

          <p
            className='text-xs font-semibold tracking-wide uppercase mb-6'
            style={{ color: colors.text3 }}
          >
            Or contact us directly
          </p>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 max-w-2xl mx-auto items-stretch'>
            <a
              href='mailto:hello@vorkspro.com'
              target='_blank'
              rel='noopener noreferrer'
              title='Open in Gmail or your default email app'
              className='flex flex-col sm:flex-row items-center justify-center gap-4 rounded-2xl border-2 p-6 sm:p-8 transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-emerald-300 min-h-[140px] sm:min-h-[160px]'
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              <div
                className='w-14 h-14 rounded-full flex items-center justify-center shrink-0'
                style={{ backgroundColor: colors.emeraldBg }}
              >
                <Mail className='w-7 h-7' style={{ color: colors.emerald }} />
              </div>
              <div className='text-center'>
                <div
                  className='font-extrabold text-base mb-1'
                  style={{ color: colors.ink }}
                >
                  Email us
                </div>
                <div
                  className='text-sm font-medium'
                  style={{ color: colors.emerald }}
                >
                  hello@vorkspro.com
                </div>
                <div className='text-xs mt-1' style={{ color: colors.text3 }}>
                  We reply within 24 hours
                </div>
              </div>
            </a>
            <Link
              to='/demo'
              className='flex flex-col sm:flex-row items-center justify-center gap-4 rounded-2xl border-2 p-6 sm:p-8 transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-navy-200 min-h-[140px] sm:min-h-[160px]'
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              <div
                className='w-14 h-14 rounded-full flex items-center justify-center shrink-0'
                style={{ backgroundColor: "#EEF2FF" }}
              >
                <MessageCircle className='w-7 h-7' style={{ color: colors.navy }} />
              </div>
              <div className='text-center'>
                <div
                  className='font-extrabold text-base mb-1'
                  style={{ color: colors.ink }}
                >
                  Live Demo
                </div>
                <div className='text-sm font-medium' style={{ color: colors.navy }}>
                  Try VorksPro free
                </div>
                <div className='text-xs mt-1' style={{ color: colors.text3 }}>
                  No signup required
                </div>
              </div>
            </Link>
          </div>
          <p className='text-xs font-medium' style={{ color: colors.text3 }}>
            Prefer to start on your own?{" "}
            <Link
              to='/login'
              className='font-semibold hover:underline'
              style={{ color: colors.emerald }}
            >
              Sign in
            </Link>{" "}
            or{" "}
            <Link
              to='/login'
              className='font-semibold hover:underline'
              style={{ color: colors.navy }}
            >
              create an account
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── Footer (dark) ── */}
      <footer
        className='relative border-t w-full overflow-hidden'
        style={{
          backgroundColor: colors.navyDeep,
          borderColor: colors.navyLight,
        }}
      >
        <HexagonBg variant='dark' />
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 w-full relative z-10'>
          <div className='flex flex-col gap-8'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 flex-wrap'>
              <div className='flex flex-col'>
                <Link to='/' className='inline-flex items-center gap-2.5 mb-2'>
                  <img
                    src={logo}
                    alt='VorksPro'
                    className='h-8 w-auto brightness-0 invert opacity-90'
                  />
                  <span
                    className='font-black text-xl text-white'
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    VorksPro
                  </span>
                </Link>
                <p
                  className='text-sm leading-relaxed max-w-xs'
                  style={{ color: "#c4b5fd" }}
                >
                  One platform for projects, HR, and finance. Built for agencies and
                  ops teams.
                </p>
              </div>
              <nav
                className='flex flex-wrap items-center gap-x-6 gap-y-2'
                aria-label='Footer links'
              >
                <a
                  href='#features'
                  className='text-sm transition-colors hover:opacity-80 text-white/85'
                >
                  Features
                </a>
                <a
                  href='#by-role'
                  className='text-sm transition-colors hover:opacity-80 text-white/85'
                >
                  By Role
                </a>
                <a
                  href='#compare'
                  className='text-sm transition-colors hover:opacity-80 text-white/85'
                >
                  Compare
                </a>
                <a
                  href='#pricing'
                  className='text-sm transition-colors hover:opacity-80 text-white/85'
                >
                  Pricing
                </a>
                <Link
                  to='/demo'
                  className='text-sm transition-colors hover:opacity-80 text-white/85'
                >
                  Live Demo
                </Link>
                <a
                  href='#faq'
                  className='text-sm transition-colors hover:opacity-80 text-white/85'
                >
                  FAQ
                </a>
                <Link
                  to='/contact'
                  className='inline-flex items-center gap-1.5 text-sm transition-colors hover:opacity-80 text-white/85'
                >
                  <Mail className='w-3.5 h-3.5' style={{ color: colors.emerald }} />
                  Contact Us
                </Link>
                <Link
                  to='/login'
                  className='text-sm transition-colors hover:opacity-80 text-white/85'
                >
                  Sign In
                </Link>
              </nav>
              <Link
                to='/login'
                className='inline-flex items-center justify-center gap-2 rounded-xl py-3 px-5 text-sm font-bold text-white transition-all hover:opacity-90 shrink-0'
                style={{ backgroundColor: colors.purple, color: "#fff" }}
              >
                Start for free
                <ChevronRight className='w-4 h-4' />
              </Link>
            </div>
          </div>
          <div
            className='mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm border-t'
            style={{ color: "#94a3b8", borderColor: colors.navyLight }}
          >
            <span>© {new Date().getFullYear()} VorksPro. All rights reserved.</span>
            <span className='text-center sm:text-right'>
              Built for agencies and ops teams.
            </span>
          </div>
        </div>
      </footer>

      {/* ── Go to top ── */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            type='button'
            aria-label='Scroll to top'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className='fixed bottom-6 right-4 sm:bottom-8 sm:right-6 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg border-0 cursor-pointer'
            style={{
              backgroundColor: colors.navy,
              color: "#fff",
              boxShadow: "0 8px 24px rgba(27,43,94,0.35)",
            }}
          >
            <ChevronUp className='w-5 h-5 sm:w-6 sm:h-6' />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
