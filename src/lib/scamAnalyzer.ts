import {
  SCAM_CATEGORIES,
  COMBO_RULES,
  type ScamCategory,
} from "@/data/scamPatterns";
 
// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------
 
export type RiskLabel =
  | "RELATIF AMAN"
  | "PERLU DIWASPADAI"
  | "RISIKO TINGGI"
  | "KEMUNGKINAN PENIPUAN";
 
export interface CategoryResult {
  detected: boolean;
  matchedPatterns: string[]; // label dari pattern yang cocok
  rawScore: number;          // skor mentah sebelum di-cap
  cappedScore: number;       // skor setelah di-cap dengan maxScore
}
 
export interface AnalysisResult {
  score: number;                                   // final score 0–100
  label: RiskLabel;                                // label risiko
  reasons: string[];                               // semua alasan yang terdeteksi
  matchedCategories: ScamCategory[];               // kategori yang aktif
  categoryDetails: Record<ScamCategory, CategoryResult>; // detail per kategori
  combosBonuses: Array<{ id: string; reason: string; bonus: number }>; // bonus combo
  textLength: number;                              // panjang teks yang dianalisis
}
 
// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
 
/**
 * Normalisasi teks: lowercase, hapus karakter aneh, normalkan spasi
 * agar pattern matching lebih konsisten.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    // Ganti beberapa karakter pengganti umum yang dipakai penipu
    .replace(/[@4]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[5$]/g, "s")
    // Hapus karakter non-alfanumerik kecuali spasi dan tanda baca penting
    .replace(/[^\w\s.,!?%-]/g, " ")
    // Normalkan whitespace berlebih
    .replace(/\s+/g, " ")
    .trim();
}
 
/**
 * Hitung berapa kali sebuah pattern cocok dalam teks.
 * Mengembalikan jumlah match yang unik (deduplicated).
 */
function countMatches(pattern: RegExp, text: string): number {
  const matches = text.match(pattern);
  if (!matches) return 0;
  // Deduplicate agar satu kata tidak dihitung berkali-kali
  const unique = new Set(matches.map((m) => m.toLowerCase().trim()));
  return unique.size;
}
 
/**
 * Menentukan label risiko berdasarkan skor.
 */
function getLabel(score: number): RiskLabel {
  if (score < 25) return "RELATIF AMAN";
  if (score < 50) return "PERLU DIWASPADAI";
  if (score < 75) return "RISIKO TINGGI";
  return "KEMUNGKINAN PENIPUAN";
}
 
/**
 * Clamp nilai dalam rentang [min, max].
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
 
// ---------------------------------------------------------------------------
// CORE ANALYZER
// ---------------------------------------------------------------------------
 
/**
 * Analisis teks untuk mendeteksi pola penipuan/phishing.
 *
 * @param rawText - Teks mentah yang akan dianalisis (dari OCR atau input langsung)
 * @returns AnalysisResult lengkap
 *
 * @example
 * const result = analyzeScam("Selamat! Anda terpilih memenangkan hadiah. Segera klik link ini.");
 * console.log(result.score, result.label);
 */
export function analyzeScam(rawText: string): AnalysisResult {
  // Validasi input
  if (!rawText || typeof rawText !== "string") {
    return buildEmptyResult(rawText ?? "");
  }
 
  const text = normalizeText(rawText);
  const textLength = rawText.trim().length;
 
  // Guard: teks terlalu pendek tidak bisa dianalisis dengan akurat
  if (textLength < 10) {
    return buildEmptyResult(rawText);
  }
 
  // -------------------------------------------------------------------------
  // FASE 1: Analisis per kategori
  // -------------------------------------------------------------------------
  const categoryDetails = {} as Record<ScamCategory, CategoryResult>;
  const matchedCategories: ScamCategory[] = [];
  const allReasons: string[] = [];
  let totalBaseScore = 0;
 
  for (const [categoryKey, config] of Object.entries(SCAM_CATEGORIES) as [
    ScamCategory,
    (typeof SCAM_CATEGORIES)[ScamCategory],
  ][]) {
    const matchedPatterns: string[] = [];
    let rawScore = 0;
 
    for (const { pattern, label, score } of config.patterns) {
      // Reset lastIndex untuk global regex
      pattern.lastIndex = 0;
 
      const matchCount = countMatches(pattern, text);
      if (matchCount > 0) {
        matchedPatterns.push(label);
        // Hanya hitung skor untuk match pertama; match tambahan memberi 50% bonus
        rawScore += score + (matchCount - 1) * (score * 0.5);
      }
    }
 
    // Tambahkan baseScore kategori jika ada pattern yang cocok
    if (matchedPatterns.length > 0) {
      rawScore += config.baseScore;
    }
 
    const cappedScore = clamp(rawScore, 0, config.maxScore);
 
    categoryDetails[categoryKey] = {
      detected: matchedPatterns.length > 0,
      matchedPatterns,
      rawScore: Math.round(rawScore),
      cappedScore,
    };
 
    if (matchedPatterns.length > 0) {
      matchedCategories.push(categoryKey);
      totalBaseScore += cappedScore;
      allReasons.push(...matchedPatterns);
    }
  }
 
  // -------------------------------------------------------------------------
  // FASE 2: Combo scoring
  // -------------------------------------------------------------------------
  const combosBonuses: AnalysisResult["combosBonuses"] = [];
  let comboScore = 0;
 
  for (const rule of COMBO_RULES) {
    const allPresent = rule.categories.every((cat) =>
      matchedCategories.includes(cat)
    );
 
    if (allPresent) {
      combosBonuses.push({
        id: rule.id,
        reason: rule.reason,
        bonus: rule.bonusScore,
      });
      comboScore += rule.bonusScore;
 
      // Tambahkan alasan combo ke reasons jika belum ada
      if (!allReasons.includes(rule.reason)) {
        allReasons.push(rule.reason);
      }
    }
  }
 
  // -------------------------------------------------------------------------
  // FASE 3: Hitung skor final
  // -------------------------------------------------------------------------
  const rawFinalScore = totalBaseScore + comboScore;
 
  // Normalisasi: jika teks sangat panjang, pattern mungkin muncul lebih banyak
  // Terapkan slight dampening untuk teks pendek (< 50 karakter) karena konteks kurang
  const lengthMultiplier = textLength < 50 ? 0.85 : 1.0;
 
  const finalScore = clamp(Math.round(rawFinalScore * lengthMultiplier), 0, 100);
 
  // -------------------------------------------------------------------------
  // FASE 4: Susun reasons yang bersih (deduplicated + prioritas)
  // -------------------------------------------------------------------------
  const deduplicatedReasons = [...new Set(allReasons)];
 
  // Urutkan: combo reasons di akhir (sudah ada di allReasons, tinggal sort)
  const comboReasonTexts = new Set(combosBonuses.map((c) => c.reason));
  const sortedReasons = [
    ...deduplicatedReasons.filter((r) => !comboReasonTexts.has(r)),
    ...deduplicatedReasons.filter((r) => comboReasonTexts.has(r)),
  ];
 
  return {
    score: finalScore,
    label: getLabel(finalScore),
    reasons: sortedReasons,
    matchedCategories,
    categoryDetails,
    combosBonuses,
    textLength,
  };
}
 
