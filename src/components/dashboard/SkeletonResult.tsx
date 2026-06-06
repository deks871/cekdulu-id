import { motion } from "framer-motion";

export default function SkeletonResult() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mt-8 relative overflow-hidden isolate z-10 bg-white dark:bg-[#081018] border border-slate-200 dark:border-white/5 rounded-2xl shadow-lg"
    >
      {/* Header Skeleton */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 shrink-0"></div>
          <div className="space-y-2">
            <div className="w-32 sm:w-40 h-5 bg-slate-200 dark:bg-white/10 rounded"></div>
            <div className="w-20 h-4 bg-slate-200 dark:bg-white/10 rounded"></div>
          </div>
        </div>
        <div className="flex items-end gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
          <div className="w-16 h-10 bg-slate-200 dark:bg-white/10 rounded"></div>
          <div className="w-8 h-4 bg-slate-200 dark:bg-white/10 rounded mb-1"></div>
        </div>
      </div>
      
      {/* Body Skeleton */}
      <div className="p-6 space-y-6 animate-pulse">
        <div className="space-y-3">
          <div className="w-32 h-4 bg-slate-200 dark:bg-white/10 rounded mb-4"></div>
          <div className="w-full h-14 bg-slate-100 dark:bg-white/5 rounded-lg"></div>
          <div className="w-full h-14 bg-slate-100 dark:bg-white/5 rounded-lg"></div>
        </div>
        
        <div className="w-full h-24 bg-slate-100 dark:bg-white/5 rounded-lg mt-6"></div>
      </div>
    </motion.div>
  );
}
