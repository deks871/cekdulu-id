import { ReactNode } from "react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 relative overflow-hidden isolate z-10 bg-white/50 dark:bg-[#081018]/50 border border-slate-200 dark:border-white/5 rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-colors duration-300"
    >
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-4 text-slate-500 dark:text-gray-400">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-gray-400 text-sm max-w-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
