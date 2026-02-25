import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  DollarSign,
  BarChart3,
  ClipboardList,
  Key,
  BookOpen,
  Bell,
  Settings,
  Check,
  Menu,
  X,
} from "lucide-react";
import logo from "@/assets/vorkspro-logo.svg";

const THEME = "#251A3C";
const THEME_LIGHT = "rgba(37, 26, 60, 0.08)";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Why Vorks Pro", href: "#why" },
  ];

  const features = [
    {
      icon: LayoutDashboard,
      title: "Role-based Dashboards",
      desc: "Admin, HR, Finance, Project Manager, and Employee dashboards with KPIs and analytics.",
    },
    {
      icon: Users,
      title: "Employee Management",
      desc: "Onboard, manage profiles, attendance, performance, and payroll in one place.",
    },
    {
      icon: Briefcase,
      title: "Project & Client Management",
      desc: "Projects, milestones, tasks, blockages, keys & credentials, and client tracking.",
    },
    {
      icon: DollarSign,
      title: "Finance & Payroll",
      desc: "Inflows, outflows, transactions, salary history, and payroll processing.",
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      desc: "Custom reports, charts, and exportable data for better decisions.",
    },
    {
      icon: ClipboardList,
      title: "To-Do & Follow-ups",
      desc: "Personal and team to-dos, reminders, and follow-up hub.",
    },
    {
      icon: Key,
      title: "Keys & Credentials",
      desc: "Secure storage and sharing of project keys and credentials.",
    },
    {
      icon: BookOpen,
      title: "Knowledge Base",
      desc: "Centralized documentation and knowledge articles.",
    },
    {
      icon: Bell,
      title: "Announcements",
      desc: "Company-wide announcements and notifications.",
    },
    {
      icon: Settings,
      title: "Settings & Categories",
      desc: "Roles, departments, configs, and customizable categories.",
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "Custom",
      desc: "For small teams getting started",
      features: ["Up to 25 users", "Core modules", "Email support", "Basic reports"],
    },
    {
      name: "Professional",
      price: "Custom",
      desc: "For growing organizations",
      features: ["Unlimited users", "All modules", "Priority support", "Advanced analytics", "API access"],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "For large-scale operations",
      features: ["Everything in Pro", "Dedicated support", "Custom integrations", "SLA", "On-premise option"],
    },
  ];

  const whyPoints = [
    "Single platform for HR, projects, finance, and operations",
    "Role-based access so everyone sees only what they need",
    "Real-time dashboards and reports for faster decisions",
    "Secure credentials and sensitive data handling",
    "Scalable from small teams to enterprise",
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* Nav */}
      <header
        className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur"
        style={{ borderColor: THEME_LIGHT }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Vorks Pro" className="h-9 w-auto" style={{ color: THEME }} />
            <span className="text-xl font-bold" style={{ color: THEME }}>
              Vorks Pro Admin
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                style={{ color: undefined }}
              >
                {link.label}
              </a>
            ))}
            <Link to="/login">
              <Button
                className="font-medium"
                style={{ backgroundColor: THEME, color: "white" }}
              >
                Get Started
              </Button>
            </Link>
          </nav>

          <button
            type="button"
            className="rounded-lg p-2 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 px-4 py-4 md:hidden" style={{ borderColor: THEME_LIGHT }}>
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-slate-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full font-medium" style={{ backgroundColor: THEME, color: "white" }}>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section
        className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
        style={{ backgroundColor: THEME }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            One platform for HR, projects & finance
          </h1>
          <p className="mt-6 text-lg text-white/90">
            Vorks Pro Admin brings employees, projects, clients, payroll, and reporting into one secure, role-based workspace—so your team spends less time switching tools and more time delivering.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/login">
              <Button
                size="lg"
                className="bg-white font-semibold text-slate-900 hover:bg-white/90"
              >
                Get Started
              </Button>
            </Link>
            <a href="#features">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent font-semibold text-white hover:bg-white/10"
              >
                See features
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-slate-200 bg-slate-50/50 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: THEME }}>
              Everything you need to run operations
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-slate-600">
              From hiring to payroll, projects to reports—all in one place with clear roles and permissions.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                style={{ borderColor: THEME_LIGHT }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: THEME_LIGHT }}
                >
                  <f.icon className="h-6 w-6" style={{ color: THEME }} />
                </div>
                <h3 className="mt-4 text-lg font-semibold" style={{ color: THEME }}>
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Vorks Pro */}
      <section id="why" className="border-t border-slate-200 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: THEME }}>
              Why choose Vorks Pro
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-slate-600">
              Built for teams that want one source of truth—without the complexity of multiple tools.
            </p>
          </div>
          <ul className="mx-auto mt-12 max-w-2xl space-y-4">
            {whyPoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: THEME_LIGHT }}
                >
                  <Check className="h-4 w-4" style={{ color: THEME }} />
                </span>
                <span className="text-slate-700">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-slate-200 bg-slate-50/50 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: THEME }}>
              Simple, transparent pricing
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-slate-600">
              Choose a plan that fits your team size and needs. All plans include core modules and support.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border bg-white p-8 ${
                  plan.highlighted
                    ? "ring-2 ring-[#251A3C] shadow-lg"
                    : "border-slate-200"
                }`}
                style={
                  plan.highlighted
                    ? { borderColor: THEME }
                    : { borderColor: THEME_LIGHT }
                }
              >
                {plan.highlighted && (
                  <p className="text-center text-sm font-semibold" style={{ color: THEME }}>
                    Recommended
                  </p>
                )}
                <h3 className="mt-2 text-xl font-bold" style={{ color: THEME }}>
                  {plan.name}
                </h3>
                <p className="mt-1 text-2xl font-bold text-slate-900">{plan.price}</p>
                <p className="mt-2 text-sm text-slate-600">{plan.desc}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <Check className="h-4 w-4 shrink-0" style={{ color: THEME }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login" className="mt-8 block">
                  <Button
                    className="w-full font-medium"
                    variant={plan.highlighted ? "default" : "outline"}
                    style={
                      plan.highlighted
                        ? { backgroundColor: THEME, color: "white" }
                        : { borderColor: THEME, color: THEME }
                    }
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
        style={{ backgroundColor: THEME }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to streamline your operations?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Sign in or create an account to get started with Vorks Pro Admin.
          </p>
          <Link to="/login" className="mt-8 inline-block">
            <Button
              size="lg"
              className="bg-white font-semibold text-slate-900 hover:bg-white/90"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Vorks Pro" className="h-8 w-auto" style={{ color: THEME }} />
              <span className="font-bold" style={{ color: THEME }}>
                Vorks Pro Admin
              </span>
            </div>
            <nav className="flex gap-8">
              <a href="#features" className="text-sm text-slate-600 hover:text-slate-900">
                Features
              </a>
              <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900">
                Pricing
              </a>
              <a href="#why" className="text-sm text-slate-600 hover:text-slate-900">
                Why Vorks Pro
              </a>
              <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900">
                Get Started
              </Link>
            </nav>
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Vorks Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
