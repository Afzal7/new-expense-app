"use client";

import { Car, Coffee, CupSoda, Plane } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// --- Custom Icons ---
const IconArrowRight = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);
const IconCheck = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17 4 12" />
  </svg>
);
const IconBriefcase = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const IconLock = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconDownload = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);
const IconFileText = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <line x1="10" x2="8" y1="9" y2="9" />
  </svg>
);
const IconZap = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconMenu = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" x2="21" y1="12" y2="12" />
    <line x1="3" x2="21" y1="6" y2="6" />
    <line x1="3" x2="21" y1="18" y2="18" />
  </svg>
);
const IconX = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconChevronDown = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("work");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState("annual");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const faqData = [
    {
      question:
        "What is the Personal Vault and how does it protect my privacy?",
      answer:
        "The Personal Vault is your private space for tracking any expense—business or personal. Expenses marked as 'Personal' are completely invisible to your employer, managers, and finance team. Only when you explicitly attach a manager and submit for approval does an expense become visible to your organization. This lets you maintain one unified expense history without compromising your privacy.",
    },
    {
      question: "Can I start using the app before my company is fully set up?",
      answer:
        "Absolutely. This is one of our core innovations. You can snap receipts and save them as drafts immediately—no organization setup required. When you eventually join your company's organization, we'll automatically detect your existing drafts and offer to link them for reimbursement. You'll never lose productivity waiting for admin setup.",
    },
    {
      question:
        "What's the difference between pre-approval and regular submission?",
      answer:
        "Pre-approval (Flow B) lets you request budget confirmation before spending. Submit an expense estimate, get manager approval, then attach the actual receipt later. Regular submission (Flow A) is for expenses you've already incurred—snap the receipt and submit directly for reimbursement. Both flows use the same simple interface, so there's no mental overhead.",
    },
    {
      question: "How does the reimbursement process work?",
      answer:
        "Once your manager approves an expense, it moves to your finance team's queue. They verify the details, mark it as 'Reimbursed' in the system, and process payment through your company's payment rails. You'll get a notification when payment is sent. The entire approval chain is logged in an immutable audit trail for transparency.",
    },
    {
      question: "Is the mobile experience different from desktop?",
      answer:
        "Not at all. We're mobile-first by design. Every feature—from snapping receipts to approving expenses—works identically on mobile web. Our Dopamine-Driven Design ensures that submitting an expense takes 3 clicks and feels fast and rewarding, whether you're on your phone during a business dinner or at your desk.",
    },
    {
      question: "What happens to my expense data and receipts?",
      answer:
        "Every change to an expense (amount, status, reviewer, dates) is recorded in an immutable audit log with timestamps and user IDs. Receipt images are securely stored and permanently linked to your expense records. This creates a legally defensible audit trail for tax compliance and fraud prevention, while giving you complete transparency into your submission history.",
    },
    {
      question: "How does the Personal Vault keep my data private?",
      answer:
        "Your Personal Vault data is encrypted and stored locally on your device. It never syncs to your company's systems or servers. Your employer has zero visibility into what you track in the Vault.",
    },
    {
      question: "Can I use FlowState if my company uses SAP or NetSuite?",
      answer:
        "Yes! FlowState exports clean CSV files that can be imported into any accounting system. We also offer direct integrations with major ERPs for Enterprise plans.",
    },
    {
      question: "What happens to my receipts after I upload them?",
      answer:
        "Our AI extracts the key data (merchant, date, amount, category) in seconds. The original receipt image is securely stored and linked to the transaction for audit purposes.",
    },
    {
      question: "Is there a mobile app?",
      answer:
        "Yes! FlowState is available on iOS and Android. The mobile app is optimized for quick receipt capture on the go.",
    },
    {
      question: "How does the approval workflow work?",
      answer:
        "Expenses are automatically routed to the appropriate approver based on your company's policy. Managers can batch-approve compliant expenses or review flagged items individually.",
    },
    {
      question: "What's your security certification?",
      answer:
        "FlowState is SOC 2 Type II certified and GDPR compliant. We use bank-level encryption and never store sensitive payment information.",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FDF8F5] via-[#FDF8F5] to-[#FFF5EE] text-[#121110] font-sans selection:bg-[#FF8A65] selection:text-white overflow-x-hidden">
      {/* Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient gradient that follows mouse */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-50 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 138, 101, 0.15), transparent 40%)`,
        }}
      />

      {/* Navigation - Improved */}
      <div className="fixed top-0 left-0 right-0 flex justify-center z-50 px-4 pt-6">
        <nav
          className={`
          w-full max-w-6xl flex items-center justify-between gap-6 px-6 py-3 rounded-full transition-all duration-500
          ${scrolled ? "bg-white/50 backdrop-blur-md border border-zinc-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)]" : "bg-white/80 backdrop-blur-xl border border-zinc-200/30 shadow-lg"}
        `}
        >
          {/* Logo */}
          <a
            href="#"
            className="font-bold text-lg tracking-tight flex items-center gap-2 hover:scale-105 transition-transform duration-300"
          >
            <div className="w-3 h-3 rounded-full bg-linear-to-br from-[#FF8A65] to-[#FF6B45] shadow-lg shadow-orange-500/30" />
            <span className="bg-linear-to-r from-[#121110] to-[#2a2a2a] bg-clip-text text-transparent">
              FlowState
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
            <a
              href="#solutions"
              className="hover:text-[#FF8A65] transition-all duration-300 relative group"
            >
              Solutions
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-[#FF8A65] to-[#FF6B45] group-hover:w-full transition-all duration-300"></span>
            </a>
            <a
              href="#vault"
              className="hover:text-[#FF8A65] transition-all duration-300 relative group"
            >
              The Vault
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-[#FF8A65] to-[#FF6B45] group-hover:w-full transition-all duration-300"></span>
            </a>
            <a
              href="#pricing"
              className="hover:text-[#FF8A65] transition-all duration-300 relative group"
            >
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-[#FF8A65] to-[#FF6B45] group-hover:w-full transition-all duration-300"></span>
            </a>
            <a
              href="#faq"
              className="hover:text-[#FF8A65] transition-all duration-300 relative group"
            >
              FAQ
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-[#FF8A65] to-[#FF6B45] group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-bold text-zinc-700 hover:text-[#FF8A65] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-linear-to-r from-[#121110] to-[#2a2a2a] text-white px-5 py-2.5 rounded-full text-xs font-bold hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-lg tracking-wide uppercase"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <IconX className="w-6 h-6" />
            ) : (
              <IconMenu className="w-6 h-6" />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-white z-40 md:hidden transition-all duration-500 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ paddingTop: "5rem" }}
      >
        <div className="flex flex-col items-center gap-8 p-8">
          <a
            href="#solutions"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-medium text-zinc-700 hover:text-[#FF8A65] transition-colors"
          >
            Solutions
          </a>
          <a
            href="#vault"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-medium text-zinc-700 hover:text-[#FF8A65] transition-colors"
          >
            The Vault
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-medium text-zinc-700 hover:text-[#FF8A65] transition-colors"
          >
            Pricing
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-medium text-zinc-700 hover:text-[#FF8A65] transition-colors"
          >
            FAQ
          </a>
          <div className="flex flex-col gap-4 mt-8 w-full max-w-xs">
            <button className="w-full px-6 py-3 text-lg font-bold text-zinc-700 border-2 border-zinc-200 rounded-full hover:border-[#FF8A65] transition-colors">
              Sign In
            </button>
            <button className="w-full bg-linear-to-r from-[#FF8A65] to-[#FF6B45] text-white px-6 py-3 rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-lg">
              Start Free
            </button>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        {/* Enhanced Background Gradients */}
        <div
          className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-linear-to-br from-[#FF8A65]/10 to-transparent opacity-60 blur-[100px] rounded-full pointer-events-none animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-linear-to-tl from-[#D0FC42]/10 to-transparent opacity-50 blur-[100px] rounded-full pointer-events-none animate-pulse"
          style={{ animationDuration: "10s", animationDelay: "2s" }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* FLOATING ELEMENT 1: Personal (Left) - Enhanced */}
          <div
            className="absolute top-0 left-0 hidden lg:block"
            style={{
              animation: "float 6s ease-in-out infinite",
              animationDelay: "0s",
            }}
          >
            <div className="bg-white p-5 rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-zinc-100/50 -rotate-6 w-64 hover:rotate-0 hover:scale-105 hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)] transition-all duration-500 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-[#FFF0E0] to-[#FFE4CC] rounded-full flex items-center justify-center text-xl shadow-inner">
                  <CupSoda className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded-full uppercase tracking-wider">
                  Personal
                </span>
              </div>
              <div className="space-y-1 mb-4">
                <div className="font-bold text-[#121110] text-lg">
                  Blue Bottle Coffee
                </div>
                <div className="text-xs text-zinc-400">
                  Invisible to Employer
                </div>
              </div>
              <div className="font-mono font-bold text-xl text-[#FF8A65]">
                $6.50
              </div>
            </div>
          </div>

          {/* FLOATING ELEMENT 2: Business (Right) - Enhanced */}
          <div
            className="absolute bottom-10 right-0 hidden lg:block"
            style={{
              animation: "float 7s ease-in-out infinite",
              animationDelay: "1s",
            }}
          >
            <div className="bg-linear-to-br from-[#121110] to-[#1f1f1f] text-white p-5 rounded-4xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5)] rotate-6 w-64 hover:rotate-0 hover:scale-105 hover:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.6)] transition-all duration-500 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl backdrop-blur-xl shadow-inner">
                  <Plane className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-[#D0FC42] bg-white/10 px-2 py-1 rounded-full uppercase tracking-wider">
                  Business
                </span>
              </div>
              <div className="space-y-1 mb-4">
                <div className="font-bold text-white text-lg">
                  Flight to NYC
                </div>
                <div className="text-xs text-zinc-400">
                  Syncing to NetSuite...
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="font-mono font-bold text-xl">$450.00</div>
                <div className="w-6 h-6 rounded-full bg-linear-to-br from-[#D0FC42] to-[#b8e332] flex items-center justify-center shadow-lg shadow-lime-500/30">
                  <IconCheck className="w-4 h-4 text-black" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-zinc-200/50 text-sm font-bold mb-8 text-zinc-500 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D0FC42] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D0FC42] shadow-lg shadow-lime-500/50"></span>
              </span>
              The standard for modern teams
            </div>

            <h1
              className="text-6xl md:text-8xl font-medium tracking-tighter leading-[0.95] mb-8 text-[#121110]"
              style={{
                animation: "fadeInUp 0.8s ease-out",
              }}
            >
              Don&apos;t let expenses <br />
              kill your{" "}
              <span className="font-serif italic text-transparent bg-clip-text bg-linear-to-r from-[#FF8A65] via-[#FF6B45] to-[#FF8A65] animate-gradient">
                Flow.
              </span>
            </h1>

            <p
              className="text-xl md:text-2xl text-zinc-600 max-w-2xl mx-auto mb-12 leading-relaxed"
              style={{
                animation: "fadeInUp 0.8s ease-out 0.2s both",
              }}
            >
              The financial OS that combines the{" "}
              <strong className="text-[#121110]">speed</strong> of consumer apps
              with the <strong className="text-[#121110]">control</strong> of
              enterprise ERPs.
            </p>

            <div
              className="flex flex-col md:flex-row items-center justify-center gap-4"
              style={{
                animation: "fadeInUp 0.8s ease-out 0.4s both",
              }}
            >
              <Link
                href="/signup"
                className="px-8 py-4 bg-linear-to-r from-[#FF8A65] to-[#FF6B45] text-white rounded-full text-lg font-bold hover:scale-105 hover:shadow-[0_20px_60px_-15px_rgba(255,138,101,0.7)] transition-all duration-300 shadow-[0_10px_40px_-15px_rgba(255,138,101,0.6)] flex items-center gap-2 group"
              >
                Get Started
                <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/signup"
                className="px-8 py-4 bg-white/80 backdrop-blur-xl border border-zinc-200/50 text-[#121110] rounded-full text-lg font-bold hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Start Personal Vault
              </Link>
            </div>

            <div className="mt-12 text-xs font-bold text-zinc-400 uppercase tracking-widest">
              No credit card required • Setup in 2 minutes
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-zinc-200/50 bg-white/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-8">
            Powering fast-moving teams
          </p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
            {["Linear", "Vercel", "Ramp", "Notion", "Intercom"].map((logo) => (
              <span
                key={logo}
                className="text-2xl font-bold font-serif text-[#121110] hover:scale-110 transition-transform duration-300 cursor-pointer"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ONE APP TWO WORLDS (Tabs) */}
      <section
        id="vault"
        className="py-24 px-6 bg-linear-to-b from-[#FDF8F5] to-white"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
              One app. Two worlds.
            </h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              Employees won&apos;t use an app that spies on them. That&apos;s
              why we built the Vault. Toggle between Business and Personal
              instantly.
            </p>
          </div>

          <div className="bg-white rounded-[3rem] p-6 md:p-12 border border-zinc-200/50 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.2)] max-w-5xl mx-auto relative overflow-hidden backdrop-blur-xl">
            {/* Subtle background pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, #121110 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Tabs */}
            <div className="flex justify-center mb-12 relative z-10">
              <div className="inline-flex bg-linear-to-b from-[#F5F5F0] to-[#EEEEE8] p-2 rounded-full border border-zinc-200/50 shadow-inner">
                <button
                  onClick={() => setActiveTab("work")}
                  className={`px-8 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 duration-500 ${activeTab === "work" ? "bg-linear-to-r from-[#121110] to-[#2a2a2a] text-white shadow-[0_8px_30px_-10px_rgba(0,0,0,0.5)] scale-105" : "text-zinc-500 hover:text-zinc-800 hover:bg-white/50"}`}
                >
                  <IconBriefcase className="w-4 h-4" /> Company Workspace
                </button>
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`px-8 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 duration-500 ${activeTab === "personal" ? "bg-linear-to-r from-[#FF8A65] to-[#FF6B45] text-white shadow-[0_8px_30px_-10px_rgba(255,138,101,0.6)] scale-105" : "text-zinc-500 hover:text-zinc-800 hover:bg-white/50"}`}
                >
                  <IconLock className="w-4 h-4" /> Personal Vault
                </button>
              </div>
            </div>

            {/* Phone Mockup Container - Enhanced */}
            <div className="flex justify-center relative z-10">
              <div className="w-[340px] h-[600px] bg-linear-to-b from-zinc-50 to-white rounded-[3rem] border-8 border-zinc-800 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative">
                {/* iPhone Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-3xl z-50 flex items-center justify-center">
                  <div className="w-14 h-1 bg-zinc-900 rounded-full"></div>
                </div>

                {/* Header */}
                <div
                  className={`h-32 p-6 flex flex-col justify-end transition-all duration-700 ${activeTab === "work" ? "bg-linear-to-br from-[#121110] to-[#2a2a2a]" : "bg-linear-to-br from-[#FFF0E0] to-[#FFE4CC]"}`}
                >
                  <div className="flex justify-between items-end">
                    <div>
                      <div
                        className={`text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors duration-700 ${activeTab === "work" ? "text-zinc-500" : "text-[#FF8A65]"}`}
                      >
                        {activeTab === "work"
                          ? "ACME INC • FINANCE"
                          : "LOCAL STORAGE • ENCRYPTED"}
                      </div>
                      <div
                        className={`text-2xl font-bold transition-colors duration-700 ${activeTab === "work" ? "text-white" : "text-[#121110]"}`}
                      >
                        {activeTab === "work" ? "Overview" : "My Expenses"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3 bg-linear-to-b from-zinc-50 to-white">
                  {activeTab === "work" ? (
                    <>
                      <div
                        className="bg-white p-3 rounded-2xl flex items-center justify-between shadow-md hover:shadow-lg transition-shadow duration-300 border border-zinc-100"
                        style={{ animation: "slideInRight 0.5s ease-out" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-linear-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center text-lg shadow-sm border border-blue-200">
                            <Plane className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-bold text-sm">
                              United Airlines
                            </div>
                            <div className="text-xs text-zinc-500">
                              Trip to SF • #TR-293
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">$450.00</div>
                          <div className="text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded font-bold">
                            Approved
                          </div>
                        </div>
                      </div>
                      <div
                        className="bg-white p-3 rounded-2xl flex items-center justify-between shadow-md hover:shadow-lg transition-shadow duration-300 border border-zinc-100"
                        style={{
                          animation: "slideInRight 0.5s ease-out 0.1s both",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-linear-to-br from-zinc-50 to-zinc-100 rounded-full flex items-center justify-center text-lg shadow-sm border border-zinc-200">
                            <Car className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-bold text-sm">Uber</div>
                            <div className="text-xs text-zinc-500">
                              Transport • #TR-294
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">$24.50</div>
                          <div className="text-[10px] text-zinc-400">
                            Processing
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="bg-white border border-zinc-200 shadow-lg p-3 rounded-2xl flex items-center justify-between opacity-90 hover:shadow-xl transition-all duration-300"
                        style={{ animation: "slideInRight 0.5s ease-out" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-linear-to-br from-[#FFF0E0] to-[#FFE4CC] rounded-full flex items-center justify-center text-lg shadow-inner">
                            <Coffee className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-bold text-sm">Coffee Shop</div>
                            <div className="text-xs text-zinc-400">
                              Personal
                            </div>
                          </div>
                        </div>
                        <div className="font-bold text-sm">$6.50</div>
                      </div>
                      <div className="mt-8 text-center px-6">
                        <p className="text-xs text-zinc-500 font-medium bg-linear-to-br from-zinc-50 to-white p-3 rounded-xl border border-zinc-200 shadow-inner">
                          <IconLock className="w-3 h-3 inline mr-1 mb-0.5" />
                          These expenses are invisible to your employer.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLE BASED SECTIONS */}
      <div id="solutions" className="space-y-12 px-6 py-24 max-w-7xl mx-auto">
        {/* 1. EMPLOYEE SECTION */}
        <section className="bg-white rounded-[3rem] p-8 md:p-16 border border-zinc-200/50 overflow-hidden relative shadow-[0_20px_70px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_80px_-15px_rgba(0,0,0,0.15)] transition-shadow duration-500">
          <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-bl from-[#FF8A65]/5 to-transparent blur-3xl pointer-events-none"></div>

          <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <div className="w-14 h-14 bg-linear-to-br from-[#FF8A65] to-[#FF6B45] rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-orange-200 rotate-2 hover:rotate-0 hover:scale-110 transition-all duration-300">
                <IconZap className="w-7 h-7" />
              </div>
              <h2 className="text-4xl font-medium tracking-tight mb-6">
                For Employees: <br />
                <span className="text-zinc-400">
                  Receipts that track themselves.
                </span>
              </h2>
              <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                Don&apos;t be a data entry clerk. Our AI extracts merchant,
                date, and amount in milliseconds. Just snap a photo and
                you&apos;re done.
              </p>
              <ul className="space-y-4">
                <li className="flex gap-4 items-start group">
                  <div className="mt-1 p-1 bg-orange-100 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <IconCheck className="w-3 h-3 text-[#FF8A65]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#121110]">
                      99% Accuracy
                    </h4>
                    <p className="text-sm text-zinc-500">
                      We read the blurry receipts so you don&apos;t have to.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Visual: Transformation (Receipt -> Card) */}
            <div className="relative h-[400px] flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* Raw Receipt */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-48 h-64 bg-white border border-zinc-200 shadow-xl -rotate-6 p-3 flex flex-col items-center z-10 hover:-rotate-3 transition-transform duration-300">
                  <div className="w-full h-32 bg-linear-to-b from-zinc-100 to-zinc-50 rounded-lg mb-2 opacity-60"></div>
                  <div className="w-full h-2 bg-zinc-200 rounded mb-1"></div>
                  <div className="w-2/3 h-2 bg-zinc-200 rounded"></div>
                  <div className="w-4/5 h-2 bg-zinc-100 rounded mt-2"></div>
                </div>

                {/* Arrow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-3 shadow-xl border border-zinc-100 hover:scale-110 transition-transform duration-300">
                  <IconArrowRight className="w-6 h-6 text-[#FF8A65]" />
                </div>

                {/* Extracted Data Card */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-56 bg-linear-to-br from-[#121110] to-[#2a2a2a] text-white rounded-2xl shadow-2xl rotate-3 p-5 z-30 hover:rotate-1 hover:scale-105 transition-all duration-300">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-[10px] text-zinc-400 uppercase font-bold">
                        Merchant
                      </div>
                      <div className="font-bold text-lg">Shake Shack</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#FF8A65] to-[#FF6B45] flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                      <IconCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-xs text-zinc-400">Date</span>
                      <span className="text-xs font-bold">Oct 24</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-xs text-zinc-400">Total</span>
                      <span className="text-xs font-bold">$24.50</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. MANAGER SECTION */}
        <section className="bg-linear-to-br from-[#121110] to-[#1f1f1f] text-white rounded-[3rem] p-8 md:p-16 border border-zinc-800 overflow-hidden relative shadow-[0_30px_90px_-20px_rgba(0,0,0,0.5)]">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-linear-to-tr from-[#D0FC42]/10 to-transparent blur-3xl pointer-events-none"></div>

          <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
            {/* Visual: Batch Approval */}
            <div className="order-2 md:order-1 flex justify-center">
              <div className="w-[300px] bg-linear-to-br from-[#1C1C1C] to-[#252525] rounded-3xl p-6 border border-white/10 shadow-2xl relative z-10 transform -rotate-1 hover:rotate-0 hover:scale-105 transition-all duration-500">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-sm">Inbox (3)</span>
                  <div className="flex items-center gap-1 text-[#D0FC42] text-xs font-bold cursor-pointer hover:underline hover:scale-105 transition-all duration-300">
                    <IconCheck className="w-3 h-3" /> Approve All
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#D0FC42] to-[#b8e332] flex items-center justify-center text-xs font-bold text-black shadow-lg shadow-lime-500/20">
                        JS
                      </div>
                      <div>
                        <div className="font-bold text-sm">Client Lunch</div>
                        <div className="text-xs text-zinc-500">
                          Safe to approve
                        </div>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-[#D0FC42] flex items-center justify-center">
                      <div className="w-3 h-3 bg-[#D0FC42] rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-black shadow-lg shadow-blue-500/20">
                        AL
                      </div>
                      <div>
                        <div className="font-bold text-sm">Software Sub</div>
                        <div className="text-xs text-zinc-500">
                          Safe to approve
                        </div>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-[#D0FC42] flex items-center justify-center">
                      <div className="w-3 h-3 bg-[#D0FC42] rounded-full"></div>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-6 bg-linear-to-r from-[#D0FC42] to-[#b8e332] text-black font-bold py-3 rounded-xl text-xs hover:scale-105 transition-all duration-300 shadow-lg shadow-lime-500/20 hover:shadow-lime-500/40">
                  Confirm Approvals (2)
                </button>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-8 border border-white/20 rotate-1 hover:rotate-0 hover:scale-110 hover:bg-white/20 transition-all duration-300 backdrop-blur-xl">
                <IconCheck className="w-7 h-7" />
              </div>
              <h2 className="text-4xl font-medium tracking-tight mb-6">
                For Managers: <br />
                <span className="text-zinc-500">Unblock your team.</span>
              </h2>
              <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                Don&apos;t be the bottleneck. We highlight the safe expenses so
                you can batch-approve them in seconds. Focus only on the
                anomalies.
              </p>
            </div>
          </div>
        </section>

        {/* 3. FINANCE SECTION */}
        <section className="bg-white rounded-[3rem] p-8 md:p-16 border border-zinc-200/50 overflow-hidden relative shadow-[0_20px_70px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_80px_-15px_rgba(0,0,0,0.15)] transition-shadow duration-500">
          <div className="absolute top-0 left-0 w-96 h-96 bg-linear-to-br from-[#D0FC42]/5 to-transparent blur-3xl pointer-events-none"></div>

          <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <div className="w-14 h-14 bg-linear-to-br from-[#D0FC42] to-[#b8e332] rounded-2xl flex items-center justify-center text-[#121110] mb-8 shadow-lg shadow-lime-200 -rotate-2 hover:rotate-0 hover:scale-110 transition-all duration-300">
                <IconBriefcase className="w-7 h-7" />
              </div>
              <h2 className="text-4xl font-medium tracking-tight mb-6">
                For Finance: <br />
                <span className="text-zinc-400">
                  Stop cleaning spreadsheets.
                </span>
              </h2>
              <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                You don&apos;t need another complex integration. You need clean
                data. We give you perfectly categorized, audit-ready CSV exports
                that you can import into any ledger.
              </p>
              <ul className="space-y-4">
                <li className="flex gap-4 items-start group">
                  <div className="mt-1 p-1 bg-[#D0FC42]/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <IconCheck className="w-3 h-3 text-black" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#121110]">
                      Audit-Ready Exports
                    </h4>
                    <p className="text-sm text-zinc-500">
                      Every row contains the receipt image link and approval
                      trail.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Visual: The Perfect Table */}
            <div className="bg-linear-to-br from-[#F7F5F2] to-[#EEEEE8] rounded-[2.5rem] p-6 border border-zinc-200 shadow-xl hover:shadow-2xl transition-shadow duration-500">
              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-lg">
                <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-linear-to-b from-zinc-50 to-white">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors cursor-pointer"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors cursor-pointer"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors cursor-pointer"></div>
                  </div>
                  <button className="flex items-center gap-2 text-[10px] font-bold bg-linear-to-r from-[#121110] to-[#2a2a2a] text-white px-3 py-1.5 rounded-lg hover:scale-105 transition-all duration-300 shadow-lg">
                    <IconDownload className="w-3 h-3" /> Export CSV
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="grid grid-cols-3 gap-4 text-xs items-center border-b border-zinc-50 pb-2 last:border-0 hover:bg-zinc-50 px-2 py-1 rounded-lg transition-colors duration-200"
                    >
                      <div className="font-bold text-[#121110]">
                        {i === 1 ? "Shake Shack" : i === 2 ? "Uber" : "Delta"}
                      </div>
                      <div className="text-zinc-500">
                        {i === 1 ? "Meals" : "Travel"}
                      </div>
                      <div className="text-right font-mono text-zinc-600 font-bold">
                        $42.50
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating File Icon */}
              <div className="mt-6 flex justify-center">
                <div className="bg-white border border-zinc-200 p-3 rounded-xl shadow-lg flex items-center gap-3 hover:scale-105 hover:shadow-xl transition-all duration-300">
                  <div className="bg-green-100 p-2 rounded-lg text-green-700">
                    <IconFileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">
                      Oct_Expenses_Final.csv
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      12kb • Ready
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* PRICING SECTION */}
      <section
        id="pricing"
        className="py-24 px-6 bg-linear-to-b from-white to-[#FDF8F5]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto mb-8">
              Start with the Personal Vault for free. Upgrade when your team is
              ready.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-3 bg-white border border-zinc-200 rounded-full p-1.5 shadow-sm">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                  billingCycle === "monthly"
                    ? "bg-linear-to-r from-[#121110] to-[#2a2a2a] text-white shadow-lg"
                    : "text-zinc-600 hover:text-[#121110]"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 relative ${
                  billingCycle === "annual"
                    ? "bg-linear-to-r from-[#121110] to-[#2a2a2a] text-white shadow-lg"
                    : "text-zinc-600 hover:text-[#121110]"
                }`}
              >
                Annual
                <span className="absolute -top-2 -right-2 bg-linear-to-r from-[#FF8A65] to-[#FF6B45] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Personal Plan */}
            <div className="bg-white rounded-4xl p-8 border border-zinc-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Personal Vault</h3>
                <p className="text-sm text-zinc-500">
                  For individuals tracking personal expenses
                </p>
              </div>
              <div className="mb-6">
                <div className="text-5xl font-bold mb-2">Free</div>
                <p className="text-sm text-zinc-500">Forever</p>
              </div>
              <button className="w-full bg-zinc-100 text-[#121110] py-3 rounded-full font-bold hover:bg-zinc-200 transition-colors mb-6">
                Start for Free
              </button>
              <ul className="space-y-3">
                <li className="flex gap-3 items-start text-sm">
                  <IconCheck className="w-4 h-4 text-[#D0FC42] mt-0.5 shrink-0" />
                  <span>Unlimited personal expenses</span>
                </li>
                <li className="flex gap-3 items-start text-sm">
                  <IconCheck className="w-4 h-4 text-[#D0FC42] mt-0.5 shrink-0" />
                  <span>AI receipt scanning</span>
                </li>
                <li className="flex gap-3 items-start text-sm">
                  <IconCheck className="w-4 h-4 text-[#D0FC42] mt-0.5 shrink-0" />
                  <span>Local encryption</span>
                </li>
                <li className="flex gap-3 items-start text-sm">
                  <IconCheck className="w-4 h-4 text-[#D0FC42] mt-0.5 shrink-0" />
                  <span>CSV exports</span>
                </li>
              </ul>
            </div>

            {/* Team Plan */}
            <div className="bg-linear-to-br from-[#121110] to-[#2a2a2a] text-white rounded-4xl p-8 border-2 border-[#FF8A65] shadow-[0_20px_60px_-15px_rgba(255,138,101,0.4)] hover:shadow-[0_25px_70px_-15px_rgba(255,138,101,0.5)] transition-all duration-300 hover:-translate-y-1 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-r from-[#FF8A65] to-[#FF6B45] text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                MOST POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Team</h3>
                <p className="text-sm text-zinc-400">
                  For growing teams up to 50 people
                </p>
              </div>
              <div className="mb-6">
                <div className="text-5xl font-bold mb-2">
                  ${billingCycle === "annual" ? "12" : "15"}
                </div>
                <p className="text-sm text-zinc-400">per user/month</p>
              </div>
              <button className="w-full bg-linear-to-r from-[#FF8A65] to-[#FF6B45] text-white py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg mb-6">
                Start Free Trial
              </button>
              <ul className="space-y-3">
                <li className="flex gap-3 items-start text-sm">
                  <IconCheck className="w-4 h-4 text-[#D0FC42] mt-0.5 shrink-0" />
                  <span>Everything in Personal, plus:</span>
                </li>
                <li className="flex gap-3 items-start text-sm">
                  <IconCheck className="w-4 h-4 text-[#D0FC42] mt-0.5 shrink-0" />
                  <span>Company workspace</span>
                </li>
                <li className="flex gap-3 items-start text-sm">
                  <IconCheck className="w-4 h-4 text-[#D0FC42] mt-0.5 shrink-0" />
                  <span>Approval workflows</span>
                </li>
                <li className="flex gap-3 items-start text-sm">
                  <IconCheck className="w-4 h-4 text-[#D0FC42] mt-0.5 shrink-0" />
                  <span>Policy enforcement</span>
                </li>
                <li className="flex gap-3 items-start text-sm">
                  <IconCheck className="w-4 h-4 text-[#D0FC42] mt-0.5 shrink-0" />
                  <span>Batch approvals</span>
                </li>
                <li className="flex gap-3 items-start text-sm">
                  <IconCheck className="w-4 h-4 text-[#D0FC42] mt-0.5 shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-4xl p-8 border border-zinc-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <p className="text-sm text-zinc-500">
                  For large organizations with custom needs
                </p>
              </div>
              <div className="mb-6">
                <div className="text-5xl font-bold mb-2">Custom</div>
                <p className="text-sm text-zinc-500">Let&apos;s talk</p>
              </div>
              <button className="w-full bg-[#121110] text-white py-3 rounded-full font-bold hover:bg-zinc-800 transition-colors mb-6">
                Contact Sales
              </button>
              <ul className="space-y-3">
                <li className="flex gap-3 items-start text-sm">
                  <IconCheck className="w-4 h-4 text-[#D0FC42] mt-0.5 shrink-0" />
                  <span>Everything in Team, plus:</span>
                </li>
                <li className="flex gap-3 items-start text-sm">
                  <IconCheck className="w-4 h-4 text-[#D0FC42] mt-0.5 shrink-0" />
                  <span>ERP integrations (SAP, NetSuite)</span>
                </li>
                <li className="flex gap-3 items-start text-sm">
                  <IconCheck className="w-4 h-4 text-[#D0FC42] mt-0.5 shrink-0" />
                  <span>SSO & advanced security</span>
                </li>
                <li className="flex gap-3 items-start text-sm">
                  <IconCheck className="w-4 h-4 text-[#D0FC42] mt-0.5 shrink-0" />
                  <span>Custom approval workflows</span>
                </li>
                <li className="flex gap-3 items-start text-sm">
                  <IconCheck className="w-4 h-4 text-[#D0FC42] mt-0.5 shrink-0" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex gap-3 items-start text-sm">
                  <IconCheck className="w-4 h-4 text-[#D0FC42] mt-0.5 shrink-0" />
                  <span>SLA & 24/7 support</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-zinc-500">
              All plans include a 14-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-zinc-600">
              Everything you need to know about FlowState
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="bg-linear-to-b from-zinc-50 to-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-zinc-50/50 transition-colors"
                >
                  <span className="font-bold text-lg pr-4">{faq.question}</span>
                  <IconChevronDown
                    className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-600 ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-600 ${
                    openFaq === index
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-5 text-zinc-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-linear-to-br from-[#FFF0E0] to-[#FFE4CC] rounded-2xl p-8 border border-orange-200">
            <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
            <p className="text-zinc-600 mb-6">
              Our team is here to help you get started with FlowState
            </p>
            <button className="px-6 py-3 bg-linear-to-r from-[#FF8A65] to-[#FF6B45] text-white rounded-full font-bold hover:scale-105 transition-transform shadow-lg">
              Contact Support
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER - REDESIGNED */}
      <footer className="bg-linear-to-br from-[#121110] to-[#1f1f1f] text-white pt-24 pb-0 rounded-t-[3rem] relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF8A65]/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D0FC42]/10 blur-[120px] pointer-events-none"></div>

        {/* Top CTA */}
        <div className="max-w-4xl mx-auto text-center px-6 mb-24 relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
            Ready to flow?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 bg-linear-to-r from-[#FF8A65] to-[#FF6B45] text-white rounded-full text-lg font-bold hover:scale-105 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(255,138,101,0.6)] hover:shadow-[0_0_50px_-10px_rgba(255,138,101,0.8)]">
              Start Your Vault
            </button>
            <button className="px-8 py-4 bg-white/10 text-white border border-white/10 rounded-full text-lg font-bold hover:bg-white/20 hover:border-white/20 transition-all duration-300 backdrop-blur-xl">
              Talk to Sales
            </button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="max-w-7xl mx-auto px-6 border-t border-white/10 pt-16 pb-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center gap-2 font-bold text-xl">
                <div className="w-4 h-4 bg-linear-to-br from-[#FF8A65] to-[#FF6B45] rounded-full shadow-lg shadow-orange-500/30" />
                FlowState
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 bg-white/5 inline-flex px-3 py-1 rounded-full border border-white/5 backdrop-blur-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                All Systems Normal
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-zinc-400">Product</h4>
              <ul className="space-y-3 text-sm font-medium text-zinc-500">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    Security
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-zinc-400">Company</h4>
              <ul className="space-y-3 text-sm font-medium text-zinc-500">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-zinc-400">Legal</h4>
              <ul className="space-y-3 text-sm font-medium text-zinc-500">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Massive Watermark */}
        <div className="border-t border-white/5 relative z-10">
          <h1 className="text-[13vw] leading-[0.8] font-bold text-center text-[#1A1A1A] select-none tracking-tighter pt-4 hover:text-[#222] transition-colors duration-700">
            FLOWSTATE
          </h1>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
