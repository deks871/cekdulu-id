"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
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
  ChevronRight,
  ShieldAlert,
  ReceiptText,
  Link2,
  BrainCircuit
} from "lucide-react";

const PhoneMockup = ({ 
  wrapperClass,
  phoneClass,
  title, 
  data, 
  riskScore, 
  colorClasses, 
  textClasses, 
  listClasses, 
  issues,
  icon: Icon,
  onMouseEnter,
  onMouseLeave,
  isHovered,
  isOtherHovered
}: any) => (
  <div 
    className={`absolute transition-all duration-500 ease-out cursor-pointer ${wrapperClass} ${isHovered ? '!z-50' : ''} ${isOtherHovered ? 'opacity-40 blur-[2px]' : ''}`}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <div className={`w-[280px] h-[580px] rounded-[3rem] bg-slate-100 dark:bg-gray-900 border-2 border-slate-300 dark:border-gray-700/50 flex-shrink-0 relative transition-all duration-500 overflow-visible ${phoneClass}`}>
      {/* Side buttons */}
      <div className="absolute left-[-4px] top-[100px] w-[3px] h-[30px] bg-slate-300 dark:bg-gray-600 rounded-l-md"></div>
      <div className="absolute left-[-4px] top-[150px] w-[3px] h-[50px] bg-slate-300 dark:bg-gray-600 rounded-l-md"></div>
      <div className="absolute right-[-4px] top-[120px] w-[3px] h-[40px] bg-slate-300 dark:bg-gray-600 rounded-r-md"></div>
      
      {/* Reflection effect */}
      <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none z-30 opacity-50"></div>
      <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-bl from-cyber-green/5 via-transparent to-transparent pointer-events-none z-30"></div>

      <div className="w-full h-full bg-[#050505] rounded-[2.85rem] overflow-hidden relative border-[6px] border-slate-200 dark:border-gray-900">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-100 dark:bg-gray-900 rounded-b-2xl z-20 flex justify-center items-end pb-1.5 shadow-sm">
          <div className="w-12 h-1 bg-gray-800 rounded-full"></div>
        </div>

        {/* Screen content */}
        <div className="p-5 pt-14 h-full flex flex-col relative z-10 text-left bg-gradient-to-b from-[#0a0a0a] to-[#050505]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-cyber-green/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-cyber-green" />
            </div>
            <span className="font-outfit font-bold text-slate-900 dark:text-white text-lg tracking-wide">CekDulu</span>
          </div>
          
          <div className="text-[11px] text-slate-600 dark:text-gray-400 font-semibold mb-3 uppercase tracking-widest flex items-center gap-2">
            <Icon className="w-3.5 h-3.5" />
            {title}
          </div>
          
          <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3.5 rounded-xl mb-4 text-slate-900 dark:text-white text-sm break-words font-mono leading-relaxed shadow-inner">
            {data}
          </div>
          
          <div className={`mt-auto ${colorClasses} border p-5 rounded-2xl`}>
             <div className={`font-bold mb-4 text-lg flex items-center justify-between ${textClasses}`}>
               <span className="tracking-wide text-sm">RISIKO:</span>
               <span className="text-4xl font-outfit">{riskScore}%</span>
             </div>
             <ul className={`text-xs space-y-3 font-medium ${listClasses}`}>
               {issues.map((issue: string, i: number) => (
                 <li key={i} className="flex items-start gap-2.5">
                   <span className="mt-0.5 text-[10px]">⚠️</span>
                   <span className="leading-snug">{issue}</span>
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function Home() {
  const [hoveredPhone, setHoveredPhone] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, } },
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section id="home" className="relative px-4 pt-16 pb-24 md:pt-20 md:pb-32 lg:pt-20 lg:pb-40 flex items-center justify-center min-h-[90vh] lg:min-h-[95vh] overflow-hidden">
        {/* Ambient Glow Effects - Refined for premium look */}
        <div className="absolute top-[45%] left-[15%] -translate-y-1/2 w-[250px] md:w-[350px] h-[250px] md:h-[350px] bg-cyber-green/15 rounded-full blur-[100px] -z-10 pointer-events-none opacity-80"></div>
        <div className="absolute top-[45%] right-[15%] -translate-y-1/2 w-[300px] md:w-[450px] h-[300px] md:h-[450px] bg-cyber-green/15 rounded-full blur-[120px] -z-10 pointer-events-none opacity-80"></div>
        
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center z-10">
          
          {/* Left Content */}
          <motion.div 
            className="max-w-2xl text-left z-10 pt-0"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyber-green/50 bg-cyber-green/20 mb-6 shadow-[0_0_25px_rgba(0,230,92,0.3)] backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-cyber-green" />
              <span className="text-sm text-cyber-green font-semibold tracking-wide">Platform Deteksi Risiko Penipuan Online</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-[4.5rem] font-outfit font-bold mb-5 tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Deteksi Penipuan Digital <br className="hidden md:block" />
              dalam <span className="text-cyber-green drop-shadow-[0_0_30px_rgba(0,255,102,0.3)]">Hitungan Detik.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-600 dark:text-gray-400 mb-8 max-w-xl leading-relaxed">
              Analisis URL, percakapan, dan bukti transaksi untuk membantu mendeteksi indikasi phishing, scam, dan manipulasi digital sebelum Anda mengambil keputusan.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link 
                href="/dashboard"
                className="px-8 py-4 rounded-xl bg-cyber-green text-cyber-dark font-bold text-lg hover:bg-[#00ff66] shadow-[0_0_20px_rgba(0,230,92,0.2)] hover:shadow-[0_0_35px_rgba(0,230,92,0.5)] transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                Mulai Analisis <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <a 
                href="#cara-kerja"
                className="px-8 py-4 rounded-xl border border-white/20 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-medium text-lg hover:bg-white/10 hover:border-cyber-green/50 hover:text-cyber-green hover:shadow-[0_0_20px_rgba(0,230,92,0.15)] transition-all duration-300 backdrop-blur-sm text-center group"
              >
                Pelajari Cara Kerja
              </a>
            </motion.div>
          </motion.div>
          
          {/* Right Content - Phone Mockups */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="relative h-[500px] md:h-[600px] w-full flex items-center justify-center lg:justify-end mt-4 lg:mt-0 perspective-[1200px] lg:pr-8"
          >
            {/* Phone 2 (Left / Behind) */}
            <PhoneMockup 
              wrapperClass={`lg:right-[42%] top-[5%] lg:top-[8%] -rotate-[12deg] lg:-rotate-[14deg] scale-[0.65] sm:scale-75 md:scale-[0.85] lg:scale-90 ${hoveredPhone === 2 ? 'rotate-[0deg] scale-[0.7] sm:scale-90 lg:scale-100 -translate-y-4 md:-translate-y-8 translate-x-4 md:translate-x-8' : 'z-0 opacity-70 lg:opacity-80'}`}
              phoneClass={`shadow-2xl ${hoveredPhone === 2 ? 'shadow-[0_20px_40px_-15px_rgba(255,51,102,0.15)]' : ''}`}
              title="Chat Analyzer"
              icon={MessageSquareWarning}
              data='"Halo kak, hadiah sudah cair. Silakan transfer pajak pencairan sebesar Rp 500.000 ke rekening bendahara kami..."'
              riskScore="91"
              colorClasses="bg-red-500/10 border-red-500/30"
              textClasses="text-red-500"
              listClasses="text-red-400"
              issues={["Bahasa manipulatif", "Permintaan transfer", "Indikasi scam"]}
              onMouseEnter={() => setHoveredPhone(2)}
              onMouseLeave={() => setHoveredPhone(null)}
              isHovered={hoveredPhone === 2}
              isOtherHovered={hoveredPhone === 1}
            />
            
            {/* Phone 1 (Right / Front) */}
            <PhoneMockup 
              wrapperClass={`lg:right-[0%] top-[15%] lg:top-[12%] rotate-[6deg] lg:rotate-[8deg] scale-[0.7] sm:scale-[0.8] md:scale-[0.9] lg:scale-95 ${hoveredPhone === 1 ? 'rotate-[0deg] scale-[0.75] sm:scale-[0.9] lg:scale-100 -translate-y-2 md:-translate-y-4 -translate-x-2 md:-translate-x-4' : 'z-10'}`}
              phoneClass={`shadow-2xl ${hoveredPhone === 1 ? 'shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)]' : 'shadow-xl'}`}
              title="URL Checker"
              icon={LinkIcon}
              data="https://faceb00k-login.xyz/secure/verify"
              riskScore="82"
              colorClasses="bg-orange-500/10 border-orange-500/30"
              textClasses="text-orange-500"
              listClasses="text-orange-400"
              issues={["Typosquatting terdeteksi", "Domain mencurigakan", "Potensi phishing"]}
              onMouseEnter={() => setHoveredPhone(1)}
              onMouseLeave={() => setHoveredPhone(null)}
              isHovered={hoveredPhone === 1}
              isOtherHovered={hoveredPhone === 2}
            />
          </motion.div>

        </div>
      </section>

      {/* What We Detect */}
      <section className="py-24 bg-slate-50/80 dark:bg-black/40 border-y border-slate-200 dark:border-white/5 relative backdrop-blur-sm z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 relative">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-outfit text-slate-900 dark:text-white mb-6">Apa yang Kami Deteksi</h2>
            <p className="text-slate-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">Sistem AI kami dilatih untuk mengidentifikasi berbagai vektor serangan siber yang menargetkan pengguna di Indonesia.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <ShieldAlert className="w-7 h-7 text-cyber-green" />,
                title: "Phishing URLs",
                desc: "Deteksi tautan palsu, domain typosquatting, dan situs yang dirancang untuk mencuri data pribadi atau kredensial perbankan Anda."
              },
              {
                icon: <MessageSquareWarning className="w-7 h-7 text-cyber-green" />,
                title: "Scam Chats",
                desc: "Analisis heuristik pada pola teks pesan manipulatif berkedok undian berhadiah, lowongan kerja palsu, atau peringatan akun."
              },
              {
                icon: <ReceiptText className="w-7 h-7 text-cyber-green" />,
                title: "Bukti Transfer Palsu",
                desc: "Verifikasi integritas gambar untuk mendeteksi struk pembayaran hasil editan yang sering digunakan dalam penipuan jual-beli online."
              },
              {
                icon: <UserX className="w-7 h-7 text-cyber-green" />,
                title: "Social Engineering",
                desc: "Identifikasi taktik manipulasi psikologis, rekayasa sosial, dan urgensi palsu yang memaksa korban untuk segera bertindak."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white/[0.02] backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-2xl hover:bg-white/[0.04] hover:border-cyber-green/50 hover:shadow-[0_0_30px_rgba(0,230,92,0.1)] transition-all duration-300 flex flex-col group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-green/20 rounded-full blur-[40px] -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                <div className="w-14 h-14 rounded-xl bg-cyber-green/10 border border-cyber-green/30 flex items-center justify-center mb-6 group-hover:bg-cyber-green/20 transition-colors relative z-10">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 relative z-10">{feature.title}</h3>
                <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-sm flex-1 relative z-10">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="cara-kerja" className="py-24 relative overflow-hidden bg-slate-100/80 dark:bg-black/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold font-outfit text-slate-900 dark:text-white mb-4">Proses Analisis</h2>
            <p className="text-slate-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">Proses pemeriksaan otomatis dari awal hingga akhir.</p>
          </div>

          <div className="relative">
            {/* Desktop Connector Line */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-[1px] bg-white/10 z-0"></div>
            
            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {[
                { step: "01", title: "Input Data", desc: "Anda mengirimkan tautan (URL), teks chat, atau mengunggah screenshot gambar." },
                { step: "02", title: "Ekstraksi Informasi", desc: "Sistem membaca teks di dalam gambar atau memecah komponen dari tautan yang diberikan." },
                { step: "03", title: "Analisis Risiko", desc: "Mencari kata kunci penipuan, membandingkan dengan database kami, dan melihat pola mencurigakan." },
                { step: "04", title: "Hasil & Rekomendasi", desc: "Menghitung tingkat bahaya dan memberikan saran yang mudah dipahami tentang tindakan selanjutnya." }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative flex flex-col items-center md:items-start text-center md:text-left group"
                >
                  <div className="w-24 h-24 rounded-2xl bg-white dark:bg-cyber-dark border border-slate-200 dark:border-white/10 flex items-center justify-center mb-6 group-hover:border-cyber-green/60 group-hover:bg-cyber-green/15 group-hover:shadow-[0_0_20px_rgba(0,230,92,0.15)] transition-all z-10 relative">
                    <span className="text-3xl font-bold text-cyber-green font-outfit">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  
                  {/* Mobile Connector Arrow */}
                  {i < 3 && (
                    <div className="md:hidden mt-6 text-slate-900 dark:text-white/20">
                      <ChevronRight className="w-6 h-6 rotate-90" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Analysis Methods */}
      <section className="py-24 border-y border-slate-200 dark:border-white/5 bg-slate-50/80 dark:bg-black/40 relative backdrop-blur-sm z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 relative">
            <h2 className="text-3xl md:text-4xl font-bold font-outfit text-slate-900 dark:text-white mb-4">Metode Analisis</h2>
            <p className="text-slate-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">Teknologi pintar di balik deteksi CekDulu.id</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <ScanText className="w-8 h-8 text-cyber-green" />,
                title: "Deteksi Teks Gambar",
                desc: "Sistem dapat membaca tulisan dari foto atau screenshot yang Anda unggah. Kami otomatis mencari kata-kata manipulatif atau melihat apakah format struk pembayaran terlihat wajar."
              },
              {
                icon: <Link2 className="w-8 h-8 text-cyber-green" />,
                title: "Pemeriksaan Tautan",
                desc: "Kami memeriksa nama website untuk melihat apakah tautan tersebut meniru situs asli (seperti klikbca palsu) atau sudah dilaporkan sebagai situs berbahaya."
              },
              {
                icon: <BrainCircuit className="w-8 h-8 text-cyber-green" />,
                title: "Analisis Pola Penipuan",
                desc: "Sistem mengevaluasi gaya bahasa dan ciri khas penipuan, seperti nada mendesak, tawaran hadiah tidak masuk akal, atau permintaan transfer tiba-tiba."
              }
            ].map((method, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white/[0.02] backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 rounded-2xl hover:bg-white/[0.04] hover:border-cyber-green/50 hover:shadow-[0_0_30px_rgba(0,230,92,0.1)] transition-all duration-300 relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-green/20 rounded-full blur-[40px] -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                <div className="mb-6 bg-cyber-green/10 border border-cyber-green/30 p-4 rounded-xl inline-block group-hover:bg-cyber-green/20 transition-colors relative z-10">
                  {method.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 relative z-10">{method.title}</h3>
                <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-sm relative z-10">{method.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-slate-100/80 dark:bg-black/20 border-y border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-outfit text-slate-900 dark:text-white mb-4">Mengapa CekDulu.id?</h2>
            <p className="text-slate-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">Keunggulan platform kami untuk keamanan Anda.</p>
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
                className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 flex flex-col items-start hover:bg-white/10 hover:border-cyber-green/30 transition-all"
              >
                <div className="mb-4 bg-cyber-green/15 p-3 rounded-lg border border-cyber-green/20">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-32 text-center relative px-4 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyber-green/10 rounded-[100%] blur-[120px] -z-10"></div>
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white font-outfit mb-6">Siap Mengamankan Transaksi Anda?</h2>
        <p className="text-xl text-slate-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">Verifikasi sekarang sebelum Anda menjadi korban penipuan berikutnya.</p>
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-cyber-green text-cyber-dark font-bold text-lg hover:bg-[#00ff66] shadow-[0_0_20px_rgba(0,230,92,0.2)] hover:shadow-[0_0_35px_rgba(0,230,92,0.5)] transition-all"
        >
          Coba Gratis Sekarang <ArrowRight className="w-5 h-5" />
        </Link>
      </section>
    </div>
  );
}
