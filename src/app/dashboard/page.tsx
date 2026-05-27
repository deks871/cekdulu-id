"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Search, FileText } from "lucide-react";
import UrlChecker from "@/components/dashboard/UrlChecker";
import ChatAnalyzer from "@/components/dashboard/ChatAnalyzer";
import OcrAnalyzer from "@/components/dashboard/OcrAnalyzer";
import { cn } from "@/lib/utils";

type Tab = "chat" | "url" | "ocr";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  const tabs = [
    { id: "chat" as Tab, label: "Chat Analyzer", icon: <ShieldAlert className="w-5 h-5" /> },
    { id: "url" as Tab, label: "URL Checker", icon: <Search className="w-5 h-5" /> },
    { id: "ocr" as Tab, label: "Screenshot OCR", icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen py-12 px-4 relative">
      <div className="absolute top-20 left-20 w-[400px] h-[400px] bg-cyber-green/5 rounded-full blur-[100px] -z-10"></div>
      
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold font-outfit text-white mb-4">Dashboard <span className="text-cyber-green">Analisis</span></h1>
          <p className="text-gray-400">Pilih alat yang Anda butuhkan untuk memverifikasi keamanan transaksi atau pesan.</p>
        </motion.div>

        <div className="glass-card overflow-hidden">
          {/* Tabs Navigation */}
          <div className="flex flex-col sm:flex-row border-b border-glass-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-colors relative",
                  activeTab === tab.id 
                    ? "text-white bg-white/5" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-green"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8 min-h-[400px]">
            {activeTab === "chat" && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <ChatAnalyzer />
              </motion.div>
            )}
            
            {activeTab === "url" && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <UrlChecker />
              </motion.div>
            )}
            
            {activeTab === "ocr" && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <OcrAnalyzer />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
