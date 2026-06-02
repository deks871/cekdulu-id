import { useState } from "react";
import { Link, Loader2, Lock } from "lucide-react";
import ScoreResult from "./ScoreResult";

export default function UrlChecker() {
  const MAINTENANCE_MODE = true;

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    label: string;
    details: string[];
    urlDetails?: string[];
    contentDetails?: string[];
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
    <div className="h-full min-h-[400px] flex flex-col">
      <div className={MAINTENANCE_MODE ? "opacity-20 blur-sm pointer-events-none select-none flex-grow transition-all duration-500" : "flex-grow"}>
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
                tabIndex={MAINTENANCE_MODE ? -1 : 0}
              />
            </div>
            {error && <p className="mt-2 text-sm text-cyber-red">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading || MAINTENANCE_MODE}
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
            urlDetails={result.urlDetails}
            contentDetails={result.contentDetails}
            isMock={result.isMock}
          />
        )}
      </div>

      {MAINTENANCE_MODE && (
        <div className="absolute inset-x-0 bottom-0 top-6 sm:top-0 z-20 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-sm rounded-2xl">
          <div className="bg-[#0f172a]/90 dark:bg-black/60 border border-cyber-green/30 p-8 rounded-2xl shadow-[0_0_30px_rgba(0,230,92,0.15)] max-w-md mx-auto text-center backdrop-blur-md flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-cyber-green/10 border border-cyber-green/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,230,92,0.3)]">
              <Lock className="w-8 h-8 text-cyber-green" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 tracking-wide">Peningkatan <span className="text-cyber-green">Sistem</span></h3>
            <p className="text-slate-200 dark:text-slate-300 text-sm leading-relaxed mb-4">
              URL Analyzer sedang dalam peningkatan akurasi dan validasi keamanan.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Fitur ini untuk sementara tidak tersedia agar kami dapat memastikan hasil analisis yang lebih akurat dan dapat dipercaya.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}