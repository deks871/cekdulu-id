import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="glass border-t border-glass-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Top Section: Brand and Links */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-cyber-green" />
            <span className="font-outfit font-bold text-lg text-white">
              CekDulu<span className="text-cyber-green">.id</span>
            </span>
          </div>
          
          <div className="flex space-x-6 text-sm">
            <Link href="/edukasi" className="text-gray-400 hover:text-white transition">
              Edukasi
            </Link>
            <Link href="/tentang" className="text-gray-400 hover:text-white transition">
              Tentang
            </Link>
          </div>
        </div>

        {/* Middle Section: Kritik & Saran */}
        <div className="border-t border-b border-glass-border py-8 mb-8">
          <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
            <h3 className="text-white font-bold text-lg flex items-center justify-center gap-2">
              <span className="text-xl">🚀</span> CekDulu.id masih dalam tahap pengembangan.
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Jika Anda menemukan bug, hasil analisis yang kurang akurat, atau memiliki saran fitur baru, silakan kirim masukan melalui WhatsApp. Setiap kritik dan saran akan sangat membantu proses pengembangan platform ini.
            </p>
            <a 
              href="https://wa.me/6281376454260"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 mt-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white border border-[#25D366]/30 hover:border-[#25D366] rounded-full transition-all duration-300 font-medium group text-sm w-full sm:w-auto"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="w-5 h-5 fill-current" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              📱 WhatsApp: https://wa.me/6281376454260
            </a>
          </div>
        </div>

        {/* Bottom Section: Copyright and Beta Notice */}
        <div className="flex flex-col items-center text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} CekDulu.id - Solusi Anti-Scam Indonesia. MVP Demo.
          </p>
          <p className="text-gray-500/50 text-xs mt-2 max-w-md">
            Versi saat ini masih bersifat beta dan akan terus diperbarui berdasarkan masukan pengguna.
          </p>
        </div>
        
      </div>
    </footer>
  );
}
