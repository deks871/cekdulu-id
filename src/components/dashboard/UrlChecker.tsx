"use client";

import { useState } from "react";
import { Link, Loader2 } from "lucide-react";
import ScoreResult from "./ScoreResult";

export default function UrlChecker() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Masukkan URL terlebih dahulu");
      return;
    }
    
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/analyze/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal menganalisis URL");
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
        <h3 className="text-xl font-bold text-white mb-2">URL Checker</h3>
        <p className="text-gray-400 text-sm">Cek apakah sebuah tautan (link) aman dari pishing atau penipuan.</p>
      </div>
      
      <form onSubmit={handleAnalyze} className="space-y-4">
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-glass-border rounded-xl bg-black/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyber-blue focus:border-transparent transition-all"
              placeholder="Contoh: https://bit.ly/undian-berhadiah"
            />
          </div>
          {error && <p className="mt-2 text-sm text-cyber-red">{error}</p>}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 bg-cyber-blue hover:bg-[#00cce5] text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Menganalisis...
            </>
          ) : (
            "Periksa URL"
          )}
        </button>
      </form>

      {result && (
        <ScoreResult 
          score={result.score} 
          analysis={result.analysis} 
          isMock={result.isMock}
        />
      )}
    </div>
  );
}
