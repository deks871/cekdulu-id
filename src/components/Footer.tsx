import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="glass border-t border-glass-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-cyber-green" />
            <span className="font-outfit font-bold text-lg text-white">
              CekDulu<span className="text-cyber-green">.id</span>
            </span>
          </div>
          
          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} CekDulu.id - Solusi Anti-Scam Indonesia. MVP Demo.
          </p>
          
          <div className="flex space-x-6 text-sm">
            <Link href="/edukasi" className="text-gray-400 hover:text-white transition">
              Edukasi
            </Link>
            <Link href="/tentang" className="text-gray-400 hover:text-white transition">
              Tentang
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
