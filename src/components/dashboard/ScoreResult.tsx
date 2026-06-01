import { getScoreColor, getScoreLabel } from "@/lib/utils";
import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, Info, AlertOctagon } from "lucide-react";

interface ScoreResultProps {
  score: number;
  category?: string;
  analysis?: string;
  details?: string[];
  isMock?: boolean;
}

export default function ScoreResult({ score, category, analysis, details, isMock }: ScoreResultProps) {
  const isSafe = score <= 30;
  const isWarning = score > 30 && score <= 70;
  const isDanger = score > 70;

  const colorClass = getScoreColor(score);
  const label = category || getScoreLabel(score);

  // Use more professional colors for backgrounds
  const bgColor = isSafe ? 'bg-emerald-500/10' : isWarning ? 'bg-amber-500/10' : 'bg-rose-500/10';
  const borderColor = isSafe ? 'border-emerald-500/30' : isWarning ? 'border-amber-500/30' : 'border-rose-500/30';
  const textColor = isSafe ? 'text-emerald-400' : isWarning ? 'text-amber-400' : 'text-rose-400';
  const iconColor = isSafe ? 'text-emerald-500' : isWarning ? 'text-amber-500' : 'text-rose-500';

  const getIcon = (className = "w-6 h-6") => {
    if (isSafe) return <ShieldCheck className={`${className} ${iconColor}`} />;
    if (isWarning) return <AlertTriangle className={`${className} ${iconColor}`} />;
    return <ShieldAlert className={`${className} ${iconColor}`} />;
  };

  const getRecommendation = () => {
    if (isSafe) return "Aman untuk dilanjutkan. Namun tetap waspada terhadap permintaan data pribadi yang tidak wajar.";
    if (isWarning) return "Periksa kembali sumber informasi. Jangan membagikan OTP, password, atau melakukan transfer uang.";
    return "Tinggalkan segera. Indikasi kuat penipuan atau ancaman keamanan siber terdeteksi.";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-8 bg-slate-900 border ${borderColor} rounded-xl overflow-hidden shadow-lg`}
    >
      {/* Header section */}
      <div className={`${bgColor} px-6 py-4 border-b ${borderColor} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
        <div className="flex items-center gap-3">
          {getIcon("w-8 h-8")}
          <div>
            <h3 className="text-white font-bold text-lg uppercase tracking-wide">Laporan Keamanan</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${bgColor} ${textColor} border ${borderColor}`}>
                {label}
              </span>
              {isMock && (
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                  HEURISTIC MODE
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-baseline gap-1 text-right">
          <span className="text-slate-400 text-sm uppercase tracking-wider font-semibold mr-2">Risk Score</span>
          <span className={`text-4xl font-outfit font-bold ${textColor}`}>{score}</span>
          <span className="text-slate-500 font-bold">/100</span>
        </div>
      </div>
      
      {/* Body section */}
      <div className="p-6">
        <div className="mb-6">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
            <Info className="w-4 h-4" /> Temuan Analisis
          </h4>
          
          {Array.isArray(details) && details.length > 0 ? (
            <ul className="space-y-3">
              {details.map((detail, index) => (
                <li key={index} className="flex items-start gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  {isSafe ? (
                    <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
                  ) : (
                    <AlertOctagon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
                  )}
                  <span className="text-slate-300 text-sm leading-relaxed">{detail}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 text-slate-300 text-sm leading-relaxed">
              {analysis || "Tidak ada detail spesifik yang ditemukan."}
            </div>
          )}
        </div>

        {/* Recommendation section */}
        <div className={`p-4 rounded-lg border ${isSafe ? 'bg-emerald-950/30 border-emerald-900/50' : isWarning ? 'bg-amber-950/30 border-amber-900/50' : 'bg-rose-950/30 border-rose-900/50'}`}>
          <h4 className={`text-sm font-semibold mb-2 uppercase tracking-wide ${textColor}`}>Rekomendasi Tindakan</h4>
          <p className="text-slate-300 text-sm">{getRecommendation()}</p>
        </div>
      </div>
    </motion.div>
  );
}
