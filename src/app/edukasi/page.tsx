"use client";

import { motion } from "framer-motion";
import { AlertCircle, CreditCard, Gift, Link as LinkIcon, PhoneCall } from "lucide-react";

export default function Edukasi() {
  const scams = [
    {
      icon: <PhoneCall className="w-10 h-10 text-cyber-yellow" />,
      title: "Telepon / Chat CS Palsu",
      desc: "Penipu menyamar sebagai Customer Service bank atau e-wallet ternama. Mereka biasanya menelepon dengan nada panik atau menawarkan upgrade layanan, lalu meminta OTP, PIN, atau password Anda.",
      tips: "Bank resmi tidak pernah meminta PIN, Password, atau kode OTP melalui telepon atau WhatsApp. Selalu hubungi nomor resmi yang tertera di belakang kartu atau website resmi."
    },
    {
      icon: <Gift className="w-10 h-10 text-cyber-green" />,
      title: "Undian & Hadiah Palsu",
      desc: "Modus di mana Anda diberitahu memenangkan undian ratusan juta rupiah atau mobil. Syaratnya: Anda harus mentransfer 'uang pajak' atau 'biaya administrasi' terlebih dahulu.",
      tips: "Jika Anda menang undian resmi, penyelenggara akan menanggung biaya pajak dari hadiah tersebut, atau memotong langsung, bukan meminta transfer di awal."
    },
    {
      icon: <LinkIcon className="w-10 h-10 text-cyber-blue" />,
      title: "Phishing (Link Berbahaya)",
      desc: "Link undangan pernikahan digital (.APK), resi paket, atau peringatan blokir akun yang dikirim via SMS/WA. Saat diklik atau di-install, aplikasi tersebut akan mencuri SMS OTP Anda.",
      tips: "Jangan pernah meng-install file berekstensi .APK dari sumber yang tidak dikenal (selain Play Store). Selalu periksa ekstensi file dan nama domain link dengan CekDulu."
    },
    {
      icon: <CreditCard className="w-10 h-10 text-cyber-red" />,
      title: "Investasi Bodong",
      desc: "Menjanjikan keuntungan yang sangat tinggi dan pasti dalam waktu singkat (contoh: titip dana trading kripto profit 50% seminggu). Awalnya bisa ditarik, lalu uang Anda akan dibawa kabur.",
      tips: "Gunakan logika: Jika keuntungan semudah itu, mereka tidak perlu mencari dana tambahan. Pastikan platform investasi terdaftar di OJK."
    }
  ];

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold font-outfit text-white mb-4">Edukasi <span className="text-cyber-green">Anti-Scam</span></h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Mengenali ciri-ciri penipuan adalah pertahanan terbaik. Berikut adalah modus-modus penipuan online yang paling sering terjadi di Indonesia saat ini.</p>
        </div>

        <div className="grid gap-8">
          {scams.map((scam, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 md:p-8 flex flex-col md:flex-row gap-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-glass-border"></div>
              
              <div className="shrink-0 p-4 rounded-xl bg-black/40 h-min">
                {scam.icon}
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">{scam.title}</h3>
                <p className="text-gray-300 leading-relaxed mb-4">{scam.desc}</p>
                <div className="bg-cyber-blue/10 border border-cyber-blue/20 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-6 h-6 text-cyber-blue shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-sm font-bold text-cyber-blue mb-1">TIPS PENCEGAHAN:</span>
                    <p className="text-sm text-gray-300">{scam.tips}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
