"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  ShieldCheck, 
  Link as LinkIcon, 
  MessageSquareWarning, 
  ScanText,
  CheckCircle2,
  UserX,
  Zap,
  MapPin,
  ChevronRight
} from "lucide-react";

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
      <section className="relative px-4 pt-24 pb-32 flex items-center justify-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-green/5 rounded-full blur-[100px] -z-10"></div>
        
        <motion.div 
          className="max-w-4xl mx-auto text-center z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyber-green/30 bg-cyber-green/10 mb-8">
            <ShieldCheck className="w-4 h-4 text-cyber-green" />
            <span className="text-sm text-cyber-green font-medium">Platform Deteksi Risiko Penipuan Online</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl lg:text-7xl font-outfit font-bold mb-6 tracking-tight text-white leading-tight">
            Deteksi Penipuan Digital <br className="hidden md:block" />
            dalam <span className="text-cyber-green">Hitungan Detik.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Analisis URL, chat, dan screenshot untuk membantu mengidentifikasi indikasi penipuan online sebelum Anda bertransaksi.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/dashboard"
              className="px-8 py-4 rounded-xl bg-cyber-green text-cyber-dark font-bold text-lg hover:bg-[#00e65c] transition-all flex items-center gap-2"
            >
              Mulai Analisis <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#cara-kerja"
              className="px-8 py-4 rounded-xl border border-white/10 text-white font-medium text-lg hover:bg-white/5 transition-all"
            >
              Pelajari Cara Kerja
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 bg-black/20 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-outfit text-white mb-4">Fitur Utama</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Alat komprehensif untuk melindungi Anda dari berbagai modus penipuan.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: <LinkIcon className="w-7 h-7 text-cyber-green" />,
                title: "URL Checker",
                desc: "Periksa tautan mencurigakan dan domain palsu."
              },
              {
                icon: <MessageSquareWarning className="w-7 h-7 text-cyber-green" />,
                title: "Chat Analyzer",
                desc: "Analisis pesan yang diduga mengandung unsur penipuan."
              },
              {
                icon: <ScanText className="w-7 h-7 text-cyber-green" />,
                title: "OCR Analyzer",
                desc: "Deteksi indikasi scam dari screenshot dan gambar."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-8 hover:border-cyber-green/30 transition-colors duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-cyber-green/10 flex items-center justify-center mb-6 group-hover:bg-cyber-green/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="cara-kerja" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold font-outfit text-white mb-4">Cara Kerja</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Sistem kami bekerja dalam hitungan detik untuk menganalisis risiko.</p>
          </div>

          <div className="relative">
            {/* Desktop Connector Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-green/20 to-transparent -translate-y-1/2 z-0"></div>
            
            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {[
                { step: "01", title: "Input Data", desc: "Masukkan URL, teks chat, atau unggah screenshot." },
                { step: "02", title: "Analisis Pola", desc: "Sistem mendeteksi pola yang sering digunakan scammer." },
                { step: "03", title: "Hitung Risiko", desc: "AI mengkalkulasi tingkat bahaya dari data yang diberikan." },
                { step: "04", title: "Hasil Akhir", desc: "Dapatkan laporan tingkat risiko dan rekomendasi." }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative flex flex-col items-center text-center group"
                >
                  <div className="w-16 h-16 rounded-full bg-cyber-dark border-2 border-white/10 flex items-center justify-center mb-6 group-hover:border-cyber-green/50 transition-colors z-10 relative">
                    <span className="text-xl font-bold text-cyber-green font-outfit">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                  
                  {/* Mobile Connector Arrow */}
                  {i < 3 && (
                    <div className="md:hidden mt-6 text-white/20">
                      <ChevronRight className="w-6 h-6 rotate-90" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-black/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-outfit text-white mb-4">Mengapa CekDulu.id?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Keunggulan platform kami untuk keamanan Anda.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <CheckCircle2 className="w-6 h-6 text-cyber-green" />, title: "Gratis Digunakan", desc: "Semua fitur deteksi dapat digunakan tanpa biaya." },
              { icon: <UserX className="w-6 h-6 text-cyber-green" />, title: "Tidak Perlu Login", desc: "Akses instan tanpa perlu mendaftar akun." },
              { icon: <Zap className="w-6 h-6 text-cyber-green" />, title: "Analisis Cepat", desc: "Dapatkan hasil deteksi dalam hitungan detik." },
              { icon: <MapPin className="w-6 h-6 text-cyber-green" />, title: "Fokus Scam Indonesia", desc: "Database yang dioptimalkan untuk modus lokal." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-start hover:bg-white/10 transition-colors"
              >
                <div className="mb-4 bg-cyber-green/10 p-3 rounded-lg">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-32 text-center relative px-4 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyber-green/5 rounded-[100%] blur-[120px] -z-10"></div>
        <h2 className="text-4xl font-bold text-white font-outfit mb-6">Siap Mengamankan Transaksi Anda?</h2>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">Verifikasi sekarang sebelum Anda menjadi korban penipuan berikutnya.</p>
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-cyber-green text-cyber-dark font-bold text-lg hover:bg-[#00e65c] transition-colors"
        >
          Coba Gratis Sekarang <ArrowRight className="w-5 h-5" />
        </Link>
      </section>
    </div>
  );
}
