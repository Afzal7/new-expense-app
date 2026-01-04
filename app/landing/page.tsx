// @ts-nocheck
"use client";

import { useEffect, useState } from "react";

// --- Custom Icons ---
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
const IconBriefcase = ({ className }) => (
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
const IconLock = ({ className }) => (
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
const IconDownload = ({ className }) => (
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
const IconFileText = ({ className }) => (
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

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("work");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDF8F5] text-[#121110] font-sans selection:bg-[#FF8A65] selection:text-white overflow-x-hidden">
      {/* Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
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
            <a
              href="#solutions"
              className="hover:text-[#FF8A65] transition-colors"
            >
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
          <button className="bg-[#121110] text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-zinc-800 transition-colors shadow-lg tracking-wide uppercase">
            Start Free
          </button>
        </nav>
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF8A65] opacity-[0.05] blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* FLOATING ELEMENT 1: Personal (Left) */}
          <div className="absolute top-0 left-0 hidden lg:block animate-[bounce_4s_infinite]">
            <div className="bg-white p-5 rounded-[2rem] shadow-xl border border-zinc-100 rotate-[-6deg] w-64 hover:rotate-0 transition-transform duration-300">
              <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-10 bg-[#FFF0E0] rounded-full flex items-center justify-center text-xl">
                  ☕️
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

          {/* FLOATING ELEMENT 2: Business (Right) */}
          <div className="absolute bottom-10 right-0 hidden lg:block animate-[bounce_5s_infinite]">
            <div className="bg-[#121110] text-white p-5 rounded-[2rem] shadow-2xl rotate-[6deg] w-64 hover:rotate-0 transition-transform duration-300">
              <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl">
                  ✈️
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
                <div className="w-6 h-6 rounded-full bg-[#D0FC42] flex items-center justify-center">
                  <IconCheck className="w-4 h-4 text-black" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-zinc-200 text-sm font-bold mb-8 text-zinc-500 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D0FC42] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D0FC42]"></span>
              </span>
              SOC-2 Compliant & Ready
            </div>

            <h1 className="text-6xl md:text-8xl font-medium tracking-tighter leading-[0.95] mb-8 text-[#121110]">
              Don't let expenses <br />
              kill your{" "}
              <span className="font-serif italic text-[#FF8A65]">Flow.</span>
            </h1>

            <p className="text-xl md:text-2xl text-zinc-600 max-w-2xl mx-auto mb-12 leading-relaxed">
              The financial OS that combines the <strong>speed</strong> of
              consumer apps with the <strong>control</strong> of enterprise
              ERPs.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button className="px-8 py-4 bg-[#FF8A65] text-white rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-[0_10px_40px_-15px_rgba(255,138,101,0.6)] flex items-center gap-2">
                Start Personal Vault <IconArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white border border-zinc-200 text-[#121110] rounded-full text-lg font-bold hover:bg-zinc-50 transition-colors">
                Book a Demo
              </button>
            </div>

            <div className="mt-12 text-xs font-bold text-zinc-400 uppercase tracking-widest">
              No credit card required • Setup in 2 minutes
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-8">
            Powering fast-moving teams
          </p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all">
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

      {/* ONE APP TWO WORLDS (Tabs) */}
      <section id="vault" className="py-24 px-6 bg-[#FDF8F5]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
              One app. Two worlds.
            </h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              Employees won't use an app that spies on them. That's why we built
              the Vault. Toggle between Business and Personal instantly.
            </p>
          </div>

          <div className="bg-white rounded-[3rem] p-6 md:p-12 border border-zinc-200 shadow-2xl max-w-5xl mx-auto relative overflow-hidden">
            {/* Tabs */}
            <div className="flex justify-center mb-12 relative z-10">
              <div className="inline-flex bg-[#F5F5F0] p-2 rounded-full border border-zinc-200 shadow-inner">
                <button
                  onClick={() => setActiveTab("work")}
                  className={`px-8 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 duration-300 ${activeTab === "work" ? "bg-[#121110] text-white shadow-lg" : "text-zinc-500 hover:text-zinc-800"}`}
                >
                  <IconBriefcase className="w-4 h-4" /> Company Workspace
                </button>
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`px-8 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 duration-300 ${activeTab === "personal" ? "bg-[#FF8A65] text-white shadow-lg" : "text-zinc-500 hover:text-zinc-800"}`}
                >
                  <IconLock className="w-4 h-4" /> Personal Vault
                </button>
              </div>
            </div>

            {/* Phone Mockup Container */}
            <div className="flex justify-center relative z-10">
              <div className="w-[340px] h-[600px] bg-white rounded-[3rem] border-4 border-zinc-100 shadow-2xl overflow-hidden relative">
                {/* Header */}
                <div
                  className={`h-32 p-6 flex flex-col justify-end transition-colors duration-500 ${activeTab === "work" ? "bg-[#121110]" : "bg-[#FFF0E0]"}`}
                >
                  <div className="flex justify-between items-end">
                    <div>
                      <div
                        className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${activeTab === "work" ? "text-zinc-500" : "text-[#FF8A65]"}`}
                      >
                        {activeTab === "work"
                          ? "ACME INC • FINANCE"
                          : "LOCAL STORAGE • ENCRYPTED"}
                      </div>
                      <div
                        className={`text-2xl font-bold ${activeTab === "work" ? "text-white" : "text-[#121110]"}`}
                      >
                        {activeTab === "work" ? "Overview" : "My Expenses"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {activeTab === "work" ? (
                    <>
                      <div className="bg-[#F7F7F7] p-3 rounded-2xl flex items-center justify-between animate-fade-in-up">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg shadow-sm border border-zinc-100">
                            ✈️
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
                        className="bg-[#F7F7F7] p-3 rounded-2xl flex items-center justify-between animate-fade-in-up"
                        style={{ animationDelay: "100ms" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg shadow-sm border border-zinc-100">
                            🚕
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
                      <div className="bg-white border border-zinc-100 shadow-sm p-3 rounded-2xl flex items-center justify-between animate-fade-in-up opacity-80">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#FFF0E0] rounded-full flex items-center justify-center text-lg">
                            ☕️
                          </div>
                          <div>
                            <div className="font-bold text-sm">Starbucks</div>
                            <div className="text-xs text-zinc-400">
                              Personal
                            </div>
                          </div>
                        </div>
                        <div className="font-bold text-sm">$6.50</div>
                      </div>
                      <div className="mt-8 text-center px-6">
                        <p className="text-xs text-zinc-400 font-medium bg-zinc-50 p-3 rounded-xl">
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
      <div id="solutions" className="space-y-12 px-6 pb-24 max-w-7xl mx-auto">
        {/* 1. EMPLOYEE SECTION */}
        <section className="bg-white rounded-[3rem] p-8 md:p-16 border border-zinc-200 overflow-hidden relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-14 h-14 bg-[#FF8A65] rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-orange-100 rotate-2">
                <IconZap className="w-7 h-7" />
              </div>
              <h2 className="text-4xl font-medium tracking-tight mb-6">
                For Employees: <br />
                <span className="text-zinc-400">
                  Receipts that track themselves.
                </span>
              </h2>
              <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                Don't be a data entry clerk. Our AI extracts merchant, date, and
                amount in milliseconds. Just snap a photo and you're done.
              </p>
              <ul className="space-y-4">
                <li className="flex gap-4 items-start">
                  <div className="mt-1 p-1 bg-orange-100 rounded-full">
                    <IconCheck className="w-3 h-3 text-[#FF8A65]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#121110]">
                      99% Accuracy
                    </h4>
                    <p className="text-sm text-zinc-500">
                      We read the blurry receipts so you don't have to.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Visual: Transformation (Receipt -> Card) */}
            <div className="relative h-[400px] flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* Raw Receipt */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-48 h-64 bg-white border border-zinc-200 shadow-xl rotate-[-6deg] p-3 flex flex-col items-center z-10">
                  <div className="w-full h-32 bg-zinc-100 rounded-lg mb-2 opacity-50"></div>
                  <div className="w-full h-2 bg-zinc-100 rounded mb-1"></div>
                  <div className="w-2/3 h-2 bg-zinc-100 rounded"></div>
                </div>

                {/* Arrow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-lg border border-zinc-100">
                  <IconArrowRight className="w-6 h-6 text-[#FF8A65]" />
                </div>

                {/* Extracted Data Card */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-56 bg-[#121110] text-white rounded-2xl shadow-2xl rotate-[3deg] p-5 z-30">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-[10px] text-zinc-400 uppercase font-bold">
                        Merchant
                      </div>
                      <div className="font-bold text-lg">Shake Shack</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#FF8A65] flex items-center justify-center text-white">
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
        <section className="bg-[#121110] text-white rounded-[3rem] p-8 md:p-16 border border-zinc-800 overflow-hidden relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Visual: Batch Approval */}
            <div className="order-2 md:order-1 flex justify-center">
              <div className="w-[300px] bg-[#1C1C1C] rounded-3xl p-6 border border-white/10 shadow-2xl relative z-10 transform -rotate-1">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-sm">Inbox (3)</span>
                  <div className="flex items-center gap-1 text-[#D0FC42] text-xs font-bold cursor-pointer hover:underline">
                    <IconCheck className="w-3 h-3" /> Approve All
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#D0FC42] flex items-center justify-center text-xs font-bold text-black">
                        JS
                      </div>
                      <div>
                        <div className="font-bold text-sm">Client Lunch</div>
                        <div className="text-xs text-zinc-500">
                          Safe to approve
                        </div>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full border border-[#D0FC42] flex items-center justify-center">
                      <div className="w-3 h-3 bg-[#D0FC42] rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold text-black">
                        AL
                      </div>
                      <div>
                        <div className="font-bold text-sm">Software Sub</div>
                        <div className="text-xs text-zinc-500">
                          Safe to approve
                        </div>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full border border-[#D0FC42] flex items-center justify-center">
                      <div className="w-3 h-3 bg-[#D0FC42] rounded-full"></div>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-6 bg-[#D0FC42] text-black font-bold py-3 rounded-xl text-xs hover:bg-white transition-colors">
                  Confirm Approvals (2)
                </button>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-8 border border-white/20 rotate-1">
                <IconCheck className="w-7 h-7" />
              </div>
              <h2 className="text-4xl font-medium tracking-tight mb-6">
                For Managers: <br />
                <span className="text-zinc-500">Unblock your team.</span>
              </h2>
              <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                Don't be the bottleneck. We highlight the safe expenses so you
                can batch-approve them in seconds. Focus only on the anomalies.
              </p>
            </div>
          </div>
        </section>

        {/* 3. FINANCE SECTION */}
        <section className="bg-white rounded-[3rem] p-8 md:p-16 border border-zinc-200 overflow-hidden relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-14 h-14 bg-[#D0FC42] rounded-2xl flex items-center justify-center text-[#121110] mb-8 shadow-lg shadow-lime-200 -rotate-2">
                <IconBriefcase className="w-7 h-7" />
              </div>
              <h2 className="text-4xl font-medium tracking-tight mb-6">
                For Finance: <br />
                <span className="text-zinc-400">
                  Stop cleaning spreadsheets.
                </span>
              </h2>
              <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                You don't need another complex integration. You need clean data.
                We give you perfectly categorized, audit-ready CSV exports that
                you can import into any ledger.
              </p>
              <ul className="space-y-4">
                <li className="flex gap-4 items-start">
                  <div className="mt-1 p-1 bg-[#D0FC42]/20 rounded-full">
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
            <div className="bg-[#F7F5F2] rounded-[2.5rem] p-6 border border-zinc-100 shadow-xl">
              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-zinc-50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <button className="flex items-center gap-2 text-[10px] font-bold bg-[#121110] text-white px-3 py-1.5 rounded-lg">
                    <IconDownload className="w-3 h-3" /> Export CSV
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="grid grid-cols-3 gap-4 text-xs items-center border-b border-zinc-50 pb-2 last:border-0"
                    >
                      <div className="font-bold text-[#121110]">
                        {i === 1 ? "Shake Shack" : i === 2 ? "Uber" : "Delta"}
                      </div>
                      <div className="text-zinc-500">
                        {i === 1 ? "Meals" : "Travel"}
                      </div>
                      <div className="text-right font-mono text-zinc-600">
                        $42.50
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating File Icon */}
              <div className="mt-6 flex justify-center">
                <div className="bg-white border border-zinc-200 p-3 rounded-xl shadow-lg flex items-center gap-3">
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

      {/* FOOTER - REDESIGNED */}
      <footer className="bg-[#121110] text-white pt-24 pb-0 mt-24 rounded-t-[3rem] relative overflow-hidden">
        {/* Top CTA */}
        <div className="max-w-4xl mx-auto text-center px-6 mb-24">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
            Ready to flow?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 bg-[#FF8A65] text-white rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-[0_0_30px_-10px_rgba(255,138,101,0.5)]">
              Start Your Vault
            </button>
            <button className="px-8 py-4 bg-white/10 text-white border border-white/10 rounded-full text-lg font-bold hover:bg-white/20 transition-colors">
              Talk to Sales
            </button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="max-w-7xl mx-auto px-6 border-t border-white/10 pt-16 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center gap-2 font-bold text-xl">
                <div className="w-4 h-4 bg-[#FF8A65] rounded-full" />
                FlowState
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 bg-white/5 inline-flex px-3 py-1 rounded-full border border-white/5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                All Systems Normal
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-zinc-400">Product</h4>
              <ul className="space-y-3 text-sm font-medium text-zinc-500">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-zinc-400">Company</h4>
              <ul className="space-y-3 text-sm font-medium text-zinc-500">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-zinc-400">Legal</h4>
              <ul className="space-y-3 text-sm font-medium text-zinc-500">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Massive Watermark */}
        <div className="border-t border-white/5">
          <h1 className="text-[13vw] leading-[0.8] font-bold text-center text-[#1A1A1A] select-none pointer-events-none tracking-tighter pt-4">
            FLOWSTATE
          </h1>
        </div>
      </footer>
    </div>
  );
}
