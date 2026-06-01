"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Cek Scammer", href: "/dashboard" },
    { name: "Edukasi", href: "/edukasi" },
    { name: "Tentang", href: "/tentang" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === "/" && pathname === "/") {
      e.preventDefault();
      if (window.scrollY > 0) {
        document.getElementById("home")?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const menuVariants = {
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05,
      staggerDirection: -1,
    }
  },
  open: {
    height: "auto",
    opacity: 1,
    transition: {
      duration: 0.35,
      staggerChildren: 0.08,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  closed: {
    opacity: 0,
    y: -15,
    transition: {
      duration: 0.2
    }
  },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link href="/" onClick={(e) => handleNavClick(e, "/")} className="flex items-center gap-3">
              <div className="bg-cyber-green/10 p-2 rounded-xl">
                <ShieldCheck className="h-7 w-7 text-cyber-green" />
              </div>
              <span className="font-outfit font-bold text-2xl tracking-wide text-white">
                CekDulu<span className="text-cyber-green">.id</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300",
                    pathname === link.href
                      ? "text-cyber-green bg-cyber-green/10 shadow-[0_0_15px_rgba(0,255,102,0.1)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none p-2 bg-white/5 rounded-xl border border-white/10 relative w-10 h-10 flex items-center justify-center overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="absolute"
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="absolute"
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="md:hidden glass border-b border-glass-border overflow-hidden origin-top"
          >
            <div className="px-4 pt-4 pb-6 space-y-2 sm:px-6">
              {navLinks.map((link) => (
                <motion.div key={link.name} variants={itemVariants}>
                  <Link
                    href={link.href}
                    onClick={(e) => {
                      setIsOpen(false);
                      handleNavClick(e, link.href);
                    }}
                    className={cn(
                      "block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300",
                      pathname === link.href
                        ? "text-cyber-green bg-cyber-green/10 shadow-[0_0_15px_rgba(0,255,102,0.1)] border border-cyber-green/20"
                        : "text-gray-300 hover:text-white hover:bg-white/10 border border-transparent"
                    )}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
