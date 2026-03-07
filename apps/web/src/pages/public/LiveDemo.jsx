/**
 * Live Demo  Role-based experience: choose a role and try the admin demo.
 */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  DollarSign,
  BarChart3,
  ClipboardList,
  BookOpen,
  Bell,
  Settings,
  UserCheck,
  MessageSquare,
  SquareCheckBig,
  Package,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import logo from "@/assets/vorkspro-logo.svg";

const THEME = "#251A3C";
const THEME_MED = "rgba(37,26,60,0.5)";
const ACCENT = "#a89ac9";
const ACCENT_LIGHT = "rgba(168,154,201,0.2)";
const CREAM = "#0f0a1a";
const DARK = "#0c0815";

const ROLE_PANELS = [
  {
    id: "admin",
    label: "Admin",
    desc: "Full access to dashboards, employees, projects, finance, and settings.",
    icon: Users,
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
        children: ["Projects", "Key & Credentials", "Milestones", "Blockages"],
      },
      { icon: Briefcase, label: "Client Management" },
      { icon: MessageSquare, label: "Follow-up Hub" },
      { icon: DollarSign, label: "Finance" },
      { icon: UserCheck, label: "HR Management" },
      { icon: SquareCheckBig, label: "My To-Do Hub" },
      { icon: BarChart3, label: "Reports & Analytics" },
      { icon: Package, label: "Admin & Assets" },
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
    icon: UserCheck,
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
    icon: DollarSign,
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
    icon: Briefcase,
    modules: [
      { icon: LayoutDashboard, label: "Dashboard" },
      {
        icon: Briefcase,
        label: "Project Management",
        children: ["Projects", "Key & Credentials", "Milestones", "Blockages"],
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
    icon: Users,
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

export default function LiveDemo() {
  const [selectedRole, setSelectedRole] = useState("admin");
  const navigate = useNavigate();
  const role = ROLE_PANELS.find((r) => r.id === selectedRole) || ROLE_PANELS[0];
  const RoleIcon = role.icon;

  const handleStartAsAdmin = () => {
    navigate("/demo/admin");
  };

  return (
    <div className='min-h-screen' style={{ backgroundColor: CREAM }}>
      {/* Header */}
      <header
        className='sticky top-0 z-50 border-b flex items-center justify-between px-5 py-4'
        style={{
          borderColor: "rgba(168,154,201,0.2)",
          backgroundColor: "rgba(12,8,21,0.9)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Link
          to='/'
          className='flex items-center gap-2 text-white/90 hover:text-white'
        >
          <img
            src={logo}
            alt='Vorks Pro'
            className='h-7 w-auto brightness-0 invert opacity-90'
          />
          <span className='syne font-semibold'>Vorks Pro</span>
        </Link>
        <Link
          to='/'
          className='flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors'
        >
          <ArrowLeft size={16} /> Back to home
        </Link>
      </header>

      <div className='max-w-6xl mx-auto px-5 py-12'>
        {/* Badge + Headline */}
        <div className='text-center mb-12'>
          <span
            className='inline-block text-xs font-medium tracking-widest uppercase px-3 py-1 rounded-full mb-6'
            style={{ backgroundColor: ACCENT_LIGHT, color: ACCENT }}
          >
            Role-based experience
          </span>
          <h1 className='syne text-4xl sm:text-5xl font-extrabold text-white leading-tight'>
            Your role. Your view.
          </h1>
          <p className='syne text-2xl sm:text-3xl font-semibold text-white/80 mt-2'>
            Your workspace.
          </p>
          <p className='mt-4 text-white/55 max-w-xl mx-auto'>
            Everyone gets a tailored sidebar. No clutter, no confusion just the
            modules your role actually needs.
          </p>
        </div>

        {/* Three panels */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          {/* Left: Role selector */}
          <div className='lg:col-span-3 space-y-2'>
            {ROLE_PANELS.map((r) => (
              <motion.button
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium transition-colors ${
                  selectedRole === r.id
                    ? "text-white"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
                style={
                  selectedRole === r.id
                    ? {
                        backgroundColor: ACCENT_LIGHT,
                        border: "1px solid rgba(168,154,201,0.4)",
                      }
                    : { border: "1px solid transparent" }
                }
              >
                {r.label}
                {selectedRole === r.id && (
                  <ChevronRight size={18} className='text-white' />
                )}
              </motion.button>
            ))}
          </div>

          {/* Middle: Sidebar preview */}
          <div
            className='lg:col-span-5 rounded-2xl p-6 border'
            style={{
              backgroundColor: "rgba(37,26,60,0.4)",
              borderColor: "rgba(168,154,201,0.2)",
            }}
          >
            <div className='flex items-center gap-2 mb-6'>
              <div
                className='h-8 w-8 rounded-lg flex items-center justify-center text-white'
                style={{ backgroundColor: THEME }}
              >
                <LayoutDashboard size={18} />
              </div>
              <span className='font-semibold text-white'>Vorks Pro</span>
              <span className='text-white/50 text-sm'>({role.label})</span>
            </div>
            <ul className='space-y-1'>
              {role.modules.slice(0, 8).map((m, i) => {
                const Icon = m.icon;
                return (
                  <li
                    key={i}
                    className='flex items-center gap-3 py-2 text-white/80 text-sm'
                  >
                    <Icon size={18} className='shrink-0 opacity-70' />
                    <span>{m.label}</span>
                    {m.children && (
                      <span className='text-white/40 text-xs'>
                        {m.children.slice(0, 2).join(", ")}…
                      </span>
                    )}
                  </li>
                );
              })}
              {role.modules.length > 8 && (
                <li className='text-white/40 text-sm py-2'>
                  +{role.modules.length - 8} more
                </li>
              )}
            </ul>
          </div>

          {/* Right: Role card + CTA */}
          <div className='lg:col-span-4'>
            <motion.div
              layoutId='role-card'
              className='rounded-2xl p-6 border flex flex-col items-center text-center'
              style={{
                backgroundColor: "rgba(37,26,60,0.5)",
                borderColor: "rgba(168,154,201,0.25)",
              }}
            >
              <div
                className='h-14 w-14 rounded-xl flex items-center justify-center text-white mb-4'
                style={{ backgroundColor: THEME }}
              >
                <RoleIcon size={28} />
              </div>
              <h3 className='syne text-xl font-bold text-white'>{role.label}</h3>
              <p className='mt-3 text-sm text-white/65 leading-relaxed'>
                {role.desc}
              </p>
              {selectedRole === "admin" ? (
                <motion.button
                  onClick={handleStartAsAdmin}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className='syne mt-6 w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2'
                  style={{
                    background: `linear-gradient(135deg, ${THEME} 0%, ${THEME_MED} 100%)`,
                    boxShadow: "0 0 24px rgba(37,26,60,0.5)",
                  }}
                >
                  Start as Admin <ChevronRight size={18} />
                </motion.button>
              ) : (
                <p className='mt-6 text-sm text-white/45'>
                  Try the admin demo to explore the full workspace with sample data.
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