// ---------------------------------------------------------------------------
// BATCH ANALYSIS (opsional, untuk analisis banyak teks sekaligus)
// ---------------------------------------------------------------------------
 
/**
 * Analisis banyak teks sekaligus dan kembalikan array hasil.
 * Berguna untuk analisis percakapan multi-pesan.
 */
export function analyzeScamBatch(
  texts: string[]
): Array<AnalysisResult & { index: number }> {
  return texts.map((text, index) => ({
    ...analyzeScam(text),
    index,
  }));
}
 
/**
 * Gabungkan hasil analisis dari banyak teks menjadi satu hasil agregat.
 * Score diambil dari nilai tertinggi (worst-case), reasons digabung.
 */
export function mergeAnalysisResults(results: AnalysisResult[]): AnalysisResult {
  if (results.length === 0) return buildEmptyResult("");
  if (results.length === 1) return results[0];
 
  const maxScore = Math.max(...results.map((r) => r.score));
  const allCategories = [
    ...new Set(results.flatMap((r) => r.matchedCategories)),
  ] as ScamCategory[];
  const allReasons = [...new Set(results.flatMap((r) => r.reasons))];
  const allCombos = results.flatMap((r) => r.combosBonuses);
 
  // Ambil categoryDetails dari result dengan skor tertinggi
  const dominantResult = results.find((r) => r.score === maxScore)!;
 
  return {
    score: maxScore,
    label: getLabel(maxScore),
    reasons: allReasons,
    matchedCategories: allCategories,
    categoryDetails: dominantResult.categoryDetails,
    combosBonuses: allCombos,
    textLength: results.reduce((sum, r) => sum + r.textLength, 0),
  };
}
 
// ---------------------------------------------------------------------------
// INTERNAL: build empty/default result
// ---------------------------------------------------------------------------
 
function buildEmptyResult(rawText: string): AnalysisResult {
  const emptyCategory: CategoryResult = {
    detected: false,
    matchedPatterns: [],
    rawScore: 0,
    cappedScore: 0,
  };
 
  return {
    score: 0,
    label: "RELATIF AMAN",
    reasons: [],
    matchedCategories: [],
    categoryDetails: {
      impersonation: { ...emptyCategory },
      urgency: { ...emptyCategory },
      action: { ...emptyCategory },
      giveaway: { ...emptyCategory },
      otp: { ...emptyCategory },
      financial: { ...emptyCategory },
    },
    combosBonuses: [],
    textLength: rawText.trim().length,
  };
}
 
// ---------------------------------------------------------------------------
// UTILITY: Format hasil untuk logging / debugging
// ---------------------------------------------------------------------------
 
/**
 * Format AnalysisResult menjadi string yang mudah dibaca untuk debugging.
 */
export function formatAnalysisResult(result: AnalysisResult): string {
  const lines: string[] = [
    `=== CekDulu Analysis Result ===`,
    `Score   : ${result.score}/100`,
    `Label   : ${result.label}`,
    `Length  : ${result.textLength} chars`,
    ``,
    `Matched Categories: ${result.matchedCategories.join(", ") || "none"}`,
    ``,
    `Category Breakdown:`,
  ];
 
  for (const [cat, detail] of Object.entries(result.categoryDetails)) {
    if (detail.detected) {
      lines.push(
        `  [${cat}] score=${detail.cappedScore} | patterns: ${detail.matchedPatterns.join("; ")}`
      );
    }
  }
 
  if (result.combosBonuses.length > 0) {
    lines.push(``, `Combo Bonuses:`);
    for (const combo of result.combosBonuses) {
      lines.push(`  +${combo.bonus} pts — ${combo.reason}`);
    }
  }
 
  lines.push(``, `Reasons:`);
  for (const reason of result.reasons) {
    lines.push(`  • ${reason}`);
  }
 
  lines.push(`================================`);
  return lines.join("\n");
}