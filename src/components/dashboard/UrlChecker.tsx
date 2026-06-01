import { useState } from "react";
import { Link, Loader2 } from "lucide-react";
import ScoreResult from "./ScoreResult";

export default function UrlChecker() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    label: string;
    details: string[];
    isMock?: boolean;
  } | null>(null);
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
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-300">URL Checker</h3>
        <p className="text-slate-600 dark:text-gray-400 text-sm transition-colors duration-300">
          Cek apakah sebuah tautan (link) aman dari pishing atau penipuan.
        </p>
      </div>
      <form onSubmit={handleAnalyze} className="space-y-4">
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link className="h-5 w-5 text-slate-400 dark:text-gray-500 transition-colors duration-300" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-glass-border rounded-xl bg-white dark:bg-black/30 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyber-green focus:border-transparent transition-all duration-300"
              placeholder="Contoh: https://bit.ly/undian-berhadiah"
            />
          </div>
          {error && <p className="mt-2 text-sm text-cyber-red">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 bg-cyber-green text-cyber-dark font-bold hover:bg-[#00ff66] shadow-[0_0_20px_rgba(0,230,92,0.2)] hover:shadow-[0_0_35px_rgba(0,230,92,0.5)] rounded-xl transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[0_0_20px_rgba(0,230,92,0.2)] group"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-cyber-dark" /> <span className="text-cyber-dark transition-colors duration-300">Menganalisis URL...</span>
            </>
          ) : (
            <>
              <span className="text-cyber-dark transition-colors">Periksa URL</span>
            </>
          )}
        </button>
      </form>
      {result && (
  <ScoreResult
    score={result.score}
    category={result.label}
    details={result.details}
    isMock={result.isMock}
  />
)}
    </div>
  );
}