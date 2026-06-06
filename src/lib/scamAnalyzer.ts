import {
  SCAM_CATEGORIES,
  COMBO_RULES,
  type ScamCategory,
} from "@/data/scamPatterns";
import { detectBehavioralPatterns } from "./behavioralAnalyzer";
import { evaluateWithGemini } from "./gemini";

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export type RiskLabel =
  | "RELATIF AMAN"
  | "PERLU DIWASPADAI"
  | "RISIKO TINGGI"
  | "KEMUNGKINAN PENIPUAN";

export type ConfidenceScore = "Tinggi" | "Sedang" | "Rendah";

export interface CategoryResult {
  detected: boolean;
  matchedPatterns: string[];
  failedPatterns?: string[];
  rawScore: number;
  cappedScore: number;
}

export interface AnalysisResult {
  score: number;                                   
  label: RiskLabel;                                
  confidence: ConfidenceScore;
  reasons: string[];                               
  matchedCategories: ScamCategory[];               
  categoryDetails: Record<ScamCategory, CategoryResult>; 
  combosBonuses: Array<{ id: string; reason: string; bonus: number }>; 
  textLength: number;                              
  normalizedText?: string;                         
  aiReasoning?: string[];
  aiIndicators?: string[];
  debug?: any;
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[5$]/g, "s")
    .replace(/[^\w\s.,!?%-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countMatches(pattern: RegExp, text: string): number {
  const matches = text.match(pattern);
  if (!matches) return 0;
  const unique = new Set(matches.map((m) => m.toLowerCase().trim()));
  return unique.size;
}

function getLabel(score: number): RiskLabel {
  if (score < 25) return "RELATIF AMAN";
  if (score < 50) return "PERLU DIWASPADAI";
  if (score < 75) return "RISIKO TINGGI";
  return "KEMUNGKINAN PENIPUAN";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ---------------------------------------------------------------------------
// CORE ANALYZER
// ---------------------------------------------------------------------------

export async function analyzeScam(rawText: string): Promise<AnalysisResult> {
  const emptyResult = buildEmptyResult(rawText ?? "");
  if (!rawText || typeof rawText !== "string") return emptyResult;

  const text = normalizeText(rawText);
  const textLength = rawText.trim().length;

  if (textLength < 10) return emptyResult;

  // =========================================================================
  // LAYER 1: TRADITIONAL RULE ENGINE (Weight: ~40 max points)
  // =========================================================================
  const categoryDetails = {} as Record<ScamCategory, CategoryResult>;
  const matchedCategories: ScamCategory[] = [];
  const layer1Reasons: string[] = [];
  let layer1Score = 0;

  for (const [categoryKey, config] of Object.entries(SCAM_CATEGORIES) as [ScamCategory, typeof SCAM_CATEGORIES[ScamCategory]][]) {
    const matchedPatterns: string[] = [];
    const failedPatterns: string[] = [];
    let rawScore = 0;

    for (const { pattern, label, score } of config.patterns) {
      pattern.lastIndex = 0;
      const matchCount = countMatches(pattern, text);
      if (matchCount > 0) {
        matchedPatterns.push(label);
        rawScore += score + (matchCount - 1) * (score * 0.5);
      } else {
        failedPatterns.push(label);
      }
    }

    if (matchedPatterns.length > 0) {
      rawScore += config.baseScore;
    }

    const cappedScore = clamp(rawScore, 0, config.maxScore);

    categoryDetails[categoryKey] = {
      detected: matchedPatterns.length > 0,
      matchedPatterns,
      failedPatterns,
      rawScore: Math.round(rawScore),
      cappedScore,
    };

    if (matchedPatterns.length > 0) {
      matchedCategories.push(categoryKey);
      layer1Score += cappedScore;
      layer1Reasons.push(...matchedPatterns);
    }
  }

  // Execute traditional combo rules just for category mapping 
  const combosBonuses: AnalysisResult["combosBonuses"] = [];
  for (const rule of COMBO_RULES) {
    const allPresent = rule.categories.every((cat) => matchedCategories.includes(cat));
    if (allPresent) {
      combosBonuses.push({ id: rule.id, reason: rule.reason, bonus: rule.bonusScore });
      layer1Score += rule.bonusScore;
    }
  }

  // Cap Layer 1 score at 40 to prevent traditional keywords from dominating the final intent
  layer1Score = Math.min(40, layer1Score);

  // =========================================================================
  // LAYER 2: BEHAVIORAL PATTERN ENGINE (Weight: ~60 max points)
  // =========================================================================
  const behavior = detectBehavioralPatterns(rawText);
  const layer2Score = behavior.score;
  const layer2Reasons = behavior.patterns;

  // Primary System Authority Score
  const baseScore = Math.min(100, layer1Score + layer2Score);

  // =========================================================================
  // LAYER 3: CONTEXTUAL AI VALIDATION
  // =========================================================================
  let finalScore = baseScore;
  let confidence: ConfidenceScore = "Sedang";
  let aiReasoning: string[] | undefined = undefined;
  let aiIndicators: string[] | undefined = undefined;
  let aiScoreResult = 0;

  try {
    const aiResult = await evaluateWithGemini(rawText);
    
    if (aiResult) {
      aiReasoning = aiResult.reasoning;
      aiIndicators = aiResult.indicators;
      aiScoreResult = aiResult.risk_score;

      // Gemini slightly adjusts the score (20% weight), Base logic maintains 80% weight
      finalScore = clamp(Math.round((baseScore * 0.8) + (aiResult.risk_score * 0.2)), 0, 100);

      // Determine confidence based on engine agreement and OCR/text length
      const scoreDiff = Math.abs(baseScore - aiResult.risk_score);
      if (textLength < 30) {
        confidence = "Rendah"; // Too short to be highly confident
      } else if (scoreDiff <= 20) {
        confidence = "Tinggi"; // AI and Base logic strongly agree
      } else if (scoreDiff > 40) {
        confidence = "Rendah"; // Massive disagreement
      } else {
        confidence = "Sedang";
      }
    } else {
      // AI unavailable
      confidence = textLength < 50 ? "Rendah" : "Sedang";
    }
  } catch (e) {
    console.error("Layer 3 Analysis failed, falling back to L1+L2", e);
    confidence = "Rendah";
  }

  // Deduplicate all reasons
  const allReasons = [...new Set([...layer2Reasons, ...layer1Reasons])];

  return {
    score: finalScore,
    label: getLabel(finalScore),
    confidence,
    reasons: allReasons,
    matchedCategories,
    categoryDetails,
    combosBonuses,
    textLength,
    normalizedText: text,
    aiReasoning,
    aiIndicators,
    debug: {
      layer1Score,
      layer2Score,
      baseScore,
      aiScore: aiScoreResult,
      scoreDiff: Math.abs(baseScore - aiScoreResult)
    }
  };
}

// ---------------------------------------------------------------------------
// BATCH ANALYSIS
// ---------------------------------------------------------------------------

export async function analyzeScamBatch(texts: string[]): Promise<Array<AnalysisResult & { index: number }>> {
  const results = await Promise.all(texts.map(text => analyzeScam(text)));
  return results.map((res, index) => ({ ...res, index }));
}

export function mergeAnalysisResults(results: AnalysisResult[]): AnalysisResult {
  if (results.length === 0) return buildEmptyResult("");
  if (results.length === 1) return results[0];

  const maxScore = Math.max(...results.map((r) => r.score));
  const allCategories = [...new Set(results.flatMap((r) => r.matchedCategories))] as ScamCategory[];
  const allReasons = [...new Set(results.flatMap((r) => r.reasons))];
  const allCombos = results.flatMap((r) => r.combosBonuses);

  const dominantResult = results.find((r) => r.score === maxScore)!;

  return {
    score: maxScore,
    label: getLabel(maxScore),
    confidence: dominantResult.confidence,
    reasons: allReasons,
    matchedCategories: allCategories,
    categoryDetails: dominantResult.categoryDetails,
    combosBonuses: allCombos,
    textLength: results.reduce((sum, r) => sum + r.textLength, 0),
    aiReasoning: dominantResult.aiReasoning,
    aiIndicators: dominantResult.aiIndicators,
  };
}

// ---------------------------------------------------------------------------
// INTERNAL
// ---------------------------------------------------------------------------

function buildEmptyResult(rawText: string): AnalysisResult {
  const emptyCategory: CategoryResult = {
    detected: false,
    matchedPatterns: [],
    failedPatterns: [],
    rawScore: 0,
    cappedScore: 0,
  };

  return {
    score: 0,
    label: "RELATIF AMAN",
    confidence: "Sedang",
    reasons: [],
    matchedCategories: [],
    categoryDetails: {
      impersonation: { ...emptyCategory },
      urgency: { ...emptyCategory },
      action: { ...emptyCategory },
      giveaway: { ...emptyCategory },
      otp: { ...emptyCategory },
      financial: { ...emptyCategory },
      malware: { ...emptyCategory },
      identity_claim: { ...emptyCategory },
      unsolicited_contact: { ...emptyCategory },
      verification_request: { ...emptyCategory },
      information_gathering: { ...emptyCategory },
      social_engineering: { ...emptyCategory },
      family_context: { ...emptyCategory },
    },
    combosBonuses: [],
    textLength: rawText.trim().length,
    normalizedText: normalizeText(rawText),
  };
}