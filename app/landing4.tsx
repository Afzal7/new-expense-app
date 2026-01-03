"use client";

import { useEffect, useState } from "react";

// --- Icons ---
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

const Check = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-white"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const StarIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-[#FF8A65]"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
    <div className="min-h-screen bg-[#F7F5F2] text-[#121110] font-sans selection:bg-[#D0FC42] selection:text-[#121110] overflow-x-hidden">
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
          flex items-center gap-2 md:gap-6 px-4 md:px-6 py-3 rounded-full transition-all duration-300
          ${scrolled ? "bg-white/90 backdrop-blur-xl border border-zinc-200 shadow-xl" : "bg-white border border-zinc-200"}
        `}
        >
          <span className="font-bold text-lg tracking-tight flex items-center gap-2 mr-4">
            <div className="w-3 h-3 rounded-full bg-[#FF8A65]" />
            FlowState
          </span>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
            <a
              href="#employees"
              className="hover:text-[#FF8A65] transition-colors"
            >
              For Teams
            </a>
            <a
              href="#managers"
              className="hover:text-[#FF8A65] transition-colors"
            >
              For Managers
            </a>
            <a
              href="#finance"
              className="hover:text-[#FF8A65] transition-colors"
            >
              For Finance
            </a>
          </div>
          <button className="bg-[#121110] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-zinc-800 transition-colors ml-2">
            Get Started
          </button>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-zinc-200 text-sm font-medium mb-8 shadow-sm">
            <StarIcon />
            <span className="text-zinc-600">
              The new standard for modern teams
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-medium tracking-tighter leading-[0.95] mb-8 text-[#121110]">
            Don't let expenses <br />
            <span className="font-serif italic text-[#FF8A65]">
              slow you down.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-600 max-w-2xl mx-auto mb-12 leading-snug">
            The financial OS that treats your employees like adults, your
            accountants like pros, and your data like gold.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-[#FF8A65] text-white rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-[0_10px_40px_-10px_rgba(255,138,101,0.5)] flex items-center justify-center gap-2">
              Start Free Now <ArrowRight />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white border border-zinc-200 text-[#121110] rounded-full text-lg font-bold hover:bg-zinc-50 transition-colors">
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-8">
            Powering high-growth teams at
          </p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all">
            {["Acme Inc", "Loom", "Vercel", "Linear", "Raycast"].map((logo) => (
              <span
                key={logo}
                className="text-2xl font-serif font-bold text-[#121110]"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE PROP 1: FOR EMPLOYEES */}
      <section id="employees" className="py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              {/* Visual: The Receipt Stack */}
              <div className="relative w-full max-w-md mx-auto aspect-square">
                <div className="absolute inset-0 bg-[#E0E0E0] rounded-[3rem] rotate-6 transform translate-y-4"></div>
                <div className="absolute inset-0 bg-[#EBEBEB] rounded-[3rem] -rotate-3 transform translate-y-2"></div>
                <div className="absolute inset-0 bg-white border border-zinc-100 rounded-[3rem] shadow-2xl p-8 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-4xl">🧾</div>
                      <div className="font-bold text-lg mt-2">Client Lunch</div>
                      <div className="text-zinc-500 text-sm">
                        Shake Shack, NYC
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xl font-bold">$42.50</div>
                      <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full mt-1">
                        Auto-Categorized
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-[#D0FC42] animate-pulse"></div>
                    </div>
                    <button className="w-full py-3 bg-[#121110] text-white rounded-xl font-bold text-sm">
                      Submitted in 3s
                    </button>
                  </div>
                </div>
                {/* Floating Badge */}
                <div className="absolute -right-6 top-12 bg-[#D0FC42] text-[#121110] px-4 py-2 rounded-full font-bold text-sm shadow-lg rotate-12">
                  No manual entry!
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-bold uppercase tracking-wide mb-6">
                For Employees
              </div>
              <h2 className="text-5xl md:text-6xl font-medium tracking-tight mb-6 leading-[1]">
                Snap, tap, <br />
                <span className="text-zinc-400">done.</span>
              </h2>
              <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                Whether you are traveling for sales or buying software from your
                desk, FlowState removes the friction. We use AI to read receipts
                instantly so you never have to type a merchant name again.
              </p>
              <ul className="space-y-4">
                {[
                  "Zero-wait interface (Sub-100ms)",
                  "Automatic receipt scanning (OCR)",
                  "Personal Vault: Drafts are private until submitted",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-[#121110] font-medium"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#FF8A65] flex items-center justify-center">
                      <Check />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROP 2: FOR MANAGERS (Darker Contrast Section) */}
      <section
        id="managers"
        className="py-32 px-6 bg-[#121110] text-[#F7F5F2] rounded-[3rem] mx-2 md:mx-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wide mb-6">
                For Managers
              </div>
              <h2 className="text-5xl md:text-6xl font-medium tracking-tight mb-6 leading-[1]">
                Approve in <br />
                <span className="text-[#D0FC42]">seconds</span>, not days.
              </h2>
              <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                Stop being the bottleneck. Review expenses in a high-density
                mobile feed designed for "Inbox Zero." We flag policy violations
                automatically so you can approve with confidence.
              </p>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <div className="text-3xl font-bold mb-2">90%</div>
                  <div className="text-sm text-zinc-400">
                    Reduction in approval time
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <div className="text-3xl font-bold mb-2">100%</div>
                  <div className="text-sm text-zinc-400">Policy compliance</div>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Visual: Approval Feed */}
              <div className="bg-[#1C1C1A] rounded-3xl p-6 border border-white/10 max-w-sm mx-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                  <span className="font-bold text-sm">Needs Approval (3)</span>
                  <span className="text-xs text-zinc-500">Select All</span>
                </div>

                {/* Request Item */}
                <div className="space-y-3">
                  <div className="bg-[#2C2C2A] p-4 rounded-xl flex gap-4 items-start relative overflow-hidden group">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">
                      JS
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-sm">John Smith</span>
                        <span className="font-mono text-sm">$1,200.00</span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        Flight to London • British Airways
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 bg-[#D0FC42] text-black text-xs font-bold py-2 rounded-lg hover:bg-white transition-colors">
                          Approve
                        </button>
                        <button className="px-3 bg-white/10 rounded-lg text-xs font-bold">
                          Details
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#2C2C2A] p-4 rounded-xl flex gap-4 items-center opacity-50">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold text-sm">
                      AL
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-sm">Ana Lee</span>
                        <span className="font-mono text-sm">$45.00</span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        Team Dinner
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROP 3: FOR FINANCE & FOUNDERS */}
      <section id="finance" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-5xl md:text-6xl font-medium tracking-tight mb-6">
              The Controller's{" "}
              <span className="font-serif italic text-[#FF8A65]">dream.</span>
            </h2>
            <p className="text-xl text-zinc-600">
              Close the books faster with real-time syncing and automated audit
              trails. Give founders visibility without the micromanagement.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl mb-6">
                📊
              </div>
              <h3 className="text-2xl font-bold mb-3">Real-Time Sync</h3>
              <p className="text-zinc-500 leading-relaxed">
                Direct integrations with QuickBooks, Xero, and NetSuite.
                Expenses are coded and pushed the moment they are approved.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#D0FC42] rounded-bl-full opacity-20"></div>
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-2xl mb-6">
                🛡️
              </div>
              <h3 className="text-2xl font-bold mb-3">Audit-Ready</h3>
              <p className="text-zinc-500 leading-relaxed">
                Every action is logged. From the moment a receipt is snapped to
                the final reimbursement, you have a complete digital paper
                trail.
              </p>
            </div>

            {/* Card 3 (The Private Vault Pitch) */}
            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm hover:shadow-xl transition-shadow border-l-4 border-l-[#FF8A65]">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl mb-6">
                🔒
              </div>
              <h3 className="text-2xl font-bold mb-3">The Private Vault</h3>
              <p className="text-zinc-500 leading-relaxed">
                Let employees start tracking immediately without waiting for IT
                invites. They track privately, then link to the Org when ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-[#D0FC42] rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-20 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2"></div>

          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-medium tracking-tight mb-8 text-[#121110]">
              Ready to fix expenses?
            </h2>
            <p className="text-xl md:text-2xl font-medium opacity-80 mb-12 max-w-2xl mx-auto">
              Join the teams that have switched from spreadsheets and legacy
              tools to the flow state.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto px-10 py-5 bg-[#121110] text-white rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-2xl">
                Get Started for Free
              </button>
              <button className="w-full sm:w-auto px-10 py-5 bg-white/50 border border-black/5 text-[#121110] rounded-full text-lg font-bold hover:bg-white transition-colors">
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 bg-white border-t border-zinc-200">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-sm">
          <div className="col-span-2 md:col-span-1">
            <span className="font-bold text-xl tracking-tight mb-4 block flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#FF8A65]" /> FlowState
            </span>
            <p className="text-zinc-500 mt-4">
              New York, NY <br />© 2024 FlowState Financial
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-3 text-zinc-500">
              <li>
                <a href="#" className="hover:text-black">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  The Private Vault
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Integrations
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Resources</h4>
            <ul className="space-y-3 text-zinc-500">
              <li>
                <a href="#" className="hover:text-black">
                  Manifesto
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  ROI Calculator
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Help Center
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-3 text-zinc-500">
              <li>
                <a href="#" className="hover:text-black">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
