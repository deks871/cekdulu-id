"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, FileImage, X, ChevronDown, ChevronUp } from "lucide-react";
import ScoreResult from "./ScoreResult";

export default function OcrAnalyzer() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_FILES = 5;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    if (files.length + selectedFiles.length > MAX_FILES) {
      setError(`Maksimal ${MAX_FILES} gambar yang dapat diunggah.`);
      return;
    }

    const validFiles: File[] = [];
    const validPreviews: string[] = [];
    let hasError = false;

    selectedFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        setError(`Ukuran file ${file.name} terlalu besar (Maksimal 5MB)`);
        hasError = true;
      } else if (!file.type.startsWith("image/")) {
        setError(`Format file ${file.name} tidak didukung. Harap unggah gambar (JPG/PNG).`);
        hasError = true;
      } else {
        validFiles.push(file);
        validPreviews.push(URL.createObjectURL(file));
      }
    });

    if (hasError) return;

    setError("");
    setResult(null);
    setExtractedText("");
    setFiles(prev => [...prev, ...validFiles]);
    setPreviews(prev => [...prev, ...validPreviews]);
    
    // Reset input value to allow selecting the same file again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setResult(null);
    setExtractedText("");
  };

  const handleAnalyze = async () => {
    if (files.length === 0 || previews.length === 0) return;
    
    setLoading(true);
    setError("");
    setResult(null);
    setExtractedText("");
    setIsTextExpanded(false);

    try {
      setLoadingStep("Menyiapkan gambar untuk analisis...");
      // Lazy load tesseract.js
      const Tesseract = (await import("tesseract.js")).default;
      
      let combinedText = "";

      for (let i = 0; i < previews.length; i++) {
        setLoadingStep(`Mengekstrak teks dari gambar ${i + 1} dari ${previews.length}...`);
        
        // Perform OCR sequentially
        const ocrResult = await Tesseract.recognize(previews[i], "ind+eng", {
          logger: m => {
            if (m.status === "recognizing text") {
              setLoadingStep(`Memproses gambar ${i + 1} dari ${previews.length}... ${Math.round(m.progress * 100)}%`);
            }
          }
        });

        const text = ocrResult.data.text;
        if (text && text.trim().length > 0) {
          combinedText += `\n\n--- Gambar ${i + 1} ---\n\n${text}`;
        }
      }
      
      if (!combinedText || combinedText.trim().length < 5) {
        throw new Error("Tidak dapat menemukan teks yang jelas pada gambar-gambar yang diunggah.");
      }

      setExtractedText(combinedText.trim());
      setLoadingStep("Mengidentifikasi indikator penipuan...");
      
      const res = await fetch("/api/analyze/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: combinedText.substring(0, 10000) }), // limit to 10000 chars
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal menganalisis gambar");
      }
      
      setLoadingStep("Menyusun laporan akhir...");
      // Add slight delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setResult({
        ...data,
        imageCount: files.length
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-300">OCR Investigation Mode</h3>
        <p className="text-slate-600 dark:text-gray-400 text-sm transition-colors duration-300">Unggah hingga 5 screenshot percakapan atau bukti transfer. Kami akan menganalisis semuanya untuk mencari indikator penipuan.</p>
      </div>
      
      <div className="space-y-6">
        {previews.length === 0 ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-glass-border hover:border-cyber-green/50 rounded-xl p-12 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-black/20 group duration-300"
          >
            <Upload className="w-12 h-12 text-slate-400 dark:text-gray-500 group-hover:text-cyber-green mx-auto mb-4 transition-colors" />
            <p className="text-slate-900 dark:text-white font-medium mb-1 transition-colors duration-300">Klik untuk mengunggah screenshot</p>
            <p className="text-sm text-slate-500 dark:text-gray-500 transition-colors duration-300">Pilih 1 hingga 5 gambar (Maks 5MB/gambar)</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-black/30 border border-slate-200 dark:border-glass-border rounded-xl p-6 flex flex-col items-center transition-colors duration-300">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full mb-6">
              {previews.map((preview, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 aspect-[3/4]">
                  <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeFile(index)}
                    disabled={loading}
                    className="absolute top-2 right-2 p-1.5 bg-slate-800/60 dark:bg-black/60 hover:bg-rose-500 text-white rounded-full transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-slate-800/60 dark:bg-black/60 p-1 text-center text-xs text-white dark:text-slate-300 backdrop-blur-sm">
                    Gambar {index + 1}
                  </div>
                </div>
              ))}
              
              {previews.length < MAX_FILES && !loading && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyber-green/50 flex flex-col items-center justify-center cursor-pointer transition-colors aspect-[3/4] bg-slate-50 dark:bg-slate-800/30 group"
                >
                  <Upload className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-cyber-green mb-2" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">Tambah</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => { setFiles([]); setPreviews([]); setResult(null); setExtractedText(""); }}
                className="px-4 py-2 text-sm text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                disabled={loading}
              >
                Hapus Semua
              </button>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="px-6 py-2 bg-cyber-green text-cyber-dark font-bold hover:bg-[#00ff66] shadow-[0_0_20px_rgba(0,230,92,0.2)] hover:shadow-[0_0_35px_rgba(0,230,92,0.5)] rounded-lg transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[0_0_20px_rgba(0,230,92,0.2)] group"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin text-cyber-dark" /> <span className="text-cyber-dark text-xs">{loadingStep}</span></>
                ) : (
                  <><FileImage className="w-4 h-4 text-cyber-dark transition-colors" /> <span className="text-cyber-dark transition-colors">Mulai Investigasi</span></>
                )}
              </button>
            </div>
          </div>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/jpeg, image/png, image/webp" 
          multiple
          className="hidden" 
        />
        
        {error && <p className="text-sm text-cyber-red text-center bg-rose-500/10 border border-rose-500/20 py-2 px-4 rounded-lg">{error}</p>}
      </div>

      {result && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 px-2 transition-colors duration-300">
            <div className="w-1.5 h-1.5 rounded-full bg-cyber-green"></div>
            <span>{result.imageCount} screenshot dianalisis</span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span>{result.details?.length || 0} indikator penipuan terdeteksi</span>
          </div>
          
          <ScoreResult 
            score={result.score} 
            category={result.category}
            analysis={result.analysis} 
            details={result.details}
            isMock={result.isMock}
          />
          
          {extractedText && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-black/20 mt-4 transition-all duration-300">
              <button 
                onClick={() => setIsTextExpanded(!isTextExpanded)}
                className="w-full px-5 py-4 flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span className="text-sm font-semibold uppercase tracking-wider">Lihat Teks yang Diekstrak</span>
                {isTextExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {isTextExpanded && (
                <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/40 transition-colors duration-300">
                  <pre className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-mono overflow-auto max-h-[400px] leading-relaxed custom-scrollbar transition-colors duration-300">
                    {extractedText}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
