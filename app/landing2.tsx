// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Zap,
} from "lucide-react";

// --- ANIMATION UTILS (Family.co Physics) ---
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// --- COMPONENTS ---

// 1. Floating Navbar
const Navbar = () => (
  <motion.nav
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
    className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4"
  >
    <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-xl shadow-ink-900/5 rounded-full px-6 py-3 flex items-center justify-between gap-12 max-w-2xl w-full">
      <div className="flex items-center gap-2 font-bold text-ink-900 tracking-tight">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
          <Zap size={18} fill="currentColor" />
        </div>
        Expense App
      </div>

      <div className="hidden md:flex gap-6 text-sm font-medium text-ink-500">
        <a href="#features" className="hover:text-ink-900 transition-colors">
          Manifesto
        </a>
        <a href="#pricing" className="hover:text-ink-900 transition-colors">
          Pricing
        </a>
      </div>

      <button className="bg-ink-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-emerald-500 transition-colors duration-300">
        Get Started
      </button>
    </div>
  </motion.nav>
);

// 2. Hero Section
const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-32 pb-20 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-100/50 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-100/50 rounded-full blur-[100px] -z-10" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="text-center max-w-4xl mx-auto z-10"
      >
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-ink-900/5 shadow-sm mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
            UX-First Expense Management
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="text-6xl md:text-8xl font-bold tracking-tighter text-ink-900 leading-[0.9] mb-8"
        >
          Spending, <br />
          <span className="text-emerald-500">Reinvented.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-xl md:text-2xl text-ink-500 max-w-2xl mx-auto leading-relaxed mb-12"
        >
          The first expense tool designed for{" "}
          <span className="text-ink-900 font-semibold">dopamine</span>, not data
          entry. Snap, tap, and feel the flow.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button className="h-14 px-8 rounded-full bg-emerald-500 text-white font-semibold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
            Start Snapping <ArrowRight size={20} />
          </button>
          <button className="h-14 px-8 rounded-full bg-white text-ink-900 border border-ink-900/10 font-semibold text-lg hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all">
            View the Vault
          </button>
        </motion.div>
      </motion.div>

      {/* 3D Floating Mockup Representation */}
      <motion.div
        initial={{ opacity: 0, y: 100, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ type: "spring", stiffness: 60, damping: 20, delay: 0.5 }}
        className="mt-24 relative w-full max-w-5xl mx-auto perspective-1000"
      >
        <div className="relative bg-white rounded-t-[3rem] border-t-8 border-x-8 border-ink-900/5 shadow-2xl overflow-hidden h-[500px] flex justify-center items-start pt-12">
          <img
            src="/api/placeholder/1200/800"
            alt="App Interface"
            className="rounded-t-2xl shadow-xl w-[90%] opacity-90"
          />
          {/* Floating Success Notification */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20 bg-white p-4 rounded-2xl shadow-xl shadow-emerald-500/10 border border-emerald-100 flex items-center gap-3 z-20"
          >
            <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="font-bold text-ink-900">Trip Approved</p>
              <p className="text-xs text-ink-500">Ready to book</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

// 3. Bento Grid Section
const BentoGrid = () => {
  return (
    <section className="py-32 px-4 max-w-7xl mx-auto" id="features">
      <div className="mb-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-ink-900 tracking-tight mb-4">
          Built for Flow State.
        </h2>
        <p className="text-xl text-ink-500">
          Everything you need, nothing to slow you down.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
        {/* Card 1: The Vault (Large) */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="md:col-span-2 bg-[#F3F0EB] rounded-4xl p-10 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-50" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Lock className="text-ink-900" size={28} />
            </div>
            <h3 className="text-3xl font-bold text-ink-900 mb-3">
              The Private Vault
            </h3>
            <p className="text-ink-500 text-lg max-w-md">
              Capture personal spend safely. We keep it logically separate until
              you're ready to link it to your Org. Zero setup bottlenecks.
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors" />
        </motion.div>

        {/* Card 2: Speed (Tall) */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-ink-900 rounded-4xl p-10 relative overflow-hidden text-white flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
              <Zap className="text-emerald-400" size={28} />
            </div>
            <h3 className="text-3xl font-bold mb-2">Speed</h3>
            <p className="text-white/60">
              From snap to submit in under 2 minutes.
            </p>
          </div>
          <div className="text-6xl font-bold tracking-tighter text-emerald-400">
            &lt;0.2s
          </div>
        </motion.div>

        {/* Card 3: Pre-Approval */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white border border-ink-900/5 rounded-4xl p-10 relative overflow-hidden"
        >
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck className="text-emerald-600" size={28} />
          </div>
          <h3 className="text-2xl font-bold text-ink-900 mb-3">Pre-Approval</h3>
          <p className="text-ink-500">
            Get the green light before you spend. No more anxiety about
            reimbursement.
          </p>
        </motion.div>

        {/* Card 4: Minimalist UI */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="md:col-span-2 bg-emerald-500 rounded-4xl p-10 relative overflow-hidden text-white flex items-center"
        >
          <div className="relative z-10 w-1/2">
            <h3 className="text-3xl font-bold mb-4">Dopamine Driven</h3>
            <p className="text-white/90 text-lg">
              Every action triggers subtle, high-fidelity feedback. Clearing
              your inbox feels like a game.
            </p>
          </div>
          {/* Abstract visual */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/10 backdrop-blur-sm mask-gradient" />
        </motion.div>
      </div>
    </section>
  );
};

// 4. Scroll Logic Section
const ScrollShowcase = () => {
  return (
    <section className="py-32 bg-white rounded-t-[4rem]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-20 items-start">
          {/* Left: Sticky Phone */}
          <div className="hidden md:block w-1/3 sticky top-32 h-[600px]">
            <div className="w-full h-full bg-[#FDFBF7] rounded-[3rem] border-8 border-ink-900 p-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-8 bg-ink-900 rounded-b-xl mx-20 z-20" />
              {/* Simulated UI */}
              <div className="mt-12 space-y-4">
                <div className="h-40 bg-white rounded-2xl shadow-sm p-4 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-12 h-12 bg-gray-100 rounded-full" />
                    <div className="w-20 h-6 bg-emerald-100 rounded-full text-center text-xs text-emerald-700 font-bold leading-6">
                      Approved
                    </div>
                  </div>
                  <div className="w-full h-4 bg-gray-100 rounded-full" />
                  <div className="w-2/3 h-4 bg-gray-100 rounded-full" />
                </div>

                <div className="h-20 bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="w-full h-3 bg-gray-100 rounded-full" />
                    <div className="w-1/2 h-3 bg-gray-100 rounded-full" />
                  </div>
                </div>
              </div>

              {/* FAB */}
              <div className="absolute bottom-8 right-8 w-16 h-16 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center text-white">
                <Camera size={28} />
              </div>
            </div>
          </div>

          {/* Right: Scrollable Content */}
          <div className="w-full md:w-2/3 space-y-40 pt-20">
            <Step
              number="01"
              title="Snap & Forget"
              desc="Just take a picture. We handle the OCR, categorization, and audit trail. It hits your Private Vault instantly."
            />
            <Step
              number="02"
              title="Reactive Linking"
              desc="Joined a new Org? We detect your orphaned drafts and link them automatically. You never lose a receipt."
            />
            <Step
              number="03"
              title="Instant Reimbursement"
              desc="Finance audits with one click. You get a push notification and the money hits your account."
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const Step = ({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6 }}
  >
    <span className="text-emerald-500 font-bold text-lg mb-2 block">
      {number}
    </span>
    <h3 className="text-5xl font-bold text-ink-900 mb-6">{title}</h3>
    <p className="text-xl text-ink-500 leading-relaxed max-w-lg">{desc}</p>
  </motion.div>
);

// 5. Footer
const Footer = () => (
  <footer className="bg-[#FDFBF7] pt-32 pb-12 px-4 overflow-hidden">
    <div className="max-w-7xl mx-auto">
      <div className="border-b border-ink-900/10 pb-12 mb-12 flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-md">
          <h4 className="font-bold text-lg mb-6">Stay Productive</h4>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-white border-none rounded-full px-6 py-3 min-w-[250px] focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <button className="bg-ink-900 text-white rounded-full px-6 py-3 font-semibold">
              Join
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-sm text-ink-500">
          <div className="flex flex-col gap-4">
            <span className="font-bold text-ink-900">Product</span>
            <a href="#">Features</a>
            <a href="#">Security</a>
            <a href="#">Pricing</a>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-bold text-ink-900">Company</span>
            <a href="#">About</a>
            <a href="#">Manifesto</a>
            <a href="#">Careers</a>
          </div>
        </div>
      </div>

      <h2 className="text-[12vw] font-bold text-ink-900/5 leading-none tracking-tighter text-center select-none pointer-events-none">
        EXPENSE APP
      </h2>

      <div className="flex justify-between items-center mt-12 text-sm text-ink-500">
        <p>© 2026 Expense App Inc.</p>
        <div className="flex gap-6">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </div>
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <main className="bg-[#FDFBF7] min-h-screen selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />
      <Hero />
      <BentoGrid />
      <ScrollShowcase />
      <Footer />
    </main>
  );
}
