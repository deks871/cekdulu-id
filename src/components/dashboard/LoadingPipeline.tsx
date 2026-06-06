import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Circle } from "lucide-react";

interface LoadingPipelineProps {
  steps: string[];
  isComplete: boolean;
  onFinish?: () => void;
}

export default function LoadingPipeline({ steps, isComplete, onFinish }: LoadingPipelineProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    // Reset when isComplete goes from true to false (new analysis)
    if (!isComplete && currentStep === steps.length) {
      setCurrentStep(0);
    }
  }, [isComplete, steps.length, currentStep]);

  useEffect(() => {
    if (isComplete) {
      // Smoothly jump to end if completed early
      setCurrentStep(steps.length);
      // Notify parent after a short delay to allow the checkmarks to appear
      const finishTimer = setTimeout(() => {
        if (onFinishRef.current) onFinishRef.current();
      }, 800);
      return () => clearTimeout(finishTimer);
    }

    // Typical loading takes around 2-3 seconds total
    const stepDuration = 2500 / Math.max(1, steps.length - 1);
    
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        // Stay on the last step until isComplete becomes true
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          return steps.length - 1;
        }
        return prev + 1;
      });
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isComplete, steps.length]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="mt-8 relative overflow-hidden isolate z-10 bg-white dark:bg-[#081018] border border-slate-200 dark:border-[rgba(255,255,255,0.08)] rounded-2xl p-6 md:p-8 transition-colors duration-300 shadow-lg"
    >
      <div className="space-y-5 max-w-md mx-auto">
        {steps.map((step, index) => {
          const isActive = index === currentStep && !isComplete;
          const isDone = index < currentStep || isComplete;
          const isPending = index > currentStep && !isComplete;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-center gap-4"
            >
              <div className="shrink-0 flex items-center justify-center w-6 h-6">
                {isDone ? (
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <CheckCircle2 className="w-5 h-5 text-cyber-green" />
                  </motion.div>
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-cyber-green animate-spin" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 dark:text-gray-700" />
                )}
              </div>
              <span
                className={`text-sm md:text-base transition-colors duration-300 ${
                  isDone
                    ? "text-slate-600 dark:text-gray-400 font-normal"
                    : isActive
                    ? "text-slate-900 dark:text-white font-semibold"
                    : "text-slate-400 dark:text-gray-600 font-normal"
                }`}
              >
                {step}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
