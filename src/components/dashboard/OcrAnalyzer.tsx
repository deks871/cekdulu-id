"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, FileImage } from "lucide-react";
import ScoreResult from "./ScoreResult";

export default function OcrAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Ukuran file terlalu besar (Maksimal 5MB)");
      setFile(null);
      setPreview(null);
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError("Format file tidak didukung. Harap unggah gambar (JPG/PNG).");
      setFile(null);
      setPreview(null);
      return;
    }

    setError("");
    setResult(null);
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file || !preview) return;
    
    setLoading(true);
    setError("");
    setResult(null);

    try {
      setLoadingStep("Memuat modul OCR...");
      // Lazy load tesseract.js
      const Tesseract = (await import("tesseract.js")).default;
      
      setLoadingStep("Mengekstrak teks dari gambar...");
      // Perform OCR
      const ocrResult = await Tesseract.recognize(preview, "ind+eng", {
        logger: m => {
          if (m.status === "recognizing text") {
            setLoadingStep(`Mengekstrak teks... ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      
      const extractedText = ocrResult.data.text;
      
      if (!extractedText || extractedText.trim().length < 5) {
        throw new Error("Tidak dapat menemukan teks yang jelas pada gambar.");
      }

      setLoadingStep("Menganalisis teks...");
      // Send to Chat Analyzer API
      const res = await fetch("/api/analyze/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText.substring(0, 2000) }), // limit to 2000 chars
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal menganalisis gambar");
      }
      
      setResult(data);
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
        <h3 className="text-xl font-bold text-white mb-2">Screenshot Analyzer</h3>
        <p className="text-gray-400 text-sm">Unggah screenshot chat atau bukti transfer palsu. Kami akan mengekstrak teksnya dan menganalisis risikonya.</p>
      </div>
      
      <div className="space-y-6">
        {!preview ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-glass-border hover:border-cyber-green/50 rounded-xl p-12 text-center cursor-pointer transition-colors bg-black/20 group"
          >
            <Upload className="w-12 h-12 text-gray-500 group-hover:text-cyber-green mx-auto mb-4 transition-colors" />
            <p className="text-white font-medium mb-1">Klik untuk mengunggah screenshot</p>
            <p className="text-sm text-gray-500">Mendukung JPG, PNG (Maks 5MB)</p>
          </div>
        ) : (
          <div className="bg-black/30 border border-glass-border rounded-xl p-4 flex flex-col items-center">
            <img src={preview} alt="Preview" className="max-h-64 object-contain mb-4 rounded-lg shadow-lg" />
            <div className="flex gap-4">
              <button 
                onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                disabled={loading}
              >
                Ganti Gambar
              </button>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="px-6 py-2 bg-cyber-green hover:bg-[#00e65c] text-black font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)] disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {loadingStep}</>
                ) : (
                  <><FileImage className="w-4 h-4" /> Analisis Gambar</>
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
          className="hidden" 
        />
        
        {error && <p className="text-sm text-cyber-red text-center">{error}</p>}
      </div>

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
