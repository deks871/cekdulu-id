"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert, Search, FileText, ArrowRight, ShieldCheck, TrendingUp, Users } from "lucide-react";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-32 flex items-center justify-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyber-blue/10 rounded-full blur-[120px] -z-10"></div>
        
        <motion.div 
          className="max-w-4xl mx-auto text-center z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <ShieldCheck className="w-4 h-4 text-cyber-green" />
            <span className="text-sm text-gray-300">Platform Deteksi Risiko Penipuan Online</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-outfit font-bold mb-6 tracking-tight text-white leading-tight">
            Jangan Sampai <span className="text-cyber-red">Tertipu.</span> <br />
            <span className="text-gradient">CekDulu</span> Sebelum Bertransaksi.
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Analisis link mencurigakan, chat penipuan, dan bukti transfer palsu dalam hitungan detik menggunakan teknologi analisis otomatis.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/dashboard"
              className="px-8 py-4 rounded-xl bg-cyber-green text-cyber-dark font-bold text-lg hover:bg-[#00e65c] transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(0,255,102,0.4)] hover:shadow-[0_0_50px_rgba(0,255,102,0.6)]"
            >
              Cek Sekarang <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/edukasi"
              className="px-8 py-4 rounded-xl glass text-white font-medium text-lg hover:bg-white/10 transition-all"
            >
              Pelajari Modus
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 bg-black/40 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-outfit text-white mb-4">Solusi Lengkap Anti-Scam</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Kami menyediakan berbagai alat untuk memastikan keamanan digital Anda.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Search className="w-8 h-8 text-cyber-blue" />,
                title: "URL Checker",
                desc: "Deteksi link phishing dan website palsu sebelum Anda mengkliknya."
              },
              {
                icon: <ShieldAlert className="w-8 h-8 text-cyber-yellow" />,
                title: "Chat Analyzer",
                desc: "AI kami mendeteksi pola manipulasi dan penipuan dari teks chat WhatsApp Anda."
              },
              {
                icon: <FileText className="w-8 h-8 text-cyber-green" />,
                title: "Screenshot OCR",
                desc: "Upload bukti transfer atau chat. Kami ekstrak teksnya dan analisis risikonya."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="glass-card p-8 hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Mock */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyber-red/5 rounded-full blur-[100px] -z-10"></div>
        <div className="max-w-7xl mx-auto px-4">
          <div className="glass-card p-12 border-cyber-green/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyber-green"></div>
            
            <div className="grid md:grid-cols-3 gap-8 text-center divide-x divide-white/10">
              <div>
                <TrendingUp className="w-10 h-10 text-cyber-green mx-auto mb-4" />
                <div className="text-4xl font-bold text-white mb-2 font-outfit">Rp 4.5T+</div>
                <div className="text-sm text-gray-400">Kerugian Akibat Scam di 2023 (Est.)</div>
              </div>
              <div>
                <ShieldAlert className="w-10 h-10 text-cyber-red mx-auto mb-4" />
                <div className="text-4xl font-bold text-white mb-2 font-outfit">10,000+</div>
                <div className="text-sm text-gray-400">Kasus Penipuan Online Dilaporkan</div>
              </div>
              <div>
                <Users className="w-10 h-10 text-cyber-blue mx-auto mb-4" />
                <div className="text-4xl font-bold text-white mb-2 font-outfit">50,000+</div>
                <div className="text-sm text-gray-400">URL Phishing Diblokir CekDulu</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 text-center relative px-4">
        <h2 className="text-4xl font-bold text-white font-outfit mb-6">Mulai Verifikasi Keamanan Anda</h2>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">Jangan biarkan diri Anda menjadi korban berikutnya. Gunakan alat kami secara gratis.</p>
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-colors"
        >
          Coba Dashboard <ArrowRight className="w-5 h-5" />
        </Link>
      </section>
    </div>
  );
}
