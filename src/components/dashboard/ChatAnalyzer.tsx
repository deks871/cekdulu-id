"use client";

import { useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import ScoreResult from "./ScoreResult";

export default function ChatAnalyzer() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Masukkan teks chat terlebih dahulu");
      return;
    }
    
    if (text.length > 2000) {
      setError("Teks terlalu panjang (Maksimal 2000 karakter)");
      return;
    }
    
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/analyze/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal menganalisis chat");
      }
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Chat Analyzer</h3>
        <p className="text-gray-400 text-sm">Salin dan tempel pesan WhatsApp atau SMS yang mencurigakan.</p>
      </div>
      
      <form onSubmit={handleAnalyze} className="space-y-4">
        <div>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="block w-full p-4 border border-glass-border rounded-xl bg-black/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyber-yellow focus:border-transparent transition-all resize-none"
              placeholder="Paste teks pesan di sini... (Contoh: Selamat nomor Anda memenangkan undian Rp 100 juta. Klik link berikut untuk klaim hadiah!)"
            />
          </div>
          <div className="flex justify-between mt-2">
            {error && <p className="text-sm text-cyber-red">{error}</p>}
            {!error && <span></span>}
            <span className={`text-xs ${text.length > 2000 ? 'text-cyber-red' : 'text-gray-500'}`}>
              {text.length}/2000
            </span>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading || text.length === 0 || text.length > 2000}
          className="w-full sm:w-auto px-6 py-3 bg-cyber-yellow hover:bg-[#ffe033] text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,204,0,0.3)] hover:shadow-[0_0_30px_rgba(255,204,0,0.5)] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Menganalisis Teks...
            </>
          ) : (
            <><MessageSquare className="w-5 h-5" /> Analisis Chat</>
          )}
        </button>
      </form>

      {result && (
        <ScoreResult 
          score={result.score} 
          category={result.category}
          analysis={result.analysis} 
          isMock={result.isMock}
        />
      )}
    </div>
  );
}
