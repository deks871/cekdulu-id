import { getScoreColor, getScoreLabel } from "@/lib/utils";
import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, Info, AlertOctagon } from "lucide-react";
import { useEffect, useRef } from "react";
import AnimatedScore from "./AnimatedScore";

interface ScoreResultProps {
  score: number;
  category?: string;
  analysis?: string;
  details?: string[];
  urlDetails?: string[];
  contentDetails?: string[];
  isMock?: boolean;
  extractedFeatures?: Record<string, any>;
}

export default function ScoreResult({ score, category, analysis, details, urlDetails, contentDetails, isMock, extractedFeatures }: ScoreResultProps) {
  const isSafe = score <= 30;
  const isWarning = score > 30 && score <= 70;
  const isDanger = score > 70;

  const colorClass = getScoreColor(score);
  const label = category || getScoreLabel(score);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TEMPORARILY DISABLED FOR MOBILE DEBUGGING
    /*
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const headerOffset = 100;
        const elementPosition = containerRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 100);
    return () => clearTimeout(timer);
    */
  }, []);

  // Background for the top header section
  const bgColor = isSafe ? 'bg-emerald-500/10' : isWarning ? 'bg-amber-500/10' : 'bg-rose-500/10';
  const borderColor = isSafe ? 'border-emerald-500/30' : isWarning ? 'border-amber-500/30' : 'border-rose-500/30';
  const textColor = isSafe ? 'text-emerald-600 dark:text-emerald-400' : isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400';
  const iconColor = isSafe ? 'text-emerald-500' : isWarning ? 'text-amber-500' : 'text-rose-500';
  
  // Progress bar colors
  const progressBgColor = isSafe ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500';
  const progressTrackColor = isSafe ? 'bg-emerald-500/20' : isWarning ? 'bg-amber-500/20' : 'bg-rose-500/20';

  // Background for the recommendation section
  const recBgColor = isSafe ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50' : isWarning ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50' : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50';

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

  const renderDetailItem = (detail: string, itemIconColor: string, isItemSafe: boolean) => {
    const match = detail.match(/^\[(.*?)\]\s*(.*)$/);
    if (match) {
      const badgeText = match[1];
      const restText = match[2];
      
      let badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      if (badgeText.includes('BERBAHAYA') || badgeText.includes('RISIKO TINGGI')) {
         // default rose
      } else if (badgeText.includes('WASPADAI') || badgeText.includes('CURIGA')) {
         badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      } else if (badgeText.includes('AMAN') || badgeText.includes('UMUM')) {
         badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      } else {
         // Neutral badge if it doesn't match standard risk labels
         badgeColor = 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/30';
      }
      
      return (
        <div className="flex flex-col gap-1.5 w-full">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit border uppercase tracking-wider ${badgeColor}`}>
            {badgeText}
          </span>
          <span className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed transition-colors duration-300">
            {restText}
          </span>
        </div>
      );
    }
    
    return (
      <span className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed transition-colors duration-300">
        {detail}
      </span>
    );
  };

  console.log("[ScoreResult] 🎨 Rendering ScoreResult component with score:", score);

  return (
    <div 
      ref={containerRef}
      id="score-result-wrapper"
      className={`mt-8 relative overflow-hidden isolate z-10 bg-white dark:bg-[#081018] border ${borderColor} rounded-2xl shadow-xl transition-colors duration-300`}
    >
      {/* Header section */}
      <div 
        className={`px-6 py-5 border-b ${borderColor} transition-colors duration-300 ${
          isSafe 
            ? 'bg-emerald-500/10 dark:bg-[linear-gradient(135deg,#0f2a20,#16402f)]' 
            : isWarning 
              ? 'bg-amber-500/10 dark:bg-[linear-gradient(135deg,#2a1f0a,#453315)]' 
              : 'bg-rose-500/10 dark:bg-[linear-gradient(135deg,#2a0d18,#3d1221)]'
        }`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            {getIcon("w-10 h-10")}
            <div>
              <h3 className="text-neutral-900 dark:text-white font-bold text-lg uppercase tracking-wide transition-colors duration-300">Laporan Keamanan</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${bgColor} ${textColor} border ${borderColor} transition-colors duration-300`}>
                  {label}
                </span>
                {isMock && (
                  <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 transition-colors duration-300">
                    HEURISTIC MODE
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end w-full sm:w-auto mt-2 sm:mt-0">
            <div className="flex items-baseline gap-1 text-right">
              <span className="text-neutral-500 dark:text-neutral-400 text-sm uppercase tracking-wider font-semibold mr-2 transition-colors duration-300">Risk Score</span>
              {/* Temporarily disabled AnimatedScore */}
              <span className={`text-4xl font-outfit font-bold ${textColor} transition-colors duration-300`}>{score}</span>
              <span className="text-neutral-500 dark:text-neutral-400 font-bold transition-colors duration-300">/100</span>
            </div>
            {/* Progress Bar under score */}
            <div className={`w-full h-1.5 mt-2 rounded-full overflow-hidden ${progressTrackColor}`}>
              <div 
                style={{ width: `${score}%` }}
                className={`h-full ${progressBgColor}`}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Body section */}
      <div className="p-6">
        {urlDetails && urlDetails.length > 0 && (
          <div className="mb-6">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-3 uppercase tracking-wide transition-colors duration-300">
              <Info className="w-4 h-4" /> Indikator Risiko URL
            </h4>
            <ul className="space-y-3">
              {urlDetails.map((detail, index) => (
                <motion.li 
                  whileHover={{ y: -2 }}
                  key={index} 
                  className="flex items-start gap-3 bg-neutral-50 dark:bg-[rgba(255,255,255,0.03)] p-3 rounded-lg border border-neutral-200 dark:border-[rgba(255,255,255,0.08)] transition-all duration-300 hover:shadow-md dark:hover:bg-[rgba(255,255,255,0.05)]"
                >
                  {isSafe ? <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} /> : <AlertOctagon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />}
                  {renderDetailItem(detail, iconColor, isSafe)}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {contentDetails && contentDetails.length > 0 && (
          <div className="mb-6">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-3 uppercase tracking-wide transition-colors duration-300">
              <Info className="w-4 h-4" /> Indikator Risiko Konten
            </h4>
            <ul className="space-y-3">
              {contentDetails.map((detail, index) => (
                <motion.li 
                  whileHover={{ y: -2 }}
                  key={index} 
                  className="flex items-start gap-3 bg-neutral-50 dark:bg-[rgba(255,255,255,0.03)] p-3 rounded-lg border border-neutral-200 dark:border-[rgba(255,255,255,0.08)] transition-all duration-300 hover:shadow-md dark:hover:bg-[rgba(255,255,255,0.05)]"
                >
                  {isSafe ? <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} /> : <AlertOctagon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />}
                  {renderDetailItem(detail, iconColor, isSafe)}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {!urlDetails && (
          <div className="mb-6">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-3 uppercase tracking-wide transition-colors duration-300">
              <Info className="w-4 h-4" /> Temuan Analisis
            </h4>
            
            {Array.isArray(details) && details.length > 0 ? (
              <ul className="space-y-3">
                {details.map((detail, index) => (
                  <motion.li 
                    whileHover={{ y: -2 }}
                    key={index} 
                    className="flex items-start gap-3 bg-neutral-50 dark:bg-[rgba(255,255,255,0.03)] p-3 rounded-lg border border-neutral-200 dark:border-[rgba(255,255,255,0.08)] transition-all duration-300 hover:shadow-md dark:hover:bg-[rgba(255,255,255,0.05)]"
                  >
                    {isSafe ? (
                      <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
                    ) : (
                      <AlertOctagon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
                    )}
                    {renderDetailItem(detail, iconColor, isSafe)}
                  </motion.li>
                ))}
              </ul>
            ) : (
              <motion.div 
                whileHover={{ y: -2 }}
                className="bg-neutral-50 dark:bg-[rgba(255,255,255,0.03)] p-4 rounded-lg border border-neutral-200 dark:border-[rgba(255,255,255,0.08)] text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed transition-all duration-300 hover:shadow-md"
              >
                {analysis || "Tidak ada detail spesifik yang ditemukan."}
              </motion.div>
            )}
          </div>
        )}

        {extractedFeatures && process.env.NODE_ENV === 'development' && (
          <div className="mb-6">
            <details className="bg-neutral-50 dark:bg-[#05080d] rounded-lg border border-neutral-200 dark:border-[rgba(16,185,129,0.2)] transition-colors duration-300">
              <summary className="px-4 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-300 flex items-center gap-2">
                <Info className="w-4 h-4" /> Data Debugging (Extracted Features)
              </summary>
              <div className="p-4 border-t border-neutral-200 dark:border-[rgba(16,185,129,0.2)] text-xs font-mono text-neutral-600 dark:text-neutral-400 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(extractedFeatures, null, 2)}
              </div>
            </details>
          </div>
        )}

        {/* Recommendation section */}
        <motion.div 
          whileHover={{ y: -2 }}
          className={`p-5 rounded-lg border ${recBgColor} transition-all duration-300 hover:shadow-lg`}
        >
          <h4 className={`text-sm font-semibold mb-2 uppercase tracking-wide ${textColor} transition-colors duration-300`}>Rekomendasi Tindakan</h4>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm transition-colors duration-300">{getRecommendation()}</p>
        </motion.div>
      </div>
    </div>
  );
}
