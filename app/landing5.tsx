"use client";

import { useEffect, useState } from "react";

// --- Custom Icons (Clean, Stroke-based) ---

const IconArrowRight = ({ className }) => (
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

const IconBriefcase = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const IconLock = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconZap = ({ className }) => (
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

const IconShield = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </svg>
);

const IconPieChart = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

const IconCheck = ({ className }) => (
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

// --- Main Component ---

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("work"); // 'work' is default

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#121110] font-sans selection:bg-[#FF8A65] selection:text-white overflow-x-hidden">
      {/* Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04] z-50 mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Navigation */}
      <div className="fixed top-6 left-0 right-0 flex justify-center z-40 px-4">
        <nav
          className={`
          flex items-center gap-6 px-6 py-3 rounded-full transition-all duration-300
          ${scrolled ? "bg-white/95 backdrop-blur-xl border border-zinc-200 shadow-xl" : "bg-white border border-zinc-200"}
        `}
        >
          <span className="font-bold text-lg tracking-tight flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF8A65]" />
            FlowState
          </span>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
            <a href="#roles" className="hover:text-[#FF8A65] transition-colors">
              Solutions
            </a>
            <a href="#vault" className="hover:text-[#FF8A65] transition-colors">
              The Vault
            </a>
            <a
              href="#pricing"
              className="hover:text-[#FF8A65] transition-colors"
            >
              Pricing
            </a>
          </div>
          <button className="bg-[#121110] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-zinc-800 transition-colors shadow-lg">
            Start Free
          </button>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative pt-48 pb-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-zinc-200 text-sm font-bold mb-8 text-zinc-500 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            V2.0 Now Available
          </div>

          <h1 className="text-6xl md:text-8xl font-medium tracking-tighter leading-[0.95] mb-8">
            The financial OS <br />
            that{" "}
            <span className="font-serif italic text-[#FF8A65] pr-4">
              Finance
            </span>
            and
            <span className="font-serif italic text-zinc-400 pl-4">Staff</span>
            <br /> both love.
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 max-w-2xl mx-auto mb-12 leading-snug">
            Stop forcing your team to use 90s software. <br />
            Give them a consumer-grade experience that syncs to your ERP
            instantly.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 bg-[#FF8A65] text-white rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-xl flex items-center gap-2">
              Get Started <IconArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-white border border-zinc-200 text-[#121110] rounded-full text-lg font-bold hover:bg-zinc-50 transition-colors">
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-8">
            Powering fast-moving teams
          </p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all">
            {["Linear", "Vercel", "Ramp", "Notion", "Intercom"].map((logo) => (
              <span
                key={logo}
                className="text-2xl font-bold font-serif text-[#121110]"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* "ONE APP. TWO WORLDS." SECTION */}
      <section id="vault" className="py-24 px-6 bg-[#F7F5F2]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
              One app. Two worlds.
            </h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              Employees won't use an app that spies on them. That's why we built
              the Vault. Toggle between Business and Personal instantly.
            </p>
          </div>

          <div className="bg-white rounded-[3rem] p-4 md:p-8 border border-zinc-200 shadow-xl max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-[#F7F5F2] p-1.5 rounded-full border border-zinc-200">
                <button
                  onClick={() => setActiveTab("work")}
                  className={`px-8 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "work" ? "bg-[#121110] text-white shadow-md" : "text-zinc-500 hover:text-zinc-800"}`}
                >
                  <IconBriefcase className="w-4 h-4" /> Company Workspace
                </button>
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`px-8 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "personal" ? "bg-[#FF8A65] text-white shadow-md" : "text-zinc-500 hover:text-zinc-800"}`}
                >
                  <IconLock className="w-4 h-4" /> Personal Vault
                </button>
              </div>
            </div>

            {/* Tab Content Area */}
            <div className="bg-[#FAFAFA] rounded-[2.5rem] border border-zinc-100 p-8 min-h-[350px] flex items-center justify-center relative overflow-hidden">
              {/* Background Pattern */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              ></div>

              {activeTab === "work" ? (
                <div className="w-full max-w-md animate-fade-in">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      Active Report: Oct 2024
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                      ● Live Sync Active
                    </span>
                  </div>
                  <div className="space-y-3">
                    {/* Work Item 1 */}
                    <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#121110] rounded-full flex items-center justify-center text-white text-lg">
                          ✈️
                        </div>
                        <div>
                          <div className="font-bold text-sm">
                            United Airlines
                          </div>
                          <div className="text-xs text-zinc-500">
                            Trip to SF
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">$450.00</div>
                        <div className="text-[10px] text-zinc-400">
                          Approved
                        </div>
                      </div>
                    </div>
                    {/* Work Item 2 */}
                    <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-zinc-100 rounded-full flex items-center justify-center text-lg">
                          🍔
                        </div>
                        <div>
                          <div className="font-bold text-sm">Client Lunch</div>
                          <div className="text-xs text-zinc-500">
                            Sales Meeting
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">$85.20</div>
                        <div className="text-[10px] text-[#FF8A65]">
                          Pending Manager
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-center">
                    <button className="text-xs font-bold text-zinc-400 border-b border-zinc-300 pb-0.5">
                      View ERP Logs
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-md animate-fade-in">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      Local Storage Only
                    </span>
                    <span className="text-xs font-bold text-zinc-400 bg-zinc-100 px-2 py-1 rounded-full border border-zinc-200">
                      <IconLock className="w-3 h-3 inline mr-1" /> Private
                    </span>
                  </div>
                  <div className="space-y-3">
                    {/* Personal Item 1 */}
                    <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between opacity-80">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-lg">
                          🛒
                        </div>
                        <div>
                          <div className="font-bold text-sm">Whole Foods</div>
                          <div className="text-xs text-zinc-500">Groceries</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">$124.50</div>
                      </div>
                    </div>
                    {/* Personal Item 2 */}
                    <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between opacity-80">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-lg">
                          📺
                        </div>
                        <div>
                          <div className="font-bold text-sm">Netflix</div>
                          <div className="text-xs text-zinc-500">
                            Subscription
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">$15.99</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-center">
                    <p className="text-xs text-zinc-400 font-medium">
                      These items are invisible to your employer.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ROLE-BASED SECTIONS */}
      <div id="roles" className="space-y-8 px-6 pb-24">
        {/* ROLE 1: THE EMPLOYEE */}
        <section className="max-w-7xl mx-auto bg-white rounded-[3rem] p-10 md:p-20 border border-zinc-200 relative overflow-hidden">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-14 h-14 bg-[#FF8A65] rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-orange-100 rotate-3">
                <IconZap className="w-7 h-7" />
              </div>
              <h2 className="text-4xl font-medium tracking-tight mb-6">
                For Employees: <br />
                <span className="text-zinc-400">
                  Expense reports that write themselves.
                </span>
              </h2>
              <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                We use AI to extract merchant, date, and amount from receipts in
                under a second. No manual entry. Just snap a photo and throw
                your phone away.
              </p>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="mt-1">
                    <IconCheck className="w-5 h-5 text-[#FF8A65]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Zero-Wait Interface</h4>
                    <p className="text-sm text-zinc-500">
                      Optimistic UI ensures you never see a loading spinner.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1">
                    <IconCheck className="w-5 h-5 text-[#FF8A65]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Offline Mode</h4>
                    <p className="text-sm text-zinc-500">
                      Capture expenses on a plane. We sync when you land.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-[#F7F5F2] rounded-[2.5rem] h-[400px] flex items-center justify-center">
              {/* Visual Placeholder */}
              <div className="text-center opacity-40">
                <div className="text-6xl mb-2">📸</div>
                <div className="font-mono font-bold">Scanning...</div>
              </div>
            </div>
          </div>
        </section>

        {/* ROLE 2: THE MANAGER */}
        <section className="max-w-7xl mx-auto bg-[#121110] text-white rounded-[3rem] p-10 md:p-20 relative overflow-hidden">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 bg-white/5 rounded-[2.5rem] h-[400px] border border-white/10 flex items-center justify-center">
              {/* Visual Placeholder */}
              <div className="w-64 bg-[#1C1C1C] rounded-3xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-sm">Inbox (4)</span>
                  <span className="text-xs text-zinc-500">Select All</span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-sm font-bold text-red-200">
                        Policy Alert
                      </span>
                      <span className="text-xs text-red-400">+$200</span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">
                      Flight Upgrade
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-sm font-bold">Team Lunch</span>
                      <span className="text-xs text-zinc-500">$45</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-8 border border-white/20 -rotate-3">
                <IconShield className="w-7 h-7" />
              </div>
              <h2 className="text-4xl font-medium tracking-tight mb-6">
                For Managers: <br />
                <span className="text-zinc-500">Unblock your team.</span>
              </h2>
              <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                Don't be the bottleneck. Review expenses via a high-density
                mobile feed designed for "Inbox Zero."
              </p>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="mt-1">
                    <IconCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">
                      Automated Policy Checks
                    </h4>
                    <p className="text-sm text-zinc-500">
                      We flag duplicates and overages so you don't have to
                      check.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1">
                    <IconCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">One-Tap Approval</h4>
                    <p className="text-sm text-zinc-500">
                      Approve an entire report in a single tap.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ROLE 3: FINANCE */}
        <section className="max-w-7xl mx-auto bg-white rounded-[3rem] p-10 md:p-20 border border-zinc-200 relative overflow-hidden">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-14 h-14 bg-[#D0FC42] rounded-2xl flex items-center justify-center text-black mb-8 shadow-lg shadow-lime-100 rotate-2">
                <IconPieChart className="w-7 h-7" />
              </div>
              <h2 className="text-4xl font-medium tracking-tight mb-6">
                For Finance: <br />
                <span className="text-zinc-400">The continuous close.</span>
              </h2>
              <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                Stop chasing receipts at month-end. Data syncs to your ERP in
                real-time. Every transaction is audit-ready.
              </p>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="mt-1">
                    <IconCheck className="w-5 h-5 text-[#D0FC42]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Real-Time ERP Sync</h4>
                    <p className="text-sm text-zinc-500">
                      Direct integration with NetSuite, Xero, and QuickBooks.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1">
                    <IconCheck className="w-5 h-5 text-[#D0FC42]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Immutable Audit Logs</h4>
                    <p className="text-sm text-zinc-500">
                      See exactly who approved what, and when.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-[#F7F5F2] rounded-[2.5rem] h-[400px] flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              <div className="w-64 bg-white rounded-xl shadow-xl p-6 border border-zinc-200">
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 bg-zinc-50 rounded p-2 text-center">
                    <div className="text-[10px] uppercase text-zinc-400 font-bold">
                      Pending
                    </div>
                    <div className="font-bold text-xl">0</div>
                  </div>
                  <div className="flex-1 bg-green-50 rounded p-2 text-center text-green-700">
                    <div className="text-[10px] uppercase font-bold">
                      Synced
                    </div>
                    <div className="font-bold text-xl">142</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-zinc-100 rounded"></div>
                  <div className="h-2 w-2/3 bg-zinc-100 rounded"></div>
                  <div className="h-2 w-3/4 bg-zinc-100 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="py-24 px-6 bg-[#121110] text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div>
            <span className="font-bold text-2xl tracking-tight mb-4 block">
              FlowState
            </span>
            <p className="text-zinc-500 max-w-xs">
              New York, NY <br />© 2024 FlowState Financial Inc.
            </p>
          </div>
          <div className="flex flex-wrap gap-8 md:gap-16 text-sm font-bold text-zinc-400">
            <div className="flex flex-col gap-4">
              <span className="text-white">Product</span>
              <a href="#" className="hover:text-[#FF8A65]">
                Private Vault
              </a>
              <a href="#" className="hover:text-[#FF8A65]">
                Business
              </a>
              <a href="#" className="hover:text-[#FF8A65]">
                Pricing
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-white">Legal</span>
              <a href="#" className="hover:text-[#FF8A65]">
                Privacy
              </a>
              <a href="#" className="hover:text-[#FF8A65]">
                Terms
              </a>
              <a href="#" className="hover:text-[#FF8A65]">
                Security
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
