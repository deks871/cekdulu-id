import { ShieldCheck } from "lucide-react";

export default function Tentang() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto glass-card p-8 md:p-12">
        <div className="flex justify-center mb-8">
          <ShieldCheck className="w-20 h-20 text-cyber-green" />
        </div>
        
        <h1 className="text-4xl font-bold font-outfit text-white text-center mb-8">Tentang <span className="text-cyber-green">CekDulu.id</span></h1>
        
        <div className="space-y-6 text-gray-300 leading-relaxed text-lg">
          <p>
            <strong className="text-white">CekDulu.id</strong> didirikan dengan satu misi sederhana: mengurangi angka korban penipuan digital di Indonesia yang terus meningkat setiap tahunnya.
          </p>
          <p>
            Dengan semakin canggihnya modus operandi para scammer—mulai dari undangan pernikahan palsu (APK) hingga penyamaran sebagai customer service bank—masyarakat sering kali menjadi korban sebelum mereka menyadari adanya bahaya.
          </p>
          <p>
            Platform MVP (Minimum Viable Product) ini kami rancang menggunakan kombinasi teknologi AI untuk analisis teks dan pengecekan reputasi domain, sehingga dapat memberikan penilaian risiko yang objektif sebelum Anda memutuskan untuk bertransaksi, mengeklik link, atau membalas pesan.
          </p>
          
          <div className="bg-black/30 border border-cyber-green/20 p-6 rounded-xl mt-8">
            <h3 className="text-xl font-bold text-white mb-3">Penting untuk Diingat</h3>
            <p className="text-sm">
              Sistem kami menggunakan pendekatan heuristik dan deteksi pola (AI). Walaupun kami berusaha memberikan hasil seakurat mungkin, skor yang diberikan <strong>bukanlah garansi absolut</strong>. Gunakan selalu akal sehat dan verifikasi ganda (double-check) dengan pihak resmi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
