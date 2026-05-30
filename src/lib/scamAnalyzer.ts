import { SCAM_KEYWORDS } from "@/data/scamKeywords";

export function analyzeScamText(text: string) {
  const lowerText = text.toLowerCase();

  const matchedKeywords = SCAM_KEYWORDS.filter(keyword =>
    lowerText.includes(keyword.toLowerCase())
  );

  const score = Math.min(matchedKeywords.length * 10, 100);

  let label = "RELATIF AMAN";

  if (score >= 75) {
    label = "KEMUNGKINAN PENIPUAN";
  } else if (score >= 50) {
    label = "RISIKO TINGGI";
  } else if (score >= 25) {
    label = "PERLU DIWASPADAI";
  }

  return {
    score,
    label,
    matchedKeywords,
  };
}