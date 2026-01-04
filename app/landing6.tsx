// @ts-nocheck
"use client";

import { Check, Zap } from "lucide-react";
import { useEffect, useState } from "react";

// --- Custom High-Fidelity Icons ---
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
const IconBuilding = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M8 10h.01" />
    <path d="M16 10h.01" />
    <path d="M8 14h.01" />
    <path d="M16 14h.01" />
  </svg>
);
const IconScan = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
  </svg>
);

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [vaultMode, setVaultMode] = useState("business"); // 'personal' or 'business'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#1A1512] font-sans selection:bg-[#FF5A36] selection:text-white overflow-x-hidden">
      {/* Premium Noise Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b ${scrolled ? "bg-white/90 backdrop-blur-md border-black/5" : "bg-transparent border-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#FF5A36] rounded-md rotate-3 shadow-sm" />
            <span className="font-bold text-xl tracking-tight text-[#1A1512]">
              FlowState
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-[#1A1512]/60">
            <a href="#vault" className="hover:text-[#FF5A36] transition-colors">
              The Vault
            </a>
            <a
              href="#solutions"
              className="hover:text-[#FF5A36] transition-colors"
            >
              Solutions
            </a>
            <a
              href="#pricing"
              className="hover:text-[#FF5A36] transition-colors"
            >
              Pricing
            </a>
          </div>
          <button className="bg-[#1A1512] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:scale-105 transition-transform shadow-lg">
            Start Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Hero Copy */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C3F53C]/20 border border-[#C3F53C] text-xs font-bold text-[#1A1512] mb-8">
              <span className="w-2 h-2 rounded-full bg-[#9ACD32] animate-pulse" />
              SOC2 Type II Certified
            </div>

            <h1 className="text-6xl lg:text-8xl font-medium tracking-tighter leading-[0.95] mb-8 text-[#1A1512]">
              The zero-click <br />
              <span className="font-serif italic text-[#FF5A36]">
                expense report.
              </span>
            </h1>

            <p className="text-xl text-[#1A1512]/70 mb-10 leading-relaxed max-w-lg">
              We built an AI that reads receipts faster than you can type. Snap
              a photo, pocket your phone, and let FlowState handle the
              accounting.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="h-14 px-8 bg-[#FF5A36] text-white rounded-2xl text-lg font-bold hover:translate-y-[-2px] transition-transform shadow-[4px_4px_0px_#1A1512] border-2 border-[#1A1512] flex items-center justify-center gap-2">
                Get Started <IconArrowRight className="w-5 h-5" />
              </button>
              <button className="h-14 px-8 bg-white text-[#1A1512] rounded-2xl text-lg font-bold hover:bg-[#F5F5F0] transition-colors border-2 border-[#1A1512]/10">
                View Pricing
              </button>
            </div>
          </div>

          {/* Hero Visual: The "Magic" Moment */}
          <div className="relative h-[600px] w-full flex items-center justify-center">
            {/* Abstract Background Blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF5A36]/5 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#C3F53C]/10 rounded-full blur-[80px]" />

            {/* Phone Frame */}
            <div className="relative w-[320px] h-[580px] bg-[#1A1512] rounded-[3rem] p-4 shadow-2xl border-[6px] border-[#1A1512] z-10 rotate-[-2deg]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1A1512] rounded-b-2xl z-20" />

              {/* Screen Content */}
              <div className="w-full h-full bg-zinc-900 rounded-[2.2rem] overflow-hidden relative">
                {/* Camera Feed Simulation */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center opacity-60 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                {/* OCR Scanning Overlay (CSS Animation) */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-[#C3F53C] rounded-lg shadow-[0_0_20px_rgba(195,245,60,0.3)]">
                  {/* Scanning Line */}
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-[#C3F53C] animate-[scan_2s_ease-in-out_infinite]" />
                  {/* Detected Text Tags */}
                  <div className="absolute -top-3 left-2 bg-[#C3F53C] text-black text-[10px] font-bold px-1 rounded">
                    MERCHANT
                  </div>
                  <div className="absolute -bottom-3 right-2 bg-[#C3F53C] text-black text-[10px] font-bold px-1 rounded">
                    TOTAL
                  </div>
                </div>

                {/* Extracted Data Card (Pop up) */}
                <div className="absolute bottom-6 left-4 right-4 bg-white rounded-2xl p-4 shadow-lg animate-[slideUp_1s_ease-out_forwards] delay-1000 transform translate-y-20 opacity-0 fill-mode-forwards">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-xs font-bold text-zinc-400 uppercase">
                        Recognized
                      </div>
                      <div className="text-lg font-bold text-[#1A1512]">
                        Shake Shack
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-[#C3F53C] rounded-full flex items-center justify-center text-[#1A1512]">
                      <IconCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                      <div className="text-[10px] text-zinc-400 font-bold">
                        DATE
                      </div>
                      <div className="text-sm font-bold">Today</div>
                    </div>
                    <div className="flex-1 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                      <div className="text-[10px] text-zinc-400 font-bold">
                        TOTAL
                      </div>
                      <div className="text-sm font-bold">$24.50</div>
                    </div>
                  </div>
                  <button className="w-full mt-3 bg-[#1A1512] text-white text-xs font-bold py-3 rounded-xl">
                    Submit Expense
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-10 border-y border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {["Linear", "Ramp", "Vercel", "Notion", "Intercom"].map((logo) => (
            <span
              key={logo}
              className="text-xl md:text-2xl font-bold font-serif text-[#1A1512]"
            >
              {logo}
            </span>
          ))}
        </div>
      </section>

      {/* FEATURE: THE VAULT (Privacy Firewall) */}
      <section id="vault" className="py-24 px-6 bg-[#FDFCF8]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Interactive Phone UI */}
            <div className="relative flex justify-center">
              <div className="w-[360px] h-[640px] bg-white rounded-[3rem] border-4 border-zinc-100 shadow-2xl relative overflow-hidden transition-colors duration-500">
                {/* Header */}
                <div
                  className={`p-8 pt-12 pb-6 flex justify-between items-end transition-colors duration-500 ${vaultMode === "business" ? "bg-[#1A1512] text-white" : "bg-[#FF5A36] text-white"}`}
                >
                  <div>
                    <h3 className="text-2xl font-bold">
                      {vaultMode === "business" ? "Acme Corp" : "My Vault"}
                    </h3>
                    <p className="text-xs opacity-80 font-medium tracking-wide uppercase mt-1">
                      {vaultMode === "business"
                        ? "Connected"
                        : "Local Storage Only"}
                    </p>
                  </div>
                  {/* The Toggle Switch */}
                  <div
                    onClick={() =>
                      setVaultMode(
                        vaultMode === "business" ? "personal" : "business"
                      )
                    }
                    className="bg-white/20 p-1 rounded-full flex gap-2 cursor-pointer backdrop-blur-sm border border-white/20"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${vaultMode === "personal" ? "bg-white text-[#FF5A36]" : "text-white/50"}`}
                    >
                      <IconLock className="w-4 h-4" />
                    </div>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${vaultMode === "business" ? "bg-[#C3F53C] text-[#1A1512]" : "text-white/50"}`}
                    >
                      <IconBuilding className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Content List */}
                <div className="p-4 space-y-3">
                  {vaultMode === "business" ? (
                    <>
                      <div className="bg-[#F7F7F5] p-4 rounded-2xl flex items-center justify-between animate-fade-in-up">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white border border-black/5 rounded-full flex items-center justify-center text-lg shadow-sm">
                            ✈️
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[#1A1512]">
                              United Airlines
                            </div>
                            <div className="text-xs text-[#1A1512]/50">
                              Approved
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">$450.00</div>
                          <div className="text-[10px] text-[#1A1512]/40">
                            Synced
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#F7F7F5] p-4 rounded-2xl flex items-center justify-between animate-fade-in-up delay-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white border border-black/5 rounded-full flex items-center justify-center text-lg shadow-sm">
                            🏨
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[#1A1512]">
                              Marriott
                            </div>
                            <div className="text-xs text-[#1A1512]/50">
                              Pending Manager
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">$210.50</div>
                          <div className="text-[10px] text-[#FF5A36]">
                            Reviewing
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white border border-black/5 p-4 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in-up">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#FFF0EB] rounded-full flex items-center justify-center text-lg">
                            🛒
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[#1A1512]">
                              Whole Foods
                            </div>
                            <div className="text-xs text-[#1A1512]/50">
                              Groceries
                            </div>
                          </div>
                        </div>
                        <div className="font-bold text-sm">$84.20</div>
                      </div>
                      <div className="bg-white border border-black/5 p-4 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in-up delay-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#FFF0EB] rounded-full flex items-center justify-center text-lg">
                            📺
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[#1A1512]">
                              Netflix
                            </div>
                            <div className="text-xs text-[#1A1512]/50">
                              Subscription
                            </div>
                          </div>
                        </div>
                        <div className="font-bold text-sm">$15.99</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Copy Side */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5A36]/10 text-[#FF5A36] text-xs font-bold uppercase tracking-wide mb-6">
                The Privacy Firewall
              </div>
              <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 leading-tight text-[#1A1512]">
                One app. <br /> Two worlds.
              </h2>
              <p className="text-lg text-[#1A1512]/70 mb-8 leading-relaxed">
                Employees hate expense apps because they feel spied on.
                <br />
                <br />
                We fixed it. The <strong>Personal Vault</strong> gives every
                employee a private sandbox. They can track personal budgets
                alongside work expenses. Data is physically separated on-device.
                You only see what they explicitly submit.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#C3F53C] flex items-center justify-center border border-black/5">
                    <IconCheck className="w-5 h-5 text-[#1A1512]" />
                  </div>
                  <span className="font-bold text-[#1A1512]">
                    Permissionless Onboarding
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#C3F53C] flex items-center justify-center border border-black/5">
                    <IconCheck className="w-5 h-5 text-[#1A1512]" />
                  </div>
                  <span className="font-bold text-[#1A1512]">
                    Higher Compliance Rates
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLE-BASED VALUE PROPS (Bento Grid) */}
      <section
        id="solutions"
        className="py-24 px-6 bg-[#1A1512] text-white rounded-[3rem] mx-2 md:mx-6 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">
              Built for the whole team.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 1. EMPLOYEE */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden group">
              <div className="w-12 h-12 bg-[#FF5A36] rounded-2xl flex items-center justify-center mb-6 rotate-[-3deg] group-hover:rotate-0 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">For Employees</h3>
              <p className="text-white/60 mb-8">
                "I just snap the photo and throw the phone away. The AI handles
                the categorization."
              </p>
              <div className="mt-auto h-32 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                <div className="text-xs font-mono text-[#FF5A36] bg-[#FF5A36]/10 px-2 py-1 rounded">
                  OCR_ACTIVE: 98ms
                </div>
              </div>
            </div>

            {/* 2. MANAGER */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 rotate-[2deg] group-hover:rotate-0 transition-transform">
                <Check className="w-6 h-6 text-[#1A1512]" />
              </div>
              <h3 className="text-2xl font-bold mb-3">For Managers</h3>
              <p className="text-white/60 mb-8">
                "I can see the Calendar event linked to the dinner. Context
                means I approve faster."
              </p>
              <div className="mt-auto space-y-2">
                <div className="flex gap-2">
                  <div className="h-2 w-full bg-[#C3F53C] rounded-full opacity-80"></div>
                  <div className="h-2 w-1/4 bg-red-500 rounded-full"></div>
                </div>
                <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500">
                  <span>Safe</span>
                  <span>Risk</span>
                </div>
              </div>
            </div>

            {/* 3. FINANCE */}
            <div className="md:col-span-2 lg:col-span-1 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden group">
              <div className="w-12 h-12 bg-[#C3F53C] rounded-2xl flex items-center justify-center mb-6 rotate-[-1deg] group-hover:rotate-0 transition-transform">
                <IconBuilding className="w-6 h-6 text-[#1A1512]" />
              </div>
              <h3 className="text-2xl font-bold mb-3">For Finance</h3>
              <p className="text-white/60 mb-8">
                "The continuous close is real. Data hits NetSuite the moment
                it's approved."
              </p>
              <div className="mt-auto flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1A1512] border border-white/20 flex items-center justify-center text-[10px] font-bold">
                  APP
                </div>
                <div className="flex-1 h-0.5 bg-white/20 relative">
                  <div className="absolute inset-0 bg-[#C3F53C] w-1/2 animate-pulse"></div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white text-[#1A1512] flex items-center justify-center text-[10px] font-bold">
                  ERP
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-medium tracking-tight mb-8 text-[#1A1512]">
            Stop fighting with <br />
            <span className="text-zinc-400">legacy software.</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-10 py-5 bg-[#FF5A36] text-white rounded-2xl text-lg font-bold hover:translate-y-[-2px] transition-transform shadow-[4px_4px_0px_#1A1512] border-2 border-[#1A1512]">
              Start Free Trial
            </button>
            <button className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-[#1A1512]/10 text-[#1A1512] rounded-2xl text-lg font-bold hover:bg-[#F5F5F0] transition-colors">
              Talk to Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-black/5 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div>
            <span className="font-bold text-2xl tracking-tight mb-4 block text-[#1A1512]">
              FlowState
            </span>
            <p className="text-[#1A1512]/50 text-sm max-w-xs">
              Designed in New York. <br />© 2026 FlowState Financial Inc.
            </p>
          </div>
          <div className="flex flex-wrap gap-8 md:gap-16 text-sm font-bold text-[#1A1512]/70">
            <div className="flex flex-col gap-4">
              <span className="text-[#1A1512]">Product</span>
              <a href="#" className="hover:text-[#FF5A36]">
                Vault
              </a>
              <a href="#" className="hover:text-[#FF5A36]">
                Cards
              </a>
              <a href="#" className="hover:text-[#FF5A36]">
                Pricing
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[#1A1512]">Company</span>
              <a href="#" className="hover:text-[#FF5A36]">
                Manifesto
              </a>
              <a href="#" className="hover:text-[#FF5A36]">
                Careers
              </a>
              <a href="#" className="hover:text-[#FF5A36]">
                Legal
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes scan {
          0% {
            top: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
        @keyframes slideUp {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
