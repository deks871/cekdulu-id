import { getScoreColor, getScoreLabel } from "@/lib/utils";
import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";

interface ScoreResultProps {
  score: number;
  category?: string;
  analysis: string;
  isMock?: boolean;
}

export default function ScoreResult({ score, category, analysis, isMock }: ScoreResultProps) {
  const colorClass = getScoreColor(score);
  const label = category || getScoreLabel(score);

  const getIcon = () => {
    if (score <= 30) return <ShieldCheck className="w-12 h-12 text-cyber-green mx-auto mb-2" />;
    if (score <= 70) return <AlertTriangle className="w-12 h-12 text-cyber-yellow mx-auto mb-2" />;
    return <ShieldAlert className="w-12 h-12 text-cyber-red mx-auto mb-2" />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 mt-6 border-t-4"
      style={{ borderTopColor: score <= 30 ? 'var(--color-cyber-green)' : score <= 70 ? 'var(--color-cyber-yellow)' : 'var(--color-cyber-red)' }}
    >
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="text-center min-w-[150px]">
          {getIcon()}
          <div className={`text-4xl font-bold font-outfit ${colorClass}`}>{score}%</div>
          <div className="text-lg font-bold text-white uppercase tracking-wider mt-1">{label}</div>
        </div>
        
        <div className="flex-1 bg-black/20 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Hasil Analisis</h4>
          <p className="text-white leading-relaxed">{analysis}</p>
          
          {isMock && (
            <div className="mt-4 inline-flex items-center px-2 py-1 rounded bg-cyber-blue/20 text-cyber-blue text-xs font-bold border border-cyber-blue/30">
              Demo / Heuristic Mode
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
