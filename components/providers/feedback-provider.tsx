"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { AnimatePresence, motion } from "motion/react";

interface FeedbackContextType {
  triggerSuccessWave: () => void;
  trigger: (type: "success") => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(
  undefined
);

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within a FeedbackProvider");
  }
  return context;
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [showWave, setShowWave] = useState(false);

  const triggerSuccessWave = useCallback(() => {
    setShowWave(true);
    // Reset after animation
    setTimeout(() => setShowWave(false), 2000);
  }, []);

  useEffect(() => {
    const handleEvent = () => triggerSuccessWave();
    window.addEventListener("saas:success-wave", handleEvent);
    return () => window.removeEventListener("saas:success-wave", handleEvent);
  }, [triggerSuccessWave]);

  return (
    <FeedbackContext.Provider
      value={{ triggerSuccessWave, trigger: triggerSuccessWave }}
    >
      {children}
      <SuccessWave active={showWave} />
    </FeedbackContext.Provider>
  );
}

function SuccessWave({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
        >
          <motion.div
            initial={{ transform: "translateY(-100%)" }}
            animate={{ transform: "translateY(0%)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-500/20 to-transparent blur-3xl"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
