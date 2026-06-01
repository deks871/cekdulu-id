"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 animate-pulse" />
    );
  }

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  const getIcon = () => {
    if (theme === 'system') return <Monitor className="w-5 h-5 text-slate-500 dark:text-slate-400" />;
    if (theme === 'light') return <Sun className="w-5 h-5 text-amber-500" />;
    return <Moon className="w-5 h-5 text-cyber-green" />;
  };

  const getLabel = () => {
    if (theme === 'system') return 'System';
    if (theme === 'light') return 'Light';
    return 'Dark';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={theme}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {getIcon()}
          </motion.div>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50 p-1"
            >
              <button
                onClick={() => { setTheme('light'); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  theme === 'light' 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Sun className="w-4 h-4" /> Light
              </button>
              <button
                onClick={() => { setTheme('dark'); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Moon className="w-4 h-4" /> Dark
              </button>
              <button
                onClick={() => { setTheme('system'); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  theme === 'system' 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Monitor className="w-4 h-4" /> System
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
