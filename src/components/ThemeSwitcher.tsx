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
      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 animate-pulse" />
    );
  }

  const getIcon = () => {
    if (theme === 'system') return <Monitor className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
    if (theme === 'light') return <Sun className="w-5 h-5 text-amber-500" />;
    return <Moon className="w-5 h-5 text-cyber-green" />;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors duration-200"
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
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 mt-2 w-40 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden z-50 p-1.5 backdrop-blur-xl"
            >
              <button
                onClick={() => { setTheme('light'); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  theme === 'light' 
                    ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-medium' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-amber-500' : ''}`} /> Light
              </button>
              <button
                onClick={() => { setTheme('dark'); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-medium' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-cyber-green' : ''}`} /> Dark
              </button>
              <button
                onClick={() => { setTheme('system'); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  theme === 'system' 
                    ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-medium' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Monitor className={`w-4 h-4 ${theme === 'system' ? 'text-gray-900 dark:text-white' : ''}`} /> System
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
