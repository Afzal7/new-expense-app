"use client";

import { useEffect, useState } from "react";

// --- Custom Icons (Chunky, Friendly Style) ---
const ArrowRight = () => (
  <svg
    width="20"
    height="20"
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

const LockIcon = () => (
  <svg
    width="24"
    height="24"
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

const SparkleIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-yellow-500"
  >
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
);

const CheckCircle = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-emerald-600"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

// --- Components ---

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#121110] font-sans selection:bg-[#FF8A65] selection:text-white overflow-x-hidden">
      {/* Texture Overlay for that "Paper/Grain" feel */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04] z-50 mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating Navigation Pill */}
      <div className="fixed top-6 left-0 right-0 flex justify-center z-40 px-4">
        <nav
          className={`
          flex items-center gap-6 px-6 py-3 rounded-full transition-all duration-300
          ${scrolled ? "bg-white/90 backdrop-blur-xl border border-zinc-200 shadow-lg" : "bg-white border border-zinc-200"}
        `}
        >
          <span className="font-bold text-lg tracking-tight flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF8A65]" />
            FlowState
          </span>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
            <a href="#vault" className="hover:text-[#FF8A65] transition-colors">
              The Vault
            </a>
            <a
              href="#features"
              className="hover:text-[#FF8A65] transition-colors"
            >
              Flow
            </a>
            <a
              href="#pricing"
              className="hover:text-[#FF8A65] transition-colors"
            >
              Pricing
            </a>
          </div>
          <button className="bg-black text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-zinc-800 transition-colors">
            Try Free
          </button>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative pt-48 pb-24 md:pt-64 md:pb-40 px-6 overflow-hidden">
        {/* Ambient background blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF8A65] opacity-[0.15] blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-medium tracking-tighter leading-[0.9] mb-8">
            Expense tools <br />
            <span className="font-serif italic text-[#FF8A65] pr-4">kill</span>
            your flow.
          </h1>
          <p className="text-xl md:text-2xl text-zinc-700 max-w-2xl mx-auto mb-12 leading-snug">
            We built a
            <span className="text-[#121110] decoration-zinc-400 underline decoration-2 underline-offset-4 mx-2">
              dopamine-driven
            </span>
            financial OS. <br className="hidden md:block" />
            Sub-100ms latency. Private by default.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button className="group relative px-8 py-4 bg-[#FF8A65] text-white rounded-full text-lg font-bold transition-transform hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,138,101,0.5)]">
              <span className="relative z-10 flex items-center gap-2">
                Start your Vault <ArrowRight />
              </span>
            </button>
          </div>
        </div>

        {/* Floating Cards UI Composition */}
        <div className="mt-24 relative h-[400px] max-w-4xl mx-auto hidden md:block">
          {/* Card 1: The Receipt (Rotated Left) */}
          <div className="absolute left-10 top-10 w-72 bg-white text-black p-6 rounded-3xl shadow-xl -rotate-6 transform hover:rotate-0 transition-transform duration-500 cursor-default z-10 border border-zinc-200">
            <div className="flex justify-between items-center mb-6">
              <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-lg">
                ☕️
              </div>
              <span className="font-mono font-bold">$14.50</span>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-20 bg-zinc-200 rounded-full" />
              <div className="h-2 w-32 bg-zinc-100 rounded-full" />
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Uploaded just now
            </div>
          </div>

          {/* Card 2: The Approval (Rotated Right) */}
          <div className="absolute right-10 top-20 w-80 bg-white border border-zinc-200 p-6 rounded-3xl shadow-xl rotate-3 transform hover:rotate-0 transition-transform duration-500 z-20 backdrop-blur-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
                M
              </div>
              <div>
                <div className="text-sm font-bold text-[#121110]">
                  Marcus (Manager)
                </div>
                <div className="text-xs text-zinc-500">Approved in 42s</div>
              </div>
            </div>
            <div className="bg-zinc-50 rounded-xl p-3 flex items-center gap-3">
              <div className="text-2xl">✈️</div>
              <div className="text-sm text-zinc-700">Flight to Bangalore</div>
            </div>
          </div>

          {/* Card 3: The Success (Center) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-64 bg-[#D0FC42] text-[#121110] p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(208,252,66,0.3)] z-30 flex flex-col items-center justify-center text-center transform hover:scale-105 transition-transform duration-300">
            <CheckCircle />
            <div className="mt-4 font-bold text-xl leading-tight">
              Reimbursed
            </div>
            <div className="text-sm opacity-60 mt-1">Funds on the way</div>
          </div>
        </div>
      </section>

      {/* The "Private Vault" Section (Bento Grid) */}
      <section id="vault" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 md:flex items-end justify-between">
            <h2 className="text-5xl md:text-7xl font-medium tracking-tighter leading-[0.9]">
              The Private <br />
              <span className="font-serif italic text-zinc-500">Vault.</span>
            </h2>
            <p className="md:max-w-sm text-zinc-700 mt-6 md:mt-0 text-lg">
              Start tracking expenses for yourself. Link to your company only
              when you are ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Large Card */}
            <div className="md:col-span-2 bg-white rounded-[2.5rem] p-10 md:p-14 border border-zinc-200 relative overflow-hidden group shadow-md">
              <div className="absolute top-0 right-0 p-10 text-zinc-300 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                <LockIcon />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 border border-zinc-200 text-sm font-bold mb-6 text-[#FF8A65]">
                  <span className="w-2 h-2 rounded-full bg-[#FF8A65]" />
                  Personal Mode
                </div>
                <h3 className="text-3xl font-bold mb-4">
                  Invisible by default.
                </h3>
                <p className="text-zinc-700 text-lg max-w-md">
                  Expenses live in your personal vault. IT and Finance can't see
                  them until you hit "Submit."
                </p>

                {/* Interactive Toggle Demo */}
                <div className="mt-12 bg-zinc-50 rounded-3xl p-6 border border-zinc-200 inline-flex items-center gap-6 shadow-inner">
                  <div className="text-right">
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      Visibility
                    </div>
                    <div className="text-emerald-600 font-bold">Only You</div>
                  </div>
                  <div className="w-16 h-10 bg-zinc-200 rounded-full p-1 relative cursor-pointer">
                    <div className="w-8 h-8 bg-white rounded-full shadow-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Tall Card */}
            <div className="bg-[#EBEBEB] text-[#121110] rounded-[2.5rem] p-10 border border-zinc-200 relative overflow-hidden flex flex-col justify-between group shadow-md">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#D0FC42] rounded-full blur-[50px] opacity-0 group-hover:opacity-60 transition-opacity duration-500" />

              <div>
                <h3 className="text-3xl font-bold mb-4 tracking-tight">
                  Reactive Linking
                </h3>
                <p className="text-zinc-600 leading-relaxed">
                  Joined a new Org? We detect your orphaned expenses and let you
                  link them in one tap.
                </p>
              </div>

              <div className="mt-10 bg-white rounded-2xl p-4 shadow-xl transform group-hover:-translate-y-2 transition-transform duration-300 border border-zinc-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                      N
                    </div>
                    <div className="text-sm font-bold">New Org Detected</div>
                  </div>
                  <button className="bg-black text-white text-xs px-3 py-1.5 rounded-full font-bold hover:bg-zinc-800 transition-colors">
                    Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* "Dopamine" Design Section */}
      <section className="py-32 px-6 bg-[#D0FC42] text-[#121110]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-6xl md:text-8xl font-medium tracking-tighter leading-[0.9] mb-8">
                Feels like <br />
                <span className="font-serif italic opacity-40">play.</span>
              </h2>
              <p className="text-xl font-medium leading-relaxed max-w-md opacity-80">
                We engineered the app to release micro-doses of dopamine. Haptic
                feedback, satisfying sounds, and animations that feel alive.
              </p>

              <div className="mt-12 grid grid-cols-2 gap-8">
                <div>
                  <div className="text-4xl font-bold mb-2">100ms</div>
                  <div className="text-sm font-bold uppercase tracking-wider opacity-60">
                    Interaction Latency
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">0</div>
                  <div className="text-sm font-bold uppercase tracking-wider opacity-60">
                    Spinners allowed
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Abstract Phone UI */}
              <div className="bg-[#121110] rounded-[3rem] p-4 text-white shadow-[0_50px_100px_-20px_rgba(18,17,16,0.3)] transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-[2.5rem] h-[500px] p-6 relative overflow-hidden border border-zinc-200 text-[#121110]">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-8 px-2">
                    <span className="font-bold">My Expenses</span>
                    <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600 text-xs">
                      +
                    </div>
                  </div>

                  {/* List */}
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl active:scale-95 transition-transform cursor-pointer border border-zinc-100"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#FF8A65] text-white flex items-center justify-center font-bold">
                            {i === 1 ? "🍔" : i === 2 ? "🚖" : "💻"}
                          </div>
                          <div>
                            <div className="font-bold text-sm">
                              Client Dinner
                            </div>
                            <div className="text-xs text-zinc-500">
                              Pending Approval
                            </div>
                          </div>
                        </div>
                        <div className="font-mono text-sm">$124.00</div>
                      </div>
                    ))}
                  </div>

                  {/* Floating Action Button */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold shadow-xl cursor-pointer hover:scale-105 transition-transform">
                    <SparkleIcon />
                    <span className="ml-2">Scan Receipt</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-zinc-200 bg-zinc-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div>
            <span className="font-bold text-2xl tracking-tight mb-4 block">
              FlowState
            </span>
            <p className="text-zinc-600 max-w-xs">
              The financial operating system designed for human psychology, not
              just accounting policy.
            </p>
          </div>
          <div className="flex flex-wrap gap-8 md:gap-16 text-sm font-bold text-zinc-700">
            <div className="flex flex-col gap-4">
              <span className="text-[#121110]">Product</span>
              <a href="#" className="hover:text-[#FF8A65]">
                Vault
              </a>
              <a href="#" className="hover:text-[#FF8A65]">
                Corporate Cards
              </a>
              <a href="#" className="hover:text-[#FF8A65]">
                Integrations
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[#121110]">Company</span>
              <a href="#" className="hover:text-[#FF8A65]">
                Manifesto
              </a>
              <a href="#" className="hover:text-[#FF8A65]">
                Careers
              </a>
              <a href="#" className="hover:text-[#FF8A65]">
                Twitter
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[#121110]">Legal</span>
              <a href="#" className="hover:text-[#FF8A65]">
                Privacy
              </a>
              <a href="#" className="hover:text-[#FF8A65]">
                Terms
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24">
          <h1 className="text-[12vw] leading-none font-bold text-[#E0DCCE] select-none pointer-events-none text-center">
            FLOWSTATE
          </h1>
        </div>
      </footer>
    </div>
  );
}
