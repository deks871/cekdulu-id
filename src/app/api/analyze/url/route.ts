import { NextRequest, NextResponse } from "next/server";
import { checkDomainAge } from "@/lib/domainAge";
import { analyzeUrl } from "@/lib/urlAnalyzer";
import { analyzeContent } from "@/lib/contentAnalyzer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalysisResult {
  score: number;
  label: string;
  details: string[];
  urlDetails?: string[];
  contentDetails?: string[];
  source?: string;
  riskLevel?: string;
  extractedFeatures?: any;
}

// ─── Known shortlink domains ──────────────────────────────────────────────────

const SHORTLINK_DOMAINS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "short.io",
  "tiny.cc",
  "rb.gy",
  "cutt.ly",
  "shorturl.at",
  "s.id",           // common in Indonesia
  "link.id",
  "lynk.id",
]);

function isShortlink(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    const apex = hostname.replace(/^www\./, "");
    return SHORTLINK_DOMAINS.has(apex);
  } catch {
    return false;
  }
}

// ─── Redirect resolver (bonus) ────────────────────────────────────────────────

async function resolveRedirect(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5_000);

    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    // After following redirects, `res.url` is the final destination
    return res.url && res.url !== url ? res.url : url;
  } catch {
    // Network error or timeout — return original
    return url;
  }
}

// ─── Google Safe Browsing ─────────────────────────────────────────────────────

async function checkGoogleSafeBrowsing(url: string): Promise<boolean | null> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!apiKey) return null; // no key → signal fallback

  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;

  const body = {
    client: { clientId: "cekdulu-id", clientVersion: "1.0.0" },
    threatInfo: {
      threatTypes: [
        "MALWARE",
        "SOCIAL_ENGINEERING",
        "UNWANTED_SOFTWARE",
        "POTENTIALLY_HARMFUL_APPLICATION",
      ],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url }],
    },
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // 8 s timeout via AbortController
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) return null; // API error → fallback

    const data = await res.json();
    // { matches: [...] } if flagged, {} if clean
    return Array.isArray(data.matches) && data.matches.length > 0;
  } catch {
    return null; // network/timeout → fallback
  }
}

// ─── URL Analyzer Engine ──────────────────────────────────────────────────────

function analyzeUrlHeuristic(url: string): AnalysisResult {
  const result = analyzeUrl(url);

  let label = "RELATIF AMAN";
  if (result.riskLevel === "Kritis") label = "KEMUNGKINAN PENIPUAN";
  else if (result.riskLevel === "Tinggi") label = "RISIKO TINGGI";
  else if (result.riskLevel === "Sedang") label = "PERLU DIWASPADAI";

  return { 
    score: result.score, 
    label, 
    details: result.reasons, 
    source: "url_analyzer",
    riskLevel: result.riskLevel,
    extractedFeatures: result.extractedFeatures
  };
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl: string = (body.url ?? "").trim();

    if (!rawUrl) {
      return NextResponse.json(
        { error: "URL tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Normalise: prepend https:// if no protocol supplied
    const urlToCheck =
      rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
        ? rawUrl
        : `https://${rawUrl}`;

    // ── Bonus: resolve shortlinks before checking ──────────────────────────
    let resolvedUrl = urlToCheck;
    let wasShortlink = false;

    if (isShortlink(urlToCheck)) {
      wasShortlink = true;
      resolvedUrl = await resolveRedirect(urlToCheck);
    }

    // ── 1. Try Google Safe Browsing on resolved URL ────────────────────────
    const gsbFlagged = await checkGoogleSafeBrowsing(resolvedUrl);

    if (gsbFlagged === true) {
      // Google confirmed threat → immediate high-risk classification
      const score = Math.floor(Math.random() * 6) + 95; // 95–100
      const details = [
        "⚠️ URL ini terdeteksi berbahaya oleh Google Safe Browsing",
        "Terdaftar sebagai situs phishing, malware, atau penipuan",
      ];
      if (wasShortlink) {
        details.unshift(
          `🔗 Shortlink mengarah ke: ${resolvedUrl}`
        );
      }
      return NextResponse.json({
        score,
        label: "PENIPUAN SANGAT MUNGKIN",
        details,
        source: "google_safe_browsing",
        resolvedUrl: wasShortlink ? resolvedUrl : undefined,
      });
    }

    // ── 2. GSB returned null (no key / API error) → heuristic fallback ─────
    // ── 3. GSB returned false (clean) → still run heuristic for detail ──────
    const heuristic = analyzeUrlHeuristic(resolvedUrl);
    // Domain Age Detection
    try {
      const domainAge = await checkDomainAge(resolvedUrl);

      if (domainAge.riskScore > 0) {
        heuristic.score += domainAge.riskScore;
        heuristic.details.push(domainAge.reason);
      } else {
        heuristic.details.push(`✅ ${domainAge.reason}`);
      }

      heuristic.score = Math.min(100, heuristic.score);
    } catch (error) {
      console.error("Domain age check failed:", error);
    }


    // Fetch and analyze content
    let urlDetails = [...heuristic.details];
    let contentDetails: string[] = [];
    let finalScore = heuristic.score;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const htmlRes = await fetch(resolvedUrl, { 
         headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
         signal: controller.signal 
      });
      clearTimeout(timeout);
      
      if (htmlRes.ok) {
        const html = await htmlRes.text();
        const contentAnalysis = analyzeContent(html);
        contentDetails = contentAnalysis.reasons;
        
        // Weighting: URL 40%, Content 60%
        finalScore = Math.round((heuristic.score * 0.4) + (contentAnalysis.score * 0.6));
      } else {
        contentDetails.push("Konten website tidak dapat dianalisis, hasil berdasarkan analisis URL.");
      }
    } catch (e) {
      contentDetails.push("Konten website tidak dapat dianalisis, hasil berdasarkan analisis URL.");
    }

    let label = "RELATIF AMAN";
    let riskLevel = "Rendah";
    if (finalScore >= 75) { label = "KEMUNGKINAN PENIPUAN"; riskLevel = "Kritis"; }
    else if (finalScore >= 50) { label = "RISIKO TINGGI"; riskLevel = "Tinggi"; }
    else if (finalScore >= 25) { label = "PERLU DIWASPADAI"; riskLevel = "Sedang"; }

    const result: AnalysisResult = { 
      ...heuristic, 
      score: finalScore, 
      label, 
      riskLevel, 
      urlDetails, 
      contentDetails,
      details: urlDetails.concat(contentDetails)
    };

    if (wasShortlink) {
      result.urlDetails!.unshift(`🔗 Shortlink mengarah ke: ${resolvedUrl}`);
      result.details.unshift(`🔗 Shortlink mengarah ke: ${resolvedUrl}`);
    }

    if (gsbFlagged === false) {
      result.urlDetails!.push("✅ Tidak ditemukan ancaman di Google Safe Browsing");
      result.details.push("✅ Tidak ditemukan ancaman di Google Safe Browsing");
      result.source = "heuristic+content+google_safe_browsing";
    }

    return NextResponse.json({
      ...result,
      resolvedUrl: wasShortlink ? resolvedUrl : undefined,
    });
  } catch (err) {
    console.error("[analyze/route] unhandled error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal. Silakan coba lagi." },
      { status: 500 }
    );
  }
}